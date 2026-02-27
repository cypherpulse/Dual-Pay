import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/lib/wallet-context';
import { Cl } from '@stacks/transactions';
import { formatMicroUnits } from '@/lib/stacks';
import { BitcoinSymbol } from './BitcoinIcon';
import { 
  Loader2, 
  Wallet, 
  TrendingUp, 
  ArrowDownToLine,
  RefreshCw,
  Coins,
  Bitcoin
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function Dashboard() {
  const [stxEarnings, setStxEarnings] = useState<bigint>(BigInt(0));
  const [sbtcEarnings, setSbtcEarnings] = useState<bigint>(BigInt(0));
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const { address, callContract, callReadOnly, isConnected, connectWallet } = useWallet();

  const fetchEarnings = useCallback(async () => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      const [stx, sbtc] = await Promise.all([
        callReadOnly('get-seller-stx', [Cl.principal(address)]),
        callReadOnly('get-seller-sbtc', [Cl.principal(address)]),
      ]);

      setStxEarnings(BigInt(stx || 0));
      setSbtcEarnings(BigInt(sbtc || 0));
    } catch (error) {
      console.error('Failed to fetch earnings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [address, callReadOnly]);

  useEffect(() => {
    if (address) {
      fetchEarnings();
    }
  }, [address, fetchEarnings]);

  const handleWithdraw = async () => {
    if (!isConnected) {
      connectWallet();
      return;
    }

    setIsWithdrawing(true);
    try {
      await callContract(
        'withdraw-earnings',
        [],
        (txId) => {
          toast({
            title: 'Withdrawal Successful! 💰',
            description: `Your earnings have been withdrawn. TX: ${txId.slice(0, 16)}...`,
          });
          // Refresh earnings after withdrawal
          setTimeout(fetchEarnings, 3000);
        },
        (error) => {
          toast({
            title: 'Withdrawal Failed',
            description: error.message,
            variant: 'destructive',
          });
        }
      );
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center">
          <Wallet className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-bold">Connect Your Wallet</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Connect your wallet to view your seller dashboard and manage earnings
        </p>
        <Button onClick={connectWallet} className="btn-bitcoin animate-glow-pulse">
          <Wallet className="w-4 h-4 mr-2" />
          Connect Wallet
        </Button>
      </div>
    );
  }

  const hasEarnings = stxEarnings > 0 || sbtcEarnings > 0;

  return (
    <div className="max-w-full xl:max-w-4xl mx-auto space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold glow-text">Seller Dashboard</h2>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground">Track and withdraw your earnings</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchEarnings}
          disabled={isLoading}
          className="border-border hover:border-primary self-start sm:self-auto h-8 sm:h-9 px-2 sm:px-3 md:px-4"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Earnings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
        {/* STX Earnings */}
        <Card className="card-glow overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Coins className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
              STX Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="space-y-2">
                <p className="text-xl md:text-2xl lg:text-3xl font-bold">
                  {formatMicroUnits(stxEarnings)} <span className="text-base md:text-lg text-muted-foreground">STX</span>
                </p>
                <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  From Stacks token payments
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* sBTC Earnings */}
        <Card className="card-glow overflow-hidden">
          <div className="h-1 bg-gradient-bitcoin" />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Bitcoin className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              sBTC Earnings <BitcoinSymbol className="text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="space-y-2">
                <p className="text-xl md:text-2xl lg:text-3xl font-bold text-primary">
                  {formatMicroUnits(sbtcEarnings, 8)} <span className="text-base md:text-lg text-muted-foreground">sBTC</span>
                </p>
                <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  From Bitcoin L2 payments
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Withdraw Section */}
      <Card className="card-glow overflow-hidden">
        <div className="h-1 bg-gradient-bitcoin" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowDownToLine className="w-5 h-5 text-primary" />
            Withdraw All Earnings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Withdraw all your accumulated earnings in both STX and sBTC to your connected wallet.
          </p>

          {!hasEarnings && !isLoading && (
            <div className="p-4 rounded-lg bg-secondary/50 border border-border text-center">
              <p className="text-muted-foreground">
                No earnings to withdraw yet. Start selling items to earn!
              </p>
            </div>
          )}

          <Button
            onClick={handleWithdraw}
            disabled={!hasEarnings || isWithdrawing || isLoading}
            className="w-full btn-bitcoin h-12"
          >
            {isWithdrawing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing Withdrawal...
              </>
            ) : (
              <>
                <ArrowDownToLine className="w-5 h-5 mr-2" />
                Withdraw STX + sBTC
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
