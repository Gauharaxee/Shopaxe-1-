import React, { useState, useEffect, useCallback } from 'react';
import { Product, CartItem, ProductColor, ToastNotification, AdminOrder } from './types';
import { MOCK_PRODUCTS } from './data/products';
import { INITIAL_ORDERS, INITIAL_SECURITY_LOGS, INITIAL_CUSTOMERS, INITIAL_TICKETS } from './data/adminMockData';
import { INITIAL_REVIEWS_BY_PRODUCT } from './data/reviewsData';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { ProductGrid } from './components/ProductGrid';
import { ProductQuickView } from './components/ProductQuickView';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { SideMenu } from './components/SideMenu';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/Toast';
import { AdminDashboard } from './components/AdminDashboard';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { ReceiptModal } from './components/ReceiptModal';
import { StoreReviewsSection } from './components/StoreReviewsSection';
import { FAQSection } from './components/FAQSection';
import { WhatsAppButton } from './components/WhatsAppButton';
import { 
  subscribeProducts, 
  subscribeOrders, 
  subscribeStoreSettings,
  updateStoreSettingsInDb,
  DEFAULT_STORE_SETTINGS,
  seedProductsIfEmpty, 
  upsertProductInDb, 
  deleteProductInDb,
  seedOrdersIfEmpty,
  seedSecurityLogsIfEmpty,
  seedCustomersIfEmpty,
  seedTicketsIfEmpty,
  seedReviewsIfEmpty,
  testConnection
} from './lib/firebase';
import {
  fetchServerProducts,
  createServerProduct,
  updateServerProduct,
  deleteServerProduct,
  fetchServerOrders,
  fetchServerStoreSettings,
  updateServerStoreSettings,
} from './lib/productsApi';
import { StoreSettings } from './types';

// Helper to check if current browser URL points to Seller Dashboard address (/seller)
function checkIsSellerAddress(): boolean {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const search = window.location.search.toLowerCase();
  return (
    path === '/seller' ||
    path.startsWith('/seller') ||
    hash.includes('/seller') ||
    hash.includes('#seller') ||
    search.includes('seller') ||
    // Backwards-compatible aliases
    path === '/sellershopaxe' ||
    path.startsWith('/sellershopaxe') ||
    hash.includes('/sellershopaxe') ||
    hash.includes('#sellershopaxe') ||
    path.startsWith('/admin') ||
    hash.includes('/admin') ||
    hash.includes('#admin')
  );
}

export default function App() {
  // Dedicated Address Route for Seller Dashboard
  const [isSellerAddress, setIsSellerAddress] = useState<boolean>(checkIsSellerAddress);

  // Products State (Synchronized with Firestore Database & Backend REST API)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('aura_products');
      return saved ? JSON.parse(saved) : MOCK_PRODUCTS;
    } catch {
      return MOCK_PRODUCTS;
    }
  });

  // Orders & Loading States
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [isProductsLoading, setIsProductsLoading] = useState<boolean>(true);

  // Handle URL Address Routing (e.g. /seller or /admin)
  useEffect(() => {
    const handleUrlChange = () => {
      setIsSellerAddress(checkIsSellerAddress());
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const navigateToStorefront = useCallback(() => {
    window.history.pushState(null, '', '/');
    setIsSellerAddress(false);
  }, []);

  // Initialize and subscribe to Firestore Database & Backend APIs
  useEffect(() => {
    let unsubscribeProducts: (() => void) | null = null;
    let unsubscribeOrders: (() => void) | null = null;
    let unsubscribeSettings: (() => void) | null = null;

    async function initData() {
      // Validate Firebase connection
      await testConnection();

      // Seed catalog & review collections safely if empty
      await seedProductsIfEmpty(MOCK_PRODUCTS);
      await seedReviewsIfEmpty(INITIAL_REVIEWS_BY_PRODUCT);

      // Subscribe to live products stream from Firestore
      unsubscribeProducts = subscribeProducts((fetchedProducts) => {
        if (fetchedProducts.length > 0) {
          setProducts(fetchedProducts);
        }
        setIsProductsLoading(false);
      });

      // Also fetch from Backend Server API (PostgreSQL database)
      fetchServerProducts()
        .then((serverProds) => {
          if (serverProds.length > 0) {
            setProducts((current) => (current.length === 0 ? serverProds : current));
          }
        })
        .catch(() => {});

      fetchServerOrders()
        .then((serverOrders) => {
          if (serverOrders.length > 0) {
            setOrders(serverOrders);
          }
        })
        .catch(() => {});

      fetchServerStoreSettings()
        .then((settings) => {
          if (settings) {
            setStoreSettings(settings);
          }
        })
        .catch(() => {});

      // Subscribe to live orders stream
      unsubscribeOrders = subscribeOrders((fetchedOrders) => {
        setOrders(fetchedOrders);
      });

      // Subscribe to live store settings
      unsubscribeSettings = subscribeStoreSettings((fetchedSettings) => {
        setStoreSettings(fetchedSettings);
      });
    }

    initData();

    return () => {
      if (unsubscribeProducts) unsubscribeProducts();
      if (unsubscribeOrders) unsubscribeOrders();
      if (unsubscribeSettings) unsubscribeSettings();
    };
  }, []);

  // Persistence for Cart & Wishlist
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('aura_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlistIds, setWishlistIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('aura_wishlist');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('aura_theme');
      return saved === 'dark';
    } catch {
      return false;
    }
  });

  // UI Drawer & Modal States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [checkoutDiscount, setCheckoutDiscount] = useState<{ code?: string; percent?: number }>({});
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Tracking & Receipt Modals
  const [isTrackingOpen, setIsTrackingOpen] = useState<boolean>(false);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string>('');
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<AdminOrder | null>(null);

  const handleOpenTracking = (orderId?: string) => {
    if (orderId) {
      setActiveTrackingOrderId(orderId);
    }
    setIsTrackingOpen(true);
  };

  const handleOpenReceipt = (orderOrId: AdminOrder | string) => {
    if (typeof orderOrId === 'string') {
      const found = orders.find((o) => o.id === orderOrId);
      if (found) {
        setActiveReceiptOrder(found);
      } else {
        setActiveReceiptOrder({
          id: orderOrId,
          customerName: 'Shopaxe Customer',
          customerEmail: 'customer@shopaxe.com',
          items: [],
          subtotal: 0,
          total: 0,
          status: 'Processing',
          paymentGateway: 'CARD',
          date: new Date().toISOString(),
          shippingAddress: '123 Minimalist Way, New York, NY 10001',
          trackingNumber: `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`
        });
      }
    } else {
      setActiveReceiptOrder(orderOrId);
    }
    setIsReceiptOpen(true);
  };

  // Local Storage Synchronization
  useEffect(() => {
    try {
      localStorage.setItem('aura_products', JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products:', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('aura_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem('aura_wishlist', JSON.stringify(Array.from(wishlistIds)));
    } catch (e) {
      console.error('Failed to save wishlist:', e);
    }
  }, [wishlistIds]);

  useEffect(() => {
    try {
      localStorage.setItem('aura_theme', isDarkMode ? 'dark' : 'light');
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error('Failed to save theme:', e);
    }
  }, [isDarkMode]);

  // Toast Helpers
  const addToast = (toast: Omit<ToastNotification, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev.slice(-2), newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Deep-linking: Automatically open quick view for direct shared product link (?product=... or ?p=...)
  useEffect(() => {
    if (products.length === 0) return;

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const productId = urlParams.get('product') || urlParams.get('p');
      const hash = window.location.hash;
      const hashProductId = hash.startsWith('#product-') ? hash.replace('#product-', '') : null;
      
      const targetId = productId || hashProductId;
      if (targetId) {
        const found = products.find(
          (p) => p.id.toLowerCase() === targetId.toLowerCase() || p.sku.toLowerCase() === targetId.toLowerCase()
        );
        if (found) {
          setQuickViewProduct(found);
        }
      }
    } catch (err) {
      console.warn('Failed to parse deep link product query parameter:', err);
    }
  }, [products]);

  // Synchronize URL search params with active quick view product for direct sharing
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (quickViewProduct) {
        url.searchParams.set('product', quickViewProduct.id);
        window.history.replaceState(null, '', url.toString());
      } else if (url.searchParams.has('product')) {
        url.searchParams.delete('product');
        window.history.replaceState(null, '', url.toString());
      }
    } catch (err) {
      // Ignored for iframe sandboxes
    }
  }, [quickViewProduct]);

  // Cart Operations
  const handleAddToCart = (
    product: Product,
    selectedColor: ProductColor,
    selectedSize?: string,
    quantity: number = 1
  ) => {
    const itemId = `${product.id}-${selectedColor.name}-${selectedSize || 'default'}`;

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === itemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [
        ...prev,
        {
          id: itemId,
          product,
          selectedColor,
          selectedSize,
          quantity,
        },
      ];
    });

    addToast({
      title: 'Added to Shopping Bag',
      message: `${product.name} (${selectedColor.name})`,
      type: 'cart',
      image: product.image,
    });
  };

  const handleBuyNow = (
    product: Product,
    selectedColor?: ProductColor,
    selectedSize?: string,
    quantity: number = 1
  ) => {
    const color = selectedColor || product.colors[0];
    const size = selectedSize || (product.sizes ? product.sizes[0] : undefined);
    handleAddToCart(product, color, size, quantity);
    setIsCartOpen(false);
    setIsWishlistOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleUpdateQuantity = (id: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(id);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Wishlist Operations
  const handleToggleWishlist = (product: Product) => {
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (next.has(product.id)) {
        next.delete(product.id);
        addToast({
          title: 'Removed from Wishlist',
          message: product.name,
          type: 'info',
        });
      } else {
        next.add(product.id);
        addToast({
          title: 'Saved to Wishlist',
          message: product.name,
          type: 'wishlist',
          image: product.image,
        });
      }
      return next;
    });
  };

  const handleOpenCheckout = (discountInfo?: { code?: string; percent?: number }) => {
    setIsCartOpen(false);
    if (discountInfo) {
      setCheckoutDiscount(discountInfo);
    }
    setIsCheckoutOpen(true);
  };

  const handleExploreHeroClick = () => {
    const grid = document.getElementById('product-catalog');
    if (grid) {
      grid.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Derived values
  const wishlistProducts = products.filter((p) => wishlistIds.has(p.id));
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Product Database Mutations with Dual Persistence
  const handleAddProduct = (product: Product) => {
    setProducts((prev) => [product, ...prev]);
    upsertProductInDb(product).catch((err) => console.warn('Firestore product add:', err));
    createServerProduct(product).catch((err) => console.warn('REST product add:', err));
    addToast({
      title: 'Product Added to Catalog',
      message: `${product.name} is now live on the storefront.`,
      type: 'success',
      image: product.image,
    });
  };

  const handleUpdateProduct = (product: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
    upsertProductInDb(product).catch((err) => console.warn('Firestore product update:', err));
    updateServerProduct(product).catch((err) => console.warn('REST product update:', err));
    addToast({
      title: 'Product Updated',
      message: `${product.name} details synchronized.`,
      type: 'info',
    });
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    deleteProductInDb(productId).catch((err) => console.warn('Firestore product delete:', err));
    deleteServerProduct(productId).catch((err) => console.warn('REST product delete:', err));
    addToast({
      title: 'Product Removed',
      message: 'Item removed from catalog database.',
      type: 'info',
    });
  };

  // IF SELLER ADDRESS IS ACCESSED (e.g. /seller, /admin, #/seller), RENDER ISOLATED SELLER DASHBOARD
  if (isSellerAddress) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white font-sans antialiased">
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
        <AdminDashboard
          isOpen={true}
          onClose={navigateToStorefront}
          products={products}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
        />
      </div>
    );
  }

  // STOREFRONT (CLEAN, ZERO ACCESS / LINKS TO SELLER DASHBOARD)
  return (
    <div className="min-h-screen flex flex-col bg-stone-50/50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans antialiased transition-colors duration-300">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Main Header (Zero Seller Access) */}
      <Header
        cartCount={totalCartCount}
        wishlistCount={wishlistIds.size}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenSideMenu={() => setIsSideMenuOpen(true)}
        onOpenTracking={() => handleOpenTracking()}
        storeSettings={storeSettings}
      />

      {/* Main Content Body */}
      <main className="flex-1">
        {/* Hero Banner */}
        <HeroBanner
          onExploreClick={handleExploreHeroClick}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            handleExploreHeroClick();
          }}
        />

        {/* Product Catalog Grid & Filters */}
        <ProductGrid
          products={products}
          wishlistIds={wishlistIds}
          onToggleWishlist={handleToggleWishlist}
          onQuickView={(p) => setQuickViewProduct(p)}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onAddToast={addToast}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isLoading={isProductsLoading}
        />

        {/* User Reviews & Verified Community Feedback Showcase */}
        <StoreReviewsSection
          products={products}
          onQuickViewProduct={(p) => setQuickViewProduct(p)}
          onAddToast={addToast}
        />

        {/* Customer FAQ & Shipping/Returns Policies Interactive Accordion */}
        <FAQSection
          onOpenTracking={() => handleOpenTracking()}
        />
      </main>

      {/* Footer */}
      <Footer 
        onSelectCategory={setSelectedCategory} 
        onOpenTracking={() => handleOpenTracking()}
      />

      {/* Side Menu Navigation Drawer (Zero Seller Access) */}
      <SideMenu
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        products={products}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        cartCount={totalCartCount}
        wishlistCount={wishlistIds.size}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenTracking={() => handleOpenTracking()}
      />

      {/* Slide-over Drawers & Modals */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onOpenCheckout={handleOpenCheckout}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistProducts={wishlistProducts}
        onRemoveFromWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        onAddToast={addToast}
      />

      <ProductQuickView
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        isWishlisted={quickViewProduct ? wishlistIds.has(quickViewProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        onUpdateProductRating={(pId, newRating, newCount) => {
          setProducts((prev) =>
            prev.map((p) =>
              p.id === pId ? { ...p, rating: newRating, reviewCount: newCount } : p
            )
          );
          if (quickViewProduct && quickViewProduct.id === pId) {
            setQuickViewProduct((prev) =>
              prev ? { ...prev, rating: newRating, reviewCount: newCount } : null
            );
          }
        }}
        onAddToast={addToast}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        discountCode={checkoutDiscount.code}
        discountPercent={checkoutDiscount.percent}
        onClearCart={handleClearCart}
        onTrackOrder={(id) => handleOpenTracking(id)}
        onViewReceipt={(id) => handleOpenReceipt(id)}
      />

      {/* Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        orders={orders}
        initialOrderId={activeTrackingOrderId}
        onViewReceipt={(order) => {
          setIsTrackingOpen(false);
          handleOpenReceipt(order);
        }}
      />

      {/* Digital Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        order={activeReceiptOrder}
      />

      {/* Floating Direct WhatsApp Customer Support Button (@gauharaxe / 03157338694) */}
      <WhatsAppButton
        phoneNumber="923157338694"
        whatsappUsername="@gauharaxe"
        storeName="Shopaxe"
      />
    </div>
  );
}
