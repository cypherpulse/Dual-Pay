import React, { useState, useEffect, useCallback } from 'react';
import { ItemCard, MarketItem } from './ItemCard';
import { BuyModal } from './BuyModal';
import { useWallet } from '@/lib/wallet-context';
import { Cl, cvToValue } from '@stacks/transactions';
import { Loader2, Package, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Marketplace() {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { callReadOnly } = useWallet();

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get total number of items
      const nextId = await callReadOnly('get-next-item-id', []);
      const totalItems = Number(nextId) - 1;

      if (totalItems <= 0) {
        setItems([]);
        return;
      }

      // Fetch all items
      const fetchedItems: MarketItem[] = [];
      for (let id = totalItems; id >= 1; id--) {
        try {
          const result = await callReadOnly('get-item', [Cl.uint(id)]);
          if (result && result.value) {
            const item = result.value;
            fetchedItems.push({
              id,
              name: item.name?.value || item.name || '',
              desc: item.desc?.value || item.desc || '',
              price: BigInt(cvToValue(item.price)),
              quantity: BigInt(cvToValue(item.quantity)),
              seller: item.seller?.value || item.seller || '',
              active: item.active?.value ?? item.active ?? true,
            });
          }
        } catch (err) {
          console.error(`Failed to fetch item ${id}:`, err);
        }
      }

      setItems(fetchedItems);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [callReadOnly]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleBuy = (item: MarketItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handlePurchaseSuccess = () => {
    // Refresh items after purchase
    setTimeout(fetchItems, 2000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground">Loading marketplace items...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
          <Package className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold">No Items Listed</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Be the first to list an item on DualPay Market! Head to the "List Item" tab to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold glow-text">Marketplace</h2>
          <p className="text-sm md:text-base text-muted-foreground">
            {items.length} item{items.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchItems}
          className="border-border hover:border-primary self-start sm:self-auto h-9 px-3 md:px-4"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
        {items.map((item, index) => (
          <div
            key={item.id}
            style={{ animationDelay: `${index * 0.1}s` }}
            className="w-full"
          >
            <ItemCard item={item} onBuy={handleBuy} />
          </div>
        ))}
      </div>

      {/* Buy Modal */}
      <BuyModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handlePurchaseSuccess}
      />
    </div>
  );
}
