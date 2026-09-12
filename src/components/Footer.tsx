import React, { useState } from 'react';
import { ArrowRight, Check, Instagram, Twitter, ShieldCheck, Heart } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface FooterProps {
  onSelectCategory: (category: string) => void;
  onOpenTracking?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory, onOpenTracking }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-neutral-900 text-stone-300 pt-16 pb-12 border-t border-neutral-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Newsletter & Brand Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-12 border-b border-neutral-800">
          
          {/* Brand Info */}
          <div className="lg:col-span-5 space-y-4">
            <BrandLogo size="lg" subtitle="Luxury Living" />
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm font-light">
              Designing refined, timeless essentials for thoughtful everyday living. Crafted with premium organic textiles, precision engineering, and zero waste standards.
            </p>

            <div className="pt-2 flex items-center gap-4 text-neutral-400">
              <a href="#" className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 hover:text-white transition-colors" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 hover:text-white transition-colors" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Newsletter Subscription */}
          <div className="lg:col-span-7 bg-neutral-850/60 p-6 sm:p-8 rounded-3xl border border-neutral-800 flex flex-col justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-white mb-1">
                Join Shopaxe Insider Circle
              </h3>
              <p className="text-xs text-neutral-400 mb-4 font-light">
                Receive early access to seasonal capsule drops, exclusive subscriber discounts, and stories from our design studio.
              </p>
            </div>

            {subscribed ? (
              <div className="p-3.5 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-2xl text-xs font-medium flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>You're subscribed! Enjoy 15% off your next purchase with code <strong>AURA20</strong>.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-white text-neutral-900 font-semibold text-xs rounded-xl hover:bg-stone-200 transition-colors flex items-center justify-center gap-2"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Links Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-neutral-800 text-xs">
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-4 text-[11px]">Shop Collection</h4>
            <ul className="space-y-2.5 text-neutral-400">
              <li>
                <button onClick={() => onSelectCategory('all')} className="hover:text-white transition-colors">All Products</button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Apparel')} className="hover:text-white transition-colors">Minimalist Apparel</button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Audio & Tech')} className="hover:text-white transition-colors">Acoustics & Tech</button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Home & Living')} className="hover:text-white transition-colors">Home & Living</button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Accessories')} className="hover:text-white transition-colors">Leather Accessories</button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-4 text-[11px]">Customer Care</h4>
            <ul className="space-y-2.5 text-neutral-400">
              <li>
                <button
                  onClick={() => {
                    const el = document.getElementById('faq-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-amber-400 dark:hover:text-amber-300 transition-colors text-left flex items-center gap-1.5"
                >
                  <span>Shipping &amp; Returns FAQ</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-neutral-800 rounded text-amber-400 font-medium">Policy</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenTracking && onOpenTracking()} 
                  className="hover:text-white transition-colors text-left"
                >
                  Order Tracking
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    const el = document.getElementById('user-reviews-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors text-left"
                >
                  Verified User Reviews
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    const btn = document.getElementById('whatsapp-floating-btn');
                    if (btn) btn.click();
                  }}
                  className="hover:text-emerald-400 transition-colors text-left flex items-center gap-1.5 text-emerald-300"
                >
                  <span>WhatsApp Support (@gauharaxe)</span>
                  <span className="text-[9px] px-1 py-0.2 bg-emerald-400/20 rounded font-bold">24/7</span>
                </button>
              </li>
              <li>
                <a
                  href="https://wa.me/923157338694"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors text-neutral-400 font-mono text-[11px] block"
                >
                  Tel: +92 315 7338694
                </a>
              </li>
              <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Shipping &amp; Crypto Payments</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-4 text-[11px]">Our Studio</h4>
            <ul className="space-y-2.5 text-neutral-400">
              <li><a href="#" className="hover:text-white transition-colors">About Shopaxe</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sustainability Manifesto</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Material Transparency</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Design Journal</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-4 text-[11px]">Legal & Security</h4>
            <ul className="space-y-2.5 text-neutral-400">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Accessibility Statement</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookie Preferences</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Copyright & Payment Badges */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>&copy; {new Date().getFullYear()} Shopaxe Inc. Crafted with precision for minimalist enthusiasts.</p>

          <div className="flex items-center gap-3 font-semibold text-[10px] text-neutral-400">
            <span className="px-2 py-1 rounded bg-neutral-800">VISA</span>
            <span className="px-2 py-1 rounded bg-neutral-800">MASTERCARD</span>
            <span className="px-2 py-1 rounded bg-neutral-800">AMEX</span>
            <span className="px-2 py-1 rounded bg-neutral-800">APPLE PAY</span>
            <span className="px-2 py-1 rounded bg-neutral-800">SHOP PAY</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
