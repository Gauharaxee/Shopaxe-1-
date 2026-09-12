import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Eye, ShoppingBag, Star, Check, Zap } from 'lucide-react';
import { Product, ProductColor, ToastNotification } from '../types';
import { SocialShareButton } from './SocialShareButton';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, color: ProductColor, size?: string) => void;
  onBuyNow?: (product: Product, color: ProductColor, size?: string) => void;
  onAddToast?: (toast: Omit<ToastNotification, 'id'>) => void;
  layoutMode?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
  onBuyNow,
  onAddToast,
  layoutMode = 'grid',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState<ProductColor>(product.colors[0]);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, selectedColor, product.sizes ? product.sizes[0] : undefined);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const handleBuyNowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBuyNow) {
      onBuyNow(product, selectedColor, product.sizes ? product.sizes[0] : undefined);
    } else {
      onAddToCart(product, selectedColor, product.sizes ? product.sizes[0] : undefined);
    }
  };

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  if (layoutMode === 'list') {
    return (
      <div 
        className="group bg-white dark:bg-neutral-900 rounded-2xl border border-stone-200/80 dark:border-neutral-800 p-4 sm:p-5 flex flex-col sm:flex-row gap-5 hover:shadow-lg hover:border-stone-300 dark:hover:border-neutral-700 transition-all duration-300 relative"
      >
        {/* Image Container */}
        <div 
          onClick={() => onQuickView(product)}
          className="relative w-full sm:w-48 h-48 sm:h-44 rounded-xl overflow-hidden bg-stone-100 dark:bg-neutral-800 flex-shrink-0 cursor-pointer"
        >
          <img
            src={isHovered && product.secondaryImage ? product.secondaryImage : product.image}
            alt={product.name}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
            {product.isNew && (
              <span className="bg-neutral-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase shadow-xs">
                New
              </span>
            )}
            {discountPercentage && (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase shadow-xs">
                -{discountPercentage}%
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                {product.category}
              </span>
              <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
                <span className="text-neutral-400 text-[11px]">({product.reviewCount})</span>
              </div>
            </div>

            <h3 
              onClick={() => onQuickView(product)}
              className="font-serif text-lg font-bold text-neutral-900 dark:text-white hover:text-neutral-600 dark:hover:text-neutral-300 cursor-pointer transition-colors"
            >
              {product.name}
            </h3>

            <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-1 mb-3 leading-relaxed">
              {product.description}
            </p>

            {/* Color preview */}
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-[11px] text-neutral-400 mr-1">Colors:</span>
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color)}
                  className={`w-4 h-4 rounded-full border transition-all ${
                    selectedColor.name === color.name 
                      ? 'ring-2 ring-neutral-900 dark:ring-white ring-offset-1 border-transparent' 
                      : 'border-stone-300 dark:border-neutral-700 hover:scale-110'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 dark:border-neutral-800 mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-neutral-900 dark:text-white">
                ${product.price}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-neutral-400 line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <SocialShareButton
                product={product}
                variant="icon"
                onAddToast={onAddToast}
              />

              <button
                onClick={() => onToggleWishlist(product)}
                className={`p-2.5 rounded-xl border transition-colors ${
                  isWishlisted 
                    ? 'bg-rose-50 border-rose-200 text-rose-500 dark:bg-rose-950/40 dark:border-rose-900' 
                    : 'bg-stone-50 dark:bg-neutral-800 border-stone-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-rose-500'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
              </button>

              <button
                onClick={handleQuickAdd}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 shadow-xs border ${
                  addedAnimation
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'bg-stone-100 dark:bg-neutral-800 border-stone-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-stone-200 dark:hover:bg-neutral-700'
                }`}
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNowClick}
                className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-stone-100 text-white rounded-xl text-xs font-bold tracking-wide transition-all shadow-xs flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-white dark:bg-neutral-900 rounded-2xl border border-stone-200/80 dark:border-neutral-800 overflow-hidden flex flex-col justify-between hover:shadow-lg hover:border-stone-300 dark:hover:border-neutral-700 transition-all duration-300 relative"
    >
      {/* Product Image Area */}
      <div className="relative aspect-4/3 sm:aspect-square w-full bg-stone-100 dark:bg-neutral-800 overflow-hidden cursor-pointer" onClick={() => onQuickView(product)}>
        <img
          src={isHovered && product.secondaryImage ? product.secondaryImage : product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isNew && (
            <span className="bg-neutral-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase shadow-xs">
              New
            </span>
          )}
          {product.isBestseller && (
            <span className="bg-amber-400 text-neutral-950 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase shadow-xs">
              Bestseller
            </span>
          )}
          {discountPercentage && (
            <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase shadow-xs">
              -{discountPercentage}%
            </span>
          )}
        </div>

        {/* Top Right Action Buttons (Share & Wishlist) */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <SocialShareButton
            product={product}
            variant="icon"
            onAddToast={onAddToast}
          />

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-all shadow-xs ${
              isWishlisted 
                ? 'bg-rose-500 text-white shadow-md' 
                : 'bg-white/80 dark:bg-neutral-900/80 text-neutral-600 dark:text-neutral-300 hover:text-rose-500'
            }`}
            aria-label="Save to Wishlist"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Hover Quick View Overlay Bar */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="flex-1 py-2 px-3 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md hover:bg-white text-neutral-900 dark:text-white text-xs font-semibold rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-neutral-400 dark:text-neutral-500 font-medium mb-1">
            <span className="uppercase tracking-wider text-[11px]">{product.category}</span>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
            </div>
          </div>

          <h3 
            onClick={() => onQuickView(product)}
            className="font-serif text-base font-bold text-neutral-900 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-300 cursor-pointer transition-colors line-clamp-1"
          >
            {product.name}
          </h3>

          <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-1 mb-3 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div>
          {/* Color Preview Swatches */}
          <div className="flex items-center justify-between mb-3 pt-2 border-t border-stone-100 dark:border-neutral-800">
            <div className="flex items-center gap-1">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedColor(color);
                  }}
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${
                    selectedColor.name === color.name 
                      ? 'ring-2 ring-neutral-900 dark:ring-white ring-offset-1 border-transparent' 
                      : 'border-stone-300 dark:border-neutral-700 hover:scale-110'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>

            <span className="text-[10px] text-neutral-400">
              {product.stockCount < 10 ? `Only ${product.stockCount} left` : 'In Stock'}
            </span>
          </div>

          {/* Pricing, Add to Cart & Buy Now Actions */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-1 shrink-0">
              <span className="text-base font-bold text-neutral-900 dark:text-white">
                ${product.price}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-neutral-400 line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleQuickAdd}
                title="Add to Bag"
                className={`p-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 border ${
                  addedAnimation
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'bg-stone-100 dark:bg-neutral-800 border-stone-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-stone-200 dark:hover:bg-neutral-700'
                }`}
                aria-label="Add to Bag"
              >
                {addedAnimation ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <ShoppingBag className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={handleBuyNowClick}
                className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-stone-100 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1"
                aria-label="Buy Now"
              >
                <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
