import React, { useState, useMemo } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  Clock, 
  CreditCard, 
  Search, 
  MessageCircle, 
  CheckCircle2, 
  Package, 
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface FAQItem {
  id: string;
  category: 'shipping' | 'returns' | 'tracking' | 'payments' | 'general';
  question: string;
  answer: string;
  highlights?: string[];
  actionLabel?: string;
  actionType?: 'track' | 'whatsapp' | 'support';
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'ship-1',
    category: 'shipping',
    question: 'How long does shipping take and what are the delivery options?',
    answer: 'We offer standard and express premium courier shipping worldwide. Orders are typically processed and dispatched within 24 to 48 business hours from our temperature-controlled fulfilment hubs.',
    highlights: [
      'Standard Domestic Delivery: 2–4 business days (Complimentary on orders above $100)',
      'Express Priority Courier: 1–2 business days with insured tracking',
      'International Worldwide: 4–8 business days via DHL Express / FedEx Priority',
    ],
    actionLabel: 'Track Your Package',
    actionType: 'track'
  },
  {
    id: 'ship-2',
    category: 'shipping',
    question: 'How much does shipping cost?',
    answer: 'Standard shipping is 100% complimentary on all orders exceeding $100. For orders under $100, flat-rate standard domestic shipping is $8.50, and Express Overnight dispatch is available at checkout for $16.00.',
    highlights: [
      'Orders > $100: FREE Standard Insured Shipping',
      'Flat Domestic Rate: $8.50',
      'Express Courier Dispatch: $16.00'
    ]
  },
  {
    id: 'ship-3',
    category: 'shipping',
    question: 'Do you ship internationally and are customs duties included?',
    answer: 'Yes, we ship to over 85 countries globally. For most primary destinations (North America, UK, European Union, UAE, Australia), all applicable import customs and VAT duties are calculated Delivered Duty Paid (DDP) so there are no unexpected fees at your doorstep.',
    highlights: [
      'DDP Shipping: Zero surprise customs fees at arrival',
      'Full transit insurance coverage included on every package'
    ]
  },
  {
    id: 'ret-1',
    category: 'returns',
    question: 'What is your 30-Day Return & Exchange Policy?',
    answer: 'We want you to be completely satisfied with your purchase. We offer a 30-day risk-free return and exchange window from the date your package is delivered. Items must be in their original, unwashed, and unworn condition with all designer tags and packaging intact.',
    highlights: [
      '30-Day generous return and exchange window',
      'Pre-paid return shipping labels generated automatically',
      'Full refund issued back to original payment method or instant store credit with 10% bonus'
    ],
    actionLabel: 'Speak to Support on WhatsApp',
    actionType: 'whatsapp'
  },
  {
    id: 'ret-2',
    category: 'returns',
    question: 'How do I initiate a return or exchange?',
    answer: 'Initiating a return is quick and seamless. You can contact our dedicated 24/7 concierge on WhatsApp (@gauharaxe / +92 315 7338694) or reach out with your Order ID. Our customer care team will issue your pre-paid courier return label and instructions within minutes.',
    highlights: [
      'Fast 1-click support via WhatsApp Concierge',
      'Drop-off available at any local courier station or schedule a home pickup'
    ],
    actionLabel: 'Contact Concierge',
    actionType: 'whatsapp'
  },
  {
    id: 'ret-3',
    category: 'returns',
    question: 'What if my item arrives damaged, defective, or incorrect?',
    answer: 'In the rare event that an item arrives with any defect or damage during transit, notify us within 48 hours of delivery. We will immediately dispatch a priority brand-new replacement at zero additional cost or issue an instant 100% refund—no return hassle required.',
    highlights: [
      'Instant replacement guarantee without shipping fees',
      'Priority express replacement dispatch within 24 hours'
    ]
  },
  {
    id: 'track-1',
    category: 'tracking',
    question: 'How can I track my order in real-time?',
    answer: 'As soon as your order is confirmed and packaged, an automated tracking link and SMS/WhatsApp alert will be sent. You can also use our built-in Order Tracking modal at the top of the site anytime by entering your Order ID.',
    highlights: [
      'Real-time GPS courier milestones (Processing, Packed, Out for Delivery, Delivered)',
      'Digital tax invoice and downloadable receipt available anytime'
    ],
    actionLabel: 'Launch Order Tracker',
    actionType: 'track'
  },
  {
    id: 'pay-1',
    category: 'payments',
    question: 'What payment methods do you accept and is it secure?',
    answer: 'We utilize bank-grade 256-bit SSL encryption. We accept Visa, Mastercard, American Express, Apple Pay, Google Pay, and Shop Pay. In selected regional zones, Cash on Delivery (COD) is also available.',
    highlights: [
      'PCI-DSS Level 1 certified secure checkout gateway',
      'Zero storage of sensitive card numbers or CVV codes',
      'Instant digital tax invoice provided upon order confirmation'
    ]
  }
];

const CATEGORIES = [
  { id: 'all', label: 'All Questions', icon: HelpCircle },
  { id: 'shipping', label: 'Shipping & Delivery', icon: Truck },
  { id: 'returns', label: 'Returns & Refunds', icon: RotateCcw },
  { id: 'tracking', label: 'Live Tracking', icon: Clock },
  { id: 'payments', label: 'Payments & Security', icon: ShieldCheck },
] as const;

interface FAQSectionProps {
  onOpenTracking?: () => void;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ onOpenTracking }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['ship-1', 'ret-1']));

  const filteredFAQs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const matchesSearch = 
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query) ||
        (item.highlights && item.highlights.some(h => h.toLowerCase().includes(query)));

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const toggleItem = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(filteredFAQs.map(f => f.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const handleActionClick = (type?: string) => {
    if (type === 'track') {
      if (onOpenTracking) {
        onOpenTracking();
      } else {
        const btn = document.getElementById('order-tracking-nav-btn');
        if (btn) btn.click();
      }
    } else if (type === 'whatsapp' || type === 'support') {
      const whatsappBtn = document.getElementById('whatsapp-floating-btn');
      if (whatsappBtn) {
        whatsappBtn.click();
      } else {
        window.open('https://wa.me/923157338694', '_blank');
      }
    }
  };

  return (
    <section id="faq-section" className="py-16 md:py-24 bg-stone-50 dark:bg-neutral-950 border-t border-stone-200 dark:border-neutral-800 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-neutral-900 dark:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Support &amp; Policies</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
            Everything you need to know about our express courier dispatch, worldwide delivery, 30-day risk-free returns, and concierge support.
          </p>
        </div>

        {/* Search & Quick Controls */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search questions on shipping, returns, delivery time..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white focus:border-transparent shadow-sm transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-semibold hover:underline px-2 py-1"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                      : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-stone-100 dark:hover:bg-neutral-800 border border-stone-200 dark:border-neutral-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400 dark:text-amber-500' : 'text-neutral-500 dark:text-neutral-400'}`} />
                  <span className="text-inherit">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Accordion Controls Bar */}
        <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 font-medium mb-4 px-2">
          <span>Showing {filteredFAQs.length} {filteredFAQs.length === 1 ? 'question' : 'questions'}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={expandAll}
              className="text-neutral-900 dark:text-white hover:underline font-bold transition-colors cursor-pointer"
            >
              Expand All
            </button>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <button
              onClick={collapseAll}
              className="text-neutral-900 dark:text-white hover:underline font-bold transition-colors cursor-pointer"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-3xl bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 shadow-sm">
              <HelpCircle className="w-10 h-10 text-neutral-400 dark:text-neutral-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-neutral-900 dark:text-white">No matching questions found</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto font-normal">
                Need immediate help with your order? Our 24/7 concierge is available on WhatsApp.
              </p>
              <button
                onClick={() => handleActionClick('whatsapp')}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-colors cursor-pointer shadow"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat with Support</span>
              </button>
            </div>
          ) : (
            filteredFAQs.map((faq) => {
              const isExpanded = expandedIds.has(faq.id);
              return (
                <div
                  key={faq.id}
                  id={`faq-item-${faq.id}`}
                  className={`rounded-2xl transition-all duration-200 border ${
                    isExpanded 
                      ? 'bg-white dark:bg-neutral-900 border-neutral-400 dark:border-neutral-700 shadow-md' 
                      : 'bg-white dark:bg-neutral-900 border-stone-200 dark:border-neutral-800 hover:border-stone-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <button
                    onClick={() => toggleItem(faq.id)}
                    aria-expanded={isExpanded}
                    className="w-full px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between text-left gap-4 focus:outline-none cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg transition-colors ${
                        isExpanded 
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300' 
                          : 'bg-stone-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                      }`}>
                        {faq.category === 'shipping' && <Truck className="w-4 h-4" />}
                        {faq.category === 'returns' && <RotateCcw className="w-4 h-4" />}
                        {faq.category === 'tracking' && <Clock className="w-4 h-4" />}
                        {faq.category === 'payments' && <ShieldCheck className="w-4 h-4" />}
                        {faq.category === 'general' && <HelpCircle className="w-4 h-4" />}
                      </div>

                      <span className="font-serif text-base sm:text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                        {faq.question}
                      </span>
                    </div>

                    <div className={`p-1.5 rounded-full border border-stone-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 transition-transform duration-200 flex-shrink-0 ${
                      isExpanded ? 'rotate-180 bg-stone-100 dark:bg-neutral-800 text-neutral-900 dark:text-white' : ''
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-1 border-t border-stone-200 dark:border-neutral-800 space-y-4 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-normal">
                          <p className="font-normal">{faq.answer}</p>

                          {/* Key Highlights Bullet points */}
                          {faq.highlights && faq.highlights.length > 0 && (
                            <div className="bg-stone-100/80 dark:bg-neutral-850/80 p-3.5 sm:p-4 rounded-xl border border-stone-200 dark:border-neutral-800 space-y-2">
                              {faq.highlights.map((highlight, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs font-medium text-neutral-800 dark:text-neutral-200">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                                  <span>{highlight}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Action Button Link */}
                          {faq.actionLabel && (
                            <div className="pt-1">
                              <button
                                onClick={() => handleActionClick(faq.actionType)}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-white hover:underline cursor-pointer group"
                              >
                                <span>{faq.actionLabel}</span>
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Help Banner */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-serif text-lg font-bold tracking-tight text-neutral-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
              <span>Have a specific inquiry about your order?</span>
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 font-normal max-w-md">
              Our 24/7 dedicated support team responds in less than 5 minutes on WhatsApp or via our real-time ticket manager.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => handleActionClick('whatsapp')}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp @gauharaxe</span>
            </button>

            <button
              onClick={() => handleActionClick('track')}
              className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <Truck className="w-4 h-4" />
              <span>Track Active Order</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
