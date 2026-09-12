import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Link2, Check, MessageCircle, Send, Globe, Copy } from 'lucide-react';
import { Product, ToastNotification } from '../types';
import {
  copyProductDirectLink,
  openSocialShare,
  canNativeShare,
  nativeShareProduct,
  getProductShareUrl,
} from '../utils/shareHelper';

interface SocialShareButtonProps {
  product: Product;
  variant?: 'icon' | 'compact' | 'pill' | 'expanded';
  onAddToast?: (toast: Omit<ToastNotification, 'id'>) => void;
  className?: string;
  showDropdown?: boolean;
}

export const SocialShareButton: React.FC<SocialShareButtonProps> = ({
  product,
  variant = 'icon',
  onAddToast,
  className = '',
  showDropdown = true,
}) => {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleCopyLink = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const success = await copyProductDirectLink(product);
    if (success) {
      setCopied(true);
      if (onAddToast) {
        onAddToast({
          title: 'Direct Link Copied!',
          message: `Direct link for "${product.name}" copied to clipboard.`,
          type: 'share',
          image: product.image,
        });
      }
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canNativeShare()) {
      const shared = await nativeShareProduct(product);
      if (shared) {
        setIsOpen(false);
        return;
      }
    }
    handleCopyLink();
  };

  const handlePlatformShare = (
    e: React.MouseEvent,
    platform: 'whatsapp' | 'twitter' | 'facebook' | 'email'
  ) => {
    e.stopPropagation();
    openSocialShare(product, platform);
    setIsOpen(false);
    if (onAddToast) {
      onAddToast({
        title: `Opening ${platform.toUpperCase()}`,
        message: `Sharing "${product.name}" link.`,
        type: 'info',
      });
    }
  };

  // 1. COMPACT / ICON ONLY (Used in Cards)
  if (variant === 'icon') {
    return (
      <div className={`relative inline-block ${className}`} ref={dropdownRef}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (showDropdown) {
              setIsOpen(!isOpen);
            } else {
              handleCopyLink(e);
            }
          }}
          className={`p-2 rounded-full backdrop-blur-md transition-all shadow-xs flex items-center justify-center ${
            copied
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white/90 dark:bg-neutral-900/90 text-neutral-600 dark:text-neutral-300 hover:text-amber-500 hover:bg-white dark:hover:bg-neutral-800'
          }`}
          title={copied ? 'Link Copied!' : 'Share Product Link'}
          aria-label="Share Product"
        >
          {copied ? (
            <Check className="w-4 h-4 text-white" />
          ) : (
            <Share2 className="w-4 h-4" />
          )}
        </button>

        {/* Dropdown menu */}
        <AnimatePresence>
          {isOpen && showDropdown && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 5 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-stone-200 dark:border-neutral-800 p-2 z-30 text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-2 py-1.5 border-b border-stone-100 dark:border-neutral-800 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Share Product
                </span>
              </div>

              {/* Copy Direct Link */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full px-2.5 py-2 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-2 transition-colors cursor-pointer"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <Link2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                )}
                <span>{copied ? 'Link Copied!' : 'Copy Direct Link'}</span>
              </button>

              {/* WhatsApp */}
              <button
                type="button"
                onClick={(e) => handlePlatformShare(e, 'whatsapp')}
                className="w-full px-2.5 py-2 rounded-xl text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-emerald-500/10 hover:text-emerald-600 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>WhatsApp</span>
              </button>

              {/* X / Twitter */}
              <button
                type="button"
                onClick={(e) => handlePlatformShare(e, 'twitter')}
                className="w-full px-2.5 py-2 rounded-xl text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-sky-500/10 hover:text-sky-500 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                <span>X / Twitter</span>
              </button>

              {/* Native Device Share */}
              {canNativeShare() && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="w-full px-2.5 py-2 rounded-xl text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-purple-500/10 hover:text-purple-600 flex items-center gap-2 transition-colors border-t border-stone-100 dark:border-neutral-800 mt-1 cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <span>More Options...</span>
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // 2. PILL BUTTON (Used in Quick View Modal or Product Pages)
  if (variant === 'pill') {
    return (
      <div className={`relative inline-block ${className}`} ref={dropdownRef}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className={`py-3.5 px-4 rounded-2xl text-xs font-bold tracking-wide transition-all border flex items-center justify-center gap-2 cursor-pointer ${
            copied
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : 'bg-stone-50 hover:bg-stone-100 text-neutral-700 border-stone-200 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700 dark:hover:bg-neutral-700'
          }`}
          title="Share Product"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>Link Copied</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 text-amber-500" />
              <span>Share</span>
            </>
          )}
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              className="absolute right-0 bottom-full mb-2 sm:bottom-auto sm:top-full sm:mt-2 w-56 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-neutral-800 p-2.5 z-40 text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-2.5 py-1.5 border-b border-stone-100 dark:border-neutral-800 mb-1.5 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Share this Product
                </span>
                <span className="text-[10px] text-amber-500 font-mono font-bold">${product.price}</span>
              </div>

              {/* Copy Direct Link */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full px-3 py-2.5 rounded-xl text-xs font-bold text-neutral-800 dark:text-white bg-stone-50 dark:bg-neutral-800 hover:bg-amber-500/15 hover:text-amber-600 dark:hover:text-amber-400 flex items-center justify-between transition-colors mb-1.5 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-amber-500" />
                  <span>{copied ? 'Link Copied!' : 'Copy Direct Link'}</span>
                </span>
                <Copy className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              <div className="grid grid-cols-3 gap-1 pt-1">
                <button
                  type="button"
                  onClick={(e) => handlePlatformShare(e, 'whatsapp')}
                  className="p-2 rounded-xl text-[11px] font-medium text-neutral-700 dark:text-neutral-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 flex flex-col items-center gap-1 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-500" />
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handlePlatformShare(e, 'twitter')}
                  className="p-2 rounded-xl text-[11px] font-medium text-neutral-700 dark:text-neutral-300 hover:bg-sky-50 dark:hover:bg-sky-950/40 hover:text-sky-500 flex flex-col items-center gap-1 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4 text-sky-500" />
                  <span>X / Tweet</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handlePlatformShare(e, 'facebook')}
                  className="p-2 rounded-xl text-[11px] font-medium text-neutral-700 dark:text-neutral-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 flex flex-col items-center gap-1 transition-colors cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span>Facebook</span>
                </button>
              </div>

              {canNativeShare() && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="w-full mt-2 pt-2 border-t border-stone-100 dark:border-neutral-800 text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3 h-3" />
                  <span>More Device Share Options</span>
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // 3. EXPANDED STRIP (Inline bar for Modal / Detail Views)
  return (
    <div className={`bg-stone-50 dark:bg-neutral-800/80 rounded-2xl p-3 border border-stone-200 dark:border-neutral-700 flex flex-wrap items-center justify-between gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
          <Share2 className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs font-bold text-neutral-900 dark:text-white">Share this Product</p>
          <p className="text-[10px] text-neutral-400">Copy direct product link or share with friends</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 ml-auto">
        <button
          type="button"
          onClick={handleCopyLink}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
            copied
              ? 'bg-emerald-600 text-white'
              : 'bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Link2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Copy Link</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={(e) => handlePlatformShare(e, 'whatsapp')}
          className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 transition-colors cursor-pointer"
          title="Share via WhatsApp"
          aria-label="Share via WhatsApp"
        >
          <MessageCircle className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={(e) => handlePlatformShare(e, 'twitter')}
          className="p-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-500 border border-sky-500/30 transition-colors cursor-pointer"
          title="Share on X (Twitter)"
          aria-label="Share on X"
        >
          <Send className="w-4 h-4" />
        </button>

        {canNativeShare() && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 border border-purple-500/30 transition-colors cursor-pointer"
            title="More Share Options"
            aria-label="More Share Options"
          >
            <Globe className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
