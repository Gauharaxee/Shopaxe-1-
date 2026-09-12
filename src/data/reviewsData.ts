import { Review } from '../types';

export const INITIAL_REVIEWS_BY_PRODUCT: Record<string, Review[]> = {
  'prod-1': [
    {
      id: 'rev-101',
      author: 'Marcus Vance',
      rating: 5,
      date: '2026-08-04T14:32:00Z',
      comment: 'The active noise cancellation is remarkable. I wear these on cross-country flights and the acoustic transparency mode makes switching between focus and conversation effortless. Acoustic fidelity is crisp without overhyped bass.',
      verifiedPurchase: true,
    },
    {
      id: 'rev-102',
      author: 'Elena Rostova',
      rating: 5,
      date: '2026-07-28T09:15:00Z',
      comment: 'Milled aluminum construction feels ultra-premium in hand. Memory foam cushions don\'t pinch even after 8 hours of continuous wear during work.',
      verifiedPurchase: true,
    },
    {
      id: 'rev-103',
      author: 'David Chen',
      rating: 4,
      date: '2026-07-15T18:40:00Z',
      comment: 'Superb sound stage and multi-point Bluetooth pairs instantly to both my laptop and phone. Only minor feedback is the magnetic travel case is slightly bulky in a slim briefcase.',
      verifiedPurchase: true,
    },
  ],
  'prod-2': [
    {
      id: 'rev-201',
      author: 'Chloe Bennett',
      rating: 5,
      date: '2026-08-01T11:20:00Z',
      comment: '480gsm French terry organic cotton gives this hoodie an unbelievable weight and architectural drape. The hidden interior key pocket in the kangaroo pouch is a genius touch.',
      verifiedPurchase: true,
    },
    {
      id: 'rev-202',
      author: 'Julian Thorne',
      rating: 5,
      date: '2026-07-22T16:05:00Z',
      comment: 'Minimalist boxy silhouette without aggressive branding. Fits true to size with double-layered hood structure that holds shape perfectly.',
      verifiedPurchase: true,
    },
  ],
  'prod-3': [
    {
      id: 'rev-301',
      author: 'Sora Takahashi',
      rating: 5,
      date: '2026-08-08T08:00:00Z',
      comment: 'Handcrafted matte stoneware dripper ensures balanced extraction temperature. Pairs elegantly with the cork insulated collar carafe on my morning coffee desk setup.',
      verifiedPurchase: true,
    },
    {
      id: 'rev-302',
      author: 'Hannah Miller',
      rating: 4,
      date: '2026-07-30T19:50:00Z',
      comment: 'Clean minimalist design and easy to clean. Flow rate is precise. Highly recommended for pour-over enthusiasts.',
      verifiedPurchase: true,
    },
  ],
  'prod-4': [
    {
      id: 'rev-401',
      author: 'Alexandre Dubois',
      rating: 5,
      date: '2026-08-09T15:10:00Z',
      comment: 'Solid 6063 CNC aluminum chassis feels like a tank. The gasket mount and dampening foam produce a deep, muted thock without any metallic ping.',
      verifiedPurchase: true,
    },
    {
      id: 'rev-402',
      author: 'Priya Patel',
      rating: 5,
      date: '2026-08-02T13:45:00Z',
      comment: 'Keycaps feel silky and hot-swappable PCB allowed me to test linear switches easily. Battery life over wireless Bluetooth easily lasts 2 weeks of full workdays.',
      verifiedPurchase: true,
    },
  ],
};
