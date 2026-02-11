import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useWallet } from '@/lib/wallet-context';
import { Cl } from '@stacks/transactions';
import { Loader2, Package, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { BitcoinSymbol } from './BitcoinIcon';

interface ListItemProps {
  onSuccess: () => void;
}

export function ListItem({ onSuccess }: ListItemProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [isLoading, setIsLoading] = useState(false);
  const { callContract, isConnected, connectWallet } = useWallet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      connectWallet();
      return;
    }

    if (!name || !description || !price || !quantity) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const priceMicroUnits = Math.floor(parseFloat(price) * 1_000_000);
      
      await callContract(
        'list-item',
        [
          Cl.stringAscii(name.slice(0, 100)),
          Cl.stringAscii(description.slice(0, 200)),
          Cl.uint(priceMicroUnits),
          Cl.uint(parseInt(quantity)),
        ],
        (txId) => {
          toast({
            title: 'Item Listed Successfully! 🎉',
            description: `Your item is now live on the marketplace. TX: ${txId.slice(0, 16)}...`,
          });
          // Reset form
          setName('');
          setDescription('');
          setPrice('');
          setQuantity('1');
          onSuccess();
        },
        (error) => {
          toast({
            title: 'Listing Failed',
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
    <div className="max-w-2xl mx-auto">
      <Card className="card-glow overflow-hidden">
        <div className="h-1 bg-gradient-bitcoin" />
        
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Package className="w-6 h-6 text-primary" />
            List New Item
          </CardTitle>
          <CardDescription>
            Create a listing and accept payments in STX or sBTC <BitcoinSymbol className="text-primary" />
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Item Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm md:text-base">Item Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Rare Bitcoin Collectible"
                maxLength={100}
                className="bg-secondary border-border h-10 md:h-11 text-base"
              />
              <p className="text-xs text-muted-foreground">{name.length}/100 characters</p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm md:text-base">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your item in detail..."
                maxLength={200}
                rows={3}
                className="bg-secondary border-border resize-none h-20 md:h-auto text-base"
              />
              <p className="text-xs text-muted-foreground">{description.length}/200 characters</p>
            </div>

            {/* Price and Quantity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm md:text-base">Price (STX)</Label>
                <div className="relative">
                  <Input
                    id="price"
                    type="number"
                    step="0.000001"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="bg-secondary border-border pr-12 h-10 md:h-11 text-base"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    STX
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-sm md:text-base">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="1"
                  className="bg-secondary border-border h-10 md:h-11 text-base"
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Dual Payment Enabled
                </p>
                <p className="text-xs text-muted-foreground">
                  Buyers can pay with either STX or sBTC. You'll receive earnings in both currencies based on buyer choice.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full btn-bitcoin h-12 text-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Listing...
                </>
              ) : isConnected ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  List Item for Sale
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Connect Wallet to List
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
