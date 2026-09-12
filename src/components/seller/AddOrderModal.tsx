import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, ShoppingBag, Plus, CreditCard } from 'lucide-react';
import { Product, AdminOrder, OrderStatus } from '../../types';

interface AddOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onCreateOrder: (order: AdminOrder) => void;
}

export const AddOrderModal: React.FC<AddOrderModalProps> = ({
  isOpen,
  onClose,
  products,
  onCreateOrder,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [paymentGateway, setPaymentGateway] = useState('Trust Wallet (USDT)');
  const [shippingAddress, setShippingAddress] = useState('');
  const [status, setStatus] = useState<OrderStatus>('Processing');

  if (!isOpen) return null;

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const itemPrice = selectedProduct ? selectedProduct.price : 100;
  const calculatedTotal = itemPrice * quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail || !selectedProduct) return;

    const newOrder: AdminOrder = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      customerName,
      customerEmail,
      items: [
        {
          id: `item-${Date.now()}`,
          product: selectedProduct,
          quantity,
          selectedColor: selectedProduct.colors?.[0] || { name: 'Standard', hex: '#000000' },
          selectedSize: 'M',
        },
      ],
      subtotal: calculatedTotal,
      total: calculatedTotal,
      status,
      paymentGateway,
      shippingAddress: shippingAddress || 'Standard Delivery Address',
      trackingNumber: status === 'Shipped' || status === 'Delivered' 
        ? `TRK-${Math.floor(10000000 + Math.random() * 90000000)}PK` 
        : undefined,
      paymentDetails: {
        method: paymentGateway.toLowerCase().includes('trust') ? 'Trust Wallet' : 'Card',
        authCode: `AUTH-${Math.floor(100000 + Math.random() * 900000)}`,
        txHash: paymentGateway.toLowerCase().includes('trust') ? `0x${Math.random().toString(16).slice(2, 26)}` : undefined,
      },
    };

    onCreateOrder(newOrder);
    onClose();
    // Reset form
    setCustomerName('');
    setCustomerEmail('');
    setShippingAddress('');
    setQuantity(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-neutral-900 border border-neutral-800 p-6 rounded-3xl shadow-2xl text-left space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white">Create New Order</h3>
              <p className="text-[10px] text-neutral-400">Manual order generation for seller record</p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-400 font-semibold mb-1">Customer Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. John Doe"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-neutral-400 font-semibold mb-1">Customer Email</label>
              <input
                type="email"
                required
                placeholder="customer@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-neutral-400 font-semibold mb-1">Select Item</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - ${p.price} ({p.sku})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-neutral-400 font-semibold mb-1">Quantity</label>
              <input
                type="number"
                min={1}
                max={99}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-400 font-semibold mb-1">Payment Method</label>
              <select
                value={paymentGateway}
                onChange={(e) => setPaymentGateway(e.target.value)}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Trust Wallet (USDT)">Trust Wallet (USDT / Crypto)</option>
                <option value="JazzCash / EasyPaisa">JazzCash / EasyPaisa</option>
                <option value="Stripe / Credit Card">Stripe / Credit Card</option>
                <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                <option value="Direct Bank Transfer">Direct Bank Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-neutral-400 font-semibold mb-1">Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-neutral-400 font-semibold mb-1">Shipping Address</label>
            <textarea
              rows={2}
              placeholder="e.g. House #42, Street 8, Sector F-7, Islamabad, Pakistan"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Calculated Total Summary Box */}
          <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 flex items-center justify-between">
            <span className="text-neutral-400 font-semibold">Calculated Total:</span>
            <span className="font-mono text-base font-bold text-amber-400">${calculatedTotal.toFixed(2)} USD</span>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl shadow-lg"
            >
              Create &amp; Log Order
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
