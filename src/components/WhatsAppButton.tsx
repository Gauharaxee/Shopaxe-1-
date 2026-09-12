import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Clock, ArrowRight, ExternalLink } from 'lucide-react';

// Official WhatsApp Vector Icon
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.301-.15-1.78-.879-2.056-.98-.276-.1-.477-.15-.678.15-.2.301-.778.98-.954 1.18-.175.2-.351.226-.652.075-.301-.15-1.272-.469-2.423-1.496-.895-.798-1.5-1.784-1.675-2.085-.176-.301-.019-.464.132-.614.136-.135.301-.351.451-.527.15-.175.2-.301.301-.501.101-.2.05-.376-.025-.527-.075-.15-.677-1.634-.928-2.238-.244-.588-.493-.509-.678-.518-.175-.009-.376-.01-.577-.01-.201 0-.527.076-.803.376-.276.301-1.054 1.03-1.054 2.513 0 1.482 1.079 2.912 1.23 3.113.15.201 2.124 3.243 5.146 4.549.719.311 1.28.497 1.718.636.722.23 1.378.197 1.898.12.579-.086 1.78-.727 2.03-1.43.25-.704.25-1.307.175-1.43-.075-.124-.276-.2-.577-.35z" />
    <path d="M12.004 0C5.372 0 0 5.373 0 12c0 2.115.553 4.102 1.518 5.83L0 24l6.34-1.492C8.01 23.42 9.957 24 12.004 24c6.627 0 12-5.373 12-12s-5.373-12-12-12zm0 22.023c-1.84 0-3.559-.51-5.029-1.39l-.36-.217-3.738.88.997-3.642-.239-.38C2.708 15.82 2.164 13.974 2.164 12c0-5.426 4.413-9.839 9.84-9.839 5.426 0 9.839 4.413 9.839 9.839 0 5.426-4.413 9.839-9.839 9.839z" />
  </svg>
);

interface WhatsAppButtonProps {
  phoneNumber?: string;
  whatsappUsername?: string;
  storeName?: string;
}

const DEFAULT_TEMPLATES = [
  {
    title: '📦 Order Status Inquiry',
    text: 'Hello Shopaxe Support (@gauharaxe), I would like to check the status of my order.',
  },
  {
    title: '💳 Trust Wallet / Crypto Payment Help',
    text: 'Hi Gauhar, I need assistance with paying USDT via Trust Wallet for my checkout.',
  },
  {
    title: '🏷️ Custom / Bulk Order Inquiry',
    text: 'Hi Shopaxe team (@gauharaxe), I am interested in placing a bulk or corporate order.',
  },
  {
    title: '💬 Talk to Live Support Specialist',
    text: 'Hello! I have a question regarding product availability and sizing.',
  },
];

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phoneNumber = '923157338694', // 03157338694 in international format
  whatsappUsername = '@gauharaxe',
  storeName = 'Shopaxe',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState(DEFAULT_TEMPLATES[0].text);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number>(0);

  const handleOpenWhatsApp = (textToSend?: string) => {
    const finalMsg = encodeURIComponent(textToSend || customMessage);
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanNumber}?text=${finalMsg}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 left-6 z-40">
        <motion.button
          id="whatsapp-floating-btn"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-2xl hover:shadow-[#25D366]/40 transition-shadow duration-300 focus:outline-none"
          aria-label="Chat on WhatsApp"
        >
          <WhatsAppIcon className="w-7 h-7" />

          {/* Online Pulse Indicator */}
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            <span className="absolute w-2.5 h-2.5 bg-emerald-500 rounded-full" />
          </span>
        </motion.button>
      </div>

      {/* WhatsApp Quick Inquiries Modal Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="whatsapp-chat-card"
            initial={{ opacity: 0, scale: 0.9, y: 20, x: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20, x: -10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="fixed bottom-22 left-4 sm:left-6 z-50 w-[calc(100vw-2rem)] sm:w-[360px] bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-neutral-800 overflow-hidden"
          >
            {/* Header with WhatsApp Branding */}
            <div className="p-4 bg-[#075E54] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-md shrink-0">
                  <WhatsAppIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm leading-tight flex items-center gap-1.5">
                    {storeName} Support
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  </h3>
                  <p className="text-[11px] text-emerald-100 flex items-center gap-1 mt-0.5">
                    <span>{whatsappUsername}</span> • <Clock className="w-3 h-3 inline ml-1" /> Active 24/7
                  </p>
                </div>
              </div>

              <button
                id="close-whatsapp-card-btn"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-black/10 transition-colors"
                aria-label="Close WhatsApp card"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-4 space-y-3.5 bg-stone-50/50 dark:bg-neutral-900">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                <span className="font-semibold">Official WhatsApp: {whatsappUsername}</span>
                <span className="font-mono text-[10px] bg-emerald-100 dark:bg-emerald-900 px-1.5 py-0.5 rounded">03157338694</span>
              </div>

              <p className="text-xs text-neutral-600 dark:text-neutral-300 font-medium">
                Choose a topic or type your message to connect directly with our official support representative on WhatsApp:
              </p>

              {/* Quick Template Buttons */}
              <div className="space-y-1.5">
                {DEFAULT_TEMPLATES.map((item, idx) => {
                  const isSelected = selectedTemplateIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedTemplateIndex(idx);
                        setCustomMessage(item.text);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition-all border flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#25D366]/10 border-[#25D366] text-neutral-900 dark:text-white font-semibold'
                          : 'bg-white dark:bg-neutral-800 border-stone-200 dark:border-neutral-700/80 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600'
                      }`}
                    >
                      <span className="truncate">{item.title}</span>
                      <ArrowRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#25D366]' : 'text-neutral-400'}`} />
                    </button>
                  );
                })}
              </div>

              {/* Custom Message Area */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-neutral-400">
                  Message Preview:
                </label>
                <textarea
                  id="whatsapp-custom-message-input"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#25D366] resize-none"
                />
              </div>

              {/* Direct Action Button */}
              <button
                id="start-whatsapp-chat-btn"
                onClick={() => handleOpenWhatsApp()}
                className="w-full py-3 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors duration-200"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>Start WhatsApp Chat</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <div className="text-center">
                <span className="text-[10px] text-neutral-400">
                  Direct Line: +{phoneNumber.replace(/(\d{2})(\d{3})(\d{7})/, '$1 $2 $3')}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
