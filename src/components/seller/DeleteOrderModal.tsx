import React from 'react';
import { motion } from 'motion/react';
import { Trash2 } from 'lucide-react';
import { AdminOrder } from '../../types';

interface DeleteOrderModalProps {
  order: AdminOrder | null;
  onClose: () => void;
  onConfirmDelete: (orderId: string) => void;
}

export const DeleteOrderModal: React.FC<DeleteOrderModalProps> = ({
  order,
  onClose,
  onConfirmDelete,
}) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-neutral-900 border border-neutral-800 p-6 rounded-3xl shadow-2xl text-center space-y-4"
      >
        <div className="w-12 h-12 bg-rose-950 text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-800">
          <Trash2 className="w-6 h-6" />
        </div>

        <div>
          <h3 className="font-serif text-lg font-bold text-white">Delete Order Record?</h3>
          <p className="text-xs text-neutral-400 mt-1">
            Are you sure you want to permanently delete order <strong className="text-amber-400 font-mono">{order.id}</strong> for <strong className="text-white">{order.customerName}</strong> (${order.total.toFixed(2)})?
          </p>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirmDelete(order.id)}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg"
          >
            Delete Permanently
          </button>
        </div>
      </motion.div>
    </div>
  );
};
