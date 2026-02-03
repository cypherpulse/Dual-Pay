import { STACKS_TESTNET } from '@stacks/network';

// Contract addresses on Testnet
export const MARKETPLACE_CONTRACT = 'STGDS0Y17973EN5TCHNHGJJ9B31XWQ5YXBQ0KQ2Y.dual-pay-market';
export const SBTC_TOKEN_CONTRACT = 'STGDS0Y17973EN5TCHNHGJJ9B31XWQ5YXBQ0KQ2Y.sbtc-token';

// WalletConnect Project ID - Set in .env file
export const WALLET_CONNECT_PROJECT_ID = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || 'PLACEHOLDER_PROJECT_ID';

// Network configuration
export const network = STACKS_TESTNET;

// Helper to split contract address
export function splitContractAddress(address: string): [string, string] {
  const [contractAddress, contractName] = address.split('.');
  return [contractAddress, contractName];
}

// Format address for display (shortened)
export function shortenAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Convert micro-units to display units
export function formatMicroUnits(microUnits: number | bigint, decimals: number = 6): string {
  const value = Number(microUnits) / Math.pow(10, decimals);
  return value.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: decimals 
  });
}

// Convert STX to sBTC equivalent (approximate rate for display)
export function stxToSbtc(stxMicroUnits: number | bigint): string {
  // Approximate conversion rate (1 STX ≈ 0.00001 BTC for demo)
  const btcValue = Number(stxMicroUnits) / 1_000_000 * 0.00001;
  return btcValue.toFixed(8);
}
