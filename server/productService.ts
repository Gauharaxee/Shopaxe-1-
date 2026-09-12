import { Product, OrderStatus, AdminOrder, CustomerRecord } from '../src/types';
import { MOCK_PRODUCTS } from '../src/data/products';
import { INITIAL_ORDERS, INITIAL_CUSTOMERS } from '../src/data/adminMockData';

// Server-side In-Memory / Runtime Store
let productsStore: Product[] = [...MOCK_PRODUCTS];
let ordersStore: AdminOrder[] = [...INITIAL_ORDERS];
let customersStore: CustomerRecord[] = [...INITIAL_CUSTOMERS];

// ================= PRODUCT BACKEND HANDLERS ================= //
export function getProductsServer(): Product[] {
  return productsStore;
}

export function getProductByIdServer(id: string): Product | undefined {
  return productsStore.find((p) => p.id === id);
}

export function createProductServer(productData: Partial<Product>): Product {
  const newProduct: Product = {
    id: productData.id || `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: productData.name || 'New Minimalist Product',
    category: productData.category || 'Apparel',
    price: Number(productData.price) || 99,
    rating: productData.rating || 5.0,
    reviewCount: productData.reviewCount || 1,
    image: productData.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800',
    colors: productData.colors && productData.colors.length > 0 ? productData.colors : [
      { name: 'Onyx Black', hex: '#18181b' },
      { name: 'Off-White', hex: '#fafaf9' }
    ],
    description: productData.description || 'Handcrafted minimalist essential designed for longevity and timeless elegance.',
    details: productData.details || ['100% Sustainable Organic Textile', 'Pre-washed fabric', 'Machine wash cold'],
    isNew: productData.isNew ?? true,
    inStock: (productData.stockCount ?? 25) > 0,
    stockCount: Number(productData.stockCount ?? 25),
    sku: productData.sku || `AXE-${Math.floor(1000 + Math.random() * 9000)}`,
  };

  productsStore = [newProduct, ...productsStore];
  return newProduct;
}

export function updateProductServer(id: string, updates: Partial<Product>): Product | null {
  const index = productsStore.findIndex((p) => p.id === id);
  if (index === -1) {
    const created = createProductServer({ ...updates, id });
    return created;
  }

  const existing = productsStore[index];
  const stockCount = updates.stockCount !== undefined ? Number(updates.stockCount) : existing.stockCount;
  const inStock = updates.inStock !== undefined ? updates.inStock : stockCount > 0;

  const updated: Product = {
    ...existing,
    ...updates,
    stockCount,
    inStock,
  };

  productsStore[index] = updated;
  return updated;
}

export function updateStockCountServer(id: string, deltaOrExact: { delta?: number; exact?: number }): Product | null {
  const index = productsStore.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const existing = productsStore[index];
  let newCount = existing.stockCount;

  if (deltaOrExact.exact !== undefined) {
    newCount = Math.max(0, deltaOrExact.exact);
  } else if (deltaOrExact.delta !== undefined) {
    newCount = Math.max(0, existing.stockCount + deltaOrExact.delta);
  }

  const updated: Product = {
    ...existing,
    stockCount: newCount,
    inStock: newCount > 0,
  };

  productsStore[index] = updated;
  return updated;
}

export function deleteProductServer(id: string): boolean {
  const initialLength = productsStore.length;
  productsStore = productsStore.filter((p) => p.id !== id);
  return productsStore.length < initialLength;
}

// ================= ORDER BACKEND HANDLERS ================= //
export function getOrdersServer(): AdminOrder[] {
  return ordersStore;
}

export function getOrderByIdServer(id: string): AdminOrder | undefined {
  return ordersStore.find((o) => o.id === id);
}

export function createOrderServer(orderData: Partial<AdminOrder>): AdminOrder {
  const newOrder: AdminOrder = {
    id: orderData.id || `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
    customerName: orderData.customerName || 'Shopaxe Customer',
    customerEmail: orderData.customerEmail || 'customer@shopaxe.com',
    items: orderData.items || [],
    subtotal: Number(orderData.subtotal || orderData.total || 0),
    total: Number(orderData.total || 0),
    status: orderData.status || 'Pending',
    paymentGateway: orderData.paymentGateway || 'Manual / POS Terminal',
    paymentDetails: orderData.paymentDetails,
    date: orderData.date || new Date().toISOString().replace('T', ' ').slice(0, 16),
    shippingAddress: orderData.shippingAddress || 'Store Pickup / Direct Delivery',
    trackingNumber: orderData.trackingNumber || `TRK-${Math.floor(10000000 + Math.random() * 90000000)}PK`,
  };

  ordersStore = [newOrder, ...ordersStore];
  return newOrder;
}

export function updateOrderStatusServer(orderId: string, status: OrderStatus, trackingNumber?: string): AdminOrder | null {
  const order = ordersStore.find((o) => o.id === orderId);
  if (!order) return null;

  order.status = status;
  if (trackingNumber !== undefined) {
    order.trackingNumber = trackingNumber;
  }
  return order;
}

export function deleteOrderServer(orderId: string): boolean {
  const initialLength = ordersStore.length;
  ordersStore = ordersStore.filter((o) => o.id !== orderId);
  return ordersStore.length < initialLength;
}

// ================= CUSTOMER BACKEND HANDLERS ================= //
export function getCustomersServer(): CustomerRecord[] {
  return customersStore;
}

export function getCustomerByIdServer(id: string): CustomerRecord | undefined {
  return customersStore.find((c) => c.id === id);
}

export function createCustomerServer(customerData: Partial<CustomerRecord>): CustomerRecord {
  const newCustomer: CustomerRecord = {
    id: customerData.id || `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
    name: customerData.name || 'New Customer',
    email: customerData.email || 'user@shopaxe.com',
    totalOrders: Number(customerData.totalOrders ?? 1),
    totalSpent: Number(customerData.totalSpent ?? 0),
    status: customerData.status || 'New',
    lastOrderDate: customerData.lastOrderDate || new Date().toISOString().slice(0, 10),
  };

  customersStore = [newCustomer, ...customersStore];
  return newCustomer;
}

export function updateCustomerServer(id: string, updates: Partial<CustomerRecord>): CustomerRecord | null {
  const index = customersStore.findIndex((c) => c.id === id);
  if (index === -1) {
    const created = createCustomerServer({ ...updates, id });
    return created;
  }

  const existing = customersStore[index];
  const updated: CustomerRecord = {
    ...existing,
    ...updates,
  };

  customersStore[index] = updated;
  return updated;
}

export function deleteCustomerServer(id: string): boolean {
  const initialLength = customersStore.length;
  customersStore = customersStore.filter((c) => c.id !== id);
  return customersStore.length < initialLength;
}
