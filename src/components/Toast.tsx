import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Heart, CheckCircle2, Info, X, Share2, Link2 } from 'lucide-react';
import { ToastNotification } from '../types';

interface ToastProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto bg-neutral-900 text-white rounded-xl p-3.5 shadow-xl border border-neutral-800 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              {toast.image ? (
                <img
                  src={toast.image}
                  alt=""
                  className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center flex-shrink-0 text-amber-400">
                  {toast.type === 'cart' && <ShoppingBag className="w-4 h-4 text-white" />}
                  {toast.type === 'wishlist' && <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />}
                  {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {toast.type === 'info' && <Info className="w-4 h-4 text-sky-400" />}
                  {toast.type === 'share' && <Share2 className="w-4 h-4 text-amber-400" />}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white tracking-tight truncate flex items-center gap-1.5">
                  {toast.type === 'share' && <Link2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  <span>{toast.title}</span>
                </p>
                {toast.message && (
                  <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                    {toast.message}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-neutral-400 hover:text-white p-1 rounded-md transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
