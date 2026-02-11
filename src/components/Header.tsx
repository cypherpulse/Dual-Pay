import React from 'react';
import { BitcoinIcon, BitcoinSymbol } from './BitcoinIcon';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/lib/wallet-context';
import { shortenAddress } from '@/lib/stacks';
import { Wallet, LogOut, Loader2 } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const { address, isConnecting, isConnected, connectWallet, disconnectWallet } = useWallet();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <BitcoinIcon size={28} className="text-primary bitcoin-icon animate-float sm:w-8 sm:h-8 md:w-10 md:h-10" />
            <div className="absolute inset-0 blur-xl bg-primary/30 rounded-full" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-foreground glow-text">
              DualPay Market
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Pay with STX or sBTC <BitcoinSymbol className="text-primary" /> on Bitcoin L2
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {['marketplace', 'list-item', 'dashboard'].map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-primary/20 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              {tab === 'marketplace' && '🛒 Marketplace'}
              {tab === 'list-item' && '📦 List Item'}
              {tab === 'dashboard' && '📊 Dashboard'}
            </button>
          ))}
        </nav>

        {/* Wallet Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isConnected ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-mono text-foreground">
                  {shortenAddress(address || '')}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={disconnectWallet}
                className="border-border hover:border-destructive hover:text-destructive h-8 px-2 sm:h-9 sm:px-3"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Disconnect</span>
              </Button>
            </div>
          ) : (
            <Button
              onClick={connectWallet}
              disabled={isConnecting}
              className="btn-bitcoin px-3 sm:px-4 py-2 h-8 sm:h-10 rounded-lg animate-glow-pulse text-sm sm:text-base"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Connecting...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Connect Wallet</span>
                  <span className="sm:hidden">Connect</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-border/50 px-4 py-3">
        <nav className="flex items-center justify-center gap-3">
          {['marketplace', 'list-item', 'dashboard'].map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 min-h-[44px] ${
                activeTab === tab
                  ? 'bg-primary/20 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              {tab === 'marketplace' && '🛒'}
              {tab === 'list-item' && '📦'}
              {tab === 'dashboard' && '📊'}
              <span className="ml-1 capitalize">{tab.replace('-', ' ')}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
