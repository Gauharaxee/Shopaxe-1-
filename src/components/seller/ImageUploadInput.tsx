import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, X, Check, Sparkles } from 'lucide-react';
import { uploadProductImageServer } from '../../lib/productsApi';

interface ImageUploadInputProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

const LUXURY_PRESETS = [
  { name: 'Overshirt', url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800' },
  { name: 'Hoodie', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800' },
  { name: 'Jacket', url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800' },
  { name: 'Footwear', url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800' },
  { name: 'Watch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800' },
  { name: 'Sunglasses', url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800' },
];

export const ImageUploadInput: React.FC<ImageUploadInputProps> = ({
  value,
  onChange,
  label = 'Product Image'
}) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'url' | 'presets'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WEBP, AVIF)');
      return;
    }

    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        if (base64) {
          // Attempt server upload for clean hosting, falls back to base64
          const serverUrl = await uploadProductImageServer(base64, file.name);
          onChange(serverUrl || base64);
        }
        setIsProcessing(false);
      };
      reader.onerror = () => {
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.warn('Error processing image:', err);
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-neutral-400 font-semibold text-xs">{label}</label>
        <div className="flex items-center gap-1 bg-neutral-950 p-0.5 rounded-lg border border-neutral-800 text-[10px]">
          <button
            type="button"
            onClick={() => setActiveMode('upload')}
            className={`px-2 py-0.5 rounded-md font-bold transition-colors flex items-center gap-1 ${
              activeMode === 'upload' ? 'bg-neutral-800 text-amber-400' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('url')}
            className={`px-2 py-0.5 rounded-md font-bold transition-colors flex items-center gap-1 ${
              activeMode === 'url' ? 'bg-neutral-800 text-amber-400' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>Image URL</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('presets')}
            className={`px-2 py-0.5 rounded-md font-bold transition-colors flex items-center gap-1 ${
              activeMode === 'presets' ? 'bg-neutral-800 text-amber-400' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Presets</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Drag and Drop Upload */}
      {activeMode === 'upload' && (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-amber-400 bg-amber-950/20'
                : 'border-neutral-800 hover:border-neutral-700 bg-neutral-950'
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400">
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  {isProcessing ? 'Processing image...' : 'Click to browse or drag & drop image'}
                </p>
                <p className="text-[10px] text-neutral-500 mt-0.5">Supports PNG, JPG, WEBP, AVIF up to 25MB</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Direct Image URL */}
      {activeMode === 'url' && (
        <div>
          <input
            type="url"
            placeholder="https://images.unsplash.com/..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
          />
        </div>
      )}

      {/* Mode 3: Presets */}
      {activeMode === 'presets' && (
        <div className="grid grid-cols-3 gap-2 bg-neutral-950 p-2.5 rounded-2xl border border-neutral-800">
          {LUXURY_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => onChange(preset.url)}
              className={`p-1.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                value === preset.url
                  ? 'border-amber-400 bg-amber-950/40 text-amber-300'
                  : 'border-neutral-800 hover:border-neutral-700 bg-neutral-900 text-neutral-300'
              }`}
            >
              <img
                src={preset.url}
                alt={preset.name}
                className="w-8 h-8 rounded-lg object-cover bg-neutral-800 flex-shrink-0"
                referrerPolicy="no-referrer"
              />
              <span className="text-[10px] font-bold truncate">{preset.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Live Preview Box */}
      {value && (
        <div className="flex items-center gap-3 p-2 bg-neutral-950 rounded-xl border border-neutral-800">
          <img
            src={value}
            alt="Preview"
            className="w-12 h-12 rounded-lg object-cover bg-neutral-900 border border-neutral-800 flex-shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-white flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-400" />
              <span>Image Attached</span>
            </p>
            <p className="text-[10px] text-neutral-500 font-mono truncate max-w-xs">{value}</p>
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="p-1 text-neutral-400 hover:text-rose-400 rounded-lg hover:bg-neutral-900 transition-colors"
            title="Clear Image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
