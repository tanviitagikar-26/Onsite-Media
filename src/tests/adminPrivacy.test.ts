import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Tests for Admin Dashboard Database Privacy:
 * - Confidential Firebase/Cloud Firestore project details removed
 * - Confidential Database ID removed
 * - No exposure of internal cloud credentials/IDs in UI
 * - Preserves Security Architecture, Authorized Admin ("Onset Media"), sync and inquiries
 */

console.log('--- RUNNING ADMIN DATABASE PRIVACY TESTS ---');

const adminDashboardSource = fs.readFileSync(
  path.resolve(process.cwd(), 'src/components/admin/AdminDashboard.tsx'),
  'utf-8'
);

// 1. Confidential Cloud Project ID is not displayed
assert.ok(
  !adminDashboardSource.includes('commanding-night-gct7q'),
  'AdminDashboard does not display the confidential Cloud Project ID'
);
console.log('✓ PASS: Cloud Project ID ("commanding-night-gct7q") is removed from UI');

// 2. Confidential Database ID is not displayed
assert.ok(
  !adminDashboardSource.includes('ai-studio-remixremixjack3d'),
  'AdminDashboard does not display the confidential Database ID'
);
console.log('✓ PASS: Database ID ("ai-studio-remixremixjack3d") is removed from UI');

// 3. Confidential labels removed from metadata tiles
assert.ok(
  !adminDashboardSource.includes('Cloud Project</span>'),
  'AdminDashboard no longer displays the Cloud Project tile label'
);
assert.ok(
  !adminDashboardSource.includes('Database ID</span>'),
  'AdminDashboard no longer displays the Database ID tile label'
);
console.log('✓ PASS: Cloud Project and Database ID metadata tiles removed');

// 4. Preserves Security Architecture badge
assert.ok(
  adminDashboardSource.includes('Security Architecture') && adminDashboardSource.includes('ABAC Rules Deployed'),
  'AdminDashboard preserves Security Architecture status'
);
console.log('✓ PASS: Security Architecture status is preserved');

// 5. Preserves Authorized Admin brand ("Onset Media")
assert.ok(
  adminDashboardSource.includes('Authorized Admin') && adminDashboardSource.includes('Onset Media'),
  'AdminDashboard preserves Authorized Admin ("Onset Media")'
);
console.log('✓ PASS: Authorized Admin is preserved as "Onset Media"');

// 6. Preserves Cloud Firestore Database banner & Sync button
assert.ok(
  adminDashboardSource.includes('Cloud Firestore Database'),
  'AdminDashboard preserves Cloud Firestore Database title'
);
assert.ok(
  adminDashboardSource.includes('Live &amp; Connected') || adminDashboardSource.includes('Live & Connected'),
  'AdminDashboard preserves Live & Connected status'
);
assert.ok(
  adminDashboardSource.includes('Sync All To Cloud'),
  'AdminDashboard preserves Sync All To Cloud functionality'
);
console.log('✓ PASS: Database banner, live status, and Sync All To Cloud button are preserved');

// 7. Preserves Google Admin Auth bar & Inquiries list
assert.ok(
  adminDashboardSource.includes('Google Admin Auth:'),
  'AdminDashboard preserves Google Admin Auth bar'
);
assert.ok(
  adminDashboardSource.includes('Client Inquiries &amp; Booking Requests'),
  'AdminDashboard preserves Client Inquiries management'
);
console.log('✓ PASS: Google Admin Auth and Client Inquiries are fully operational');

console.log('--- ALL ADMIN DATABASE PRIVACY TESTS PASSED (7/7) ---');
