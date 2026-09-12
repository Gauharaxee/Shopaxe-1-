import React from 'react';

/**
 * Skeleton Loader Component for Product Cards
 */
export const ProductCardSkeleton: React.FC<{ layoutMode?: 'grid' | 'list' }> = ({ layoutMode = 'grid' }) => {
  if (layoutMode === 'list') {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-4 border border-stone-200/80 dark:border-neutral-800 flex flex-col sm:flex-row gap-5 animate-pulse">
        <div className="w-full sm:w-48 h-48 bg-stone-200 dark:bg-neutral-800 rounded-2xl flex-shrink-0" />
        <div className="flex-1 flex flex-col justify-between py-1 space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <div className="h-4 bg-stone-200 dark:bg-neutral-800 rounded-md w-1/4" />
              <div className="h-4 bg-stone-200 dark:bg-neutral-800 rounded-md w-12" />
            </div>
            <div className="h-6 bg-stone-200 dark:bg-neutral-800 rounded-md w-3/4" />
            <div className="h-4 bg-stone-200 dark:bg-neutral-800 rounded-md w-full" />
            <div className="h-4 bg-stone-200 dark:bg-neutral-800 rounded-md w-2/3" />
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="h-7 bg-stone-200 dark:bg-neutral-800 rounded-md w-24" />
            <div className="h-10 bg-stone-200 dark:bg-neutral-800 rounded-full w-32" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-3 sm:p-4 border border-stone-200/80 dark:border-neutral-800/80 shadow-xs flex flex-col justify-between space-y-3 animate-pulse">
      {/* Product Image Placeholder */}
      <div className="relative aspect-4/5 w-full bg-stone-200 dark:bg-neutral-800 rounded-2xl overflow-hidden">
        <div className="absolute top-3 left-3 w-12 h-5 bg-stone-300 dark:bg-neutral-700 rounded-full" />
        <div className="absolute top-3 right-3 w-8 h-8 bg-stone-300 dark:bg-neutral-700 rounded-full" />
      </div>

      {/* Content Placeholder */}
      <div className="space-y-2 pt-1 px-1">
        <div className="flex items-center justify-between">
          <div className="h-3 bg-stone-200 dark:bg-neutral-800 rounded-md w-20" />
          <div className="h-3 bg-stone-200 dark:bg-neutral-800 rounded-md w-10" />
        </div>
        <div className="h-5 bg-stone-200 dark:bg-neutral-800 rounded-md w-4/5" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-6 bg-stone-200 dark:bg-neutral-800 rounded-md w-20" />
          <div className="h-8 bg-stone-200 dark:bg-neutral-800 rounded-full w-24" />
        </div>
      </div>
    </div>
  );
};

/**
 * Grid of product card skeletons
 */
export const ProductGridSkeleton: React.FC<{ count?: number; layoutMode?: 'grid' | 'list' }> = ({ 
  count = 8, 
  layoutMode = 'grid' 
}) => {
  return (
    <div className={
      layoutMode === 'grid' 
        ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6" 
        : "space-y-4"
    }>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={`skeleton-${i}`} layoutMode={layoutMode} />
      ))}
    </div>
  );
};

/**
 * Skeleton Loader for Order Tracking Modal lookup
 */
export const OrderTrackingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse py-2">
      {/* Status Banner Placeholder */}
      <div className="h-28 bg-stone-100 dark:bg-neutral-800 rounded-3xl p-5 flex items-center justify-between">
        <div className="space-y-2 w-2/3">
          <div className="h-4 bg-stone-200 dark:bg-neutral-700 rounded-md w-1/3" />
          <div className="h-6 bg-stone-200 dark:bg-neutral-700 rounded-md w-3/4" />
          <div className="h-3 bg-stone-200 dark:bg-neutral-700 rounded-md w-1/2" />
        </div>
        <div className="w-12 h-12 bg-stone-200 dark:bg-neutral-700 rounded-full" />
      </div>

      {/* Tracking Stepper Timeline */}
      <div className="bg-stone-50 dark:bg-neutral-800/50 rounded-3xl p-6 border border-stone-200 dark:border-neutral-800 space-y-6">
        <div className="h-4 bg-stone-200 dark:bg-neutral-700 rounded-md w-32 mb-4" />
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-neutral-700" />
              <div className="h-3 bg-stone-200 dark:bg-neutral-700 rounded-md w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Package Items Placeholder */}
      <div className="space-y-3">
        <div className="h-4 bg-stone-200 dark:bg-neutral-800 rounded-md w-28" />
        <div className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-neutral-800/40 rounded-2xl">
          <div className="w-12 h-12 bg-stone-200 dark:bg-neutral-700 rounded-xl" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-stone-200 dark:bg-neutral-700 rounded-md w-1/2" />
            <div className="h-3 bg-stone-200 dark:bg-neutral-700 rounded-md w-1/4" />
          </div>
          <div className="h-5 bg-stone-200 dark:bg-neutral-700 rounded-md w-16" />
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton Loader for Receipt Modal
 */
export const ReceiptSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse p-4">
      <div className="flex justify-between items-center pb-4 border-b border-stone-200 dark:border-neutral-800">
        <div className="space-y-2">
          <div className="h-7 bg-stone-200 dark:bg-neutral-800 rounded-md w-32" />
          <div className="h-3 bg-stone-200 dark:bg-neutral-800 rounded-md w-24" />
        </div>
        <div className="h-8 bg-stone-200 dark:bg-neutral-800 rounded-md w-28" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex justify-between items-center py-2">
            <div className="h-4 bg-stone-200 dark:bg-neutral-800 rounded-md w-2/3" />
            <div className="h-4 bg-stone-200 dark:bg-neutral-800 rounded-md w-16" />
          </div>
        ))}
      </div>
      <div className="pt-4 border-t border-stone-200 dark:border-neutral-800 space-y-2">
        <div className="h-4 bg-stone-200 dark:bg-neutral-800 rounded-md w-full" />
        <div className="h-6 bg-stone-200 dark:bg-neutral-800 rounded-md w-1/2 ml-auto" />
      </div>
    </div>
  );
};
