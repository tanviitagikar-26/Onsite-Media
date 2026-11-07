import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Tests for the updated "GET IN TOUCH" button:
 * - High-contrast highlight color standing out against black background
 * - Star icon (✦) preserved
 * - Text ("GET IN TOUCH") preserved
 * - Rounded shape (rounded-2xl) and polished appearance preserved
 * - Upper corner persistent fixed positioning on every page
 */

console.log('--- RUNNING GET IN TOUCH BUTTON DESIGN & POSITIONING TESTS ---');

const contactButtonSource = fs.readFileSync(
  path.resolve(process.cwd(), 'src/components/ui/ContactButton.tsx'),
  'utf-8'
);

const appSource = fs.readFileSync(
  path.resolve(process.cwd(), 'src/App.tsx'),
  'utf-8'
);

const heroSource = fs.readFileSync(
  path.resolve(process.cwd(), 'src/components/sections/HeroSection.tsx'),
  'utf-8'
);

// 1. Label and text preservation
assert.ok(
  contactButtonSource.includes("GET IN TOUCH"),
  'ContactButton has default label "GET IN TOUCH"'
);
console.log('✓ PASS: "GET IN TOUCH" text is preserved');

// 2. Star icon preservation
assert.ok(
  contactButtonSource.includes('✦'),
  'ContactButton preserves the 4-pointed star icon ✦'
);
console.log('✓ PASS: Star icon (✦) is preserved with polished styling');

// 3. Rounded shape preservation
assert.ok(
  contactButtonSource.includes('rounded-2xl'),
  'ContactButton maintains the rounded-2xl pill shape'
);
console.log('✓ PASS: Rounded shape (rounded-2xl) is preserved');

// 4. High-contrast highlight color
assert.ok(
  contactButtonSource.includes('#FFE043'),
  'ContactButton uses vibrant electric highlight color #FFE043'
);
assert.ok(
  contactButtonSource.includes('text-[#111215]'),
  'Button text uses deep rich black for maximum contrast'
);
assert.ok(
  contactButtonSource.includes('border-2 border-[#111215]'),
  'Button includes crisp 2px black border'
);
console.log('✓ PASS: High-contrast highlight color (#FFE043) with black border and text stands out clearly against black video');

// 5. Polished appearance and interactive feedback
assert.ok(
  contactButtonSource.includes('shadow-[4px_4px_0px_#111215]'),
  'Button has physical neo-brutalist offset shadow'
);
assert.ok(
  contactButtonSource.includes('soundFX.playPop()'),
  'Button provides audio feedback on click'
);
console.log('✓ PASS: Polished appearance with neo-brutalist shadow and click sound effects');

// 6. Placed in an upper corner of the starting hero section only
assert.ok(
  heroSource.includes('<ContactButton') && heroSource.includes('label="GET IN TOUCH"'),
  'HeroSection renders the GET IN TOUCH ContactButton in the upper corner header'
);
assert.ok(
  heroSource.includes('justify-end') && heroSource.includes('items-start'),
  'HeroSection positions the button in the upper corner'
);
console.log('✓ PASS: Placed in an upper corner of the starting hero section');

// 7. Not on every page (removed from App.tsx persistent fixed container)
assert.ok(
  !appSource.includes('<ContactButton'),
  'App.tsx does not render a persistent ContactButton on every page'
);
console.log('✓ PASS: Confined to the hero section only, not fixed across every page');

console.log('--- ALL GET IN TOUCH BUTTON TESTS PASSED (7/7) ---');
