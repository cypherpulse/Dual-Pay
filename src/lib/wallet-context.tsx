import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { connect, disconnect, request, getLocalStorage } from '@stacks/connect';
import { Cl, ClarityValue, cvToValue } from '@stacks/transactions';
import { 
  MARKETPLACE_CONTRACT, 
  WALLET_CONNECT_PROJECT_ID, 
  splitContractAddress
} from './stacks';

interface AddressInfo {
  address: string;
  symbol?: string;
}

interface StorageAddresses {
  stx?: AddressInfo[];
  btc?: AddressInfo[];
}

interface WalletContextType {
  address: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  callContract: (
    functionName: string,
    functionArgs: ClarityValue[],
    onSuccess?: (txId: string) => void,
    onError?: (error: Error) => void
  ) => Promise<void>;
  callReadOnly: (
    functionName: string,
    functionArgs: ClarityValue[]
  ) => Promise<any>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

function extractStxAddress(addresses: unknown): string | null {
  if (!addresses) return null;
  
  // Handle object format { stx: [], btc: [] }
  if (typeof addresses === 'object' && !Array.isArray(addresses)) {
    const addrObj = addresses as StorageAddresses;
    if (addrObj.stx && Array.isArray(addrObj.stx) && addrObj.stx.length > 0) {
      // Find testnet address (starts with ST)
      const testnetAddr = addrObj.stx.find((a) => a.address?.startsWith('ST'));
      return testnetAddr?.address || addrObj.stx[0]?.address || null;
    }
  }
  
  // Handle array format [{ symbol: 'STX', address: '...' }]
  if (Array.isArray(addresses)) {
    const stxAddr = addresses.find((a: any) => 
      (a.symbol === 'STX' || a.type === 'stx') && a.address?.startsWith('ST')
    );
    if (stxAddr) return stxAddr.address;
    
    const anyStx = addresses.find((a: any) => a.symbol === 'STX' || a.type === 'stx');
    return anyStx?.address || null;
  }
  
  return null;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(() => {
    try {
      const storage = getLocalStorage();
      if (storage?.addresses) {
        return extractStxAddress(storage.addresses);
      }
    } catch (e) {
      console.error('Failed to get stored address:', e);
    }
    return null;
  });
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    try {
      const response = await connect({
        walletConnectProjectId: WALLET_CONNECT_PROJECT_ID,
        network: 'testnet',
      });
      
      if (response && response.addresses) {
        const stxAddress = extractStxAddress(response.addresses);
        if (stxAddress) {
          setAddress(stxAddress);
        }
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    disconnect();
    setAddress(null);
  }, []);

  const callContract = useCallback(async (
    functionName: string,
    functionArgs: ClarityValue[],
    onSuccess?: (txId: string) => void,
    onError?: (error: Error) => void
  ) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    const [contractAddress, contractName] = splitContractAddress(MARKETPLACE_CONTRACT);

    try {
      const response = await request(
        { walletConnectProjectId: WALLET_CONNECT_PROJECT_ID },
        'stx_callContract',
        {
          contract: `${contractAddress}.${contractName}`,
          functionName,
          functionArgs,
          network: 'testnet',
          postConditionMode: 'allow',
        }
      );

      if (response && response.txid) {
        onSuccess?.(response.txid);
      }
    } catch (error) {
      console.error('Contract call failed:', error);
      onError?.(error as Error);
    }
  }, [address]);

  const callReadOnly = useCallback(async (
    functionName: string,
    functionArgs: ClarityValue[]
  ) => {
    const [contractAddress, contractName] = splitContractAddress(MARKETPLACE_CONTRACT);
    
    const url = `https://api.testnet.hiro.so/v2/contracts/call-read/${contractAddress}/${contractName}/${functionName}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: address || contractAddress,
        arguments: functionArgs.map((arg) => Cl.serialize(arg)),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.okay && data.result) {
      const clarityValue = Cl.deserialize(data.result);
      return cvToValue(clarityValue);
    }
    
    return null;
  }, [address]);

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnecting,
        isConnected: !!address,
        connectWallet,
        disconnectWallet,
        callContract,
        callReadOnly,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
