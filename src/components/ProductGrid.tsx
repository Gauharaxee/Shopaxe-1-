import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  SlidersHorizontal, 
  Grid3X3, 
  List, 
  X, 
  ChevronDown, 
  Search, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { Product, ProductColor, Category, SortOption, FilterOptions, ToastNotification } from '../types';
import { ProductCard } from './ProductCard';
import { CATEGORIES } from '../data/products';
import { getAllCategories } from '../utils/categoryStorage';
import { ProductGridSkeleton } from './Skeleton';

interface ProductGridProps {
  products: Product[];
  wishlistIds: Set<string>;
  onToggleWishlist: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, color: ProductColor, size?: string) => void;
  onBuyNow?: (product: Product, color: ProductColor, size?: string) => void;
  onAddToast?: (toast: Omit<ToastNotification, 'id'>) => void;
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isLoading?: boolean;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  wishlistIds,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
  onBuyNow,
  onAddToast,
  selectedCategory,
  onCategorySelect,
  searchQuery,
  onSearchChange,
  isLoading = false,
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Apply filtering logic
  const filteredProducts = products
    .filter((product) => {
      // Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesDesc = product.description.toLowerCase().includes(query);
        const matchesCat = product.category.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }
      // Price filter
      if (product.price > maxPrice) return false;
      // In stock filter
      if (inStockOnly && !product.inStock) return false;
      // On sale filter
      if (onSaleOnly && !product.originalPrice) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      return 0; // 'featured' keeps original order
    });

  const activeFiltersCount = 
    (selectedCategory !== 'all' ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (onSaleOnly ? 1 : 0) +
    (maxPrice < 500 ? 1 : 0) +
    (searchQuery ? 1 : 0);

  const resetFilters = () => {
    onCategorySelect('all');
    onSearchChange('');
    setInStockOnly(false);
    setOnSaleOnly(false);
    setMaxPrice(500);
    setSortBy('featured');
  };

  return (
    <section id="product-catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Category Pills Header */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
        {getAllCategories(products).map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategorySelect(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-2 border ${
                isActive
                  ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white shadow-md scale-105'
                  : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-stone-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <span>{cat.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-neutral-800 text-neutral-300 dark:bg-neutral-200 dark:text-neutral-800' : 'bg-stone-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'}`}>
                {cat.id === 'all' 
                  ? products.length 
                  : products.filter(p => p.category === cat.id).length
                }
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Controls Toolbar */}
      <div className="mt-4 bg-white dark:bg-neutral-900 rounded-2xl border border-stone-200/80 dark:border-neutral-800 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Filter Drawer Toggle & Active Summary */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
              isFilterPanelOpen || activeFiltersCount > 0
                ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900'
                : 'bg-stone-50 text-neutral-700 border-stone-200 hover:bg-stone-100 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 bg-amber-400 text-neutral-950 text-[10px] font-bold rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <span className="text-xs text-neutral-500 hidden sm:inline-block">
            Showing <strong className="text-neutral-900 dark:text-white">{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Right: Sort & Layout Mode View Toggle */}
        <div className="flex items-center gap-3 ml-auto">
          
          {/* Sort Dropdown */}
          <div className="relative flex items-center gap-1">
            <span className="text-xs text-neutral-400 hidden md:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-stone-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-medium py-2 pl-3 pr-8 rounded-xl border border-stone-200 dark:border-neutral-700 focus:outline-none focus:border-neutral-900 cursor-pointer appearance-none"
            >
              <option value="featured">Featured Picks</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Customer Rating</option>
              <option value="newest">Newest Arrivals</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 pointer-events-none" />
          </div>

          {/* Grid / List Switcher */}
          <div className="hidden sm:flex items-center bg-stone-100 dark:bg-neutral-800 p-1 rounded-xl border border-stone-200 dark:border-neutral-700">
            <button
              onClick={() => setLayoutMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                layoutMode === 'grid' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
              }`}
              aria-label="Grid View"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayoutMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                layoutMode === 'list' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
              }`}
              aria-label="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Filter Panel */}
      <AnimatePresence>
        {isFilterPanelOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-3"
          >
            <div className="bg-stone-50 dark:bg-neutral-900 rounded-2xl border border-stone-200/90 dark:border-neutral-800 p-5 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-xs">
              
              {/* Max Price Slider */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
                  <span>Max Price</span>
                  <span className="text-neutral-900 dark:text-white font-bold">${maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="10"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-neutral-900 dark:accent-white cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                  <span>$50</span>
                  <span>$250</span>
                  <span>$500</span>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-col gap-3 justify-center">
                <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 accent-neutral-900 rounded cursor-pointer"
                  />
                  <span>In Stock Items Only</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onSaleOnly}
                    onChange={(e) => setOnSaleOnly(e.target.checked)}
                    className="w-4 h-4 accent-neutral-900 rounded cursor-pointer"
                  />
                  <span>Discounted / On Sale Only</span>
                </label>
              </div>

              {/* Reset Actions */}
              <div className="flex items-center justify-end md:border-l md:border-stone-200 dark:md:border-neutral-800 md:pl-6">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 bg-white dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 hover:bg-stone-100 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filter Chips */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
          <span className="text-neutral-400 font-medium">Active:</span>
          {selectedCategory !== 'all' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-stone-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-full font-medium">
              Category: {selectedCategory}
              <button onClick={() => onCategorySelect('all')} className="hover:text-neutral-900 dark:hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-stone-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-full font-medium">
              "{searchQuery}"
              <button onClick={() => onSearchChange('')} className="hover:text-neutral-900 dark:hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {inStockOnly && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-stone-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-full font-medium">
              In Stock
              <button onClick={() => setInStockOnly(false)} className="hover:text-neutral-900 dark:hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {onSaleOnly && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-stone-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-full font-medium">
              On Sale
              <button onClick={() => setOnSaleOnly(false)} className="hover:text-neutral-900 dark:hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={resetFilters}
            className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white underline underline-offset-2 ml-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Products Grid or Skeleton */}
      {isLoading ? (
        <div className="mt-6">
          <ProductGridSkeleton count={8} layoutMode={layoutMode} />
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className={`mt-6 ${
          layoutMode === 'list'
            ? 'flex flex-col gap-4'
            : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8'
        }`}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isWishlisted={wishlistIds.has(product.id)}
              onToggleWishlist={onToggleWishlist}
              onQuickView={onQuickView}
              onAddToCart={onAddToCart}
              onBuyNow={onBuyNow}
              onAddToast={onAddToast}
              layoutMode={layoutMode}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="mt-12 bg-white rounded-2xl border border-stone-200 p-12 text-center max-w-md mx-auto shadow-xs">
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-neutral-400 mb-4">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-neutral-900 mb-2">No items match your criteria</h3>
          <p className="text-xs text-neutral-500 mb-6 leading-relaxed">
            Try adjusting your search parameters, resetting filters, or choosing a different product category.
          </p>
          <button
            onClick={resetFilters}
            className="px-5 py-2.5 bg-neutral-900 text-white font-semibold text-xs rounded-xl hover:bg-neutral-800 transition-colors inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Filters</span>
          </button>
        </div>
      )}
    </section>
  );
};
