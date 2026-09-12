import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Edit3 } from 'lucide-react';
import { CustomerRecord } from '../../types';

interface EditCustomerModalProps {
  customer: CustomerRecord | null;
  onClose: () => void;
  onUpdateCustomer: (customer: CustomerRecord) => void;
}

export const EditCustomerModal: React.FC<EditCustomerModalProps> = ({
  customer,
  onClose,
  onUpdateCustomer,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'VIP' | 'Regular' | 'New'>('Regular');
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setEmail(customer.email);
      setStatus(customer.status);
      setTotalSpent(customer.totalSpent);
      setTotalOrders(customer.totalOrders);
    }
  }, [customer]);

  if (!customer) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    onUpdateCustomer({
      ...customer,
      name,
      email,
      status,
      totalSpent: Number(totalSpent) || 0,
      totalOrders: Number(totalOrders) || 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-neutral-900 border border-neutral-800 p-6 rounded-3xl shadow-2xl text-left space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white">Edit Customer Profile</h3>
              <p className="text-[10px] text-neutral-400 font-mono">{customer.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-neutral-400 font-semibold mb-1">Customer Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-neutral-400 font-semibold mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-neutral-400 font-semibold mb-1">Customer Tier</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
            >
              <option value="Regular">Regular Customer</option>
              <option value="VIP">VIP Client</option>
              <option value="New">New Lead</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-400 font-semibold mb-1">Total Spent ($)</label>
              <input
                type="number"
                min={0}
                value={totalSpent}
                onChange={(e) => setTotalSpent(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-neutral-400 font-semibold mb-1">Total Orders</label>
              <input
                type="number"
                min={0}
                value={totalOrders}
                onChange={(e) => setTotalOrders(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
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
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
