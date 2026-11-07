import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { INITIAL_SERVICES, INITIAL_ABOUT_US } from '../data/initialData';
import { getServiceCategoryOptions } from '../components/ui/UnifiedContactForm';
import { formatClientPhoneNotification, formatOwnerWhatsAppDeliveryUrl } from '../utils/inquiryDeliveryHelper';

console.log('--- RUNNING ABOUT US, FOUNDER PHOTO, AND OTHERS CATEGORY TESTS ---');

// 1. Founder photo sizing in AboutSection.tsx
const aboutSectionPath = path.resolve(process.cwd(), 'src/components/sections/AboutSection.tsx');
assert.ok(fs.existsSync(aboutSectionPath), 'AboutSection.tsx exists');
const aboutSectionSource = fs.readFileSync(aboutSectionPath, 'utf8');

assert.ok(
  aboutSectionSource.includes('w-48 h-56 sm:w-60 sm:h-68 md:w-72 md:h-80') ||
  aboutSectionSource.includes('w-48') && aboutSectionSource.includes('h-56'),
  'AboutSection.tsx has enlarged founder photo sizing with balanced portrait proportions'
);
assert.ok(
  aboutSectionSource.includes('object-cover object-top'),
  'AboutSection.tsx maintains object-cover and top alignment for clear face framing'
);
assert.ok(
  aboutSectionSource.includes('FOUNDER'),
  'AboutSection.tsx preserves the FOUNDER badge stamp'
);
console.log('✓ PASS: Founder photo sizing is enlarged and well-proportioned');

// 2. About Us tab in navigation before Meet the Founder
const navMenuPath = path.resolve(process.cwd(), 'src/components/ui/StickerNavMenu.tsx');
assert.ok(fs.existsSync(navMenuPath), 'StickerNavMenu.tsx exists');
const navSource = fs.readFileSync(navMenuPath, 'utf8');

const aboutUsNavIndex = navSource.indexOf("id: 'about-us'");
const meetFounderNavIndex = navSource.indexOf("id: 'about'");
assert.ok(aboutUsNavIndex !== -1, 'StickerNavMenu has "about-us" section item');
assert.ok(meetFounderNavIndex !== -1, 'StickerNavMenu has "about" (Meet the Founder) section item');
assert.ok(
  aboutUsNavIndex < meetFounderNavIndex,
  '"About Us" tab is placed before "Meet the Founder" in navigation menu'
);
console.log('✓ PASS: "About Us" tab is placed before "Meet the Founder" in navigation');

// 3. About Us section rendered on the website before Meet the Founder
const appPath = path.resolve(process.cwd(), 'src/App.tsx');
const appSource = fs.readFileSync(appPath, 'utf8');

const aboutUsRenderIndex = appSource.indexOf('<AboutUsSection');
const founderRenderIndex = appSource.indexOf('<AboutSection');
assert.ok(aboutUsRenderIndex !== -1, 'App.tsx renders <AboutUsSection');
assert.ok(founderRenderIndex !== -1, 'App.tsx renders <AboutSection');
assert.ok(
  aboutUsRenderIndex < founderRenderIndex,
  '<AboutUsSection /> is placed before <AboutSection /> (Meet the Founder) on the website'
);
console.log('✓ PASS: AboutUsSection is positioned before Meet the Founder on the page');

// 4. Admin Section has About Us editing controls and tab
const adminPath = path.resolve(process.cwd(), 'src/components/admin/AdminDashboard.tsx');
const adminSource = fs.readFileSync(adminPath, 'utf8');

assert.ok(
  adminSource.includes("id: 'about-us'") && adminSource.includes('About Us'),
  'AdminDashboard has About Us tab in tab bar'
);
assert.ok(
  adminSource.includes("activeTab === 'about-us'"),
  'AdminDashboard has dedicated tab view for About Us'
);
assert.ok(
  adminSource.includes('aboutUsForm.headline') &&
  adminSource.includes('aboutUsForm.paragraph1') &&
  adminSource.includes('handleSaveAboutUs'),
  'AdminDashboard has editing controls and save handlers for About Us'
);
console.log('✓ PASS: Admin dashboard contains complete About Us editing controls');

// 5. "Others" option in Project Category dropdown and delivery
const categories = getServiceCategoryOptions(INITIAL_SERVICES);
assert.ok(categories.includes('Others'), 'Category dropdown options contain "Others"');
assert.strictEqual(categories[categories.length - 1], 'Others', '"Others" is listed as option in categories');

const notificationMsg = formatClientPhoneNotification({
  name: 'Alex Rivera',
  email: 'alex@example.com',
  service: 'Others',
  message: 'Custom VR installation project inquiry',
});
assert.ok(notificationMsg.includes('*Project Category:* Others'), 'Notification correctly includes "Others" category');

const deliveryUrlResult = formatOwnerWhatsAppDeliveryUrl('9035582905', {
  name: 'Alex Rivera',
  email: 'alex@example.com',
  service: 'Others',
  message: 'Custom VR installation project inquiry',
});
assert.ok(deliveryUrlResult.url.includes('Others'), 'WhatsApp URL delivery encodes "Others" category');

// 6. Verify Meet the Founder layout order: Heading -> Photo -> Description
const headingIndex = aboutSectionSource.indexOf('MEET THE FOUNDER');
const photoIndex = aboutSectionSource.indexOf('img');
const descIndex = aboutSectionSource.indexOf('<AnimatedText');
assert.ok(headingIndex !== -1, 'AboutSection has MEET THE FOUNDER heading');
assert.ok(photoIndex !== -1, 'AboutSection has founder image');
assert.ok(descIndex !== -1, 'AboutSection has AnimatedText description');
assert.ok(
  headingIndex < photoIndex && photoIndex < descIndex,
  'Order in AboutSection is strictly: Heading -> Photo -> Description'
);
console.log('✓ PASS: Meet the Founder section layout order strictly verified: Heading -> Photo -> Description');

// 7. Verify AboutUsSection removals: tagline, OM Studio Narrative, EST 2021, Pillars, and CTA button
const aboutUsPath = path.resolve(process.cwd(), 'src/components/sections/AboutUsSection.tsx');
assert.ok(fs.existsSync(aboutUsPath), 'AboutUsSection.tsx exists');
const aboutUsSource = fs.readFileSync(aboutUsPath, 'utf8');

assert.ok(!aboutUsSource.includes('current.tagline'), 'Tagline removed from AboutUsSection');
assert.ok(!aboutUsSource.includes('High-Octane Visual Direction'), 'Storytelling/Visual Direction text removed from AboutUsSection');
assert.ok(!aboutUsSource.includes('Studio Narrative'), 'Studio Narrative header removed from AboutUsSection');
assert.ok(!aboutUsSource.includes('EST. 2021'), 'EST. 2021 badge removed from AboutUsSection');
assert.ok(!aboutUsSource.includes('OUR CORE CREATIVE PILLARS'), 'OUR CORE CREATIVE PILLARS label removed from AboutUsSection');
assert.ok(!aboutUsSource.includes('GET IN TOUCH'), 'GET IN TOUCH button removed from AboutUsSection');
assert.ok(!aboutUsSource.includes('Inquire Now'), 'Inquire Now button removed from AboutUsSection');
assert.ok(aboutUsSource.includes('ABOUT ONSET MEDIA'), 'ABOUT ONSET MEDIA heading preserved in AboutUsSection');
assert.ok(aboutUsSource.includes('current.paragraph1'), 'Main story paragraph preserved in AboutUsSection');
assert.ok(aboutUsSource.includes('current.stats.map'), 'Quick metrics preserved in AboutUsSection');
console.log('✓ PASS: AboutUsSection cleanly removed tagline, pillars, and CTA while preserving narrative and metrics');

console.log('--- ALL ABOUT US, FOUNDER PHOTO, AND OTHERS CATEGORY TESTS PASSED ---');

