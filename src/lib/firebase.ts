import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore,
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs, 
  updateDoc,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Product, AdminOrder, SecurityLog, CustomerRecord, SupportTicket, OrderStatus, Review, StoreSettings } from '../types';

// Default Store Configuration
export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: "Shop AXE",
  supportEmail: "axe426622@gmail.com",
  taxRatePercent: 8,
  freeShippingThreshold: 150,
  announcementBarText: "Complimentary Express Worldwide Shipping on Orders Over $150",
  announcementCodeText: "AURA20",
  announcementSubtext: "Use Code",
  announcementBadgeText: "Limited Offer",
  announcementEnabled: true,
  paymentGateway: {
    isEnabled: true,
    gatewayName: "Trust Wallet (Backend Managed)",
    environment: 'live',
  },
  sellerPhone2FA: {
    enabled: false,
    phoneNumber: "+923157338694",
    countryCode: "+92",
    channel: 'sms',
    autoSendOnGate: false,
  },
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with custom database ID and forced long polling for resilient proxy/iframe connectivity
const dbId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? firebaseConfig.firestoreDatabaseId
  : undefined;

export const db = (() => {
  const firestoreSettings = {
    experimentalForceLongPolling: true,
    ignoreUndefinedProperties: true,
  };
  try {
    return dbId 
      ? initializeFirestore(app, firestoreSettings, dbId)
      : initializeFirestore(app, firestoreSettings);
  } catch {
    return dbId ? getFirestore(app, dbId) : getFirestore(app);
  }
})();

// Collection References
const PRODUCTS_COL = 'products';
const ORDERS_COL = 'orders';
const SECURITY_LOGS_COL = 'security_logs';
const CUSTOMERS_COL = 'customers';
const TICKETS_COL = 'tickets';
const REVIEWS_COL = 'reviews';
const SETTINGS_COL = 'settings';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): FirestoreErrorInfo {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
    },
    operationType,
    path
  };
  console.warn(`Firestore Operation Notice [${operationType} on ${path}]:`, JSON.stringify(errInfo));
  return errInfo;
}

/**
 * Connection Validation
 */
export async function testConnection(): Promise<boolean> {
  try {
    const colRef = collection(db, PRODUCTS_COL);
    await getDocs(colRef);
    return true;
  } catch (error) {
    console.warn("Firestore operating in resilient fallback mode:", error instanceof Error ? error.message : error);
    return false;
  }
}

/**
 * PRODUCTS SYNC & SEEDING
 */
export function subscribeProducts(
  onSuccess: (products: Product[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, PRODUCTS_COL);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const products: Product[] = [];
      snapshot.forEach((docSnap) => {
        products.push({ id: docSnap.id, ...docSnap.data() } as Product);
      });
      onSuccess(products);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, PRODUCTS_COL);
      if (onError) onError(err);
    }
  );
}

export async function upsertProductInDb(product: Product): Promise<void> {
  try {
    const docRef = doc(db, PRODUCTS_COL, product.id);
    const data = JSON.parse(JSON.stringify(product));
    await setDoc(docRef, data, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${PRODUCTS_COL}/${product.id}`);
    throw err;
  }
}

export async function updateProductStockInDb(productId: string, newStock: number): Promise<void> {
  try {
    const docRef = doc(db, PRODUCTS_COL, productId);
    await updateDoc(docRef, {
      stockCount: Math.max(0, newStock),
      inStock: newStock > 0,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${PRODUCTS_COL}/${productId}`);
    throw err;
  }
}

export async function deleteProductInDb(productId: string): Promise<void> {
  try {
    const docRef = doc(db, PRODUCTS_COL, productId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${PRODUCTS_COL}/${productId}`);
    throw err;
  }
}

export async function seedProductsIfEmpty(initialProducts: Product[]): Promise<boolean> {
  try {
    const colRef = collection(db, PRODUCTS_COL);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      console.log('Seeding initial products to Firestore...');
      for (const prod of initialProducts) {
        await upsertProductInDb(prod);
      }
      return true;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, PRODUCTS_COL);
  }
  return false;
}

/**
 * ORDERS SYNC
 */
export function subscribeOrders(
  onSuccess: (orders: AdminOrder[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, ORDERS_COL);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const orders: AdminOrder[] = [];
      snapshot.forEach((docSnap) => {
        orders.push({ id: docSnap.id, ...docSnap.data() } as AdminOrder);
      });
      orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onSuccess(orders);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, ORDERS_COL);
      if (onError) onError(err);
    }
  );
}

export async function createOrderInDb(order: AdminOrder): Promise<void> {
  try {
    const docRef = doc(db, ORDERS_COL, order.id);
    const data = JSON.parse(JSON.stringify(order));
    await setDoc(docRef, data, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${ORDERS_COL}/${order.id}`);
    throw err;
  }
}

export async function deleteOrderInDb(orderId: string): Promise<void> {
  try {
    const docRef = doc(db, ORDERS_COL, orderId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${ORDERS_COL}/${orderId}`);
    throw err;
  }
}

export async function updateOrderStatusInDb(
  orderId: string, 
  status: OrderStatus, 
  trackingNumber?: string
): Promise<void> {
  try {
    const docRef = doc(db, ORDERS_COL, orderId);
    const updatePayload: Record<string, any> = { status };
    if (trackingNumber !== undefined) {
      updatePayload.trackingNumber = trackingNumber;
    }
    await updateDoc(docRef, updatePayload);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${ORDERS_COL}/${orderId}`);
    throw err;
  }
}

export async function seedOrdersIfEmpty(_initialOrders: AdminOrder[]): Promise<void> {
  // Demo orders auto-seeding disabled for clean professional operation
  return;
}

/**
 * SECURITY LOGS SYNC
 */
export function subscribeSecurityLogs(
  onSuccess: (logs: SecurityLog[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, SECURITY_LOGS_COL);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const logs: SecurityLog[] = [];
      snapshot.forEach((docSnap) => {
        logs.push({ id: docSnap.id, ...docSnap.data() } as SecurityLog);
      });
      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      onSuccess(logs);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, SECURITY_LOGS_COL);
      if (onError) onError(err);
    }
  );
}

export async function addSecurityLogInDb(log: SecurityLog): Promise<void> {
  try {
    const docRef = doc(db, SECURITY_LOGS_COL, log.id);
    const data = JSON.parse(JSON.stringify(log));
    await setDoc(docRef, data, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${SECURITY_LOGS_COL}/${log.id}`);
  }
}

export async function seedSecurityLogsIfEmpty(_initialLogs: SecurityLog[]): Promise<void> {
  // Demo logs auto-seeding disabled for clean professional operation
  return;
}

/**
 * CUSTOMERS & TICKETS SYNC
 */
export function subscribeCustomers(
  onSuccess: (customers: CustomerRecord[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, CUSTOMERS_COL);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const customers: CustomerRecord[] = [];
      snapshot.forEach((docSnap) => {
        customers.push({ id: docSnap.id, ...docSnap.data() } as CustomerRecord);
      });
      onSuccess(customers);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, CUSTOMERS_COL);
      if (onError) onError(err);
    }
  );
}

export async function upsertCustomerInDb(customer: CustomerRecord): Promise<void> {
  try {
    const docRef = doc(db, CUSTOMERS_COL, customer.id);
    const data = JSON.parse(JSON.stringify(customer));
    await setDoc(docRef, data, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${CUSTOMERS_COL}/${customer.id}`);
    throw err;
  }
}

export async function deleteCustomerInDb(customerId: string): Promise<void> {
  try {
    const docRef = doc(db, CUSTOMERS_COL, customerId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${CUSTOMERS_COL}/${customerId}`);
    throw err;
  }
}

export async function seedCustomersIfEmpty(_initialCustomers: CustomerRecord[]): Promise<void> {
  // Demo customers auto-seeding disabled for clean professional operation
  return;
}

export function subscribeTickets(
  onSuccess: (tickets: SupportTicket[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, TICKETS_COL);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const tickets: SupportTicket[] = [];
      snapshot.forEach((docSnap) => {
        tickets.push({ id: docSnap.id, ...docSnap.data() } as SupportTicket);
      });
      onSuccess(tickets);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, TICKETS_COL);
      if (onError) onError(err);
    }
  );
}

export async function updateTicketStatusInDb(
  ticketId: string, 
  status: 'Open' | 'Resolved' | 'In Progress'
): Promise<void> {
  try {
    const docRef = doc(db, TICKETS_COL, ticketId);
    await updateDoc(docRef, { status });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${TICKETS_COL}/${ticketId}`);
  }
}

export async function seedTicketsIfEmpty(_initialTickets: SupportTicket[]): Promise<void> {
  // Demo tickets auto-seeding disabled for clean professional operation
  return;
}

/**
 * REVIEWS SYNC
 */
export function subscribeProductReviews(
  productId: string,
  onSuccess: (reviews: Review[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, REVIEWS_COL);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const reviews: Review[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.productId === productId) {
          reviews.push({ id: docSnap.id, ...data } as Review & { productId?: string });
        }
      });
      reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onSuccess(reviews);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, REVIEWS_COL);
      if (onError) onError(err);
    }
  );
}

export async function addReviewInDb(
  productId: string, 
  review: Review, 
  updatedRating?: number, 
  updatedReviewCount?: number
): Promise<void> {
  try {
    const docRef = doc(db, REVIEWS_COL, review.id);
    const data = { ...review, productId };
    await setDoc(docRef, data, { merge: true });

    if (updatedRating !== undefined && updatedReviewCount !== undefined) {
      const prodRef = doc(db, PRODUCTS_COL, productId);
      await updateDoc(prodRef, {
        rating: updatedRating,
        reviewCount: updatedReviewCount
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${REVIEWS_COL}/${review.id}`);
  }
}

export async function seedReviewsIfEmpty(initialReviewsByProd: Record<string, Review[]>): Promise<void> {
  try {
    const colRef = collection(db, REVIEWS_COL);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      for (const [pId, revs] of Object.entries(initialReviewsByProd)) {
        for (const r of revs) {
          const docRef = doc(db, REVIEWS_COL, r.id);
          await setDoc(docRef, { ...r, productId: pId }, { merge: true });
        }
      }
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, REVIEWS_COL);
  }
}

/**
 * STORE & PAYMENT SETTINGS SYNC
 */
export function subscribeStoreSettings(
  onSuccess: (settings: StoreSettings) => void,
  onError?: (err: Error) => void
) {
  const docRef = doc(db, SETTINGS_COL, 'store_config');
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const merged: StoreSettings = {
          ...DEFAULT_STORE_SETTINGS,
          ...data,
          paymentGateway: {
            ...DEFAULT_STORE_SETTINGS.paymentGateway,
            ...(data.paymentGateway || {}),
          },
          sellerPhone2FA: {
            ...DEFAULT_STORE_SETTINGS.sellerPhone2FA!,
            ...(data.sellerPhone2FA || {}),
          },
        };
        onSuccess(merged);
      } else {
        // Seed default config in background
        setDoc(docRef, JSON.parse(JSON.stringify(DEFAULT_STORE_SETTINGS)), { merge: true }).catch(() => {});
        onSuccess(DEFAULT_STORE_SETTINGS);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, `${SETTINGS_COL}/store_config`);
      if (onError) onError(err);
    }
  );
}

export async function updateStoreSettingsInDb(settings: StoreSettings): Promise<void> {
  try {
    const docRef = doc(db, SETTINGS_COL, 'store_config');
    const data = JSON.parse(JSON.stringify(settings));
    await setDoc(docRef, data, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${SETTINGS_COL}/store_config`);
  }
}

/**
 * PURGE DEMO DATA FROM FIRESTORE
 * Cleans out any demo records (orders, customers, tickets, security logs) so the store is 100% clean and fresh for live use.
 */
export async function purgeDemoDataFromFirestore(): Promise<{ clearedOrders: number; clearedLogs: number; clearedCustomers: number; clearedTickets: number }> {
  const result = { clearedOrders: 0, clearedLogs: 0, clearedCustomers: 0, clearedTickets: 0 };
  
  try {
    // Clear Orders
    const ordersSnap = await getDocs(collection(db, ORDERS_COL));
    for (const d of ordersSnap.docs) {
      await deleteDoc(d.ref);
      result.clearedOrders++;
    }

    // Clear Security Logs
    const logsSnap = await getDocs(collection(db, SECURITY_LOGS_COL));
    for (const d of logsSnap.docs) {
      await deleteDoc(d.ref);
      result.clearedLogs++;
    }

    // Clear Customers
    const custSnap = await getDocs(collection(db, CUSTOMERS_COL));
    for (const d of custSnap.docs) {
      await deleteDoc(d.ref);
      result.clearedCustomers++;
    }

    // Clear Tickets
    const ticketSnap = await getDocs(collection(db, TICKETS_COL));
    for (const d of ticketSnap.docs) {
      await deleteDoc(d.ref);
      result.clearedTickets++;
    }
  } catch (err) {
    console.error('Error purging demo data from Firestore:', err);
    throw err;
  }

  return result;
}


