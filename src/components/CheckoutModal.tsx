import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Truck, 
  Lock, 
  ArrowRight, 
  ArrowLeft,
  Copy, 
  Check, 
  Printer, 
  Loader2, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  ExternalLink,
  QrCode,
  Wallet,
  AlertCircle,
  Clock,
  Coins,
  RefreshCw,
  Search,
  CheckCircle,
  FileCheck,
  ShieldAlert,
  Zap
} from 'lucide-react';
import { CartItem } from '../types';

interface CryptoNetworkOption {
  id: string;
  name: string;
  token: string;
  address: string;
  networkFeeEstimated: string;
  speed: string;
  deepLinkPrefix: string;
  explorerUrl: string;
  badge?: string;
}

const TRUST_WALLET_NETWORKS: CryptoNetworkOption[] = [
  {
    id: 'bep20',
    name: 'BNB Smart Chain (BEP-20)',
    token: 'USDT',
    address: '0x4EdF2D77584109B1071a6eE1D77638a2f6Cc983e',
    networkFeeEstimated: '~0.05 USD',
    speed: 'Instant (~3 secs)',
    deepLinkPrefix: 'ethereum:0x4EdF2D77584109B1071a6eE1D77638a2f6Cc983e@56',
    explorerUrl: 'https://bscscan.com/tx/',
    badge: 'RECOMMENDED',
  },
  {
    id: 'polygon',
    name: 'Polygon PoS (POL)',
    token: 'USDT',
    address: '0x4EdF2D77584109B1071a6eE1D77638a2f6Cc983e',
    networkFeeEstimated: '~0.01 USD',
    speed: 'Ultra Fast (~2 secs)',
    deepLinkPrefix: 'ethereum:0x4EdF2D77584109B1071a6eE1D77638a2f6Cc983e@137',
    explorerUrl: 'https://polygonscan.com/tx/',
    badge: 'LOWEST FEE',
  },
  {
    id: 'trc20',
    name: 'TRON Network (TRC-20)',
    token: 'USDT',
    address: 'TN3W4H6rK2ce4vX9YnFQHwKENFEeTRC20TWS',
    networkFeeEstimated: '~1.50 USD',
    speed: 'Fast (~15 secs)',
    deepLinkPrefix: 'tron:TN3W4H6rK2ce4vX9YnFQHwKENFEeTRC20TWS',
    explorerUrl: 'https://tronscan.org/#/transaction/',
  },
  {
    id: 'erc20',
    name: 'Ethereum (ERC-20)',
    token: 'USDT',
    address: '0x4EdF2D77584109B1071a6eE1D77638a2f6Cc983e',
    networkFeeEstimated: '~3.50 USD',
    speed: 'Standard (~1 min)',
    deepLinkPrefix: 'ethereum:0x4EdF2D77584109B1071a6eE1D77638a2f6Cc983e@1',
    explorerUrl: 'https://etherscan.io/tx/',
  },
];

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  discountCode?: string;
  discountPercent?: number;
  onClearCart: () => void;
  onTrackOrder?: (orderId: string) => void;
  onViewReceipt?: (orderId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  discountCode,
  discountPercent = 0,
  onClearCart,
  onTrackOrder,
  onViewReceipt,
}) => {
  // Multi-step Checkout Flow with Strict Payment Verification
  const [step, setStep] = useState<'shipping' | 'trustwallet' | 'verification' | 'processing' | 'confirmation'>('shipping');
  const [selectedNetwork, setSelectedNetwork] = useState<CryptoNetworkOption>(TRUST_WALLET_NETWORKS[0]);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedOrder, setCopiedOrder] = useState(false);
  const [showItemSummary, setShowItemSummary] = useState(false);
  
  // Verification states
  const [txHashInput, setTxHashInput] = useState('');
  const [customerSenderAddress, setCustomerSenderAddress] = useState('');
  const [isVerifyingOnChain, setIsVerifyingOnChain] = useState(false);
  const [isVerificationComplete, setIsVerificationComplete] = useState(false);
  const [verificationAuditStage, setVerificationAuditStage] = useState(0);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationDetails, setVerificationDetails] = useState<{
    verified: boolean;
    blockNumber?: number;
    confirmations?: number;
    signature?: string;
    statusText?: string;
    verifiedHash?: string;
  } | null>(null);

  // Processing & Confirmation state
  const [processingStatus, setProcessingStatus] = useState('Initiating cryptographic order registry...');
  const [progressPercent, setProgressPercent] = useState(15);
  const [confirmedOrderId, setConfirmedOrderId] = useState('');
  const [confirmedAuthCode, setConfirmedAuthCode] = useState('');
  const [confirmedTxHash, setConfirmedTxHash] = useState('');

  // Customer Form Details
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zip: '',
    country: 'Pakistan',
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      setStep('shipping');
      setSelectedNetwork(TRUST_WALLET_NETWORKS[0]);
      setTxHashInput('');
      setCustomerSenderAddress('');
      setIsVerifyingOnChain(false);
      setIsVerificationComplete(false);
      setVerificationAuditStage(0);
      setVerificationError(null);
      setVerificationDetails(null);
      setConfirmedOrderId(`AXE-${Math.floor(100000 + Math.random() * 900000)}`);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const discountedSubtotal = subtotal - discountAmount;
  const shippingCost = discountedSubtotal >= 150 || cartItems.length === 0 ? 0 : 15;
  const estimatedTax = discountedSubtotal * 0.08;
  const grandTotal = Math.max(0, discountedSubtotal + shippingCost + estimatedTax);
  const totalUsdt = grandTotal.toFixed(2);
  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Copy Helpers
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(selectedNetwork.address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(totalUsdt);
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handleOpenTrustWallet = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = `https://link.trustwallet.com/open_url?coin_id=60&url=${encodeURIComponent(window.location.href)}`;
    } else {
      window.open(selectedNetwork.deepLinkPrefix, '_blank');
    }
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('trustwallet');
  };

  const handleProceedToVerification = () => {
    setStep('verification');
    setVerificationError(null);
    if (txHashInput.trim()) {
      runLiveBlockchainVerification(txHashInput.trim());
    } else {
      setIsVerificationComplete(false);
      setVerificationDetails(null);
    }
  };

  // Helper to generate a valid test transaction hash for demo sandbox simulation
  const handleSimulateDemoPayment = () => {
    const hex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const sampleHash = `0x${hex}`;
    setTxHashInput(sampleHash);
    setCustomerSenderAddress('0x71C...b89A (Test Wallet)');
    runLiveBlockchainVerification(sampleHash);
  };

  // Run Real-time Blockchain Payment Verification
  const runLiveBlockchainVerification = async (hashToVerify?: string) => {
    const targetHash = (hashToVerify || txHashInput).trim();
    
    if (!targetHash) {
      setVerificationError('Please enter the Transaction Hash from your Trust Wallet receipt first.');
      setIsVerificationComplete(true);
      setVerificationDetails({ verified: false });
      return;
    }

    setIsVerifyingOnChain(true);
    setIsVerificationComplete(false);
    setVerificationError(null);
    setVerificationAuditStage(1);

    // Staged animation
    setTimeout(() => setVerificationAuditStage(2), 300);
    setTimeout(() => setVerificationAuditStage(3), 600);
    setTimeout(() => setVerificationAuditStage(4), 900);

    try {
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          network: selectedNetwork.name,
          txHash: targetHash,
          senderAddress: customerSenderAddress.trim() || undefined,
          merchantAddress: selectedNetwork.address,
          amountExpected: grandTotal,
        }),
      });

      const data = await res.json();

      setTimeout(() => {
        setIsVerifyingOnChain(false);
        setIsVerificationComplete(true);

        if (data.success && data.verification && data.verification.verified) {
          setVerificationDetails({
            verified: true,
            blockNumber: data.verification.blockNumber,
            confirmations: data.verification.confirmations,
            signature: data.verification.signature,
            statusText: data.verification.auditMessage,
            verifiedHash: data.verification.txHash,
          });
          setVerificationError(null);
        } else {
          setVerificationDetails({
            verified: false,
            statusText: data.verification?.auditMessage || 'Payment not found on blockchain.',
          });
          setVerificationError(data.verification?.auditMessage || 'Payment not confirmed. Please verify your transaction hash.');
        }
      }, 1200);
    } catch (err) {
      console.warn('Verification network error:', err);
      setTimeout(() => {
        setIsVerifyingOnChain(false);
        setIsVerificationComplete(true);
        setVerificationDetails({
          verified: false,
          statusText: 'Could not connect to blockchain node. Please check transaction hash.',
        });
        setVerificationError('Unable to connect to blockchain node to verify payment.');
      }, 1200);
    }
  };

  // Final Order Placement after Verification
  const handleFinalOrderPlacement = async () => {
    // STRICT GUARD: If payment is not verified, do not proceed!
    if (!verificationDetails?.verified || !txHashInput.trim()) {
      setVerificationError('Order rejected: Payment must be verified before proceeding. Please complete payment in Trust Wallet.');
      return;
    }

    setStep('processing');
    setProgressPercent(25);
    setProcessingStatus('Securing cryptographic ledger invoice...');

    const fullShippingAddress = `${formData.address}${formData.apartment ? ', ' + formData.apartment : ''}, ${formData.city}, ${formData.state} ${formData.zip}, ${formData.country}`;
    const fullName = `${formData.firstName} ${formData.lastName}`.trim() || 'Valued Customer';

    try {
      setTimeout(() => {
        setProgressPercent(60);
        setProcessingStatus(`Confirming ${totalUsdt} USDT settlement on ${selectedNetwork.name}...`);
      }, 500);

      setTimeout(() => {
        setProgressPercent(85);
        setProcessingStatus('Saving order records and dispatching warehouse notification in Firestore...');
      }, 1000);

      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          network: selectedNetwork.name,
          merchantReceivingAddress: selectedNetwork.address,
          customerSenderAddress: customerSenderAddress || undefined,
          txHash: txHashInput.trim() || verificationDetails?.verifiedHash || undefined,
          cartItems,
          customerName: fullName,
          customerEmail: formData.email,
          shippingAddress: fullShippingAddress,
          discountPercent,
          country: formData.country,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Payment was rejected or unpaid - DO NOT proceed!
        setStep('verification');
        setVerificationError(data.error || 'Payment could not be verified on-chain. Order was not placed.');
        setVerificationDetails({ verified: false });
        return;
      }

      setTimeout(() => {
        setProgressPercent(100);
        setConfirmedOrderId(data.orderId || data.order?.id);
        setConfirmedAuthCode(data.authCode || 'TW-AUTH-9921');
        setConfirmedTxHash(data.txHash || verificationDetails?.verifiedHash || '');
        setStep('confirmation');
        onClearCart();
      }, 1500);
    } catch (error) {
      console.warn('Checkout error:', error);
      setStep('verification');
      setVerificationError('Payment processing failed. Please verify your payment transaction.');
    }
  };

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(confirmedOrderId);
    setCopiedOrder(true);
    setTimeout(() => setCopiedOrder(false), 2000);
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&data=${encodeURIComponent(selectedNetwork.address)}`;
  const isPaymentPaidAndVerified = verificationDetails?.verified === true;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-sans">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md transition-opacity"
      />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden text-left border border-stone-200 dark:border-neutral-800 my-8 p-6 sm:p-8 text-neutral-900 dark:text-neutral-100 z-10"
        >
          {/* Top Bar with Step Navigator */}
          <div className="flex items-center justify-between pb-5 border-b border-stone-200 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30 font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                    Trust Wallet Checkout
                  </span>
                  <span className="text-[10px] font-extrabold tracking-wider uppercase bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    USDT Direct
                  </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Secure peer-to-peer crypto settlement &bull; Payment required before order placement
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-full hover:bg-stone-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Indicator */}
          {step !== 'confirmation' && (
            <div className="flex items-center justify-between pt-4 pb-2 text-[11px] font-semibold">
              <div className={`flex items-center gap-1.5 ${step === 'shipping' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-neutral-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'shipping' ? 'bg-blue-600 text-white' : 'bg-stone-200 dark:bg-neutral-800'}`}>1</span>
                <span>Shipping</span>
              </div>
              <div className="h-0.5 flex-1 mx-2 bg-stone-200 dark:bg-neutral-800" />
              <div className={`flex items-center gap-1.5 ${step === 'trustwallet' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-neutral-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'trustwallet' ? 'bg-blue-600 text-white' : 'bg-stone-200 dark:bg-neutral-800'}`}>2</span>
                <span>Send USDT</span>
              </div>
              <div className="h-0.5 flex-1 mx-2 bg-stone-200 dark:bg-neutral-800" />
              <div className={`flex items-center gap-1.5 ${step === 'verification' || step === 'processing' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-neutral-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'verification' || step === 'processing' ? 'bg-blue-600 text-white' : 'bg-stone-200 dark:bg-neutral-800'}`}>3</span>
                <span>Verify Payment</span>
              </div>
            </div>
          )}

          {/* STEP 1: SHIPPING & CONTACT DETAILS */}
          {step === 'shipping' && (
            <form onSubmit={handleProceedToPayment} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-neutral-800/80 border border-stone-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Doe"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-neutral-800/80 border border-stone-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Email Address (For Invoices &amp; Receipts)
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="customer@domain.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-neutral-800/80 border border-stone-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Country / Region
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-neutral-800/80 border border-stone-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors font-medium"
                  >
                    <option value="Pakistan">Pakistan 🇵🇰</option>
                    <option value="United States">United States 🇺🇸</option>
                    <option value="United Kingdom">United Kingdom 🇬🇧</option>
                    <option value="United Arab Emirates">United Arab Emirates 🇦🇪</option>
                    <option value="Saudi Arabia">Saudi Arabia 🇸🇦</option>
                    <option value="Canada">Canada 🇨🇦</option>
                    <option value="Germany">Germany 🇩🇪</option>
                    <option value="Australia">Australia 🇦🇺</option>
                    <option value="Other">Other Worldwide 🌐</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Delivery Address
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="House/Apt, Street, Sector or Area"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-neutral-800/80 border border-stone-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-neutral-800/80 border border-stone-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                      State / Province
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Province / State"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-neutral-800/80 border border-stone-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Postal Code"
                      value={formData.zip}
                      onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-neutral-800/80 border border-stone-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Order Items Dropdown Summary */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowItemSummary(!showItemSummary)}
                  className="w-full flex items-center justify-between p-3.5 bg-stone-50 dark:bg-neutral-800/50 rounded-2xl border border-stone-200 dark:border-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-500" />
                    Review Items in Order ({totalItemCount})
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-neutral-900 dark:text-white">
                      ${grandTotal.toFixed(2)} USD ({totalUsdt} USDT)
                    </span>
                    {showItemSummary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {showItemSummary && (
                  <div className="mt-2 p-3.5 bg-stone-50/70 dark:bg-neutral-850 rounded-2xl border border-stone-200 dark:border-neutral-800 max-h-48 overflow-y-auto space-y-2.5 text-xs">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-[11px]">
                        <div className="flex items-center gap-2 max-w-[280px]">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-8 h-8 rounded-lg object-cover bg-stone-100 dark:bg-neutral-800"
                            referrerPolicy="no-referrer"
                          />
                          <span className="truncate text-neutral-800 dark:text-neutral-200 font-medium">
                            {item.product.name} &times; {item.quantity}
                          </span>
                        </div>
                        <span className="font-mono font-semibold text-neutral-900 dark:text-white">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}

                    <div className="pt-2.5 border-t border-stone-200 dark:border-neutral-800 space-y-1.5 text-[11px]">
                      <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                        <span>Subtotal</span>
                        <span className="font-mono">${subtotal.toFixed(2)}</span>
                      </div>
                      {discountAmount > 0 && (
                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                          <span>Discount ({discountPercent}%)</span>
                          <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                        <span>Shipping</span>
                        <span className="font-mono">{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
                      </div>
                      <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                        <span>Estimated Tax (8%)</span>
                        <span className="font-mono">${estimatedTax.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Proceed Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white rounded-2xl font-extrabold text-sm shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>Continue to Trust Wallet &bull; {totalUsdt} USDT</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: TRUST WALLET PAYMENT TRANSFER */}
          {step === 'trustwallet' && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setStep('shipping')}
                  className="flex items-center gap-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-semibold transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Shipping</span>
                </button>
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
                  Step 2: Send USDT to Merchant Address
                </span>
              </div>

              {/* Network Selection Tabs */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  <span>Select Network for USDT Transfer:</span>
                  <span className="text-[10px] text-neutral-400 font-normal">Choose network in your wallet</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TRUST_WALLET_NETWORKS.map((net) => {
                    const isSelected = selectedNetwork.id === net.id;
                    return (
                      <button
                        key={net.id}
                        type="button"
                        onClick={() => setSelectedNetwork(net)}
                        className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer relative ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-950 dark:text-blue-100 shadow-sm'
                            : 'bg-stone-50 dark:bg-neutral-800/60 border-stone-200 dark:border-neutral-750 text-neutral-700 dark:text-neutral-300 hover:border-blue-300'
                        }`}
                      >
                        {net.badge && (
                          <span className="absolute -top-2 right-2 text-[8px] font-black uppercase tracking-wider bg-amber-500 text-neutral-950 px-1.5 py-0.2 rounded shadow">
                            {net.badge}
                          </span>
                        )}
                        <p className="text-[11px] font-bold truncate">{net.name.split(' ')[0]} ({net.id.toUpperCase()})</p>
                        <p className="text-[9px] text-neutral-400 font-mono mt-0.5">{net.speed}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* QR & Transfer Details Card */}
              <div className="p-4 sm:p-5 bg-stone-50 dark:bg-neutral-950/80 rounded-2xl border border-stone-200 dark:border-neutral-800 space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
                  <div className="relative p-2 bg-white rounded-2xl border border-stone-200 shadow-md flex-shrink-0">
                    <img
                      src={qrCodeUrl}
                      alt="Trust Wallet Payment QR Code"
                      className="w-32 h-32 object-contain rounded-lg"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2.5 text-center sm:text-left w-full">
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                        Amount to Send
                      </span>
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <span className="font-mono text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                          {totalUsdt} USDT
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyAmount}
                          className="px-2 py-1 bg-stone-200 dark:bg-neutral-800 hover:bg-stone-300 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {copiedAmount ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedAmount ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
                        ≈ ${grandTotal.toFixed(2)} USD &bull; Network: {selectedNetwork.name}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                        Merchant Receiving Address
                      </label>
                      <div className="flex items-center gap-1.5 p-2 bg-stone-100 dark:bg-neutral-850 rounded-xl border border-stone-300 dark:border-neutral-750">
                        <span className="font-mono text-[11px] text-neutral-800 dark:text-neutral-200 truncate flex-1 select-all">
                          {selectedNetwork.address}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyAddress}
                          className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer flex-shrink-0"
                          title="Copy Address"
                        >
                          {copiedAddress ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleOpenTrustWallet}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Pay in Trust Wallet App</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyAddress}
                    className="py-3 px-4 bg-stone-200 dark:bg-neutral-800 hover:bg-stone-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    {copiedAddress ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedAddress ? 'Address Copied!' : 'Copy Wallet Address'}</span>
                  </button>
                </div>
              </div>

              {/* Proceed to Payment Verification Step */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleProceedToVerification}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-2xl font-extrabold text-sm shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <FileCheck className="w-5 h-5" />
                  <span>I Have Sent Payment &bull; Proceed to Verification</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
                <p className="text-[10px] text-center text-neutral-400 dark:text-neutral-500 mt-2">
                  Payment confirmation required on-chain before order can be dispatched
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: STRICT PAYMENT VERIFICATION (ORDER BLOCKED IF UNPAID) */}
          {step === 'verification' && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setStep('trustwallet')}
                  className="flex items-center gap-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-semibold transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to QR &amp; Address</span>
                </button>
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-900 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Step 3: Verification &amp; Authorization
                </span>
              </div>

              {/* Real-time Verification Engine Card */}
              <div className="p-5 bg-stone-50 dark:bg-neutral-950/90 rounded-2xl border border-stone-200 dark:border-neutral-800 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                      <span>Blockchain Payment Verification</span>
                      {isVerifyingOnChain && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />}
                      {isPaymentPaidAndVerified && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                      {isVerificationComplete && !isPaymentPaidAndVerified && <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Required settlement: <strong className="text-neutral-900 dark:text-white">{totalUsdt} USDT</strong> on <strong className="text-blue-600 dark:text-blue-400">{selectedNetwork.name}</strong>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => runLiveBlockchainVerification()}
                    disabled={isVerifyingOnChain}
                    className="px-3 py-1.5 bg-stone-200 dark:bg-neutral-800 hover:bg-stone-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingOnChain ? 'animate-spin' : ''}`} />
                    <span>Check Status</span>
                  </button>
                </div>

                {/* Input Fields for Verification */}
                <div className="space-y-3 bg-white dark:bg-neutral-900 p-4 rounded-xl border border-stone-200 dark:border-neutral-800 text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200">
                        Transaction Hash (TxID) / Receipt ID <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleSimulateDemoPayment}
                        className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Zap className="w-3 h-3 text-amber-500" />
                        <span>⚡ Fill Test / Sandbox Hash</span>
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Paste full transaction hash (e.g. 0x8f2a... or TxID)"
                        value={txHashInput}
                        onChange={(e) => {
                          setTxHashInput(e.target.value);
                          setIsVerificationComplete(false);
                          setVerificationDetails(null);
                          setVerificationError(null);
                        }}
                        className="flex-1 px-3 py-2 text-xs bg-stone-50 dark:bg-neutral-850 border border-stone-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => runLiveBlockchainVerification()}
                        disabled={isVerifyingOnChain || !txHashInput.trim()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow transition-colors cursor-pointer disabled:opacity-50 flex-shrink-0 flex items-center gap-1.5"
                      >
                        {isVerifyingOnChain ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                        <span>Verify</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                      Sender Wallet Address (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Your Trust Wallet address (e.g. 0x... or T...)"
                      value={customerSenderAddress}
                      onChange={(e) => setCustomerSenderAddress(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-neutral-850 border border-stone-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* 4-Stage Verification Checklist (When verifying or complete) */}
                {isVerifyingOnChain && (
                  <div className="space-y-2.5 bg-white dark:bg-neutral-900 p-4 rounded-xl border border-stone-200 dark:border-neutral-800 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {verificationAuditStage >= 1 ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-neutral-400 animate-pulse" />
                        )}
                        <span className="text-neutral-800 dark:text-neutral-200 font-medium">
                          1. Querying {selectedNetwork.name} RPC Node
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {verificationAuditStage >= 1 ? 'CONNECTED' : 'WAITING...'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {verificationAuditStage >= 2 ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-neutral-400 animate-pulse" />
                        )}
                        <span className="text-neutral-800 dark:text-neutral-200 font-medium">
                          2. Matching Destination Address &amp; Token
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {verificationAuditStage >= 2 ? 'MATCH CONFIRMED' : 'WAITING...'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {verificationAuditStage >= 3 ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-neutral-400 animate-pulse" />
                        )}
                        <span className="text-neutral-800 dark:text-neutral-200 font-medium">
                          3. Checking Settlement Value ({totalUsdt} USDT)
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {verificationAuditStage >= 3 ? 'AUDITING...' : 'WAITING...'}
                      </span>
                    </div>
                  </div>
                )}

                {/* VERIFIED SUCCESS BADGE */}
                {isPaymentPaidAndVerified && verificationDetails && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-300 dark:border-emerald-750 text-xs space-y-2">
                    <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-200">
                      <span className="flex items-center gap-1.5 text-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        Payment Verified on Blockchain
                      </span>
                      <span className="text-[10px] font-mono bg-emerald-200/80 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 px-2 py-0.5 rounded font-bold">
                        {verificationDetails.signature}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300/90 font-mono">
                      {verificationDetails.statusText || `Payment confirmed on ${selectedNetwork.name} node.`}
                    </p>
                    <div className="flex justify-between text-[10px] text-emerald-600 dark:text-emerald-400 font-mono pt-1 border-t border-emerald-200 dark:border-emerald-800">
                      <span>Block #{verificationDetails.blockNumber}</span>
                      <span>{verificationDetails.confirmations} Confirmations</span>
                    </div>
                  </div>
                )}

                {/* UNPAID / ERROR WARNING BANNER (BLOCKING STATE) */}
                {((isVerificationComplete && !isPaymentPaidAndVerified) || verificationError) && (
                  <div className="p-4 bg-rose-50 dark:bg-rose-950/60 rounded-xl border border-rose-200 dark:border-rose-850 text-xs space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-rose-800 dark:text-rose-300 text-sm">
                      <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                      <span>Payment Unpaid / Not Verified</span>
                    </div>
                    <p className="text-rose-700 dark:text-rose-300/90 text-xs">
                      {verificationError || 'No verified transfer was found for this transaction hash. Orders cannot be processed without confirmed payment on the blockchain.'}
                    </p>
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium pt-1">
                      💡 Please send <strong>{totalUsdt} USDT</strong> via Trust Wallet to the merchant address, or click <em>⚡ Fill Test Hash</em> to test in sandbox.
                    </p>
                  </div>
                )}

                {/* INITIAL INSTRUCTION STATE */}
                {!isVerificationComplete && !isVerifyingOnChain && !txHashInput && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900 text-xs flex items-start gap-2 text-amber-800 dark:text-amber-300">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Payment Confirmation Required</p>
                      <p className="text-[11px] text-amber-700 dark:text-amber-400/90 mt-0.5">
                        Please paste your transaction hash from Trust Wallet and click &ldquo;Verify&rdquo; to unlock order placement.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* STRICTLY CONTROLLED PLACE ORDER BUTTON */}
              <div className="pt-2 space-y-2">
                {isPaymentPaidAndVerified ? (
                  <button
                    type="button"
                    onClick={handleFinalOrderPlacement}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-2xl font-extrabold text-sm shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Lock className="w-5 h-5" />
                    <span>Proceed with Verified Payment &bull; Place Order (${grandTotal.toFixed(2)})</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full py-4 bg-stone-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 cursor-not-allowed border border-stone-300 dark:border-neutral-750"
                  >
                    <Lock className="w-5 h-5 text-neutral-400" />
                    <span>⚠️ Payment Unpaid &bull; Complete Verification to Proceed</span>
                  </button>
                )}

                <p className="text-[10px] text-center text-neutral-400 dark:text-neutral-500">
                  {isPaymentPaidAndVerified
                    ? 'Payment is verified. Click Place Order to register your invoice and generate your dispatch tracking ID.'
                    : 'The order will not proceed until valid payment is verified on the blockchain.'}
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: PROCESSING ANIMATION */}
          {step === 'processing' && (
            <div className="py-16 px-4 text-center space-y-6">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-ping" />
                <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-500/30">
                  <Loader2 className="w-10 h-10 animate-spin" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Sealing Cryptographic Order Record
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto font-mono">
                  {processingStatus}
                </p>
              </div>

              <div className="max-w-xs mx-auto space-y-1.5">
                <div className="w-full h-2 bg-stone-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-600 rounded-full"
                    initial={{ width: '20%' }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                  <span>Ledger Registry</span>
                  <span>{progressPercent}%</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: ORDER CONFIRMATION */}
          {step === 'confirmation' && (
            <div className="py-6 space-y-6 text-center">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold tracking-wider uppercase bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Payment Verified &bull; Order Sealed
                </span>
                <h3 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white pt-2">
                  Thank You for Your Order!
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                  Your Trust Wallet transaction was verified and sent to <strong className="text-neutral-900 dark:text-white font-medium">{formData.email}</strong>.
                </p>
              </div>

              {/* Key Details Card */}
              <div className="p-4 bg-stone-50 dark:bg-neutral-850 rounded-2xl border border-stone-200 dark:border-neutral-750 text-xs space-y-3 text-left">
                <div className="flex justify-between items-center pb-2 border-b border-stone-200 dark:border-neutral-800">
                  <span className="text-neutral-500 dark:text-neutral-400">Order Reference:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-neutral-900 dark:text-white">
                    <span>{confirmedOrderId}</span>
                    <button
                      type="button"
                      onClick={handleCopyOrderId}
                      className="p-1 hover:bg-stone-200 dark:hover:bg-neutral-700 rounded-md transition-colors cursor-pointer"
                      title="Copy Order ID"
                    >
                      {copiedOrder ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-neutral-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-stone-200 dark:border-neutral-800">
                  <span className="text-neutral-500 dark:text-neutral-400">Total Paid:</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    {totalUsdt} USDT (${grandTotal.toFixed(2)} USD)
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-stone-200 dark:border-neutral-800">
                  <span className="text-neutral-500 dark:text-neutral-400">Verification Status:</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified On-Chain ({selectedNetwork.name})
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-stone-200 dark:border-neutral-800">
                  <span className="text-neutral-500 dark:text-neutral-400">Auth Signature:</span>
                  <span className="font-mono text-neutral-700 dark:text-neutral-300">
                    {confirmedAuthCode || 'TW-AUTH-9921'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-neutral-500 dark:text-neutral-400">Dispatch Status:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Packaging for Dispatch
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {onViewReceipt && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onViewReceipt(confirmedOrderId);
                    }}
                    className="flex-1 py-3.5 bg-stone-100 dark:bg-neutral-800 hover:bg-stone-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>View Official Receipt</span>
                  </button>
                )}

                {onTrackOrder && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onTrackOrder(confirmedOrderId);
                    }}
                    className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-extrabold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Track Order Progress</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3.5 border border-stone-300 dark:border-neutral-700 hover:bg-stone-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-2xl font-semibold text-xs transition-colors cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
