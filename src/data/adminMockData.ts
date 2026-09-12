import { AdminOrder, SecurityLog, CustomerRecord, SupportTicket } from '../types';
import { MOCK_PRODUCTS } from './products';

export const INITIAL_ORDERS: AdminOrder[] = [
  {
    id: 'ORD-98211',
    customerName: 'Elena Rostova',
    customerEmail: 'elena.r@luxury.design',
    items: [
      {
        id: '1-Midnight-M',
        product: MOCK_PRODUCTS[0],
        selectedColor: MOCK_PRODUCTS[0].colors[0],
        selectedSize: 'M',
        quantity: 1,
      },
      {
        id: '3-Stone-Default',
        product: MOCK_PRODUCTS[2],
        selectedColor: MOCK_PRODUCTS[2].colors[0],
        quantity: 1,
      }
    ],
    subtotal: 310,
    total: 334.80,
    status: 'Processing',
    paymentGateway: 'Card (256-bit SSL)',
    date: '2026-08-12 18:42',
    shippingAddress: '450 Sutter St, San Francisco, CA 94108',
    trackingNumber: 'TRK-99201481US',
  },
  {
    id: 'ORD-98210',
    customerName: 'Marcus Vance',
    customerEmail: 'm.vance@architects.io',
    items: [
      {
        id: '2-Sand-42',
        product: MOCK_PRODUCTS[1],
        selectedColor: MOCK_PRODUCTS[1].colors[0],
        selectedSize: '42',
        quantity: 1,
      }
    ],
    subtotal: 195,
    total: 210.60,
    status: 'Shipped',
    paymentGateway: 'Apple Pay',
    date: '2026-08-12 15:18',
    shippingAddress: '1200 Market St, San Francisco, CA 94102',
    trackingNumber: 'TRK-88310492US',
  },
  {
    id: 'ORD-98209',
    customerName: 'Sophia Chen',
    customerEmail: 'sophia.chen@example.com',
    items: [
      {
        id: '4-Charcoal-Default',
        product: MOCK_PRODUCTS[3],
        selectedColor: MOCK_PRODUCTS[3].colors[0],
        quantity: 1,
      }
    ],
    subtotal: 280,
    total: 302.40,
    status: 'Delivered',
    paymentGateway: 'PayPal Express',
    date: '2026-08-11 11:05',
    shippingAddress: '100 Montgomery St, San Francisco, CA 94104',
    trackingNumber: 'TRK-77120391US',
  },
  {
    id: 'ORD-98208',
    customerName: 'David K. Miller',
    customerEmail: 'd.miller@techventures.co',
    items: [
      {
        id: '5-Onyx-Default',
        product: MOCK_PRODUCTS[4],
        selectedColor: MOCK_PRODUCTS[4].colors[0],
        quantity: 2,
      }
    ],
    subtotal: 680,
    total: 734.40,
    status: 'Delivered',
    paymentGateway: 'Klarna (4 Payments)',
    date: '2026-08-10 09:30',
    shippingAddress: '88 Colin P Kelly Jr St, San Francisco, CA 94107',
    trackingNumber: 'TRK-66481029US',
  },
  {
    id: 'ORD-98207',
    customerName: 'Aria Montgomery',
    customerEmail: 'aria.m@studio.com',
    items: [
      {
        id: '1-Midnight-S',
        product: MOCK_PRODUCTS[0],
        selectedColor: MOCK_PRODUCTS[0].colors[0],
        selectedSize: 'S',
        quantity: 1,
      }
    ],
    subtotal: 185,
    total: 199.80,
    status: 'Pending',
    paymentGateway: 'Card (256-bit SSL)',
    date: '2026-08-12 19:10',
    shippingAddress: '742 Evergreen Terrace, Springfield, OR 97477',
  }
];

export const INITIAL_SECURITY_LOGS: SecurityLog[] = [
  {
    id: 'SEC-109',
    timestamp: '2026-08-12 19:22:10',
    action: 'Admin Session Authenticated via Security PIN Gate',
    category: 'Auth',
    severity: 'info',
    ipAddress: '192.168.1.104 (Authenticated Session)',
    user: 'Master Admin (axe426622@gmail.com)',
  },
  {
    id: 'SEC-108',
    timestamp: '2026-08-12 18:42:01',
    action: 'Payment Webhook Verified & SSL Check Passed for ORD-98211',
    category: 'Order',
    severity: 'info',
    ipAddress: '54.210.12.99 (Stripe Webhook Gateway)',
    user: 'Payment System Bot',
  },
  {
    id: 'SEC-107',
    timestamp: '2026-08-12 16:05:44',
    action: 'Inventory Low-Stock Warning Triggered (AURA Knit Cardigan)',
    category: 'Inventory',
    severity: 'warning',
    ipAddress: 'Internal System Engine',
    user: 'Automated Monitor',
  },
  {
    id: 'SEC-106',
    timestamp: '2026-08-12 14:15:20',
    action: 'Store Tax Rate & Express Shipping Rules Updated',
    category: 'Settings',
    severity: 'info',
    ipAddress: '192.168.1.104',
    user: 'Master Admin',
  },
  {
    id: 'SEC-105',
    timestamp: '2026-08-11 22:11:05',
    action: 'Failed Login Attempt (Invalid PIN 9999)',
    category: 'Auth',
    severity: 'warning',
    ipAddress: '185.220.101.5 (Blocked Range)',
    user: 'Unknown / External',
  },
];

export const INITIAL_CUSTOMERS: CustomerRecord[] = [
  {
    id: 'CUST-1001',
    name: 'Elena Rostova',
    email: 'elena.r@luxury.design',
    totalOrders: 6,
    totalSpent: 1840.00,
    status: 'VIP',
    lastOrderDate: '2026-08-12',
  },
  {
    id: 'CUST-1002',
    name: 'Marcus Vance',
    email: 'm.vance@architects.io',
    totalOrders: 4,
    totalSpent: 920.50,
    status: 'Regular',
    lastOrderDate: '2026-08-12',
  },
  {
    id: 'CUST-1003',
    name: 'Sophia Chen',
    email: 'sophia.chen@example.com',
    totalOrders: 9,
    totalSpent: 2650.00,
    status: 'VIP',
    lastOrderDate: '2026-08-11',
  },
  {
    id: 'CUST-1004',
    name: 'David K. Miller',
    email: 'd.miller@techventures.co',
    totalOrders: 2,
    totalSpent: 680.00,
    status: 'Regular',
    lastOrderDate: '2026-08-10',
  },
  {
    id: 'CUST-1005',
    name: 'Aria Montgomery',
    email: 'aria.m@studio.com',
    totalOrders: 1,
    totalSpent: 185.00,
    status: 'New',
    lastOrderDate: '2026-08-12',
  },
];

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'TCK-501',
    customerName: 'Elena Rostova',
    customerEmail: 'elena.r@luxury.design',
    subject: 'Request for custom gift wrapping on ORD-98211',
    message: 'Could you please enclose a personalized ribbon note with this order?',
    date: '2026-08-12 18:50',
    status: 'Open',
  },
  {
    id: 'TCK-500',
    customerName: 'Marcus Vance',
    customerEmail: 'm.vance@architects.io',
    subject: 'Tracking update for Sand Suede Loafers',
    message: 'Hi team, checking if tracking number is live on FedEx yet?',
    date: '2026-08-12 16:10',
    status: 'In Progress',
  },
  {
    id: 'TCK-499',
    customerName: 'David K. Miller',
    customerEmail: 'd.miller@techventures.co',
    subject: 'Inquiry on bulk ordering Noise-Canceling Headphones',
    message: 'We want to order 15 units for our corporate team retreat.',
    date: '2026-08-11 14:22',
    status: 'Resolved',
  },
];

export const SALES_CHART_DATA = [
  { month: 'Mar', sales: 12400, orders: 84, revenue: 14200 },
  { month: 'Apr', sales: 15800, orders: 110, revenue: 18100 },
  { month: 'May', sales: 18200, orders: 135, revenue: 21500 },
  { month: 'Jun', sales: 22400, orders: 162, revenue: 26800 },
  { month: 'Jul', sales: 28900, orders: 210, revenue: 34100 },
  { month: 'Aug (YTD)', sales: 34500, orders: 265, revenue: 41800 },
];

export const CATEGORY_DISTRIBUTION = [
  { name: 'Apparel', value: 38, color: '#10b981' },
  { name: 'Footwear', value: 24, color: '#3b82f6' },
  { name: 'Accessories', value: 18, color: '#f59e0b' },
  { name: 'Home & Living', value: 12, color: '#ec4899' },
  { name: 'Audio & Tech', value: 8, color: '#8b5cf6' },
];

export interface ConversionTrendPoint {
  date: string;
  conversionRate: number;
  visitors: number;
  ordersCount: number;
  cartAddRate: number;
}

export const CONVERSION_TREND_DATA: ConversionTrendPoint[] = [
  { date: 'Aug 05', conversionRate: 2.8, visitors: 1350, ordersCount: 38, cartAddRate: 7.2 },
  { date: 'Aug 06', conversionRate: 3.1, visitors: 1480, ordersCount: 46, cartAddRate: 7.8 },
  { date: 'Aug 07', conversionRate: 3.3, visitors: 1620, ordersCount: 53, cartAddRate: 8.1 },
  { date: 'Aug 08', conversionRate: 3.0, visitors: 1540, ordersCount: 46, cartAddRate: 7.5 },
  { date: 'Aug 09', conversionRate: 3.6, visitors: 1790, ordersCount: 64, cartAddRate: 8.9 },
  { date: 'Aug 10', conversionRate: 3.9, visitors: 1910, ordersCount: 74, cartAddRate: 9.4 },
  { date: 'Aug 11', conversionRate: 3.7, visitors: 1850, ordersCount: 68, cartAddRate: 9.1 },
  { date: 'Aug 12', conversionRate: 4.2, visitors: 2050, ordersCount: 86, cartAddRate: 10.2 },
];

