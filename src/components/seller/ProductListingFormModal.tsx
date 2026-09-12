import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Trash2,
  Check,
  Sparkles,
  RefreshCw,
  DollarSign,
  Package,
  Tag,
  Layers,
  Eye,
  Sliders,
  Palette,
  Ruler,
  ListPlus,
  Zap,
  FileText,
  Percent,
  Copy,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
} from 'lucide-react';
import { Product, ProductColor } from '../../types';
import { ImageUploadInput } from './ImageUploadInput';

interface ProductListingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  initialProduct?: Product | null;
}

// Preset Luxury Templates for 1-Click Fast Populating
const LISTING_TEMPLATES: Array<{
  name: string;
  category: Product['category'];
  data: Partial<Product> & { detailsList: string[] };
}> = [
  {
    name: 'Cashmere Knit Overshirt',
    category: 'Apparel',
    data: {
      name: 'Structured Cashmere Blend Overshirt',
      category: 'Apparel',
      price: 185,
      originalPrice: 220,
      stockCount: 30,
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800',
      secondaryImage: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800',
      colors: [
        { name: 'Onyx Black', hex: '#18181b' },
        { name: 'Off-White', hex: '#fafaf9' },
        { name: 'Camel Tan', hex: '#b45309' },
      ],
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      description: 'Crafted from an ultra-soft Italian cashmere and organic cotton blend, featuring horn buttons and structured minimalist silhouette.',
      detailsList: [
        '70% GOTS Organic Cotton, 30% Mongolian Cashmere',
        'Custom engraved horn button closures',
        'Double-needle topstitched reinforced seams',
        'Dry clean or delicate hand wash cold',
      ],
      isNew: true,
      isBestseller: false,
    },
  },
  {
    name: 'Italian Leather Chelsea Boot',
    category: 'Footwear',
    data: {
      name: 'Artisanal Italian Leather Chelsea Boot',
      category: 'Footwear',
      price: 245,
      originalPrice: 295,
      stockCount: 18,
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800',
      secondaryImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
      colors: [
        { name: 'Espresso Brown', hex: '#451a03' },
        { name: 'Onyx Black', hex: '#18181b' },
      ],
      sizes: ['US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12'],
      description: 'Handcrafted in Tuscany with full-grain calfskin leather and Goodyear-welted Vibram lug soles for all-weather traction and timeless elegance.',
      detailsList: [
        '100% Full-grain Tuscan calfskin leather',
        'Goodyear-welted construction (resolable)',
        'Custom memory-foam cushioned insole',
        'Elasticized side gussets for effortless fit',
      ],
      isNew: false,
      isBestseller: true,
    },
  },
  {
    name: 'Studio Wireless Headphones',
    category: 'Audio & Tech',
    data: {
      name: 'Acoustic Precision Studio Headphones',
      category: 'Audio & Tech',
      price: 299,
      originalPrice: 350,
      stockCount: 22,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
      secondaryImage: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=800',
      colors: [
        { name: 'Space Gray', hex: '#374151' },
        { name: 'Matte Silver', hex: '#cbd5e1' },
        { name: 'Champagne Gold', hex: '#d97706' },
      ],
      sizes: ['Universal Fit'],
      description: 'High-fidelity 45mm beryllium neodymium acoustic drivers with hybrid active noise cancellation and 40-hour lossless battery life.',
      detailsList: [
        'Custom 45mm Beryllium Acoustic Neodymium Drivers',
        'Lossless Bluetooth 5.3 with aptX HD & AAC decoding',
        '40-Hour continuous playback on single charge',
        'Aircraft-grade machined aluminum and memory foam earcups',
      ],
      isNew: true,
      isBestseller: true,
    },
  },
  {
    name: 'Minimalist Chronograph Timepiece',
    category: 'Accessories',
    data: {
      name: 'Monolithic Sapphire Chronograph Watch',
      category: 'Accessories',
      price: 320,
      originalPrice: 380,
      stockCount: 15,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
      secondaryImage: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=800',
      colors: [
        { name: 'Brushed Steel', hex: '#94a3b8' },
        { name: 'Obsidian Black', hex: '#0f172a' },
      ],
      sizes: ['40mm Case', '42mm Case'],
      description: 'Architectural chronograph featuring a domed anti-reflective sapphire crystal, surgical 316L stainless steel, and Swiss Ronda movement.',
      detailsList: [
        'Scratch-resistant domed Sapphire crystal glass',
        '316L Surgical grade brushed stainless steel case',
        'Swiss-made Ronda 5030.D Quartz Chronograph movement',
        '5 ATM (50m) Water resistance rating',
      ],
      isNew: true,
      isBestseller: false,
    },
  },
  {
    name: 'Ceramic Stoneware Table Lamp',
    category: 'Home & Living',
    data: {
      name: 'Sculptural Textured Ceramic Table Lamp',
      category: 'Home & Living',
      price: 165,
      originalPrice: 195,
      stockCount: 14,
      image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800',
      secondaryImage: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800',
      colors: [
        { name: 'Raw Sandstone', hex: '#e7e5e4' },
        { name: 'Terracotta Clay', hex: '#9a3412' },
      ],
      sizes: ['Standard Medium', 'Large Sculptural'],
      description: 'Hand-thrown unglazed stoneware lamp base with a textured woven linen drum shade, delivering warm diffused ambient illumination.',
      detailsList: [
        'Hand-thrown textured matte ceramic body',
        'Natural unbleached textured linen shade',
        'Integrated rotary dimmer switch with braided cord',
        'E26 warm amber LED bulb included (2700K)',
      ],
      isNew: false,
      isBestseller: false,
    },
  },
];

const PRESET_COLOR_SWATCHES: ProductColor[] = [
  { name: 'Onyx Black', hex: '#18181b' },
  { name: 'Off-White', hex: '#fafaf9' },
  { name: 'Heather Grey', hex: '#64748b' },
  { name: 'Camel Tan', hex: '#b45309' },
  { name: 'Olive Forest', hex: '#365314' },
  { name: 'Royal Navy', hex: '#1e3a8a' },
  { name: 'Espresso Brown', hex: '#451a03' },
  { name: 'Burgundy Wine', hex: '#881337' },
  { name: 'Sage Green', hex: '#4d7c0f' },
  { name: 'Rose Blush', hex: '#e11d48' },
  { name: 'Champagne Gold', hex: '#d97706' },
  { name: 'Charcoal Slate', hex: '#334155' },
];

const STANDARD_APPAREL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
const STANDARD_FOOTWEAR_SIZES = ['US 6', 'US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12', 'US 13'];
const STANDARD_TECH_HOME_SIZES = ['One Size', 'Universal Fit', 'Compact', 'Standard', 'Large'];

export const ProductListingFormModal: React.FC<ProductListingFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProduct,
}) => {
  const isEditing = Boolean(initialProduct);

  // Tabbed sections for organized workflow
  const [activeStep, setActiveStep] = useState<'basic' | 'pricing' | 'variants' | 'specs' | 'preview'>('basic');

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Product['category']>('Apparel');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState<number>(120);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(150);
  const [costPerItem, setCostPerItem] = useState<number | undefined>(45);
  const [stockCount, setStockCount] = useState<number>(25);
  const [inStock, setInStock] = useState<boolean>(true);
  const [isNew, setIsNew] = useState<boolean>(true);
  const [isBestseller, setIsBestseller] = useState<boolean>(false);
  const [image, setImage] = useState('');
  const [secondaryImage, setSecondaryImage] = useState('');
  const [description, setDescription] = useState('');
  const [details, setDetails] = useState<string[]>([
    '100% GOTS Organic Certified Material',
    'Handcrafted with reinforced structural seams',
    'Machine wash cold gentle cycle',
  ]);
  const [newDetailInput, setNewDetailInput] = useState('');

  // Colors & Sizes
  const [colors, setColors] = useState<ProductColor[]>([
    { name: 'Onyx Black', hex: '#18181b' },
    { name: 'Off-White', hex: '#fafaf9' },
  ]);
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#2563eb');
  const [sizes, setSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);
  const [customSizeInput, setCustomSizeInput] = useState('');

  // SEO & Tags
  const [searchTags, setSearchTags] = useState('minimalist, luxury, organic, essential');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [copySkuSuccess, setCopySkuSuccess] = useState(false);

  // Initialize or reset form based on initialProduct
  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name);
      setCategory(initialProduct.category);
      setSku(initialProduct.sku || generateSku(initialProduct.category));
      setPrice(initialProduct.price);
      setOriginalPrice(initialProduct.originalPrice);
      setStockCount(initialProduct.stockCount);
      setInStock(initialProduct.inStock);
      setIsNew(Boolean(initialProduct.isNew));
      setIsBestseller(Boolean(initialProduct.isBestseller));
      setImage(initialProduct.image);
      setSecondaryImage(initialProduct.secondaryImage || '');
      setDescription(initialProduct.description);
      setDetails(initialProduct.details && initialProduct.details.length > 0 ? initialProduct.details : [
        '100% Sustainable Organic Textile',
        'Handcrafted seams for long-lasting durability',
        'Machine wash cold gentle cycle',
      ]);
      setColors(initialProduct.colors && initialProduct.colors.length > 0 ? initialProduct.colors : [
        { name: 'Onyx Black', hex: '#18181b' },
        { name: 'Off-White', hex: '#fafaf9' },
      ]);
      setSizes(initialProduct.sizes || ['S', 'M', 'L', 'XL']);
    } else {
      resetForm();
    }
  }, [initialProduct, isOpen]);

  const generateSku = (cat: string = category) => {
    const prefix = cat.slice(0, 3).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `AXE-${prefix}-${randomNum}`;
  };

  const resetForm = () => {
    setName('');
    setCategory('Apparel');
    setSku(generateSku('Apparel'));
    setPrice(120);
    setOriginalPrice(150);
    setCostPerItem(45);
    setStockCount(25);
    setInStock(true);
    setIsNew(true);
    setIsBestseller(false);
    setImage('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800');
    setSecondaryImage('');
    setDescription('Premium handcrafted minimalist garment made with organic sustainable fabrics.');
    setDetails([
      '100% GOTS Organic Certified Material',
      'Handcrafted with reinforced structural seams',
      'Machine wash cold gentle cycle',
    ]);
    setColors([
      { name: 'Onyx Black', hex: '#18181b' },
      { name: 'Off-White', hex: '#fafaf9' },
    ]);
    setSizes(['S', 'M', 'L', 'XL']);
    setActiveStep('basic');
    setValidationErrors([]);
  };

  const handleApplyTemplate = (template: (typeof LISTING_TEMPLATES)[0]) => {
    setName(template.data.name || '');
    setCategory(template.category);
    setSku(generateSku(template.category));
    setPrice(template.data.price || 99);
    setOriginalPrice(template.data.originalPrice);
    setStockCount(template.data.stockCount || 20);
    setInStock(true);
    setImage(template.data.image || '');
    setSecondaryImage(template.data.secondaryImage || '');
    setDescription(template.data.description || '');
    setDetails(template.data.detailsList || []);
    setColors(template.data.colors || [{ name: 'Onyx Black', hex: '#18181b' }]);
    setSizes(template.data.sizes || ['One Size']);
    setIsNew(Boolean(template.data.isNew));
    setIsBestseller(Boolean(template.data.isBestseller));
  };

  // Color actions
  const handleTogglePresetColor = (swatch: ProductColor) => {
    const exists = colors.some((c) => c.name.toLowerCase() === swatch.name.toLowerCase());
    if (exists) {
      if (colors.length > 1) {
        setColors(colors.filter((c) => c.name.toLowerCase() !== swatch.name.toLowerCase()));
      }
    } else {
      setColors([...colors, swatch]);
    }
  };

  const handleAddCustomColor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customColorName.trim()) return;
    const newColor: ProductColor = {
      name: customColorName.trim(),
      hex: customColorHex,
    };
    if (!colors.some((c) => c.name.toLowerCase() === newColor.name.toLowerCase())) {
      setColors([...colors, newColor]);
      setCustomColorName('');
    }
  };

  const handleRemoveColor = (indexToRemove: number) => {
    if (colors.length <= 1) return;
    setColors(colors.filter((_, idx) => idx !== indexToRemove));
  };

  // Size actions
  const handleToggleSize = (sizeOption: string) => {
    if (sizes.includes(sizeOption)) {
      setSizes(sizes.filter((s) => s !== sizeOption));
    } else {
      setSizes([...sizes, sizeOption]);
    }
  };

  const handleAddCustomSize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSizeInput.trim()) return;
    if (!sizes.includes(customSizeInput.trim())) {
      setSizes([...sizes, customSizeInput.trim()]);
      setCustomSizeInput('');
    }
  };

  // Details actions
  const handleAddDetail = () => {
    if (!newDetailInput.trim()) return;
    setDetails([...details, newDetailInput.trim()]);
    setNewDetailInput('');
  };

  const handleRemoveDetail = (indexToRemove: number) => {
    setDetails(details.filter((_, idx) => idx !== indexToRemove));
  };

  // Validation
  const validateForm = (): boolean => {
    const errors: string[] = [];
    if (!name.trim()) errors.push('Product title is required.');
    if (!price || price <= 0) errors.push('Valid retail price is required.');
    if (!image.trim()) errors.push('Primary hero image is required.');
    if (!sku.trim()) errors.push('Product SKU is required.');
    if (colors.length === 0) errors.push('At least one color variant is required.');
    if (!description.trim()) errors.push('Product description is required.');

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      setActiveStep('basic');
      return;
    }

    const finalProduct: Product = {
      id: initialProduct ? initialProduct.id : `prod-${Date.now()}`,
      name: name.trim(),
      category,
      price: Number(price),
      originalPrice: originalPrice && originalPrice > price ? Number(originalPrice) : undefined,
      rating: initialProduct ? initialProduct.rating : 5.0,
      reviewCount: initialProduct ? initialProduct.reviewCount : 1,
      image: image.trim(),
      secondaryImage: secondaryImage.trim() || undefined,
      colors,
      sizes: sizes.length > 0 ? sizes : undefined,
      description: description.trim(),
      details: details.length > 0 ? details : ['Handcrafted premium essential.', 'Dry clean or cold wash.'],
      isNew,
      isBestseller,
      inStock: stockCount > 0 && inStock,
      stockCount: Number(stockCount),
      sku: sku.trim().toUpperCase(),
    };

    onSave(finalProduct);
    onClose();
  };

  if (!isOpen) return null;

  // Margin Calculation
  const estimatedMarginPercent = costPerItem && price > costPerItem
    ? Math.round(((price - costPerItem) / price) * 100)
    : null;
  const estimatedProfit = costPerItem && price > costPerItem
    ? (price - costPerItem).toFixed(2)
    : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-neutral-950/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-5xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Top Bar Header */}
          <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                    {isEditing ? 'Edit Product Listing' : 'List New Product to Catalog'}
                  </h2>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold border ${
                    isEditing
                      ? 'bg-blue-950 text-blue-400 border-blue-800'
                      : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  }`}>
                    {isEditing ? 'Editing SKU' : 'New Listing'}
                  </span>
                </div>
                <p className="text-xs text-neutral-400">
                  Comprehensive listing form with image uploads, pricing, variants, and live preview.
                </p>
              </div>
            </div>

            {/* Quick Template Picker & Close */}
            <div className="flex items-center gap-2">
              {!isEditing && (
                <div className="relative group">
                  <button
                    type="button"
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-bold text-xs rounded-xl border border-neutral-700 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Quick Fill Template</span>
                    <ChevronDown className="w-3 h-3 text-neutral-400" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-64 bg-neutral-950 border border-neutral-800 rounded-2xl shadow-xl p-2 hidden group-hover:block z-30 space-y-1">
                    <p className="text-[10px] text-neutral-400 px-2 py-1 font-semibold uppercase tracking-wider">
                      Select Luxury Preset:
                    </p>
                    {LISTING_TEMPLATES.map((tmpl) => (
                      <button
                        key={tmpl.name}
                        type="button"
                        onClick={() => handleApplyTemplate(tmpl)}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-neutral-800 text-xs text-neutral-200 flex items-center justify-between transition-colors"
                      >
                        <span className="font-medium truncate">{tmpl.name}</span>
                        <span className="text-[10px] text-amber-400 font-mono">${tmpl.data.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={onClose}
                className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Step Navigation Tabs */}
          <div className="px-6 py-2.5 bg-neutral-950 border-b border-neutral-800 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setActiveStep('basic')}
              className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeStep === 'basic'
                  ? 'bg-amber-500 text-neutral-950 shadow'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>1. Basic Info & Media</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep('pricing')}
              className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeStep === 'pricing'
                  ? 'bg-amber-500 text-neutral-950 shadow'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>2. Pricing & Stock</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep('variants')}
              className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeStep === 'variants'
                  ? 'bg-amber-500 text-neutral-950 shadow'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>3. Colors & Sizes ({colors.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep('specs')}
              className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeStep === 'specs'
                  ? 'bg-amber-500 text-neutral-950 shadow'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <ListPlus className="w-3.5 h-3.5" />
              <span>4. Details & Specs ({details.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep('preview')}
              className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeStep === 'preview'
                  ? 'bg-amber-500 text-neutral-950 shadow'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>5. Live Preview</span>
            </button>
          </div>

          {/* Validation Banner if errors */}
          {validationErrors.length > 0 && (
            <div className="mx-6 mt-4 p-3.5 bg-rose-950/80 border border-rose-800 rounded-2xl flex items-start gap-3 text-xs text-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-white">Please resolve the following before saving:</p>
                <ul className="list-disc list-inside text-[11px] text-rose-300">
                  {validationErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Form Content Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* STEP 1: BASIC INFO & MEDIA */}
            {activeStep === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left 2 Cols: Text inputs */}
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <label className="block text-neutral-300 font-bold text-xs mb-1.5">
                        Product Title <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Minimalist Cashmere Overshirt"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-2xl text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
                      />
                      <p className="text-[11px] text-neutral-500 mt-1">
                        Use a descriptive, distinct title for storefront searchability.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-neutral-300 font-bold text-xs mb-1.5">
                          Department Category <span className="text-rose-400">*</span>
                        </label>
                        <select
                          value={category}
                          onChange={(e) => {
                            const newCat = e.target.value as Product['category'];
                            setCategory(newCat);
                            if (!isEditing) setSku(generateSku(newCat));
                          }}
                          className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-2xl text-white text-xs focus:outline-none focus:border-amber-400"
                        >
                          <option value="Apparel">Apparel (Knitwear, Tops, Outerwear)</option>
                          <option value="Footwear">Footwear (Boots, Sneakers, Loafers)</option>
                          <option value="Accessories">Accessories (Watches, Eyewear, Leather)</option>
                          <option value="Home & Living">Home & Living (Ceramics, Lighting, Decor)</option>
                          <option value="Audio & Tech">Audio & Tech (Acoustics, Gadgets)</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-neutral-300 font-bold text-xs">
                            SKU Code <span className="text-rose-400">*</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setSku(generateSku(category))}
                            className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Auto-Gen</span>
                          </button>
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={sku}
                            onChange={(e) => setSku(e.target.value.toUpperCase())}
                            placeholder="e.g. AXE-APP-4821"
                            className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-2xl text-white text-xs font-mono uppercase focus:outline-none focus:border-amber-400"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(sku);
                              setCopySkuSuccess(true);
                              setTimeout(() => setCopySkuSuccess(false), 2000);
                            }}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                            title="Copy SKU"
                          >
                            {copySkuSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-neutral-300 font-bold text-xs mb-1.5">
                        Product Description <span className="text-rose-400">*</span>
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Detailed narrative describing craftsmanship, fabric weave, cut, and aesthetic..."
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-2xl text-white text-xs focus:outline-none focus:border-amber-400 resize-none"
                      />
                    </div>
                  </div>

                  {/* Right Col: Primary Image Upload */}
                  <div className="space-y-4 bg-neutral-950/60 p-4 rounded-3xl border border-neutral-800/80">
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-amber-400" />
                      <span>Primary Hero Image</span>
                    </h3>

                    <ImageUploadInput
                      value={image}
                      onChange={(imgUrl) => setImage(imgUrl)}
                      label="Upload or Paste Hero Image"
                    />

                    <div className="pt-2 border-t border-neutral-800">
                      <label className="block text-neutral-400 font-semibold text-xs mb-1.5">
                        Secondary Angle / Hover Image (Optional)
                      </label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/... (Hover Angle)"
                        value={secondaryImage}
                        onChange={(e) => setSecondaryImage(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                      />
                      {secondaryImage && (
                        <div className="mt-2 flex items-center gap-2 p-1.5 bg-neutral-900 rounded-xl border border-neutral-800">
                          <img
                            src={secondaryImage}
                            alt="Secondary Angle"
                            className="w-10 h-10 rounded-lg object-cover bg-neutral-800"
                            referrerPolicy="no-referrer"
                          />
                          <span className="text-[10px] text-neutral-400 truncate flex-1">Hover image configured</span>
                          <button
                            type="button"
                            onClick={() => setSecondaryImage('')}
                            className="p-1 text-neutral-500 hover:text-rose-400"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: PRICING & INVENTORY */}
            {activeStep === 'pricing' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Retail Price */}
                  <div className="bg-neutral-950 p-4 rounded-3xl border border-neutral-800 space-y-2">
                    <label className="block text-neutral-300 font-bold text-xs">
                      Retail Selling Price ($ USD) <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-mono">$</span>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        required
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <p className="text-[10px] text-neutral-500">Customer checkout price.</p>
                  </div>

                  {/* Compare-at / Original Price */}
                  <div className="bg-neutral-950 p-4 rounded-3xl border border-neutral-800 space-y-2">
                    <label className="block text-neutral-300 font-bold text-xs">
                      Compare-at Price ($ USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-mono">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={originalPrice || ''}
                        onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="Leave blank if not on sale"
                        className="w-full pl-7 pr-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    {originalPrice && originalPrice > price && (
                      <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <Percent className="w-3 h-3" />
                        <span>Displays {Math.round(((originalPrice - price) / originalPrice) * 100)}% Discount Badge</span>
                      </p>
                    )}
                  </div>

                  {/* Cost per Item (Internal Margin Estimator) */}
                  <div className="bg-neutral-950 p-4 rounded-3xl border border-neutral-800 space-y-2">
                    <label className="block text-neutral-300 font-bold text-xs">
                      Cost per Item (Private)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-mono">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={costPerItem || ''}
                        onChange={(e) => setCostPerItem(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="e.g. 45"
                        className="w-full pl-7 pr-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    {estimatedMarginPercent !== null && (
                      <p className="text-[10px] text-amber-400 font-bold">
                        Est. Margin: {estimatedMarginPercent}% (${estimatedProfit} profit)
                      </p>
                    )}
                  </div>
                </div>

                {/* Stock & Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Stock Quantity */}
                  <div className="bg-neutral-950 p-5 rounded-3xl border border-neutral-800 space-y-3">
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <Package className="w-4 h-4 text-amber-400" />
                      <span>Stock &amp; Inventory Management</span>
                    </h4>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-neutral-400 font-semibold text-xs mb-1">
                          Available Units in Warehouse <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={stockCount}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setStockCount(val);
                            if (val === 0) setInStock(false);
                            else setInStock(true);
                          }}
                          className="w-full px-3.5 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-neutral-900 rounded-2xl border border-neutral-800">
                        <div>
                          <p className="text-xs font-bold text-white">In-Stock Listing Status</p>
                          <p className="text-[10px] text-neutral-400">Allow customers to add item to bag</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setInStock(!inStock)}
                          className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                            inStock && stockCount > 0 ? 'bg-emerald-500' : 'bg-neutral-800'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-neutral-950 rounded-full transition-transform ${
                              inStock && stockCount > 0 ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Highlights & Badges */}
                  <div className="bg-neutral-950 p-5 rounded-3xl border border-neutral-800 space-y-3">
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Storefront Promotion Badges</span>
                    </h4>

                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between p-3 bg-neutral-900 rounded-2xl border border-neutral-800">
                        <div>
                          <p className="text-xs font-bold text-white">Mark as &quot;New Arrival&quot;</p>
                          <p className="text-[10px] text-neutral-400">Shows gold &quot;New Arrival&quot; pill badge</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsNew(!isNew)}
                          className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                            isNew ? 'bg-amber-500' : 'bg-neutral-800'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-neutral-950 rounded-full transition-transform ${
                              isNew ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-neutral-900 rounded-2xl border border-neutral-800">
                        <div>
                          <p className="text-xs font-bold text-white">Mark as &quot;Bestseller&quot;</p>
                          <p className="text-[10px] text-neutral-400">Boosts position and shows popularity badge</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsBestseller(!isBestseller)}
                          className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                            isBestseller ? 'bg-amber-500' : 'bg-neutral-800'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-neutral-950 rounded-full transition-transform ${
                              isBestseller ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: VARIANTS (COLORS & SIZES) */}
            {activeStep === 'variants' && (
              <div className="space-y-6">
                {/* Colors Section */}
                <div className="bg-neutral-950 p-5 rounded-3xl border border-neutral-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Palette className="w-4 h-4 text-amber-400" />
                        <span>Color Options &amp; Swatches ({colors.length})</span>
                      </h3>
                      <p className="text-[11px] text-neutral-400">
                        Click preset swatches or create custom bespoke color hex codes.
                      </p>
                    </div>
                  </div>

                  {/* Active Selected Colors */}
                  <div className="flex flex-wrap items-center gap-2.5 p-3 bg-neutral-900/80 rounded-2xl border border-neutral-800">
                    {colors.map((color, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-3 py-1.5 bg-neutral-950 rounded-xl border border-neutral-700 text-xs shadow-sm"
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-neutral-600 shadow-inner"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="font-bold text-white">{color.name}</span>
                        <span className="text-[10px] text-neutral-500 font-mono">{color.hex}</span>
                        {colors.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveColor(idx)}
                            className="text-neutral-500 hover:text-rose-400 ml-1"
                            title="Remove Color"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Presets Palette Quick-Click */}
                  <div>
                    <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                      Curated Palette Presets:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {PRESET_COLOR_SWATCHES.map((swatch) => {
                        const isSelected = colors.some(
                          (c) => c.name.toLowerCase() === swatch.name.toLowerCase()
                        );
                        return (
                          <button
                            key={swatch.name}
                            type="button"
                            onClick={() => handleTogglePresetColor(swatch)}
                            className={`px-2.5 py-1.5 rounded-xl border text-xs flex items-center gap-2 transition-all ${
                              isSelected
                                ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
                            }`}
                          >
                            <span
                              className="w-3 h-3 rounded-full border border-neutral-600 shrink-0"
                              style={{ backgroundColor: swatch.hex }}
                            />
                            <span className="text-[11px] font-medium truncate">{swatch.name}</span>
                            {isSelected && <Check className="w-3 h-3 text-amber-400 ml-auto shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Add Custom Color Row */}
                  <div className="pt-3 border-t border-neutral-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="color"
                      value={customColorHex}
                      onChange={(e) => setCustomColorHex(e.target.value)}
                      className="w-10 h-9 p-0.5 bg-neutral-900 border border-neutral-700 rounded-xl cursor-pointer"
                      title="Pick custom color"
                    />
                    <input
                      type="text"
                      placeholder="Custom Color Name (e.g. Midnight Teal)"
                      value={customColorName}
                      onChange={(e) => setCustomColorName(e.target.value)}
                      className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomColor}
                      disabled={!customColorName.trim()}
                      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Color</span>
                    </button>
                  </div>
                </div>

                {/* Sizes Section */}
                <div className="bg-neutral-950 p-5 rounded-3xl border border-neutral-800 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Ruler className="w-4 h-4 text-amber-400" />
                      <span>Size &amp; Fit Options</span>
                    </h3>
                    <p className="text-[11px] text-neutral-400">
                      Toggle active size selections or add custom measurements.
                    </p>
                  </div>

                  {/* Standard Category Quick-Presets */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                        Apparel Sizes:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {STANDARD_APPAREL_SIZES.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => handleToggleSize(s)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
                              sizes.includes(s)
                                ? 'bg-amber-500 text-neutral-950 border-amber-500'
                                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                        Footwear Sizes:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {STANDARD_FOOTWEAR_SIZES.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => handleToggleSize(s)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
                              sizes.includes(s)
                                ? 'bg-amber-500 text-neutral-950 border-amber-500'
                                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                        Tech &amp; Home Sizes:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {STANDARD_TECH_HOME_SIZES.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => handleToggleSize(s)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                              sizes.includes(s)
                                ? 'bg-amber-500 text-neutral-950 border-amber-500'
                                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Add Custom Size */}
                  <div className="pt-3 border-t border-neutral-800 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Custom Size (e.g. 42mm, 50ml, Queen)"
                      value={customSizeInput}
                      onChange={(e) => setCustomSizeInput(e.target.value)}
                      className="flex-1 px-3.5 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomSize}
                      disabled={!customSizeInput.trim()}
                      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Size</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: DETAILS & SPECS */}
            {activeStep === 'specs' && (
              <div className="space-y-6">
                <div className="bg-neutral-950 p-5 rounded-3xl border border-neutral-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <ListPlus className="w-4 h-4 text-amber-400" />
                        <span>Key Specifications &amp; Feature Highlights</span>
                      </h3>
                      <p className="text-[11px] text-neutral-400">
                        Rendered as clean bullet points in the product modal and quick view drawer.
                      </p>
                    </div>
                  </div>

                  {/* Add Detail Input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add feature bullet point (e.g. 100% GOTS Organic Cotton)..."
                      value={newDetailInput}
                      onChange={(e) => setNewDetailInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddDetail();
                        }
                      }}
                      className="flex-1 px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={handleAddDetail}
                      disabled={!newDetailInput.trim()}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Spec</span>
                    </button>
                  </div>

                  {/* List of Details */}
                  <div className="space-y-2">
                    {details.map((detail, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 p-3 bg-neutral-900/90 rounded-2xl border border-neutral-800 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                          <span className="text-neutral-200 font-medium truncate">{detail}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDetail(idx)}
                          className="p-1 text-neutral-500 hover:text-rose-400 rounded-lg hover:bg-neutral-800 transition-colors"
                          title="Remove feature"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Search Keywords / SEO */}
                <div className="bg-neutral-950 p-5 rounded-3xl border border-neutral-800 space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Tag className="w-4 h-4 text-amber-400" />
                    <span>Search Discovery Tags (SEO)</span>
                  </h4>
                  <input
                    type="text"
                    value={searchTags}
                    onChange={(e) => setSearchTags(e.target.value)}
                    placeholder="e.g. minimalist, organic, oversized, winter 2026"
                    className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                  <p className="text-[10px] text-neutral-500">
                    Comma-separated keywords matching customer search queries.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 5: LIVE STOREFRONT PREVIEW */}
            {activeStep === 'preview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  {/* Storefront Card Simulation */}
                  <div className="bg-neutral-950 p-5 rounded-3xl border border-neutral-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                        Storefront Product Card Preview
                      </h3>
                      <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
                        Live Simulation
                      </span>
                    </div>

                    <div className="max-w-xs mx-auto bg-stone-100 dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-xl text-neutral-900 dark:text-white p-3 space-y-3">
                      <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-800">
                        <img
                          src={image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800'}
                          alt={name || 'Product'}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {isNew && (
                          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-amber-500 text-neutral-950 text-[10px] font-bold uppercase rounded-full shadow">
                            New
                          </span>
                        )}
                        {originalPrice && originalPrice > price && (
                          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-rose-600 text-white text-[10px] font-bold uppercase rounded-full shadow">
                            Sale
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-neutral-500">
                          <span>{category}</span>
                          <span className="font-mono text-[10px]">{sku || 'SKU-0000'}</span>
                        </div>
                        <h4 className="font-serif font-bold text-sm truncate">{name || 'Minimalist Product Title'}</h4>

                        <div className="flex items-center gap-2 pt-1">
                          <span className="font-mono font-bold text-base text-neutral-900 dark:text-white">
                            ${price}
                          </span>
                          {originalPrice && originalPrice > price && (
                            <span className="font-mono text-xs text-neutral-400 line-through">
                              ${originalPrice}
                            </span>
                          )}
                        </div>

                        {/* Color swatches preview */}
                        <div className="flex items-center gap-1 pt-2">
                          {colors.map((c, i) => (
                            <span
                              key={i}
                              className="w-3 h-3 rounded-full border border-neutral-600"
                              style={{ backgroundColor: c.hex }}
                              title={c.name}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-stone-200 dark:border-neutral-800 flex items-center gap-2">
                        <div className="flex-1 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-center text-[11px] font-bold uppercase tracking-wider rounded-xl">
                          Buy Now
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Checklist */}
                  <div className="bg-neutral-950 p-5 rounded-3xl border border-neutral-800 space-y-4 text-xs">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Listing Summary &amp; Verification
                    </h3>

                    <div className="space-y-3">
                      <div className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-1">
                        <p className="text-neutral-400 text-[11px]">Pricing &amp; Economics</p>
                        <p className="font-bold text-white text-sm font-mono">
                          ${price} USD {originalPrice && `(Was $${originalPrice})`}
                        </p>
                        {estimatedMarginPercent !== null && (
                          <p className="text-[11px] text-amber-400">
                            Profit Margin: <strong>{estimatedMarginPercent}%</strong> (${estimatedProfit}/item)
                          </p>
                        )}
                      </div>

                      <div className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-1">
                        <p className="text-neutral-400 text-[11px]">Inventory &amp; SKU</p>
                        <p className="font-bold text-white">
                          {stockCount} Units in Stock • SKU: <span className="font-mono text-amber-400">{sku}</span>
                        </p>
                      </div>

                      <div className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-1">
                        <p className="text-neutral-400 text-[11px]">Variants Configured</p>
                        <p className="text-white">
                          <strong>{colors.length}</strong> Colors ({colors.map(c => c.name).join(', ')})
                        </p>
                        {sizes.length > 0 && (
                          <p className="text-white">
                            <strong>{sizes.length}</strong> Sizes ({sizes.join(', ')})
                          </p>
                        )}
                      </div>

                      <div className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-1">
                        <p className="text-neutral-400 text-[11px]">Feature Specifications</p>
                        <p className="text-neutral-300">
                          {details.length} verified bullet points attached.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* Bottom Footer Actions */}
          <div className="px-6 py-4 bg-neutral-950 border-t border-neutral-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white font-bold text-xs rounded-xl transition-colors"
              >
                Reset Fields
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>

            <div className="flex items-center gap-2">
              {activeStep !== 'basic' && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeStep === 'pricing') setActiveStep('basic');
                    else if (activeStep === 'variants') setActiveStep('pricing');
                    else if (activeStep === 'specs') setActiveStep('variants');
                    else if (activeStep === 'preview') setActiveStep('specs');
                  }}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
              )}

              {activeStep !== 'preview' ? (
                <button
                  type="button"
                  onClick={() => {
                    if (activeStep === 'basic') setActiveStep('pricing');
                    else if (activeStep === 'pricing') setActiveStep('variants');
                    else if (activeStep === 'variants') setActiveStep('specs');
                    else if (activeStep === 'specs') setActiveStep('preview');
                  }}
                  className="px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : null}

              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                <Zap className="w-4 h-4 fill-neutral-950" />
                <span>{isEditing ? 'Save Changes' : 'Publish Product to Store'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
