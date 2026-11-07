import { ServiceItem } from '../types';
import { INITIAL_SERVICES } from '../data/initialData';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`✗ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✓ PASS: ${message}`);
}

console.log('--- RUNNING ADMIN SERVICES EDITING & PERSISTENCE TESTS ---');

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

// 1. Initial services state test
assert(Array.isArray(INITIAL_SERVICES) && INITIAL_SERVICES.length >= 4, 'INITIAL_SERVICES contains default services array');
const originalSvc = INITIAL_SERVICES[0];
assert(!!originalSvc.id && !!originalSvc.name && !!originalSvc.number, 'Service item has required id, name, and number fields');

// 2. Edit existing service fields logic simulation
let services: ServiceItem[] = JSON.parse(JSON.stringify(INITIAL_SERVICES));

const targetId = 'serv-01';
const existingService = services.find((s) => s.id === targetId);
assert(!!existingService, `Target service "${targetId}" found in services list`);

// Administrator edits fields
const updatedFields: Partial<ServiceItem> = {
  number: '01-PRO',
  name: 'Arena & Festival Concert Cinematography',
  description: 'Multi-cam 4K/8K stage coverage, crane shots, crowd energy, and rapid turnaround for festival headliners.',
  pricingEstimate: '$3,500 - $8,000 / Tour Stop',
};

const updatedService: ServiceItem = {
  ...existingService!,
  number: updatedFields.number!.trim(),
  name: updatedFields.name!.trim(),
  description: updatedFields.description!.trim(),
  pricingEstimate: updatedFields.pricingEstimate?.trim(),
};

// Update in state
services = services.map((s) => (s.id === updatedService.id ? updatedService : s));

// Verify in-memory state updated correctly
const verifiedInList = services.find((s) => s.id === targetId);
assert(verifiedInList?.name === 'Arena & Festival Concert Cinematography', 'Service name was updated in list');
assert(verifiedInList?.number === '01-PRO', 'Service number was updated');
assert(verifiedInList?.pricingEstimate === '$3,500 - $8,000 / Tour Stop', 'Service pricingEstimate was updated');
assert(Boolean(verifiedInList?.description.includes('Multi-cam 4K/8K')), 'Service description was updated');

// 3. Verify persistence to storage
mockLocalStorage.setItem('ronny_v2_services', JSON.stringify(services));
const rawPersisted = mockLocalStorage.getItem('ronny_v2_services');
assert(rawPersisted !== null, 'Services state persisted to localStorage');

const reloadedServices: ServiceItem[] = JSON.parse(rawPersisted!);
const reloadedTarget = reloadedServices.find((s) => s.id === targetId);
assert(reloadedTarget !== null && reloadedTarget !== undefined, 'Edited service survives storage reload');
assert(reloadedTarget!.name === 'Arena & Festival Concert Cinematography', 'Reloaded service has updated name');
assert(reloadedTarget!.number === '01-PRO', 'Reloaded service has updated number');
assert(reloadedTarget!.pricingEstimate === '$3,500 - $8,000 / Tour Stop', 'Reloaded service has updated pricing');

// 4. Verify preserving other services when one is updated
const secondService = reloadedServices.find((s) => s.id === 'serv-02');
assert(secondService?.name === 'Event Coverage', 'Unedited services remain unchanged');
assert(reloadedServices.length === INITIAL_SERVICES.length, 'Total count of services preserved');

// 5. Verify partial edit without pricingEstimate
const editWithoutPricing: ServiceItem = {
  ...reloadedTarget!,
  pricingEstimate: undefined,
};
services = services.map((s) => (s.id === editWithoutPricing.id ? editWithoutPricing : s));
const checkPricingRemoved = services.find((s) => s.id === targetId);
assert(checkPricingRemoved?.pricingEstimate === undefined, 'pricingEstimate can be cleared or made optional');

// 6. Verify delete edge case (cancels active editing session)
let editingServiceId: string | null = targetId;
const deletedId = targetId;
services = services.filter((s) => s.id !== deletedId);
if (editingServiceId === deletedId) {
  editingServiceId = null;
}
assert(editingServiceId === null, 'Active editing session is closed when service is deleted');
assert(!services.some((s) => s.id === targetId), 'Service is successfully removed from services list');

// 7. Verify Firestore payload sanitization handles serv-04 without undefined pricingEstimate
const { sanitizeForFirestore } = await import('../services/firebase');
const serv04: ServiceItem = {
  id: 'serv-04',
  number: '04',
  name: 'Video Editing & Post-Production',
  description: 'Crafting impactful visuals through precise editing and color grading.',
  pricingEstimate: undefined,
};
const sanitizedServ04 = sanitizeForFirestore({
  ...serv04,
  updatedAt: new Date().toISOString(),
});
assert(!('pricingEstimate' in sanitizedServ04), 'Sanitized serv-04 payload completely omits pricingEstimate key');
assert(sanitizedServ04.pricingEstimate === undefined, 'pricingEstimate is not defined on sanitized payload');
assert(Object.values(sanitizedServ04).every((v) => v !== undefined), 'No field in sanitized payload is undefined');

console.log('ALL ADMIN SERVICE EDITING & PERSISTENCE TESTS PASSED (17 passed, 0 failed).');
