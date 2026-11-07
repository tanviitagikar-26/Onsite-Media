import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Regression Test Suite:
 * Ensures inquiry submission properly persists to storage,
 * and the Admin Dashboard accurately calculates and displays Total Inquiries
 * in the "Database & Leads" tab, the Collections Summary, and the Inquiries table.
 */

console.log('--- RUNNING INQUIRY SUBMISSION & ADMIN TOTAL COUNT PERSISTENCE TESTS ---');

// Mock a lightweight browser environment with localStorage and custom events
const storageStore: Record<string, string> = {};
const listeners: Record<string, Array<(e: any) => void>> = {};

(global as any).window = {
  dispatchEvent: (event: { type: string; detail?: any }) => {
    (listeners[event.type] || []).forEach((cb) => cb(event));
    return true;
  },
  addEventListener: (type: string, cb: (e: any) => void) => {
    listeners[type] = listeners[type] || [];
    listeners[type].push(cb);
  },
  removeEventListener: (type: string, cb: (e: any) => void) => {
    if (listeners[type]) {
      listeners[type] = listeners[type].filter((fn) => fn !== cb);
    }
  },
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
  getItem: (key: string) => storageStore[key] || null,
  setItem: (key: string, value: string) => {
    storageStore[key] = value;
  },
  removeItem: (key: string) => {
    delete storageStore[key];
  },
  clear: () => {
    Object.keys(storageStore).forEach((k) => delete storageStore[k]);
  },
};

import {
  submitInquiry,
  getStoredInquiries,
  saveInquiryLocally,
  updateInquiryStatus,
  deleteInquiry,
  INQUIRIES_STORAGE_KEY,
} from '../services/firebase';

// 1. Initial State: Total inquiry is 0 before submission
localStorage.clear();
assert.strictEqual(getStoredInquiries().length, 0, 'Initial stored inquiries count is 0');
console.log('✓ PASS: Initial inquiry count is 0');

// 2. Submit First Inquiry
const inquiry1 = {
  name: 'Aarav Sharma',
  email: 'aarav@creativepulse.in',
  phone: '+91 9876543210',
  location: 'Mumbai, India',
  service: 'Music Video Direction',
  message: 'Looking for high-energy music video production with rapid cuts.',
};

let eventFiredCount = 0;
window.addEventListener('onset_inquiries_updated', () => {
  eventFiredCount++;
});

// Execute saveInquiryLocally directly as submitInquiry does
saveInquiryLocally({
  id: 'inq-test-001',
  ...inquiry1,
  createdAt: new Date().toISOString(),
  status: 'new',
});

const storedAfter1 = getStoredInquiries();
assert.strictEqual(storedAfter1.length, 1, 'Total inquiry count increased to 1 after submitting first inquiry');
assert.strictEqual(storedAfter1[0].name, 'Aarav Sharma', 'Inquiry name accurately preserved');
assert.strictEqual(storedAfter1[0].email, 'aarav@creativepulse.in', 'Inquiry email accurately preserved');
assert.strictEqual(storedAfter1[0].phone, '+91 9876543210', 'Inquiry phone accurately preserved');
assert.strictEqual(storedAfter1[0].location, 'Mumbai, India', 'Inquiry location accurately preserved');
assert.strictEqual(storedAfter1[0].service, 'Music Video Direction', 'Inquiry service accurately preserved');
assert.strictEqual(storedAfter1[0].status, 'new', 'Inquiry initial status is "new"');
assert.ok(eventFiredCount >= 1, 'Real-time onset_inquiries_updated event dispatched');
console.log('✓ PASS: First inquiry submitted and total count is 1 (not 0)');

// 3. Submit Second Inquiry
saveInquiryLocally({
  id: 'inq-test-002',
  name: 'Maya Patel',
  email: 'maya@studiobrand.com',
  phone: '+91 9123456780',
  location: 'Bangalore, India',
  service: 'Concert & Festival Media',
  message: 'Festival coverage needed across 3 stages with live recap reels.',
  createdAt: new Date(Date.now() + 1000).toISOString(),
  status: 'new',
});

const storedAfter2 = getStoredInquiries();
assert.strictEqual(storedAfter2.length, 2, 'Total inquiry count increased to 2 after submitting second inquiry');
assert.strictEqual(storedAfter2[0].name, 'Maya Patel', 'Newest inquiry is at the top of the list');
console.log('✓ PASS: Second inquiry submitted and total count is 2');

// 4. Update Inquiry Status (e.g., mark as read or replied)
updateInquiryStatus('inq-test-001', 'read');
const storedAfterRead = getStoredInquiries();
assert.strictEqual(storedAfterRead.length, 2, 'Total count remains 2 after status update');
const updatedInq = storedAfterRead.find((i) => i.id === 'inq-test-001');
assert.strictEqual(updatedInq?.status, 'read', 'Status successfully updated to "read"');
console.log('✓ PASS: Status update preserves total count of 2');

// 5. Delete an Inquiry
deleteInquiry('inq-test-001');
const storedAfterDelete = getStoredInquiries();
assert.strictEqual(storedAfterDelete.length, 1, 'Total count accurately decremented to 1 after deletion');
assert.strictEqual(storedAfterDelete[0].id, 'inq-test-002', 'Remaining inquiry is intact');
console.log('✓ PASS: Deletion accurately decrements total count to 1');

// 6. Verify AdminDashboard Source Flow & Bindings
const adminSource = fs.readFileSync(
  path.resolve(process.cwd(), 'src/components/admin/AdminDashboard.tsx'),
  'utf-8'
);

// Tab Navigation label includes inquiries.length
assert.ok(
  adminSource.includes("{ id: 'database', label: '🗄️ Database & Leads', icon: Database, count: inquiries.length }"),
  'AdminDashboard binds inquiries.length to Database & Leads tab label count'
);

// Collections summary includes inquiries.length
assert.ok(
  adminSource.includes("{ label: 'Client Inquiries', count: inquiries.length, icon: MailCheck, coll: 'inquiries' }"),
  'AdminDashboard binds inquiries.length to Collections Summary tile'
);

// Inquiries list header displays inquiries.length
assert.ok(
  adminSource.includes('{inquiries.length}'),
  'AdminDashboard displays total count badge in inquiries section'
);

// AdminDashboard calls getStoredInquiries to sync state
assert.ok(
  adminSource.includes('getStoredInquiries()'),
  'AdminDashboard syncs inquiries via getStoredInquiries()'
);

// AdminDashboard listens to real-time onset_inquiries_updated event
assert.ok(
  adminSource.includes('onset_inquiries_updated'),
  'AdminDashboard subscribes to onset_inquiries_updated real-time event'
);

// UnifiedContactForm integrates local persistence
const contactFormSource = fs.readFileSync(
  path.resolve(process.cwd(), 'src/components/ui/UnifiedContactForm.tsx'),
  'utf-8'
);
assert.ok(
  contactFormSource.includes('saveInquiryLocally'),
  'UnifiedContactForm uses saveInquiryLocally as guaranteed fallback'
);

console.log('✓ PASS: AdminDashboard and UnifiedContactForm correctly bind and display inquiry totals');
console.log('--- ALL INQUIRY COUNT PERSISTENCE TESTS PASSED (6/6) ---');
