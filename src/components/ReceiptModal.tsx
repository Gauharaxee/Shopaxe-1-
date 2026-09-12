import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Printer, 
  Copy, 
  Check, 
  CheckCircle2, 
  Calendar, 
  CreditCard, 
  ShieldCheck, 
  PackageCheck
} from 'lucide-react';
import { AdminOrder } from '../types';
import { BrandLogo } from './BrandLogo';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: AdminOrder | null;
  onTrackOrder?: (orderId: string) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const [copiedId, setCopiedId] = useState(false);

  if (!isOpen || !order) return null;

  const orderDate = new Date(order.date);
  const formattedDate = isNaN(orderDate.getTime())
    ? order.date
    : orderDate.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

  const handleCopyId = () => {
    navigator.clipboard.writeText(order.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const itemsSubtotal = order.items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );
  const calculatedTax = Math.max(0, order.total - itemsSubtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-sans">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-neutral-950/75 backdrop-blur-sm transition-opacity"
      />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden text-left border border-stone-200 dark:border-neutral-800 my-8 p-6 sm:p-8 text-neutral-900 dark:text-neutral-100 z-10"
        >
          {/* Header Action Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-neutral-800 print:hidden">
            <div className="flex items-center gap-2">
              <BrandLogo size="xs" />
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Verified Tax Invoice
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="p-2 bg-stone-100 dark:bg-neutral-800 hover:bg-stone-200 dark:hover:bg-neutral-700 rounded-xl text-neutral-700 dark:text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Print Receipt"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Print / Save</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-full hover:bg-stone-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* PRINTABLE RECEIPT CONTENT */}
          <div className="space-y-6 pt-4">
            {/* Store Branding Header */}
            <div className="text-center flex flex-col items-center space-y-1">
              <BrandLogo size="lg" className="justify-center" />
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium pt-1">
                Official Digital Purchase Receipt &amp; Sales Audit
              </p>
              <p className="text-[11px] text-neutral-400 font-mono">
                Tax Registration ID: US-AXE-98402834-TX
              </p>
            </div>

            {/* Key Order Info Grid */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-stone-50 dark:bg-neutral-800/60 rounded-2xl border border-stone-200/80 dark:border-neutral-700/60 text-xs">
              <div>
                <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider mb-0.5">
                  Receipt No.
                </p>
                <div className="flex items-center gap-1.5 font-mono font-bold text-neutral-900 dark:text-white">
                  <span className="truncate">{order.id}</span>
                  <button
                    onClick={handleCopyId}
                    className="p-1 hover:bg-stone-200 dark:hover:bg-neutral-700 rounded-md transition-colors print:hidden"
                    title="Copy Receipt Number"
                  >
                    {copiedId ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-neutral-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider mb-0.5">
                  Date &amp; Time
                </p>
                <p className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-amber-500" />
                  {formattedDate}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider mb-0.5">
                  Customer Email
                </p>
                <p className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
                  {order.customerEmail}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider mb-0.5">
                  Payment Gateway
                </p>
                <p className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                  {order.paymentGateway || 'Trust Wallet (USDT)'}
                </p>
                {order.paymentDetails?.authCode && (
                  <p className="text-[10px] font-mono text-blue-500 mt-0.5">
                    Auth: {order.paymentDetails.authCode}
                  </p>
                )}
                {order.paymentDetails?.txHash && (
                  <p className="text-[9px] font-mono text-neutral-400 truncate max-w-[200px]" title={order.paymentDetails.txHash}>
                    Tx: {order.paymentDetails.txHash.slice(0, 16)}...
                  </p>
                )}
              </div>
            </div>

            {/* Shipping Destination */}
            {order.shippingAddress && (
              <div className="p-3.5 bg-stone-50/70 dark:bg-neutral-800/40 rounded-2xl border border-stone-200/60 dark:border-neutral-800 text-xs">
                <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                  <PackageCheck className="w-3.5 h-3.5 text-neutral-500" />
                  Delivery Destination
                </p>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {order.customerName}
                </p>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {order.shippingAddress}
                </p>
              </div>
            )}

            {/* Items Breakdown Table */}
            <div className="space-y-3">
              <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-neutral-400 pb-1 border-b border-stone-200 dark:border-neutral-800">
                <span>Item Description</span>
                <span>Amount</span>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {order.items.map((item, idx) => (
                  <div
                    key={`${item.id}-${idx}`}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.product?.image && (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-10 h-10 rounded-xl object-cover bg-stone-100 border border-stone-200 dark:border-neutral-800 flex-shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div className="truncate">
                        <p className="font-semibold text-neutral-900 dark:text-white truncate">
                          {item.product?.name || 'Store Item'}
                        </p>
                        <p className="text-[10px] text-neutral-500 font-medium">
                          Qty: {item.quantity} • {item.selectedColor?.name || 'Default'}{' '}
                          {item.selectedSize ? `• Size ${item.selectedSize}` : ''}
                        </p>
                      </div>
                    </div>

                    <span className="font-mono font-bold text-neutral-900 dark:text-white flex-shrink-0 ml-2">
                      ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="pt-4 border-t border-stone-200 dark:border-neutral-800 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-500">
                <span>Items Subtotal:</span>
                <span className="font-mono text-neutral-800 dark:text-neutral-200">
                  ${itemsSubtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-neutral-500">
                <span>Estimated Tax &amp; Logistics:</span>
                <span className="font-mono text-neutral-800 dark:text-neutral-200">
                  ${calculatedTax.toFixed(2)}
                </span>
              </div>

              <div className="pt-2 border-t border-dashed border-stone-300 dark:border-neutral-700 flex justify-between items-center text-sm font-bold">
                <span className="text-neutral-900 dark:text-white">Total Paid:</span>
                <span className="font-mono text-base text-amber-600 dark:text-amber-400">
                  ${order.total.toFixed(2)} USD
                </span>
              </div>
            </div>

            {/* Trust Footer */}
            <div className="pt-4 text-center space-y-2 border-t border-stone-200 dark:border-neutral-800">
              <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>Payment Authorized &amp; Verified</span>
              </div>
              <p className="text-[11px] text-neutral-400 max-w-sm mx-auto">
                Thank you for choosing Shopaxe. For order inquiries, contact support at support@shopaxe.com.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
