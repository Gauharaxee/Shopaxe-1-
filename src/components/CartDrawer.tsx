import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  Truck, 
  CheckCircle2, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, newQty: number) => void;
  onRemoveItem: (id: string) => void;
  onOpenCheckout: (discountCode?: string, discountPercent?: number) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onOpenCheckout,
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent: number } | null>(null);
  const [promoError, setPromoError] = useState('');

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 150;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const discountAmount = appliedDiscount ? (subtotal * appliedDiscount.percent) / 100 : 0;
  const shippingCost = subtotal >= freeShippingThreshold || cartItems.length === 0 ? 0 : 15;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingCost);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    if (promoCode.trim().toUpperCase() === 'AURA20') {
      setAppliedDiscount({ code: 'AURA20', percent: 20 });
      setPromoCode('');
    } else {
      setPromoError('Invalid promo code. Try "AURA20" for 20% off.');
    }
  };

  const handleCheckoutClick = () => {
    onClose();
    onOpenCheckout(appliedDiscount?.code, appliedDiscount?.percent);
  };

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
              {/* Drawer Header */}
              <div className="p-6 bg-white dark:bg-neutral-900 border-b border-stone-200 dark:border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-stone-100 dark:bg-neutral-800 text-neutral-900 dark:text-white">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg font-bold text-neutral-900 dark:text-white">Your Shopping Bag</h2>
                    <p className="text-xs text-neutral-400">
                      {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-full hover:bg-stone-100 dark:hover:bg-neutral-800 transition-colors"
                  aria-label="Close cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free Shipping Progress Indicator */}
              <div className="bg-neutral-900 text-white p-3.5 px-6 text-xs border-b border-neutral-800">
                <div className="flex items-center justify-between font-medium mb-1.5">
                  <span className="flex items-center gap-1.5 text-neutral-300">
                    <Truck className="w-4 h-4 text-amber-400" />
                    {amountNeededForFreeShipping === 0 ? (
                      <span className="text-emerald-400 font-semibold">You unlocked FREE Express Shipping!</span>
                    ) : (
                      <span>Add <strong className="text-white">${amountNeededForFreeShipping.toFixed(0)}</strong> for FREE Shipping</span>
                    )}
                  </span>
                  <span className="font-bold text-[11px] text-neutral-400">{progressToFreeShipping.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-400 h-full transition-all duration-500 rounded-full"
                    style={{ width: `${progressToFreeShipping}%` }}
                  />
                </div>
              </div>

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-stone-200/80 flex items-center justify-center text-neutral-400 mb-4">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h3 className="font-serif text-xl font-bold text-neutral-900 mb-1">Your bag is empty</h3>
                    <p className="text-xs text-neutral-500 max-w-xs mb-6">
                      Explore our minimalist collection of apparel, home goods, and acoustic tech.
                    </p>
                    <button
                      onClick={onClose}
                      className="px-6 py-3 bg-neutral-900 text-white text-xs font-semibold rounded-xl hover:bg-neutral-800 transition-colors"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="bg-white dark:bg-neutral-900 rounded-2xl border border-stone-200 dark:border-neutral-800 p-3.5 flex gap-3.5 shadow-xs"
                    >
                      {/* Product Thumbnail */}
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-xl bg-stone-100 dark:bg-neutral-800 flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />

                      {/* Product Metadata */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-serif text-xs font-bold text-neutral-900 dark:text-white truncate">
                              {item.product.name}
                            </h4>
                            <button
                              onClick={() => onRemoveItem(item.id)}
                              className="text-neutral-400 hover:text-rose-600 transition-colors p-1"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                            <span className="flex items-center gap-1">
                              <span className="w-2.5 h-2.5 rounded-full border border-stone-300 dark:border-neutral-700" style={{ backgroundColor: item.selectedColor.hex }} />
                              {item.selectedColor.name}
                            </span>
                            {item.selectedSize && (
                              <>
                                <span>•</span>
                                <span>{item.selectedSize}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100 dark:border-neutral-800">
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-stone-200 dark:border-neutral-800 rounded-lg bg-stone-50 dark:bg-neutral-800">
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white font-bold text-xs"
                            >
                              -
                            </button>
                            <span className="w-6 text-center text-[11px] font-bold text-neutral-900 dark:text-white">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white font-bold text-xs"
                            >
                              +
                            </button>
                          </div>

                          {/* Line Total */}
                          <span className="text-xs font-bold text-neutral-900 dark:text-white">
                            ${item.product.price * item.quantity}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Drawer Footer (Summary & Checkout) */}
              {cartItems.length > 0 && (
                <div className="p-6 bg-white dark:bg-neutral-900 border-t border-stone-200 dark:border-neutral-800 space-y-4">
                  
                  {/* Promo Code Form */}
                  <form onSubmit={handleApplyPromo} className="space-y-1">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Promo code (e.g. AURA20)"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 text-xs bg-stone-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-stone-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-neutral-900 dark:focus:border-white uppercase"
                        />
                        <Tag className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-stone-100 dark:bg-neutral-800 hover:bg-stone-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white text-xs font-semibold rounded-xl transition-colors"
                      >
                        Apply
                      </button>
                    </div>

                    {appliedDiscount && (
                      <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Code {appliedDiscount.code} applied ({appliedDiscount.percent}% OFF)
                        </span>
                        <button
                          type="button"
                          onClick={() => setAppliedDiscount(null)}
                          className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-[10px] underline"
                        >
                          Remove
                        </button>
                      </div>
                    )}

                    {promoError && (
                      <p className="text-[11px] text-rose-500">{promoError}</p>
                    )}
                  </form>

                  {/* Pricing Breakdown */}
                  <div className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400 pt-2 border-t border-stone-100 dark:border-neutral-800">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-neutral-900 dark:text-white">${subtotal.toFixed(2)}</span>
                    </div>

                    {appliedDiscount && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                        <span>Discount ({appliedDiscount.percent}%)</span>
                        <span>-${discountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Estimated Shipping</span>
                      {shippingCost === 0 ? (
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">FREE</span>
                      ) : (
                        <span className="font-semibold text-neutral-900 dark:text-white">${shippingCost.toFixed(2)}</span>
                      )}
                    </div>

                    <div className="flex justify-between text-sm font-bold text-neutral-900 dark:text-white pt-2 border-t border-stone-200 dark:border-neutral-800">
                      <span>Total</span>
                      <span>${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Checkout CTA */}
                  <button
                    onClick={handleCheckoutClick}
                    className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs rounded-2xl tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2 group"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
                    <span>256-bit SSL Encrypted Guaranteed Secure Checkout</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
