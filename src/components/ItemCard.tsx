import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BitcoinSymbol } from './BitcoinIcon';
import { shortenAddress, formatMicroUnits, stxToSbtc } from '@/lib/stacks';
import { ShoppingCart, Package, User } from 'lucide-react';

export interface MarketItem {
  id: number;
  name: string;
  desc: string;
  price: bigint;
  quantity: bigint;
  seller: string;
  active: boolean;
}

interface ItemCardProps {
  item: MarketItem;
  onBuy: (item: MarketItem) => void;
}

export function ItemCard({ item, onBuy }: ItemCardProps) {
  console.log('ItemCard item:', item);
  console.log('item.name:', item.name, 'type:', typeof item.name);
  const isAvailable = Number(item.quantity) > 0; // Ignore active for now, assume true
  console.log('isAvailable:', isAvailable, 'active:', item.active, 'quantity:', Number(item.quantity));

  return (
    <Card className="card-glow overflow-hidden group animate-slide-up w-full max-w-full">
      {/* Gradient top bar */}
      <div className="h-1 bg-gradient-bitcoin" />
      <CardHeader className="pb-1 sm:pb-2 md:pb-3">
        <div className="flex items-start justify-between gap-1 sm:gap-2">
          <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {item.name}
          </h3>
          <Badge 
            variant={isAvailable ? "default" : "secondary"}
            className={`text-[10px] sm:text-xs ${isAvailable ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}`}
          >
            {isAvailable ? 'Available' : 'Sold Out'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3 md:space-y-4">
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] md:min-h-[40px]">
          {item.desc}
        </p>
        {/* Price Display */}
        <div className="space-y-1 sm:space-y-2 p-2 sm:p-3 md:p-4 rounded-lg bg-secondary/50 border border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Price in STX</span>
            <span className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-foreground">
              {formatMicroUnits(item.price)} STX
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
              ≈ sBTC <BitcoinSymbol className="text-primary" size={12} />
            </span>
            <span className="text-xs sm:text-sm md:text-base font-medium text-primary">
              {stxToSbtc(item.price)} sBTC
            </span>
          </div>
        </div>
        {/* Meta info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 text-[10px] sm:text-xs md:text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Package className="w-3 h-3 md:w-4 md:h-4" />
            <span>Qty: {item.quantity.toString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="w-3 h-3 md:w-4 md:h-4" />
            <span className="font-mono text-[10px] sm:text-xs">{shortenAddress(item.seller)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button
          onClick={() => onBuy(item)}
          disabled={!isAvailable}
          className="w-full btn-bitcoin h-8 sm:h-10 md:h-12 text-xs sm:text-sm md:text-base font-semibold"
        >
          <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 mr-2" />
          {isAvailable ? 'Buy Now' : 'Unavailable'}
        </Button>
      </CardFooter>
    </Card>
  );
}
