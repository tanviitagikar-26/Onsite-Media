import { PRIMARY_PHONE_NUMBER } from '../data/initialData';

/**
 * Utility to reliably normalize and generate a direct WhatsApp chat URL.
 * Single source of truth: 9035582905 -> https://wa.me/919035582905
 */
export function formatWhatsAppUrl(raw?: string, defaultMessage?: string): string {
  if (!raw || !raw.trim()) {
    return `https://wa.me/91${PRIMARY_PHONE_NUMBER}`;
  }

  let trimmed = raw.trim();

  // Correct any legacy swapped-digit typo (89205 -> 82905)
  if (trimmed.includes('9035589205')) {
    trimmed = trimmed.replace(/9035589205/g, PRIMARY_PHONE_NUMBER);
  } else if (trimmed.includes('89205')) {
    trimmed = trimmed.replace(/89205/g, '82905');
  }

  // If already a full URL or wa.me link
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  if (trimmed.startsWith('wa.me/')) {
    return `https://${trimmed}`;
  }

  // Extract all numeric digits
  let digits = trimmed.replace(/[^0-9]/g, '');

  // If 11 digits starting with 0 (e.g. 09876543210 in India)
  if (digits.length === 11 && digits.startsWith('0') && /^[6-9]/.test(digits.slice(1))) {
    digits = '91' + digits.slice(1);
  }
  // If 10 digits and starts with 6, 7, 8, or 9 (standard Indian mobile number without +91)
  else if (digits.length === 10 && /^[6-9]/.test(digits)) {
    digits = '91' + digits;
  }

  if (!digits) {
    return `https://wa.me/91${PRIMARY_PHONE_NUMBER}`;
  }

  const baseUrl = `https://wa.me/${digits}`;
  if (defaultMessage) {
    return `${baseUrl}?text=${encodeURIComponent(defaultMessage)}`;
  }
  return baseUrl;
}
