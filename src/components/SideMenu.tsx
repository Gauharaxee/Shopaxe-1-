import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ChevronRight, 
  Sparkles, 
  ShoppingBag, 
  Heart, 
  Sun, 
  Moon, 
  Globe, 
  Percent, 
  Flame, 
  Truck, 
  Star,
  Sparkle,
  HelpCircle
} from 'lucide-react';
import { CATEGORIES } from '../data/products';
import { Product } from '../types';
import { BrandLogo } from './BrandLogo';

// Official WhatsApp Vector Icon
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.301-.15-1.78-.879-2.056-.98-.276-.1-.477-.15-.678.15-.2.301-.778.98-.954 1.18-.175.2-.351.226-.652.075-.301-.15-1.272-.469-2.423-1.496-.895-.798-1.5-1.784-1.675-2.085-.176-.301-.019-.464.132-.614.136-.135.301-.351.451-.527.15-.175.2-.301.301-.501.101-.2.05-.376-.025-.527-.075-.15-.677-1.634-.928-2.238-.244-.588-.493-.509-.678-.518-.175-.009-.376-.01-.577-.01-.201 0-.527.076-.803.376-.276.301-1.054 1.03-1.054 2.513 0 1.482 1.079 2.912 1.23 3.113.15.201 2.124 3.243 5.146 4.549.719.311 1.28.497 1.718.636.722.23 1.378.197 1.898.12.579-.086 1.78-.727 2.03-1.43.25-.704.25-1.307.175-1.43-.075-.124-.276-.2-.577-.35z" />
    <path d="M12.004 0C5.372 0 0 5.373 0 12c0 2.115.553 4.102 1.518 5.83L0 24l6.34-1.492C8.01 23.42 9.957 24 12.004 24c6.627 0 12-5.373 12-12s-5.373-12-12-12zm0 22.023c-1.84 0-3.559-.51-5.029-1.39l-.36-.217-3.738.88.997-3.642-.239-.38C2.708 15.82 2.164 13.974 2.164 12c0-5.426 4.413-9.839 9.84-9.839 5.426 0 9.839 4.413 9.839 9.839 0 5.426-4.413 9.839-9.839 9.839z" />
  </svg>
);

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  products?: Product[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onSelectQuickFilter?: (filterType: string) => void;
  onOpenTracking?: () => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({
  isOpen,
  onClose,
  products = [],
  selectedCategory,
  onSelectCategory,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  isDarkMode,
  onToggleDarkMode,
  onOpenTracking,
}) => {
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'JPY'>('USD');

  // Dynamically compute active departments & collections from the merchant catalog
  const dynamicCategories = useMemo(() => {
    // 1. Build map of default category images and metadata
    const categoryDefaults: Record<string, { name: string; image: string }> = {
      all: {
        name: 'All Products',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=600',
      },
      Apparel: {
        name: 'Apparel',
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=600',
      },
      Accessories: {
        name: 'Accessories',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600',
      },
      'Home & Living': {
        name: 'Home & Living',
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600',
      },
      'Audio & Tech': {
        name: 'Audio & Tech',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
      },
      Footwear: {
        name: 'Footwear',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600',
      },
    };

    // Extract all distinct categories from current catalog
    const productCategories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));

    // Standard ordering
    const standardOrder = ['all', 'Apparel', 'Accessories', 'Home & Living', 'Audio & Tech', 'Footwear'];
    const allCategoryKeys = Array.from(new Set([...standardOrder, ...productCategories]));

    return allCategoryKeys.map((catKey) => {
      const count = catKey === 'all' 
        ? products.length 
        : products.filter((p) => p.category === catKey).length;
      
      const firstProd = products.find((p) => p.category === catKey);
      const image = firstProd?.image || categoryDefaults[catKey]?.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=600';
      const name = catKey === 'all' ? 'All Products' : (categoryDefaults[catKey]?.name || catKey);

      return {
        id: catKey,
        name,
        count,
        image,
      };
    }).filter((cat) => cat.id === 'all' || cat.count > 0 || CATEGORIES.some((c) => c.id === cat.id));
  }, [products]);

  // Curated highlights live stats
  const bestsellersCount = useMemo(() => products.filter((p) => p.isBestseller).length, [products]);
  const onSaleCount = useMemo(() => products.filter((p) => p.originalPrice && p.originalPrice > p.price).length, [products]);
  const newArrivalsCount = useMemo(() => products.filter((p) => p.isNew).length, [products]);

  const handleCategoryClick = (catId: string) => {
    onSelectCategory(catId);
    onClose();
    const gridEl = document.getElementById('product-catalog');
    if (gridEl) {
      gridEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-neutral-950 backdrop-blur-xs"
          />

          <div className="fixed inset-y-0 left-0 max-w-full flex">
            {/* Side Menu Container */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="w-screen max-w-md bg-stone-50 dark:bg-neutral-950 shadow-2xl flex flex-col border-r border-stone-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100"
            >
              {/* Header */}
              <div className="p-6 bg-white dark:bg-neutral-900 border-b border-stone-200 dark:border-neutral-800 flex items-center justify-between">
                <BrandLogo size="sm" subtitle="Curated Essentials" />

                <button
                  onClick={onClose}
                  className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-full hover:bg-stone-100 dark:hover:bg-neutral-800 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Promo Banner inside Side Menu */}
              <div className="bg-neutral-900 text-neutral-200 px-6 py-3 text-xs flex items-center justify-between border-b border-neutral-800">
                <div className="flex items-center gap-2 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>20% OFF code: <strong className="text-white font-bold">AURA20</strong></span>
                </div>
                <button
                  onClick={onToggleDarkMode}
                  className="p-1 text-neutral-300 hover:text-white rounded-md flex items-center gap-1 text-[11px] bg-neutral-800 hover:bg-neutral-700 px-2 py-0.5 font-semibold transition-colors"
                >
                  {isDarkMode ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3" />}
                  <span>{isDarkMode ? 'Light' : 'Dark'}</span>
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Quick Action Shortcuts */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCart();
                    }}
                    className="p-3 bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl flex items-center justify-between hover:border-neutral-400 dark:hover:border-neutral-700 transition-all text-left shadow-2xs group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-stone-100 dark:bg-neutral-800 rounded-xl text-neutral-900 dark:text-white">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-neutral-900 dark:text-white">Shopping Bag</p>
                        <p className="text-[10px] text-neutral-400">{cartCount} items</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      onOpenWishlist();
                    }}
                    className="p-3 bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl flex items-center justify-between hover:border-neutral-400 dark:hover:border-neutral-700 transition-all text-left shadow-2xs group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-rose-50 dark:bg-rose-950/50 rounded-xl text-rose-500">
                        <Heart className="w-4 h-4 fill-rose-500" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-neutral-900 dark:text-white">Wishlist</p>
                        <p className="text-[10px] text-neutral-400">{wishlistCount} saved</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                {/* Main Product Categories Navigation (Live from Merchant Portal) */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                      Departments &amp; Collections
                    </p>
                    <span className="text-[10px] text-neutral-400 font-mono">{dynamicCategories.length} Collections</span>
                  </div>

                  <div className="space-y-1.5">
                    {dynamicCategories.map((cat) => {
                      const isActive = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => handleCategoryClick(cat.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-2xl text-left text-xs font-semibold transition-all border ${
                            isActive
                              ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 border-neutral-900 dark:border-white shadow-sm'
                              : 'bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border-stone-200/80 dark:border-neutral-800 hover:bg-stone-100 dark:hover:bg-neutral-850'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="w-8 h-8 rounded-lg object-cover bg-stone-100"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <span className="block font-medium">{cat.name}</span>
                              <span className={`text-[10px] ${isActive ? 'text-neutral-300 dark:text-neutral-600' : 'text-neutral-400'}`}>
                                {cat.count} {cat.count === 1 ? 'item' : 'items'} available
                              </span>
                            </div>
                          </div>
                          <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white dark:text-neutral-950' : 'text-neutral-400'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Order Tracking Quick Action */}
                {onOpenTracking && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenTracking();
                    }}
                    className="w-full p-3.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/20 rounded-2xl flex items-center justify-between text-xs font-bold transition-all shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <Truck className="w-4 h-4 text-amber-500" />
                      <span>Track Order & Digital Receipts</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-500" />
                  </button>
                )}

                {/* User Reviews Quick Jump */}
                <button
                  onClick={() => {
                    onClose();
                    setTimeout(() => {
                      const el = document.getElementById('user-reviews-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 250);
                  }}
                  className="w-full p-3.5 bg-white dark:bg-neutral-900 hover:bg-stone-50 dark:hover:bg-neutral-850 text-neutral-800 dark:text-neutral-200 border border-stone-200 dark:border-neutral-800 rounded-2xl flex items-center justify-between text-xs font-semibold transition-all shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>Customer Reviews (4.9★)</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
                    Verified
                  </span>
                </button>

                {/* FAQ Quick Jump */}
                <button
                  onClick={() => {
                    onClose();
                    setTimeout(() => {
                      const el = document.getElementById('faq-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 250);
                  }}
                  className="w-full p-3.5 bg-white dark:bg-neutral-900 hover:bg-stone-50 dark:hover:bg-neutral-850 text-neutral-800 dark:text-neutral-200 border border-stone-200 dark:border-neutral-800 rounded-2xl flex items-center justify-between text-xs font-semibold transition-all shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-amber-500" />
                    <span>Shipping &amp; Returns FAQ</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-bold">
                    Policy
                  </span>
                </button>

                {/* WhatsApp Support Trigger with Official WhatsApp Logo */}
                <button
                  onClick={() => {
                    onClose();
                    setTimeout(() => {
                      const btn = document.getElementById('whatsapp-floating-btn');
                      if (btn) btn.click();
                    }, 250);
                  }}
                  className="w-full p-3.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#075E54] dark:text-[#25D366] border border-[#25D366]/30 rounded-2xl flex items-center justify-between text-xs font-bold transition-all shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xs shrink-0">
                      <WhatsAppIcon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span>WhatsApp Support</span>
                      <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 font-normal">@gauharaxe • 0315-7338694</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#25D366]" />
                </button>

                {/* Quick Curated Collections (Dynamic Live Merchant Stats) */}
                <div className="pt-2 border-t border-stone-200 dark:border-neutral-800 space-y-2">
                  <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-3">
                    Curated Highlights
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleCategoryClick('all')}
                      className="p-3 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-neutral-900 border border-amber-200/80 dark:border-amber-900/50 rounded-2xl text-left hover:border-amber-400 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 text-xs font-bold">
                          <Flame className="w-3.5 h-3.5" />
                          <span>Bestsellers</span>
                        </div>
                        <span className="text-[10px] font-bold bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 px-1.5 py-0.2 rounded-full">
                          {bestsellersCount}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Most requested gear</p>
                    </button>

                    <button
                      onClick={() => handleCategoryClick('all')}
                      className="p-3 bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-950/40 dark:to-neutral-900 border border-rose-200/80 dark:border-rose-900/50 rounded-2xl text-left hover:border-rose-400 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 text-xs font-bold">
                          <Percent className="w-3.5 h-3.5" />
                          <span>On Sale</span>
                        </div>
                        <span className="text-[10px] font-bold bg-rose-200 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 px-1.5 py-0.2 rounded-full">
                          {onSaleCount}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Discounted specials</p>
                    </button>
                  </div>

                  {newArrivalsCount > 0 && (
                    <button
                      onClick={() => handleCategoryClick('all')}
                      className="w-full p-2.5 bg-stone-100 dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-xl flex items-center justify-between text-xs text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkle className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-semibold">New Arrivals Collection</span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400">{newArrivalsCount} new</span>
                    </button>
                  )}
                </div>

                {/* Customer Care & Information Accordion */}
                <div className="pt-2 border-t border-stone-200 dark:border-neutral-800 space-y-3">
                  <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1">
                    Preferences &amp; Customer Care
                  </p>

                  {/* Theme Selector (Dark / Light Mode) */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 text-xs">
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                      {isDarkMode ? (
                        <Moon className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                      )}
                      Theme Mode
                    </span>
                    <button
                      onClick={onToggleDarkMode}
                      id="side-menu-theme-toggle"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all bg-stone-100 hover:bg-stone-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 border-stone-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200"
                    >
                      {isDarkMode ? (
                        <>
                          <Sun className="w-3.5 h-3.5 text-amber-400" />
                          <span>Light Mode</span>
                        </>
                      ) : (
                        <>
                          <Moon className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Dark Mode</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Currency Selector */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 text-xs">
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-neutral-400" />
                      Select Currency
                    </span>
                    <div className="flex gap-1">
                      {(['USD', 'EUR', 'GBP', 'JPY'] as const).map((cur) => (
                        <button
                          key={cur}
                          onClick={() => setCurrency(cur)}
                          className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-colors ${
                            currency === cur
                              ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 border-neutral-900 dark:border-white'
                              : 'bg-stone-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-stone-200 dark:border-neutral-700'
                          }`}
                        >
                          {cur}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Express Shipping Guarantee Badge */}
                  <div className="p-3.5 bg-stone-100 dark:bg-neutral-900 rounded-2xl border border-stone-200 dark:border-neutral-800 space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
                      <Truck className="w-4 h-4 text-emerald-500" />
                      <span>Free Express Shipping</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                      Complimentary worldwide express shipping on all orders over $150. Tracked & insured delivery.
                    </p>
                  </div>
                </div>

              </div>

              {/* Side Menu Footer */}
              <div className="p-6 bg-white dark:bg-neutral-900 border-t border-stone-200 dark:border-neutral-800 text-center space-y-2">
                <div className="flex items-center justify-center gap-4 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                  <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-neutral-900 dark:hover:text-white">Privacy Policy</a>
                  <span>•</span>
                  <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-neutral-900 dark:hover:text-white">Terms of Service</a>
                  <span>•</span>
                  <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-neutral-900 dark:hover:text-white">FAQ</a>
                </div>
                <p className="text-[10px] text-neutral-400">
                  &copy; {new Date().getFullYear()} Shopaxe Inc. All rights reserved.
                </p>
              </div>

            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

