import React from 'react';

interface BitcoinIconProps {
  className?: string;
  size?: number;
}

export function BitcoinIcon({ className = '', size = 24 }: BitcoinIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.1" />
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-1.67v-1.93c-1.23-.09-2.4-.53-3.25-1.17l.95-1.62c.72.52 1.62.89 2.62.89.87 0 1.46-.32 1.46-.93 0-.56-.46-.87-1.56-1.18l-.88-.26c-1.83-.52-2.87-1.4-2.87-3.01 0-1.52 1.08-2.62 2.53-2.89V6h1.67v1.91c1.01.1 1.96.45 2.73.97l-.87 1.58c-.58-.39-1.31-.65-2.07-.65-.8 0-1.32.32-1.32.86 0 .5.41.78 1.4 1.06l.88.26c1.98.56 3.06 1.4 3.06 3.1 0 1.59-1.08 2.71-2.81 3z"
        fill="currentColor"
      />
    </svg>
  );
}

export function BitcoinSymbol({ className = '', size = 16 }: BitcoinIconProps) {
  return (
    <span className={`font-bold ${className}`} style={{ fontSize: size }}>
      ₿
    </span>
  );
}
