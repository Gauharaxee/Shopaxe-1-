import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  Menu, 
  X, 
  Sparkles, 
  ArrowRight,
  SlidersHorizontal,
  ChevronRight,
  Sun,
  Moon,
  ShieldCheck,
  Truck
} from 'lucide-react';
import { CATEGORIES } from '../data/products';
import { BrandLogo } from './BrandLogo';
import { StoreSettings } from '../types';

interface HeaderProps {
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSideMenu: () => void;
  onOpenTracking?: () => void;
  storeSettings?: StoreSettings;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategorySelect,
  isDarkMode,
  onToggleDarkMode,
  onOpenSideMenu,
  onOpenTracking,
  storeSettings,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleNavClick = (catId: string) => {
    onCategorySelect(catId);
    setIsMobileMenuOpen(false);
    // Smooth scroll to product grid
    const gridEl = document.getElementById('product-catalog');
    if (gridEl) {
      gridEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isAnnouncementVisible = storeSettings?.announcementEnabled ?? true;
  const announcementText = storeSettings?.announcementBarText || 'Complimentary Express Worldwide Shipping on Orders Over $150';
  const promoCode = storeSettings?.announcementCodeText;
  const promoSubtext = storeSettings?.announcementSubtext;
  const badgeText = storeSettings?.announcementBadgeText;

  const handleCopyPromo = (code: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-stone-200/80 dark:border-neutral-800 transition-colors duration-300">
      {/* Top Announcement Bar (Upside of Store Name Header) */}
      {isAnnouncementVisible && (
        <div className="bg-neutral-900 dark:bg-neutral-950 text-white text-[11px] sm:text-xs py-2 px-4 text-center font-medium tracking-wide flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 transition-all duration-300 shadow-2xs">
          {badgeText && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shrink-0">
              {badgeText}
            </span>
          )}
          <span className="truncate max-w-[90vw] sm:max-w-none">{announcementText}</span>
          {(promoCode || promoSubtext) && (
            <>
              <span className="text-neutral-500 hidden sm:inline">&bull;</span>
              <span className="inline-flex items-center gap-1.5">
                {promoSubtext && <span>{promoSubtext}</span>}
                {promoCode && (
                  <button
                    onClick={() => handleCopyPromo(promoCode)}
                    title="Click to copy coupon code"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/80 text-amber-300 hover:text-amber-200 font-mono font-bold text-[10px] sm:text-xs transition-colors cursor-pointer"
                  >
                    <span>{promoCode}</span>
                    <span className="text-[9px] text-neutral-400 font-sans font-normal opacity-80">
                      {copiedCode ? '✓ Copied' : 'Copy'}
                    </span>
                  </button>
                )}
              </span>
            </>
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Side Menu Button & Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSideMenu}
              className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white focus:outline-none rounded-xl hover:bg-stone-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2"
              aria-label="Open Side Menu"
              title="Open Navigation Side Menu"
            >
              <Menu className="w-5 h-5" />
              <span className="hidden sm:inline-block text-xs font-semibold uppercase tracking-wider">Menu</span>
            </button>

            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); onCategorySelect('all'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="group focus:outline-none"
            >
              <BrandLogo size="md" />
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            <button
              onClick={() => handleNavClick('all')}
              className={`text-xs font-semibold tracking-wider uppercase transition-colors py-1 relative ${
                selectedCategory === 'all' 
                  ? 'text-neutral-900 dark:text-white' 
                  : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              Shop All
              {selectedCategory === 'all' && (
                <motion.div layoutId="navIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 dark:bg-white rounded-full" />
              )}
            </button>
            
            {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleNavClick(cat.id)}
                className={`text-xs font-semibold tracking-wider uppercase transition-colors py-1 relative ${
                  selectedCategory === cat.id 
                    ? 'text-neutral-900 dark:text-white' 
                    : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                {cat.name}
                {selectedCategory === cat.id && (
                  <motion.div layoutId="navIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 dark:bg-white rounded-full" />
                )}
              </button>
            ))}

            <button
              onClick={() => {
                const el = document.getElementById('user-reviews-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors py-1 flex items-center gap-1.5"
            >
              <span>Reviews</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-mono font-bold">4.9★</span>
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('faq-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors py-1"
            >
              FAQ
            </button>
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Desktop Search Box */}
            <div className="hidden sm:relative sm:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-44 lg:w-56 pl-9 pr-4 py-1.5 text-xs bg-stone-100 dark:bg-neutral-800 hover:bg-stone-200/70 dark:hover:bg-neutral-700 focus:bg-white dark:focus:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 rounded-full border border-stone-200 dark:border-neutral-700 focus:border-neutral-900 dark:focus:border-neutral-400 focus:outline-none transition-all"
                />
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="sm:hidden p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded-full hover:bg-stone-100 dark:hover:bg-neutral-800"
              aria-label="Toggle Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Track Order Button */}
            {onOpenTracking && (
              <button
                onClick={onOpenTracking}
                className="p-1.5 sm:px-3 sm:py-1.5 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-stone-100 dark:bg-neutral-800 hover:bg-stone-200/70 rounded-xl text-xs font-semibold border border-stone-200 dark:border-neutral-700 transition-all flex items-center gap-1.5"
                title="Track Package Status"
              >
                <Truck className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
                <span className="hidden sm:inline">Track</span>
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded-full hover:bg-stone-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Wishlist Icon */}
            <button
              onClick={onOpenWishlist}
              className="relative p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded-full hover:bg-stone-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Open Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Icon */}
            <button
              onClick={onOpenCart}
              className="relative p-2 text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-full hover:bg-neutral-800 dark:hover:bg-stone-100 transition-all flex items-center gap-1.5 group shadow-sm"
              aria-label="Open Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 w-4 h-4 bg-amber-500 text-neutral-900 text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden md:inline font-semibold text-xs pr-1">Bag</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Expandable Drawer */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="sm:hidden overflow-hidden pb-4 pt-1"
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products by name, SKU, or category..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  autoFocus
                  className="w-full pl-9 pr-8 py-2 text-sm bg-stone-100 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 rounded-xl border border-stone-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white shadow-xs"
                />
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[80%] max-w-xs bg-white dark:bg-neutral-900 z-50 shadow-2xl flex flex-col p-6 lg:hidden"
            >
              <div className="flex items-center justify-between pb-6 border-b border-stone-200 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-neutral-900 dark:bg-white flex items-center justify-center text-white dark:text-neutral-900 font-serif font-bold text-sm">
                    S
                  </div>
                  <span className="font-serif text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                    Shopaxe
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 space-y-1">
                <button
                  onClick={() => handleNavClick('all')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-sm font-semibold transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                      : 'text-neutral-600 dark:text-neutral-300 hover:bg-stone-50 dark:hover:bg-neutral-800/50'
                  }`}
                >
                  <span>All Products</span>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </button>

                {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleNavClick(cat.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-sm font-semibold transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                        : 'text-neutral-600 dark:text-neutral-300 hover:bg-stone-50 dark:hover:bg-neutral-800/50'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <ChevronRight className="w-4 h-4 text-neutral-400" />
                  </button>
                ))}
              </div>

              <div className="pt-6 border-t border-stone-200 dark:border-neutral-800 space-y-3">
                {onOpenTracking && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenTracking();
                    }}
                    className="w-full py-2.5 px-3 bg-stone-100 dark:bg-neutral-800 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center justify-center gap-2"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Track Package Status</span>
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
