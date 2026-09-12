import { eq, desc } from 'drizzle-orm';
import { db } from '../src/db/index.ts';
import {
  products,
  orders,
  customers,
  supportTickets,
  securityLogs,
  storeSettings,
} from '../src/db/schema.ts';
import { Product, AdminOrder, CustomerRecord, SupportTicket, SecurityLog, StoreSettings } from '../src/types.ts';
import { MOCK_PRODUCTS } from '../src/data/products.ts';
import { DEFAULT_STORE_SETTINGS } from '../src/lib/firebase.ts';

function formatDbProduct(p: any): Product {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    price: Number(p.price),
    originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
    rating: Number(p.rating ?? 5.0),
    reviewCount: Number(p.reviewCount ?? 1),
    image: p.image,
    secondaryImage: p.secondaryImage || undefined,
    description: p.description,
    details: Array.isArray(p.details) && p.details.length > 0 ? p.details : [
      '100% Sustainable Organic Textile',
      'Pre-washed handcrafted fabric',
      'Machine wash cold gentle cycle',
    ],
    isNew: !!p.isNew,
    isBestseller: !!p.isBestseller,
    inStock: !!p.inStock,
    stockCount: Number(p.stockCount ?? 10),
    sku: p.sku || `AXE-${Math.floor(1000 + Math.random() * 9000)}`,
    colors: Array.isArray(p.colors) && p.colors.length > 0 ? p.colors : [
      { name: 'Onyx Black', hex: '#18181b' },
      { name: 'Off-White', hex: '#fafaf9' },
    ],
    sizes: Array.isArray(p.sizes) ? p.sizes : ['S', 'M', 'L', 'XL'],
  };
}

/**
 * Seed initial catalog to PostgreSQL if table is currently empty
 */
export async function seedInitialProductsIfEmpty(): Promise<void> {
  try {
    const existing = await db.select().from(products).limit(1);
    if (existing.length === 0) {
      console.log('Seeding initial product catalog into PostgreSQL...');
      for (const p of MOCK_PRODUCTS) {
        await db.insert(products).values({
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.price,
          originalPrice: p.originalPrice ?? null,
          rating: p.rating ?? 5.0,
          reviewCount: p.reviewCount ?? 12,
          image: p.image,
          description: p.description,
          badge: null,
          isNew: p.isNew ?? false,
          isBestseller: p.isBestseller ?? false,
          isTrending: false,
          stockCount: p.stockCount ?? 20,
          sku: p.sku || `AXE-${Math.floor(1000 + Math.random() * 9000)}`,
          inStock: (p.stockCount ?? 20) > 0,
          colors: p.colors ?? [],
          sizes: p.sizes ?? [],
        }).onConflictDoNothing();
      }
      console.log('PostgreSQL catalog seeded successfully.');
    }
  } catch (err) {
    console.error('Error checking/seeding PostgreSQL catalog:', err);
  }
}

// ================= PRODUCTS ================= //
export async function getDbProducts(): Promise<Product[]> {
  try {
    const rows = await db.select().from(products);
    if (rows.length === 0) {
      await seedInitialProductsIfEmpty();
      const refetched = await db.select().from(products);
      return refetched.map(formatDbProduct);
    }
    return rows.map(formatDbProduct);
  } catch (err) {
    console.error('getDbProducts error:', err);
    return MOCK_PRODUCTS;
  }
}

export async function getDbProductById(id: string): Promise<Product | null> {
  try {
    const rows = await db.select().from(products).where(eq(products.id, id));
    return rows.length > 0 ? formatDbProduct(rows[0]) : null;
  } catch (err) {
    console.error('getDbProductById error:', err);
    return null;
  }
}

export async function createDbProduct(data: Partial<Product>): Promise<Product> {
  const newProduct: Product = {
    id: data.id || `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: data.name || 'New Minimalist Product',
    category: (data.category as any) || 'Apparel',
    price: Number(data.price) || 99,
    originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
    rating: data.rating || 5.0,
    reviewCount: data.reviewCount || 1,
    image: data.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800',
    colors: data.colors && data.colors.length > 0 ? data.colors : [
      { name: 'Onyx Black', hex: '#18181b' },
      { name: 'Off-White', hex: '#fafaf9' }
    ],
    description: data.description || 'Handcrafted minimalist essential designed for longevity.',
    details: data.details || ['100% Sustainable Organic Textile', 'Machine wash cold'],
    isNew: data.isNew ?? true,
    inStock: (data.stockCount ?? 25) > 0,
    stockCount: Number(data.stockCount ?? 25),
    sku: data.sku || `AXE-${Math.floor(1000 + Math.random() * 9000)}`,
  };

  try {
    await db.insert(products).values({
      id: newProduct.id,
      name: newProduct.name,
      category: newProduct.category,
      price: newProduct.price,
      originalPrice: newProduct.originalPrice ?? null,
      rating: newProduct.rating,
      reviewCount: newProduct.reviewCount,
      image: newProduct.image,
      description: newProduct.description,
      badge: null,
      isNew: newProduct.isNew ?? false,
      isBestseller: newProduct.isBestseller ?? false,
      isTrending: false,
      stockCount: newProduct.stockCount,
      sku: newProduct.sku,
      inStock: newProduct.inStock,
      colors: newProduct.colors,
      sizes: newProduct.sizes ?? [],
    });
  } catch (err) {
    console.error('createDbProduct error:', err);
  }

  return newProduct;
}

export async function updateDbProduct(id: string, data: Partial<Product>): Promise<Product | null> {
  try {
    const existing = await getDbProductById(id);
    if (!existing) {
      return await createDbProduct({ ...data, id });
    }

    const stockCount = data.stockCount !== undefined ? Number(data.stockCount) : existing.stockCount;
    const inStock = data.inStock !== undefined ? data.inStock : stockCount > 0;

    await db.update(products).set({
      name: data.name !== undefined ? data.name : existing.name,
      category: data.category !== undefined ? data.category : existing.category,
      price: data.price !== undefined ? Number(data.price) : existing.price,
      originalPrice: data.originalPrice !== undefined ? Number(data.originalPrice) : existing.originalPrice,
      image: data.image !== undefined ? data.image : existing.image,
      description: data.description !== undefined ? data.description : existing.description,
      stockCount,
      inStock,
      sku: data.sku !== undefined ? data.sku : existing.sku,
      colors: data.colors !== undefined ? data.colors : existing.colors,
      sizes: data.sizes !== undefined ? data.sizes : existing.sizes,
    }).where(eq(products.id, id));

    return await getDbProductById(id);
  } catch (err) {
    console.error('updateDbProduct error:', err);
    return null;
  }
}

export async function deleteDbProduct(id: string): Promise<boolean> {
  try {
    await db.delete(products).where(eq(products.id, id));
    return true;
  } catch (err) {
    console.error('deleteDbProduct error:', err);
    return false;
  }
}

// ================= ORDERS ================= //
export async function getDbOrders(): Promise<AdminOrder[]> {
  try {
    const rows = await db.select().from(orders).orderBy(desc(orders.createdAt));
    return rows.map((r) => ({
      id: r.id,
      customerName: r.customerName,
      customerEmail: r.customerEmail,
      items: r.items as any,
      subtotal: r.subtotal,
      total: r.total,
      status: r.status as any,
      paymentGateway: r.paymentGateway,
      paymentDetails: r.paymentDetails as any,
      shippingAddress: r.shippingAddress,
      trackingNumber: r.trackingNumber || undefined,
      date: r.date,
    }));
  } catch (err) {
    console.error('getDbOrders error:', err);
    return [];
  }
}

export async function upsertDbOrder(order: AdminOrder): Promise<AdminOrder> {
  try {
    const existing = await db.select().from(orders).where(eq(orders.id, order.id));
    if (existing.length > 0) {
      await db.update(orders).set({
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        items: order.items,
        subtotal: order.subtotal,
        total: order.total,
        status: order.status,
        paymentGateway: order.paymentGateway,
        paymentDetails: order.paymentDetails,
        shippingAddress: order.shippingAddress,
        trackingNumber: order.trackingNumber || null,
        date: order.date,
      }).where(eq(orders.id, order.id));
      return order;
    } else {
      await db.insert(orders).values({
        id: order.id,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        items: order.items,
        subtotal: order.subtotal,
        total: order.total,
        status: order.status,
        paymentGateway: order.paymentGateway,
        paymentDetails: order.paymentDetails,
        shippingAddress: order.shippingAddress,
        trackingNumber: order.trackingNumber || null,
        date: order.date,
      });
      return order;
    }
  } catch (err) {
    console.error('upsertDbOrder error:', err);
    return order;
  }
}

export async function syncDbOrders(incomingOrders: AdminOrder[] = []): Promise<AdminOrder[]> {
  try {
    // 1. Process and upsert incoming orders
    if (incomingOrders && Array.isArray(incomingOrders) && incomingOrders.length > 0) {
      for (const ord of incomingOrders) {
        if (ord && ord.id) {
          await upsertDbOrder(ord);
        }
      }
    }
    // 2. Return latest unified list from PostgreSQL database
    return await getDbOrders();
  } catch (err) {
    console.error('syncDbOrders error:', err);
    return await getDbOrders();
  }
}

export async function createDbOrder(data: Partial<AdminOrder>): Promise<AdminOrder> {
  const newOrder: AdminOrder = {
    id: data.id || `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
    customerName: data.customerName || 'Shopaxe Customer',
    customerEmail: data.customerEmail || 'customer@shopaxe.com',
    items: data.items || [],
    subtotal: Number(data.subtotal || data.total || 0),
    total: Number(data.total || 0),
    status: data.status || 'Pending',
    paymentGateway: data.paymentGateway || 'Trust Wallet',
    paymentDetails: data.paymentDetails,
    date: data.date || new Date().toISOString().replace('T', ' ').slice(0, 16),
    shippingAddress: data.shippingAddress || 'Standard Delivery',
    trackingNumber: data.trackingNumber || `TRK-${Math.floor(10000000 + Math.random() * 90000000)}PK`,
  };

  try {
    await db.insert(orders).values({
      id: newOrder.id,
      customerName: newOrder.customerName,
      customerEmail: newOrder.customerEmail,
      items: newOrder.items,
      subtotal: newOrder.subtotal,
      total: newOrder.total,
      status: newOrder.status,
      paymentGateway: newOrder.paymentGateway,
      paymentDetails: newOrder.paymentDetails,
      shippingAddress: newOrder.shippingAddress,
      trackingNumber: newOrder.trackingNumber,
      date: newOrder.date,
    });
  } catch (err) {
    console.error('createDbOrder error:', err);
  }

  return newOrder;
}

export async function updateDbOrderStatus(orderId: string, status: string, trackingNumber?: string): Promise<boolean> {
  try {
    const updateData: any = { status };
    if (trackingNumber !== undefined) {
      updateData.trackingNumber = trackingNumber;
    }
    await db.update(orders).set(updateData).where(eq(orders.id, orderId));
    return true;
  } catch (err) {
    console.error('updateDbOrderStatus error:', err);
    return false;
  }
}

export async function deleteDbOrder(orderId: string): Promise<boolean> {
  try {
    await db.delete(orders).where(eq(orders.id, orderId));
    return true;
  } catch (err) {
    console.error('deleteDbOrder error:', err);
    return false;
  }
}

// ================= CUSTOMERS ================= //
export async function getDbCustomers(): Promise<CustomerRecord[]> {
  try {
    const rows = await db.select().from(customers).orderBy(desc(customers.createdAt));
    return rows.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      totalOrders: c.totalOrders ?? 0,
      totalSpent: c.totalSpent ?? 0,
      status: (c.status as any) || 'New',
      lastOrderDate: c.lastOrderDate || undefined,
    }));
  } catch (err) {
    console.error('getDbCustomers error:', err);
    return [];
  }
}

export async function createDbCustomer(data: Partial<CustomerRecord>): Promise<CustomerRecord> {
  const newCustomer: CustomerRecord = {
    id: data.id || `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
    name: data.name || 'New Customer',
    email: data.email || 'user@shopaxe.com',
    totalOrders: Number(data.totalOrders ?? 1),
    totalSpent: Number(data.totalSpent ?? 0),
    status: data.status || 'New',
    lastOrderDate: data.lastOrderDate || new Date().toISOString().slice(0, 10),
  };

  try {
    await db.insert(customers).values({
      id: newCustomer.id,
      name: newCustomer.name,
      email: newCustomer.email,
      totalOrders: newCustomer.totalOrders,
      totalSpent: newCustomer.totalSpent,
      status: newCustomer.status,
      lastOrderDate: newCustomer.lastOrderDate,
    }).onConflictDoNothing();
  } catch (err) {
    console.error('createDbCustomer error:', err);
  }

  return newCustomer;
}

export async function updateDbCustomer(id: string, data: Partial<CustomerRecord>): Promise<CustomerRecord | null> {
  try {
    await db.update(customers).set({
      name: data.name,
      email: data.email,
      totalOrders: data.totalOrders,
      totalSpent: data.totalSpent,
      status: data.status,
      lastOrderDate: data.lastOrderDate,
    }).where(eq(customers.id, id));

    const rows = await db.select().from(customers).where(eq(customers.id, id));
    if (rows.length > 0) {
      const c = rows[0];
      return {
        id: c.id,
        name: c.name,
        email: c.email,
        totalOrders: c.totalOrders ?? 0,
        totalSpent: c.totalSpent ?? 0,
        status: (c.status as any) || 'New',
        lastOrderDate: c.lastOrderDate || undefined,
      };
    }
    return null;
  } catch (err) {
    console.error('updateDbCustomer error:', err);
    return null;
  }
}

export async function deleteDbCustomer(id: string): Promise<boolean> {
  try {
    await db.delete(customers).where(eq(customers.id, id));
    return true;
  } catch (err) {
    console.error('deleteDbCustomer error:', err);
    return false;
  }
}

// ================= SUPPORT TICKETS ================= //
export async function getDbSupportTickets(): Promise<SupportTicket[]> {
  try {
    const rows = await db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt));
    return rows.map((t) => ({
      id: t.id,
      customerName: t.customerName,
      customerEmail: t.customerEmail,
      subject: t.subject,
      message: t.message,
      status: (t.status as any) || 'Open',
      date: t.date,
    }));
  } catch (err) {
    console.error('getDbSupportTickets error:', err);
    return [];
  }
}

export async function createDbSupportTicket(data: Partial<SupportTicket>): Promise<SupportTicket> {
  const ticket: SupportTicket = {
    id: data.id || `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName: data.customerName || 'Customer',
    customerEmail: data.customerEmail || 'support@shopaxe.com',
    subject: data.subject || 'Store Inquiry',
    message: data.message || '',
    status: data.status || 'Open',
    date: data.date || new Date().toISOString().replace('T', ' ').slice(0, 16),
  };

  try {
    await db.insert(supportTickets).values({
      id: ticket.id,
      customerName: ticket.customerName,
      customerEmail: ticket.customerEmail,
      subject: ticket.subject,
      message: ticket.message,
      status: ticket.status,
      date: ticket.date,
    });
  } catch (err) {
    console.error('createDbSupportTicket error:', err);
  }

  return ticket;
}

export async function updateDbSupportTicketStatus(id: string, status: string): Promise<boolean> {
  try {
    await db.update(supportTickets).set({ status: status as any }).where(eq(supportTickets.id, id));
    return true;
  } catch (err) {
    console.error('updateDbSupportTicketStatus error:', err);
    return false;
  }
}

export async function deleteDbSupportTicket(id: string): Promise<boolean> {
  try {
    await db.delete(supportTickets).where(eq(supportTickets.id, id));
    return true;
  } catch (err) {
    console.error('deleteDbSupportTicket error:', err);
    return false;
  }
}

// ================= SECURITY LOGS ================= //
export async function getDbSecurityLogs(): Promise<SecurityLog[]> {
  try {
    const rows = await db.select().from(securityLogs).orderBy(desc(securityLogs.createdAt)).limit(100);
    return rows.map((l) => ({
      id: l.id,
      timestamp: l.timestamp,
      action: l.action,
      category: l.category as any,
      severity: l.severity as any,
      ipAddress: l.ipAddress,
      user: l.user,
    }));
  } catch (err) {
    console.error('getDbSecurityLogs error:', err);
    return [];
  }
}

export async function createDbSecurityLog(data: Partial<SecurityLog>): Promise<SecurityLog> {
  const log: SecurityLog = {
    id: data.id || `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: data.timestamp || new Date().toISOString().replace('T', ' ').slice(0, 19),
    action: data.action || 'System Operation',
    category: data.category || 'Security',
    severity: data.severity || 'info',
    ipAddress: data.ipAddress || '127.0.0.1',
    user: data.user || 'System',
  };

  try {
    await db.insert(securityLogs).values({
      id: log.id,
      timestamp: log.timestamp,
      action: log.action,
      category: log.category,
      severity: log.severity,
      ipAddress: log.ipAddress,
      user: log.user,
    });
  } catch (err) {
    console.error('createDbSecurityLog error:', err);
  }

  return log;
}

// ================= STORE SETTINGS ================= //
export async function getDbStoreSettings(): Promise<StoreSettings> {
  try {
    const rows = await db.select().from(storeSettings).where(eq(storeSettings.id, 'default'));
    if (rows.length > 0) {
      const r = rows[0];
      const pg: any = r.paymentGateway || {};
      return {
        storeName: r.storeName || DEFAULT_STORE_SETTINGS.storeName,
        supportEmail: r.supportEmail || DEFAULT_STORE_SETTINGS.supportEmail,
        taxRatePercent: r.taxRatePercent ?? 8,
        freeShippingThreshold: r.freeShippingThreshold ?? 150,
        announcementBarText: pg.announcementBarText ?? (r as any).announcementBarText ?? DEFAULT_STORE_SETTINGS.announcementBarText,
        announcementCodeText: pg.announcementCodeText ?? (r as any).announcementCodeText ?? DEFAULT_STORE_SETTINGS.announcementCodeText,
        announcementSubtext: pg.announcementSubtext ?? (r as any).announcementSubtext ?? DEFAULT_STORE_SETTINGS.announcementSubtext,
        announcementBadgeText: pg.announcementBadgeText ?? (r as any).announcementBadgeText ?? DEFAULT_STORE_SETTINGS.announcementBadgeText,
        announcementEnabled: pg.announcementEnabled !== undefined ? pg.announcementEnabled : ((r as any).announcementEnabled !== undefined ? (r as any).announcementEnabled : DEFAULT_STORE_SETTINGS.announcementEnabled),
        paymentGateway: pg.gatewayName ? pg : DEFAULT_STORE_SETTINGS.paymentGateway,
        sellerPhone2FA: (r as any).sellerPhone2FA || pg.sellerPhone2FA || DEFAULT_STORE_SETTINGS.sellerPhone2FA,
      };
    }
  } catch (err) {
    console.error('getDbStoreSettings error:', err);
  }
  return DEFAULT_STORE_SETTINGS;
}

export async function updateDbStoreSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
  const current = await getDbStoreSettings();
  const updated: StoreSettings = {
    ...current,
    ...settings,
    paymentGateway: {
      ...(current.paymentGateway || {}),
      ...(settings.paymentGateway || {}),
      // embed announcement configs inside json payload for persistent resilience
      announcementBarText: settings.announcementBarText !== undefined ? settings.announcementBarText : current.announcementBarText,
      announcementCodeText: settings.announcementCodeText !== undefined ? settings.announcementCodeText : current.announcementCodeText,
      announcementSubtext: settings.announcementSubtext !== undefined ? settings.announcementSubtext : current.announcementSubtext,
      announcementBadgeText: settings.announcementBadgeText !== undefined ? settings.announcementBadgeText : current.announcementBadgeText,
      announcementEnabled: settings.announcementEnabled !== undefined ? settings.announcementEnabled : current.announcementEnabled,
    } as any,
  };

  try {
    await db.insert(storeSettings).values({
      id: 'default',
      storeName: updated.storeName,
      supportEmail: updated.supportEmail,
      taxRatePercent: updated.taxRatePercent,
      freeShippingThreshold: updated.freeShippingThreshold,
      paymentGateway: updated.paymentGateway,
    }).onConflictDoUpdate({
      target: storeSettings.id,
      set: {
        storeName: updated.storeName,
        supportEmail: updated.supportEmail,
        taxRatePercent: updated.taxRatePercent,
        freeShippingThreshold: updated.freeShippingThreshold,
        paymentGateway: updated.paymentGateway,
        updatedAt: new Date(),
      },
    });
  } catch (err) {
    console.error('updateDbStoreSettings error:', err);
  }

  return updated;
}
