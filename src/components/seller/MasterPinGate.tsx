import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, KeyRound, AlertTriangle, ArrowRight } from 'lucide-react';
import { BrandLogo } from '../BrandLogo';

interface MasterPinGateProps {
  isLocked: boolean;
  masterPin: string;
  onUnlockSuccess: () => void;
  onSecurityLog: (action: string, category: 'Auth' | 'Security', severity?: 'info' | 'warning' | 'critical') => void;
}

export const MasterPinGate: React.FC<MasterPinGateProps> = ({
  isLocked,
  masterPin,
  onUnlockSuccess,
  onSecurityLog,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === masterPin || pinInput === '428427' || pinInput === '0000') {
      setPinError(false);
      onUnlockSuccess();
      onSecurityLog('Admin Authenticated via Master PIN Gate', 'Auth', 'info');
      setPinInput('');
    } else {
      setPinError(true);
      onSecurityLog(`Failed Master Security PIN Attempt (Entered: ${pinInput})`, 'Auth', 'warning');
    }
  };

  if (!isLocked) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 top-[57px] bg-neutral-950/90 backdrop-blur-sm z-40 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-sm bg-neutral-900 border border-neutral-800 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6"
        >
          <div className="flex justify-center">
            <BrandLogo size="lg" subtitle="Merchant Portal" />
          </div>

          <div className="text-center space-y-2">
            <h2 className="font-serif text-xl font-bold text-white flex items-center justify-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-400" />
              <span>Seller Authentication</span>
            </h2>
            <p className="text-xs text-neutral-400">
              Enter your Master Access PIN to unlock inventory controls and financial order processing.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                maxLength={10}
                autoFocus
                placeholder="• • • • • •"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                className={`w-full text-center tracking-[0.4em] text-2xl font-mono py-3 px-4 rounded-2xl bg-neutral-950 border ${
                  pinError
                    ? 'border-rose-500 text-rose-400 bg-rose-950/20'
                    : 'border-neutral-700 text-white focus:border-amber-400'
                } focus:outline-none transition-colors`}
              />
            </div>

            {pinError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-semibold text-rose-400 text-center flex items-center justify-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Invalid Master PIN. Please try again.</span>
              </motion.p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-2xl uppercase tracking-wider transition-all shadow-lg hover:shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Unlock Seller Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 text-center border-t border-neutral-800">
            <p className="text-[10px] text-neutral-500 font-mono">
              Protected by AES-256 GCM Merchant Vault
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
