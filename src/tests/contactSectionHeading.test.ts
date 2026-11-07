import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Test to verify the contact section heading update:
 * - "CONTACT ONSET MEDIA" replaced with "Lets connect and Evolve"
 * - Existing design, typography classes, tags, and structure preserved
 */

console.log('--- RUNNING CONTACT SECTION HEADING TESTS ---');

const contactSectionPath = path.resolve(process.cwd(), 'src/components/sections/ContactSection.tsx');
assert.ok(fs.existsSync(contactSectionPath), 'ContactSection.tsx exists');

const contactSource = fs.readFileSync(contactSectionPath, 'utf8');

// 1. "Lets connect and Evolve" is present as the heading
assert.ok(
  contactSource.includes('Lets connect and Evolve'),
  'ContactSection.tsx must contain "Lets connect and Evolve"'
);

// 2. Old text "CONTACT ONSET MEDIA" is removed from the heading
assert.ok(
  !contactSource.includes('CONTACT ONSET MEDIA'),
  'ContactSection.tsx must not contain "CONTACT ONSET MEDIA"'
);

// 3. Eyebrow stickers removed cleanly as requested
assert.ok(
  !contactSource.includes('✦ STUDIO INQUIRIES // 24/7 📲'),
  'ContactSection.tsx must not contain studio inquiries sticker badge'
);
assert.ok(
  !contactSource.includes('Available for select 3D CGI campaigns'),
  'ContactSection.tsx must not contain the "Available for select 3D CGI campaigns" subtitle'
);
assert.ok(
  !contactSource.includes('Available for select campaigns, visual systems, and commercial brand collaborations.'),
  'ContactSection.tsx must not contain the form subheading'
);

// 4. Verify ContactModal
const contactModalPath = path.resolve(process.cwd(), 'src/components/modals/ContactModal.tsx');
assert.ok(fs.existsSync(contactModalPath), 'ContactModal.tsx exists');
const contactModalSource = fs.readFileSync(contactModalPath, 'utf8');

assert.ok(
  contactModalSource.includes('Lets connect and evolve'),
  'ContactModal.tsx preserves the heading'
);
assert.ok(
  !contactModalSource.includes('Available for select campaigns, visual systems, and commercial brand collaborations.'),
  'ContactModal.tsx must not contain the subheading'
);
assert.ok(
  !contactModalSource.includes('border-b-2 border-[#111215]/15 pr-10'),
  'ContactModal.tsx divider line is removed'
);

console.log('✓ PASS: Heading text updated to "Lets connect and Evolve"');
console.log('✓ PASS: "CONTACT ONSET MEDIA" has been removed');
console.log('✓ PASS: Decorative stickers cleanly removed from ContactSection');
console.log('✓ PASS: ContactModal subheading and divider line cleanly removed');
console.log('--- ALL CONTACT SECTION HEADING TESTS PASSED ---');
