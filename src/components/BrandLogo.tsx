import React from 'react';
import logoAsset from '../assets/images/shopaxe_cart_logo_1788056116659.jpg';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  title = 'ShopAXE',
  subtitle,
  className = '',
}) => {
  const sizeMap = {
    xs: { icon: 'w-6 h-6', text: 'text-sm font-bold', sub: 'text-[7px]', gap: 'gap-1.5' },
    sm: { icon: 'w-8 h-8', text: 'text-base font-bold', sub: 'text-[8px]', gap: 'gap-2' },
    md: { icon: 'w-9 h-9 sm:w-10 sm:h-10', text: 'text-lg sm:text-xl font-bold', sub: 'text-[9px]', gap: 'gap-2.5' },
    lg: { icon: 'w-12 h-12 sm:w-14 sm:h-14', text: 'text-2xl sm:text-3xl font-bold', sub: 'text-xs', gap: 'gap-3' },
    xl: { icon: 'w-16 h-16 sm:w-20 sm:h-20', text: 'text-3xl sm:text-4xl font-bold', sub: 'text-sm', gap: 'gap-4' },
  };

  const currentSize = sizeMap[size];

  const renderTitle = (name: string) => {
    if (name.toLowerCase() === 'shopaxe' || name.toLowerCase() === 'shop axe') {
      return (
        <span className="tracking-tight">
          <span className="font-light text-neutral-600 dark:text-neutral-300">Shop</span>
          <span className="font-extrabold text-neutral-950 dark:text-white uppercase tracking-wider ml-0.5">AXE</span>
        </span>
      );
    }
    return <span className="font-bold text-neutral-950 dark:text-white">{name}</span>;
  };

  return (
    <div className={`inline-flex items-center ${currentSize.gap} group select-none ${className}`}>
      {/* Brand Emblem Logo */}
      <div
        className={`relative ${currentSize.icon} rounded-xl sm:rounded-2xl overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-300 flex-shrink-0 bg-neutral-950 ring-1 ring-amber-400/30 dark:ring-amber-300/20`}
      >
        <img
          src={logoAsset}
          alt="ShopAXE Logo"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center"
        />
        {/* Subtle glossy highlight sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-white/10 pointer-events-none" />
      </div>

      {/* Brand Name on Right Side */}
      {showText && title && (
        <div className="flex flex-col justify-center leading-none">
          <div
            className={`font-serif ${currentSize.text} text-neutral-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors`}
          >
            {renderTitle(title)}
          </div>
          {subtitle && (
            <span
              className={`font-sans font-semibold tracking-widest uppercase text-neutral-400 dark:text-neutral-400 mt-0.5 ${currentSize.sub}`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};


