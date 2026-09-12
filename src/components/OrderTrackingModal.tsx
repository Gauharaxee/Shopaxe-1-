import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Search, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Package, 
  MapPin, 
  Calendar, 
  Copy, 
  Check, 
  FileText, 
  ChevronRight, 
  Sparkles, 
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { AdminOrder } from '../types';
import { OrderTrackingSkeleton } from './Skeleton';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: AdminOrder[];
  initialOrderId?: string;
  onViewReceipt: (order: AdminOrder) => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  orders,
  initialOrderId = '',
  onViewReceipt,
}) => {
  const [searchInput, setSearchInput] = useState(initialOrderId);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);

  // Sync initial query
  useEffect(() => {
    if (initialOrderId) {
      setSearchInput(initialOrderId);
      findOrder(initialOrderId);
    } else if (orders.length > 0 && !selectedOrder) {
      setSelectedOrder(orders[0]);
      setSearchInput(orders[0].id);
    }
  }, [initialOrderId, orders]);

  if (!isOpen) return null;

  const findOrder = (queryStr: string) => {
    if (!queryStr.trim()) return;
    setIsLoading(true);

    setTimeout(() => {
      const q = queryStr.trim().toLowerCase();
      const found = orders.find(
        (ord) =>
          ord.id.toLowerCase() === q ||
          (ord.trackingNumber && ord.trackingNumber.toLowerCase() === q) ||
          ord.customerEmail.toLowerCase().includes(q)
      );

      setSelectedOrder(found || null);
      setIsLoading(false);
    }, 400);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    findOrder(searchInput);
  };

  const handleCopyTracking = (trCode: string) => {
    navigator.clipboard.writeText(trCode);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  // Derive status progression stages
  const getStatusStep = (status: string) => {
    switch (status) {
      case 'Processing':
        return 1;
      case 'Shipped':
        return 2;
      case 'Delivered':
        return 3;
      case 'Cancelled':
        return -1;
      default:
        return 1;
    }
  };

  const activeStep = selectedOrder ? getStatusStep(selectedOrder.status) : 1;

  const stepsList = [
    { label: 'Order Confirmed', desc: 'Authorized & Registered', icon: CheckCircle2 },
    { label: 'Quality & Packing', desc: 'Preparing at Warehouse', icon: Package },
    { label: 'In Transit / Shipped', desc: 'Handed to Express Courier', icon: Truck },
    { label: 'Out for Delivery', desc: 'Arriving at Destination', icon: MapPin },
  ];

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
          className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden text-left border border-stone-200 dark:border-neutral-800 my-8 p-6 sm:p-8 text-neutral-900 dark:text-neutral-100 z-10"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  Package Tracking Center
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                  Real-Time Courier & Order Fulfillment Status
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-full hover:bg-stone-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Form Bar */}
          <div className="pt-5 pb-2">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Enter Order ID (e.g., ORD-1001), Tracking No., or Email..."
                  className="w-full pl-10 pr-4 py-3 bg-stone-100 dark:bg-neutral-800 rounded-2xl border border-stone-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all font-mono"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-3 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-bold text-xs rounded-2xl transition-all shadow-md flex items-center gap-1.5 flex-shrink-0"
              >
                <span>Track Package</span>
              </button>
            </form>

            {/* Quick Order Picker Chips */}
            {orders.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-1 no-scrollbar">
                <span className="text-[11px] text-neutral-400 font-semibold flex-shrink-0">
                  Recent Orders:
                </span>
                {orders.slice(0, 4).map((ord) => (
                  <button
                    key={ord.id}
                    type="button"
                    onClick={() => {
                      setSearchInput(ord.id);
                      setSelectedOrder(ord);
                    }}
                    className={`px-3 py-1 rounded-full text-[11px] font-mono font-semibold transition-all flex-shrink-0 border ${
                      selectedOrder?.id === ord.id
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-transparent shadow-xs'
                        : 'bg-stone-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-stone-200 dark:border-neutral-700 hover:border-neutral-400'
                    }`}
                  >
                    {ord.id} ({ord.status})
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* MAIN TRACKING BODY */}
          <div className="pt-2">
            {isLoading ? (
              <OrderTrackingSkeleton />
            ) : !selectedOrder ? (
              <div className="py-12 text-center space-y-3 bg-stone-50 dark:bg-neutral-800/40 rounded-3xl border border-dashed border-stone-200 dark:border-neutral-700">
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-white">
                  No Order Found
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  We couldn't locate an order matching "{searchInput}". Please double check your order reference ID or email address.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Live Status Hero Header Card */}
                <div className="p-5 bg-stone-900 text-white dark:bg-neutral-800 rounded-3xl shadow-lg relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 z-10">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {selectedOrder.status}
                      </span>
                      <span className="text-xs text-stone-400 font-mono">
                        Ref: {selectedOrder.id}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-bold">
                      {selectedOrder.status === 'Delivered'
                        ? 'Package Successfully Delivered!'
                        : selectedOrder.status === 'Shipped'
                        ? 'Package is In Transit'
                        : selectedOrder.status === 'Cancelled'
                        ? 'Order Was Cancelled'
                        : 'Preparing Package at Facility'}
                    </h3>

                    <p className="text-xs text-stone-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      Estimated Delivery:{' '}
                      <strong className="text-white">August 16 - August 18, 2026</strong>
                    </p>
                  </div>

                  {/* Receipt Trigger Button */}
                  <button
                    onClick={() => onViewReceipt(selectedOrder)}
                    className="z-10 px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-2xl border border-white/20 flex items-center gap-1.5 transition-all self-start sm:self-auto flex-shrink-0"
                  >
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>View Digital Receipt</span>
                  </button>

                  {/* Decorative background glow */}
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl" />
                </div>

                {/* Tracking Code Bar */}
                {selectedOrder.trackingNumber && (
                  <div className="p-4 bg-stone-50 dark:bg-neutral-800/60 rounded-2xl border border-stone-200/80 dark:border-neutral-700/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-700">
                        <Truck className="w-4 h-4 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">
                          Express Carrier Code
                        </p>
                        <p className="font-mono font-bold text-neutral-900 dark:text-white text-sm">
                          {selectedOrder.trackingNumber}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopyTracking(selectedOrder.trackingNumber!)}
                      className="px-3 py-1.5 bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-700 rounded-xl hover:bg-stone-100 text-neutral-700 dark:text-neutral-300 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                    >
                      {copiedTracking ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedTracking ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                )}

                {/* Timeline Stepper */}
                <div className="p-5 bg-stone-50/70 dark:bg-neutral-800/40 rounded-3xl border border-stone-200/60 dark:border-neutral-800 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Fulfillment Progress Stage
                  </h4>

                  <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                    {stepsList.map((st, index) => {
                      const IconComponent = st.icon;
                      const isCompleted = index <= activeStep;
                      const isCurrent = index === activeStep;

                      return (
                        <div key={st.label} className="relative flex flex-col items-center text-center space-y-2">
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-xs ${
                              isCompleted
                                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-bold scale-105'
                                : 'bg-stone-200 dark:bg-neutral-700 text-neutral-400'
                            }`}
                          >
                            <IconComponent className="w-5 h-5" />
                          </div>

                          <div className="space-y-0.5">
                            <p className={`text-xs font-bold ${isCompleted ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}`}>
                              {st.label}
                            </p>
                            <p className="text-[10px] text-neutral-500 leading-tight">
                              {st.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Package Items & Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Delivery Location */}
                  <div className="p-4 bg-stone-50 dark:bg-neutral-800/40 rounded-2xl border border-stone-200/60 dark:border-neutral-800 space-y-1.5">
                    <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      Destination
                    </p>
                    <p className="font-bold text-neutral-900 dark:text-white">
                      {selectedOrder.customerName}
                    </p>
                    <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {selectedOrder.shippingAddress || 'Express Registered Address'}
                    </p>
                  </div>

                  {/* Summary Totals */}
                  <div className="p-4 bg-stone-50 dark:bg-neutral-800/40 rounded-2xl border border-stone-200/60 dark:border-neutral-800 space-y-1.5 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">
                        Order Value
                      </p>
                      <p className="font-mono text-lg font-bold text-neutral-900 dark:text-white">
                        ${selectedOrder.total.toFixed(2)} USD
                      </p>
                    </div>

                    <div className="text-[11px] text-neutral-500 flex items-center justify-between pt-2 border-t border-stone-200 dark:border-neutral-700">
                      <span>Total Package Items</span>
                      <span className="font-bold text-neutral-800 dark:text-neutral-200">
                        {selectedOrder.items.reduce((s, i) => s + i.quantity, 0)} Items
                      </span>
                    </div>
                  </div>
                </div>

                {/* Item List Preview */}
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Package Contents
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedOrder.items.map((item, idx) => (
                      <div
                        key={`${item.id}-${idx}`}
                        className="flex items-center justify-between p-3 bg-stone-50 dark:bg-neutral-800/40 rounded-2xl border border-stone-200/60 dark:border-neutral-800 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          {item.product?.image && (
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-10 h-10 rounded-xl object-cover bg-stone-200 dark:bg-neutral-700"
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <div>
                            <p className="font-semibold text-neutral-900 dark:text-white">
                              {item.product?.name || 'Item'}
                            </p>
                            <p className="text-[10px] text-neutral-500">
                              Qty: {item.quantity} • {item.selectedColor?.name || 'Standard'}
                            </p>
                          </div>
                        </div>

                        <span className="font-mono font-bold text-neutral-900 dark:text-white">
                          ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
