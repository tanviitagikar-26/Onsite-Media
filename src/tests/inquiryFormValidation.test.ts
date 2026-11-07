import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {
  validatePhoneWithCountryCode,
  validateLocation,
  formatStructuredWhatsAppMessage,
} from '../utils/formValidation';
import { formatStructuredWhatsAppUrl } from '../utils/inquiryDeliveryHelper';
import { submitInquiry, getStoredInquiries } from '../services/firebase';

console.log('--- RUNNING INQUIRY FORM VALIDATION & WHATSAPP 4-FIELD TESTS ---');

// Mock browser globals for storage testing
const storageStore: Record<string, string> = {};
(global as any).window = {
  dispatchEvent: () => true,
  addEventListener: () => {},
  removeEventListener: () => {},
};
(global as any).CustomEvent = class CustomEvent {
  type: string;
  detail: any;
  constructor(type: string, options?: { detail?: any }) {
    this.type = type;
    this.detail = options?.detail;
  }
};
(global as any).localStorage = {
  getItem: (k: string) => storageStore[k] || null,
  setItem: (k: string, v: string) => {
    storageStore[k] = v;
  },
  removeItem: (k: string) => {
    delete storageStore[k];
  },
  clear: () => {
    Object.keys(storageStore).forEach((k) => delete storageStore[k]);
  },
};

// ============================================================================
// 1. Empty location blocks validation
// ============================================================================
const emptyLocation1 = validateLocation('');
assert.strictEqual(emptyLocation1.isValid, false, 'Empty location string fails validation');
assert.ok(emptyLocation1.error?.includes('Location is required'), 'Provides clear error message for empty location');

const emptyLocation2 = validateLocation('   ');
assert.strictEqual(emptyLocation2.isValid, false, 'Whitespace-only location fails validation');

const shortLocation = validateLocation('A');
assert.strictEqual(shortLocation.isValid, false, 'Single character location fails validation');
console.log('✓ PASS: Empty location blocks submission with clear error message');

// ============================================================================
// 2. Empty phone/WhatsApp blocks validation
// ============================================================================
const emptyPhone1 = validatePhoneWithCountryCode('');
assert.strictEqual(emptyPhone1.isValid, false, 'Empty phone string fails validation');
assert.ok(emptyPhone1.error?.includes('Phone or WhatsApp number is required'), 'Provides clear error message for empty phone');

const emptyPhone2 = validatePhoneWithCountryCode('   ');
assert.strictEqual(emptyPhone2.isValid, false, 'Whitespace-only phone fails validation');
console.log('✓ PASS: Empty phone/WhatsApp blocks submission with clear error message');

// ============================================================================
// 3. Phone without country code is blocked
// ============================================================================
const phoneNoCode = validatePhoneWithCountryCode('9035582905');
assert.strictEqual(phoneNoCode.isValid, false, 'Phone without country code fails validation');
assert.ok(phoneNoCode.error?.includes('country code'), 'Error specifies country code is required');

const phoneNoCodeUS = validatePhoneWithCountryCode('5551234567');
assert.strictEqual(phoneNoCodeUS.isValid, false, 'US local 10-digit number without +1 fails');
console.log('✓ PASS: Phone number without country code is blocked');

// ============================================================================
// 4. Valid phone number with country code passes validation
// ============================================================================
const validPhones = [
  '+91 9035582905',
  '+1 (555) 000-0000',
  '+44 20 7123 4567',
  '+81 90-1234-5678',
  '+919035582905',
  '+15551234567',
];

for (const phone of validPhones) {
  const result = validatePhoneWithCountryCode(phone);
  assert.strictEqual(result.isValid, true, `Valid phone '${phone}' passes validation`);
}
console.log('✓ PASS: Valid phone numbers with country code pass validation');

// ============================================================================
// 5. Valid location passes validation
// ============================================================================
const validLocations = [
  'Los Angeles, CA',
  'Mumbai, India',
  'London, UK',
  'Tokyo',
  'New York City',
];

for (const loc of validLocations) {
  const result = validateLocation(loc);
  assert.strictEqual(result.isValid, true, `Valid location '${loc}' passes validation`);
}
console.log('✓ PASS: Valid locations pass validation');

// ============================================================================
// 6. Backend / Data-Layer submitInquiry rejects missing location or phone
// ============================================================================
(async () => {
  // Test submitInquiry rejecting missing location
  let rejectedLocation = false;
  try {
    await submitInquiry({
      name: 'Test Client',
      email: 'test@example.com',
      phone: '+91 9035582905',
      location: '', // empty location
      message: 'Brief message',
    } as any);
  } catch (err: any) {
    rejectedLocation = true;
    assert.ok(err.message.includes('Location is required'), 'Backend rejects empty location');
  }
  assert.strictEqual(rejectedLocation, true, 'submitInquiry threw error on empty location');
  console.log('✓ PASS: Server / data-layer rejects submissions with missing location');

  // Test submitInquiry rejecting missing phone
  let rejectedPhone = false;
  try {
    await submitInquiry({
      name: 'Test Client',
      email: 'test@example.com',
      phone: '', // empty phone
      location: 'Los Angeles, CA',
      message: 'Brief message',
    } as any);
  } catch (err: any) {
    rejectedPhone = true;
    assert.ok(err.message.includes('Phone or WhatsApp number is required'), 'Backend rejects empty phone');
  }
  assert.strictEqual(rejectedPhone, true, 'submitInquiry threw error on empty phone');
  console.log('✓ PASS: Server / data-layer rejects submissions with missing phone');

  // Test submitInquiry rejecting phone without country code
  let rejectedPhoneFormat = false;
  try {
    await submitInquiry({
      name: 'Test Client',
      email: 'test@example.com',
      phone: '9035582905', // missing + country code
      location: 'Los Angeles, CA',
      message: 'Brief message',
    } as any);
  } catch (err: any) {
    rejectedPhoneFormat = true;
  }
  assert.strictEqual(rejectedPhoneFormat, true, 'submitInquiry threw error on phone without country code');
  console.log('✓ PASS: Server / data-layer rejects phone number without country code');

  // Test submitInquiry accepting valid submission
  const validSubmissionId = await submitInquiry({
    name: 'Jordan Lee',
    email: 'jordan@brand.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    service: 'Concert Photography & Cinematography',
    message: 'Need 4K tour documentation and daily recap edits.',
  });
  assert.ok(validSubmissionId, 'Valid submission returns ID');
  const stored = getStoredInquiries();
  assert.strictEqual(stored[0].location, 'San Francisco, CA', 'Location persisted to storage');
  assert.strictEqual(stored[0].phone, '+1 (555) 234-5678', 'Phone persisted to storage');
  console.log('✓ PASS: Valid submission successfully saved and persisted');

  // ============================================================================
  // 7. Structured WhatsApp message includes exactly the 4 required fields
  // ============================================================================
  const waMsg = formatStructuredWhatsAppMessage({
    name: 'Aarav Sharma',
    phone: '+91 9035582905',
    service: 'Concert Photography & Cinematography',
    location: 'Mumbai, India',
  });

  const lines = waMsg.split('\n');
  assert.strictEqual(lines.length, 4, 'WhatsApp message has exactly 4 lines');
  assert.strictEqual(lines[0], '1. Name: Aarav Sharma', 'Line 1 is 1. Name: {name}');
  assert.strictEqual(lines[1], '2. Phone Number: +91 9035582905', 'Line 2 is 2. Phone Number: {phone}');
  assert.strictEqual(lines[2], '3. Project Category: Concert Photography & Cinematography', 'Line 3 is 3. Project Category: {service}');
  assert.strictEqual(lines[3], '4. Location: Mumbai, India', 'Line 4 is 4. Location: {location}');
  console.log('✓ PASS: Structured WhatsApp message has exactly 4 fields in the specified numbered order');

  // Test fallback to "N/A" for empty fields or invalid placeholder/labels
  const waMsgEmpty = formatStructuredWhatsAppMessage({});
  const emptyLines = waMsgEmpty.split('\n');
  assert.strictEqual(emptyLines[0], '1. Name: N/A', 'Empty name falls back to N/A');
  assert.strictEqual(emptyLines[1], '2. Phone Number: N/A', 'Empty phone falls back to N/A');
  assert.strictEqual(emptyLines[2], '3. Project Category: N/A', 'Empty category falls back to N/A');
  assert.strictEqual(emptyLines[3], '4. Location: N/A', 'Empty location falls back to N/A');
  console.log('✓ PASS: Structured WhatsApp message safely outputs N/A for empty fields');

  // Test reference case: User Tanvi Sachin Itagikar from Screenshot 2026-11-04 200247.png
  const waMsgUser = formatStructuredWhatsAppMessage({
    name: 'Tanvi Sachin Itagikar',
    phone: '+918105254406',
    service: 'Concert Photography & Cinematography',
    location: 'BELGAUM',
  });
  const userLines = waMsgUser.split('\n');
  assert.strictEqual(userLines[0], '1. Name: Tanvi Sachin Itagikar', 'Actual user name is correctly mapped as 1. Name: Tanvi Sachin Itagikar');
  assert.strictEqual(userLines[1], '2. Phone Number: +918105254406', 'Phone number correctly mapped as 2. Phone Number');
  assert.strictEqual(userLines[2], '3. Project Category: Concert Photography & Cinematography', 'Project category correctly mapped as 3. Project Category');
  assert.strictEqual(userLines[3], '4. Location: BELGAUM', 'Location correctly mapped as 4. Location');
  console.log('✓ PASS: Screenshot reference "1. Name: Tanvi Sachin Itagikar" verified with exact 4 fields');

  // Test that field label or placeholder text never leaks into Name
  const waMsgLabelLeak = formatStructuredWhatsAppMessage({
    name: 'Your Name *',
    phone: '+91 9035582905',
    service: 'Others',
    location: 'Delhi',
  });
  assert.strictEqual(waMsgLabelLeak.split('\n')[0], '1. Name: N/A', 'Field label "Your Name *" is discarded and falls back to N/A');

  const waMsgPlaceholderLeak = formatStructuredWhatsAppMessage({
    name: 'e.g. Alex Morgan',
    phone: '+91 9035582905',
    service: 'Others',
    location: 'Delhi',
  });
  assert.strictEqual(waMsgPlaceholderLeak.split('\n')[0], '1. Name: N/A', 'Placeholder "e.g. Alex Morgan" is discarded and falls back to N/A');
  console.log('✓ PASS: Field labels and placeholders are prevented from leaking into Name');

  // ============================================================================
  // 8. Verify WhatsApp dispatch URL encodes the 4-field message
  // ============================================================================
  const waDelivery = formatStructuredWhatsAppUrl('9035582905', {
    name: 'Aarav Sharma',
    phone: '+91 9035582905',
    service: 'Event Coverage',
    location: 'Delhi, India',
  });
  assert.ok(waDelivery.url.includes('wa.me'), 'Targets WhatsApp direct endpoint');
  assert.ok(waDelivery.url.includes(encodeURIComponent('1. Name: Aarav Sharma')), 'Encodes 1. Name field');
  assert.ok(waDelivery.url.includes(encodeURIComponent('2. Phone Number: +91 9035582905')), 'Encodes 2. Phone Number field');
  assert.ok(waDelivery.url.includes(encodeURIComponent('3. Project Category: Event Coverage')), 'Encodes 3. Project Category');
  assert.ok(waDelivery.url.includes(encodeURIComponent('4. Location: Delhi, India')), 'Encodes 4. Location field');
  console.log('✓ PASS: WhatsApp URL dispatches the exact 4-field structured message');

  // ============================================================================
  // 9. Verify consistency across all forms on the site
  // ============================================================================
  const formCode = fs.readFileSync(path.resolve(process.cwd(), 'src/components/ui/UnifiedContactForm.tsx'), 'utf-8');
  assert.ok(formCode.includes('Location / City *'), 'UnifiedContactForm displays mandatory Location label');
  assert.ok(formCode.includes('Phone / WhatsApp *'), 'UnifiedContactForm displays mandatory Phone / WhatsApp label');
  assert.ok(!formCode.includes('Phone / WhatsApp (Optional)'), 'Optional phone label has been completely removed');
  assert.ok(formCode.includes('fieldErrors.phone'), 'UnifiedContactForm displays per-field phone error');
  assert.ok(formCode.includes('fieldErrors.location'), 'UnifiedContactForm displays per-field location error');

  const contactSectionCode = fs.readFileSync(path.resolve(process.cwd(), 'src/components/sections/ContactSection.tsx'), 'utf-8');
  assert.ok(contactSectionCode.includes('<UnifiedContactForm'), 'ContactSection embeds shared UnifiedContactForm');

  const contactModalCode = fs.readFileSync(path.resolve(process.cwd(), 'src/components/modals/ContactModal.tsx'), 'utf-8');
  assert.ok(contactModalCode.includes('<UnifiedContactForm'), 'ContactModal embeds shared UnifiedContactForm');
  console.log('✓ PASS: All inquiry forms consistently enforce mandatory location and phone with country code');

  console.log('--- ALL INQUIRY FORM VALIDATION & WHATSAPP TESTS PASSED ---');
  process.exit(0);
})();
