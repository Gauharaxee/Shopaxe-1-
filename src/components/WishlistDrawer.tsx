import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, ShoppingBag, Trash2, Zap } from 'lucide-react';
import { Product, ProductColor, ToastNotification } from '../types';
import { SocialShareButton } from './SocialShareButton';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistProducts: Product[];
  onRemoveFromWishlist: (product: Product) => void;
  onAddToCart: (product: Product, color: ProductColor, size?: string) => void;
  onBuyNow?: (product: Product, color: ProductColor, size?: string) => void;
  onAddToast?: (toast: Omit<ToastNotification, 'id'>) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistProducts,
  onRemoveFromWishlist,
  onAddToCart,
  onBuyNow,
  onAddToast,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black backdrop-blur-xs"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-screen max-w-md bg-stone-50 dark:bg-neutral-950 shadow-2xl flex flex-col border-l border-stone-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100"
            >
              {/* Header */}
              <div className="p-6 bg-white dark:bg-neutral-900 border-b border-stone-200 dark:border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 dark:text-rose-400">
                    <Heart className="w-5 h-5 fill-rose-500 dark:fill-rose-400" />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg font-bold text-neutral-900 dark:text-white">Your Saved Wishlist</h2>
                    <p className="text-xs text-neutral-400 dark:text-neutral-400">
                      {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'} saved
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-full hover:bg-stone-100 dark:hover:bg-neutral-800 transition-colors"
                  aria-label="Close Wishlist"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Saved Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {wishlistProducts.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-400 mb-4">
                      <Heart className="w-8 h-8" />
                    </div>
                    <h3 className="font-serif text-xl font-bold text-neutral-900 dark:text-white mb-1">Your wishlist is empty</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mb-6">
                      Save items you love by tapping the heart icon while browsing products.
                    </p>
                    <button
                      onClick={onClose}
                      className="px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-xs font-semibold rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                    >
                      Browse Essentials
                    </button>
                  </div>
                ) : (
                  wishlistProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="bg-white dark:bg-neutral-900 rounded-2xl border border-stone-200 dark:border-neutral-800 p-3.5 flex gap-3.5 shadow-xs"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-xl bg-stone-100 dark:bg-neutral-800 flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />

                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-serif text-xs font-bold text-neutral-900 dark:text-white truncate">
                              {product.name}
                            </h4>
                            <div className="flex items-center gap-1">
                              <SocialShareButton
                                product={product}
                                variant="icon"
                                onAddToast={onAddToast}
                              />
                              <button
                                onClick={() => onRemoveFromWishlist(product)}
                                className="text-neutral-400 hover:text-rose-600 transition-colors p-1"
                                aria-label="Remove from wishlist"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs font-bold text-neutral-900 dark:text-white mt-0.5">
                            ${product.price}
                          </p>
                        </div>

                        <div className="pt-2 flex items-center gap-2">
                          <button
                            onClick={() => {
                              onAddToCart(
                                product,
                                product.colors[0],
                                product.sizes ? product.sizes[0] : undefined
                              );
                              onRemoveFromWishlist(product);
                            }}
                            className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-[11px] font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-stone-200 dark:border-neutral-700"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Bag</span>
                          </button>

                          <button
                            onClick={() => {
                              if (onBuyNow) {
                                onBuyNow(
                                  product,
                                  product.colors[0],
                                  product.sizes ? product.sizes[0] : undefined
                                );
                              } else {
                                onAddToCart(
                                  product,
                                  product.colors[0],
                                  product.sizes ? product.sizes[0] : undefined
                                );
                              }
                              onRemoveFromWishlist(product);
                              onClose();
                            }}
                            className="flex-1 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 text-[11px] font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>Buy Now</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
