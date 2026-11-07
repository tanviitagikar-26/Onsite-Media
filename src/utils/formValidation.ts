/**
 * Form Validation and WhatsApp Formatting Utilities
 * Enforces mandatory Location and Phone/WhatsApp with country code format validation,
 * and standard 4-field structured WhatsApp message generation.
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates international phone / WhatsApp number format.
 * Requires country code starting with '+' or '00', followed by 7-15 digits.
 */
export function validatePhoneWithCountryCode(phone: string): ValidationResult {
  const trimmed = (phone || '').trim();

  if (!trimmed) {
    return {
      isValid: false,
      error: 'Phone or WhatsApp number is required.',
    };
  }

  // Must include country code starting with '+' (or international '00')
  const hasCountryCodePrefix = trimmed.startsWith('+') || trimmed.startsWith('00');
  if (!hasCountryCodePrefix) {
    return {
      isValid: false,
      error: 'Please include your country code starting with + (e.g. +1 555-0123 or +91 9876543210).',
    };
  }

  // Allowed characters: +, 0-9, spaces, dashes, parentheses
  const validCharsRegex = /^\+?[0-9\s\-()]+$/;
  if (!validCharsRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Phone number contains invalid characters. Use digits, spaces, and dashes only.',
    };
  }

  // Extract only digits to check length per E.164 specification (7 to 15 digits)
  const digitsOnly = trimmed.replace(/\D/g, '');
  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    return {
      isValid: false,
      error: 'Phone number must contain between 7 and 15 digits including country code.',
    };
  }

  return { isValid: true };
}

/**
 * Validates mandatory location / city field.
 */
export function validateLocation(location: string): ValidationResult {
  const trimmed = (location || '').trim();

  if (!trimmed) {
    return {
      isValid: false,
      error: 'Location is required. Please provide your city or country.',
    };
  }

  if (trimmed.length < 2) {
    return {
      isValid: false,
      error: 'Please enter a valid location (at least 2 characters).',
    };
  }

  return { isValid: true };
}

/**
/**
 * Clean and sanitize user entered name, discarding field labels or placeholders
 */
export function extractCleanClientName(raw?: string): string {
  if (!raw || typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';

  const lower = trimmed.toLowerCase();
  // If the value matches the form's label, placeholder or generic template text
  const invalidLabels = [
    'your name',
    'your name *',
    'name',
    'name *',
    'naam',
    'naam *',
    'e.g. alex morgan',
    'alex morgan',
    'client name',
    'client name *',
    'anonymous client',
    'onsetmedia',
    'ronny',
    'undefined',
    'null',
    '[object object]',
  ];

  if (invalidLabels.includes(lower)) {
    return '';
  }

  return trimmed;
}

/**
 * Formats exactly the 4 required fields for WhatsApp dispatch:
 * 1. Name: {name}
 * 2. Phone Number: {phone}
 * 3. Project Category: {project category}
 * 4. Location: {location}
 *
 * If any field is empty, "N/A" is substituted to maintain strict consistency.
 * No other fields or extra data are included.
 */
export function formatStructuredWhatsAppMessage(
  data: {
    name?: string;
    clientName?: string;
    userName?: string;
    fullName?: string;
    phone?: string;
    service?: string;
    project_category?: string;
    location?: string;
  },
  options?: {
    phoneLabel?: 'Phone Number' | 'Phone';
    numbered?: boolean;
  }
): string {
  const candidateName = data.name || data.clientName || data.userName || data.fullName || '';
  const sanitized = extractCleanClientName(candidateName);
  const nameVal = sanitized.length > 0 ? sanitized : 'N/A';

  const rawPhone = data.phone || '';
  const phoneVal = rawPhone.trim() ? rawPhone.trim() : 'N/A';

  const rawCategory = data.project_category || data.service || '';
  const categoryVal = rawCategory.trim() ? rawCategory.trim() : 'N/A';

  const rawLocation = data.location || '';
  const locationVal = rawLocation.trim() ? rawLocation.trim() : 'N/A';

  const phoneLabel = options?.phoneLabel || 'Phone Number';
  const isNumbered = options?.numbered !== false;

  if (isNumbered) {
    return [
      `1. Name: ${nameVal}`,
      `2. ${phoneLabel}: ${phoneVal}`,
      `3. Project Category: ${categoryVal}`,
      `4. Location: ${locationVal}`,
    ].join('\n');
  }

  return [
    `Name: ${nameVal}`,
    `${phoneLabel}: ${phoneVal}`,
    `Project Category: ${categoryVal}`,
    `Location: ${locationVal}`,
  ].join('\n');
}


