import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, ShoppingBag, Star, Shield, Truck, RefreshCw, Check, Info, MessageSquare, Zap } from 'lucide-react';
import { Product, ProductColor, ToastNotification } from '../types';
import { CustomerReviews } from './CustomerReviews';
import { SocialShareButton } from './SocialShareButton';

interface ProductQuickViewProps {
  product: Product | null;
  onClose: () => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product, color: ProductColor, size?: string, quantity?: number) => void;
  onBuyNow?: (product: Product, color: ProductColor, size?: string, quantity?: number) => void;
  onUpdateProductRating?: (productId: string, newRating: number, newReviewCount: number) => void;
  onAddToast?: (toast: Omit<ToastNotification, 'id'>) => void;
}

export const ProductQuickView: React.FC<ProductQuickViewProps> = ({
  product,
  onClose,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  onUpdateProductRating,
  onAddToast,
}) => {
  if (!product) return null;

  const [selectedImage, setSelectedImage] = useState<string>(product.image);
  const [selectedColor, setSelectedColor] = useState<ProductColor>(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes ? product.sizes[0] : undefined
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'shipping' | 'reviews'>('details');
  const [added, setAdded] = useState(false);

  const images = [product.image, ...(product.secondaryImage ? [product.secondaryImage] : [])];

  const handleAddToCart = () => {
    onAddToCart(product, selectedColor, selectedSize, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    if (onBuyNow) {
      onBuyNow(product, selectedColor, selectedSize, quantity);
    } else {
      onAddToCart(product, selectedColor, selectedSize, quantity);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="relative w-full max-w-4xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden text-left border border-stone-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 z-10 my-8 max-h-[90vh] overflow-y-auto"
          >
            {/* Top Right Header Controls */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
              <SocialShareButton
                product={product}
                variant="icon"
                onAddToast={onAddToast}
              />
              <button
                onClick={onClose}
                className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-stone-100 dark:bg-neutral-800 hover:bg-stone-200 dark:hover:bg-neutral-700 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2">
              
              {/* Left Column: Image Gallery */}
              <div className="bg-stone-100 dark:bg-neutral-850 p-6 sm:p-8 flex flex-col justify-between">
                {/* Main Large Image */}
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 shadow-xs">
                  <img
                    src={selectedImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {product.isNew && (
                    <span className="absolute top-3 left-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      New Arrival
                    </span>
                  )}
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-1">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(img)}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                          selectedImage === img ? 'border-neutral-900 dark:border-white ring-2 ring-neutral-900/20 dark:ring-white/20' : 'border-stone-200 dark:border-neutral-700 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Details & Actions */}
              <div className="p-6 sm:p-8 flex flex-col justify-between bg-white dark:bg-neutral-900">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                      {product.category}
                    </span>
                    <button
                      onClick={() => setActiveTab('reviews')}
                      className="flex items-center gap-1.5 text-amber-500 text-xs font-semibold hover:underline cursor-pointer transition-colors"
                      title="Jump to Customer Reviews"
                    >
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-neutral-800 dark:text-neutral-200 font-bold">{product.rating}</span>
                      <span className="text-neutral-400">({product.reviewCount} reviews)</span>
                    </button>
                  </div>

                  <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white mb-3">
                    {product.name}
                  </h2>

                  {/* Price */}
                  <div className="flex items-baseline gap-3 mb-6">
                    <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                      ${product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-neutral-400 line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                    {product.originalPrice && (
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full">
                        Save ${product.originalPrice - product.price}
                      </span>
                    )}
                  </div>

                  {/* Color Selector */}
                  <div className="mb-5">
                    <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                      Color: <span className="text-neutral-900 dark:text-white font-bold">{selectedColor.name}</span>
                    </p>
                    <div className="flex items-center gap-2">
                      {product.colors.map((col) => (
                        <button
                          key={col.name}
                          onClick={() => setSelectedColor(col)}
                          className={`w-7 h-7 rounded-full border transition-all ${
                            selectedColor.name === col.name
                              ? 'ring-2 ring-neutral-900 dark:ring-white ring-offset-2 dark:ring-offset-neutral-900 border-transparent scale-110'
                              : 'border-stone-300 dark:border-neutral-600 hover:scale-105'
                          }`}
                          style={{ backgroundColor: col.hex }}
                          title={col.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Size Selector */}
                  {product.sizes && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Select Size</p>
                        <span className="text-[11px] text-neutral-400 cursor-pointer underline">Size Guide</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {product.sizes.map((sz) => (
                          <button
                            key={sz}
                            onClick={() => setSelectedSize(sz)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                              selectedSize === sz
                                ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-950 dark:border-white shadow-xs'
                                : 'bg-stone-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-stone-200 dark:border-neutral-700 hover:bg-stone-100 dark:hover:bg-neutral-700'
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity & Stock */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center border border-stone-200 dark:border-neutral-700 rounded-xl bg-stone-50 dark:bg-neutral-800 p-1">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-stone-200/60 dark:hover:bg-neutral-700 font-bold"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-neutral-900 dark:text-white">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-stone-200/60 dark:hover:bg-neutral-700 font-bold"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>In Stock — Ships within 24 hours</span>
                    </div>
                  </div>
                </div>

                {/* Primary Actions */}
                <div className="space-y-4 pt-4 border-t border-stone-200 dark:border-neutral-800">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <button
                      onClick={handleAddToCart}
                      className={`flex-1 py-3.5 px-5 rounded-2xl text-xs font-bold tracking-wider uppercase transition-all border flex items-center justify-center gap-2 ${
                        added
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                          : 'bg-stone-100 dark:bg-neutral-800 border-stone-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-stone-200 dark:hover:bg-neutral-700'
                      }`}
                    >
                      {added ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Added to Bag</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>Add to Bag</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleBuyNow}
                      className="flex-1 py-3.5 px-5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-stone-100 text-white rounded-2xl text-xs font-bold tracking-wider uppercase shadow-md flex items-center justify-center gap-2 transition-all"
                    >
                      <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>Buy Now (${product.price * quantity})</span>
                    </button>

                    <button
                      onClick={() => onToggleWishlist(product)}
                      className={`p-3.5 rounded-2xl border transition-colors shrink-0 flex items-center justify-center ${
                        isWishlisted
                          ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900 text-rose-500'
                          : 'bg-stone-50 dark:bg-neutral-800 border-stone-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-stone-100 dark:hover:bg-neutral-700'
                      }`}
                      aria-label="Wishlist"
                    >
                      <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
                    </button>

                    <SocialShareButton
                      product={product}
                      variant="pill"
                      onAddToast={onAddToast}
                    />
                  </div>

                  {/* Direct Link & Social Sharing Bar */}
                  <SocialShareButton
                    product={product}
                    variant="expanded"
                    onAddToast={onAddToast}
                  />

                  {/* Tabbed Info */}
                  <div className="bg-stone-50 dark:bg-neutral-850 rounded-2xl p-4 border border-stone-200 dark:border-neutral-800">
                    <div className="flex border-b border-stone-200 dark:border-neutral-800 pb-2 mb-3 gap-4 text-xs font-semibold overflow-x-auto no-scrollbar">
                      <button
                        onClick={() => setActiveTab('details')}
                        className={`pb-1 flex-shrink-0 ${activeTab === 'details' ? 'text-neutral-900 dark:text-white border-b-2 border-neutral-900 dark:border-white font-bold' : 'text-neutral-400 dark:text-neutral-500'}`}
                      >
                        Description
                      </button>
                      <button
                        onClick={() => setActiveTab('specs')}
                        className={`pb-1 flex-shrink-0 ${activeTab === 'specs' ? 'text-neutral-900 dark:text-white border-b-2 border-neutral-900 dark:border-white font-bold' : 'text-neutral-400 dark:text-neutral-500'}`}
                      >
                        Highlights
                      </button>
                      <button
                        onClick={() => setActiveTab('shipping')}
                        className={`pb-1 flex-shrink-0 ${activeTab === 'shipping' ? 'text-neutral-900 dark:text-white border-b-2 border-neutral-900 dark:border-white font-bold' : 'text-neutral-400 dark:text-neutral-500'}`}
                      >
                        Delivery & Warranty
                      </button>
                      <button
                        onClick={() => setActiveTab('reviews')}
                        className={`pb-1 flex-shrink-0 flex items-center gap-1.5 ${activeTab === 'reviews' ? 'text-neutral-900 dark:text-white border-b-2 border-neutral-900 dark:border-white font-bold' : 'text-neutral-400 dark:text-neutral-500'}`}
                      >
                        <span>Customer Reviews</span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono px-2 py-0.5 rounded-full font-bold">
                          {product.reviewCount}
                        </span>
                      </button>
                    </div>

                    <div className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed min-h-[60px]">
                      {activeTab === 'details' && (
                        <p>{product.description}</p>
                      )}
                      {activeTab === 'specs' && (
                        <ul className="list-disc pl-4 space-y-1">
                          {product.details.map((dt, i) => (
                            <li key={i}>{dt}</li>
                          ))}
                        </ul>
                      )}
                      {activeTab === 'shipping' && (
                        <p>
                          Standard 2-4 business day delivery available globally. Free returns within 30 days of purchase in original condition.
                        </p>
                      )}
                      {activeTab === 'reviews' && (
                        <div className="pt-2">
                          <CustomerReviews
                            product={product}
                            onUpdateProductRating={(newRating, newCount) => {
                              if (onUpdateProductRating) {
                                onUpdateProductRating(product.id, newRating, newCount);
                              }
                            }}
                            onAddToast={onAddToast}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
