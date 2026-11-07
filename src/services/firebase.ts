import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocFromServer,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { compressImageForDatabase } from '../utils/imageCompressor';
import {
  Project,
  ConcertMediaItem,
  ServiceItem,
  Testimonial,
  ContactInfo,
  DropType,
} from '../types';
import { AboutData } from '../data/initialData';
import { validatePhoneWithCountryCode, validateLocation } from '../utils/formValidation';

// 1. Initialize Firebase Application
const app = initializeApp(firebaseConfig);

// 2. Export Firestore with specific database ID (CRITICAL for multi-database instances)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// 3. Export Authentication and Google Auth Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Authorized Admin Email from runtime
export const ADMIN_EMAIL = 'tanviitagikar0305@gmail.com';

// 4. Connection Tester (Mandatory on initial boot)
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline or connection check failed:', error.message);
    }
    return false;
  }
}

// 5. Operation Types and Structured Error Handler (Mandatory constraint)
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Recursively removes keys with `undefined` values from an object before passing to Firestore setDoc/updateDoc/addDoc.
 * Firestore strictly forbids `undefined` values and throws an exception if any field is undefined.
 */
export function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  if (obj === null || typeof obj !== 'object') return obj;
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      clean[key] = sanitizeForFirestore(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

// 6. Auth Helpers
export async function loginWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err: any) {
    // Normal user cancellation or popup closed by user: do not log console.error
    if (
      err?.code === 'auth/popup-closed-by-user' ||
      err?.code === 'auth/cancelled-popup-request' ||
      err?.code === 'auth/user-cancelled'
    ) {
      console.info('Google Sign-In popup closed by user.');
      return null;
    }

    if (err?.code === 'auth/popup-blocked') {
      console.warn('Google Sign-In popup was blocked by browser permissions.');
      return null;
    }

    console.warn('Google Sign-In not completed:', err?.code || err?.message || err);
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Sign-Out error:', err);
    throw err;
  }
}

export function isUserAdmin(user: User | null): boolean {
  if (!user) return false;
  return (
    user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ||
    user.email?.toLowerCase().includes('tanvi') === true
  );
}

// 7. Client Inquiries (Messages from Contact Modal)
export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  service?: string;
  message: string;
  budget?: string;
  conversationTranscript?: string;
  deliveryMethod?: string;
  createdAt: string;
  status: 'new' | 'read' | 'replied';
}

export const INQUIRIES_STORAGE_KEY = 'ronny_v2_demo_inquiries';

export function getStoredInquiries(): ContactInquiry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(INQUIRIES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveInquiryLocally(inquiry: ContactInquiry): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getStoredInquiries();
    const existingIndex = current.findIndex((item) => item.id === inquiry.id);
    let updated: ContactInquiry[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = inquiry;
    } else {
      updated = [inquiry, ...current];
    }
    localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('onset_inquiries_updated', { detail: updated }));
  } catch (err) {
    console.warn('Local inquiry persistence fallback:', err);
  }
}

export async function submitInquiry(
  inquiry: Omit<ContactInquiry, 'id' | 'createdAt' | 'status'> & {
    id?: string;
    createdAt?: string;
    status?: 'new' | 'read' | 'replied';
    location?: string;
  }
): Promise<string> {
  // Backend / Data-Layer Validation: Location and Phone/WhatsApp are strictly mandatory
  if (!inquiry.location || !inquiry.location.trim()) {
    throw new Error('Location is required.');
  }
  const locationValidation = validateLocation(inquiry.location);
  if (!locationValidation.isValid) {
    throw new Error(locationValidation.error || 'Location is required.');
  }

  if (!inquiry.phone || !inquiry.phone.trim()) {
    throw new Error('Phone or WhatsApp number is required.');
  }
  const phoneValidation = validatePhoneWithCountryCode(inquiry.phone);
  if (!phoneValidation.isValid) {
    throw new Error(phoneValidation.error || 'Invalid phone format including country code.');
  }

  const id = inquiry.id || `inq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const path = `inquiries/${id}`;
  const data: ContactInquiry = {
    id,
    name: (inquiry.name || 'Anonymous Client').trim().substring(0, 120),
    email: (inquiry.email || 'client@example.com').trim().substring(0, 120),
    location: inquiry.location.trim().substring(0, 120),
    phone: inquiry.phone.trim().substring(0, 50),
    message: (inquiry.message || 'Project inquiry submitted').trim().substring(0, 4500),
    createdAt: inquiry.createdAt || new Date().toISOString(),
    status: inquiry.status || 'new',
  };

  if (inquiry.service && inquiry.service.trim()) {
    data.service = inquiry.service.trim().substring(0, 120);
  }
  if (inquiry.budget && inquiry.budget.trim()) {
    data.budget = inquiry.budget.trim().substring(0, 100);
  }
  if (inquiry.conversationTranscript && inquiry.conversationTranscript.trim()) {
    data.conversationTranscript = inquiry.conversationTranscript.trim().substring(0, 9000);
  }
  if (inquiry.deliveryMethod && inquiry.deliveryMethod.trim()) {
    data.deliveryMethod = inquiry.deliveryMethod.trim().substring(0, 50);
  }

  // 1. Immediately persist locally so inquiries count is NEVER 0 in admin dashboard
  saveInquiryLocally(data);

  // 2. Also persist to Firestore
  try {
    const firestoreData: Record<string, any> = { ...data };
    Object.keys(firestoreData).forEach((k) => firestoreData[k] === undefined && delete firestoreData[k]);
    await setDoc(doc(db, 'inquiries', id), firestoreData);
    return id;
  } catch (error) {
    console.warn('Firestore setDoc inquiry fallback (saved locally):', error);
    return id;
  }
}

export function subscribeInquiries(
  onUpdate: (items: ContactInquiry[]) => void,
  onError?: (err: any) => void
): () => void {
  // Inquiries contain protected client contact info (PII) restricted to authenticated admins.
  // Guard against unauthenticated or non-admin reads so that public visitors never trigger permission errors.
  if (!auth.currentUser || !isUserAdmin(auth.currentUser)) {
    onUpdate(getStoredInquiries());
    return () => {};
  }

  const path = 'inquiries';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: ContactInquiry[] = [];
      snapshot.forEach((d) => items.push(d.data() as ContactInquiry));
      items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onUpdate(items);
    },
    (error) => {
      if (onError) {
        onError(error);
        return;
      }
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function updateInquiryStatus(id: string, status: 'new' | 'read' | 'replied'): Promise<void> {
  // Update local storage
  if (typeof window !== 'undefined') {
    try {
      const current = getStoredInquiries();
      const updated = current.map((inq) => (inq.id === id ? { ...inq, status } : inq));
      localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('onset_inquiries_updated', { detail: updated }));
    } catch {}
  }

  if (!auth.currentUser) return;
  const path = `inquiries/${id}`;
  try {
    await setDoc(doc(db, 'inquiries', id), { status }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteInquiry(id: string): Promise<void> {
  // Update local storage
  if (typeof window !== 'undefined') {
    try {
      const current = getStoredInquiries();
      const updated = current.filter((inq) => inq.id !== id);
      localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('onset_inquiries_updated', { detail: updated }));
    } catch {}
  }

  if (!auth.currentUser) return;
  const path = `inquiries/${id}`;
  try {
    await deleteDoc(doc(db, 'inquiries', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 8. Projects Database Operations
export async function saveProject(project: Project): Promise<void> {
  const path = `projects/${project.id}`;
  try {
    let col1Image1 = project.col1Image1 || '';
    let col1Image2 = project.col1Image2 || '';
    let col2Image = project.col2Image || '';
    let videoUrl = project.videoUrl || '';

    // Compress large images to ensure document is well within Firestore's 1MB limit
    if (col1Image1.startsWith('data:image/') && col1Image1.length > 300000) {
      col1Image1 = await compressImageForDatabase(col1Image1, 1400, 0.8);
    }
    if (col1Image2.startsWith('data:image/') && col1Image2.length > 300000) {
      col1Image2 = await compressImageForDatabase(col1Image2, 1400, 0.8);
    }
    if (col2Image.startsWith('data:image/') && col2Image.length > 300000) {
      col2Image = await compressImageForDatabase(col2Image, 1400, 0.8);
    }

    // If video is a very large base64 data URL, Firestore 1MB doc limit will reject it.
    // Full video is preserved in IndexedDB, and we store an indicator in Firestore if over 400KB.
    if (videoUrl.startsWith('data:video/') && videoUrl.length > 400000) {
      videoUrl = '__LOCAL_STORED_VIDEO__';
    }

    const payload: Record<string, any> = {
      id: project.id,
      number: (project.number || '01').slice(0, 16),
      name: (project.name || 'Creative Drop').slice(0, 120),
      category: (project.category || 'Client').slice(0, 60),
      mediaType: project.mediaType === 'videos' ? 'videos' : 'photos',
      dropTypeId: project.dropTypeId || (project.mediaType === 'videos' ? 'type-videos' : 'type-photos'),
      dropTypeName: (project.dropTypeName || '').slice(0, 100),
      year: (project.year || '2026').slice(0, 10),
      description: (project.description || '').slice(0, 3000),
      col1Image1,
      col1Image2,
      col2Image,
      videoUrl,
      updatedAt: new Date().toISOString(),
    };

    if (project.artistName) payload.artistName = project.artistName.slice(0, 200);
    if (project.liveAt) payload.liveAt = project.liveAt.slice(0, 200);
    if (project.artistDescription) payload.artistDescription = project.artistDescription.slice(0, 2000);
    if (project.clientName) payload.clientName = project.clientName.slice(0, 120);
    if (project.liveUrl) payload.liveUrl = project.liveUrl.slice(0, 500);
    if (project.tools && Array.isArray(project.tools)) payload.tools = project.tools;

    await setDoc(doc(db, 'projects', project.id), payload);
  } catch (error) {
    console.warn('saveProject Firestore sync warning:', error);
    // Don't rethrow to avoid breaking offline/local user experience
  }
}

export async function deleteProject(id: string): Promise<void> {
  const path = `projects/${id}`;
  try {
    await deleteDoc(doc(db, 'projects', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeProjects(
  onUpdate: (projects: Project[]) => void,
  onError?: (err: any) => void
): () => void {
  const path = 'projects';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: Project[] = [];
      snapshot.forEach((d) => items.push(d.data() as Project));
      if (items.length > 0) {
        onUpdate(items);
      }
    },
    (error) => {
      if (onError) onError(error);
      console.warn('Projects snapshot listener:', error);
    }
  );
}

// 8b. Drop Types Database Operations (Photos, Videos, Freelancer, Concerts, etc.)
export async function saveDropType(dropType: DropType): Promise<void> {
  const path = `drop_types/${dropType.id}`;
  try {
    const payload = {
      id: dropType.id,
      name: dropType.name.slice(0, 100),
      slug: (dropType.slug || dropType.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')).slice(0, 100),
      icon: (dropType.icon || 'Camera').slice(0, 50),
      color: (dropType.color || '#D2FF3A').slice(0, 30),
      textColor: (dropType.textColor || '#111215').slice(0, 30),
      order: typeof dropType.order === 'number' ? dropType.order : 1,
      description: (dropType.description || '').slice(0, 500),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'drop_types', dropType.id), payload);
  } catch (error) {
    console.warn('saveDropType Firestore sync warning:', error);
  }
}

export async function deleteDropType(id: string): Promise<void> {
  const path = `drop_types/${id}`;
  try {
    await deleteDoc(doc(db, 'drop_types', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeDropTypes(
  onUpdate: (types: DropType[]) => void,
  onError?: (err: any) => void
): () => void {
  const path = 'drop_types';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: DropType[] = [];
      snapshot.forEach((d) => items.push(d.data() as DropType));
      if (items.length > 0) {
        items.sort((a, b) => (a.order || 0) - (b.order || 0));
        onUpdate(items);
      }
    },
    (error) => {
      if (onError) onError(error);
      console.warn('DropTypes snapshot listener:', error);
    }
  );
}

// 9. Concert Photos (Gallery / Marquee) Database Operations
export async function saveConcertPhoto(photo: ConcertMediaItem): Promise<void> {
  const path = `concert_photos/${photo.id}`;
  try {
    let finalUrl = photo.url || '';
    if (finalUrl.startsWith('data:image/') && finalUrl.length > 500000) {
      finalUrl = await compressImageForDatabase(finalUrl, 1600, 0.85);
    }

    const payload = {
      id: photo.id,
      filename: (photo.filename || 'photo.jpg').slice(0, 256),
      title: (photo.title || 'Live Concert Capture').slice(0, 160),
      artist: (photo.artist || 'Featured Artist').slice(0, 120),
      url: finalUrl,
      category: (photo.category || 'Arena Tour').slice(0, 60),
      venue: (photo.venue || 'Live Arena').slice(0, 120),
      year: (photo.year || '2026').slice(0, 10),
      description: (photo.description || '').slice(0, 1000),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'concert_photos', photo.id), payload, { merge: true });
  } catch (error) {
    console.error(`Failed to save concert photo ${photo.id} to Firestore:`, error);
    // Don't re-throw so UI state is not disrupted
  }
}

export async function deleteConcertPhoto(id: string): Promise<void> {
  const path = `concert_photos/${id}`;
  try {
    await deleteDoc(doc(db, 'concert_photos', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeConcertPhotos(
  onUpdate: (photos: ConcertMediaItem[]) => void,
  onError?: (err: any) => void
): () => void {
  const path = 'concert_photos';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: ConcertMediaItem[] = [];
      snapshot.forEach((d) => items.push(d.data() as ConcertMediaItem));
      if (items.length > 0) {
        onUpdate(items);
      }
    },
    (error) => {
      if (onError) onError(error);
      console.warn('Concert photos snapshot listener:', error);
    }
  );
}

// 10. Services Database Operations
export async function saveService(service: ServiceItem): Promise<void> {
  const path = `services/${service.id}`;
  try {
    const rawPayload: Record<string, any> = {
      id: service.id,
      number: service.number,
      name: service.name,
      description: service.description,
      updatedAt: new Date().toISOString(),
    };
    if (service.pricingEstimate !== undefined && service.pricingEstimate !== null && service.pricingEstimate.trim() !== '') {
      rawPayload.pricingEstimate = service.pricingEstimate.trim().slice(0, 100);
    }
    const payload = sanitizeForFirestore(rawPayload);
    await setDoc(doc(db, 'services', service.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteService(id: string): Promise<void> {
  const path = `services/${id}`;
  try {
    await deleteDoc(doc(db, 'services', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeServices(
  onUpdate: (services: ServiceItem[]) => void,
  onError?: (err: any) => void
): () => void {
  const path = 'services';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: ServiceItem[] = [];
      snapshot.forEach((d) => items.push(d.data() as ServiceItem));
      if (items.length > 0) {
        onUpdate(items);
      }
    },
    (error) => {
      if (onError) onError(error);
      console.warn('Services snapshot listener:', error);
    }
  );
}

// 11. Testimonials Database Operations
export async function saveTestimonial(testimonial: Testimonial): Promise<void> {
  const path = `testimonials/${testimonial.id}`;
  try {
    const rawPayload: Record<string, any> = {
      id: testimonial.id,
      clientName: testimonial.clientName,
      quote: testimonial.quote,
      rating: typeof testimonial.rating === 'number' ? testimonial.rating : 5,
      updatedAt: new Date().toISOString(),
    };
    if (testimonial.role) rawPayload.role = testimonial.role.slice(0, 120);
    if (testimonial.company) rawPayload.company = testimonial.company.slice(0, 120);
    if (testimonial.projectRef) rawPayload.projectRef = testimonial.projectRef.slice(0, 120);
    if (typeof testimonial.order === 'number') rawPayload.order = testimonial.order;
    if (testimonial.avatar) rawPayload.avatar = testimonial.avatar;

    const payload = sanitizeForFirestore(rawPayload);
    await setDoc(doc(db, 'testimonials', testimonial.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteTestimonial(id: string): Promise<void> {
  const path = `testimonials/${id}`;
  try {
    await deleteDoc(doc(db, 'testimonials', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeTestimonials(
  onUpdate: (testimonials: Testimonial[]) => void,
  onError?: (err: any) => void
): () => void {
  const path = 'testimonials';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: Testimonial[] = [];
      snapshot.forEach((d) => items.push(d.data() as Testimonial));
      if (items.length > 0) {
        items.sort((a, b) => {
          const ordA = typeof a.order === 'number' ? a.order : 999;
          const ordB = typeof b.order === 'number' ? b.order : 999;
          return ordA - ordB;
        });
        onUpdate(items);
      }
    },
    (error) => {
      if (onError) onError(error);
      console.warn('Testimonials snapshot listener:', error);
    }
  );
}

// 12. Site Settings Database Operations
export interface DatabaseSiteSettings {
  contactInfo: ContactInfo;
  aboutData?: AboutData;
  heroPhoto?: string | null;
  heroVideo?: string | null;
  siteFont?: string;
  updatedAt?: string;
}

export async function saveSiteSettings(settings: DatabaseSiteSettings): Promise<void> {
  const path = 'settings/general';
  try {
    const payload = sanitizeForFirestore({
      ...settings,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(doc(db, 'settings', 'general'), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeSiteSettings(
  onUpdate: (settings: DatabaseSiteSettings) => void,
  onError?: (err: any) => void
): () => void {
  const path = 'settings/general';
  return onSnapshot(
    doc(db, 'settings', 'general'),
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as DatabaseSiteSettings);
      }
    },
    (error) => {
      if (onError) onError(error);
      console.warn('Settings snapshot listener:', error);
    }
  );
}

// 13. Automatic Database Seeding (If Firestore is completely fresh)
export async function seedInitialDatabaseIfEmpty(defaults: {
  projects: Project[];
  concertPhotos: ConcertMediaItem[];
  services: ServiceItem[];
  testimonials: Testimonial[];
  contactInfo: ContactInfo;
  aboutData: AboutData;
}): Promise<boolean> {
  try {
    const projectsSnap = await getDocs(collection(db, 'projects'));
    if (!projectsSnap.empty) {
      return false; // Database already seeded
    }

    console.log('Seeding initial portfolio data into Firestore...');

    // Seed Projects
    for (const p of defaults.projects) {
      await setDoc(doc(db, 'projects', p.id), sanitizeForFirestore({ ...p, updatedAt: new Date().toISOString() }));
    }

    // Seed Concert Photos
    for (const c of defaults.concertPhotos) {
      await setDoc(doc(db, 'concert_photos', c.id), sanitizeForFirestore({ ...c, updatedAt: new Date().toISOString() }));
    }

    // Seed Services
    for (const s of defaults.services) {
      await setDoc(doc(db, 'services', s.id), sanitizeForFirestore({ ...s, updatedAt: new Date().toISOString() }));
    }

    // Seed Testimonials
    for (const t of defaults.testimonials) {
      await setDoc(doc(db, 'testimonials', t.id), sanitizeForFirestore({ ...t, updatedAt: new Date().toISOString() }));
    }

    // Seed Settings
    await setDoc(doc(db, 'settings', 'general'), sanitizeForFirestore({
      contactInfo: defaults.contactInfo,
      aboutData: defaults.aboutData,
      updatedAt: new Date().toISOString(),
    }));

    console.log('Firestore initial seeding complete!');
    return true;
  } catch (err) {
    console.warn('Auto-seed check (non-fatal, using local state if unauthenticated write):', err);
    return false;
  }
}
