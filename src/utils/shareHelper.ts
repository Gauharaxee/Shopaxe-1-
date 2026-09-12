import { Product } from '../types';

/**
 * Returns canonical direct product sharing URL
 */
export function getProductShareUrl(product: Product): string {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set('product', product.id);
  return url.toString();
}

/**
 * Copies direct product URL to system clipboard with fallback support for iframe sandboxes
 */
export async function copyProductDirectLink(product: Product): Promise<boolean> {
  const shareUrl = getProductShareUrl(product);
  
  if (!shareUrl) return false;

  // Try Modern Clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(shareUrl);
      return true;
    } catch (err) {
      console.warn('Navigator clipboard writeText failed, using fallback:', err);
    }
  }

  // Fallback using invisible textarea
  try {
    const textArea = document.createElement('textarea');
    textArea.value = shareUrl;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  } catch (err) {
    console.error('Fallback clipboard copy failed:', err);
    return false;
  }
}

/**
 * Social platform sharing URLs
 */
export function openSocialShare(
  product: Product,
  platform: 'whatsapp' | 'twitter' | 'facebook' | 'email'
): void {
  const url = encodeURIComponent(getProductShareUrl(product));
  const text = encodeURIComponent(
    `Check out "${product.name}" ($${product.price}) on Shopaxe!`
  );

  let targetUrl = '';
  switch (platform) {
    case 'whatsapp':
      targetUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;
      break;
    case 'twitter':
      targetUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
      break;
    case 'facebook':
      targetUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
      break;
    case 'email':
      targetUrl = `mailto:?subject=${encodeURIComponent(
        `${product.name} - Shopaxe Collection`
      )}&body=${text}%0A%0AView product directly here:%0A${url}`;
      break;
  }

  if (targetUrl && typeof window !== 'undefined') {
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  }
}

/**
 * Check if Web Share API is available (Mobile devices)
 */
export function canNativeShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

/**
 * Trigger Web Share API
 */
export async function nativeShareProduct(product: Product): Promise<boolean> {
  if (!canNativeShare()) return false;
  try {
    await navigator.share({
      title: `${product.name} | Shopaxe`,
      text: `Discover ${product.name} on Shopaxe. Premium essentials designed for life.`,
      url: getProductShareUrl(product),
    });
    return true;
  } catch (err: any) {
    if (err.name !== 'AbortError') {
      console.warn('Native share failed:', err);
    }
    return false;
  }
}
