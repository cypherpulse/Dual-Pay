import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MarketItem } from './ItemCard';
import { BitcoinSymbol } from './BitcoinIcon';
import { formatMicroUnits, stxToSbtc } from '@/lib/stacks';
import { useWallet } from '@/lib/wallet-context';
import { Cl } from '@stacks/transactions';
import { Loader2, ShoppingCart, Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BuyModalProps {
  item: MarketItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BuyModal({ item, isOpen, onClose, onSuccess }: BuyModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [payWithSbtc, setPayWithSbtc] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { callContract, isConnected, connectWallet } = useWallet();

  if (!item) return null;

  const maxQuantity = Number(item.quantity);
  const totalPrice = Number(item.price) * quantity;

  const handleBuy = async () => {
    if (!isConnected) {
      connectWallet();
      return;
    }

    setIsLoading(true);
    try {
      await callContract(
        'buy-item',
        [
          Cl.uint(item.id),
          Cl.uint(quantity),
          Cl.bool(payWithSbtc),
        ],
        (txId) => {
          toast({
            title: 'Transaction Submitted! 🎉',
            description: `TX ID: ${txId.slice(0, 16)}...`,
          });
          onSuccess();
          onClose();
        },
        (error) => {
          toast({
            title: 'Transaction Failed',
            description: error.message,
            variant: 'destructive',
          });
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg md:text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            Buy "{item.name}"
          </DialogTitle>
          <DialogDescription className="text-sm md:text-base text-muted-foreground">
            Choose quantity and payment method
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 md:space-y-6 py-4">
          {/* Quantity Input */}
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-sm md:text-base">Quantity (max: {maxQuantity})</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              max={maxQuantity}
              value={quantity}
              onChange={(e) => setQuantity(Math.min(maxQuantity, Math.max(1, parseInt(e.target.value) || 1)))}
              className="bg-secondary border-border h-10 md:h-12 text-base"
            />
          </div>

          {/* Payment Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 rounded-lg bg-secondary/50 border border-border gap-3">
            <div className="space-y-1">
              <Label htmlFor="sbtc-toggle" className="font-medium text-sm md:text-base">
                Pay with sBTC <BitcoinSymbol className="text-primary" />
              </Label>
              <p className="text-xs md:text-sm text-muted-foreground">
                {payWithSbtc ? 'Using sBTC (Bitcoin L2)' : 'Using STX (Stacks)'}
              </p>
            </div>
            <Switch
              id="sbtc-toggle"
              checked={payWithSbtc}
              onCheckedChange={setPayWithSbtc}
              className={`min-h-[24px] ${payWithSbtc ? 'animate-glow-pulse' : ''}`}
            />
          </div>

          {/* Price Summary */}
          <div className="space-y-3 p-4 rounded-lg bg-gradient-card border border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Unit Price</span>
              <span>{formatMicroUnits(item.price)} STX</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Quantity</span>
              <span>× {quantity}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span className={payWithSbtc ? 'text-primary' : ''}>
                {payWithSbtc ? (
                  <>
                    {stxToSbtc(BigInt(totalPrice))} sBTC <BitcoinSymbol />
                  </>
                ) : (
                  <>{formatMicroUnits(BigInt(totalPrice))} STX</>
                )}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="border-border">
            Cancel
          </Button>
          <Button
            onClick={handleBuy}
            disabled={isLoading}
            className="btn-bitcoin"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Confirm Purchase
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
