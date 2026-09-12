import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Sparkles } from 'lucide-react';

interface HeroBannerProps {
  onExploreClick: () => void;
  onSelectCategory: (category: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExploreClick, onSelectCategory }) => {
  return (
    <section className="relative overflow-hidden bg-neutral-900 text-white rounded-2xl sm:rounded-3xl mx-4 sm:mx-6 lg:mx-8 my-4 sm:my-6 border border-neutral-800 shadow-2xl">
      {/* Background Hero Image with Subtle Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1920"
          alt="Aura Collection Hero"
          className="w-full h-full object-cover opacity-35 scale-105 transition-transform duration-1000 ease-out hover:scale-100"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 py-16 sm:py-24 lg:py-28 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-xl space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-neutral-200 tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Autumn / Winter Collection</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-[1.15]">
            Thoughtfully Crafted for Modern Living.
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-light">
            Discover a curated collection of minimal apparel, ergonomic living goods, and acoustic tech designed with timeless precision and sustainable materials.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onExploreClick}
              className="px-6 py-3.5 bg-white text-neutral-900 hover:bg-stone-200 font-semibold text-xs sm:text-sm rounded-full tracking-wide transition-all duration-200 flex items-center gap-2 group shadow-lg hover:shadow-xl"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => onSelectCategory('Audio & Tech')}
              className="px-6 py-3.5 bg-neutral-800/80 hover:bg-neutral-800 text-white font-medium text-xs sm:text-sm rounded-full border border-neutral-700/80 backdrop-blur-md transition-all duration-200"
            >
              View Tech & Audio
            </button>
          </div>
        </motion.div>

        {/* Feature Badges Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 sm:mt-16 pt-8 border-t border-white/10 max-w-3xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-amber-300 flex-shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Global Express Delivery</p>
              <p className="text-[11px] text-neutral-400">Complimentary on orders over $150</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Guaranteed Quality</p>
              <p className="text-[11px] text-neutral-400">2-Year international warranty</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sky-400 flex-shrink-0">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">30-Day Free Returns</p>
              <p className="text-[11px] text-neutral-400">Hassle-free exchange guarantee</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
