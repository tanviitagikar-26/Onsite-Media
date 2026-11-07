import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Test to verify that filename text and stray file overlays are removed from the gallery:
 * - MarqueeSection does NOT render {item.filename} on gallery photo cards
 * - Artist/title overlay is strictly guarded so solitary musical note icons are not displayed on empty photo metadata
 * - Existing layout, rounded corners, and photo styling are preserved
 */

console.log('--- RUNNING GALLERY FILENAME OVERLAY REMOVAL TESTS ---');

const marqueeSectionPath = path.resolve(process.cwd(), 'src/components/sections/MarqueeSection.tsx');
assert.ok(fs.existsSync(marqueeSectionPath), 'MarqueeSection.tsx exists');

const marqueeSource = fs.readFileSync(marqueeSectionPath, 'utf8');

// 1. Verify {item.filename} is completely absent from the card template
assert.ok(
  !marqueeSource.includes('{item.filename}'),
  'MarqueeSection.tsx must NOT render "{item.filename}" anywhere on photo cards'
);

// 2. Verify overlay is conditionally guarded
assert.ok(
  marqueeSource.includes('Boolean((item.artist && item.artist.trim() !== \'\') || (item.title && item.title.trim() !== \'\'))'),
  'MarqueeSection.tsx guards overlay so no empty overlay or lonely musical note appears'
);

// 3. Verify card structure and styling are preserved
assert.ok(marqueeSource.includes('rounded-3xl'), 'Rounded corners preserved');
assert.ok(marqueeSource.includes('border-2 border-[#111215]'), 'Border styling preserved');
assert.ok(marqueeSource.includes('object-cover'), 'Image object-cover preserved');

console.log('✓ PASS: {item.filename} overlay completely removed from gallery photo cards');
console.log('✓ PASS: Solitary musical note icon guarded and prevented when artist is empty');
console.log('✓ PASS: Gallery layout, image sizing, and rounded corners preserved');
console.log('--- ALL GALLERY FILENAME OVERLAY REMOVAL TESTS PASSED ---');
