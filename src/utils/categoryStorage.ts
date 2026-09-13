import { Category, Product } from '../types';
import { CATEGORIES as DEFAULT_CATEGORIES } from '../data/products';

const STORAGE_KEY = 'aura_custom_categories';

// Curated luxury aesthetic presets for quick category image selection
export const CATEGORY_IMAGE_PRESETS: Array<{ label: string; url: string }> = [
  {
    label: 'Jewelry & Timepieces',
    url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800',
  },
  {
    label: 'Leather Bags & Travel',
    url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800',
  },
  {
    label: 'Fragrance & Grooming',
    url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800',
  },
  {
    label: 'Eyewear & Sunglasses',
    url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800',
  },
  {
    label: 'Apparel & Knitwear',
    url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800',
  },
  {
    label: 'Home & Ceramics',
    url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800',
  },
  {
    label: 'Audio & Gadgets',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
  },
  {
    label: 'Footwear & Boots',
    url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800',
  },
  {
    label: 'Wellness & Rituals',
    url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800',
  },
];

export function getCustomCategories(): Category[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to load custom categories:', err);
  }
  return [];
}

export function saveCustomCategory(category: Category): Category[] {
  try {
    const existing = getCustomCategories();
    // Check if category with same name or id already exists
    const normalizedName = category.name.trim().toLowerCase();
    const filtered = existing.filter(
      (c) => c.id.toLowerCase() !== category.id.toLowerCase() && c.name.trim().toLowerCase() !== normalizedName
    );
    const updated = [...filtered, category];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('aura_categories_updated', { detail: updated }));
    return updated;
  } catch (err) {
    console.warn('Failed to save custom category:', err);
    return getCustomCategories();
  }
}

export function getAllCategories(products: Product[] = []): Category[] {
  const custom = getCustomCategories();
  
  // Combine default and custom categories, deduplicated by id
  const map = new Map<string, Category>();
  
  DEFAULT_CATEGORIES.forEach((cat) => {
    map.set(cat.id, { ...cat });
  });

  custom.forEach((cat) => {
    map.set(cat.id, { ...cat });
  });

  // Also include any categories found in products that might not be in the map
  products.forEach((p) => {
    if (p.category && !map.has(p.category)) {
      const slug = p.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      map.set(p.category, {
        id: p.category,
        name: p.category,
        slug,
        itemCount: 0,
        image: p.image || CATEGORY_IMAGE_PRESETS[0].url,
        description: `${p.category} Department Collection`,
      });
    }
  });

  // Recalculate dynamic item counts
  const allList = Array.from(map.values());
  return allList.map((cat) => {
    if (cat.id === 'all') {
      return {
        ...cat,
        itemCount: products.length,
      };
    }
    const count = products.filter((p) => p.category === cat.id).length;
    return {
      ...cat,
      itemCount: count,
    };
  });
}
