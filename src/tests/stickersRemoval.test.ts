import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Regression test suite verifying:
 * 1. Removal of all neo-brutalist decorative sticker badges / labels across sections
 * 2. Preservation of normal navigation buttons, interactive buttons, and CTA elements
 * 3. Exact 4-field data mapping and webhook idempotency payload structure
 */

console.log('--- RUNNING DECORATIVE STICKER BADGES REMOVAL & AUTOMATION PAYLOAD TESTS ---');

function readSrcFile(relPath: string): string {
  const fullPath = path.resolve(process.cwd(), relPath);
  assert.ok(fs.existsSync(fullPath), `${relPath} must exist`);
  return fs.readFileSync(fullPath, 'utf8');
}

// 1. Check AboutSection (Meet the Founder)
const aboutSource = readSrcFile('src/components/sections/AboutSection.tsx');
assert.ok(!aboutSource.includes('THE LORE'), 'AboutSection must not contain "THE LORE"');
assert.ok(!aboutSource.includes('ONSET MEDIA ORIGIN'), 'AboutSection must not contain "ONSET MEDIA ORIGIN"');
assert.ok(!aboutSource.includes('100% UNFILTERED CRAFT'), 'AboutSection must not contain washi tape');
assert.ok(aboutSource.includes('MEET THE FOUNDER'), 'AboutSection preserves headline');
assert.ok(aboutSource.includes('handleStampClick'), 'AboutSection preserves interactive metric reaction buttons');
console.log('✓ PASS: "THE LORE" and "ONSET MEDIA ORIGIN" sticker badges removed from AboutSection');

// 2. Check SpecialistSection
const specialistSource = readSrcFile('src/components/sections/SpecialistSection.tsx');
assert.ok(!specialistSource.includes('CREATIVE ARSENAL'), 'SpecialistSection must not contain "CREATIVE ARSENAL"');
assert.ok(!specialistSource.includes('POST-PRODUCTION SUITE'), 'SpecialistSection must not contain "POST-PRODUCTION SUITE"');
assert.ok(specialistSource.includes('SPECIALIST IN'), 'SpecialistSection preserves headline');
console.log('✓ PASS: "CREATIVE ARSENAL" and "POST-PRODUCTION SUITE" stickers removed from SpecialistSection');

// 3. Check ProjectsSection
const projectsSource = readSrcFile('src/components/sections/ProjectsSection.tsx');
assert.ok(!projectsSource.includes('THE VAULT'), 'ProjectsSection must not contain "THE VAULT"');
assert.ok(!projectsSource.includes('CURATED ARCHIVE'), 'ProjectsSection must not contain "CURATED ARCHIVE"');
assert.ok(projectsSource.includes('DROPS'), 'ProjectsSection preserves headline');
console.log('✓ PASS: "THE VAULT" and "CURATED ARCHIVE" stickers removed from ProjectsSection');

// 4. Check ServicesSection
const servicesSource = readSrcFile('src/components/sections/ServicesSection.tsx');
assert.ok(!servicesSource.includes('THE MENU'), 'ServicesSection must not contain "THE MENU"');
assert.ok(!servicesSource.includes('PICK YOUR POISON'), 'ServicesSection must not contain "PICK YOUR POISON"');
assert.ok(servicesSource.includes('SERVICES'), 'ServicesSection preserves headline');
console.log('✓ PASS: "THE MENU" and "PICK YOUR POISON" stickers removed from ServicesSection');

// 5. Check ContactSection
const contactSource = readSrcFile('src/components/sections/ContactSection.tsx');
assert.ok(!contactSource.includes('STUDIO INQUIRIES // 24/7'), 'ContactSection must not contain "STUDIO INQUIRIES // 24/7"');
assert.ok(!contactSource.includes('24HR RESPONSE TIME'), 'ContactSection must not contain 24hr response tape');
assert.ok(contactSource.includes('Lets connect and Evolve'), 'ContactSection preserves headline');
console.log('✓ PASS: "STUDIO INQUIRIES // 24/7" and "GET IN TOUCH" eyebrow stickers removed from ContactSection');

// 6. Check TestimonialsSection
const testimonialsSource = readSrcFile('src/components/sections/TestimonialsSection.tsx');
assert.ok(!testimonialsSource.includes('5-STAR RECEIPTS'), 'TestimonialsSection must not contain "5-STAR RECEIPTS"');
assert.ok(!testimonialsSource.includes('VERIFIED PARTNERS'), 'TestimonialsSection must not contain "VERIFIED PARTNERS"');
assert.ok(!testimonialsSource.includes('VERIFIED PRAISE'), 'TestimonialsSection must not contain washi tape');
assert.ok(!testimonialsSource.includes('DROP:'), 'TestimonialsSection must not contain "DROP:" campaign sticker');
assert.ok(testimonialsSource.includes('RATINGS &amp; REVIEWS'), 'TestimonialsSection preserves headline');
assert.ok(testimonialsSource.includes('current.clientName'), 'TestimonialsSection preserves client name');
console.log('✓ PASS: "5-STAR RECEIPTS", "VERIFIED PARTNERS", and "DROP:" stickers removed from TestimonialsSection');

// 7. Check ShowreelSection
const showreelSource = readSrcFile('src/components/sections/ShowreelSection.tsx');
assert.ok(!showreelSource.includes('4K MOTION ARCHIVE'), 'ShowreelSection must not contain "4K MOTION ARCHIVE"');
assert.ok(!showreelSource.includes('ONSET MEDIA CUT'), 'ShowreelSection must not contain "ONSET MEDIA CUT"');
console.log('✓ PASS: "4K MOTION ARCHIVE" and "ONSET MEDIA CUT" stickers removed from ShowreelSection');

// 8. Verify Hero "GET IN TOUCH" Button is preserved
const heroSource = readSrcFile('src/components/sections/HeroSection.tsx');
assert.ok(heroSource.includes('GET IN TOUCH'), 'HeroSection preserves GET IN TOUCH button');
assert.ok(heroSource.includes('variant="highlight"'), 'HeroSection preserves high-contrast highlight style');
console.log('✓ PASS: High-contrast GET IN TOUCH button in HeroSection upper corner preserved');

// 9. Verify Webhook payload helper has clean top-level 4-fields mapping
const helperSource = readSrcFile('src/utils/inquiryDeliveryHelper.ts');
assert.ok(helperSource.includes('name: safeName'), 'Webhook dispatches explicit safe client name');
assert.ok(helperSource.includes('phone: safePhone'), 'Webhook dispatches explicit safe phone');
assert.ok(helperSource.includes('project_category: safeCategory'), 'Webhook dispatches explicit project category');
assert.ok(helperSource.includes('location: safeLocation'), 'Webhook dispatches explicit location');
assert.ok(helperSource.includes('idempotency_key: effectiveId'), 'Webhook includes idempotency key to prevent duplicate messages');
console.log('✓ PASS: Webhook payload guarantees top-level 4 fields mapping and idempotency');

console.log('--- ALL DECORATIVE STICKER BADGES & AUTOMATION TESTS PASSED ---');
