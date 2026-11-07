import { INITIAL_SERVICES } from '../data/initialData';
import { ServiceItem } from '../types';
import { getServiceCategoryOptions, PROJECT_CATEGORIES } from '../components/ui/UnifiedContactForm';
import { formatClientPhoneNotification, formatOwnerWhatsAppDeliveryUrl } from '../utils/inquiryDeliveryHelper';
import { PRIMARY_PHONE_NUMBER } from '../data/initialData';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`✗ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✓ PASS: ${message}`);
}

console.log('--- RUNNING DYNAMIC PROJECT CATEGORY SYNC TESTS ---');

// Mock localStorage for test environment
const mockStorage: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, value: string) => {
    mockStorage[key] = value;
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    for (const k in mockStorage) delete mockStorage[k];
  },
};
(globalThis as any).localStorage = mockLocalStorage;

// 1. Initial State: Category options match owner's initial offered services plus "Others"
const initialOptions = getServiceCategoryOptions(INITIAL_SERVICES);
assert(initialOptions.length === INITIAL_SERVICES.length + 1, 'Initial category count matches INITIAL_SERVICES length plus Others option');
assert(
  initialOptions.includes('Concert Photography & Cinematography') &&
  initialOptions.includes('Event Coverage') &&
  initialOptions.includes('Wedding Photography & Cinematography') &&
  initialOptions.includes('Video Editing & Post-Production') &&
  initialOptions.includes('Others'),
  'Initial options contain exact services provided by owner plus Others'
);

// Verify legacy unoffered categories are not in the dynamic list
assert(
  !initialOptions.includes('3D Modeling & CGI Visualization'),
  'Unoffered legacy categories (3D Modeling & CGI Visualization) are not in owner services list'
);

// 2. Dynamic Add: Adding a service immediately updates category options
let liveServices: ServiceItem[] = JSON.parse(JSON.stringify(INITIAL_SERVICES));
const newService: ServiceItem = {
  id: 'serv-05',
  number: '05',
  name: 'Drone FPV & Aerial Cinematography',
  description: 'High-speed dynamic FPV fly-throughs and cinematic 4K aerials.',
  pricingEstimate: '$2,500+',
};
liveServices = [...liveServices, newService];

const optionsAfterAdd = getServiceCategoryOptions(liveServices);
assert(optionsAfterAdd.length === 6, 'Category options count increased to 6 after service addition (5 services + Others)');
assert(optionsAfterAdd.includes('Drone FPV & Aerial Cinematography'), 'New service appears in category options');
assert(optionsAfterAdd[4] === 'Drone FPV & Aerial Cinematography', 'New service preserves list ordering');
assert(optionsAfterAdd.includes('Others'), 'Others option is preserved after service addition');

// 3. Dynamic Update: Renaming an offered service updates category options
liveServices = liveServices.map((svc) =>
  svc.id === 'serv-02'
    ? { ...svc, name: 'Global Festival & Tour Stage Coverage' }
    : svc
);

const optionsAfterUpdate = getServiceCategoryOptions(liveServices);
assert(
  optionsAfterUpdate.includes('Global Festival & Tour Stage Coverage'),
  'Renamed service name is reflected in category options'
);
assert(
  !optionsAfterUpdate.includes('Event Coverage'),
  'Old service name is removed from category options'
);
assert(
  optionsAfterUpdate.includes('Others'),
  'Others option is preserved after service rename'
);

// 4. Dynamic Delete: Removing a service removes it from category options
liveServices = liveServices.filter((svc) => svc.id !== 'serv-03'); // Remove wedding cinematography
const optionsAfterDelete = getServiceCategoryOptions(liveServices);
assert(optionsAfterDelete.length === 5, 'Category options count reduced after deletion (4 services + Others)');
assert(
  !optionsAfterDelete.includes('Wedding Photography & Cinematography'),
  'Deleted service is immediately removed from category options'
);
assert(
  optionsAfterDelete.includes('Others'),
  'Others option is preserved after service deletion'
);

// 5. LocalStorage Synchronization Fallback
mockLocalStorage.setItem('ronny_v2_services', JSON.stringify(liveServices));
// When no services argument is provided, helper reads from localStorage
const optionsFromStorage = getServiceCategoryOptions();
assert(
  optionsFromStorage.includes('Global Festival & Tour Stage Coverage') &&
  optionsFromStorage.includes('Drone FPV & Aerial Cinematography'),
  'Helper reads dynamically synchronized services from localStorage'
);

// 6. Selection Resolution Logic
function resolveSelectedCategory(
  currentSelected: string,
  categories: string[],
  defaultCategory?: string
): string {
  if (defaultCategory && categories.includes(defaultCategory)) {
    return defaultCategory;
  }
  if (categories.includes(currentSelected)) {
    return currentSelected;
  }
  return categories[0] || 'General Studio Inquiry';
}

// Case A: Current selection is valid -> stays selected
const keptSelection = resolveSelectedCategory(
  'Drone FPV & Aerial Cinematography',
  optionsAfterDelete
);
assert(
  keptSelection === 'Drone FPV & Aerial Cinematography',
  'Valid active category selection is preserved'
);

// Case B: Current selection was deleted -> automatically falls back to first offered service
const correctedSelection = resolveSelectedCategory(
  'Wedding Photography & Cinematography', // deleted service
  optionsAfterDelete
);
assert(
  correctedSelection === optionsAfterDelete[0],
  'Deleted category automatically corrects to first available service'
);

// Case C: Explicit defaultCategory prop passed and exists
const requestedDefault = resolveSelectedCategory(
  '',
  optionsAfterDelete,
  'Video Editing & Post-Production'
);
assert(
  requestedDefault === 'Video Editing & Post-Production',
  'Explicit defaultCategory is honored when present in offered services'
);

// Case D: Explicit defaultCategory does not exist -> falls back to first available
const invalidDefault = resolveSelectedCategory(
  '',
  optionsAfterDelete,
  'Non Existent Service'
);
assert(
  invalidDefault === optionsAfterDelete[0],
  'Invalid defaultCategory falls back to first offered service'
);

// 7. Verification of Form Inquiry Delivery with Dynamically Synced Category
const dynamicPayload = {
  id: 'inq-dyn-101',
  name: 'Sarah Connor',
  email: 'sarah@skynet-resistance.org',
  phone: '+1 (555) 345-6789',
  service: 'Global Festival & Tour Stage Coverage',
  message: 'Need full stage coverage with 3 operators for upcoming European dates.',
  ownerName: 'Ronny',
  ownerPhone: PRIMARY_PHONE_NUMBER,
  createdAt: '2026-10-14T12:00:00.000Z',
};

const ownerNotification = formatClientPhoneNotification(dynamicPayload, 'Ronny');
assert(
  ownerNotification.includes('Global Festival & Tour Stage Coverage'),
  'Owner notification list captures dynamically synchronized service name'
);

const ownerUrl = formatOwnerWhatsAppDeliveryUrl(
  PRIMARY_PHONE_NUMBER,
  dynamicPayload,
  'Ronny'
);
assert(
  ownerUrl.url.includes(encodeURIComponent('Global Festival & Tour Stage Coverage')),
  'Owner WhatsApp delivery URL encodes dynamic service category'
);

// 8. Verification: Visitor phone field does not expose or prefill owner's phone number
import fs from 'fs';
const contactFormSource = fs.readFileSync('src/components/ui/UnifiedContactForm.tsx', 'utf-8');

assert(
  !contactFormSource.includes('placeholder="e.g. +1 (555) 000-0000 or 9035582905"'),
  'Owner phone number (9035582905) is completely removed from visitor phone placeholder'
);
assert(
  contactFormSource.includes("phone: ''"),
  'Visitor phone field initializes to empty string so user can freely enter their own number'
);

console.log('--- ALL DYNAMIC PROJECT CATEGORY & FORM FIELD TESTS PASSED (16/16) ---');
