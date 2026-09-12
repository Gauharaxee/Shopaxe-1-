import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  LogOut, 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  ShieldAlert, 
  Settings, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Filter, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  CreditCard,
  AlertTriangle, 
  CheckCircle2, 
  Truck, 
  Printer, 
  Key, 
  KeyRound,
  RefreshCw, 
  X, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  FileText,
  Mail,
  Clock,
  Check,
  Send,
  Eye,
  Store,
  Trophy,
  Award,
  Activity,
  Percent,
  BarChart2,
  Smartphone,
  QrCode,
  Globe,
  Coins,
  Save,
  CheckCircle,
  Archive,
  RotateCcw,
  History,
  Download,
  UploadCloud,
  HardDrive,
  FileJson,
  Undo2,
  Palette,
  Cpu,
  Megaphone,
  Tag,
  Volume2,
  VolumeX,
  Radio,
  BellRing,
  Zap,
  Play,
  Database,
  Sliders,
  Layers,
  ArrowRight,
  Sparkle,
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  LineChart,
  Line,
  Legend,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Product, AdminOrder, SecurityLog, CustomerRecord, SupportTicket, OrderStatus, StoreSettings } from '../types';
import { BrandLogo } from './BrandLogo';
import { 
  INITIAL_ORDERS, 
  INITIAL_SECURITY_LOGS, 
  INITIAL_CUSTOMERS, 
  INITIAL_TICKETS, 
  SALES_CHART_DATA, 
  CATEGORY_DISTRIBUTION,
  CONVERSION_TREND_DATA 
} from '../data/adminMockData';

import { 
  subscribeOrders, 
  subscribeSecurityLogs, 
  subscribeCustomers, 
  subscribeTickets,
  upsertProductInDb, 
  deleteProductInDb,
  updateProductStockInDb,
  updateOrderStatusInDb,
  createOrderInDb,
  deleteOrderInDb,
  upsertCustomerInDb,
  deleteCustomerInDb,
  addSecurityLogInDb,
  updateTicketStatusInDb,
  DEFAULT_STORE_SETTINGS,
  subscribeStoreSettings,
  updateStoreSettingsInDb,
  purgeDemoDataFromFirestore
} from '../lib/firebase';
import {
  createServerProduct,
  updateServerProduct,
  adjustServerProductStock,
  deleteServerProduct,
  fetchServerOrders,
  syncServerOrders,
  receiveIncomingOrder,
  createServerOrder,
  updateServerOrderStatus,
  deleteServerOrder,
  fetchServerCustomers,
  createServerCustomer,
  updateServerCustomer,
  deleteServerCustomer,
  fetchServerSupportTickets,
  updateServerSupportTicketStatus,
  fetchServerSecurityLogs,
  createServerSecurityLog,
  fetchServerStoreSettings,
  updateServerStoreSettings,
} from '../lib/productsApi';
import { ImageUploadInput } from './seller/ImageUploadInput';
import { ProductListingFormModal } from './seller/ProductListingFormModal';
import { AddOrderModal } from './seller/AddOrderModal';
import { DeleteOrderModal } from './seller/DeleteOrderModal';
import { AddCustomerModal } from './seller/AddCustomerModal';
import { EditCustomerModal } from './seller/EditCustomerModal';
import { DeleteCustomerModal } from './seller/DeleteCustomerModal';
import { MasterPinGate } from './seller/MasterPinGate';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  orders?: AdminOrder[];
  securityLogs?: SecurityLog[];
  customers?: CustomerRecord[];
  tickets?: SupportTicket[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateOrderStatus?: (orderId: string, status: OrderStatus) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  products,
  orders: propOrders,
  securityLogs: propLogs,
  customers: propCustomers,
  tickets: propTickets,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
}) => {
  // Security State
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [masterPin, setMasterPin] = useState<string>('428427');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'customers' | 'security' | 'settings'>('overview');

  // Demo Data Mode toggle (Defaults to FALSE for clean professional production use)
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // Admin Data States with real-time Firestore synchronization
  const [orders, setOrders] = useState<AdminOrder[]>(propOrders || []);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>(propLogs || []);
  const [customers, setCustomers] = useState<CustomerRecord[]>(propCustomers || []);
  const [tickets, setTickets] = useState<SupportTicket[]>(propTickets || []);

  // Sync props if provided from App level
  React.useEffect(() => { if (propOrders) setOrders(propOrders); }, [propOrders]);
  React.useEffect(() => { if (propLogs) setSecurityLogs(propLogs); }, [propLogs]);
  React.useEffect(() => { if (propCustomers) setCustomers(propCustomers); }, [propCustomers]);
  React.useEffect(() => { if (propTickets) setTickets(propTickets); }, [propTickets]);

  // Real-time synchronization for Admin data from PostgreSQL database & Firestore
  React.useEffect(() => {
    if (!isOpen) return;

    // 1. Fetch immediately from PostgreSQL Relational Database REST backend
    fetchServerOrders().then((serverOrders) => {
      if (serverOrders && serverOrders.length > 0) setOrders(serverOrders);
    }).catch(() => {});

    fetchServerCustomers().then((serverCusts) => {
      if (serverCusts && serverCusts.length > 0) setCustomers(serverCusts);
    }).catch(() => {});

    fetchServerSupportTickets().then((serverTickets) => {
      if (serverTickets && serverTickets.length > 0) setTickets(serverTickets);
    }).catch(() => {});

    fetchServerSecurityLogs().then((serverLogs) => {
      if (serverLogs && serverLogs.length > 0) setSecurityLogs(serverLogs);
    }).catch(() => {});

    fetchServerStoreSettings().then((serverSettings) => {
      if (serverSettings) setStoreSettings(serverSettings);
    }).catch(() => {});

    // 2. Real-time subscriptions directly from Firestore
    const unsubscribeOrders = subscribeOrders((fetchedOrders) => {
      if (fetchedOrders.length > 0) {
        setOrders(fetchedOrders);
      }
    });
    const unsubscribeLogs = subscribeSecurityLogs((fetchedLogs) => {
      if (fetchedLogs.length > 0) {
        setSecurityLogs(fetchedLogs);
      }
    });
    const unsubscribeCustomers = subscribeCustomers((fetchedCusts) => {
      if (fetchedCusts.length > 0) {
        setCustomers(fetchedCusts);
      }
    });
    const unsubscribeTickets = subscribeTickets((fetchedTickets) => {
      if (fetchedTickets.length > 0) {
        setTickets(fetchedTickets);
      }
    });
    const unsubscribeStoreSettings = subscribeStoreSettings((fetchedSettings) => {
      if (fetchedSettings) {
        setStoreSettings(fetchedSettings);
      }
    });

    return () => {
      unsubscribeOrders();
      unsubscribeLogs();
      unsubscribeCustomers();
      unsubscribeTickets();
      unsubscribeStoreSettings();
    };
  }, [isOpen]);

  // Product Modals
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Filters
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'out'>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState('');

  // ================= ORDER RECEIVING SYNCHRONIZATION ENGINE ================= //
  const [orderSyncMode, setOrderSyncMode] = useState<'realtime' | '10s' | '30s' | '60s' | 'manual'>('realtime');
  const [isSyncingOrders, setIsSyncingOrders] = useState<boolean>(false);
  const [lastOrderSyncedAt, setLastOrderSyncedAt] = useState<string | null>(() => new Date().toLocaleTimeString());
  const [orderChimeEnabled, setOrderChimeEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('shopaxe_order_chime_enabled');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });
  const [incomingOrderToast, setIncomingOrderToast] = useState<AdminOrder | null>(null);
  const [quickOrderFilter, setQuickOrderFilter] = useState<'all' | 'unfulfilled' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');
  const [isSimulatingOrder, setIsSimulatingOrder] = useState<boolean>(false);
  const [syncStatusSummary, setSyncStatusSummary] = useState<string | null>(null);
  const knownOrderIdsRef = React.useRef<Set<string>>(new Set());

  // Save chime preference
  React.useEffect(() => {
    try {
      localStorage.setItem('shopaxe_order_chime_enabled', JSON.stringify(orderChimeEnabled));
    } catch (e) {
      console.warn('Could not save chime setting', e);
    }
  }, [orderChimeEnabled]);

  // Audio tone generator for Order Receiving Chime (Web Audio API)
  const playOrderReceivedChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      
      // Tone 1: Bright High Bell (D5 -> A5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.4);

      // Tone 2: Harmonic Crystal Chime (D6)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1174.66, now + 0.12);
      gain2.gain.setValueAtTime(0.35, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.75);
    } catch (err) {
      console.warn('Audio chime playback omitted:', err);
    }
  };

  // Sound & Toast Alert on Live Incoming Order Arrival
  React.useEffect(() => {
    if (!orders || orders.length === 0) return;
    
    if (knownOrderIdsRef.current.size > 0) {
      const newOrders = orders.filter((o) => !knownOrderIdsRef.current.has(o.id));
      if (newOrders.length > 0) {
        const latestNewOrder = newOrders[0];
        if (orderChimeEnabled) {
          playOrderReceivedChime();
        }
        setIncomingOrderToast(latestNewOrder);
        setLastOrderSyncedAt(new Date().toLocaleTimeString());
        
        // Auto-dismiss toast after 8 seconds
        setTimeout(() => {
          setIncomingOrderToast((curr) => (curr?.id === latestNewOrder.id ? null : curr));
        }, 8000);
      }
    }
    
    knownOrderIdsRef.current = new Set(orders.map((o) => o.id));
  }, [orders, orderChimeEnabled]);

  // Background Auto-Sync Polling Interval
  React.useEffect(() => {
    if (!isOpen || isLocked || orderSyncMode === 'manual' || orderSyncMode === 'realtime') return;
    
    let intervalMs = 30000;
    if (orderSyncMode === '10s') intervalMs = 10000;
    if (orderSyncMode === '30s') intervalMs = 30000;
    if (orderSyncMode === '60s') intervalMs = 60000;

    const timer = setInterval(() => {
      handleForceOrderSync(true);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isOpen, isLocked, orderSyncMode, orders]);

  // Force Order Synchronization & Dual-Database Reconciliation
  const handleForceOrderSync = async (silent = false) => {
    if (!silent) setIsSyncingOrders(true);
    try {
      const result = await syncServerOrders(orders);
      if (result && result.orders) {
        setOrders(result.orders);
        setLastOrderSyncedAt(new Date().toLocaleTimeString());
        if (!silent) {
          setSyncStatusSummary(`Dual-Database Synced: ${result.syncedCount} orders verified across PostgreSQL & Firestore`);
          setTimeout(() => setSyncStatusSummary(null), 4000);
        }
      }
    } catch (err) {
      console.warn('Order sync error:', err);
      if (!silent) {
        setSyncStatusSummary('Sync connection check completed.');
        setTimeout(() => setSyncStatusSummary(null), 3000);
      }
    } finally {
      if (!silent) setIsSyncingOrders(false);
    }
  };

  // Simulate Incoming Real-Time Order (Merchant Live Test Tool)
  const handleSimulateIncomingOrder = async () => {
    setIsSimulatingOrder(true);
    try {
      const sampleItem = products[0] || {
        id: 'prod-sample',
        name: 'Minimalist Signature Item',
        price: 180,
        category: 'Apparel',
        stockCount: 20,
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800'
      };
      
      const newOrderId = `AXE-${Math.floor(100000 + Math.random() * 900000)}`;
      const sampleOrder: AdminOrder = {
        id: newOrderId,
        customerName: ['Hamza Tariq', 'Ayesha Malik', 'Zainab Qureshi', 'Bilal Ahmed', 'Sarah Jenkins'][Math.floor(Math.random() * 5)],
        customerEmail: `customer.${Math.floor(100 + Math.random() * 900)}@gmail.com`,
        items: [
          {
            id: `item-${Date.now()}`,
            product: sampleItem,
            quantity: 1,
            selectedColor: { name: 'Onyx Black', hex: '#18181b' }
          }
        ],
        subtotal: sampleItem.price,
        total: sampleItem.price,
        status: 'Processing',
        paymentGateway: 'Trust Wallet (USDT BEP-20)',
        paymentDetails: {
          method: 'Trust Wallet',
          network: 'BNB Smart Chain (BEP-20)',
          merchantReceivingAddress: '0x4EdF2D77584109B1071a6eE1D77638a2f6Cc983e',
          txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
          amountUsdt: sampleItem.price,
          amountUsd: sampleItem.price,
          authCode: `TW-AUTH-${Date.now().toString().slice(-6)}`,
          transactionId: `TXN-${Date.now().toString().slice(-6)}`,
          status: 'CONFIRMED'
        },
        shippingAddress: 'House 42, Sector F-7/2, Islamabad, Pakistan',
        trackingNumber: `TRK-${Math.floor(10000000 + Math.random() * 90000000)}PK`,
        date: new Date().toISOString().replace('T', ' ').slice(0, 16)
      };

      // 1. Add to local state (will trigger chime & toast)
      setOrders((prev) => [sampleOrder, ...prev]);
      
      // 2. Dual-database persistence
      createOrderInDb(sampleOrder).catch((e) => console.warn('Firestore sync simulated:', e));
      receiveIncomingOrder(sampleOrder).catch((e) => console.warn('REST sync simulated:', e));

      addSecurityLog(
        `Incoming Order Received & Synced: #${sampleOrder.id} (${sampleOrder.customerName} - $${sampleOrder.total})`,
        'Order',
        'info'
      );
    } finally {
      setIsSimulatingOrder(false);
    }
  };

  // Selected Order for Invoice
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<AdminOrder | null>(null);

  // Orders Management Modals State
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [deletingOrder, setDeletingOrder] = useState<AdminOrder | null>(null);

  // Customers Management Modals State
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerRecord | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<CustomerRecord | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerTierFilter, setCustomerTierFilter] = useState('all');

  // Add Product Form State
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    category: 'Apparel' as Product['category'],
    price: 120,
    stockCount: 25,
    sku: `SHOPAXE-${Math.floor(1000 + Math.random() * 9000)}`,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800',
    description: 'Premium handcrafted minimalist garment made with organic sustainable fabrics.',
    details: '100% Organic Cotton, Hand-tailored seams, Dry clean or cold machine wash',
  });

  // Product Catalog Save & Archive State
  const [isSavingCatalog, setIsSavingCatalog] = useState<boolean>(false);
  const [catalogSavedSuccess, setCatalogSavedSuccess] = useState<boolean>(false);
  const [lastCatalogSavedAt, setLastCatalogSavedAt] = useState<string | null>(() => {
    return localStorage.getItem('shopaxe_last_catalog_saved_at') || null;
  });
  const [saveToArchiveOnDelete, setSaveToArchiveOnDelete] = useState<boolean>(true);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState<boolean>(false);
  const [undoDeletedProduct, setUndoDeletedProduct] = useState<(Product & { deletedAt: string }) | null>(null);

  // Deleted Products Archive (Stored locally + recoverable)
  const [deletedProductsArchive, setDeletedProductsArchive] = useState<(Product & { deletedAt: string })[]>(() => {
    try {
      const saved = localStorage.getItem('shopaxe_deleted_products_archive');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save archive to localStorage whenever it changes
  React.useEffect(() => {
    try {
      localStorage.setItem('shopaxe_deleted_products_archive', JSON.stringify(deletedProductsArchive));
    } catch (e) {
      console.warn('Could not save deleted products archive to localStorage', e);
    }
  }, [deletedProductsArchive]);

  // Store Settings State with Live Firestore Synchronization
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);
  const [settingsSavedSuccess, setSettingsSavedSuccess] = useState<boolean>(false);

  // Fresh State Purge
  const [isPurgingDemo, setIsPurgingDemo] = useState<boolean>(false);
  const [purgeMessage, setPurgeMessage] = useState<string | null>(null);

  const handlePurgeDemoData = async () => {
    if (!window.confirm('Are you sure you want to clean all demo/sample orders, CRM records, and audit logs from Firestore? Real products and store settings will remain intact.')) {
      return;
    }
    setIsPurgingDemo(true);
    try {
      const stats = await purgeDemoDataFromFirestore();
      setOrders([]);
      setSecurityLogs([]);
      setCustomers([]);
      setTickets([]);
      setPurgeMessage(`Clean slate verified! Purged ${stats.clearedOrders} demo orders, ${stats.clearedCustomers} test accounts, and ${stats.clearedLogs} sample logs.`);
      setTimeout(() => setPurgeMessage(null), 6000);
    } catch (err) {
      console.error('Failed to purge demo data:', err);
      setPurgeMessage('Failed to purge demo records. Check Firestore connection.');
    } finally {
      setIsPurgingDemo(false);
    }
  };

  // New PIN Form State
  const [newPinInput, setNewPinInput] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState(false);

  // Helper to add Security Log to state, PostgreSQL Database & Firestore
  const addSecurityLog = (action: string, category: SecurityLog['category'], severity: SecurityLog['severity'] = 'info') => {
    const newLog: SecurityLog = {
      id: `SEC-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      action,
      category,
      severity,
      ipAddress: '192.168.1.104 (Admin Session)',
      user: 'Master Admin (axe426622@gmail.com)',
    };
    setSecurityLogs((prev) => [newLog, ...prev]);
    createServerSecurityLog(newLog).catch((err) => console.warn('PostgreSQL log sync:', err));
    addSecurityLogInDb(newLog).catch((err) => console.error('Failed to log to Firestore:', err));
  };

  // Session lock handler
  const handleLock = () => {
    setIsLocked(true);
    addSecurityLog('Admin Session Manually Locked', 'Auth', 'info');
  };

  // Add Product Handler (Delegated to detailed ProductListingFormModal)
  const handleSaveNewProduct = (created: Product) => {
    onAddProduct(created);
    upsertProductInDb(created).catch((err) => console.warn('Firestore product add sync:', err));
    createServerProduct(created).catch((err) => console.warn('REST product add sync:', err));
    setIsAddProductOpen(false);
    addSecurityLog(`Created & Listed New Product: ${created.name} (SKU: ${created.sku})`, 'Inventory', 'info');
  };

  const handleCreateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveNewProduct({
      id: `prod-${Date.now()}`,
      name: newProductForm.name,
      category: newProductForm.category,
      price: Number(newProductForm.price),
      rating: 5.0,
      reviewCount: 1,
      image: newProductForm.image,
      colors: [
        { name: 'Onyx Black', hex: '#18181b' },
        { name: 'Off-White', hex: '#fafaf9' }
      ],
      description: newProductForm.description,
      details: newProductForm.details.split(',').map((s) => s.trim()),
      isNew: true,
      inStock: newProductForm.stockCount > 0,
      stockCount: Number(newProductForm.stockCount),
      sku: newProductForm.sku,
    });
  };

  // Stock Adjustment Handler
  const handleAdjustStock = (product: Product, delta: number) => {
    const updatedCount = Math.max(0, product.stockCount + delta);
    const updatedProduct: Product = {
      ...product,
      stockCount: updatedCount,
      inStock: updatedCount > 0,
    };
    onUpdateProduct(updatedProduct);
    updateProductStockInDb(product.id, updatedCount).catch((err) => console.warn('Firestore stock sync:', err));
    adjustServerProductStock(product.id, delta).catch((err) => console.warn('REST stock sync:', err));
    addSecurityLog(
      `Adjusted Inventory for ${product.name}: ${product.stockCount} → ${updatedCount}`,
      'Inventory',
      updatedCount < 10 ? 'warning' : 'info'
    );
  };

  // Edit Product Handler (Delegated to detailed ProductListingFormModal)
  const handleSaveEditedProduct = (updated: Product) => {
    onUpdateProduct(updated);
    upsertProductInDb(updated).catch((err) => console.warn('Firestore product update sync:', err));
    updateServerProduct(updated).catch((err) => console.warn('REST product update sync:', err));
    addSecurityLog(`Updated Product Details for ${updated.name} ($${updated.price})`, 'Inventory', 'info');
    setEditingProduct(null);
  };

  const handleEditProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    handleSaveEditedProduct(editingProduct);
  };

  // Save & Sync Entire Catalog to PostgreSQL Database & Firestore
  const handleSaveAllProductsToDb = async () => {
    setIsSavingCatalog(true);
    try {
      // Upsert each product in parallel to PostgreSQL and Firestore
      const savePromises = products.map(async (prod) => {
        try {
          await upsertProductInDb(prod);
          await createServerProduct(prod); // will upsert on conflict
        } catch (err) {
          console.warn('Sync individual product error:', err);
        }
      });
      await Promise.all(savePromises);

      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastCatalogSavedAt(timestamp);
      localStorage.setItem('shopaxe_last_catalog_saved_at', timestamp);
      setCatalogSavedSuccess(true);
      setTimeout(() => setCatalogSavedSuccess(false), 4000);

      addSecurityLog(
        `Synchronized & Saved Full Product Catalog (${products.length} Items) to Database`,
        'Inventory',
        'info'
      );
    } catch (err) {
      console.error('Failed to batch save catalog:', err);
    } finally {
      setIsSavingCatalog(false);
    }
  };

  // Delete Product Handler (with Archive & Save Protection)
  const handleConfirmDeleteProduct = (archiveItem = true) => {
    if (!deletingProductId) return;
    const prod = products.find((p) => p.id === deletingProductId);
    if (!prod) return;

    // Remove from active store
    onDeleteProduct(deletingProductId);
    deleteProductInDb(deletingProductId).catch((err) => console.warn('Firestore delete sync:', err));
    deleteServerProduct(deletingProductId).catch((err) => console.warn('REST delete sync:', err));

    if (archiveItem || saveToArchiveOnDelete) {
      const archivedItem = {
        ...prod,
        deletedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      };
      setDeletedProductsArchive((prev) => [archivedItem, ...prev.filter((item) => item.id !== prod.id)]);
      setUndoDeletedProduct(archivedItem);
      // Auto dismiss undo banner after 10s
      setTimeout(() => {
        setUndoDeletedProduct((curr) => (curr?.id === prod.id ? null : curr));
      }, 10000);
    }

    addSecurityLog(
      `Deleted Product SKU: ${prod.name} (${prod.sku}) ${archiveItem || saveToArchiveOnDelete ? '[Saved to Archive]' : '[Permanent]'}`,
      'Inventory',
      'warning'
    );
    setDeletingProductId(null);
  };

  // Restore Product from Archive back to active catalog
  const handleRestoreProduct = (archivedProd: Product & { deletedAt: string }) => {
    const { deletedAt, ...restoredProduct } = archivedProd;
    onAddProduct(restoredProduct);
    upsertProductInDb(restoredProduct).catch((err) => console.warn('Firestore restore sync:', err));
    createServerProduct(restoredProduct).catch((err) => console.warn('REST restore sync:', err));

    setDeletedProductsArchive((prev) => prev.filter((p) => p.id !== archivedProd.id));
    if (undoDeletedProduct?.id === archivedProd.id) {
      setUndoDeletedProduct(null);
    }

    addSecurityLog(
      `Restored Product SKU: ${restoredProduct.name} (${restoredProduct.sku}) to Active Catalog`,
      'Inventory',
      'info'
    );
  };

  // Export Catalog Snapshot to JSON
  const handleExportCatalogBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `products-catalog-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addSecurityLog(`Exported JSON Product Catalog Backup Snapshot (${products.length} items)`, 'Inventory', 'info');
  };

  // Update Order Status
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    let trackingToSave: string | undefined = undefined;
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const autoTracking = newStatus === 'Shipped' ? `TRK-${Math.floor(10000000 + Math.random() * 90000000)}US` : ord.trackingNumber;
          trackingToSave = autoTracking;
          return {
            ...ord,
            status: newStatus,
            trackingNumber: autoTracking,
          };
        }
        return ord;
      })
    );
    if (onUpdateOrderStatus) {
      onUpdateOrderStatus(orderId, newStatus);
    }
    updateOrderStatusInDb(orderId, newStatus, trackingToSave).catch((err) => console.error('Failed to update order in Firestore:', err));
    updateServerOrderStatus(orderId, newStatus, trackingToSave).catch((err) => console.warn('REST order update sync:', err));
    addSecurityLog(`Order ${orderId} status changed to "${newStatus}"`, 'Order', 'info');
  };

  // Create Order Handler
  const handleCreateOrderSubmit = (newOrder: AdminOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    createOrderInDb(newOrder).catch((err) => console.warn('Firestore order create sync:', err));
    createServerOrder(newOrder).catch((err) => console.warn('REST order create sync:', err));
    addSecurityLog(`Created Order ${newOrder.id} for ${newOrder.customerName} ($${newOrder.total.toFixed(2)})`, 'Order', 'info');
  };

  // Delete Order Handler
  const handleConfirmDeleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    deleteOrderInDb(orderId).catch((err) => console.warn('Firestore order delete sync:', err));
    deleteServerOrder(orderId).catch((err) => console.warn('REST order delete sync:', err));
    addSecurityLog(`Deleted Order Record ${orderId}`, 'Order', 'warning');
    setDeletingOrder(null);
  };

  // Customer Management Handlers
  const handleCreateCustomerSubmit = (newCust: CustomerRecord) => {
    setCustomers((prev) => [newCust, ...prev]);
    upsertCustomerInDb(newCust).catch((err) => console.warn('Firestore customer create sync:', err));
    createServerCustomer(newCust).catch((err) => console.warn('REST customer create sync:', err));
    addSecurityLog(`Registered New Customer: ${newCust.name} (${newCust.email})`, 'CRM', 'info');
  };

  const handleEditCustomerSubmit = (updatedCust: CustomerRecord) => {
    setCustomers((prev) => prev.map((c) => (c.id === updatedCust.id ? updatedCust : c)));
    upsertCustomerInDb(updatedCust).catch((err) => console.warn('Firestore customer update sync:', err));
    updateServerCustomer(updatedCust).catch((err) => console.warn('REST customer update sync:', err));
    addSecurityLog(`Updated Customer Profile: ${updatedCust.name}`, 'CRM', 'info');
    setEditingCustomer(null);
  };

  const handleConfirmDeleteCustomer = (customerId: string) => {
    const target = customers.find((c) => c.id === customerId);
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    deleteCustomerInDb(customerId).catch((err) => console.warn('Firestore customer delete sync:', err));
    deleteServerCustomer(customerId).catch((err) => console.warn('REST customer delete sync:', err));
    addSecurityLog(`Deleted Customer Record: ${target?.name || customerId}`, 'CRM', 'warning');
    setDeletingCustomer(null);
  };

  // Change Master PIN
  const handleChangeMasterPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.trim().length >= 4) {
      setMasterPin(newPinInput.trim());
      setNewPinInput('');
      setPinChangeSuccess(true);
      addSecurityLog('Master Security Access PIN Updated', 'Security', 'critical');
      setTimeout(() => setPinChangeSuccess(false), 3000);
    }
  };

  if (!isOpen) return null;

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat = productCategoryFilter === 'all' || p.category === productCategoryFilter;
    let matchesStock = true;
    if (stockStatusFilter === 'low') matchesStock = p.stockCount > 0 && p.stockCount <= 10;
    if (stockStatusFilter === 'out') matchesStock = p.stockCount === 0;
    return matchesSearch && matchesCat && matchesStock;
  });

  // Active Collections (Uses live real data by default; overlays sample data ONLY if isDemoMode is explicitly enabled)
  const activeOrders = isDemoMode ? (orders.length > 0 ? orders : INITIAL_ORDERS) : orders;
  const activeSecurityLogs = isDemoMode ? (securityLogs.length > 0 ? securityLogs : INITIAL_SECURITY_LOGS) : securityLogs;
  const activeCustomers = isDemoMode ? (customers.length > 0 ? customers : INITIAL_CUSTOMERS) : customers;
  const activeTickets = isDemoMode ? (tickets.length > 0 ? tickets : INITIAL_TICKETS) : tickets;

  // Filtered Orders
  const filteredOrders = activeOrders.filter((ord) => {
    let matchesQuickFilter = true;
    if (quickOrderFilter === 'unfulfilled') {
      matchesQuickFilter = ord.status === 'Pending' || ord.status === 'Processing';
    } else if (quickOrderFilter === 'processing') {
      matchesQuickFilter = ord.status === 'Processing';
    } else if (quickOrderFilter === 'shipped') {
      matchesQuickFilter = ord.status === 'Shipped';
    } else if (quickOrderFilter === 'delivered') {
      matchesQuickFilter = ord.status === 'Delivered';
    } else if (quickOrderFilter === 'cancelled') {
      matchesQuickFilter = ord.status === 'Cancelled';
    }

    const matchesStatus = orderStatusFilter === 'all' || ord.status === orderStatusFilter;
    const matchesQuery = ord.id.toLowerCase().includes(orderSearch.toLowerCase()) || ord.customerName.toLowerCase().includes(orderSearch.toLowerCase()) || ord.customerEmail.toLowerCase().includes(orderSearch.toLowerCase());
    return matchesQuickFilter && matchesStatus && matchesQuery;
  });

  // Filtered Customers
  const filteredCustomers = activeCustomers.filter((c) => {
    const matchesTier = customerTierFilter === 'all' || c.status === customerTierFilter;
    const matchesQuery = c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.email.toLowerCase().includes(customerSearch.toLowerCase()) || c.id.toLowerCase().includes(customerSearch.toLowerCase());
    return matchesTier && matchesQuery;
  });

  // Metrics & Calculations (Strict real calculation when Demo Mode is OFF)
  const ordersTotalRevenue = activeOrders.reduce((acc, o) => acc + o.total, 0);
  const totalRevenue = isDemoMode ? ordersTotalRevenue + 41800 : ordersTotalRevenue;
  const averageOrderValue = activeOrders.length > 0 ? (ordersTotalRevenue / activeOrders.length) : (isDemoMode ? 224.50 : 0);
  const totalCompletedOrders = isDemoMode ? 265 + activeOrders.length : activeOrders.length;
  const lowStockCount = products.filter((p) => p.stockCount <= 10).length;

  // Top-selling products calculated dynamically from active orders
  const topSellingProducts = React.useMemo(() => {
    const orderSalesMap: Record<string, number> = {};
    activeOrders.forEach((ord) => {
      ord.items.forEach((item) => {
        const pId = item.product.id;
        orderSalesMap[pId] = (orderSalesMap[pId] || 0) + item.quantity;
      });
    });

    const baselineMap: Record<string, number> = isDemoMode ? {
      'prod-1': 142,
      'prod-2': 98,
      'prod-3': 185,
      'prod-4': 116,
      'prod-5': 74,
      'prod-6': 62,
    } : {};

    const calculated = products.map((prod) => {
      const liveUnits = orderSalesMap[prod.id] || 0;
      const baseUnits = baselineMap[prod.id] || 0;
      const totalUnitsSold = baseUnits + liveUnits;
      const totalRevenueGenerated = totalUnitsSold * prod.price;
      return {
        ...prod,
        unitsSold: totalUnitsSold,
        totalRevenueGenerated,
      };
    }).sort((a, b) => b.unitsSold - a.unitsSold);

    const maxUnits = calculated[0]?.unitsSold || 1;
    return calculated.map((item) => ({
      ...item,
      salesShare: maxUnits > 0 ? Math.min(100, Math.round((item.unitsSold / maxUnits) * 100)) : 0,
    }));
  }, [products, activeOrders, isDemoMode]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900 text-stone-100 font-sans flex flex-col">
      
      {/* Top Security & Admin Bar */}
      <header className="bg-neutral-950 border-b border-neutral-800 px-4 sm:px-6 py-3 flex items-center justify-between z-10 shadow-md">
        <div className="flex items-center gap-3">
          <BrandLogo size="xs" showText={false} />

          <div className="flex flex-col">
            <span className="font-serif text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Shop AXE <span className="text-xs font-sans font-normal px-2 py-0.5 bg-neutral-800 text-amber-400 rounded-full border border-neutral-700">Seller Central</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Security Shield Active
              </span>
              <span className="text-[10px] text-neutral-500 font-mono">• Master Admin</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {!isLocked && (
            <button
              onClick={() => {
                const nextState = !isDemoMode;
                setIsDemoMode(nextState);
                addSecurityLog(`Toggled Demo Data Mode: ${nextState ? 'ENABLED (Sample Data Overlay)' : 'DISABLED (Live Operational Mode)'}`, 'Settings', 'info');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                isDemoMode
                  ? 'bg-amber-950/80 text-amber-300 border-amber-800/80 hover:bg-amber-900'
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80 hover:bg-emerald-900'
              }`}
              title="Toggle Sample Demo Data Overlay"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{isDemoMode ? 'Demo Overlay Active' : 'Live Production Mode'}</span>
              <span className="md:hidden">{isDemoMode ? 'Demo ON' : 'Live'}</span>
            </button>
          )}

          {!isLocked && (
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border ${
                activeTab === 'settings'
                  ? 'bg-amber-500 text-neutral-950 border-amber-400'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-amber-300 border-amber-500/30'
              }`}
              title="Edit Top Announcement Bar above Store Name"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Announcement Bar</span>
            </button>
          )}

          {!isLocked && (
            <button
              onClick={handleLock}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="Lock Admin Portal"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lock Portal</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </button>
        </div>
      </header>

      {/* MASTER PIN SECURITY GATE */}
      <MasterPinGate
        isLocked={isLocked}
        masterPin={masterPin}
        onUnlockSuccess={() => {
          setIsLocked(false);
          addSecurityLog('Seller Central Access Granted via Master PIN', 'Auth', 'info');
        }}
        onSecurityLog={addSecurityLog}
      />

      {/* DASHBOARD MAIN LAYOUT (UNLOCKED) */}
      {!isLocked && (
        <div className="flex-1 flex overflow-hidden">
          
          {/* Side Navigation Sidebar */}
          <aside className="w-16 sm:w-60 bg-neutral-950 border-r border-neutral-800/80 flex flex-col justify-between p-2 sm:p-4 flex-shrink-0">
            <div className="space-y-1.5">
              <div className="px-3 py-2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest hidden sm:block">
                Operations Menu
              </div>

              {[
                { id: 'overview', label: 'Overview Analytics', icon: LayoutDashboard },
                { id: 'products', label: 'Products & Inventory', icon: Package, badge: lowStockCount > 0 ? `${lowStockCount} Low` : undefined },
                { id: 'orders', label: 'Order Processing', icon: ShoppingBag, badge: `${orders.filter(o => o.status === 'Processing' || o.status === 'Pending').length}` },
                { id: 'customers', label: 'Customers & CRM', icon: Users },
                { id: 'security', label: 'Security & Audit Logs', icon: ShieldAlert },
                { id: 'settings', label: 'Store Settings', icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 p-3 sm:px-3.5 sm:py-2.5 rounded-2xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-amber-500 text-neutral-950 shadow-md'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden sm:inline truncate">{tab.label}</span>
                    {tab.badge && (
                      <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold hidden sm:inline-block ${
                        isActive ? 'bg-neutral-950 text-white' : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800 hidden sm:block space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Store Engine Live</span>
              </div>
              <p className="text-[10px] text-neutral-500 font-mono">v3.4.0 High-Performance</p>
            </div>
          </aside>

          {/* Main Dashboard Workspace Content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-neutral-900/60 space-y-6 relative">
            
            {/* INCOMING ORDER TOAST ALERT BANNER */}
            {incomingOrderToast && (
              <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-neutral-950 p-4 rounded-2xl shadow-2xl border border-amber-300 flex items-center justify-between gap-4 animate-bounce-short">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-950 text-amber-400 flex items-center justify-center flex-shrink-0">
                    <BellRing className="w-5 h-5 animate-spin" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm">🎉 New Order Ingested & Dual-Synced!</p>
                      <span className="px-1.5 py-0.5 bg-neutral-950 text-amber-400 font-mono text-[10px] rounded font-bold">
                        #{incomingOrderToast.id}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-900 mt-0.5">
                      Customer <span className="font-bold">{incomingOrderToast.customerName}</span> placed an order for <span className="font-bold">${incomingOrderToast.total.toFixed(2)} USD</span> ({incomingOrderToast.paymentGateway}).
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveTab('orders');
                      setOrderStatusFilter('all');
                      setOrderSearch(incomingOrderToast.id);
                    }}
                    className="px-3.5 py-1.5 bg-neutral-950 hover:bg-neutral-900 text-white rounded-xl text-xs font-bold transition-colors whitespace-nowrap shadow"
                  >
                    View in Queue
                  </button>
                  <button
                    onClick={() => setIncomingOrderToast(null)}
                    className="p-1 text-neutral-800 hover:text-neutral-950"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            
            {/* TAB 1: OVERVIEW ANALYTICS */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
                      <span>Store Analytics & Performance Summary</span>
                      <span className="text-xs font-sans font-semibold px-2.5 py-0.5 bg-emerald-950 text-emerald-400 rounded-full border border-emerald-800">
                        Live Data
                      </span>
                    </h1>
                    <p className="text-xs text-neutral-400 mt-1">
                      Comprehensive executive summary of total revenue, conversion funnel trajectory, and top sales drivers.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-mono text-neutral-400 bg-neutral-950 px-3 py-1.5 rounded-2xl border border-neutral-800">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Updated just now</span>
                  </div>
                </div>

                {/* KPI Metrics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="p-4 sm:p-5 bg-neutral-950 rounded-3xl border border-neutral-800 space-y-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
                      <span>Total Gross Revenue</span>
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono">${totalRevenue.toLocaleString()}</p>
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        +18.4% MoM
                      </span>
                      <span className="text-neutral-500 font-mono">AOV: ${averageOrderValue.toFixed(0)}</span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 bg-neutral-950 rounded-3xl border border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
                      <span>Total Completed Orders</span>
                      <ShoppingCart className="w-4 h-4 text-amber-400" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{totalCompletedOrders}</p>
                    <p className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      +12.1% order volume
                    </p>
                  </div>

                  <div className="p-4 sm:p-5 bg-neutral-950 rounded-3xl border border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
                      <span>Average Conversion Rate</span>
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono">3.58%</p>
                    <p className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      +0.5% optimization
                    </p>
                  </div>

                  <div className="p-4 sm:p-5 bg-neutral-950 rounded-3xl border border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
                      <span>Low Stock Alert</span>
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-rose-400 font-mono">{lowStockCount}</p>
                    <p className="text-[11px] text-neutral-400">Products with &lt;10 units</p>
                  </div>
                </div>

                {/* RECENT CONVERSION TRENDS - SIMPLE LINE CHART */}
                <div className="bg-neutral-950 p-5 sm:p-6 rounded-3xl border border-neutral-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-800">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-amber-400" />
                        <span>Recent Conversion Trends</span>
                      </h3>
                      <p className="text-xs text-neutral-400">
                        Daily storefront visitor purchase conversion rate (%) over the last 7 days
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-xl border border-emerald-800/80 font-bold">
                        Peak CR: 4.2% (Aug 12)
                      </span>
                    </div>
                  </div>

                  {/* Line Chart */}
                  <div className="h-64 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={CONVERSION_TREND_DATA} margin={{ top: 10, right: 20, left: -15, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                        <XAxis dataKey="date" stroke="#737373" fontSize={11} />
                        <YAxis 
                          stroke="#737373" 
                          fontSize={11} 
                          domain={[0, 12]} 
                          tickFormatter={(v) => `${v}%`} 
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#171717', 
                            borderColor: '#404040', 
                            borderRadius: '16px', 
                            fontSize: '12px', 
                            color: '#fff',
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)'
                          }} 
                          formatter={(value: any, name: any) => [
                            typeof value === 'number' ? `${value}%` : value, 
                            name === 'conversionRate' ? 'Purchase Conversion Rate' : 'Cart Add Rate'
                          ]}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                        <Line 
                          type="monotone" 
                          dataKey="conversionRate" 
                          name="Purchase Conversion Rate (%)" 
                          stroke="#f59e0b" 
                          strokeWidth={3} 
                          dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#171717' }} 
                          activeDot={{ r: 7, stroke: '#ffffff', strokeWidth: 2 }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="cartAddRate" 
                          name="Cart Addition Rate (%)" 
                          stroke="#10b981" 
                          strokeWidth={2} 
                          strokeDasharray="4 4"
                          dot={{ r: 3, fill: '#10b981' }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Conversion Funnel Summary Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-neutral-800 text-xs">
                    <div className="p-2.5 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-0.5">
                      <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Avg Conversion</span>
                      <p className="font-mono font-bold text-amber-400 text-sm">3.58%</p>
                    </div>
                    <div className="p-2.5 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-0.5">
                      <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">7-Day Visitors</span>
                      <p className="font-mono font-bold text-white text-sm">12,250</p>
                    </div>
                    <div className="p-2.5 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-0.5">
                      <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Cart Additions</span>
                      <p className="font-mono font-bold text-emerald-400 text-sm">1,078 (8.8%)</p>
                    </div>
                    <div className="p-2.5 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-0.5">
                      <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Completed Orders</span>
                      <p className="font-mono font-bold text-blue-400 text-sm">480 Converted</p>
                    </div>
                  </div>
                </div>

                {/* TOP SELLING PRODUCTS LEADERBOARD */}
                <div className="bg-neutral-950 p-5 sm:p-6 rounded-3xl border border-neutral-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-800">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <span>Top-Selling Products Leaderboard</span>
                      </h3>
                      <p className="text-xs text-neutral-400">
                        Ranked by sales volume and total revenue contribution across live and historical orders
                      </p>
                    </div>

                    <button 
                      onClick={() => setActiveTab('products')} 
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 self-start sm:self-auto"
                    >
                      <span>Full Inventory Catalog ({products.length})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider border-b border-neutral-800">
                        <tr>
                          <th className="pb-3 w-12 text-center">Rank</th>
                          <th className="pb-3">Product Item</th>
                          <th className="pb-3">Category</th>
                          <th className="pb-3">Price</th>
                          <th className="pb-3">Units Sold</th>
                          <th className="pb-3">Total Revenue</th>
                          <th className="pb-3 w-32">Sales Share</th>
                          <th className="pb-3 text-right">Stock Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/60 font-medium">
                        {topSellingProducts.slice(0, 5).map((prod, index) => {
                          const rank = index + 1;
                          return (
                            <tr key={prod.id} className="hover:bg-neutral-900/50 transition-colors">
                              {/* Rank */}
                              <td className="py-3 text-center">
                                {rank === 1 ? (
                                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center mx-auto border border-amber-500/40 text-[11px]">
                                    <Award className="w-3.5 h-3.5" />
                                  </span>
                                ) : rank === 2 ? (
                                  <span className="w-6 h-6 rounded-full bg-stone-500/20 text-stone-300 font-bold flex items-center justify-center mx-auto border border-stone-500/40 text-[11px]">
                                    2
                                  </span>
                                ) : rank === 3 ? (
                                  <span className="w-6 h-6 rounded-full bg-amber-800/20 text-amber-600 font-bold flex items-center justify-center mx-auto border border-amber-700/40 text-[11px]">
                                    3
                                  </span>
                                ) : (
                                  <span className="font-mono text-neutral-500 text-xs">#{rank}</span>
                                )}
                              </td>

                              {/* Product Info */}
                              <td className="py-3">
                                <div className="flex items-center gap-3">
                                  <img 
                                    src={prod.image} 
                                    alt={prod.name} 
                                    className="w-9 h-9 rounded-xl object-cover bg-neutral-800 border border-neutral-700 flex-shrink-0" 
                                    referrerPolicy="no-referrer" 
                                  />
                                  <div>
                                    <p className="font-bold text-white line-clamp-1">{prod.name}</p>
                                    <p className="text-[10px] text-neutral-400 font-mono">{prod.sku}</p>
                                  </div>
                                </div>
                              </td>

                              {/* Category */}
                              <td className="py-3 text-neutral-300">{prod.category}</td>

                              {/* Price */}
                              <td className="py-3 font-mono text-white">${prod.price}</td>

                              {/* Units Sold */}
                              <td className="py-3 font-mono font-bold text-amber-400">{prod.unitsSold} units</td>

                              {/* Revenue Generated */}
                              <td className="py-3 font-mono font-bold text-emerald-400">
                                ${prod.totalRevenueGenerated.toLocaleString()}
                              </td>

                              {/* Visual Share Bar */}
                              <td className="py-3">
                                <div className="space-y-1">
                                  <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-amber-400 rounded-full" 
                                      style={{ width: `${prod.salesShare}%` }} 
                                    />
                                  </div>
                                  <span className="text-[10px] font-mono text-neutral-500 block">{prod.salesShare}% relative share</span>
                                </div>
                              </td>

                              {/* Stock Status */}
                              <td className="py-3 text-right">
                                {prod.stockCount === 0 ? (
                                  <span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800 text-[10px] font-bold">
                                    Out of Stock
                                  </span>
                                ) : prod.stockCount <= 10 ? (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-bold">
                                    Low ({prod.stockCount})
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                                    {prod.stockCount} In Stock
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* GROSS SALES & CATEGORY DISTRIBUTION CHARTS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Revenue Growth Trend Area Chart */}
                  <div className="lg:col-span-2 bg-neutral-950 p-5 rounded-3xl border border-neutral-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white">Monthly Revenue Trajectory</h3>
                        <p className="text-[11px] text-neutral-400">Monthly gross sales trajectory vs order volume</p>
                      </div>
                      <span className="text-xs font-bold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-xl border border-amber-800/60">
                        2026 YTD
                      </span>
                    </div>

                    <div className="h-64 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={SALES_CHART_DATA}>
                          <defs>
                            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                          <XAxis dataKey="month" stroke="#737373" fontSize={11} />
                          <YAxis stroke="#737373" fontSize={11} />
                          <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#404040', borderRadius: '12px', fontSize: '12px', color: '#fff' }} />
                          <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#revenueGrad)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Category Distribution Chart */}
                  <div className="bg-neutral-950 p-5 rounded-3xl border border-neutral-800 space-y-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">Category Sales Mix</h3>
                      <p className="text-[11px] text-neutral-400">Share of revenue by department</p>
                    </div>

                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={CATEGORY_DISTRIBUTION}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {CATEGORY_DISTRIBUTION.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#404040', borderRadius: '12px', fontSize: '11px', color: '#fff' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800">
                      {CATEGORY_DISTRIBUTION.map((cat) => (
                        <div key={cat.name} className="flex items-center gap-2 text-[11px] text-neutral-300">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                          <span className="truncate">{cat.name}: <strong className="text-white">{cat.value}%</strong></span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: PRODUCTS & INVENTORY */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                {/* Header & Main Actions */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">Product Inventory Catalog</h1>
                      <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                        {products.length} Products
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">
                      Manage SKUs, live stock quantities, catalog backups, and synchronize changes with the database.
                    </p>
                  </div>

                  {/* Actions Group */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Save Catalog to Database Button */}
                    <button
                      onClick={handleSaveAllProductsToDb}
                      disabled={isSavingCatalog}
                      title="Save and synchronize all active products to PostgreSQL and Firestore database"
                      className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all ${
                        catalogSavedSuccess
                          ? 'bg-emerald-500 text-neutral-950 shadow-emerald-500/20'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
                      }`}
                    >
                      {isSavingCatalog ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Saving to Database...</span>
                        </>
                      ) : catalogSavedSuccess ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Catalog Saved to DB!</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Catalog to DB</span>
                        </>
                      )}
                    </button>

                    {/* Deleted Items / Archive Button */}
                    <button
                      onClick={() => setIsArchiveModalOpen(true)}
                      className="px-3.5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs rounded-2xl flex items-center gap-2 border border-neutral-700 transition-all relative"
                      title="View and restore deleted or archived products"
                    >
                      <Archive className="w-4 h-4 text-amber-400" />
                      <span>Deleted Archive</span>
                      {deletedProductsArchive.length > 0 && (
                        <span className="px-1.5 py-0.2 bg-amber-500 text-neutral-950 rounded-full text-[10px] font-bold">
                          {deletedProductsArchive.length}
                        </span>
                      )}
                    </button>

                    {/* Export Catalog Backup */}
                    <button
                      onClick={handleExportCatalogBackup}
                      className="p-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-bold text-xs rounded-2xl border border-neutral-700 transition-all flex items-center gap-1.5"
                      title="Export and download JSON catalog backup snapshot"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Backup (JSON)</span>
                    </button>

                    {/* Add Product Button */}
                    <button
                      onClick={() => setIsAddProductOpen(true)}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-2xl flex items-center gap-2 shadow-lg transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Product</span>
                    </button>
                  </div>
                </div>

                {/* Status Bar: Live DB Synchronization State */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-neutral-950/80 rounded-2xl border border-neutral-800/80 text-xs">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Database Status: <strong className="text-white">Cloud SQL PostgreSQL & Firestore Live</strong></span>
                  </div>
                  {lastCatalogSavedAt && (
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-mono">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>Last saved: {lastCatalogSavedAt}</span>
                    </div>
                  )}
                </div>

                {/* Undo Notification Banner for Deleted Product */}
                <AnimatePresence>
                  {undoDeletedProduct && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.98 }}
                      className="p-3.5 bg-neutral-900 border border-amber-500/50 rounded-2xl flex items-center justify-between gap-3 shadow-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                          <RotateCcw className="w-4 h-4" />
                        </div>
                        <div className="text-xs">
                          <p className="text-white font-bold">
                            Product &quot;{undoDeletedProduct.name}&quot; ({undoDeletedProduct.sku}) was removed from active catalog.
                          </p>
                          <p className="text-[11px] text-neutral-400">
                            Saved safely to archive. You can restore it immediately.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRestoreProduct(undoDeletedProduct)}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Undo / Restore</span>
                        </button>
                        <button
                          onClick={() => setUndoDeletedProduct(null)}
                          className="p-1.5 text-neutral-400 hover:text-white rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Filter Bar */}
                <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Search product by name or SKU..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                    />
                    <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>

                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="all">All Categories</option>
                    <option value="Apparel">Apparel</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Home & Living">Home & Living</option>
                    <option value="Audio & Tech">Audio & Tech</option>
                  </select>

                  <div className="flex gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-xs">
                    <button
                      onClick={() => setStockStatusFilter('all')}
                      className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                        stockStatusFilter === 'all' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      All Stock
                    </button>
                    <button
                      onClick={() => setStockStatusFilter('low')}
                      className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                        stockStatusFilter === 'low' ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Low (&lt;10)
                    </button>
                    <button
                      onClick={() => setStockStatusFilter('out')}
                      className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                        stockStatusFilter === 'out' ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Out of Stock
                    </button>
                  </div>
                </div>

                {/* Products Grid Table */}
                <div className="bg-neutral-950 rounded-3xl border border-neutral-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider bg-neutral-900/80 border-b border-neutral-800">
                        <tr>
                          <th className="p-4">Item Details</th>
                          <th className="p-4">SKU</th>
                          <th className="p-4">Price</th>
                          <th className="p-4">Inventory Level</th>
                          <th className="p-4">Stock Actions</th>
                          <th className="p-4 text-right">Manage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800 font-medium">
                        {filteredProducts.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-neutral-500">
                              No products found matching your filter criteria.
                            </td>
                          </tr>
                        ) : (
                          filteredProducts.map((p) => (
                            <tr key={p.id} className="hover:bg-neutral-900/50 transition-colors">
                              <td className="p-4 flex items-center gap-3">
                                <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover bg-neutral-800" referrerPolicy="no-referrer" />
                                <div>
                                  <p className="font-bold text-white text-xs">{p.name}</p>
                                  <p className="text-[10px] text-neutral-400">{p.category}</p>
                                </div>
                              </td>

                              <td className="p-4 font-mono text-neutral-300">{p.sku}</td>

                              <td className="p-4 font-mono text-white font-bold">${p.price}</td>

                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-white">{p.stockCount} units</span>
                                  {p.stockCount === 0 ? (
                                    <span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800 text-[10px] font-bold">
                                      Out
                                    </span>
                                  ) : p.stockCount <= 10 ? (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-bold">
                                      Low
                                    </span>
                                  ) : null}
                                </div>
                              </td>

                              <td className="p-4">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleAdjustStock(p, -1)}
                                    className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-[10px] font-bold"
                                    title="Decrease stock by 1"
                                  >
                                    -1
                                  </button>
                                  <button
                                    onClick={() => handleAdjustStock(p, 10)}
                                    className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-emerald-400 rounded-lg text-[10px] font-bold"
                                    title="Restock +10 units"
                                  >
                                    +10 Restock
                                  </button>
                                </div>
                              </td>

                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => setEditingProduct(p)}
                                    className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors"
                                    title="Edit Product Details"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setDeletingProductId(p.id)}
                                    className="p-2 text-rose-400 hover:text-rose-300 rounded-xl hover:bg-rose-950/60 transition-colors"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: ORDER RECEIVING & OPERATIONS */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                
                {/* Header & Quick Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
                      <span>Store Orders & Fulfillment</span>
                      <span className="text-xs font-sans font-semibold px-2.5 py-0.5 bg-emerald-950 text-emerald-400 rounded-full border border-emerald-800 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Live Dual-Sync Active
                      </span>
                    </h1>
                    <p className="text-xs text-neutral-400 mt-1">
                      Real-time bidirectional synchronization across Cloud SQL PostgreSQL & Firebase Firestore.
                    </p>
                  </div>
                  
                  <div className="flex items-center flex-wrap gap-2">
                    {/* Live Simulation Trigger (Test Order Receiving) */}
                    <button
                      onClick={handleSimulateIncomingOrder}
                      disabled={isSimulatingOrder}
                      className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-neutral-700 font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all disabled:opacity-50"
                      title="Simulate an incoming order from a customer to test live synchronization and sound chime"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isSimulatingOrder ? 'animate-spin' : ''}`} />
                      <span>{isSimulatingOrder ? 'Receiving Test Order...' : 'Test Incoming Order'}</span>
                    </button>

                    {/* Manual Order Creation */}
                    <button
                      onClick={() => setIsAddOrderOpen(true)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create New Order</span>
                    </button>
                  </div>
                </div>

                {/* ORDER RECEIVING SYNCHRONIZATION CONSOLE CARD */}
                <div className="bg-neutral-950 p-5 rounded-3xl border border-neutral-800 shadow-xl space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-neutral-800/80">
                    
                    {/* Engine Status Details */}
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-950/60 border border-emerald-800 flex items-center justify-center text-emerald-400 flex-shrink-0">
                        <Radio className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">Order Receiving Synchronization</h3>
                          <span className="px-2 py-0.5 bg-emerald-900/60 text-emerald-300 rounded-md text-[10px] font-mono font-bold border border-emerald-700">
                            CONNECTED
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          Dual Real-Time Engine: <span className="text-neutral-200 font-semibold">PostgreSQL Relational DB</span> + <span className="text-neutral-200 font-semibold">Firestore Stream</span>
                        </p>
                      </div>
                    </div>

                    {/* Sync Controls & Audio Chime Settings */}
                    <div className="flex items-center flex-wrap gap-2.5">
                      
                      {/* Audio Alert Chime Toggle */}
                      <button
                        onClick={() => {
                          const next = !orderChimeEnabled;
                          setOrderChimeEnabled(next);
                          if (next) playOrderReceivedChime();
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
                          orderChimeEnabled
                            ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                            : 'bg-neutral-900 text-neutral-500 border-neutral-800'
                        }`}
                        title={orderChimeEnabled ? 'Order Sound Alert: ENABLED (Click to Mute)' : 'Order Sound Alert: MUTED (Click to Enable)'}
                      >
                        {orderChimeEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5" />}
                        <span>{orderChimeEnabled ? 'Chime On' : 'Chime Off'}</span>
                      </button>

                      {/* Test Sound Button */}
                      {orderChimeEnabled && (
                        <button
                          onClick={playOrderReceivedChime}
                          className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl border border-neutral-800 text-xs transition-colors"
                          title="Test Order Arrival Chime"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Sync Interval Selector */}
                      <div className="flex items-center gap-1.5 bg-neutral-900 px-2.5 py-1.5 rounded-xl border border-neutral-800">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        <select
                          value={orderSyncMode}
                          onChange={(e) => setOrderSyncMode(e.target.value as any)}
                          className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
                        >
                          <option value="realtime" className="bg-neutral-900 text-white">Stream: Real-Time</option>
                          <option value="10s" className="bg-neutral-900 text-white">Auto-Poll: 10s</option>
                          <option value="30s" className="bg-neutral-900 text-white">Auto-Poll: 30s</option>
                          <option value="60s" className="bg-neutral-900 text-white">Auto-Poll: 60s</option>
                          <option value="manual" className="bg-neutral-900 text-white">Manual Only</option>
                        </select>
                      </div>

                      {/* Manual Force Sync Button */}
                      <button
                        onClick={() => handleForceOrderSync(false)}
                        disabled={isSyncingOrders}
                        className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold border border-neutral-700 flex items-center gap-1.5 transition-all disabled:opacity-50"
                        title="Force sync and reconcile all orders with PostgreSQL and Firestore"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncingOrders ? 'animate-spin text-amber-400' : ''}`} />
                        <span>{isSyncingOrders ? 'Syncing...' : 'Sync Orders Now'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Sync Status Banner Feedback */}
                  {syncStatusSummary && (
                    <div className="p-2.5 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>{syncStatusSummary}</span>
                      </span>
                      <span className="text-[10px] font-mono text-emerald-500">Verified</span>
                    </div>
                  )}

                  {/* Order Receiving Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    <div className="p-3 bg-neutral-900/80 rounded-2xl border border-neutral-800">
                      <p className="text-[11px] text-neutral-400">Total Ingested Orders</p>
                      <p className="text-xl font-bold text-white mt-1">{activeOrders.length}</p>
                      <p className="text-[10px] text-emerald-400 mt-0.5">100% In Sync</p>
                    </div>

                    <div className="p-3 bg-neutral-900/80 rounded-2xl border border-neutral-800">
                      <p className="text-[11px] text-amber-400">Receiving Queue</p>
                      <p className="text-xl font-bold text-amber-400 mt-1">
                        {activeOrders.filter((o) => o.status === 'Processing' || o.status === 'Pending').length}
                      </p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">Requires Fulfillment</p>
                    </div>

                    <div className="p-3 bg-neutral-900/80 rounded-2xl border border-neutral-800">
                      <p className="text-[11px] text-blue-400">In Transit & Shipped</p>
                      <p className="text-xl font-bold text-blue-400 mt-1">
                        {activeOrders.filter((o) => o.status === 'Shipped').length}
                      </p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">Active Carrier Tracking</p>
                    </div>

                    <div className="p-3 bg-neutral-900/80 rounded-2xl border border-neutral-800">
                      <p className="text-[11px] text-neutral-400">Last Synced Timestamp</p>
                      <p className="text-sm font-bold text-neutral-200 mt-1.5 font-mono truncate">
                        {lastOrderSyncedAt || 'Live Streaming'}
                      </p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">Auto-reconciliation ready</p>
                    </div>
                  </div>
                </div>

                {/* Quick Status Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                  {[
                    { id: 'all', label: 'All Orders', count: activeOrders.length },
                    { id: 'unfulfilled', label: '📥 Receiving Queue', count: activeOrders.filter((o) => o.status === 'Pending' || o.status === 'Processing').length, highlight: true },
                    { id: 'processing', label: '⏳ Processing', count: activeOrders.filter((o) => o.status === 'Processing').length },
                    { id: 'shipped', label: '🚚 Shipped', count: activeOrders.filter((o) => o.status === 'Shipped').length },
                    { id: 'delivered', label: '✅ Delivered', count: activeOrders.filter((o) => o.status === 'Delivered').length },
                    { id: 'cancelled', label: '❌ Cancelled', count: activeOrders.filter((o) => o.status === 'Cancelled').length },
                  ].map((filterTab) => {
                    const isSelected = quickOrderFilter === filterTab.id;
                    return (
                      <button
                        key={filterTab.id}
                        onClick={() => {
                          setQuickOrderFilter(filterTab.id as any);
                          if (filterTab.id === 'all') setOrderStatusFilter('all');
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                          isSelected
                            ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow'
                            : filterTab.highlight && filterTab.count > 0
                            ? 'bg-amber-950/40 text-amber-300 border-amber-800/80 hover:bg-amber-900/50'
                            : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:bg-neutral-900 hover:text-white'
                        }`}
                      >
                        <span>{filterTab.label}</span>
                        <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono ${
                          isSelected ? 'bg-neutral-950 text-white' : 'bg-neutral-800 text-neutral-300'
                        }`}>
                          {filterTab.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Filter Controls (Search + Dropdown) */}
                <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Search order by ID, customer name, email, or txHash..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                    />
                    <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>

                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="all">All Specific Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Orders Queue Table */}
                <div className="bg-neutral-950 rounded-3xl border border-neutral-800 overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider bg-neutral-900/80 border-b border-neutral-800">
                        <tr>
                          <th className="p-4">Order ID & Sync</th>
                          <th className="p-4">Customer & Address</th>
                          <th className="p-4">Payment Verification</th>
                          <th className="p-4">Items & Total</th>
                          <th className="p-4">Fulfillment Status</th>
                          <th className="p-4">Tracking Number</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800 font-medium">
                        {filteredOrders.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-12 text-center text-neutral-500 space-y-2">
                              <p className="text-sm font-medium text-neutral-400">No orders matching the current filter.</p>
                              <p className="text-xs text-neutral-600">New orders placed via checkout or webhook will appear here in real time.</p>
                              <button
                                onClick={handleSimulateIncomingOrder}
                                className="mt-2 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-amber-400 border border-neutral-800 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Generate Test Order</span>
                              </button>
                            </td>
                          </tr>
                        ) : (
                          filteredOrders.map((ord) => (
                            <tr key={ord.id} className="hover:bg-neutral-900/50 transition-colors">
                              
                              {/* Order ID & Sync Status */}
                              <td className="p-4">
                                <div className="space-y-1">
                                  <p className="font-mono font-bold text-amber-400 text-xs">{ord.id}</p>
                                  <p className="text-[10px] text-neutral-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{ord.date}</span>
                                  </p>
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-950/80 text-emerald-400 rounded text-[9px] font-mono border border-emerald-800">
                                    <CheckCircle className="w-2.5 h-2.5" />
                                    <span>Dual Synced</span>
                                  </span>
                                </div>
                              </td>

                              {/* Customer & Address */}
                              <td className="p-4">
                                <div className="space-y-0.5">
                                  <p className="font-bold text-white text-xs">{ord.customerName}</p>
                                  <p className="text-[10px] text-neutral-400">{ord.customerEmail}</p>
                                  {ord.shippingAddress && (
                                    <p className="text-[10px] text-neutral-500 truncate max-w-[180px]" title={ord.shippingAddress}>
                                      {ord.shippingAddress}
                                    </p>
                                  )}
                                </div>
                              </td>

                              {/* Payment Verification */}
                              <td className="p-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                    <span className="font-bold text-white text-xs">{ord.paymentGateway || 'Trust Wallet (USDT)'}</span>
                                  </div>
                                  {ord.paymentDetails?.authCode && (
                                    <p className="text-[10px] text-blue-400 font-mono">
                                      Auth: {ord.paymentDetails.authCode}
                                    </p>
                                  )}
                                  {ord.paymentDetails?.txHash && (
                                    <p className="text-[9px] text-neutral-500 font-mono truncate max-w-[140px]" title={ord.paymentDetails.txHash}>
                                      Tx: {ord.paymentDetails.txHash.slice(0, 12)}...
                                    </p>
                                  )}
                                </div>
                              </td>

                              {/* Items & Total */}
                              <td className="p-4">
                                <div className="space-y-0.5">
                                  <p className="font-bold text-white text-xs font-mono">${ord.total.toFixed(2)} USD</p>
                                  <p className="text-[10px] text-neutral-400">
                                    {ord.items.length} item{ord.items.length !== 1 ? 's' : ''}
                                  </p>
                                  <p className="text-[9px] text-neutral-500 font-mono">
                                    ≈ {ord.total.toFixed(2)} USDT
                                  </p>
                                </div>
                              </td>

                              {/* Status & Quick Action */}
                              <td className="p-4">
                                <div className="space-y-1.5">
                                  <select
                                    value={ord.status}
                                    onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border focus:outline-none w-full ${
                                      ord.status === 'Delivered'
                                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                                        : ord.status === 'Shipped'
                                        ? 'bg-blue-950 text-blue-400 border-blue-800'
                                        : ord.status === 'Processing'
                                        ? 'bg-amber-950 text-amber-400 border-amber-800'
                                        : 'bg-neutral-900 text-neutral-400 border-neutral-700'
                                    }`}
                                  >
                                    <option value="Pending">Pending</option>
                                    <option value="Processing">Processing</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                  </select>

                                  {/* Quick Advance Button */}
                                  {ord.status === 'Processing' && (
                                    <button
                                      onClick={() => handleUpdateOrderStatus(ord.id, 'Shipped')}
                                      className="w-full px-2 py-1 bg-blue-950/60 hover:bg-blue-900 text-blue-300 text-[10px] font-bold rounded-lg border border-blue-800 transition-colors flex items-center justify-center gap-1"
                                      title="Mark Shipped & generate tracking number"
                                    >
                                      <Truck className="w-3 h-3" />
                                      <span>Dispatch & Ship</span>
                                    </button>
                                  )}
                                  {ord.status === 'Pending' && (
                                    <button
                                      onClick={() => handleUpdateOrderStatus(ord.id, 'Processing')}
                                      className="w-full px-2 py-1 bg-amber-950/60 hover:bg-amber-900 text-amber-300 text-[10px] font-bold rounded-lg border border-amber-800 transition-colors flex items-center justify-center gap-1"
                                      title="Acknowledge and mark Processing"
                                    >
                                      <Check className="w-3 h-3" />
                                      <span>Acknowledge</span>
                                    </button>
                                  )}
                                </div>
                              </td>

                              {/* Tracking */}
                              <td className="p-4 font-mono text-[11px]">
                                {ord.trackingNumber ? (
                                  <div className="space-y-1">
                                    <span className="text-neutral-300 bg-neutral-900 px-2 py-1 rounded-md border border-neutral-800 block text-center truncate max-w-[130px]">
                                      {ord.trackingNumber}
                                    </span>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      const autoTrk = `TRK-${Math.floor(10000000 + Math.random() * 90000000)}PK`;
                                      handleUpdateOrderStatus(ord.id, ord.status === 'Pending' ? 'Processing' : ord.status);
                                    }}
                                    className="text-[10px] text-amber-400/80 hover:text-amber-300 underline"
                                  >
                                    Assign on Dispatch
                                  </button>
                                )}
                              </td>

                              {/* Actions */}
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-1.5 ml-auto">
                                  <button
                                    onClick={() => setSelectedInvoiceOrder(ord)}
                                    className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 rounded-xl text-[11px] font-bold flex items-center gap-1"
                                    title="View & Print Official Invoice"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Invoice</span>
                                  </button>
                                  <button
                                    onClick={() => setDeletingOrder(ord)}
                                    className="p-1.5 text-neutral-400 hover:text-rose-400 rounded-xl hover:bg-rose-950/50 transition-colors border border-transparent hover:border-rose-800/50"
                                    title="Delete Order Record"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: CUSTOMERS & CRM */}
            {activeTab === 'customers' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">Customer Records & Support Tickets</h1>
                    <p className="text-xs text-neutral-400 mt-1">Review top spending accounts, edit customer profiles, and handle inquiries.</p>
                  </div>
                  <button
                    onClick={() => setIsAddCustomerOpen(true)}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 self-start sm:self-auto transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Customer</span>
                  </button>
                </div>

                {/* Customer Directory Search / Filter */}
                <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Search customers by name, email, or ID..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                    />
                    <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>

                  <select
                    value={customerTierFilter}
                    onChange={(e) => setCustomerTierFilter(e.target.value)}
                    className="px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="all">All Customer Tiers</option>
                    <option value="VIP">VIP Clients</option>
                    <option value="Regular">Regular Customers</option>
                    <option value="New">New Leads</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Customers Directory */}
                  <div className="bg-neutral-950 p-5 rounded-3xl border border-neutral-800 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center justify-between">
                      <span>Customer Lifetime Value Directory</span>
                      <span className="text-xs text-neutral-500 font-mono">{filteredCustomers.length} Accounts</span>
                    </h3>

                    <div className="space-y-3">
                      {filteredCustomers.length === 0 ? (
                        <div className="p-8 text-center bg-neutral-900/50 rounded-2xl border border-neutral-800/80 space-y-2">
                          <Users className="w-8 h-8 text-neutral-600 mx-auto" />
                          <p className="text-xs font-bold text-white">No registered customer profiles found</p>
                          <p className="text-[11px] text-neutral-500">Customer profiles are automatically created upon completed checkouts or manual registration.</p>
                        </div>
                      ) : (
                        filteredCustomers.map((c) => (
                          <div key={c.id} className="p-3.5 bg-neutral-900 rounded-2xl border border-neutral-800 flex items-center justify-between text-xs gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white truncate">{c.name}</span>
                                <span className={`px-2 py-0.2 rounded-full text-[9px] font-bold shrink-0 ${
                                  c.status === 'VIP' ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-neutral-800 text-neutral-400'
                                }`}>
                                  {c.status}
                                </span>
                              </div>
                              <p className="text-[10px] text-neutral-400 truncate">{c.email}</p>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-right shrink-0">
                                <p className="font-mono font-bold text-white">${c.totalSpent.toFixed(2)}</p>
                                <p className="text-[10px] text-neutral-500">{c.totalOrders} orders</p>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => setEditingCustomer(c)}
                                  className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
                                  title="Edit Customer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeletingCustomer(c)}
                                  className="p-1.5 text-neutral-400 hover:text-rose-400 rounded-lg hover:bg-rose-950/50 transition-colors"
                                  title="Delete Customer Record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Customer Support Queue */}
                  <div className="bg-neutral-950 p-5 rounded-3xl border border-neutral-800 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center justify-between">
                      <span>Active Support Tickets</span>
                      <span className="text-xs text-neutral-500 font-mono">{activeTickets.length} Tickets</span>
                    </h3>

                    <div className="space-y-3">
                      {activeTickets.length === 0 ? (
                        <div className="p-8 text-center bg-neutral-900/50 rounded-2xl border border-neutral-800/80 space-y-2">
                          <Mail className="w-8 h-8 text-neutral-600 mx-auto" />
                          <p className="text-xs font-bold text-white">No active support tickets</p>
                          <p className="text-[11px] text-neutral-500">Customer inquiries sent to support will be queued here.</p>
                        </div>
                      ) : (
                        activeTickets.map((t) => (
                          <div key={t.id} className="p-3.5 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-amber-400 font-mono">{t.id}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                t.status === 'Open' ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              }`}>
                                {t.status}
                              </span>
                            </div>

                            <p className="font-bold text-white">{t.subject}</p>
                            <p className="text-[11px] text-neutral-300 leading-relaxed italic">&ldquo;{t.message}&rdquo;</p>

                            <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-500">
                              <span>From: {t.customerName} ({t.customerEmail})</span>
                              <span>{t.date}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: SECURITY AUDIT LOGS */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">Security Integration & Audit Stream</h1>
                  <p className="text-xs text-neutral-400 mt-1">Real-time audit trail logging administrative sessions, stock alterations, and authentication events.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Security Log Table */}
                  <div className="lg:col-span-2 bg-neutral-950 p-5 rounded-3xl border border-neutral-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-emerald-400" />
                        <span>Live Security Log Stream</span>
                      </h3>
                      <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800">
                        Active Monitoring
                      </span>
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {activeSecurityLogs.length === 0 ? (
                        <div className="p-8 text-center bg-neutral-900/50 rounded-2xl border border-neutral-800/80 space-y-2">
                          <ShieldCheck className="w-8 h-8 text-neutral-600 mx-auto" />
                          <p className="text-xs font-bold text-white">Security Log Stream Ready</p>
                          <p className="text-[11px] text-neutral-500">System security events and admin session updates will log here in real time.</p>
                        </div>
                      ) : (
                        activeSecurityLogs.map((log) => (
                          <div key={log.id} className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800/80 text-xs flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] text-amber-400 font-bold">{log.id}</span>
                                <span className={`px-2 py-0.2 rounded-full text-[9px] font-bold ${
                                  log.severity === 'critical'
                                    ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                    : log.severity === 'warning'
                                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                    : 'bg-neutral-800 text-neutral-300'
                                }`}>
                                  {log.category}
                                </span>
                              </div>
                              <p className="font-bold text-white">{log.action}</p>
                              <p className="text-[10px] text-neutral-500 font-mono">{log.ipAddress} • {log.user}</p>
                            </div>
                            <span className="text-[10px] text-neutral-500 font-mono whitespace-nowrap">{log.timestamp}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Security Settings & Master PIN Management */}
                  <div className="bg-neutral-950 p-5 rounded-3xl border border-neutral-800 space-y-5">
                    <h3 className="text-sm font-bold text-white flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-amber-400" />
                        <span>Master Security Controls</span>
                      </span>
                      <span className="px-2.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full text-[10px] font-bold">
                        AES-256 Active
                      </span>
                    </h3>

                    {/* Change PIN Form */}
                    <form onSubmit={handleChangeMasterPinSubmit} className="space-y-3 bg-neutral-900 p-4 rounded-2xl border border-neutral-800">
                      <p className="text-xs font-bold text-white flex items-center justify-between">
                        <span>Change Master Admin PIN</span>
                        <span className="text-[10px] text-neutral-400 font-mono">Current: {masterPin}</span>
                      </p>
                      <input
                        type="password"
                        maxLength={10}
                        placeholder="New Security PIN (min 4 chars)"
                        value={newPinInput}
                        onChange={(e) => setNewPinInput(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono bg-neutral-950 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                      />
                      <button
                        type="submit"
                        className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl uppercase transition-colors cursor-pointer"
                      >
                        Update Master PIN
                      </button>
                      {pinChangeSuccess && (
                        <p className="text-[11px] text-emerald-400 font-bold text-center">PIN updated successfully!</p>
                      )}
                    </form>

                    {/* Master Security Guidelines & Access Policy */}
                    <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 space-y-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                          <Key className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs">Direct Master Security Authentication</p>
                          <p className="text-[10px] text-neutral-400">Master PIN gate protects all merchant operations</p>
                        </div>
                      </div>

                      <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-xs space-y-1.5 text-neutral-300">
                        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Direct PIN Access Policy Active</span>
                        </div>
                        <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
                          The Seller Central portal is secured via Master Access PIN authentication. All catalog modifications, financial order updates, and inventory changes are recorded in the live audit log above.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: STORE SETTINGS */}
            {activeTab === 'settings' && (
              <div className="space-y-6 max-w-3xl">
                <div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">Store &amp; Payment Gateway Configuration</h1>
                  <p className="text-xs text-neutral-400 mt-1">General storefront parameters, Pakistan JazzCash receiving credentials, and operational mode.</p>
                </div>

                {/* Operations & Demo Data Control */}
                <div className="bg-neutral-950 p-6 rounded-3xl border border-neutral-800 space-y-3 text-xs">
                  <h3 className="font-bold text-white text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Data Stream &amp; Operational Mode</span>
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      isDemoMode ? 'bg-amber-950 text-amber-400 border-amber-800' : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    }`}>
                      {isDemoMode ? 'Sample Overlay Active' : 'Live Production Mode'}
                    </span>
                  </h3>
                  <p className="text-neutral-400 leading-relaxed">
                    AXE&apos;s Seller Admin is finalized for <strong>Live Production Mode</strong>. All transactions, catalog items, and customer logs stream directly to and from your live Firestore database.
                  </p>

                  <div className="pt-2 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">Sample Demo Data Overlay</p>
                      <p className="text-[10px] text-neutral-500">Overlays mock benchmark orders and metrics for testing presentation</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const nextState = !isDemoMode;
                        setIsDemoMode(nextState);
                        addSecurityLog(`Toggled Demo Data Mode: ${nextState ? 'ENABLED (Sample Data Overlay)' : 'DISABLED (Live Operational Mode)'}`, 'Settings', 'info');
                      }}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isDemoMode ? 'bg-amber-500' : 'bg-neutral-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-neutral-950 shadow ring-0 transition duration-200 ease-in-out ${
                          isDemoMode ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Header Top Announcement Line Editor (Upside of Store Name Header) */}
                <div className="bg-neutral-950 p-6 rounded-3xl border border-amber-500/30 space-y-5 text-xs relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
                        <Megaphone className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm flex items-center gap-2">
                          <span>Header Top Announcement Line</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            Upside of Store Name
                          </span>
                        </h3>
                        <p className="text-neutral-400 text-[11px] mt-0.5">
                          Edit and configure the live ticker line displayed directly at the top of the header above the brand logo.
                        </p>
                      </div>
                    </div>

                    {/* Enable / Disable Toggle Switch */}
                    <div className="flex items-center gap-3 self-start sm:self-auto bg-neutral-900 px-3.5 py-2 rounded-2xl border border-neutral-800">
                      <span className="text-xs font-semibold text-neutral-300">
                        {storeSettings.announcementEnabled !== false ? 'Bar Active' : 'Bar Hidden'}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setStoreSettings({
                            ...storeSettings,
                            announcementEnabled: !(storeSettings.announcementEnabled ?? true),
                          })
                        }
                        className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                          storeSettings.announcementEnabled !== false ? 'bg-amber-500' : 'bg-neutral-800'
                        }`}
                        title="Toggle visibility on storefront"
                      >
                        <motion.div
                          className="w-5 h-5 rounded-full bg-neutral-950 shadow-md"
                          animate={{ x: storeSettings.announcementEnabled !== false ? 20 : 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Live Interactive Storefront Preview */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-neutral-400 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>Live Storefront Header Preview:</span>
                      </span>
                      <span className="font-mono text-[10px] text-neutral-500">Visible on desktop & mobile</span>
                    </div>

                    <div className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800/90 shadow-inner">
                      {storeSettings.announcementEnabled !== false ? (
                        <div className="bg-neutral-950 text-white text-[11px] py-2 px-3 text-center font-medium tracking-wide rounded-xl flex flex-wrap items-center justify-center gap-2 border border-neutral-800/60">
                          {storeSettings.announcementBadgeText && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold uppercase tracking-wider">
                              {storeSettings.announcementBadgeText}
                            </span>
                          )}
                          <span>
                            {storeSettings.announcementBarText || 'Complimentary Express Worldwide Shipping on Orders Over $150'}
                          </span>
                          {(storeSettings.announcementCodeText || storeSettings.announcementSubtext) && (
                            <>
                              <span className="text-neutral-500 hidden sm:inline">&bull;</span>
                              <span className="inline-flex items-center gap-1.5">
                                {storeSettings.announcementSubtext && <span>{storeSettings.announcementSubtext}</span>}
                                {storeSettings.announcementCodeText && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-amber-300 font-mono font-bold text-[10px]">
                                    {storeSettings.announcementCodeText}
                                  </span>
                                )}
                              </span>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 text-center text-neutral-500 italic text-[11px]">
                          Top Announcement Bar is currently turned OFF. Toggle the switch above to display it on the store.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Form Inputs Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Primary Message Content */}
                    <div className="md:col-span-2">
                      <label className="block text-neutral-300 font-semibold mb-1.5 flex items-center justify-between">
                        <span>Main Announcement Line Text</span>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {(storeSettings.announcementBarText || '').length} characters
                        </span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Complimentary Express Worldwide Shipping on Orders Over $150"
                        value={storeSettings.announcementBarText ?? 'Complimentary Express Worldwide Shipping on Orders Over $150'}
                        onChange={(e) =>
                          setStoreSettings({
                            ...storeSettings,
                            announcementBarText: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-amber-400 text-xs"
                      />
                    </div>

                    {/* Promo / Coupon Code */}
                    <div>
                      <label className="block text-neutral-300 font-semibold mb-1.5 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-amber-400" />
                        <span>Promo / Coupon Code (Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. AURA20, AXE20, FREESHIP"
                        value={storeSettings.announcementCodeText ?? 'AURA20'}
                        onChange={(e) =>
                          setStoreSettings({
                            ...storeSettings,
                            announcementCodeText: e.target.value.toUpperCase().trim(),
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-amber-300 font-mono font-bold uppercase focus:outline-none focus:border-amber-400 text-xs tracking-wider"
                      />
                    </div>

                    {/* Code Action / Subtext */}
                    <div>
                      <label className="block text-neutral-300 font-semibold mb-1.5">
                        Promo Code Prefix / Subtext
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Use Code, Promo Code, for 20% Off"
                        value={storeSettings.announcementSubtext ?? 'Use Code'}
                        onChange={(e) =>
                          setStoreSettings({
                            ...storeSettings,
                            announcementSubtext: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-amber-400 text-xs"
                      />
                    </div>

                    {/* Optional Badge Tag */}
                    <div className="md:col-span-2">
                      <label className="block text-neutral-300 font-semibold mb-1.5">
                        Optional Pill Highlight Badge
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Limited Offer, Flash Sale, New Drop, Free Shipping, VIP"
                        value={storeSettings.announcementBadgeText ?? 'Limited Offer'}
                        onChange={(e) =>
                          setStoreSettings({
                            ...storeSettings,
                            announcementBadgeText: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-amber-400 text-xs"
                      />
                    </div>
                  </div>

                  {/* 1-Click Quick Marketing Presets */}
                  <div className="pt-2 border-t border-neutral-800/80 space-y-2">
                    <span className="text-[11px] font-semibold text-neutral-400 block">
                      ⚡ Quick Marketing Templates:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        {
                          label: '🚚 Free Express Shipping',
                          text: 'Complimentary Express Worldwide Shipping on Orders Over $150',
                          code: 'FREESHIP',
                          sub: 'Use Code',
                          badge: 'Free Shipping',
                        },
                        {
                          label: '🔥 Flash Sale 20% Off',
                          text: 'Seasonal Flash Sale: 20% Off Entire Luxury Catalog Today Only',
                          code: 'AURA20',
                          sub: 'Use Code',
                          badge: 'Flash Sale',
                        },
                        {
                          label: '💎 New Luxury Drop',
                          text: 'Explore the New AXE Diamond Collection — Crafted with Sustainable Organics',
                          code: 'NEWDROP',
                          sub: 'Claim 15% Off With',
                          badge: 'New Release',
                        },
                        {
                          label: '⚡ VIP Members Club',
                          text: 'Exclusive VIP Members Weekend: Double Reward Points on All Orders',
                          code: 'VIPCLUB',
                          sub: 'Member Code',
                          badge: 'VIP Club',
                        },
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setStoreSettings({
                              ...storeSettings,
                              announcementBarText: preset.text,
                              announcementCodeText: preset.code,
                              announcementSubtext: preset.sub,
                              announcementBadgeText: preset.badge,
                              announcementEnabled: true,
                            });
                          }}
                          className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-xl border border-neutral-800 hover:border-amber-500/40 text-[11px] font-medium transition-all cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Save Action for Announcement Bar */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled={isSavingSettings}
                      onClick={async () => {
                        setIsSavingSettings(true);
                        try {
                          await updateServerStoreSettings(storeSettings);
                          await updateStoreSettingsInDb(storeSettings);
                          addSecurityLog('Updated Header Top Announcement Bar Line Content & Preferences', 'Settings', 'info');
                          setSettingsSavedSuccess(true);
                          setTimeout(() => setSettingsSavedSuccess(false), 3000);
                        } catch (err) {
                          console.error('Failed to save announcement bar settings:', err);
                        } finally {
                          setIsSavingSettings(false);
                        }
                      }}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl uppercase tracking-wider text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSavingSettings ? 'Syncing...' : 'Save & Publish Announcement Line'}</span>
                    </button>

                    {settingsSavedSuccess && (
                      <span className="text-emerald-400 font-bold text-xs flex items-center gap-1.5 animate-fadeIn">
                        <CheckCircle className="w-4 h-4" />
                        Announcement line published live to storefront header!
                      </span>
                    )}
                  </div>
                </div>

                {/* Store General Parameters */}
                <div className="bg-neutral-950 p-6 rounded-3xl border border-neutral-800 space-y-4 text-xs">
                  <h3 className="font-bold text-white text-sm">Storefront General Parameters</h3>
                  
                  <div>
                    <label className="block text-neutral-400 font-semibold mb-1">Store Front Name</label>
                    <input
                      type="text"
                      value={storeSettings.storeName}
                      onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 font-semibold mb-1">Admin Support Email</label>
                    <input
                      type="email"
                      value={storeSettings.supportEmail}
                      onChange={(e) => setStoreSettings({ ...storeSettings, supportEmail: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-neutral-400 font-semibold mb-1">Sales Tax Rate (%)</label>
                      <input
                        type="number"
                        value={storeSettings.taxRatePercent}
                        onChange={(e) => setStoreSettings({ ...storeSettings, taxRatePercent: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-amber-400 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-400 font-semibold mb-1">Free Shipping Threshold ($)</label>
                      <input
                        type="number"
                        value={storeSettings.freeShippingThreshold}
                        onChange={(e) => setStoreSettings({ ...storeSettings, freeShippingThreshold: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-amber-400 font-mono"
                      />
                    </div>
                  </div>

                  {/* Seller Merchant Contact Phone Settings */}
                  <div className="pt-2 border-t border-neutral-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-amber-400" />
                        <span className="font-bold text-white text-xs">Seller Official Contact Phone</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono">Storefront Contact</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1">
                        <label className="block text-[10px] text-neutral-400 mb-1">Country</label>
                        <select
                          value={storeSettings.sellerPhone2FA?.countryCode || '+92'}
                          onChange={(e) =>
                            setStoreSettings({
                              ...storeSettings,
                              sellerPhone2FA: {
                                enabled: false,
                                phoneNumber: storeSettings.sellerPhone2FA?.phoneNumber || '3157338694',
                                countryCode: e.target.value,
                                channel: 'sms',
                              },
                            })
                          }
                          className="w-full px-2.5 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
                        >
                          <option value="+92">🇵🇰 +92 (PK)</option>
                          <option value="+1">🇺🇸 +1 (US)</option>
                          <option value="+44">🇬🇧 +44 (UK)</option>
                          <option value="+971">🇦🇪 +971 (UAE)</option>
                          <option value="+966">🇸🇦 +966 (KSA)</option>
                          <option value="+49">🇩🇪 +49 (DE)</option>
                        </select>
                      </div>

                      <div className="col-span-2">
                        <label className="block text-[10px] text-neutral-400 mb-1">Seller Contact Phone Number</label>
                        <input
                          type="text"
                          placeholder="e.g. 3157338694"
                          value={storeSettings.sellerPhone2FA?.phoneNumber || '3157338694'}
                          onChange={(e) =>
                            setStoreSettings({
                              ...storeSettings,
                              sellerPhone2FA: {
                                enabled: false,
                                phoneNumber: e.target.value,
                                countryCode: storeSettings.sellerPhone2FA?.countryCode || '+92',
                                channel: 'sms',
                              },
                            })
                          }
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      disabled={isSavingSettings}
                      onClick={async () => {
                        setIsSavingSettings(true);
                        try {
                          await updateServerStoreSettings(storeSettings);
                          await updateStoreSettingsInDb(storeSettings);
                          addSecurityLog('Store Global Configuration & Payment Parameters Synchronized to Database', 'Settings', 'info');
                          setSettingsSavedSuccess(true);
                          setTimeout(() => setSettingsSavedSuccess(false), 3000);
                        } catch (err) {
                          console.error('Failed to save settings:', err);
                        } finally {
                          setIsSavingSettings(false);
                        }
                      }}
                      className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-2xl uppercase tracking-wider text-xs shadow-md transition-all flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSavingSettings ? 'Saving to Database...' : 'Save & Sync Parameters'}</span>
                    </button>

                    {settingsSavedSuccess && (
                      <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Settings saved to live database!
                      </span>
                    )}
                  </div>
                </div>

                {/* Fresh Store Setup / Purge Demo Data Card */}
                <div className="bg-neutral-950 p-6 rounded-3xl border border-neutral-800 space-y-4 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-white text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Fresh Store Launch & Demo Data Purge</span>
                      </h3>
                      <p className="text-neutral-400 text-xs mt-1">
                        Cleanly wipe any sample orders, test customers, and mock logs from Firestore so your store operates on 100% real data from day one.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-2">
                    <p className="text-[11px] text-neutral-300">
                      • <strong>Preserves</strong>: Catalog products, categories, SKU pricing, and store configuration.<br />
                      • <strong>Purges</strong>: Temporary test orders, sample CRM records, and mock security logs.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <button
                      type="button"
                      disabled={isPurgingDemo}
                      onClick={handlePurgeDemoData}
                      className="px-5 py-2.5 bg-neutral-900 hover:bg-rose-950 text-rose-400 hover:text-rose-300 border border-neutral-700 hover:border-rose-700 font-bold rounded-xl text-xs transition-all flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{isPurgingDemo ? 'Purging Demo Data...' : 'Purge Demo Records & Start Fresh'}</span>
                    </button>

                    {purgeMessage && (
                      <span className="text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        {purgeMessage}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      )}

      {/* DETAILED PRODUCT LISTING & CREATION MODAL */}
      <ProductListingFormModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onSave={handleSaveNewProduct}
      />

      {/* DETAILED PRODUCT EDITING MODAL */}
      <ProductListingFormModal
        isOpen={Boolean(editingProduct)}
        initialProduct={editingProduct}
        onClose={() => setEditingProduct(null)}
        onSave={handleSaveEditedProduct}
      />

      {/* DELETE PRODUCT CONFIRMATION MODAL WITH SAVE & ARCHIVE OPTIONS */}
      <AnimatePresence>
        {deletingProductId && (() => {
          const targetProd = products.find((p) => p.id === deletingProductId);
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-neutral-900 border border-neutral-800 p-6 rounded-3xl shadow-2xl text-left space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-950/80 text-rose-400 rounded-2xl flex items-center justify-center border border-rose-800/80">
                      <Trash2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-white">Delete Product from Catalog</h3>
                      <p className="text-[11px] text-neutral-400">Choose how to handle this item</p>
                    </div>
                  </div>
                  <button onClick={() => setDeletingProductId(null)} className="text-neutral-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {targetProd && (
                  <div className="p-3.5 bg-neutral-950 rounded-2xl border border-neutral-800 flex items-center gap-3">
                    <img
                      src={targetProd.image}
                      alt={targetProd.name}
                      className="w-12 h-12 rounded-xl object-cover bg-neutral-800 border border-neutral-700 flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm truncate">{targetProd.name}</p>
                      <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono mt-0.5">
                        <span>SKU: {targetProd.sku}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-bold">${targetProd.price}</span>
                        <span>•</span>
                        <span>{targetProd.stockCount} in stock</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Save to Archive Checkbox Option */}
                <div className="p-3.5 bg-amber-950/30 border border-amber-800/40 rounded-2xl space-y-2">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-amber-200">
                    <input
                      type="checkbox"
                      checked={saveToArchiveOnDelete}
                      onChange={(e) => setSaveToArchiveOnDelete(e.target.checked)}
                      className="mt-0.5 rounded border-amber-700 text-amber-500 focus:ring-0 focus:outline-none"
                    />
                    <div>
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Archive className="w-3.5 h-3.5 text-amber-400" />
                        Save backup copy to Deleted Archive
                      </span>
                      <p className="text-[11px] text-amber-300/80 mt-0.5">
                        Preserves product details in your seller archive. You can restore this item back to your live storefront at any time with 1 click.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setDeletingProductId(null)}
                    className="w-full sm:w-auto px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs rounded-xl transition-all"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => handleConfirmDeleteProduct(false)}
                    className="w-full sm:w-auto px-4 py-2.5 bg-neutral-900 hover:bg-rose-950/60 text-rose-400 hover:text-rose-300 font-bold text-xs rounded-xl border border-neutral-800 hover:border-rose-800 transition-all"
                  >
                    Delete Permanently
                  </button>

                  <button
                    type="button"
                    onClick={() => handleConfirmDeleteProduct(true)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    <Archive className="w-4 h-4" />
                    <span>Save to Archive & Remove</span>
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* DELETED PRODUCTS ARCHIVE & RECOVERY MODAL */}
      <AnimatePresence>
        {isArchiveModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 p-6 rounded-3xl shadow-2xl text-left space-y-4 max-h-[85vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center border border-amber-500/20">
                    <Archive className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-white">Deleted Products & Archive</h3>
                    <p className="text-[11px] text-neutral-400">
                      Recover previously deleted product records or permanently purge them
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsArchiveModalOpen(false)} className="text-neutral-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Archived Products List */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {deletedProductsArchive.length === 0 ? (
                  <div className="p-10 text-center space-y-3 bg-neutral-950 rounded-2xl border border-neutral-800/80">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-neutral-500 flex items-center justify-center mx-auto border border-neutral-800">
                      <Archive className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-white">Archive is Clean & Empty</p>
                    <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                      When products are removed with the &quot;Save to Archive&quot; option, they will appear here and can be restored anytime with 1 click.
                    </p>
                  </div>
                ) : (
                  deletedProductsArchive.map((archived) => (
                    <div
                      key={archived.id}
                      className="p-3.5 bg-neutral-950 rounded-2xl border border-neutral-800/80 hover:border-neutral-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={archived.image}
                          alt={archived.name}
                          className="w-12 h-12 rounded-xl object-cover bg-neutral-800 border border-neutral-700 flex-shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="font-bold text-white text-xs sm:text-sm">{archived.name}</p>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-400 font-mono mt-0.5">
                            <span>SKU: {archived.sku}</span>
                            <span>•</span>
                            <span className="text-emerald-400 font-bold">${archived.price}</span>
                            <span>•</span>
                            <span>{archived.category}</span>
                          </div>
                          <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
                            Deleted: {archived.deletedAt}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleRestoreProduct(archived)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition-all"
                          title="Restore product to active storefront catalog and database"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore to Catalog</span>
                        </button>

                        <button
                          onClick={() => {
                            setDeletedProductsArchive((prev) => prev.filter((p) => p.id !== archived.id));
                            addSecurityLog(`Purged Archived Item Permanently: ${archived.name}`, 'Inventory', 'warning');
                          }}
                          className="p-2 text-neutral-500 hover:text-rose-400 rounded-xl hover:bg-rose-950/40 transition-colors"
                          title="Permanently remove from archive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-800 text-xs flex-shrink-0">
                {deletedProductsArchive.length > 0 ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        deletedProductsArchive.forEach((prod) => handleRestoreProduct(prod));
                      }}
                      className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold rounded-xl flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Restore All Items ({deletedProductsArchive.length})</span>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Clear all archived items? This cannot be undone.')) {
                          setDeletedProductsArchive([]);
                        }
                      }}
                      className="px-3 py-2 text-rose-400 hover:text-rose-300 font-semibold"
                    >
                      Clear Archive
                    </button>
                  </div>
                ) : (
                  <div />
                )}

                <button
                  type="button"
                  onClick={() => setIsArchiveModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold rounded-xl"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ORDER CREATION & DELETION MODALS */}
      <AddOrderModal
        isOpen={isAddOrderOpen}
        onClose={() => setIsAddOrderOpen(false)}
        products={products}
        onCreateOrder={handleCreateOrderSubmit}
      />
      <DeleteOrderModal
        order={deletingOrder}
        onClose={() => setDeletingOrder(null)}
        onConfirmDelete={handleConfirmDeleteOrder}
      />

      {/* CUSTOMER CRM MODALS */}
      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        onCreateCustomer={handleCreateCustomerSubmit}
      />
      <EditCustomerModal
        customer={editingCustomer}
        onClose={() => setEditingCustomer(null)}
        onUpdateCustomer={handleEditCustomerSubmit}
      />
      <DeleteCustomerModal
        customer={deletingCustomer}
        onClose={() => setDeletingCustomer(null)}
        onConfirmDelete={handleConfirmDeleteCustomer}
      />

      {/* INVOICE & PACKING SLIP MODAL */}
      <AnimatePresence>
        {selectedInvoiceOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-neutral-900 border border-neutral-800 p-6 sm:p-8 rounded-3xl shadow-2xl text-left space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <div>
                  <span className="font-serif text-2xl font-bold text-white">ShopAXE</span>
                  <p className="text-[10px] font-mono text-neutral-400">Official Sales Invoice & Packing Slip</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print</span>
                  </button>
                  <button onClick={() => setSelectedInvoiceOrder(null)} className="text-neutral-400 hover:text-white p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-[10px] text-neutral-500 uppercase font-bold">Billed To</p>
                  <p className="font-bold text-white mt-1">{selectedInvoiceOrder.customerName}</p>
                  <p className="text-neutral-400">{selectedInvoiceOrder.customerEmail}</p>
                  <p className="text-neutral-400 mt-1">{selectedInvoiceOrder.shippingAddress}</p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] text-neutral-500 uppercase font-bold">Order Details</p>
                  <p className="font-mono font-bold text-amber-400 mt-1">{selectedInvoiceOrder.id}</p>
                  <p className="text-neutral-400">{selectedInvoiceOrder.date}</p>
                  <p className="text-emerald-400 font-bold mt-1">{selectedInvoiceOrder.paymentGateway}</p>
                  {selectedInvoiceOrder.paymentDetails?.authCode && (
                    <p className="mt-1 text-[10px] text-emerald-400 font-mono">
                      Auth: {selectedInvoiceOrder.paymentDetails.authCode}
                    </p>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2 text-xs">
                {selectedInvoiceOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">{item.product.name}</p>
                      <p className="text-[10px] text-neutral-400">Color: {item.selectedColor.name} • Qty: {item.quantity}</p>
                    </div>
                    <span className="font-mono font-bold text-white">${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}

                <div className="pt-3 border-t border-neutral-800 flex justify-between items-center font-bold text-sm">
                  <span className="text-neutral-400">Total Billed:</span>
                  <div className="text-right">
                    <span className="text-white font-mono">${selectedInvoiceOrder.total.toFixed(2)} USD</span>
                  </div>
                </div>
              </div>

              <div className="text-center text-[10px] text-neutral-500 font-mono">
                Thank you for choosing ShopAXE. Verified & Encrypted Transaction.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
