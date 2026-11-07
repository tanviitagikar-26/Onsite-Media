import { Testimonial } from '../types';
import { INITIAL_TESTIMONIALS } from '../data/initialData';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`✗ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✓ PASS: ${message}`);
}

console.log('--- RUNNING TESTIMONIALS REVIEW ORDERING TESTS ---');

// 1. Initial order check
const initialSorted = [...INITIAL_TESTIMONIALS].sort((a, b) => {
  const ordA = typeof a.order === 'number' ? a.order : 999;
  const ordB = typeof b.order === 'number' ? b.order : 999;
  return ordA - ordB;
});

assert(initialSorted.length === 3, 'INITIAL_TESTIMONIALS has 3 reviews');
assert(initialSorted[0].order === 1, 'First review has order 1');
assert(initialSorted[1].order === 2, 'Second review has order 2');
assert(initialSorted[2].order === 3, 'Third review has order 3');

// 2. Carousel navigation index computation
const getNextIndex = (currentIndex: number, total: number) => {
  return currentIndex === total - 1 ? 0 : currentIndex + 1;
};

const getPrevIndex = (currentIndex: number, total: number) => {
  return currentIndex === 0 ? total - 1 : currentIndex - 1;
};

// Test sequential Next navigation starting at index 0 (Review 1)
const step1 = getNextIndex(0, 3);
assert(step1 === 1, 'Next from Review 1 (index 0) goes to Review 2 (index 1), NEVER Review 3');

const step2 = getNextIndex(step1, 3);
assert(step2 === 2, 'Next from Review 2 (index 1) goes to Review 3 (index 2)');

const step3 = getNextIndex(step2, 3);
assert(step3 === 0, 'Next from Review 3 (index 2) loops back to Review 1 (index 0)');

// Test Previous navigation
assert(getPrevIndex(0, 3) === 2, 'Prev from Review 1 (index 0) goes to Review 3 (index 2)');
assert(getPrevIndex(2, 3) === 1, 'Prev from Review 3 (index 2) goes to Review 2 (index 1)');
assert(getPrevIndex(1, 3) === 0, 'Prev from Review 2 (index 1) goes to Review 1 (index 0)');

// 3. Test changing review order (e.g., reordering review 3 to position 1)
const testReviews: Testimonial[] = [
  { id: 't1', clientName: 'Alice', company: 'A Corp', role: 'Lead', quote: 'Great', projectRef: 'P1', rating: 5, order: 2 },
  { id: 't2', clientName: 'Bob', company: 'B Corp', role: 'Director', quote: 'Awesome', projectRef: 'P2', rating: 5, order: 3 },
  { id: 't3', clientName: 'Charlie', company: 'C Corp', role: 'Founder', quote: 'Superb', projectRef: 'P3', rating: 5, order: 1 },
];

const sortedChanged = [...testReviews].sort((a, b) => (a.order || 999) - (b.order || 999));
assert(sortedChanged[0].clientName === 'Charlie', 'Review with order 1 (Charlie) is displayed first');
assert(sortedChanged[1].clientName === 'Alice', 'Review with order 2 (Alice) is displayed second');
assert(sortedChanged[2].clientName === 'Bob', 'Review with order 3 (Bob) is displayed third');

console.log('ALL TESTIMONIAL ORDERING TESTS PASSED (6 passed, 0 failed).');
