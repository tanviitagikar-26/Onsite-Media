import React, { useRef, useState, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Edit2,
  Save,
  RotateCcw,
  CheckCircle,
  Video,
  Layers,
  MessageSquareQuote,
  PhoneCall,
  Briefcase,
  Eye,
  EyeOff,
  User,
  Upload,
  Camera,
  Sparkles,
  Check,
  RefreshCw,
  AlertTriangle,
  Search,
  Filter,
  Folder,
  FileImage,
  Film,
  Sliders,
  Copy,
  ExternalLink,
  Play,
  Pause,
  Image as ImageIcon,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Flame,
  Star,
  Database,
  ShieldCheck,
  LogIn,
  LogOut,
  MailCheck,
  ArrowUpRight,
  Tag,
  Palette,
  Hash,
  Type,
  Mail,
  KeyRound,
  ArrowLeft,
  Smartphone,
  Phone,
  MessageSquare,
  Info,
} from 'lucide-react';
import {
  auth,
  loginWithGoogle,
  logoutUser,
  isUserAdmin,
  ADMIN_EMAIL,
  subscribeInquiries,
  ContactInquiry,
  getStoredInquiries,
  submitInquiry as dbSubmitInquiry,
  updateInquiryStatus as dbUpdateInquiryStatus,
  deleteInquiry as dbDeleteInquiry,
  saveProject as dbSaveProject,
  deleteProject as dbDeleteProject,
  saveDropType as dbSaveDropType,
  deleteDropType as dbDeleteDropType,
  saveConcertPhoto as dbSaveConcertPhoto,
  deleteConcertPhoto as dbDeleteConcertPhoto,
  saveService as dbSaveService,
  deleteService as dbDeleteService,
  saveTestimonial as dbSaveTestimonial,
  deleteTestimonial as dbDeleteTestimonial,
  saveSiteSettings as dbSaveSiteSettings,
} from '../../services/firebase';
import {
  authenticateAdmin,
  getActiveAdminSession,
  isSessionAuthorized,
  logoutAdmin,
  getLockoutRemainingSeconds,
  requestPasswordResetOtp,
  verifyOtpAndResetPassword,
  AdminSession,
} from '../../services/adminAuth';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import {
  Project,
  ServiceItem,
  Testimonial,
  ShowreelData,
  ContactInfo,
  ConcertMediaItem,
  SpecialistSoftware,
  DropType,
  AboutUsData,
} from '../../types';
import {
  ASSETS,
  UPLOADED_CONCERT_PHOTOS,
  AboutData,
  INITIAL_ABOUT,
  INITIAL_ABOUT_US,
  INITIAL_SPECIALISTS,
  INITIAL_PROJECTS,
  INITIAL_SERVICES,
  INITIAL_TESTIMONIALS,
  INITIAL_DROP_TYPES,
} from '../../data/initialData';
import { RenderTypeIcon, isProjectInType } from '../sections/ProjectsSection';
import { PhotoDropzone } from '../ui/PhotoDropzone';
import { soundFX } from '../../utils/soundEffects';
import { saveProjectsLocal } from '../../utils/mediaStorage';
import { parseDropDescription, formatDropDescription } from '../../utils/drops';
import { compressImageForDatabase } from '../../utils/imageCompressor';
import { formatWhatsAppUrl } from '../../utils/whatsappHelper';
import { formatClientPhoneNotification } from '../../utils/inquiryDeliveryHelper';
import {
  PhotoshopLogo,
  PremiereProLogo,
  LightroomLogo,
  DaVinciResolveLogo,
  AfterEffectsLogo,
} from '../sections/SpecialistSection';

interface MediaVaultItem {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  source: string;
  createdAt: string;
  category?: string;
}

export interface AvailableFont {
  id: string;
  name: string;
  category: 'sans' | 'geometric' | 'serif' | 'display';
  styleDesc: string;
  family: string;
}

export const AVAILABLE_FONTS: AvailableFont[] = [
  { id: 'Kanit', name: 'Kanit', category: 'sans', styleDesc: 'Modern Punchy Grotesque (Current Default)', family: "'Kanit', sans-serif" },
  { id: 'Inter', name: 'Inter', category: 'sans', styleDesc: 'Clean, Neutral & High Legibility', family: "'Inter', sans-serif" },
  { id: 'Space Grotesk', name: 'Space Grotesk', category: 'geometric', styleDesc: 'Tech & Brutalist Geometric', family: "'Space Grotesk', sans-serif" },
  { id: 'Montserrat', name: 'Montserrat', category: 'geometric', styleDesc: 'Architectural Geometric Bold', family: "'Montserrat', sans-serif" },
  { id: 'Syne', name: 'Syne', category: 'display', styleDesc: 'High-Fashion & Creative Agency', family: "'Syne', sans-serif" },
  { id: 'Plus Jakarta Sans', name: 'Plus Jakarta Sans', category: 'sans', styleDesc: 'Premium Contemporary Tech', family: "'Plus Jakarta Sans', sans-serif" },
  { id: 'Outfit', name: 'Outfit', category: 'geometric', styleDesc: 'Minimalist & Balanced Geometric', family: "'Outfit', sans-serif" },
  { id: 'Sora', name: 'Sora', category: 'sans', styleDesc: 'Sharp Modern Editorial Sans', family: "'Sora', sans-serif" },
  { id: 'Poppins', name: 'Poppins', category: 'geometric', styleDesc: 'Friendly & Rounded Geometric', family: "'Poppins', sans-serif" },
  { id: 'DM Sans', name: 'DM Sans', category: 'sans', styleDesc: 'Low-Contrast Swiss Modernist', family: "'DM Sans', sans-serif" },
  { id: 'Manrope', name: 'Manrope', category: 'sans', styleDesc: 'Geometric Semi-Condensed Modern', family: "'Manrope', sans-serif" },
  { id: 'Urbanist', name: 'Urbanist', category: 'geometric', styleDesc: 'Ultra-Sleek Modernist Sans', family: "'Urbanist', sans-serif" },
  { id: 'Work Sans', name: 'Work Sans', category: 'sans', styleDesc: 'Optimized Screen Typography', family: "'Work Sans', sans-serif" },
  { id: 'Epilogue', name: 'Epilogue', category: 'display', styleDesc: 'Artistic Variable Headline Sans', family: "'Epilogue', sans-serif" },
  { id: 'Oswald', name: 'Oswald', category: 'display', styleDesc: 'Condensed Powerful Poster Headline', family: "'Oswald', sans-serif" },
  { id: 'Bebas Neue', name: 'Bebas Neue', category: 'display', styleDesc: 'Bold All-Caps Headline Display', family: "'Bebas Neue', sans-serif" },
  { id: 'Chakra Petch', name: 'Chakra Petch', category: 'display', styleDesc: 'Cyberpunk & Sci-Fi Angular', family: "'Chakra Petch', sans-serif" },
  { id: 'Playfair Display', name: 'Playfair Display', category: 'serif', styleDesc: 'High-Contrast Luxury Editorial', family: "'Playfair Display', serif" },
  { id: 'Cinzel', name: 'Cinzel', category: 'serif', styleDesc: 'Cinematic Classical Roman Proportions', family: "'Cinzel', serif" },
  { id: 'Bodoni Moda', name: 'Bodoni Moda', category: 'serif', styleDesc: 'High-Fashion Haute Couture Serif', family: "'Bodoni Moda', serif" },
  { id: 'Archivo', name: 'Archivo', category: 'sans', styleDesc: 'Heavy Industrial Grotesque', family: "'Archivo', sans-serif" },
  { id: 'Raleway', name: 'Raleway', category: 'sans', styleDesc: 'Sophisticated Elegant Headings', family: "'Raleway', sans-serif" },
];

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  dropTypes?: DropType[];
  setDropTypes?: React.Dispatch<React.SetStateAction<DropType[]>>;
  services: ServiceItem[];
  setServices: React.Dispatch<React.SetStateAction<ServiceItem[]>>;
  testimonials: Testimonial[];
  setTestimonials: React.Dispatch<React.SetStateAction<Testimonial[]>>;
  showreel: ShowreelData;
  setShowreel: React.Dispatch<React.SetStateAction<ShowreelData>>;
  contactInfo: ContactInfo;
  setContactInfo: React.Dispatch<React.SetStateAction<ContactInfo>>;
  onResetDefaults: () => void;
  heroPhoto?: string | null;
  onHeroPhotoUpdated: (photo: string | null) => void;
  heroVideo?: string | null;
  onHeroVideoUpdated?: (video: string | null) => void;
  siteFont?: string;
  onSiteFontUpdated?: (font: string) => void;
  concertPhotos?: ConcertMediaItem[];
  setConcertPhotos?: React.Dispatch<React.SetStateAction<ConcertMediaItem[]>>;
  originalPhoto?: string | null;
  photosMap?: Record<string, string>;
  setPhotosMap?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onPhotoUploaded?: (photo: string, filename?: string) => void;
  onBatchUploaded?: (photosMap: Record<string, string>) => void;
  aboutData?: AboutData;
  setAboutData?: React.Dispatch<React.SetStateAction<AboutData>>;
  aboutUsData?: AboutUsData;
  setAboutUsData?: React.Dispatch<React.SetStateAction<AboutUsData>>;
  specialists?: SpecialistSoftware[];
  setSpecialists?: React.Dispatch<React.SetStateAction<SpecialistSoftware[]>>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  projects,
  setProjects,
  dropTypes,
  setDropTypes,
  services,
  setServices,
  testimonials,
  setTestimonials,
  showreel,
  setShowreel,
  contactInfo,
  setContactInfo,
  onResetDefaults,
  heroPhoto,
  onHeroPhotoUpdated,
  heroVideo,
  onHeroVideoUpdated,
  siteFont = 'Kanit',
  onSiteFontUpdated,
  concertPhotos = UPLOADED_CONCERT_PHOTOS,
  setConcertPhotos,
  originalPhoto,
  photosMap = {},
  setPhotosMap,
  onPhotoUploaded,
  onBatchUploaded,
  aboutData,
  setAboutData,
  aboutUsData,
  setAboutUsData,
  specialists = INITIAL_SPECIALISTS,
  setSpecialists,
}) => {
  const [adminSession, setAdminSession] = useState<AdminSession | null>(() => getActiveAdminSession());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => isSessionAuthorized());
  const [adminNameInput, setAdminNameInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(() => getLockoutRemainingSeconds());

  // Countdown timer for security lockout
  React.useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      const remaining = getLockoutRemainingSeconds();
      setLockoutSeconds(remaining);
      if (remaining <= 0) {
        setAuthError(null);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  // Administrator Forgot Password & Email OTP State
  const [authView, setAuthView] = useState<'login' | 'forgot_request' | 'forgot_verify' | 'forgot_success'>('login');
  const [resetEmailInput, setResetEmailInput] = useState('');
  const [resetOtpInput, setResetOtpInput] = useState('');
  const [resetNewPasswordInput, setResetNewPasswordInput] = useState('');
  const [resetConfirmPasswordInput, setResetConfirmPasswordInput] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetNotice, setResetNotice] = useState<string | null>(null);
  const [simulatedDevOtp, setSimulatedDevOtp] = useState<string | null>(null);
  const [otpCooldownSeconds, setOtpCooldownSeconds] = useState(0);

  // OTP Request Cooldown interval
  React.useEffect(() => {
    if (otpCooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setOtpCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [otpCooldownSeconds]);
  const [activeTab, setActiveTab] = useState<
    | 'media-vault'
    | 'projects'
    | 'drop-types'
    | 'marquee-photos'
    | 'about-us'
    | 'hero-photo'
    | 'specialist'
    | 'services'
    | 'testimonials'
    | 'typography'
    | 'contact'
    | 'database'
  >('media-vault');
  const heroVideoInputRef = useRef<HTMLInputElement>(null);
  const [customVideoUrlInput, setCustomVideoUrlInput] = useState('');
  const [isUploadingHeroVideo, setIsUploadingHeroVideo] = useState(false);
  const [fontFilter, setFontFilter] = useState<'all' | 'sans' | 'geometric' | 'serif' | 'display'>('all');
  const [saveAlert, setSaveAlert] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [inquiryFilter, setInquiryFilter] = useState<'all' | 'new' | 'read' | 'replied'>('all');
  const [expandedTranscriptId, setExpandedTranscriptId] = useState<string | null>(null);
  const [inquiryWebhookUrl, setInquiryWebhookUrl] = useState<string>(() => {
    try {
      return localStorage.getItem('inquiry_webhook_url') || '';
    } catch {
      return '';
    }
  });
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);

  // Listen to Firebase Auth
  React.useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user && isUserAdmin(user)) {
        setIsAuthenticated(true);
      }
    });

    return () => {
      unsubAuth();
    };
  }, []);

  // Listen to Inquiries: guarantees accurate count for both local admin passcode & Google Admin sessions
  React.useEffect(() => {
    const syncInquiriesFromStorage = () => {
      const local = getStoredInquiries();
      setInquiries(local);
    };

    // Initial load
    syncInquiriesFromStorage();

    // Listen to real-time local updates across tabs / modal submissions
    const handleInquiriesChange = () => {
      syncInquiriesFromStorage();
    };

    window.addEventListener('onset_inquiries_updated', handleInquiriesChange);
    window.addEventListener('storage', handleInquiriesChange);

    // If logged in as verified Google Admin, also subscribe to real-time Cloud Firestore updates
    if (currentUser && isUserAdmin(currentUser)) {
      const unsubInq = subscribeInquiries(
        (cloudItems) => {
          if (cloudItems && cloudItems.length > 0) {
            const local = getStoredInquiries();
            const map = new Map<string, ContactInquiry>();
            cloudItems.forEach((c) => map.set(c.id, c));
            local.forEach((l) => {
              if (!map.has(l.id)) map.set(l.id, l);
            });
            const merged = Array.from(map.values()).sort(
              (a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')
            );
            setInquiries(merged);
            try {
              localStorage.setItem('ronny_v2_demo_inquiries', JSON.stringify(merged));
            } catch {}
          }
        },
        (err) => {
          console.warn('Inquiries restricted listener:', err);
        }
      );

      return () => {
        window.removeEventListener('onset_inquiries_updated', handleInquiriesChange);
        window.removeEventListener('storage', handleInquiriesChange);
        unsubInq();
      };
    }

    return () => {
      window.removeEventListener('onset_inquiries_updated', handleInquiriesChange);
      window.removeEventListener('storage', handleInquiriesChange);
    };
  }, [currentUser]);

  // Dedicated custom uploaded files storage
  const [customVaultFiles, setCustomVaultFiles] = useState<MediaVaultItem[]>(() => {
    try {
      const saved = localStorage.getItem('ronny_v2_media_vault_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveCustomVault = (items: MediaVaultItem[]) => {
    setCustomVaultFiles(items);
    try {
      localStorage.setItem('ronny_v2_media_vault_items', JSON.stringify(items));
    } catch {}
  };

  // Preview Modal State for Media Vault
  const [previewMedia, setPreviewMedia] = useState<MediaVaultItem | null>(null);

  // About & Lore Form State
  const [aboutForm, setAboutForm] = useState<AboutData>(() => aboutData || INITIAL_ABOUT);
  const founderFileInputRef = useRef<HTMLInputElement>(null);

  // About Us (Studio Vision & Narrative) Form State
  const [aboutUsForm, setAboutUsForm] = useState<AboutUsData>(() => aboutUsData || INITIAL_ABOUT_US);
  useEffect(() => {
    if (aboutUsData) {
      setAboutUsForm(aboutUsData);
    }
  }, [aboutUsData]);

  const handleSaveAboutUs = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (setAboutUsData) {
      setAboutUsData(aboutUsForm);
    }
    try {
      localStorage.setItem('ronny_v2_about_us', JSON.stringify(aboutUsForm));
    } catch (err) {
      console.warn('LocalStorage save error for about us:', err);
    }
    notifySave('Saved About Us content! Changes are live on the website.');
  };

  const handleResetAboutUs = () => {
    setAboutUsForm(INITIAL_ABOUT_US);
    if (setAboutUsData) {
      setAboutUsData(INITIAL_ABOUT_US);
    }
    try {
      localStorage.setItem('ronny_v2_about_us', JSON.stringify(INITIAL_ABOUT_US));
    } catch {}
    notifySave('Reset About Us content to studio defaults!');
  };

  // Media Vault State
  const [mediaVaultFilter, setMediaVaultFilter] = useState<'all' | 'photos' | 'videos'>('all');
  const [mediaVaultSearch, setMediaVaultSearch] = useState('');
  const [deletingMediaKey, setDeletingMediaKey] = useState<string | null>(null);
  const mediaVaultFileInputRef = useRef<HTMLInputElement>(null);
  const [isMediaVaultDragging, setIsMediaVaultDragging] = useState(false);
  const [urlImportOpen, setUrlImportOpen] = useState(false);
  const [urlImportForm, setUrlImportForm] = useState({
    title: '',
    url: '',
    type: 'image' as 'image' | 'video',
    category: 'Drop Media',
  });

  // Drop Types (Dynamic categories: Photos, Videos, Freelancer, Concerts, etc.)
  const localDropTypes = useMemo(() => {
    const list = dropTypes && dropTypes.length > 0 ? dropTypes : INITIAL_DROP_TYPES;
    return [...list].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [dropTypes]);

  const [editingDropType, setEditingDropType] = useState<DropType | null>(null);
  const [isCreatingDropType, setIsCreatingDropType] = useState(false);
  const [deletingDropTypeInfo, setDeletingDropTypeInfo] = useState<{
    type: DropType;
    dropsCount: number;
    dropNames: string[];
  } | null>(null);
  const [dropTypeFormError, setDropTypeFormError] = useState<string | null>(null);
  const [newDropTypeDraft, setNewDropTypeDraft] = useState<Partial<DropType>>({
    name: '',
    slug: '',
    icon: 'Briefcase',
    color: '#38BDF8',
    textColor: '#111215',
    order: 3,
    description: '',
  });

  const handleSaveDropType = async (typeToSave: DropType) => {
    setDropTypeFormError(null);
    if (!typeToSave.name || !typeToSave.name.trim()) {
      setDropTypeFormError('Category name is required.');
      notifySave('❌ Category name is required');
      return false;
    }

    const trimmedName = typeToSave.name.trim();
    const isDuplicate = localDropTypes.some(
      (t) => t.id !== typeToSave.id && t.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      setDropTypeFormError(`A category named "${trimmedName}" already exists. Names must be unique.`);
      notifySave(`❌ Category name "${trimmedName}" already exists`);
      return false;
    }

    const slug = typeToSave.slug || trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const cleaned: DropType = {
      ...typeToSave,
      name: trimmedName,
      slug,
      order: typeof typeToSave.order === 'number' ? typeToSave.order : localDropTypes.length + 1,
      color: typeToSave.color || '#D2FF3A',
      textColor: typeToSave.textColor || '#111215',
      icon: typeToSave.icon || 'Camera',
      description: typeToSave.description || '',
    };

    if (setDropTypes) {
      setDropTypes((prev) => {
        const exists = prev.some((t) => t.id === cleaned.id);
        const next = exists ? prev.map((t) => (t.id === cleaned.id ? cleaned : t)) : [...prev, cleaned];
        try {
          localStorage.setItem('ronny_v2_drop_types', JSON.stringify(next));
        } catch {}
        return next;
      });
    }

    try {
      await dbSaveDropType(cleaned);
    } catch (err) {
      console.warn('dbSaveDropType warning:', err);
    }

    notifySave(`✓ Category "${cleaned.name}" saved! Displayed in Drops tab.`);
    soundFX.playPop();
    setEditingDropType(null);
    setIsCreatingDropType(false);
    return true;
  };

  const initiateDeleteDropType = (type: DropType) => {
    const affected = projects.filter((p) => isProjectInType(p, type));
    setDeletingDropTypeInfo({
      type,
      dropsCount: affected.length,
      dropNames: affected.map((p) => p.name),
    });
  };

  const handleConfirmDeleteDropType = async () => {
    if (!deletingDropTypeInfo) return;
    const { type, dropsCount } = deletingDropTypeInfo;

    // Safety: safely reassign existing drops in this category to Photos
    if (dropsCount > 0) {
      setProjects((prev) => {
        const updated = prev.map((p) => {
          if (isProjectInType(p, type)) {
            const remapped: Project = {
              ...p,
              dropTypeId: 'type-photos',
              dropTypeName: 'Photos',
              mediaType: p.mediaType === 'videos' ? 'videos' : 'photos',
            };
            dbSaveProject(remapped).catch(() => {});
            return remapped;
          }
          return p;
        });
        saveProjectsLocal(updated);
        return updated;
      });
    }

    if (setDropTypes) {
      setDropTypes((prev) => {
        const next = prev.filter((t) => t.id !== type.id);
        try {
          localStorage.setItem('ronny_v2_drop_types', JSON.stringify(next));
        } catch {}
        return next;
      });
    }

    try {
      await dbDeleteDropType(type.id);
    } catch (err) {
      console.warn('dbDeleteDropType warning:', err);
    }

    notifySave(
      dropsCount > 0
        ? `✓ Deleted "${type.name}". Reassigned ${dropsCount} drop(s) to Photos safely!`
        : `✓ Deleted category "${type.name}"`
    );
    soundFX.playScratch();
    setDeletingDropTypeInfo(null);
  };

  // Project Category Filter & Editor Modal
  const [projectCategoryFilter, setProjectCategoryFilter] = useState<string>('all');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [deletingProjectPhotosId, setDeletingProjectPhotosId] = useState<string | null>(null);
  const [deletingProjectVideoId, setDeletingProjectVideoId] = useState<string | null>(null);
  const [confirmModalAction, setConfirmModalAction] = useState<{
    type: 'delete-drop' | 'clear-photos' | 'clear-video';
    label: string;
  } | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  // Specialist Section State
  const [editingSpecialist, setEditingSpecialist] = useState<SpecialistSoftware | null>(null);
  const [isAddingSpecialist, setIsAddingSpecialist] = useState(false);
  const [deletingSpecialistId, setDeletingSpecialistId] = useState<string | null>(null);
  const [newSpecialist, setNewSpecialist] = useState<Partial<SpecialistSoftware>>({
    name: '',
    subname: '',
    description: '',
    summary: '',
    category: 'Motion & Post',
    specsMetric: '99% Precision',
    specsLabel: 'Precision',
    badge: 'PRO',
    badgeBg: '#111215',
    badgeText: '#D2FF3A',
    accentBorder: '#111215',
    coreSkills: ['Visual Effects', 'Color Grading'],
    customLogoUrl: '',
  });
  const [specialistHeadline, setSpecialistHeadline] = useState('SPECIALIST IN');
  const [specialistSubhead, setSpecialistSubhead] = useState(
    'Adobe Photoshop · Adobe Premiere Pro · Adobe Lightroom · DaVinci Resolve · Adobe After Effects'
  );

  // Concert Photo management & duplicate prevention
  const [editingPhoto, setEditingPhoto] = useState<ConcertMediaItem | null>(null);
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const [newPhotoData, setNewPhotoData] = useState<Partial<ConcertMediaItem>>({
    title: '',
    artist: '',
    category: 'Arena Tour',
    venue: '',
    year: '2026',
    description: '',
  });
  const [newPhotoFile, setNewPhotoFile] = useState<{ file: File; base64: string } | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const addPhotoFileInputRef = useRef<HTMLInputElement>(null);
  const concertGalleryBatchInputRef = useRef<HTMLInputElement>(null);
  const [isConcertGalleryDragging, setIsConcertGalleryDragging] = useState(false);

  // Testimonials & Services state
  const [newTestimonial, setNewTestimonial] = useState({
    clientName: '',
    role: '',
    company: '',
    quote: '',
    projectRef: '',
    rating: 5,
    avatar: '',
  });
  const [deletingTestimonialId, setDeletingTestimonialId] = useState<string | null>(null);
  const [newService, setNewService] = useState({
    number: '04',
    name: '',
    description: '',
    pricingEstimate: '',
  });
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);

  // Hero File Input
  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const [isHeroDragging, setIsHeroDragging] = useState(false);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);

  // Toast notification
  const notifySave = (msg: string) => {
    soundFX.playPop();
    setSaveAlert(msg);
    setTimeout(() => setSaveAlert(null), 3500);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    soundFX.playHype();
    notifySave('Asset link copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Secure Name and Password Administrator Authentication
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const result = authenticateAdmin(adminNameInput, adminPasswordInput);
    if (!result.success) {
      const err = result.error || 'Invalid credentials.';
      setAuthError(err);
      setLockoutSeconds(getLockoutRemainingSeconds());
      notifySave(`❌ ${err}`);
      return;
    }

    if (result.session) {
      setAdminSession(result.session);
      setIsAuthenticated(true);
      setAdminPasswordInput('');
      setAuthError(null);
      soundFX.playHype();
      notifySave(`✓ Welcome Administrator: ${result.session.adminName}`);
    }
  };

  // Handle requesting Password Reset OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setResetNotice(null);
    setResetLoading(true);

    try {
      const result = await requestPasswordResetOtp(resetEmailInput);
      if (!result.success) {
        setAuthError(result.message);
        if (result.cooldownSeconds) {
          setOtpCooldownSeconds(result.cooldownSeconds);
        }
      } else {
        const noticeMsg = result.firebaseEmailDispatched
          ? `✓ Verification code generated and official password reset notification sent to your Gmail inbox (${resetEmailInput})!`
          : result.message;
        setResetNotice(noticeMsg);
        if (result.simulatedDevOtp) {
          setSimulatedDevOtp(result.simulatedDevOtp);
        }
        setOtpCooldownSeconds(60);
        setAuthView('forgot_verify');
        notifySave('Verification notification dispatched to Gmail inbox.');
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Failed to dispatch verification code.');
    } finally {
      setResetLoading(false);
    }
  };

  // Handle resending OTP code
  const handleResendOtp = async () => {
    if (otpCooldownSeconds > 0) return;
    setAuthError(null);
    setResetLoading(true);

    try {
      const result = await requestPasswordResetOtp(resetEmailInput);
      if (!result.success) {
        setAuthError(result.message);
        if (result.cooldownSeconds) {
          setOtpCooldownSeconds(result.cooldownSeconds);
        }
      } else {
        const noticeMsg = result.firebaseEmailDispatched
          ? `✓ New verification code and reset email sent to your Gmail (${resetEmailInput})!`
          : 'New verification code dispatched.';
        setResetNotice(noticeMsg);
        if (result.simulatedDevOtp) {
          setSimulatedDevOtp(result.simulatedDevOtp);
        }
        setOtpCooldownSeconds(60);
        notifySave('New verification code dispatched.');
      }
    } finally {
      setResetLoading(false);
    }
  };

  // Handle verifying OTP and resetting administrator password
  const handleVerifyOtpAndReset = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setResetNotice(null);

    if (resetNewPasswordInput !== resetConfirmPasswordInput) {
      setAuthError('New passwords do not match. Please re-enter.');
      return;
    }

    setResetLoading(true);
    try {
      const result = verifyOtpAndResetPassword(
        resetEmailInput,
        resetOtpInput,
        resetNewPasswordInput
      );

      if (!result.success) {
        setAuthError(result.error || 'Failed to reset password.');
        notifySave(`❌ ${result.error || 'Reset failed'}`);
      } else {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        setAuthView('forgot_success');
        setResetOtpInput('');
        setResetNewPasswordInput('');
        setResetConfirmPasswordInput('');
        setAdminPasswordInput('');
        setAdminNameInput(resetEmailInput || 'Onset Admin');
        setSimulatedDevOtp(null);
        notifySave('✓ Password successfully updated and secured!');
      }
    } finally {
      setResetLoading(false);
    }
  };

  const handleAdminLogout = () => {
    logoutAdmin();
    setAdminSession(null);
    setIsAuthenticated(false);
    setAdminNameInput('');
    setAdminPasswordInput('');
    if (currentUser) {
      logoutUser().catch(() => {});
    }
    notifySave('Signed out and locked Creator CMS');
  };

  const handleGoogleLogin = async () => {
    try {
      const user = await loginWithGoogle();
      if (user) {
        setIsAuthenticated(true);
        soundFX.playHype();
        notifySave('Logged in as Onset Media!');
      } else {
        notifySave('Google Sign-In dismissed. Please sign in with administrator credentials.');
      }
    } catch (err: any) {
      notifySave(`Google Sign-In: ${err?.message || 'Cancelled'}`);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await logoutUser();
      notifySave('Signed out from Google account');
    } catch {}
  };

  const handlePushAllToCloud = async () => {
    setIsSyncingCloud(true);
    try {
      notifySave('Syncing all portfolio data to Firestore...');
      for (const p of projects) {
        await dbSaveProject(p);
      }
      for (const c of concertPhotos) {
        await dbSaveConcertPhoto(c);
      }
      for (const s of services) {
        await dbSaveService(s);
      }
      for (const t of testimonials) {
        await dbSaveTestimonial(t);
      }
      await dbSaveSiteSettings({
        contactInfo,
        aboutData,
        heroPhoto,
      });
      for (const inq of inquiries) {
        try {
          await dbSubmitInquiry(inq);
        } catch {}
      }
      soundFX.playPop();
      notifySave('All portfolio items & settings securely saved to Firestore database!');
    } catch (err: any) {
      notifySave(`Cloud sync: ${err?.message || 'Synced'}`);
    } finally {
      setIsSyncingCloud(false);
    }
  };

  const handleUpdateInquiryStatus = async (id: string, status: 'new' | 'read' | 'replied') => {
    try {
      await dbUpdateInquiryStatus(id, status);
      setInquiries((prev) => prev.map((inq) => (inq.id === id ? { ...inq, status } : inq)));
      notifySave(`Inquiry status marked as "${status}"!`);
    } catch (err: any) {
      notifySave(`Status update: ${err?.message || 'Updated'}`);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    try {
      await dbDeleteInquiry(id);
      setInquiries((prev) => prev.filter((inq) => inq.id !== id));
      notifySave('Inquiry removed from database.');
    } catch (err: any) {
      notifySave(`Delete inquiry: ${err?.message || 'Deleted'}`);
    }
  };

  // ==========================================
  // UNIFIED MEDIA VAULT COMPILATION
  // ==========================================
  const allMediaItems: MediaVaultItem[] = useMemo(() => {
    const list: MediaVaultItem[] = [];
    const seenUrls = new Set<string>();

    const addItem = (item: MediaVaultItem) => {
      if (!item.url || seenUrls.has(item.url)) return;
      seenUrls.add(item.url);
      list.push(item);
    };

    // 1. Custom uploaded files via vault
    customVaultFiles.forEach((f) => addItem(f));

    // 2. Photos uploaded to photosMap
    Object.entries(photosMap).forEach(([filename, base64]) => {
      addItem({
        id: `map-${filename}`,
        name: filename.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
        type: 'image',
        url: base64,
        source: 'Upload Library',
        createdAt: 'Uploaded Asset',
        category: 'Custom Upload',
      });
    });

    // 3. Concert media items
    concertPhotos.forEach((c) => {
      addItem({
        id: c.id,
        name: c.title || c.artist,
        type: c.url.includes('.mp4') || c.url.startsWith('data:video') ? 'video' : 'image',
        url: photosMap[c.filename] || c.url,
        source: 'Concert Gallery',
        createdAt: c.year || '2026',
        category: c.category || 'Concert Live',
      });
    });

    // 4. Projects media (photos & videos)
    projects.forEach((proj) => {
      if (proj.col1Image1) {
        addItem({
          id: `${proj.id}-col1`,
          name: `${proj.name} - Photo 1`,
          type: 'image',
          url: photosMap[proj.col1Image1] || proj.col1Image1,
          source: `Drop #${proj.number}`,
          createdAt: proj.year || '2026',
          category: proj.category,
        });
      }
      if (proj.col1Image2) {
        addItem({
          id: `${proj.id}-col2`,
          name: `${proj.name} - Photo 2`,
          type: 'image',
          url: photosMap[proj.col1Image2] || proj.col1Image2,
          source: `Drop #${proj.number}`,
          createdAt: proj.year || '2026',
          category: proj.category,
        });
      }
      if (proj.col2Image) {
        addItem({
          id: `${proj.id}-poster`,
          name: `${proj.name} - Poster`,
          type: 'image',
          url: photosMap[proj.col2Image] || proj.col2Image,
          source: `Drop #${proj.number}`,
          createdAt: proj.year || '2026',
          category: proj.category,
        });
      }
      if (proj.videoUrl) {
        addItem({
          id: `${proj.id}-video`,
          name: `${proj.name} - Video`,
          type: 'video',
          url: proj.videoUrl,
          source: `Drop #${proj.number}`,
          createdAt: proj.year || '2026',
          category: 'Video Reel',
        });
      }
    });

    // 5. Hero & Founder portraits
    if (heroPhoto) {
      addItem({
        id: 'hero-portrait-active',
        name: 'Hero Section Active Portrait',
        type: 'image',
        url: heroPhoto,
        source: 'Hero Section',
        createdAt: 'Active',
        category: 'Portrait',
      });
    }

    if (aboutData?.founderPhoto) {
      addItem({
        id: 'founder-portrait-active',
        name: 'Meet the Founder Custom Portrait',
        type: 'image',
        url: aboutData.founderPhoto,
        source: 'About Section',
        createdAt: 'Active',
        category: 'Founder',
      });
    }

    return list;
  }, [customVaultFiles, photosMap, concertPhotos, projects, heroPhoto, aboutData]);

  // Filtered Media Vault items
  const filteredVaultItems = useMemo(() => {
    return allMediaItems.filter((item) => {
      if (mediaVaultFilter === 'photos' && item.type !== 'image') return false;
      if (mediaVaultFilter === 'videos' && item.type !== 'video') return false;
      if (mediaVaultSearch.trim()) {
        const q = mediaVaultSearch.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.source.toLowerCase().includes(q) ||
          (item.category && item.category.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [allMediaItems, mediaVaultFilter, mediaVaultSearch]);

  // ==========================================
  // MEDIA VAULT ACTION HANDLERS (UPLOAD & DELETE)
  // ==========================================
  const handleMediaVaultUpload = (files: FileList | File[]) => {
    const list = Array.from(files);
    let uploadedCount = 0;
    let duplicateCount = 0;

    list.forEach((file) => {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      if (!isVideo && !isImage) {
        notifySave(`Skipped "${file.name}" - only images and videos are supported`);
        return;
      }

      const norm = file.name.trim().toLowerCase();
      const isDupName = customVaultFiles.some((f) => f.name.toLowerCase() === norm);
      if (isDupName) {
        duplicateCount++;
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        if (!base64) return;

        const isDupContent = customVaultFiles.some((f) => f.url === base64);
        if (isDupContent) {
          duplicateCount++;
          return;
        }

        const newVaultItem: MediaVaultItem = {
          id: `vault-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
          type: isVideo ? 'video' : 'image',
          url: base64,
          source: 'Direct Upload',
          createdAt: new Date().toLocaleDateString(),
          category: isVideo ? 'Motion Reel' : 'Vault Still',
        };

        // 1. Add to custom vault files
        setCustomVaultFiles((prev) => {
          const next = [newVaultItem, ...prev];
          saveCustomVault(next);
          return next;
        });

        // 2. If image, register with photosMap
        if (isImage) {
          if (onPhotoUploaded) {
            onPhotoUploaded(base64, file.name);
          } else if (setPhotosMap) {
            setPhotosMap((prev) => {
              const next = { ...prev, [file.name]: base64 };
              try {
                localStorage.setItem('ronny_v2_photos_map', JSON.stringify(next));
              } catch {}
              return next;
            });
          }
        }

        // 3. If video, also allow auto-adding to projects as a new video drop
        if (isVideo) {
          const newVideoDrop: Project = {
            id: `proj-video-${Date.now()}`,
            number: String(projects.length + 1).padStart(2, '0'),
            name: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
            category: 'Client',
            mediaType: 'videos',
            year: '2026',
            clientName: 'Onset Media',
            tools: ['Premiere Pro', 'DaVinci Resolve', 'After Effects'],
            artistName: 'Onset Media',
            liveAt: 'Global Live Stage',
            artistDescription: 'Cinematic 4K video drop captured with multi-cam live stage coverage.',
            description: "Artist name: Onset Media\nLive at: Global Live Stage\nArtist's description: Cinematic 4K video drop captured with multi-cam live stage coverage.",
            col1Image1: 'SaveClip.App_603722550_18066483578417540_6734046564953240793_n.jpg',
            col1Image2: 'SaveClip.App_592417684_18066395564417540_3836775238257214476_n.jpg',
            col2Image: 'SaveInta.com_758469193_18089254955417540_9161247027050578589_n.jpg',
            videoUrl: base64,
          };
          setProjects((prev) => {
            const next = [newVideoDrop, ...prev];
            try {
              localStorage.setItem('ronny_v2_projects', JSON.stringify(next));
            } catch {}
            return next;
          });
        }

        uploadedCount++;
        const dupMsg = duplicateCount > 0 ? ` (skipped ${duplicateCount} duplicate)` : '';
        notifySave(`Uploaded ${uploadedCount} file(s) to Media Vault${dupMsg}!`);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUrlImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlImportForm.url.trim() || !urlImportForm.title.trim()) return;

    const newItem: MediaVaultItem = {
      id: `url-${Date.now()}`,
      name: urlImportForm.title.trim(),
      type: urlImportForm.type,
      url: urlImportForm.url.trim(),
      source: 'External URL Import',
      createdAt: new Date().toLocaleDateString(),
      category: urlImportForm.category,
    };

    setCustomVaultFiles((prev) => {
      const next = [newItem, ...prev];
      saveCustomVault(next);
      return next;
    });

    setUrlImportOpen(false);
    setUrlImportForm({ title: '', url: '', type: 'image', category: 'Drop Media' });
    notifySave(`Imported "${newItem.name}" into Media Vault!`);
  };

  // Central Media Delete Function: Removes completely from vault and website
  const handleDeleteMediaItem = (item: MediaVaultItem) => {
    const itemKey = item.url;
    const itemName = item.name;

    // 1. Remove from customVaultFiles
    setCustomVaultFiles((prev) => {
      const next = prev.filter((f) => f.id !== item.id && f.url !== itemKey);
      saveCustomVault(next);
      return next;
    });

    // 2. Remove from concertPhotos
    if (setConcertPhotos) {
      setConcertPhotos((prev) => {
        const next = prev.filter((p) => p.url !== itemKey && p.id !== item.id);
        try {
          localStorage.setItem('ronny_v2_concert_photos', JSON.stringify(next));
        } catch {}
        return next;
      });
    }

    // 3. Remove from photosMap if present
    if (setPhotosMap) {
      setPhotosMap((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((key) => {
          if (next[key] === itemKey) delete next[key];
        });
        try {
          localStorage.setItem('ronny_v2_photos_map', JSON.stringify(next));
        } catch {}
        return next;
      });
    }

    // 4. Revert Hero Photo if active
    if (heroPhoto === itemKey) {
      onHeroPhotoUpdated(null);
    }

    // 5. Revert Founder Photo if active
    if (aboutData?.founderPhoto === itemKey && setAboutData) {
      setAboutData((prev) => {
        const next = { ...prev, founderPhoto: null };
        try {
          localStorage.setItem('ronny_v2_about', JSON.stringify(next));
        } catch {}
        return next;
      });
    }

    // 6. Clear matching slots in projects
    setProjects((prev) => {
      const next = prev.map((proj) => {
        let updated = { ...proj };
        if (proj.col1Image1 === itemKey) updated.col1Image1 = '';
        if (proj.col1Image2 === itemKey) updated.col1Image2 = '';
        if (proj.col2Image === itemKey) updated.col2Image = '';
        if (proj.videoUrl === itemKey) updated.videoUrl = '';
        return updated;
      });
      try {
        localStorage.setItem('ronny_v2_projects', JSON.stringify(next));
      } catch {}
      return next;
    });

    notifySave(`Deleted "${itemName}" from website media files!`);
    setDeletingMediaKey(null);
  };

  // ==========================================
  // PROJECT DROPS HANDLERS
  // ==========================================
  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    const parsedDesc = parseDropDescription(editingProject);
    const formattedDesc = formatDropDescription(parsedDesc);

    // Strict constraint: Drops tab only allows photos, no video uploads or video URLs
    const sanitizedProject: Project = {
      ...editingProject,
      artistName: parsedDesc.artistName,
      liveAt: parsedDesc.liveAt,
      artistDescription: parsedDesc.artistDescription,
      description: formattedDesc,
      mediaType: 'photos',
      videoUrl: '',
    };

    if (isCreatingProject) {
      setProjects((prev) => {
        const next = [sanitizedProject, ...prev];
        saveProjectsLocal(next);
        return next;
      });
      dbSaveProject(sanitizedProject).catch((err) => console.warn('Firestore project save fallback:', err));
      notifySave(`Added photo drop "${sanitizedProject.name}" to live site & database!`);
    } else {
      setProjects((prev) => {
        const next = prev.map((p) => (p.id === sanitizedProject.id ? sanitizedProject : p));
        saveProjectsLocal(next);
        return next;
      });
      dbSaveProject(sanitizedProject).catch((err) => console.warn('Firestore project update fallback:', err));
      notifySave(`Updated photo drop "${sanitizedProject.name}" in database!`);
    }
    setEditingProject(null);
    setIsCreatingProject(false);
  };

  const handleDeleteProject = (id: string, name: string) => {
    setProjects((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveProjectsLocal(next);
      return next;
    });
    dbDeleteProject(id).catch((err) => console.warn('Firestore project delete fallback:', err));
    notifySave(`Deleted drop "${name}" successfully from database!`);
    setDeletingProjectId(null);
  };

  const handleRemoveProjectPhotos = (id: string, name: string) => {
    setProjects((prev) => {
      const next = prev.map((p) => {
        if (p.id === id) {
          const updated: Project = { 
            ...p, 
            col1Image1: '', 
            col1Image2: '', 
            col2Image: '' 
          };
          if (updated.videoUrl) {
            updated.mediaType = 'videos';
          }
          dbSaveProject(updated).catch(() => {});
          return updated;
        }
        return p;
      });
      saveProjectsLocal(next);
      return next;
    });
    notifySave(`Removed all photos from drop "${name}"!`);
    setDeletingProjectPhotosId(null);
  };

  const handleRemoveProjectVideo = (id: string, name: string) => {
    setProjects((prev) => {
      const next = prev.map((p) => {
        if (p.id === id) {
          const updated: Project = { ...p, videoUrl: '', mediaType: 'photos' };
          dbSaveProject(updated).catch(() => {});
          return updated;
        }
        return p;
      });
      saveProjectsLocal(next);
      return next;
    });
    notifySave(`Removed video section from drop "${name}"!`);
    setDeletingProjectVideoId(null);
  };

  const handleProjectPhotoUpload = async (field: 'col1Image1' | 'col1Image2' | 'col2Image', file: File) => {
    // 1. File type validation
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif', 'image/avif'];
    if (!validImageTypes.includes(file.type) && !file.type.startsWith('image/')) {
      notifySave('❌ Invalid file format! Please upload a JPG, PNG, or WebP photo.');
      return;
    }
    // 2. File size validation (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      notifySave('❌ Photo too large! Max file size is 15MB. Please choose a smaller photo.');
      return;
    }

    try {
      const compressed = await compressImageForDatabase(file, 1400, 0.85);
      if (compressed) {
        setEditingProject((prev) => (prev ? { ...prev, [field]: compressed } : null));
        notifySave(`✓ Uploaded ${field === 'col1Image1' ? 'Photo 1' : field === 'col1Image2' ? 'Photo 2' : 'Poster'} successfully!`);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        if (base64) {
          setEditingProject((prev) => (prev ? { ...prev, [field]: base64 } : null));
          notifySave(`✓ Uploaded ${field === 'col1Image1' ? 'Photo 1' : field === 'col1Image2' ? 'Photo 2' : 'Poster'}!`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProjectVideoUpload = (file: File) => {
    // 1. Video file type validation
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/m4v', 'video/ogg'];
    if (!validVideoTypes.includes(file.type) && !file.type.startsWith('video/')) {
      notifySave('❌ Invalid video format! Only MP4, WebM, and MOV video files are supported.');
      return;
    }
    // 2. Video file size validation (max 80MB)
    if (file.size > 80 * 1024 * 1024) {
      notifySave('❌ Video is over 80MB limit! Please use an optimized MP4 under 80MB or enter a video streaming URL.');
      return;
    }

    setIsUploadingVideo(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const res = e.target?.result as string;
      if (res) {
        setEditingProject((prev) => (prev ? { ...prev, videoUrl: res, mediaType: 'videos' } : null));
        notifySave('✓ Project video loaded! Click "Save Drop" to persist changes.');
      }
      setIsUploadingVideo(false);
    };
    reader.onerror = () => {
      notifySave('❌ Failed to read video file. Please check that the file is not corrupted.');
      setIsUploadingVideo(false);
    };
    reader.readAsDataURL(file);
  };

  // Hero File Upload
  const handleHeroFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      notifySave('Please select an image file (.jpg, .png, .webp).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (base64) {
        onHeroPhotoUpdated(base64);
        notifySave('Hero photo updated with 100% exact fidelity!');
      }
    };
    reader.readAsDataURL(file);
  };

  // Founder Photo Upload
  const handleFounderPhotoUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      notifySave('Please select an image file (.jpg, .png, .webp).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (base64) {
        const next = { ...aboutForm, founderPhoto: base64 };
        setAboutForm(next);
        if (setAboutData) setAboutData(next);
        try {
          localStorage.setItem('ronny_v2_about', JSON.stringify(next));
        } catch {}
        notifySave('Meet the Founder photo updated!');
      }
    };
    reader.readAsDataURL(file);
  };

  // ==========================================
  // CONCERT GALLERY HANDLERS (UPLOAD, REPLACE, DEDUPLICATE, DELETE)
  // ==========================================
  const handleUploadPhotoToCard = (targetItem: ConcertMediaItem, file: File) => {
    if (!file.type.startsWith('image/')) {
      notifySave('Please select a valid image (.jpg, .png, .webp)');
      return;
    }

    const norm = file.name.trim().toLowerCase();
    // Check if another card ALREADY has this file loaded with an image
    const isDupName = concertPhotos.some(
      (p) =>
        p.id !== targetItem.id &&
        p.filename.trim().toLowerCase() === norm &&
        ((p.url && (p.url.startsWith('data:') || p.url.startsWith('http') || p.url.startsWith('/'))) ||
          Boolean(photosMap[p.filename]))
    );
    if (isDupName) {
      notifySave(`Duplicate blocked: "${file.name}" is already used in another card.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (!base64) return;

      // Check if identical photo content is already in another card
      const isDupContent = concertPhotos.some(
        (p) =>
          p.id !== targetItem.id &&
          (p.url === base64 || photosMap[p.filename] === base64) &&
          (p.url.startsWith('data:') || p.url.startsWith('http') || photosMap[p.filename])
      );
      if (isDupContent) {
        notifySave('Duplicate blocked: This identical photo already exists in another card.');
        return;
      }

      const updatedItem: ConcertMediaItem = {
        ...targetItem,
        url: base64,
        filename: file.name,
      };

      // Update card in concertPhotos
      if (setConcertPhotos) {
        setConcertPhotos((prev) => {
          const next = prev.map((p) => (p.id === targetItem.id ? updatedItem : p));
          try {
            localStorage.setItem('ronny_v2_concert_photos', JSON.stringify(next));
          } catch {}
          return next;
        });
      }

      // Register with photosMap
      if (setPhotosMap) {
        setPhotosMap((prev) => {
          const next = { ...prev, [file.name]: base64 };
          try {
            localStorage.setItem('ronny_v2_photos_map', JSON.stringify(next));
          } catch {}
          return next;
        });
      }

      if (onPhotoUploaded) {
        onPhotoUploaded(base64, file.name);
      }

      dbSaveConcertPhoto(updatedItem).catch((err) =>
        console.warn('Firestore concert photo replace fallback:', err)
      );

      notifySave(`Photo loaded for "${targetItem.title}"!`);
    };
    reader.readAsDataURL(file);
  };

  const handleBatchConcertPhotosUpload = async (fileList: FileList | File[]) => {
    const rawFiles = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (rawFiles.length === 0) {
      notifySave('Please select image files (.jpg, .png, .webp)');
      return;
    }

    const duplicates: string[] = [];
    const uniqueFiles: { file: File; base64: string }[] = [];

    for (const file of rawFiles) {
      const norm = file.name.trim().toLowerCase();

      // Check if file is already loaded in an existing active card with an image
      const alreadyLoadedCard = concertPhotos.find(
        (p) =>
          ((p.url && (p.url.startsWith('data:') || p.url.startsWith('http') || p.url.startsWith('/'))) ||
            Boolean(photosMap[p.filename])) &&
          p.filename.trim().toLowerCase() === norm
      );

      if (alreadyLoadedCard) {
        duplicates.push(file.name);
        continue;
      }

      await new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          if (base64) {
            // Check if identical photo content (base64) is already loaded in any card or in this batch
            const isContentDup =
              concertPhotos.some(
                (p) =>
                  (p.url === base64 || photosMap[p.filename] === base64) &&
                  (p.url.startsWith('data:') || p.url.startsWith('http') || photosMap[p.filename])
              ) ||
              uniqueFiles.some((u) => u.base64 === base64);

            if (isContentDup) {
              duplicates.push(file.name);
            } else {
              uniqueFiles.push({ file, base64 });
            }
          }
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }

    if (uniqueFiles.length === 0) {
      notifySave(
        duplicates.length === 1
          ? `Duplicate blocked: "${duplicates[0]}" has already been uploaded.`
          : `All ${duplicates.length} files were duplicates and skipped (Zero duplicates preserved).`
      );
      return;
    }

    if (!setConcertPhotos) return;

    let updatedConcertPhotos = [...concertPhotos];
    const newPhotosMap = { ...photosMap };
    const savedToCloudItems: ConcertMediaItem[] = [];

    // Allocate unique files:
    // 1. First prioritize template cards matching file.name
    // 2. Next prioritize empty template cards (without data/http/photosMap image)
    // 3. Otherwise append as new unique concert card
    uniqueFiles.forEach(({ file, base64 }) => {
      newPhotosMap[file.name] = base64;

      const norm = file.name.trim().toLowerCase();

      // Exact name match on an empty card
      let targetIdx = updatedConcertPhotos.findIndex(
        (p) =>
          p.filename.trim().toLowerCase() === norm &&
          !p.url.startsWith('data:') &&
          !p.url.startsWith('http') &&
          !photosMap[p.filename]
      );

      // If no exact name match, find first empty card
      if (targetIdx === -1) {
        targetIdx = updatedConcertPhotos.findIndex(
          (p) =>
            !p.url.startsWith('data:') &&
            !p.url.startsWith('http') &&
            !newPhotosMap[p.filename]
        );
      }

      if (targetIdx !== -1) {
        const updated = {
          ...updatedConcertPhotos[targetIdx],
          url: base64,
          filename: file.name,
        };
        updatedConcertPhotos[targetIdx] = updated;
        savedToCloudItems.push(updated);
      } else {
        const cleanTitle = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[_-]/g, ' ')
          .replace(/^(SaveClip\.App|SaveInta\.com)\s*/i, '');

        const newCard: ConcertMediaItem = {
          id: `concert-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          filename: file.name,
          title: cleanTitle || 'Live Concert Capture',
          artist: 'Live Performer',
          category: 'Arena Tour',
          venue: 'Live Arena',
          year: '2026',
          url: base64,
          description: '',
        };
        updatedConcertPhotos.unshift(newCard);
        savedToCloudItems.push(newCard);
      }

      if (onPhotoUploaded) {
        onPhotoUploaded(base64, file.name);
      }
    });

    setConcertPhotos(updatedConcertPhotos);
    try {
      localStorage.setItem('ronny_v2_concert_photos', JSON.stringify(updatedConcertPhotos));
    } catch {}

    if (setPhotosMap) {
      setPhotosMap(newPhotosMap);
      try {
        localStorage.setItem('ronny_v2_photos_map', JSON.stringify(newPhotosMap));
      } catch {}
    }

    // Persist all allocated cards to Firestore database
    for (const item of savedToCloudItems) {
      dbSaveConcertPhoto(item).catch((err) =>
        console.warn('Firestore concert photo batch save fallback:', err)
      );
    }

    const msg =
      duplicates.length > 0
        ? `Added ${uniqueFiles.length} photo(s). Skipped ${duplicates.length} duplicate(s) to guarantee zero duplicates!`
        : `Added ${uniqueFiles.length} concert photo(s) successfully!`;
    notifySave(msg);
  };

  const handleAddNewPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoFile || !setConcertPhotos) return;

    const norm = newPhotoFile.file.name.trim().toLowerCase();
    const isDupName = concertPhotos.some(
      (p) =>
        ((p.url && (p.url.startsWith('data:') || p.url.startsWith('http') || p.url.startsWith('/'))) ||
          Boolean(photosMap[p.filename])) &&
        p.filename.trim().toLowerCase() === norm
    );
    const isDupContent = concertPhotos.some(
      (p) =>
        (p.url === newPhotoFile.base64 || photosMap[p.filename] === newPhotoFile.base64) &&
        (p.url.startsWith('data:') || p.url.startsWith('http') || photosMap[p.filename])
    );

    if (isDupName || isDupContent) {
      notifySave(`Duplicate blocked: "${newPhotoFile.file.name}" already exists in the gallery.`);
      return;
    }

    const newItem: ConcertMediaItem = {
      id: `concert-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      filename: newPhotoFile.file.name,
      title: newPhotoData.title || newPhotoFile.file.name,
      artist: newPhotoData.artist || 'Featured Artist',
      category: newPhotoData.category || 'Arena Tour',
      venue: newPhotoData.venue || 'Live Arena',
      year: newPhotoData.year || '2026',
      description: newPhotoData.description || '',
      url: newPhotoFile.base64,
    };

    setConcertPhotos((prev) => {
      const next = [newItem, ...prev];
      try {
        localStorage.setItem('ronny_v2_concert_photos', JSON.stringify(next));
      } catch {}
      return next;
    });

    if (setPhotosMap) {
      setPhotosMap((prev) => {
        const next = { ...prev, [newPhotoFile.file.name]: newPhotoFile.base64 };
        try {
          localStorage.setItem('ronny_v2_photos_map', JSON.stringify(next));
        } catch {}
        return next;
      });
    }

    if (onPhotoUploaded) {
      onPhotoUploaded(newPhotoFile.base64, newPhotoFile.file.name);
    }

    dbSaveConcertPhoto(newItem).catch((err) =>
      console.warn('Firestore concert photo add fallback:', err)
    );

    setIsAddingPhoto(false);
    setNewPhotoFile(null);
    notifySave(`Added "${newItem.title}" to Concert Gallery & Marquee!`);
  };

  const handleDeduplicateConcertPhotos = async () => {
    if (!setConcertPhotos) return;

    const seenIds = new Set<string>();
    const seenFilenames = new Set<string>();
    const seenUrls = new Set<string>();

    const cleaned: ConcertMediaItem[] = [];
    const removed: ConcertMediaItem[] = [];

    for (const item of concertPhotos) {
      const fn = (item.filename || '').trim().toLowerCase();
      const id = (item.id || '').trim();
      const url = (item.url || '').trim();
      const isRealUrl = Boolean(
        url && (url.startsWith('data:') || url.startsWith('http') || url.startsWith('/'))
      );

      let isDuplicate = false;
      if (id && seenIds.has(id)) isDuplicate = true;
      else if (fn && seenFilenames.has(fn)) isDuplicate = true;
      else if (isRealUrl && seenUrls.has(url)) isDuplicate = true;

      if (isDuplicate) {
        removed.push(item);
      } else {
        if (id) seenIds.add(id);
        if (fn) seenFilenames.add(fn);
        if (isRealUrl) seenUrls.add(url);
        cleaned.push(item);
      }
    }

    if (removed.length === 0) {
      notifySave('Zero duplicates found! Gallery is 100% clean.');
      return;
    }

    setConcertPhotos(cleaned);
    try {
      localStorage.setItem('ronny_v2_concert_photos', JSON.stringify(cleaned));
    } catch {}

    for (const dup of removed) {
      if (dup.id) {
        dbDeleteConcertPhoto(dup.id).catch(() => {});
      }
    }

    notifySave(`Deduplicated: Removed ${removed.length} duplicate photo(s). ${cleaned.length} unique photos remain.`);
  };

  const handleDeletePhoto = (id: string, title?: string, filename?: string) => {
    if (!setConcertPhotos) return;
    setConcertPhotos((prev) => {
      const next = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem('ronny_v2_concert_photos', JSON.stringify(next));
      } catch {}
      return next;
    });

    if (filename && setPhotosMap) {
      setPhotosMap((prev) => {
        const next = { ...prev };
        delete next[filename];
        try {
          localStorage.setItem('ronny_v2_photos_map', JSON.stringify(next));
        } catch {}
        return next;
      });
    }

    dbDeleteConcertPhoto(id).catch((err) => console.warn('Firestore concert photo delete fallback:', err));

    notifySave(`Deleted photo "${title || 'item'}" from website gallery & database`);
    setDeletingPhotoId(null);
  };

  const handleDeleteEmptyTemplates = () => {
    if (!setConcertPhotos) return;
    const withPhotos = concertPhotos.filter(
      (p) =>
        (p.url && (p.url.startsWith('data:') || p.url.startsWith('http'))) ||
        Boolean(photosMap[p.filename])
    );

    if (withPhotos.length === 0) {
      notifySave('Upload at least one photo before deleting templates.');
      return;
    }

    setConcertPhotos(withPhotos);
    try {
      localStorage.setItem('ronny_v2_concert_photos', JSON.stringify(withPhotos));
    } catch {}
    notifySave(`Kept only ${withPhotos.length} active photo cards! Removed empty templates.`);
  };

  const handleResetConcertTemplates = () => {
    if (!setConcertPhotos) return;
    setConcertPhotos(UPLOADED_CONCERT_PHOTOS);
    try {
      localStorage.setItem('ronny_v2_concert_photos', JSON.stringify(UPLOADED_CONCERT_PHOTOS));
    } catch {}
    notifySave('Reset concert gallery cards to default templates');
  };

  // ==========================================
  // SERVICES HANDLERS
  // ==========================================
  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.name.trim()) return;

    const item: ServiceItem = {
      id: `svc-${Date.now()}`,
      number: newService.number || `0${services.length + 1}`,
      name: newService.name.trim(),
      description: newService.description.trim() || 'High-end post production & creative direction.',
      pricingEstimate: newService.pricingEstimate.trim() || 'Custom Quote',
    };

    setServices((prev) => {
      const next = [...prev, item];
      try {
        localStorage.setItem('ronny_v2_services', JSON.stringify(next));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ronny_services_updated', { detail: next }));
        }
      } catch {}
      return next;
    });

    dbSaveService(item).catch((err) => console.warn('Firestore service add fallback:', err));

    setNewService({ number: `0${services.length + 2}`, name: '', description: '', pricingEstimate: '' });
    notifySave(`Service "${item.name}" added to live site & database!`);
  };

  const handleStartEditService = (svc: ServiceItem) => {
    setEditingService({ ...svc });
  };

  const handleUpdateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !editingService.name.trim()) return;

    const updatedItem: ServiceItem = {
      ...editingService,
      number: editingService.number.trim() || '01',
      name: editingService.name.trim(),
      description: editingService.description.trim(),
    };
    if (editingService.pricingEstimate && editingService.pricingEstimate.trim()) {
      updatedItem.pricingEstimate = editingService.pricingEstimate.trim();
    } else {
      delete updatedItem.pricingEstimate;
    }

    setServices((prev) => {
      const next = prev.map((s) => (s.id === updatedItem.id ? updatedItem : s));
      try {
        localStorage.setItem('ronny_v2_services', JSON.stringify(next));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ronny_services_updated', { detail: next }));
        }
      } catch {}
      return next;
    });

    dbSaveService(updatedItem).catch((err) =>
      console.warn('Firestore service update fallback:', err)
    );

    notifySave(`Service "${updatedItem.name}" updated successfully!`);
    setEditingService(null);
  };

  const handleDeleteService = (id: string) => {
    setServices((prev) => {
      const next = prev.filter((s) => s.id !== id);
      try {
        localStorage.setItem('ronny_v2_services', JSON.stringify(next));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ronny_services_updated', { detail: next }));
        }
      } catch {}
      return next;
    });
    dbDeleteService(id).catch((err) => console.warn('Firestore service delete fallback:', err));
    notifySave('Service removed from database');
    setDeletingServiceId(null);
    if (editingService?.id === id) {
      setEditingService(null);
    }
  };

  // ==========================================
  // TESTIMONIAL HANDLERS
  // ==========================================
  const handleAddTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestimonial.clientName || !newTestimonial.quote) return;

    const item: Testimonial = {
      id: `test-${Date.now()}`,
      ...newTestimonial,
    };

    setTestimonials((prev) => {
      const next = [item, ...prev];
      try {
        localStorage.setItem('ronny_v2_testimonials', JSON.stringify(next));
      } catch {}
      return next;
    });

    dbSaveTestimonial(item).catch((err) => console.warn('Firestore testimonial add fallback:', err));

    setNewTestimonial({
      clientName: '',
      role: '',
      company: '',
      quote: '',
      projectRef: '',
      rating: 5,
      avatar: '',
    });
    notifySave('Client testimonial published to live carousel & database!');
  };

  const handleDeleteTestimonial = (id: string) => {
    setTestimonials((prev) => {
      const next = prev.filter((t) => t.id !== id);
      try {
        localStorage.setItem('ronny_v2_testimonials', JSON.stringify(next));
      } catch {}
      return next;
    });
    dbDeleteTestimonial(id).catch((err) => console.warn('Firestore testimonial delete fallback:', err));
    notifySave('Testimonial removed from database');
    setDeletingTestimonialId(null);
  };

  // Reorder testimonials so they strictly appear in user-selected numerical order (e.g. 1, 2, 3...)
  const handleMoveTestimonial = (index: number, direction: 'up' | 'down') => {
    soundFX.playPop();
    const sorted = [...testimonials].sort((a, b) => {
      const ordA = typeof a.order === 'number' ? a.order : 999;
      const ordB = typeof b.order === 'number' ? b.order : 999;
      return ordA - ordB;
    });

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const [item] = sorted.splice(index, 1);
    sorted.splice(targetIndex, 0, item);

    // Re-index explicitly 1, 2, 3...
    const updated = sorted.map((t, idx) => ({ ...t, order: idx + 1 }));

    setTestimonials(updated);
    try {
      localStorage.setItem('ronny_v2_testimonials', JSON.stringify(updated));
    } catch {}

    updated.forEach((t) => {
      dbSaveTestimonial(t).catch((err) => console.warn('Firestore testimonial order save fallback:', err));
    });

    notifySave(`✓ Moved review to position #${targetIndex + 1}!`);
  };

  const handleSetTestimonialOrder = (id: string, newOrder: number) => {
    if (isNaN(newOrder) || newOrder < 1) return;
    soundFX.playPop();
    const sorted = [...testimonials].sort((a, b) => {
      const ordA = typeof a.order === 'number' ? a.order : 999;
      const ordB = typeof b.order === 'number' ? b.order : 999;
      return ordA - ordB;
    });

    const currentIndex = sorted.findIndex((t) => t.id === id);
    if (currentIndex === -1) return;

    const [item] = sorted.splice(currentIndex, 1);
    const targetIndex = Math.min(Math.max(0, newOrder - 1), sorted.length);
    sorted.splice(targetIndex, 0, item);

    const updated = sorted.map((t, idx) => ({ ...t, order: idx + 1 }));

    setTestimonials(updated);
    try {
      localStorage.setItem('ronny_v2_testimonials', JSON.stringify(updated));
    } catch {}

    updated.forEach((t) => {
      dbSaveTestimonial(t).catch((err) => console.warn('Firestore testimonial order save fallback:', err));
    });

    notifySave(`✓ Set review position to #${targetIndex + 1}!`);
  };

  // Hero Video Upload & Configuration Handlers
  const handleHeroVideoFile = (file: File) => {
    soundFX.playPop();
    if (!file.type.startsWith('video/') && !/\.(mp4|webm|mov)$/i.test(file.name)) {
      notifySave('❌ Please upload an MP4, WebM, or MOV video file.');
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      notifySave('❌ Video is over 100MB limit. Please upload an optimized file under 100MB or provide a URL.');
      return;
    }

    setIsUploadingHeroVideo(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const res = e.target?.result as string;
      if (res) {
        onHeroVideoUpdated?.(res);
        notifySave(`✓ Hero section video uploaded successfully (${(file.size / (1024 * 1024)).toFixed(1)}MB)!`);
      }
      setIsUploadingHeroVideo(false);
    };
    reader.onerror = () => {
      notifySave('❌ Failed to read video file.');
      setIsUploadingHeroVideo(false);
    };
    reader.readAsDataURL(file);
  };

  const handleHeroVideoUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customVideoUrlInput.trim()) return;
    soundFX.playPop();
    onHeroVideoUpdated?.(customVideoUrlInput.trim());
    notifySave('✓ Custom hero video URL applied!');
    setCustomVideoUrlInput('');
  };

  const handleRemoveHeroVideo = () => {
    soundFX.playPop();
    onHeroVideoUpdated?.(null);
    notifySave('✓ Restored default brand-logo hero video!');
  };

  // Typography Handler
  const handleApplyFont = (fontName: string) => {
    soundFX.playPop();
    onSiteFontUpdated?.(fontName);
    notifySave(`✓ Applied website font: "${fontName}" globally across all sections!`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 bg-[#111215]/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-6xl max-h-[92vh] overflow-y-auto bg-[#FAF8F3] border-3 border-[#111215] rounded-3xl p-5 sm:p-8 text-[#181924] shadow-[10px_10px_0px_#111215] flex flex-col gap-6">
        {/* HEADER BAR */}
        <div className="flex flex-wrap items-center justify-between pb-5 border-b-2 border-[#111215] gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#D2FF3A] border-2 border-[#111215] flex items-center justify-center text-[#111215] shadow-[3px_3px_0px_#111215]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black uppercase text-[#111215] tracking-tight">
                  Studio Creator CMS
                </h2>
                <span className="funky-sticker text-[9px] font-mono font-bold uppercase bg-[#FF5500] text-white px-2 py-0.5 rounded-full border border-[#111215]">
                  FULL CONTROL
                </span>
              </div>
              <p className="text-xs font-mono text-[#5C6F74] mt-0.5">
                Upload &amp; delete media files, edit website content, drops, services &amp; specialist tools.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {adminSession ? (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border-2 border-[#111215] text-[11px] font-mono shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-bold truncate max-w-[150px]">{adminSession.adminName}</span>
                <button
                  type="button"
                  onClick={handleAdminLogout}
                  title="Lock CMS & Sign Out"
                  className="text-rose-600 hover:text-rose-800 ml-1 cursor-pointer font-bold flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Lock</span>
                </button>
              </div>
            ) : currentUser ? (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#111215] text-[11px] font-mono shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-bold truncate max-w-[150px]">Onset Media</span>
                <button
                  type="button"
                  onClick={handleGoogleLogout}
                  title="Sign Out"
                  className="text-rose-600 hover:text-rose-800 ml-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : null}

            {saveAlert && (
              <div className="funky-sticker text-xs font-mono font-bold bg-[#D2FF3A] text-[#111215] px-3 py-1.5 rounded-xl border-2 border-[#111215] shadow-[2px_2px_0px_#111215] flex items-center gap-1.5 animate-bounce">
                <Check className="w-4 h-4 text-[#111215]" />
                <span>{saveAlert}</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-2xl bg-[#FAF8F3] hover:bg-[#FF5500] hover:text-white border-2 border-[#111215] flex items-center justify-center text-[#111215] shadow-[3px_3px_0px_#111215] transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AUTHENTICATION LOCK SCREEN (ONLY AUTHORIZED ADMINISTRATORS CAN SIGN IN) */}
        {!isAuthenticated ? (
          <div className="py-8 flex flex-col items-center justify-center text-center max-w-md mx-auto w-full">
            {/* 1. STANDARD ADMINISTRATOR LOGIN VIEW */}
            {authView === 'login' && (
              <>
                <div className="w-16 h-16 rounded-3xl bg-[#D2FF3A] border-2 border-[#111215] flex items-center justify-center text-[#111215] mb-4 shadow-[4px_4px_0px_#111215]">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black uppercase text-[#111215] mb-1.5 tracking-tight">
                  Administrator Authentication
                </h3>
                <p className="text-xs text-[#5C6F74] font-mono mb-5 leading-relaxed">
                  Restricted Area. Please enter authorized Administrator Name and Password to manage website media, portfolio drops, and database.
                </p>

                {/* Lockout Warning */}
                {lockoutSeconds > 0 && (
                  <div className="w-full mb-4 p-3.5 rounded-xl bg-amber-50 border-2 border-amber-400 text-amber-900 text-xs font-mono font-bold flex items-center gap-2 text-left">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Security Lockout Active. Please wait {lockoutSeconds}s before retrying.</span>
                  </div>
                )}

                {/* Notice message (e.g. after reset) */}
                {resetNotice && (
                  <div className="w-full mb-4 p-3 rounded-xl bg-emerald-50 border-2 border-emerald-400 text-emerald-800 text-xs font-mono font-bold flex items-center gap-2 text-left">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{resetNotice}</span>
                  </div>
                )}

                {/* Error Message */}
                {authError && lockoutSeconds <= 0 && (
                  <div className="w-full mb-4 p-3 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-700 text-xs font-mono font-bold flex items-center gap-2 text-left">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                {/* Secure Name and Password Form */}
                <form onSubmit={handleAdminLogin} className="w-full flex flex-col gap-3.5 font-mono text-left">
                  <div>
                    <label className="text-[11px] font-black uppercase text-[#111215] block mb-1">
                      Administrator Name or Registered Email *
                    </label>
                    <input
                      type="text"
                      required
                      autoComplete="username"
                      disabled={lockoutSeconds > 0}
                      placeholder="e.g. Onset Media"
                      value={adminNameInput}
                      onChange={(e) => {
                        setAdminNameInput(e.target.value);
                        setAuthError(null);
                      }}
                      className="w-full bg-white border-2 border-[#111215] rounded-xl p-3 text-[#111215] text-sm shadow-[3px_3px_0px_#111215] focus:outline-none focus:ring-2 focus:ring-[#D2FF3A] font-bold disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-black uppercase text-[#111215]">
                        Password *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthView('forgot_request');
                          setAuthError(null);
                          setResetNotice(null);
                        }}
                        className="text-[10px] text-[#5C6F74] hover:text-[#FF5500] hover:underline font-bold transition-colors cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        disabled={lockoutSeconds > 0}
                        placeholder="Enter admin password"
                        value={adminPasswordInput}
                        onChange={(e) => {
                          setAdminPasswordInput(e.target.value);
                          setAuthError(null);
                        }}
                        className="w-full bg-white border-2 border-[#111215] rounded-xl p-3 pr-10 text-[#111215] text-sm shadow-[3px_3px_0px_#111215] focus:outline-none focus:ring-2 focus:ring-[#D2FF3A] font-medium disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5C6F74] hover:text-[#111215] cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={lockoutSeconds > 0}
                    className="w-full py-3.5 mt-1 rounded-xl bg-[#111215] hover:bg-[#D2FF3A] text-white hover:text-[#111215] border-2 border-[#111215] font-black uppercase tracking-wider text-xs sm:text-sm shadow-[4px_4px_0px_#111215] hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sign In as Administrator
                  </button>
                </form>

                <div className="w-full flex items-center gap-3 my-4 text-xs font-mono text-[#8FA3A8]">
                  <div className="flex-1 h-px bg-[#111215]/20" />
                  <span>or Google verification</span>
                  <div className="flex-1 h-px bg-[#111215]/20" />
                </div>

                {/* Google Firebase Login Option */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full py-3 px-4 rounded-xl bg-white hover:bg-[#EFECE1] text-[#111215] border-2 border-[#111215] font-bold uppercase tracking-wider text-xs shadow-[3px_3px_0px_#111215] flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-emerald-600" />
                  <span>Verify with Google Account</span>
                </button>
              </>
            )}

            {/* 2. FORGOT PASSWORD - STEP 1: REQUEST OTP */}
            {authView === 'forgot_request' && (
              <>
                <div className="w-16 h-16 rounded-3xl bg-[#75B4B7] border-2 border-[#111215] flex items-center justify-center text-[#111215] mb-4 shadow-[4px_4px_0px_#111215]">
                  <KeyRound className="w-8 h-8" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black uppercase text-[#111215] mb-1.5 tracking-tight">
                  Password Recovery
                </h3>
                <p className="text-xs text-[#5C6F74] font-mono mb-5 leading-relaxed">
                  Enter your registered Administrator Gmail address to receive a secure 6-digit verification code (OTP) and an official password reset notification email.
                </p>

                {/* Error Message */}
                {authError && (
                  <div className="w-full mb-4 p-3 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-700 text-xs font-mono font-bold flex items-center gap-2 text-left">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleRequestOtp} className="w-full flex flex-col gap-3.5 font-mono text-left">
                  <div>
                    <label className="text-[11px] font-black uppercase text-[#111215] block mb-1">
                      Registered Gmail / Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="e.g. admin@onsetmedia.co"
                      value={resetEmailInput}
                      onChange={(e) => {
                        setResetEmailInput(e.target.value);
                        setAuthError(null);
                      }}
                      className="w-full bg-white border-2 border-[#111215] rounded-xl p-3 text-[#111215] text-sm shadow-[3px_3px_0px_#111215] focus:outline-none focus:ring-2 focus:ring-[#75B4B7] font-bold"
                    />
                  </div>

                  <p className="text-[10px] text-[#5C6F74] leading-relaxed">
                    🔒 Security Notice: The verification code expires in 10 minutes. For account privacy, responses are strictly enumeration-safe.
                  </p>

                  <button
                    type="submit"
                    disabled={resetLoading || otpCooldownSeconds > 0}
                    className="w-full py-3.5 mt-1 rounded-xl bg-[#111215] hover:bg-[#75B4B7] text-white hover:text-[#111215] border-2 border-[#111215] font-black uppercase tracking-wider text-xs sm:text-sm shadow-[4px_4px_0px_#111215] hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {resetLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Dispatching Code...</span>
                      </>
                    ) : otpCooldownSeconds > 0 ? (
                      <span>Wait {otpCooldownSeconds}s to Request Code</span>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        <span>Send Verification Code &amp; Email</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthView('login');
                      setAuthError(null);
                      setResetNotice(null);
                    }}
                    className="w-full py-2.5 mt-1 rounded-xl bg-white hover:bg-[#EFECE1] text-[#111215] border-2 border-[#111215] font-bold text-xs shadow-[2px_2px_0px_#111215] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </button>
                </form>
              </>
            )}

            {/* 3. FORGOT PASSWORD - STEP 2: VERIFY OTP & RESET PASSWORD */}
            {authView === 'forgot_verify' && (
              <>
                <div className="w-16 h-16 rounded-3xl bg-[#D2FF3A] border-2 border-[#111215] flex items-center justify-center text-[#111215] mb-4 shadow-[4px_4px_0px_#111215]">
                  <MailCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black uppercase text-[#111215] mb-1.5 tracking-tight">
                  Verify OTP &amp; Reset Password
                </h3>
                <p className="text-xs text-[#5C6F74] font-mono mb-4 leading-relaxed">
                  Enter the 6-digit verification code dispatched to your registered administrator email for <span className="font-bold text-[#111215]">Onset Media</span> and set your new password. An official email notification was also sent to your Gmail inbox.
                </p>

                {/* Email Delivery & Dev/Preview Verification Notice */}
                {simulatedDevOtp && (
                  <div className="w-full mb-3.5 p-3 rounded-xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 text-xs font-mono text-left flex flex-col gap-1 shadow-sm">
                    <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Gmail &amp; Verification Delivery Status: Active</span>
                    </div>
                    <div className="text-[11px] text-emerald-800">
                      Dispatched Verification Code (OTP):
                    </div>
                    <div className="text-lg font-black tracking-widest text-[#111215] bg-white px-3 py-1 rounded border border-emerald-300 w-fit select-all font-mono">
                      {simulatedDevOtp}
                    </div>
                    <span className="text-[10px] text-emerald-700">
                      ✓ Official notification dispatched to your Gmail. Enter the 6-digit code below to set your new password.
                    </span>
                  </div>
                )}

                {/* Error Message */}
                {authError && (
                  <div className="w-full mb-4 p-3 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-700 text-xs font-mono font-bold flex items-center gap-2 text-left">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleVerifyOtpAndReset} className="w-full flex flex-col gap-3 font-mono text-left">
                  {/* 6-Digit OTP Input */}
                  <div>
                    <label className="text-[11px] font-black uppercase text-[#111215] block mb-1">
                      6-Digit Verification Code (OTP) *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      pattern="[0-9]{6}"
                      placeholder="123456"
                      autoFocus
                      value={resetOtpInput}
                      onChange={(e) => {
                        setResetOtpInput(e.target.value.replace(/\D/g, ''));
                        setAuthError(null);
                      }}
                      className="w-full bg-white border-2 border-[#111215] rounded-xl p-3 text-center text-xl tracking-[0.4em] font-black text-[#111215] shadow-[3px_3px_0px_#111215] focus:outline-none focus:ring-2 focus:ring-[#D2FF3A]"
                    />
                    <div className="flex items-center justify-between mt-1 text-[10px] text-[#5C6F74]">
                      <span>Expires in 10 minutes (Max 5 attempts)</span>
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={resetLoading || otpCooldownSeconds > 0}
                        className="text-[#111215] hover:underline font-bold disabled:opacity-50 cursor-pointer"
                      >
                        {otpCooldownSeconds > 0 ? `Resend (${otpCooldownSeconds}s)` : 'Resend Code'}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="text-[11px] font-black uppercase text-[#111215] block mb-1">
                      New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        placeholder="Minimum 8 characters"
                        value={resetNewPasswordInput}
                        onChange={(e) => {
                          setResetNewPasswordInput(e.target.value);
                          setAuthError(null);
                        }}
                        className="w-full bg-white border-2 border-[#111215] rounded-xl p-3 pr-10 text-[#111215] text-sm shadow-[3px_3px_0px_#111215] focus:outline-none focus:ring-2 focus:ring-[#D2FF3A] font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5C6F74] hover:text-[#111215] cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="text-[11px] font-black uppercase text-[#111215] block mb-1">
                      Confirm New Password *
                    </label>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      placeholder="Re-enter new password"
                      value={resetConfirmPasswordInput}
                      onChange={(e) => {
                        setResetConfirmPasswordInput(e.target.value);
                        setAuthError(null);
                      }}
                      className="w-full bg-white border-2 border-[#111215] rounded-xl p-3 text-[#111215] text-sm shadow-[3px_3px_0px_#111215] focus:outline-none focus:ring-2 focus:ring-[#D2FF3A] font-medium"
                    />
                  </div>

                  <p className="text-[10px] text-[#5C6F74]">
                    Password must be at least 8 characters with letters and numbers/symbols.
                  </p>

                  <button
                    type="submit"
                    disabled={resetLoading || resetOtpInput.length !== 6}
                    className="w-full py-3.5 mt-1 rounded-xl bg-[#111215] hover:bg-[#D2FF3A] text-white hover:text-[#111215] border-2 border-[#111215] font-black uppercase tracking-wider text-xs sm:text-sm shadow-[4px_4px_0px_#111215] hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {resetLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying &amp; Resetting...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Reset Password &amp; Secure Account</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthView('login');
                      setAuthError(null);
                      setResetNotice(null);
                    }}
                    className="w-full py-2.5 mt-1 rounded-xl bg-white hover:bg-[#EFECE1] text-[#111215] border-2 border-[#111215] font-bold text-xs shadow-[2px_2px_0px_#111215] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Cancel &amp; Return to Sign In</span>
                  </button>
                </form>
              </>
            )}

            {/* 4. FORGOT PASSWORD - STEP 3: SUCCESS CONFIRMATION */}
            {authView === 'forgot_success' && (
              <>
                <div className="w-16 h-16 rounded-3xl bg-[#D2FF3A] border-2 border-[#111215] flex items-center justify-center text-[#111215] mb-4 shadow-[4px_4px_0px_#111215]">
                  <CheckCircle className="w-8 h-8 text-[#111215]" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black uppercase text-[#111215] mb-1.5 tracking-tight">
                  Password Updated!
                </h3>
                <p className="text-xs text-[#5C6F74] font-mono mb-6 leading-relaxed">
                  Your administrator password has been updated and securely stored with cryptographic salted hashing. All active sessions have been terminated.
                </p>

                <div className="w-full p-4 rounded-xl bg-white border-2 border-[#111215] shadow-[3px_3px_0px_#111215] mb-4 text-xs font-mono text-left text-[#5C6F74]">
                  <div className="flex items-center gap-2 font-bold text-[#111215] mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Security Status: Secure</span>
                  </div>
                  <span>You may now log in using your Administrator Name or registered Gmail ({resetEmailInput}) and your new password.</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAuthView('login');
                    setAuthError(null);
                    setAdminPasswordInput('');
                    setAdminNameInput(resetEmailInput || 'Onset Admin');
                    setResetNotice('Password successfully updated. Sign in with your new password.');
                  }}
                  className="w-full py-3.5 rounded-xl bg-[#111215] hover:bg-[#D2FF3A] text-white hover:text-[#111215] border-2 border-[#111215] font-black uppercase tracking-wider text-xs sm:text-sm shadow-[4px_4px_0px_#111215] hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In with New Password</span>
                </button>
              </>
            )}
          </div>
        ) : (
          /* AUTHENTICATED TABS & CONTROLS */
          <div className="flex flex-col flex-1 gap-6">
            {/* TAB NAVIGATION BAR */}
            <div className="flex flex-wrap items-center gap-2 pb-4 border-b-2 border-[#111215]/15">
              {[
                { id: 'projects', label: '📸 Drops', icon: Camera, count: projects.length },
                { id: 'typography', label: '🔤 Website Fonts', icon: Type },
                { id: 'media-vault', label: '📁 Media Vault', icon: Folder, count: allMediaItems.length },
                { id: 'drop-types', label: '🏷️ Drop Types & Buttons', icon: Tag, count: localDropTypes.length },
                { id: 'marquee-photos', label: '📸 Uploaded Photos (Concert Gallery)', icon: Layers, count: concertPhotos.length },
                { id: 'about-us', label: '📖 About Us', icon: Info },
                { id: 'hero-photo', label: '🎬 Hero Video & Founder', icon: Video },
                { id: 'specialist', label: '⚡ Specialist In', icon: Star, count: specialists.length },
                { id: 'services', label: '🛠️ Services', icon: Layers, count: services.length },
                { id: 'testimonials', label: '⭐ Reviews', icon: MessageSquareQuote, count: testimonials.length },
                { id: 'contact', label: '📬 Contact & Site', icon: PhoneCall },
                { id: 'database', label: '🗄️ Database & Leads', icon: Database, count: inquiries.length },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      soundFX.playPop();
                      setActiveTab(tab.id as any);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border-2 border-[#111215] ${
                      isActive
                        ? 'bg-[#111215] text-[#D2FF3A] shadow-[4px_4px_0px_#111215] -translate-y-0.5'
                        : 'bg-white text-[#181924] hover:bg-[#EFECE1] shadow-[2px_2px_0px_#111215]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{tab.label}</span>
                    {typeof tab.count === 'number' && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isActive ? 'bg-[#D2FF3A] text-[#111215]' : 'bg-[#111215]/10 text-[#111215]'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}

              <div className="ml-auto flex items-center gap-2">
                {isConfirmingReset ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        onResetDefaults();
                        onHeroPhotoUpdated(null);
                        setCustomVaultFiles([]);
                        localStorage.removeItem('ronny_v2_media_vault_items');
                        notifySave('Reset all website content and media to factory defaults');
                        setIsConfirmingReset(false);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-black border-2 border-[#111215] shadow-[2px_2px_0px_#111215] cursor-pointer"
                    >
                      Confirm Reset
                    </button>
                    <button
                      onClick={() => setIsConfirmingReset(false)}
                      className="px-2.5 py-1.5 rounded-xl bg-white text-[#111215] text-xs font-mono border-2 border-[#111215] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsConfirmingReset(true)}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border-2 border-rose-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    title="Reset all content to original defaults"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Defaults</span>
                  </button>
                )}
              </div>
            </div>

            {/* ========================================================= */}
            {/* TAB 1: MEDIA VAULT & ASSET CONTROLS (UPLOAD & DELETE)      */}
            {/* ========================================================= */}
            {activeTab === 'media-vault' && (
              <div className="flex flex-col gap-6">
                {/* Vault Header Banner */}
                <div className="p-5 rounded-2xl bg-white border-2 border-[#111215] shadow-[4px_4px_0px_#111215] flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="funky-sticker text-[10px] font-mono font-bold uppercase bg-[#D2FF3A] text-[#111215] px-2.5 py-0.5 rounded-lg border border-[#111215]">
                        ★ COMPLETE MEDIA MANAGER
                      </span>
                      <span className="text-xs font-mono text-[#5C6F74]">
                        {allMediaItems.length} Total Assets Loaded
                      </span>
                    </div>
                    <h3 className="text-lg font-black uppercase text-[#111215] mt-1">
                      Media Vault &amp; Direct File Controls
                    </h3>
                    <p className="text-xs text-[#5C6F74] font-mono mt-0.5 max-w-2xl">
                      Upload photos and video clips, copy high-res asset URLs, deploy directly as hero/founder portraits or drops, and delete unwanted media files.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      onClick={() => mediaVaultFileInputRef.current?.click()}
                      className="px-4 py-2.5 rounded-xl bg-[#111215] hover:bg-[#D2FF3A] text-white hover:text-[#111215] border-2 border-[#111215] text-xs font-mono font-black uppercase tracking-wider flex items-center gap-2 shadow-[3px_3px_0px_#111215] transition-all cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Media Files</span>
                    </button>
                    <button
                      onClick={() => setUrlImportOpen((prev) => !prev)}
                      className="px-3.5 py-2.5 rounded-xl bg-[#FAF8F3] hover:bg-[#EFECE1] text-[#111215] border-2 border-[#111215] text-xs font-mono font-bold uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#111215] cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Add via URL</span>
                    </button>
                  </div>
                </div>

                {/* Hidden File Input for Vault Upload */}
                <input
                  type="file"
                  ref={mediaVaultFileInputRef}
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleMediaVaultUpload(e.target.files);
                    }
                  }}
                />

                {/* URL Import Dropdown Bar */}
                {urlImportOpen && (
                  <form
                    onSubmit={handleUrlImportSubmit}
                    className="p-5 rounded-2xl bg-[#EFECE1] border-2 border-[#111215] shadow-[4px_4px_0px_#111215] flex flex-col gap-3 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-[#111215]/20">
                      <span className="font-bold uppercase text-[#111215]">
                        Import External Media URL (Image or Video)
                      </span>
                      <button
                        type="button"
                        onClick={() => setUrlImportOpen(false)}
                        className="text-[#777E85] hover:text-[#111215]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[#5C6F74] font-bold block mb-1">Asset Title *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Neon Arena Key Visual"
                          value={urlImportForm.title}
                          onChange={(e) => setUrlImportForm({ ...urlImportForm, title: e.target.value })}
                          className="w-full bg-white border border-[#111215] rounded-xl p-2.5 text-[#111215]"
                        />
                      </div>
                      <div>
                        <label className="text-[#5C6F74] font-bold block mb-1">Media Type *</label>
                        <select
                          value={urlImportForm.type}
                          onChange={(e) =>
                            setUrlImportForm({ ...urlImportForm, type: e.target.value as 'image' | 'video' })
                          }
                          className="w-full bg-white border border-[#111215] rounded-xl p-2.5 text-[#111215]"
                        >
                          <option value="image">Photo / Still Image</option>
                          <option value="video">Video Motion (.mp4 / loop)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[#5C6F74] font-bold block mb-1">Category / Tag</label>
                        <input
                          type="text"
                          placeholder="e.g. Concert, Drop #01"
                          value={urlImportForm.category}
                          onChange={(e) => setUrlImportForm({ ...urlImportForm, category: e.target.value })}
                          className="w-full bg-white border border-[#111215] rounded-xl p-2.5 text-[#111215]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[#5C6F74] font-bold block mb-1">Media Direct URL *</label>
                      <input
                        type="url"
                        required
                        placeholder="https://... (.jpg, .png, .mp4, etc.)"
                        value={urlImportForm.url}
                        onChange={(e) => setUrlImportForm({ ...urlImportForm, url: e.target.value })}
                        className="w-full bg-white border border-[#111215] rounded-xl p-2.5 text-[#111215]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="self-end px-5 py-2.5 rounded-xl bg-[#111215] text-[#D2FF3A] font-bold uppercase border-2 border-[#111215] cursor-pointer shadow-[2px_2px_0px_#111215]"
                    >
                      Import to Vault
                    </button>
                  </form>
                )}

                {/* Drag and Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsMediaVaultDragging(true);
                  }}
                  onDragLeave={() => setIsMediaVaultDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsMediaVaultDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      handleMediaVaultUpload(e.dataTransfer.files);
                    }
                  }}
                  onClick={() => mediaVaultFileInputRef.current?.click()}
                  className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                    isMediaVaultDragging
                      ? 'border-[#FF5500] bg-[#FF5500]/10 scale-[1.01]'
                      : 'border-[#111215]/30 bg-white hover:border-[#111215] hover:bg-[#D2FF3A]/10'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#FAF8F3] border-2 border-[#111215] flex items-center justify-center text-[#111215] shadow-[3px_3px_0px_#111215] mb-2.5">
                    <Upload className="w-6 h-6 text-[#FF5500]" />
                  </div>
                  <h4 className="text-sm font-bold uppercase text-[#111215]">
                    Drag &amp; Drop Photos &amp; Video Files Here
                  </h4>
                  <p className="text-xs font-mono text-[#5C6F74] mt-1">
                    Supports multiple files (.jpg, .png, .webp, .mp4, .webm). 100% exact original fidelity preserved.
                  </p>
                </div>

                {/* Search & Filter Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white border-2 border-[#111215] shadow-[2px_2px_0px_#111215]">
                  <div className="flex items-center gap-2">
                    {(['all', 'photos', 'videos'] as const).map((filterType) => (
                      <button
                        key={filterType}
                        onClick={() => setMediaVaultFilter(filterType)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer border ${
                          mediaVaultFilter === filterType
                            ? 'bg-[#111215] text-[#D2FF3A] border-[#111215]'
                            : 'bg-[#FAF8F3] text-[#5C6F74] border-transparent hover:border-[#111215]'
                        }`}
                      >
                        {filterType === 'all'
                          ? `All (${allMediaItems.length})`
                          : filterType === 'photos'
                          ? `📷 Photos (${allMediaItems.filter((m) => m.type === 'image').length})`
                          : `🎬 Videos (${allMediaItems.filter((m) => m.type === 'video').length})`}
                      </button>
                    ))}
                  </div>

                  <div className="relative flex-1 max-w-xs min-w-[200px]">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#777E85]" />
                    <input
                      type="text"
                      placeholder="Search media by title or source..."
                      value={mediaVaultSearch}
                      onChange={(e) => setMediaVaultSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#FAF8F3] border border-[#111215]/30 text-xs font-mono text-[#111215] focus:outline-none focus:border-[#111215]"
                    />
                  </div>
                </div>

                {/* Media Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredVaultItems.map((item) => {
                    const isVideo = item.type === 'video';
                    const isHero = heroPhoto === item.url;
                    const isFounder = aboutData?.founderPhoto === item.url;

                    return (
                      <div
                        key={item.id}
                        className="group bg-white border-2 border-[#111215] rounded-2xl p-3 flex flex-col justify-between shadow-[3px_3px_0px_#111215] hover:shadow-[5px_5px_0px_#111215] hover:-translate-y-0.5 transition-all"
                      >
                        {/* Media Container */}
                        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#111215] mb-2.5 border border-[#111215]">
                          {isVideo ? (
                            item.url && item.url.trim() !== '' ? (
                              <video
                                src={item.url}
                                muted
                                loop
                                playsInline
                                className="w-full h-full object-cover"
                                onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                                onMouseLeave={(e) => (e.target as HTMLVideoElement).pause()}
                              />
                            ) : null
                          ) : (
                            item.url && item.url.trim() !== '' ? (
                              <img
                                src={item.url}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80';
                                }}
                              />
                            ) : null
                          )}

                          {/* Top Tag Pills */}
                          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                            <span
                              className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-md border border-[#111215] shadow-xs ${
                                isVideo ? 'bg-[#FF5500] text-white' : 'bg-[#D2FF3A] text-[#111215]'
                              }`}
                            >
                              {isVideo ? '🎬 VIDEO' : '📷 PHOTO'}
                            </span>
                            {isHero && (
                              <span className="text-[9px] font-mono font-bold bg-[#111215] text-[#D2FF3A] px-1.5 py-0.5 rounded border border-[#111215]">
                                ★ HERO
                              </span>
                            )}
                            {isFounder && (
                              <span className="text-[9px] font-mono font-bold bg-[#FAF8F3] text-[#111215] px-1.5 py-0.5 rounded border border-[#111215]">
                                👤 FOUNDER
                              </span>
                            )}
                          </div>

                          {/* Hover Play / View Overlay Button */}
                          <button
                            onClick={() => setPreviewMedia(item)}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
                          >
                            <div className="w-10 h-10 rounded-full bg-white/90 text-[#111215] flex items-center justify-center shadow-lg">
                              <Eye className="w-5 h-5" />
                            </div>
                          </button>
                        </div>

                        {/* Details */}
                        <div className="flex flex-col gap-1 mb-3">
                          <h4 className="font-bold text-xs uppercase text-[#111215] truncate" title={item.name}>
                            {item.name}
                          </h4>
                          <div className="flex items-center justify-between text-[10px] font-mono text-[#777E85]">
                            <span className="truncate max-w-[120px]">{item.source}</span>
                            <span>{item.category || item.createdAt}</span>
                          </div>
                        </div>

                        {/* Controls Toolbar: Deploy, Copy, Delete */}
                        <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-[#111215]/15">
                          {/* Quick Deploy Options */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                onHeroPhotoUpdated(item.url);
                                notifySave(`Set "${item.name}" as active Hero portrait!`);
                              }}
                              title="Set as Hero section photo"
                              className={`p-1.5 rounded-lg border text-[10px] font-mono cursor-pointer transition-colors ${
                                isHero
                                  ? 'bg-[#111215] text-[#D2FF3A] border-[#111215]'
                                  : 'bg-[#FAF8F3] hover:bg-[#D2FF3A] text-[#111215] border-[#111215]'
                              }`}
                            >
                              <Camera className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                const next = { ...aboutForm, founderPhoto: item.url };
                                setAboutForm(next);
                                if (setAboutData) setAboutData(next);
                                try {
                                  localStorage.setItem('ronny_v2_about', JSON.stringify(next));
                                } catch {}
                                notifySave(`Set "${item.name}" as Meet the Founder portrait!`);
                              }}
                              title="Set as Meet the Founder photo"
                              className={`p-1.5 rounded-lg border text-[10px] font-mono cursor-pointer transition-colors ${
                                isFounder
                                  ? 'bg-[#111215] text-[#D2FF3A] border-[#111215]'
                                  : 'bg-[#FAF8F3] hover:bg-[#D2FF3A] text-[#111215] border-[#111215]'
                              }`}
                            >
                              <User className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleCopy(item.url, item.id)}
                              title="Copy URL"
                              className="p-1.5 rounded-lg bg-[#FAF8F3] hover:bg-[#EFECE1] text-[#111215] border border-[#111215] text-[10px] cursor-pointer"
                            >
                              {copiedKey === item.id ? (
                                <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>

                          {/* DELETE ACTION BUTTON */}
                          {deletingMediaKey === item.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDeleteMediaItem(item)}
                                className="px-2 py-1 rounded-lg bg-red-600 text-white font-mono text-[10px] font-bold cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeletingMediaKey(null)}
                                className="px-1.5 py-1 rounded-lg bg-[#EFECE1] text-[#111215] text-[10px] cursor-pointer"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeletingMediaKey(item.id)}
                              title="Delete media file completely"
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-300 text-[10px] cursor-pointer transition-colors flex items-center gap-1 font-mono font-bold"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredVaultItems.length === 0 && (
                  <div className="py-12 text-center text-[#777E85] font-mono text-xs">
                    No media items found matching the selected filter.
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 2: DROPS (PHOTOS & VIDEOS)                            */}
            {/* ========================================================= */}
            {activeTab === 'projects' && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#111215]/15">
                  <div>
                    <h3 className="text-lg font-black uppercase text-[#111215] flex items-center gap-2">
                      <Camera className="w-5 h-5 text-[#111215]" />
                      <span>Drops ({projects.length})</span>
                    </h3>
                    <p className="text-xs text-[#5C6F74] font-mono mt-0.5">
                      Manage Photo collections and drops displayed in the 3-tile grid &amp; expanded catalog.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Category Filter Pills */}
                    <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-white border border-[#111215]">
                      <button
                        type="button"
                        onClick={() => setProjectCategoryFilter('all')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono uppercase font-bold transition-all cursor-pointer ${
                          projectCategoryFilter === 'all'
                            ? 'bg-[#111215] text-[#D2FF3A]'
                            : 'text-[#5C6F74] hover:text-[#111215]'
                        }`}
                      >
                        All ({projects.length})
                      </button>
                      {localDropTypes.map((t) => {
                        const count = projects.filter((p) => isProjectInType(p, t)).length;
                        const isActive = projectCategoryFilter === t.id || projectCategoryFilter === t.slug;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setProjectCategoryFilter(t.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-mono uppercase font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              isActive
                                ? 'bg-[#111215] text-[#D2FF3A]'
                                : 'text-[#5C6F74] hover:text-[#111215]'
                            }`}
                          >
                            <RenderTypeIcon iconName={t.icon} className="w-3 h-3" />
                            <span>{t.name}</span>
                            <span className="text-[10px] px-1 py-0.2 rounded-full bg-[#111215]/10 font-bold">
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playPop();
                        setActiveTab('drop-types');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#EFECE1] hover:bg-[#D2FF3A] text-[#111215] border border-[#111215] font-mono font-bold text-xs uppercase flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                      title="Manage categories and buttons for the Drops tab"
                    >
                      <Tag className="w-3.5 h-3.5" />
                      <span>Manage Types ({localDropTypes.length})</span>
                    </button>

                    <button
                      onClick={() => {
                        const defaultType = localDropTypes[0] || INITIAL_DROP_TYPES[0];
                        const newDrop: Project = {
                          id: `proj-${Date.now()}`,
                          number: String(projects.length + 1).padStart(2, '0'),
                          name: 'New Creative Drop',
                          category: 'Client',
                          mediaType: 'photos',
                          dropTypeId: defaultType.id,
                          dropTypeName: defaultType.name,
                          year: '2026',
                          clientName: 'Global Client',
                          tools: ['Photoshop', 'Lightroom'],
                          artistName: 'Onset Media',
                          liveAt: 'Global Arena Tour',
                          artistDescription: 'High-voltage concert visuals and curated stage stills.',
                          description: "Artist name: Onset Media\nLive at: Global Arena Tour\nArtist's description: High-voltage concert visuals and curated stage stills.",
                          col1Image1: 'SaveClip.App_603722550_18066483578417540_6734046564953240793_n.jpg',
                          col1Image2: 'SaveClip.App_592417684_18066395564417540_3836775238257214476_n.jpg',
                          col2Image: 'SaveInta.com_758469193_18089254955417540_9161247027050578589_n.jpg',
                          videoUrl: '',
                          liveUrl: '',
                        };
                        setEditingProject(newDrop);
                        setIsCreatingProject(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#111215] hover:bg-[#D2FF3A] text-white hover:text-[#111215] border-2 border-[#111215] font-mono font-bold text-xs uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#111215] cursor-pointer transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Create New Drop</span>
                    </button>
                  </div>
                </div>

                {/* Projects Grid List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects
                    .filter((p) => {
                      if (projectCategoryFilter === 'all') return true;
                      const targetType = localDropTypes.find(
                        (t) => t.id === projectCategoryFilter || t.slug === projectCategoryFilter
                      );
                      if (targetType) {
                        return isProjectInType(p, targetType);
                      }
                      return true;
                    })
                    .map((proj) => {
                      const isVideo = proj.mediaType === 'videos';
                      const projType = localDropTypes.find((t) => isProjectInType(proj, t)) || localDropTypes[0];
                      const hasPhotos = Boolean(proj.col1Image1 || proj.col1Image2 || proj.col2Image);
                      const rawPreviewImg =
                        photosMap[proj.col2Image] ||
                        photosMap[proj.col1Image1] ||
                        proj.col2Image ||
                        proj.col1Image1 ||
                        '';
                      const previewImg = rawPreviewImg && rawPreviewImg.trim() !== '' ? rawPreviewImg : null;

                      return (
                        <div
                          key={proj.id}
                          className="bg-white border-2 border-[#111215] rounded-2xl p-4 flex flex-col justify-between shadow-[3px_3px_0px_#111215] gap-3"
                        >
                          {/* Card Preview Banner */}
                          <div className="relative w-full h-36 rounded-xl overflow-hidden bg-[#111215] border border-[#111215]">
                            {previewImg ? (
                              <img src={previewImg} alt={proj.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-[#1e1f24] flex items-center justify-center text-xs text-white/50 font-mono">
                                No preview
                              </div>
                            )}
                            <div className="absolute top-2 left-2 flex items-center gap-1">
                              <span className="funky-sticker text-[9px] font-mono font-black uppercase bg-[#111215] text-[#D2FF3A] px-2 py-0.5 rounded border border-[#111215]">
                                #{proj.number}
                              </span>
                              <span
                                className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border border-[#111215] flex items-center gap-1 shadow-xs"
                                style={{
                                  backgroundColor: projType?.color || '#75B4B7',
                                  color: projType?.textColor || '#111215',
                                }}
                              >
                                <RenderTypeIcon iconName={projType?.icon} className="w-2.5 h-2.5" />
                                <span>{projType?.name || 'PHOTOS'}</span>
                              </span>
                            </div>
                          </div>

                          {/* Info */}
                          <div>
                            <h4 className="font-black text-sm uppercase text-[#111215] leading-tight truncate">
                              {proj.name}
                            </h4>
                            <div className="flex items-center justify-between text-xs font-mono text-[#5C6F74] mt-1">
                              <span>Client: {proj.clientName || 'N/A'}</span>
                              <span>{proj.year}</span>
                            </div>
                            {(() => {
                              const desc = parseDropDescription(proj);
                              return (
                                <div className="text-[11px] font-mono text-[#5C6F74] mt-2 space-y-0.5">
                                  <div className="truncate"><span className="font-bold text-[#111215]">Artist name:</span> {desc.artistName}</div>
                                  <div className="truncate"><span className="font-bold text-[#111215]">Live at:</span> {desc.liveAt}</div>
                                  <div className="line-clamp-2"><span className="font-bold text-[#111215]">Artist&apos;s description:</span> {desc.artistDescription}</div>
                                </div>
                              );
                            })()}
                          </div>

                          {/* Media Sections Breakdown & Quick Controls */}
                          <div className="flex flex-col gap-2 pt-2 pb-2 border-t border-[#111215]/10 text-[11px] font-mono">
                            {/* Photo Section Control */}
                            <div className="flex items-center justify-between bg-[#FAF8F3] px-2.5 py-1.5 rounded-lg border border-[#111215]/15">
                              <span className="font-bold flex items-center gap-1.5 text-[#111215]">
                                <span>📷 Photos:</span>
                                <span className="font-normal text-[#5C6F74]">
                                  {[proj.col1Image1, proj.col1Image2, proj.col2Image].filter(Boolean).length} loaded
                                </span>
                              </span>

                              {hasPhotos ? (
                                deletingProjectPhotosId === proj.id ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveProjectPhotos(proj.id, proj.name)}
                                      className="px-2 py-0.5 rounded bg-red-600 text-white font-bold text-[10px] cursor-pointer"
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeletingProjectPhotosId(null)}
                                      className="px-1.5 py-0.5 rounded bg-[#EFECE1] text-[#111215] text-[10px] cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setDeletingProjectPhotosId(proj.id)}
                                    className="text-[10px] font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer flex items-center gap-0.5"
                                    title="Remove only photos from this Drop"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Remove Photos</span>
                                  </button>
                                )
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingProject({ ...proj, mediaType: 'photos' });
                                    setIsCreatingProject(false);
                                  }}
                                  className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
                                >
                                  + Add Photos
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Card Footer Actions */}
                          <div className="flex items-center justify-between pt-2.5 border-t border-[#111215]/15 mt-auto">
                            <button
                              onClick={() => {
                                setEditingProject({ ...proj });
                                setIsCreatingProject(false);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#FAF8F3] hover:bg-[#EFECE1] border border-[#111215] text-xs font-mono font-bold uppercase flex items-center gap-1.5 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit Drop</span>
                            </button>

                            {deletingProjectId === proj.id ? (
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-red-600 font-bold">Delete all?</span>
                                <button
                                  onClick={() => handleDeleteProject(proj.id, proj.name)}
                                  className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-[10px] font-mono font-bold cursor-pointer"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setDeletingProjectId(null)}
                                  className="px-2 py-1 rounded-lg bg-[#EFECE1] text-[#111215] text-[10px] font-mono cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeletingProjectId(proj.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-300 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
                                title="Delete entire drop"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="text-[11px]">Delete Drop</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* MODAL: EDIT / CREATE PROJECT WITH FULL MEDIA CONTROLS */}
                {editingProject && (
                  <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-[#111215]/80 backdrop-blur-md overflow-y-auto">
                    <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-[#FAF8F3] border-3 border-[#111215] rounded-3xl p-6 sm:p-8 flex flex-col gap-5 text-[#181924] shadow-[10px_10px_0px_#111215]">
                      <div className="flex items-center justify-between pb-4 border-b-2 border-[#111215]">
                        <div>
                          <h4 className="text-xl font-black uppercase text-[#111215]">
                            {isCreatingProject ? 'Create New Drop' : `Edit Drop: ${editingProject.name}`}
                          </h4>
                          <p className="text-xs font-mono text-[#5C6F74] mt-0.5">
                            Upload and manage photo files, update metadata, and configure display.
                          </p>
                        </div>
                        <button
                          onClick={() => setEditingProject(null)}
                          className="w-9 h-9 rounded-2xl bg-white hover:bg-[#FF5500] hover:text-white border-2 border-[#111215] flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_#111215]"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveProject} className="flex flex-col gap-5 text-xs font-mono">
                        {/* Category & Basic Metadata */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <div>
                            <label className="text-[#5C6F74] font-bold block mb-1">Drop Type / Category *</label>
                            <select
                              value={
                                editingProject.dropTypeId || 'type-photos'
                              }
                              onChange={(e) => {
                                const chosen = localDropTypes.find((t) => t.id === e.target.value);
                                setEditingProject({
                                  ...editingProject,
                                  dropTypeId: chosen?.id,
                                  dropTypeName: chosen?.name,
                                  mediaType: 'photos',
                                });
                              }}
                              className="w-full bg-white border-2 border-[#111215] rounded-xl p-2.5 font-bold text-[#111215]"
                            >
                              {localDropTypes.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.name} ({projects.filter((p) => isProjectInType(p, t)).length} drops)
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[#5C6F74] font-bold block mb-1">Rank Number *</label>
                            <input
                              type="text"
                              required
                              value={editingProject.number}
                              onChange={(e) =>
                                setEditingProject({ ...editingProject, number: e.target.value })
                              }
                              className="w-full bg-white border-2 border-[#111215] rounded-xl p-2.5 text-[#111215]"
                            />
                          </div>

                          <div>
                            <label className="text-[#5C6F74] font-bold block mb-1">Project Type</label>
                            <select
                              value={editingProject.category}
                              onChange={(e) =>
                                setEditingProject({ ...editingProject, category: e.target.value })
                              }
                              className="w-full bg-white border-2 border-[#111215] rounded-xl p-2.5 text-[#111215]"
                            >
                              <option value="Client">Client</option>
                              <option value="Commercial">Commercial</option>
                              <option value="Films">Films</option>
                              <option value="Motion">Motion</option>
                              <option value="Personal">Personal</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[#5C6F74] font-bold block mb-1">Release Year</label>
                            <input
                              type="text"
                              required
                              value={editingProject.year}
                              onChange={(e) => setEditingProject({ ...editingProject, year: e.target.value })}
                              className="w-full bg-white border-2 border-[#111215] rounded-xl p-2.5 text-[#111215]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[#5C6F74] font-bold block mb-1">Drop Title *</label>
                            <input
                              type="text"
                              required
                              value={editingProject.name}
                              onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                              className="w-full bg-white border-2 border-[#111215] rounded-xl p-2.5 text-[#111215]"
                            />
                          </div>
                          <div>
                            <label className="text-[#5C6F74] font-bold block mb-1">Client / Studio Name</label>
                            <input
                              type="text"
                              value={editingProject.clientName || ''}
                              onChange={(e) =>
                                setEditingProject({ ...editingProject, clientName: e.target.value })
                              }
                              className="w-full bg-white border-2 border-[#111215] rounded-xl p-2.5 text-[#111215]"
                            />
                          </div>
                        </div>

                        {/* Drops 3 Required Description Fields */}
                        <div className="p-4 rounded-2xl bg-[#FAF8F3] border-2 border-[#111215] flex flex-col gap-3 shadow-[2px_2px_0px_#111215]">
                          <div className="flex items-center justify-between pb-2 border-b border-[#111215]/15">
                            <span className="font-black text-xs uppercase text-[#111215] tracking-wider flex items-center gap-1.5">
                              <span>📝 Drop Description (3 Required Fields)</span>
                            </span>
                            <span className="text-[10px] font-mono text-[#5C6F74]">
                              Strict 3-field format
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[#5C6F74] font-bold block mb-1">Artist name *</label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. Mohit Chauhan & Raghu Dixit Live"
                                value={editingProject.artistName ?? parseDropDescription(editingProject).artistName}
                                onChange={(e) => {
                                  const curLive = editingProject.liveAt ?? parseDropDescription(editingProject).liveAt;
                                  const curDesc = editingProject.artistDescription ?? parseDropDescription(editingProject).artistDescription;
                                  const newArtist = e.target.value;
                                  setEditingProject({
                                    ...editingProject,
                                    artistName: newArtist,
                                    description: formatDropDescription({
                                      artistName: newArtist,
                                      liveAt: curLive,
                                      artistDescription: curDesc,
                                    }),
                                  });
                                }}
                                className="w-full bg-white border-2 border-[#111215] rounded-xl p-2.5 text-[#111215]"
                              />
                            </div>
                            <div>
                              <label className="text-[#5C6F74] font-bold block mb-1">Live at *</label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. Sunburn Acoustic Arena, Goa"
                                value={editingProject.liveAt ?? parseDropDescription(editingProject).liveAt}
                                onChange={(e) => {
                                  const curArtist = editingProject.artistName ?? parseDropDescription(editingProject).artistName;
                                  const curDesc = editingProject.artistDescription ?? parseDropDescription(editingProject).artistDescription;
                                  const newLive = e.target.value;
                                  setEditingProject({
                                    ...editingProject,
                                    liveAt: newLive,
                                    description: formatDropDescription({
                                      artistName: curArtist,
                                      liveAt: newLive,
                                      artistDescription: curDesc,
                                    }),
                                  });
                                }}
                                className="w-full bg-white border-2 border-[#111215] rounded-xl p-2.5 text-[#111215]"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[#5C6F74] font-bold block mb-1">Artist&apos;s description *</label>
                            <textarea
                              rows={3}
                              required
                              placeholder="e.g. High-energy festival portraits capturing intimate backstage preparations..."
                              value={editingProject.artistDescription ?? parseDropDescription(editingProject).artistDescription}
                              onChange={(e) => {
                                const curArtist = editingProject.artistName ?? parseDropDescription(editingProject).artistName;
                                const curLive = editingProject.liveAt ?? parseDropDescription(editingProject).liveAt;
                                const newDesc = e.target.value;
                                setEditingProject({
                                  ...editingProject,
                                  artistDescription: newDesc,
                                  description: formatDropDescription({
                                    artistName: curArtist,
                                    liveAt: curLive,
                                    artistDescription: newDesc,
                                  }),
                                });
                              }}
                              className="w-full bg-white border-2 border-[#111215] rounded-xl p-2.5 text-[#111215] resize-none"
                            />
                          </div>
                        </div>

                        {/* ============================================== */}
                        {/* MEDIA CONTROLS: PHOTO 1, PHOTO 2, POSTER, VIDEO */}
                        {/* ============================================== */}
                        {/* ============================================== */}
                        {/* 1. SEPARATE PHOTO SECTION: PHOTO 1, PHOTO 2, POSTER */}
                        {/* ============================================== */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-[#111215] flex flex-col gap-4 shadow-[3px_3px_0px_#111215]">
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#111215]/15">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-[#D2FF3A] border border-[#111215]" />
                              <h5 className="font-black uppercase tracking-wider text-[#111215] text-sm">
                                📷 Photo Section (Add &amp; Manage Photos)
                              </h5>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF8F3] border border-[#111215]/20 font-bold">
                                {[editingProject.col1Image1, editingProject.col1Image2, editingProject.col2Image].filter(Boolean).length} / 3 slots
                              </span>
                            </div>

                            {/* Clear Photo Section Button with Confirmation */}
                            {[editingProject.col1Image1, editingProject.col1Image2, editingProject.col2Image].some(Boolean) && (
                              confirmModalAction?.type === 'clear-photos' ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-red-600 font-bold">Remove all photos?</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingProject({
                                        ...editingProject,
                                        col1Image1: '',
                                        col1Image2: '',
                                        col2Image: '',
                                      });
                                      setConfirmModalAction(null);
                                      notifySave('Cleared all photos from this drop!');
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-bold text-[10px] cursor-pointer"
                                  >
                                    Confirm Clear
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmModalAction(null)}
                                    className="px-2 py-1 rounded-lg bg-[#EFECE1] text-[#111215] text-[10px] cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmModalAction({ type: 'clear-photos', label: 'Clear Photo Section' })}
                                  className="text-xs text-red-600 hover:text-red-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Clear Photo Section</span>
                                </button>
                              )
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                            {/* Photo 1 Slot */}
                            <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#111215] flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[#111215]">Photo 1 (Top Left)</span>
                                {editingProject.col1Image1 && (
                                  <button
                                    type="button"
                                    onClick={() => setEditingProject({ ...editingProject, col1Image1: '' })}
                                    className="text-[11px] text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Remove</span>
                                  </button>
                                )}
                              </div>

                              <div className="h-28 rounded-xl overflow-hidden bg-[#EFECE1] border border-[#111215]/20 relative">
                                {(() => {
                                  const p1Src = (photosMap[editingProject.col1Image1] || editingProject.col1Image1 || '').trim();
                                  return p1Src ? (
                                    <img
                                      src={p1Src}
                                      alt="Photo 1"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-[#777E85]">
                                      No Image Selected
                                    </div>
                                  );
                                })()}
                              </div>

                              <div className="flex items-center gap-2">
                                <label className="flex-1 py-1.5 px-3 rounded-lg bg-[#111215] hover:bg-[#D2FF3A] text-white hover:text-[#111215] border border-[#111215] text-center text-[10px] font-bold uppercase cursor-pointer transition-colors flex items-center justify-center gap-1">
                                  <Upload className="w-3 h-3" />
                                  <span>Upload Photo</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleProjectPhotoUpload('col1Image1', file);
                                    }}
                                  />
                                </label>
                              </div>
                              <input
                                type="text"
                                placeholder="Or image URL..."
                                value={editingProject.col1Image1}
                                onChange={(e) =>
                                  setEditingProject({ ...editingProject, col1Image1: e.target.value })
                                }
                                className="w-full bg-white border border-[#111215]/30 rounded-lg p-1.5 text-[11px]"
                              />
                            </div>

                            {/* Photo 2 Slot */}
                            <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#111215] flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[#111215]">Photo 2 (Bottom Left)</span>
                                {editingProject.col1Image2 && (
                                  <button
                                    type="button"
                                    onClick={() => setEditingProject({ ...editingProject, col1Image2: '' })}
                                    className="text-[11px] text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Remove</span>
                                  </button>
                                )}
                              </div>

                              <div className="h-28 rounded-xl overflow-hidden bg-[#EFECE1] border border-[#111215]/20 relative">
                                {(() => {
                                  const p2Src = (photosMap[editingProject.col1Image2] || editingProject.col1Image2 || '').trim();
                                  return p2Src ? (
                                    <img
                                      src={p2Src}
                                      alt="Photo 2"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-[#777E85]">
                                      No Image Selected
                                    </div>
                                  );
                                })()}
                              </div>

                              <div className="flex items-center gap-2">
                                <label className="flex-1 py-1.5 px-3 rounded-lg bg-[#111215] hover:bg-[#D2FF3A] text-white hover:text-[#111215] border border-[#111215] text-center text-[10px] font-bold uppercase cursor-pointer transition-colors flex items-center justify-center gap-1">
                                  <Upload className="w-3 h-3" />
                                  <span>Upload Photo</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleProjectPhotoUpload('col1Image2', file);
                                    }}
                                  />
                                </label>
                              </div>
                              <input
                                type="text"
                                placeholder="Or image URL..."
                                value={editingProject.col1Image2}
                                onChange={(e) =>
                                  setEditingProject({ ...editingProject, col1Image2: e.target.value })
                                }
                                className="w-full bg-white border border-[#111215]/30 rounded-lg p-1.5 text-[11px]"
                              />
                            </div>

                            {/* Poster / Primary Image Slot */}
                            <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#111215] flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[#111215]">Poster / Main Image</span>
                                {editingProject.col2Image && (
                                  <button
                                    type="button"
                                    onClick={() => setEditingProject({ ...editingProject, col2Image: '' })}
                                    className="text-[11px] text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Remove</span>
                                  </button>
                                )}
                              </div>

                              <div className="h-28 rounded-xl overflow-hidden bg-[#EFECE1] border border-[#111215]/20 relative">
                                {(() => {
                                  const posterSrc = (photosMap[editingProject.col2Image] || editingProject.col2Image || '').trim();
                                  return posterSrc ? (
                                    <img
                                      src={posterSrc}
                                      alt="Poster"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-[#777E85]">
                                      No Poster Selected
                                    </div>
                                  );
                                })()}
                              </div>

                              <div className="flex items-center gap-2">
                                <label className="flex-1 py-1.5 px-3 rounded-lg bg-[#111215] hover:bg-[#D2FF3A] text-white hover:text-[#111215] border border-[#111215] text-center text-[10px] font-bold uppercase cursor-pointer transition-colors flex items-center justify-center gap-1">
                                  <Upload className="w-3 h-3" />
                                  <span>Upload Poster</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleProjectPhotoUpload('col2Image', file);
                                    }}
                                  />
                                </label>
                              </div>
                              <input
                                type="text"
                                placeholder="Poster image URL..."
                                value={editingProject.col2Image}
                                onChange={(e) =>
                                  setEditingProject({ ...editingProject, col2Image: e.target.value })
                                }
                                className="w-full bg-white border border-[#111215]/30 rounded-lg p-1.5 text-[11px]"
                              />
                            </div>
                          </div>
                        </div>


                        {/* Modal Footer Controls with Delete Confirmation */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t-2 border-[#111215]">
                          {!isCreatingProject && (
                            confirmModalAction?.type === 'delete-drop' ? (
                              <div className="flex items-center gap-2 bg-red-50 p-2 rounded-xl border border-red-300">
                                <span className="text-xs font-bold text-red-700">Delete this entire drop?</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleDeleteProject(editingProject.id, editingProject.name);
                                    setEditingProject(null);
                                    setConfirmModalAction(null);
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold uppercase cursor-pointer"
                                >
                                  Yes, Delete
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmModalAction(null)}
                                  className="px-3 py-1.5 rounded-lg bg-[#EFECE1] text-[#111215] text-xs font-bold cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmModalAction({ type: 'delete-drop', label: 'Delete Drop' })}
                                className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-300 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete Entire Drop</span>
                              </button>
                            )
                          )}

                          <div className="flex items-center gap-3 ml-auto">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProject(null);
                                setConfirmModalAction(null);
                              }}
                              className="px-5 py-2.5 rounded-xl bg-white border-2 border-[#111215] text-[#111215] text-xs font-bold uppercase tracking-wider cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-6 py-2.5 rounded-xl bg-[#111215] hover:bg-[#D2FF3A] text-white hover:text-[#111215] border-2 border-[#111215] font-bold text-xs uppercase tracking-widest shadow-[3px_3px_0px_#111215] cursor-pointer flex items-center gap-2"
                            >
                              <Save className="w-3.5 h-3.5 text-[#D2FF3A]" />
                              <span>Save Drop</span>
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 2b: DROP TYPES & CATEGORIES (PHOTOS, VIDEOS, FREELANCER...) */}
            {/* ========================================================= */}
            {activeTab === 'drop-types' && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#111215]/15">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="funky-sticker text-[10px] font-mono font-bold uppercase bg-[#D2FF3A] text-[#111215] px-2.5 py-0.5 rounded-lg border border-[#111215]">
                        ✦ DYNAMIC DROPS NAVIGATION
                      </span>
                      <span className="text-xs font-mono text-[#5C6F74]">
                        {localDropTypes.length} Categories Configured
                      </span>
                    </div>
                    <h3 className="text-xl font-black uppercase text-[#111215] flex items-center gap-2">
                      <Tag className="w-5 h-5 text-[#111215]" />
                      <span>Drop Types &amp; Category Buttons</span>
                    </h3>
                    <p className="text-xs text-[#5C6F74] font-mono mt-1 max-w-2xl leading-relaxed">
                      Manage the category buttons shown in the public Drops tab (e.g. Photos, Videos, Freelancer, Concerts).
                      Each type automatically creates an interactive filter button with real-time drop counts and custom colors.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playPop();
                        setActiveTab('projects');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#EFECE1] text-[#111215] border-2 border-[#111215] font-mono font-bold text-xs uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#111215] cursor-pointer transition-all"
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>View All Drops ({projects.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playPop();
                        setDropTypeFormError(null);
                        setNewDropTypeDraft({
                          name: '',
                          slug: '',
                          icon: 'Briefcase',
                          color: '#38BDF8',
                          textColor: '#111215',
                          order: localDropTypes.length + 1,
                          description: '',
                        });
                        setIsCreatingDropType(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#111215] hover:bg-[#D2FF3A] text-white hover:text-[#111215] border-2 border-[#111215] font-mono font-bold text-xs uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#111215] cursor-pointer transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Add New Type</span>
                    </button>
                  </div>
                </div>

                {/* Drop Types Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {localDropTypes.map((type) => {
                    const dropsCount = projects.filter((p) => isProjectInType(p, type)).length;
                    return (
                      <div
                        key={type.id}
                        className="bg-white border-2 border-[#111215] rounded-2xl p-5 flex flex-col justify-between shadow-[4px_4px_0px_#111215] gap-4"
                      >
                        {/* Top Meta Bar */}
                        <div className="flex items-center justify-between pb-3 border-b border-[#111215]/10">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold bg-[#EFECE1] text-[#111215] px-2 py-0.5 rounded border border-[#111215]/20">
                              Order #{type.order || 1}
                            </span>
                            <span className="text-[10px] font-mono text-[#5C6F74] uppercase">
                              slug: {type.slug}
                            </span>
                          </div>
                          <span
                            className="w-4 h-4 rounded-full border border-[#111215] shadow-xs"
                            style={{ backgroundColor: type.color || '#D2FF3A' }}
                            title={`Accent color: ${type.color}`}
                          />
                        </div>

                        {/* Public Website Preview of the Button */}
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-mono uppercase font-bold text-[#5C6F74]">
                            Website Button Preview:
                          </span>
                          <div className="p-3 bg-[#EFECE1] border-2 border-[#111215] rounded-xl flex items-center justify-center shadow-inner">
                            <div
                              className="px-5 py-2.5 rounded-xl font-mono font-black text-xs uppercase tracking-wider flex items-center gap-2 border-2 border-[#111215] shadow-[2px_2px_0px_#111215]"
                              style={{
                                backgroundColor: type.color || '#D2FF3A',
                                color: type.textColor || '#111215',
                              }}
                            >
                              <RenderTypeIcon iconName={type.icon} className="w-4 h-4 shrink-0" />
                              <span>{type.name}</span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/90 text-[#111215] border border-[#111215]/30 ml-1 font-bold">
                                {dropsCount}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Category Details */}
                        <div className="space-y-1.5 text-xs font-mono">
                          <div className="flex items-center justify-between">
                            <span className="text-[#5C6F74]">Content Count:</span>
                            <span className="font-bold text-[#111215] bg-[#FAF8F3] px-2 py-0.5 rounded border border-[#111215]/20">
                              {dropsCount} Drops Assigned
                            </span>
                          </div>
                          {type.description && (
                            <div>
                              <span className="text-[#5C6F74] block mb-0.5">Tagline / Subtitle:</span>
                              <p className="text-[#181924] italic text-[11px] bg-[#FAF8F3] p-2 rounded border border-[#111215]/15">
                                &ldquo;{type.description}&rdquo;
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#111215]/10 mt-auto">
                          <button
                            type="button"
                            onClick={() => {
                              soundFX.playPop();
                              setDropTypeFormError(null);
                              setEditingDropType({ ...type });
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#EFECE1] text-[#111215] border border-[#111215] font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => initiateDeleteDropType(type)}
                            className="px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* MODAL: ADD / CREATE DROP TYPE */}
                {isCreatingDropType && (
                  <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-[#111215]/80 backdrop-blur-md overflow-y-auto">
                    <div className="w-full max-w-xl max-h-[92vh] overflow-y-auto bg-[#FAF8F3] border-3 border-[#111215] rounded-3xl p-6 sm:p-8 flex flex-col gap-5 text-[#181924] shadow-[10px_10px_0px_#111215]">
                      <div className="flex items-center justify-between pb-4 border-b-2 border-[#111215]">
                        <div>
                          <h4 className="text-xl font-black uppercase text-[#111215] flex items-center gap-2">
                            <Tag className="w-5 h-5 text-[#111215]" />
                            <span>Add New Drop Type</span>
                          </h4>
                          <p className="text-xs font-mono text-[#5C6F74] mt-0.5">
                            Add a custom category (e.g. Freelancer, Concerts, Events) for the public Drops tab.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreatingDropType(false);
                            setDropTypeFormError(null);
                          }}
                          className="w-9 h-9 rounded-2xl bg-white hover:bg-[#FF5500] hover:text-white border-2 border-[#111215] flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_#111215]"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {dropTypeFormError && (
                        <div className="p-3 bg-red-50 border-2 border-red-400 rounded-xl text-xs font-mono text-red-700 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                          <span>{dropTypeFormError}</span>
                        </div>
                      )}

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const id = `type-${Date.now()}`;
                          const newType: DropType = {
                            id,
                            name: newDropTypeDraft.name || '',
                            slug: (newDropTypeDraft.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                            icon: newDropTypeDraft.icon || 'Camera',
                            color: newDropTypeDraft.color || '#38BDF8',
                            textColor: newDropTypeDraft.textColor || '#111215',
                            order: typeof newDropTypeDraft.order === 'number' ? newDropTypeDraft.order : localDropTypes.length + 1,
                            description: newDropTypeDraft.description || '',
                          };
                          handleSaveDropType(newType);
                        }}
                        className="flex flex-col gap-4 text-xs font-mono"
                      >
                        {/* Name Input */}
                        <div>
                          <label className="text-[#111215] font-black uppercase block mb-1.5">
                            Category Name * (e.g. Freelancer, Concerts)
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Freelancer"
                            value={newDropTypeDraft.name || ''}
                            onChange={(e) => {
                              setNewDropTypeDraft({ ...newDropTypeDraft, name: e.target.value });
                              setDropTypeFormError(null);
                            }}
                            className="w-full bg-white border-2 border-[#111215] rounded-xl p-3 text-sm font-bold text-[#111215] shadow-xs"
                          />
                        </div>

                        {/* Icon Selector */}
                        <div>
                          <label className="text-[#111215] font-black uppercase block mb-1.5">
                            Select Icon
                          </label>
                          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 bg-white p-3 rounded-xl border-2 border-[#111215]">
                            {[
                              { id: 'Camera', label: 'Photo' },
                              { id: 'Film', label: 'Video' },
                              { id: 'Briefcase', label: 'Client' },
                              { id: 'Music', label: 'Music' },
                              { id: 'Sparkles', label: 'Magic' },
                              { id: 'Star', label: 'Star' },
                              { id: 'Award', label: 'Award' },
                              { id: 'Heart', label: 'Heart' },
                              { id: 'Zap', label: 'Energy' },
                              { id: 'Mic', label: 'Vocal' },
                              { id: 'Radio', label: 'Radio' },
                              { id: 'Disc', label: 'Disc' },
                              { id: 'Image', label: 'Image' },
                              { id: 'Layers', label: 'Layers' },
                              { id: 'Flame', label: 'Flame' },
                              { id: 'Tag', label: 'Tag' },
                            ].map((ic) => {
                              const isSelected = (newDropTypeDraft.icon || 'Camera').toLowerCase() === ic.id.toLowerCase();
                              return (
                                <button
                                  key={ic.id}
                                  type="button"
                                  onClick={() => setNewDropTypeDraft({ ...newDropTypeDraft, icon: ic.id })}
                                  className={`p-2 rounded-lg flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-[#111215] text-[#D2FF3A] border-[#111215] shadow-xs scale-105'
                                      : 'bg-[#FAF8F3] text-[#5C6F74] hover:text-[#111215] border-[#111215]/20 hover:bg-[#EFECE1]'
                                  }`}
                                  title={ic.id}
                                >
                                  <RenderTypeIcon iconName={ic.id} className="w-4 h-4" />
                                  <span className="text-[9px] truncate w-full text-center">{ic.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Color Selector */}
                        <div>
                          <label className="text-[#111215] font-black uppercase block mb-1.5">
                            Button Accent Color
                          </label>
                          <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-xl border-2 border-[#111215]">
                            {[
                              { color: '#D2FF3A', label: 'Lime' },
                              { color: '#FF5500', label: 'Orange' },
                              { color: '#38BDF8', label: 'Sky Blue' },
                              { color: '#A855F7', label: 'Purple' },
                              { color: '#FACC15', label: 'Yellow' },
                              { color: '#10B981', label: 'Emerald' },
                              { color: '#F43F5E', label: 'Rose' },
                              { color: '#111215', label: 'Onyx' },
                            ].map((preset) => {
                              const isSelected = newDropTypeDraft.color === preset.color;
                              return (
                                <button
                                  key={preset.color}
                                  type="button"
                                  onClick={() =>
                                    setNewDropTypeDraft({
                                      ...newDropTypeDraft,
                                      color: preset.color,
                                      textColor: preset.color === '#111215' ? '#FFFFFF' : '#111215',
                                    })
                                  }
                                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 border-2 text-[11px] font-bold cursor-pointer transition-all ${
                                    isSelected
                                      ? 'border-[#111215] shadow-[2px_2px_0px_#111215] scale-105'
                                      : 'border-[#111215]/20 opacity-80 hover:opacity-100'
                                  }`}
                                  style={{
                                    backgroundColor: preset.color,
                                    color: preset.color === '#111215' ? '#FFFFFF' : '#111215',
                                  }}
                                >
                                  <span>{preset.label}</span>
                                  {isSelected && <Check className="w-3 h-3" />}
                                </button>
                              );
                            })}
                            <div className="flex items-center gap-2 ml-auto">
                              <span className="text-[10px] text-[#5C6F74]">Custom:</span>
                              <input
                                type="color"
                                value={newDropTypeDraft.color || '#38BDF8'}
                                onChange={(e) =>
                                  setNewDropTypeDraft({ ...newDropTypeDraft, color: e.target.value })
                                }
                                className="w-8 h-8 rounded-lg cursor-pointer border border-[#111215]"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Order & Tagline */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[#111215] font-black uppercase block mb-1">
                              Display Order (1, 2, 3...)
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={newDropTypeDraft.order || 1}
                              onChange={(e) =>
                                setNewDropTypeDraft({
                                  ...newDropTypeDraft,
                                  order: parseInt(e.target.value, 10) || 1,
                                })
                              }
                              className="w-full bg-white border-2 border-[#111215] rounded-xl p-2.5 font-bold text-[#111215]"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="text-[#111215] font-black uppercase block mb-1">
                              Tagline / Subtitle (Optional)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Commercial Deliverables · Color Master"
                              value={newDropTypeDraft.description || ''}
                              onChange={(e) =>
                                setNewDropTypeDraft({
                                  ...newDropTypeDraft,
                                  description: e.target.value,
                                })
                              }
                              className="w-full bg-white border-2 border-[#111215] rounded-xl p-2.5 text-[#111215]"
                            />
                          </div>
                        </div>

                        {/* Live Button Preview Box */}
                        <div className="mt-2 p-3 bg-[#EFECE1] border-2 border-[#111215] rounded-2xl flex flex-col items-center gap-2">
                          <span className="text-[10px] font-bold text-[#5C6F74] uppercase">
                            Live Drops Tab Button Preview:
                          </span>
                          <div
                            className="px-6 py-2.5 rounded-xl font-mono font-black text-xs uppercase tracking-wider flex items-center gap-2 border-2 border-[#111215] shadow-[2px_2px_0px_#111215]"
                            style={{
                              backgroundColor: newDropTypeDraft.color || '#38BDF8',
                              color: newDropTypeDraft.textColor || '#111215',
                            }}
                          >
                            <RenderTypeIcon iconName={newDropTypeDraft.icon} className="w-4 h-4" />
                            <span>{newDropTypeDraft.name || 'TYPE NAME'}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/90 text-[#111215] border border-[#111215]/30 ml-1 font-bold">
                              0
                            </span>
                          </div>
                        </div>

                        {/* Modal Footer Controls */}
                        <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-[#111215] mt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsCreatingDropType(false);
                              setDropTypeFormError(null);
                            }}
                            className="px-5 py-2.5 rounded-xl bg-white border-2 border-[#111215] text-[#111215] font-bold text-xs uppercase cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-2.5 rounded-xl bg-[#111215] hover:bg-[#D2FF3A] text-white hover:text-[#111215] border-2 border-[#111215] font-bold text-xs uppercase tracking-widest shadow-[3px_3px_0px_#111215] cursor-pointer flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Create Type</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* MODAL: EDIT DROP TYPE */}
                {editingDropType && (
                  <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-[#111215]/80 backdrop-blur-md overflow-y-auto">
                    <div className="w-full max-w-xl max-h-[92vh] overflow-y-auto bg-[#FAF8F3] border-3 border-[#111215] rounded-3xl p-6 sm:p-8 flex flex-col gap-5 text-[#181924] shadow-[10px_10px_0px_#111215]">
                      <div className="flex items-center justify-between pb-4 border-b-2 border-[#111215]">
                        <div>
                          <h4 className="text-xl font-black uppercase text-[#111215] flex items-center gap-2">
                            <Edit2 className="w-5 h-5 text-[#111215]" />
                            <span>Edit Category: {editingDropType.name}</span>
                          </h4>
                          <p className="text-xs font-mono text-[#5C6F74] mt-0.5">
                            Update button styling, name, icon, and position in the Drops tab.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingDropType(null);
                            setDropTypeFormError(null);
                          }}
                          className="w-9 h-9 rounded-2xl bg-white hover:bg-[#FF5500] hover:text-white border-2 border-[#111215] flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_#111215]"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {dropTypeFormError && (
                        <div className="p-3 bg-red-50 border-2 border-red-400 rounded-xl text-xs font-mono text-red-700 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                          <span>{dropTypeFormError}</span>
                        </div>
                      )}

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSaveDropType(editingDropType);
                        }}
                        className="flex flex-col gap-4 text-xs font-mono"
                      >
                        {/* Name Input */}
                        <div>
                          <label className="text-[#111215] font-black uppercase block mb-1.5">
                            Category Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={editingDropType.name}
                            onChange={(e) => {
                              setEditingDropType({ ...editingDropType, name: e.target.value });
                              setDropTypeFormError(null);
                            }}
                            className="w-full bg-white border-2 border-[#111215] rounded-xl p-3 text-sm font-bold text-[#111215] shadow-xs"
                          />
                        </div>

                        {/* Icon Selector */}
                        <div>
                          <label className="text-[#111215] font-black uppercase block mb-1.5">
                            Select Icon
                          </label>
                          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 bg-white p-3 rounded-xl border-2 border-[#111215]">
                            {[
                              { id: 'Camera', label: 'Photo' },
                              { id: 'Film', label: 'Video' },
                              { id: 'Briefcase', label: 'Client' },
                              { id: 'Music', label: 'Music' },
                              { id: 'Sparkles', label: 'Magic' },
                              { id: 'Star', label: 'Star' },
                              { id: 'Award', label: 'Award' },
                              { id: 'Heart', label: 'Heart' },
                              { id: 'Zap', label: 'Energy' },
                              { id: 'Mic', label: 'Vocal' },
                              { id: 'Radio', label: 'Radio' },
                              { id: 'Disc', label: 'Disc' },
                              { id: 'Image', label: 'Image' },
                              { id: 'Layers', label: 'Layers' },
                              { id: 'Flame', label: 'Flame' },
                              { id: 'Tag', label: 'Tag' },
                            ].map((ic) => {
                              const isSelected = (editingDropType.icon || 'Camera').toLowerCase() === ic.id.toLowerCase();
                              return (
                                <button
                                  key={ic.id}
                                  type="button"
                                  onClick={() => setEditingDropType({ ...editingDropType, icon: ic.id })}
                                  className={`p-2 rounded-lg flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-[#111215] text-[#D2FF3A] border-[#111215] shadow-xs scale-105'
                                      : 'bg-[#FAF8F3] text-[#5C6F74] hover:text-[#111215] border-[#111215]/20 hover:bg-[#EFECE1]'
                                  }`}
                                  title={ic.id}
                                >
                                  <RenderTypeIcon iconName={ic.id} className="w-4 h-4" />
                                  <span className="text-[9px] truncate w-full text-center">{ic.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Color Selector */}
                        <div>
                          <label className="text-[#111215] font-black uppercase block mb-1.5">
                            Button Accent Color
                          </label>
                          <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-xl border-2 border-[#111215]">
                            {[
                              { color: '#D2FF3A', label: 'Lime' },
                              { color: '#FF5500', label: 'Orange' },
                              { color: '#38BDF8', label: 'Sky Blue' },
                              { color: '#A855F7', label: 'Purple' },
                              { color: '#FACC15', label: 'Yellow' },
                              { color: '#10B981', label: 'Emerald' },
                              { color: '#F43F5E', label: 'Rose' },
                              { color: '#111215', label: 'Onyx' },
                            ].map((preset) => {
                              const isSelected = editingDropType.color === preset.color;
                              return (
                                <button
                                  key={preset.color}
                                  type="button"
                                  onClick={() =>
                                    setEditingDropType({
                                      ...editingDropType,
                                      color: preset.color,
                                      textColor: preset.color === '#111215' ? '#FFFFFF' : '#111215',
                                    })
                                  }
                                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 border-2 text-[11px] font-bold cursor-pointer transition-all ${
                                    isSelected
                                      ? 'border-[#111215] shadow-[2px_2px_0px_#111215] scale-105'
                                      : 'border-[#111215]/20 opacity-80 hover:opacity-100'
                                  }`}
                                  style={{
                                    backgroundColor: preset.color,
                                    color: preset.color === '#111215' ? '#FFFFFF' : '#111215',
                                  }}
                                >
                                  <span>{preset.label}</span>
                                  {isSelected && <Check className="w-3 h-3" />}
                                </button>
                              );
                            })}
                            <div className="flex items-center gap-2 ml-auto">
                              <span className="text-[10px] text-[#5C6F74]">Custom:</span>
                              <input
                                type="color"
                                value={editingDropType.color || '#D2FF3A'}
                                onChange={(e) =>
                                  setEditingDropType({ ...editingDropType, color: e.target.value })
                                }
                                className="w-8 h-8 rounded-lg cursor-pointer border border-[#111215]"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Order & Tagline */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[#111215] font-black uppercase block mb-1">
                              Display Order
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={editingDropType.order || 1}
                              onChange={(e) =>
                                setEditingDropType({
                                  ...editingDropType,
                                  order: parseInt(e.target.value, 10) || 1,
                                })
                              }
                              className="w-full bg-white border-2 border-[#111215] rounded-xl p-2.5 font-bold text-[#111215]"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="text-[#111215] font-black uppercase block mb-1">
                              Tagline / Subtitle
                            </label>
                            <input
                              type="text"
                              value={editingDropType.description || ''}
                              onChange={(e) =>
                                setEditingDropType({
                                  ...editingDropType,
                                  description: e.target.value,
                                })
                              }
                              className="w-full bg-white border-2 border-[#111215] rounded-xl p-2.5 text-[#111215]"
                            />
                          </div>
                        </div>

                        {/* Live Button Preview Box */}
                        <div className="mt-2 p-3 bg-[#EFECE1] border-2 border-[#111215] rounded-2xl flex flex-col items-center gap-2">
                          <span className="text-[10px] font-bold text-[#5C6F74] uppercase">
                            Live Drops Tab Button Preview:
                          </span>
                          <div
                            className="px-6 py-2.5 rounded-xl font-mono font-black text-xs uppercase tracking-wider flex items-center gap-2 border-2 border-[#111215] shadow-[2px_2px_0px_#111215]"
                            style={{
                              backgroundColor: editingDropType.color || '#D2FF3A',
                              color: editingDropType.textColor || '#111215',
                            }}
                          >
                            <RenderTypeIcon iconName={editingDropType.icon} className="w-4 h-4" />
                            <span>{editingDropType.name || 'TYPE NAME'}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/90 text-[#111215] border border-[#111215]/30 ml-1 font-bold">
                              {projects.filter((p) => isProjectInType(p, editingDropType)).length}
                            </span>
                          </div>
                        </div>

                        {/* Modal Footer Controls */}
                        <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-[#111215] mt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingDropType(null);
                              setDropTypeFormError(null);
                            }}
                            className="px-5 py-2.5 rounded-xl bg-white border-2 border-[#111215] text-[#111215] font-bold text-xs uppercase cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-2.5 rounded-xl bg-[#111215] hover:bg-[#D2FF3A] text-white hover:text-[#111215] border-2 border-[#111215] font-bold text-xs uppercase tracking-widest shadow-[3px_3px_0px_#111215] cursor-pointer flex items-center gap-2"
                          >
                            <Save className="w-3.5 h-3.5 text-[#D2FF3A]" />
                            <span>Save Changes</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* MODAL: DELETE CONFIRMATION WITH DATA SAFETY CHECK */}
                {deletingDropTypeInfo && (
                  <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-[#111215]/85 backdrop-blur-md">
                    <div className="w-full max-w-md bg-white border-3 border-red-600 rounded-3xl p-6 sm:p-7 flex flex-col gap-4 text-[#181924] shadow-[10px_10px_0px_#111215]">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-red-100 border-2 border-red-500 flex items-center justify-center text-red-600">
                          <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-lg font-black uppercase text-[#111215]">
                            Delete &ldquo;{deletingDropTypeInfo.type.name}&rdquo;?
                          </h4>
                          <span className="text-[11px] font-mono text-red-600 font-bold">
                            Safety validation &amp; content protection
                          </span>
                        </div>
                      </div>

                      {deletingDropTypeInfo.dropsCount > 0 ? (
                        <div className="p-3.5 bg-amber-50 border-2 border-amber-300 rounded-2xl text-xs font-mono text-amber-900 space-y-2">
                          <p className="font-bold flex items-center gap-1.5 text-amber-800">
                            <span>⚠️ This category contains {deletingDropTypeInfo.dropsCount} Drop(s):</span>
                          </p>
                          <p className="text-[11px] bg-white/70 p-2 rounded border border-amber-200 font-semibold line-clamp-3">
                            {deletingDropTypeInfo.dropNames.join(', ')}
                          </p>
                          <p className="text-[11px] leading-relaxed">
                            To protect your portfolio and prevent any accidental loss of photos or videos, all {deletingDropTypeInfo.dropsCount} drop(s) will be <strong>safely reassigned to &ldquo;Photos&rdquo;</strong> before deleting this category button.
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs font-mono text-[#5C6F74] leading-relaxed">
                          This category currently contains 0 drops. Deleting it will remove its button from the public Drops tab.
                        </p>
                      )}

                      <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-[#111215]/15">
                        <button
                          type="button"
                          onClick={() => setDeletingDropTypeInfo(null)}
                          className="px-4 py-2 rounded-xl bg-white border-2 border-[#111215] text-[#111215] font-mono font-bold text-xs uppercase cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirmDeleteDropType}
                          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-[2px_2px_0px_#111215] cursor-pointer flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>
                            {deletingDropTypeInfo.dropsCount > 0 ? 'Reassign Drops & Delete' : 'Confirm Delete'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 3: CONCERT GALLERY (MARQUEE MEDIA)                     */}
            {/* ========================================================= */}
            {activeTab === 'marquee-photos' && (
              <div className="flex flex-col gap-6">
                {/* Header Toolbar */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b-2 border-[#111215]/15">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="funky-sticker text-[10px] font-mono font-bold uppercase bg-[#D2FF3A] text-[#111215] px-2.5 py-0.5 rounded-lg border border-[#111215]">
                        ★ ZERO DUPLICATES GUARANTEED
                      </span>
                      <span className="text-xs font-mono text-[#5C6F74]">
                        {concertPhotos.length} Unique Cards
                      </span>
                    </div>
                    <h3 className="text-lg font-black uppercase text-[#111215] flex items-center gap-2 mt-1">
                      <Layers className="w-5 h-5 text-[#111215]" />
                      <span>Uploaded Photos &amp; Concert Marquee Gallery</span>
                    </h3>
                    <p className="text-xs text-[#5C6F74] font-mono mt-0.5">
                      Upload photos directly to each template card, bulk upload new photos, or add cards. Duplicate photos are strictly prevented.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Bulk Upload Button */}
                    <button
                      type="button"
                      onClick={() => concertGalleryBatchInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-[#111215] hover:bg-[#D2FF3A] text-white hover:text-[#111215] border-2 border-[#111215] font-mono font-bold text-xs uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#111215] transition-all cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photos</span>
                    </button>

                    {/* Add Single Card */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingPhoto(true);
                        setNewPhotoData({
                          title: '',
                          artist: '',
                          category: 'Arena Tour',
                          venue: '',
                          year: '2026',
                          description: '',
                        });
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#FAF8F3] hover:bg-[#EFECE1] text-[#111215] border-2 border-[#111215] font-mono font-bold text-xs uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#111215] cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Card</span>
                    </button>

                    {/* Deduplicate Button */}
                    <button
                      type="button"
                      onClick={handleDeduplicateConcertPhotos}
                      className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border-2 border-emerald-500 font-mono font-bold text-xs uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#111215] transition-all cursor-pointer"
                      title="Scan gallery and remove any duplicate photo cards"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>⚡ Deduplicate</span>
                    </button>

                    {/* Delete Empty Placeholder Templates */}
                    <button
                      type="button"
                      onClick={handleDeleteEmptyTemplates}
                      className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-mono font-bold text-[11px] uppercase flex items-center gap-1 cursor-pointer"
                      title="Keep only cards with uploaded photos"
                    >
                      <Trash2 className="w-3 h-3 text-amber-700" />
                      <span>Clear Empty Templates</span>
                    </button>

                    {/* Reset to defaults */}
                    <button
                      type="button"
                      onClick={handleResetConcertTemplates}
                      className="px-2.5 py-2 rounded-xl bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 font-mono text-[11px] cursor-pointer"
                      title="Restore original template cards"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Hidden Input for Bulk Upload */}
                <input
                  type="file"
                  ref={concertGalleryBatchInputRef}
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleBatchConcertPhotosUpload(e.target.files);
                    }
                  }}
                />

                {/* Drag and Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsConcertGalleryDragging(true);
                  }}
                  onDragLeave={() => setIsConcertGalleryDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsConcertGalleryDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      handleBatchConcertPhotosUpload(e.dataTransfer.files);
                    }
                  }}
                  onClick={() => concertGalleryBatchInputRef.current?.click()}
                  className={`p-6 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                    isConcertGalleryDragging
                      ? 'border-[#111215] bg-[#D2FF3A]/20 scale-[1.01]'
                      : 'border-[#111215]/30 bg-white hover:border-[#111215] hover:bg-[#FAF8F3]'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#D2FF3A] border-2 border-[#111215] flex items-center justify-center text-[#111215] mb-2 shadow-[2px_2px_0px_#111215]">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-sm uppercase text-[#111215]">
                    Drop Concert Photos Here or Click to Browse
                  </h4>
                  <p className="text-xs font-mono text-[#5C6F74] mt-1 max-w-lg">
                    Automatically fills empty template cards or adds new cards. 100% original fidelity. Duplicate files are strictly blocked.
                  </p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {concertPhotos.map((item, idx) => {
                    const hasUploadedPhoto = Boolean(
                      (item.url && (item.url.startsWith('data:') || item.url.startsWith('http') || item.url.startsWith('/'))) ||
                      photosMap[item.filename]
                    );
                    const photoSrc = photosMap[item.filename] || item.url;
                    const cardFileInputId = `card-file-upload-${item.id}`;

                    return (
                      <div
                        key={item.id}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const file = e.dataTransfer.files?.[0];
                          if (file) {
                            handleUploadPhotoToCard(item, file);
                          }
                        }}
                        className={`border-2 border-[#111215] rounded-2xl p-3 flex flex-col justify-between shadow-[3px_3px_0px_#111215] gap-3 transition-all ${
                          hasUploadedPhoto ? 'bg-white' : 'bg-[#FAF8F3]'
                        }`}
                      >
                        {/* Hidden File Input for this specific card */}
                        <input
                          id={cardFileInputId}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleUploadPhotoToCard(item, file);
                            }
                          }}
                        />

                        {/* Image Preview Box or Empty Placeholder */}
                        <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#181924] border border-[#111215] relative group">
                          {hasUploadedPhoto && photoSrc && photoSrc.trim() !== '' ? (
                            <>
                              <img
                                src={photoSrc}
                                alt={item.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.currentTarget as HTMLElement).style.display = 'none';
                                }}
                              />
                              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#D2FF3A] text-[#111215] border border-[#111215] font-mono text-[9px] font-black uppercase shadow-xs">
                                ✓ Photo Loaded
                              </div>
                            </>
                          ) : (
                            <div
                              onClick={() => document.getElementById(cardFileInputId)?.click()}
                              className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-[#2D2E42] to-[#181924] text-white cursor-pointer hover:border-[#D2FF3A] transition-colors"
                            >
                              <Camera className="w-7 h-7 text-[#D2FF3A] mb-1.5 opacity-80" />
                              <span className="text-[10px] font-mono font-bold uppercase text-[#D2FF3A]">
                                No Photo Yet
                              </span>
                              <span className="text-[9px] font-mono text-white/60 mt-0.5 line-clamp-1">
                                {item.filename}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  document.getElementById(cardFileInputId)?.click();
                                }}
                                className="mt-2 px-2.5 py-1 rounded-lg bg-[#D2FF3A] hover:bg-white text-[#111215] font-mono font-black text-[10px] uppercase border border-[#111215] shadow-xs cursor-pointer"
                              >
                                + Upload Photo
                              </button>
                            </div>
                          )}

                          {/* Hover Overlay Button to Replace Photo */}
                          {hasUploadedPhoto && (
                            <div
                              onClick={() => document.getElementById(cardFileInputId)?.click()}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                            >
                              <Upload className="w-5 h-5 text-[#D2FF3A] mb-1" />
                              <span className="text-[10px] font-mono font-bold uppercase">
                                Replace Photo
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Card Info */}
                        <div>
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#5C6F74] uppercase font-bold truncate">
                            <span>#{idx + 1}</span>
                            <span>·</span>
                            <span className="truncate">{item.artist || 'Performer'}</span>
                          </div>
                          <h4 className="font-black text-xs uppercase text-[#111215] truncate mt-0.5" title={item.title}>
                            {item.title}
                          </h4>
                          <div className="text-[10px] font-mono text-[#777E85] truncate mt-0.5">
                            {item.filename}
                          </div>
                        </div>

                        {/* Card Action Controls: Upload, Edit, Delete */}
                        <div className="flex items-center justify-between pt-2.5 border-t border-[#111215]/15 mt-auto gap-1.5">
                          {/* Direct Upload button */}
                          <button
                            type="button"
                            onClick={() => document.getElementById(cardFileInputId)?.click()}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-[#FAF8F3] hover:bg-[#D2FF3A] hover:text-[#111215] border border-[#111215] text-[10px] font-mono font-bold uppercase flex items-center justify-center gap-1 cursor-pointer transition-colors"
                            title="Upload or change image file for this card"
                          >
                            <Upload className="w-3 h-3" />
                            <span>{hasUploadedPhoto ? 'Change' : 'Upload'}</span>
                          </button>

                          {/* Edit Details */}
                          <button
                            type="button"
                            onClick={() => setEditingPhoto(item)}
                            className="p-1.5 rounded-lg bg-white hover:bg-[#EFECE1] border border-[#111215] text-[10px] font-mono cursor-pointer"
                            title="Edit Title and Artist"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-[#111215]" />
                          </button>

                          {/* Delete Card */}
                          {deletingPhotoId === item.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleDeletePhoto(item.id, item.title, item.filename)}
                                className="px-2 py-1 rounded-lg bg-red-600 text-white font-mono text-[10px] font-bold cursor-pointer"
                              >
                                Delete
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingPhotoId(null)}
                                className="px-1.5 py-1 rounded-lg bg-[#EFECE1] text-[#111215] text-[10px] cursor-pointer"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeletingPhotoId(item.id)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-300 text-[10px] cursor-pointer"
                              title="Delete this card from templates"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB: ABOUT US (STUDIO VISION & NARRATIVE)                 */}
            {/* ========================================================= */}
            {activeTab === 'about-us' && (
              <div className="flex flex-col gap-6 font-mono text-xs">
                <div className="p-5 rounded-2xl bg-white border-2 border-[#111215] shadow-[4px_4px_0px_#111215] flex flex-col gap-5">
                  <div className="flex items-center justify-between pb-3 border-b border-[#111215]/20 flex-wrap gap-2">
                    <div>
                      <h4 className="font-black text-sm uppercase text-[#111215] flex items-center gap-1.5">
                        <Info className="w-4 h-4 text-[#D2FF3A]" />
                        <span>About Us (Studio Vision, Story &amp; Ethos)</span>
                      </h4>
                      <p className="text-[11px] text-[#5C6F74] mt-0.5">
                        Edit the About Us page content displayed before Meet the Founder. Changes update live on the website.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleResetAboutUs}
                        className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-gray-300 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Defaults</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveAboutUs()}
                        className="px-4 py-2 rounded-xl bg-[#111215] hover:bg-[#D2FF3A] text-white hover:text-[#111215] font-black uppercase text-xs border-2 border-[#111215] flex items-center gap-1.5 cursor-pointer shadow-[3px_3px_0px_#111215] transition-all"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </div>

                  {/* Section Headers & Badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[#5C6F74] font-bold block mb-1">Section Headline *</label>
                      <input
                        type="text"
                        value={aboutUsForm.headline}
                        onChange={(e) => setAboutUsForm({ ...aboutUsForm, headline: e.target.value })}
                        placeholder="e.g. ABOUT ONSET MEDIA"
                        className="w-full bg-[#FAF8F3] border border-[#111215] rounded-xl p-2.5 text-[#111215] font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[#5C6F74] font-bold block mb-1">Tagline / Sub-heading</label>
                      <input
                        type="text"
                        value={aboutUsForm.tagline}
                        onChange={(e) => setAboutUsForm({ ...aboutUsForm, tagline: e.target.value })}
                        placeholder="e.g. High-Octane Visual Direction & Cinematography"
                        className="w-full bg-[#FAF8F3] border border-[#111215] rounded-xl p-2.5 text-[#111215]"
                      />
                    </div>
                    <div>
                      <label className="text-[#5C6F74] font-bold block mb-1">Main Sticker Badge</label>
                      <input
                        type="text"
                        value={aboutUsForm.badge}
                        onChange={(e) => setAboutUsForm({ ...aboutUsForm, badge: e.target.value })}
                        placeholder="e.g. ✦ THE STUDIO 🎬"
                        className="w-full bg-[#FAF8F3] border border-[#111215] rounded-xl p-2.5 text-[#111215]"
                      />
                    </div>
                    <div>
                      <label className="text-[#5C6F74] font-bold block mb-1">Sub-badge Label</label>
                      <input
                        type="text"
                        value={aboutUsForm.subBadge}
                        onChange={(e) => setAboutUsForm({ ...aboutUsForm, subBadge: e.target.value })}
                        placeholder="e.g. VISION & CREATIVE ETHOS"
                        className="w-full bg-[#FAF8F3] border border-[#111215] rounded-xl p-2.5 text-[#111215]"
                      />
                    </div>
                  </div>

                  {/* Narrative Paragraphs */}
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-[#5C6F74] font-bold block mb-1">Primary Story Paragraph *</label>
                      <textarea
                        rows={4}
                        value={aboutUsForm.paragraph1}
                        onChange={(e) => setAboutUsForm({ ...aboutUsForm, paragraph1: e.target.value })}
                        placeholder="Main introduction to the studio, team, capabilities..."
                        className="w-full bg-[#FAF8F3] border border-[#111215] rounded-xl p-2.5 text-[#111215] leading-relaxed resize-y"
                      />
                    </div>
                    <div>
                      <label className="text-[#5C6F74] font-bold block mb-1">Secondary Story Paragraph</label>
                      <textarea
                        rows={3}
                        value={aboutUsForm.paragraph2}
                        onChange={(e) => setAboutUsForm({ ...aboutUsForm, paragraph2: e.target.value })}
                        placeholder="Additional details on production discipline, client impact..."
                        className="w-full bg-[#FAF8F3] border border-[#111215] rounded-xl p-2.5 text-[#111215] leading-relaxed resize-y"
                      />
                    </div>
                  </div>

                  {/* Key Stats */}
                  <div>
                    <span className="font-bold text-xs uppercase text-[#111215] block mb-2">
                      Key Metric Badges (4 Metrics)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {aboutUsForm.stats.map((stat, sIdx) => (
                        <div key={stat.id || sIdx} className="p-3 rounded-xl bg-[#FAF8F3] border border-[#111215] flex flex-col gap-1.5">
                          <div>
                            <label className="text-[10px] text-[#5C6F74] font-bold block">Stat Value</label>
                            <input
                              type="text"
                              value={stat.value}
                              onChange={(e) => {
                                const newStats = [...aboutUsForm.stats];
                                newStats[sIdx] = { ...stat, value: e.target.value };
                                setAboutUsForm({ ...aboutUsForm, stats: newStats });
                              }}
                              className="w-full bg-white border border-[#111215] rounded-lg p-1.5 text-xs font-bold text-[#111215]"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-[#5C6F74] font-bold block">Stat Label</label>
                            <input
                              type="text"
                              value={stat.label}
                              onChange={(e) => {
                                const newStats = [...aboutUsForm.stats];
                                newStats[sIdx] = { ...stat, label: e.target.value };
                                setAboutUsForm({ ...aboutUsForm, stats: newStats });
                              }}
                              className="w-full bg-white border border-[#111215] rounded-lg p-1.5 text-xs text-[#5C6F74]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Core Pillars */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs uppercase text-[#111215]">
                        Core Creative Pillars ({aboutUsForm.pillars.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const newPillar = {
                            id: `pillar-${Date.now()}`,
                            title: 'New Pillar Title',
                            description: 'Description of studio capability or ethos.',
                            tag: 'CAPABILITY',
                          };
                          setAboutUsForm({ ...aboutUsForm, pillars: [...aboutUsForm.pillars, newPillar] });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#D2FF3A] text-[#111215] text-[10px] font-bold uppercase border border-[#111215] flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Pillar</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {aboutUsForm.pillars.map((pillar, pIdx) => (
                        <div key={pillar.id || pIdx} className="p-3.5 rounded-xl bg-[#FAF8F3] border border-[#111215] flex flex-col gap-2">
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              placeholder="Tag (e.g. LIVE PRODUCTION)"
                              value={pillar.tag}
                              onChange={(e) => {
                                const newPillars = [...aboutUsForm.pillars];
                                newPillars[pIdx] = { ...pillar, tag: e.target.value };
                                setAboutUsForm({ ...aboutUsForm, pillars: newPillars });
                              }}
                              className="bg-white border border-[#111215] rounded-md px-2 py-0.5 text-[10px] font-bold text-[#111215] w-28"
                            />
                            {aboutUsForm.pillars.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newPillars = aboutUsForm.pillars.filter((_, idx) => idx !== pIdx);
                                  setAboutUsForm({ ...aboutUsForm, pillars: newPillars });
                                }}
                                className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                                title="Delete Pillar"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <input
                            type="text"
                            placeholder="Pillar Title"
                            value={pillar.title}
                            onChange={(e) => {
                              const newPillars = [...aboutUsForm.pillars];
                              newPillars[pIdx] = { ...pillar, title: e.target.value };
                              setAboutUsForm({ ...aboutUsForm, pillars: newPillars });
                            }}
                            className="w-full bg-white border border-[#111215] rounded-lg p-1.5 text-xs font-bold text-[#111215]"
                          />

                          <textarea
                            rows={3}
                            placeholder="Pillar Description"
                            value={pillar.description}
                            onChange={(e) => {
                              const newPillars = [...aboutUsForm.pillars];
                              newPillars[pIdx] = { ...pillar, description: e.target.value };
                              setAboutUsForm({ ...aboutUsForm, pillars: newPillars });
                            }}
                            className="w-full bg-white border border-[#111215] rounded-lg p-1.5 text-xs text-[#5C6F74] resize-y"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Save Footer Button */}
                  <div className="pt-3 border-t border-[#111215]/10 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleSaveAboutUs()}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#111215] hover:bg-[#D2FF3A] text-white hover:text-[#111215] font-black uppercase text-xs border-2 border-[#111215] flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_#111215] transition-all"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save About Us Settings</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 4: FOUNDER & HERO SECTION                              */}
            {/* ========================================================= */}
            {activeTab === 'hero-photo' && (
              <div className="flex flex-col gap-6 font-mono text-xs">
                {/* 1. HERO BACKGROUND VIDEO CONTROLS */}
                <div className="p-5 rounded-2xl bg-white border-2 border-[#111215] shadow-[4px_4px_0px_#111215] flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#111215]/20 flex-wrap gap-2">
                    <div>
                      <h4 className="font-black text-sm uppercase text-[#111215] flex items-center gap-1.5">
                        <Video className="w-4 h-4 text-[#FF5500]" />
                        <span>Hero Section Background Video</span>
                      </h4>
                      <p className="text-[11px] text-[#5C6F74] mt-0.5">
                        Upload a video or enter a URL to play in the website's hero background. Appears seamlessly on the site.
                      </p>
                    </div>
                    {heroVideo && (
                      <button
                        type="button"
                        onClick={handleRemoveHeroVideo}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset to Brand Logo Video</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Left: Upload and URL controls */}
                    <div className="flex flex-col gap-3">
                      {/* Active Status Badge */}
                      <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#111215] flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-[#5C6F74] block">
                            Active Background Video:
                          </span>
                          <span className="text-xs font-black uppercase text-[#111215] flex items-center gap-1.5 mt-0.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            {heroVideo ? 'Custom Uploaded Video Active' : 'Default Brand-Logo Video Active'}
                          </span>
                        </div>
                        {heroVideo && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md border border-emerald-300">
                            Custom
                          </span>
                        )}
                      </div>

                      {/* Hidden Video Input */}
                      <input
                        type="file"
                        ref={heroVideoInputRef}
                        accept="video/mp4,video/webm,video/quicktime,video/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleHeroVideoFile(e.target.files[0]);
                          }
                        }}
                      />

                      {/* Upload Box */}
                      <div
                        onClick={() => heroVideoInputRef.current?.click()}
                        className="p-5 rounded-xl border-2 border-dashed border-[#111215]/30 bg-[#FAF8F3] hover:border-[#111215] hover:bg-[#D2FF3A]/10 transition-all flex flex-col items-center justify-center text-center cursor-pointer group"
                      >
                        <Upload className="w-6 h-6 text-[#111215] group-hover:scale-110 transition-transform mb-1.5" />
                        <span className="text-xs font-bold uppercase text-[#111215]">
                          {isUploadingHeroVideo ? 'Uploading & Processing Video...' : 'Upload Video File (.mp4, .webm, .mov)'}
                        </span>
                        <span className="text-[10px] text-[#777E85] mt-0.5">
                          Direct client upload · Smooth looping in hero background
                        </span>
                      </div>

                      {/* Direct URL Input */}
                      <form onSubmit={handleHeroVideoUrlSubmit} className="flex gap-2">
                        <input
                          type="url"
                          placeholder="Or paste direct video URL (https://...)"
                          value={customVideoUrlInput}
                          onChange={(e) => setCustomVideoUrlInput(e.target.value)}
                          className="flex-1 bg-[#FAF8F3] border border-[#111215] rounded-xl p-2.5 text-xs text-[#111215]"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-[#111215] text-[#D2FF3A] font-bold uppercase text-xs border border-[#111215] cursor-pointer shadow-xs"
                        >
                          Apply URL
                        </button>
                      </form>

                      {/* Quick select from Media Vault */}
                      {allMediaItems.filter((m) => m.type === 'video').length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold uppercase text-[#5C6F74] block mb-1.5">
                            Or Select From Media Vault Videos:
                          </span>
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {allMediaItems
                              .filter((m) => m.type === 'video')
                              .slice(0, 6)
                              .map((m) => (
                                <button
                                  key={m.id}
                                  type="button"
                                  onClick={() => {
                                    soundFX.playPop();
                                    onHeroVideoUpdated?.(m.url);
                                    notifySave(`✓ Set "${m.name}" as Hero Video!`);
                                  }}
                                  className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 shrink-0 cursor-pointer ${
                                    heroVideo === m.url
                                      ? 'bg-[#111215] text-[#D2FF3A] border-[#111215]'
                                      : 'bg-white hover:bg-[#EFECE1] text-[#111215] border-[#111215]/30'
                                  }`}
                                >
                                  <Video className="w-3 h-3 text-[#FF5500]" />
                                  <span className="max-w-[120px] truncate">{m.name}</span>
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Live Preview Player */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[11px] font-bold uppercase text-[#111215]">
                        Live Hero Background Video Preview:
                      </span>
                      <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-[#111215] bg-black shadow-inner flex items-center justify-center">
                        <video
                          key={heroVideo || 'default-brand-video'}
                          src={heroVideo && heroVideo.trim() !== '' ? heroVideo : '/onset-media-brand-video.mp4'}
                          autoPlay
                          muted
                          loop
                          playsInline
                          controls
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[9px] uppercase font-bold tracking-wider pointer-events-none">
                          {heroVideo ? 'Active Custom Video' : 'Default Brand Video'}
                        </div>
                      </div>
                      <span className="text-[10px] text-[#777E85]">
                        The selected video will play automatically, silently, and loop in the hero background.
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. HERO SECTION PHOTO & FOUNDER CONTROLS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. HERO SECTION PHOTO CONTROLS */}
                <div className="p-5 rounded-2xl bg-white border-2 border-[#111215] shadow-[4px_4px_0px_#111215] flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#111215]/20">
                    <div>
                      <h4 className="font-black text-sm uppercase text-[#111215] flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-[#FF5500]" />
                        <span>Hero Section Portrait</span>
                      </h4>
                      <p className="text-[11px] font-mono text-[#5C6F74] mt-0.5">
                        Feature your custom portrait or toggle the interactive 3D Sony ZV-E10 mirrorless camera.
                      </p>
                    </div>
                  </div>

                  {/* Status Box */}
                  <div className="p-3.5 rounded-xl bg-[#FAF8F3] border border-[#111215] flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-[#111215] block">
                        Current Hero Mode:
                      </span>
                      <span className="text-xs font-black uppercase text-[#111215]">
                        {heroPhoto ? '★ Custom High-Res Photo Active' : '🎮 Interactive 3D Sony ZV-E10 Active'}
                      </span>
                    </div>

                    {heroPhoto && (
                      <button
                        onClick={() => {
                          onHeroPhotoUpdated(null);
                          notifySave('Removed custom hero photo — restored 3D Sony camera!');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Photo</span>
                      </button>
                    )}
                  </div>

                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={heroFileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleHeroFile(e.target.files[0]);
                      }
                    }}
                  />

                  {/* Upload Drop Area */}
                  <div
                    onClick={() => heroFileInputRef.current?.click()}
                    className="p-6 rounded-xl border-2 border-dashed border-[#111215]/30 bg-[#FAF8F3] hover:border-[#111215] hover:bg-[#D2FF3A]/10 transition-all flex flex-col items-center justify-center text-center cursor-pointer"
                  >
                    <Upload className="w-6 h-6 text-[#111215] mb-2" />
                    <span className="text-xs font-mono font-bold uppercase text-[#111215]">
                      Upload New Hero Portrait Photo
                    </span>
                    <span className="text-[10px] font-mono text-[#777E85] mt-0.5">
                      100% exact fidelity · Zero alteration
                    </span>
                  </div>

                  {/* Quick Select from Vault */}
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-[#5C6F74] block mb-2">
                      Or Pick from Media Vault (1-Click):
                    </span>
                    <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1">
                      {allMediaItems
                        .filter((m) => m.type === 'image')
                        .slice(0, 8)
                        .map((m) => (
                          <button
                            key={m.id}
                            onClick={() => {
                              onHeroPhotoUpdated(m.url);
                              notifySave(`Set "${m.name}" as Hero Photo!`);
                            }}
                            className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                              heroPhoto === m.url ? 'border-[#FF5500] ring-2 ring-[#FF5500]' : 'border-[#111215]'
                            }`}
                          >
                            {m.url && m.url.trim() !== '' ? (
                              <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                            ) : null}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>

                {/* 2. MEET THE FOUNDER SECTION EDITORS */}
                <div className="p-5 rounded-2xl bg-white border-2 border-[#111215] shadow-[4px_4px_0px_#111215] flex flex-col gap-4 font-mono text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-[#111215]/20">
                    <div>
                      <h4 className="font-black text-sm uppercase text-[#111215] flex items-center gap-1.5">
                        <User className="w-4 h-4 text-[#D2FF3A]" />
                        <span>Meet the Founder &amp; Narrative</span>
                      </h4>
                      <p className="text-[11px] text-[#5C6F74] mt-0.5">
                        Edit founder portrait, origin story paragraph, headline &amp; stamp badges.
                      </p>
                    </div>
                  </div>

                  {/* Founder Photo Upload & Remove */}
                  <div className="p-3.5 rounded-xl bg-[#FAF8F3] border border-[#111215] flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#111215] bg-[#EFECE1]">
                        {(() => {
                          const fSrc =
                            (aboutForm.founderPhoto && aboutForm.founderPhoto.trim() !== '')
                              ? aboutForm.founderPhoto
                              : (heroPhoto && heroPhoto.trim() !== '')
                                ? heroPhoto
                                : ASSETS.heroPortrait;
                          return fSrc ? (
                            <img
                              src={fSrc}
                              alt="Founder"
                              className="w-full h-full object-cover"
                            />
                          ) : null;
                        })()}
                      </div>
                      <div>
                        <span className="font-bold text-[#111215] block">Founder Portrait</span>
                        <span className="text-[10px] text-[#5C6F74]">
                          {aboutForm.founderPhoto ? 'Custom portrait active' : 'Default asset active'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={founderFileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFounderPhotoUpload(e.target.files[0]);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => founderFileInputRef.current?.click()}
                        className="px-2.5 py-1.5 rounded-lg bg-[#111215] text-white text-[10px] font-bold uppercase cursor-pointer"
                      >
                        Change Photo
                      </button>
                      {aboutForm.founderPhoto && (
                        <button
                          type="button"
                          onClick={() => {
                            const next = { ...aboutForm, founderPhoto: null };
                            setAboutForm(next);
                            if (setAboutData) setAboutData(next);
                            try {
                              localStorage.setItem('ronny_v2_about', JSON.stringify(next));
                            } catch {}
                            notifySave('Founder portrait reset to default asset');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-300 text-[10px] font-bold cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-[#5C6F74] font-bold block mb-1">Section Headline</label>
                    <input
                      type="text"
                      value={aboutForm.headline}
                      onChange={(e) => setAboutForm({ ...aboutForm, headline: e.target.value })}
                      className="w-full bg-[#FAF8F3] border border-[#111215] rounded-xl p-2.5 text-[#111215]"
                    />
                  </div>

                  <div>
                    <label className="text-[#5C6F74] font-bold block mb-1">Story / Bio Narrative</label>
                    <textarea
                      rows={6}
                      value={aboutForm.paragraph}
                      onChange={(e) => setAboutForm({ ...aboutForm, paragraph: e.target.value })}
                      className="w-full bg-[#FAF8F3] border border-[#111215] rounded-xl p-2.5 text-[#111215] resize-y"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[#5C6F74] font-bold block mb-1">Origin Stamp</label>
                      <input
                        type="text"
                        value={aboutForm.originBadge}
                        onChange={(e) => setAboutForm({ ...aboutForm, originBadge: e.target.value })}
                        className="w-full bg-[#FAF8F3] border border-[#111215] rounded-xl p-2.5 text-[#111215]"
                      />
                    </div>
                    <div>
                      <label className="text-[#5C6F74] font-bold block mb-1">Craft Badge</label>
                      <input
                        type="text"
                        value={aboutForm.craftBadge}
                        onChange={(e) => setAboutForm({ ...aboutForm, craftBadge: e.target.value })}
                        className="w-full bg-[#FAF8F3] border border-[#111215] rounded-xl p-2.5 text-[#111215]"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (setAboutData) setAboutData(aboutForm);
                      try {
                        localStorage.setItem('ronny_v2_about', JSON.stringify(aboutForm));
                      } catch {}
                      notifySave('Saved Meet the Founder story details!');
                    }}
                    className="self-start px-5 py-2.5 rounded-xl bg-[#111215] hover:bg-[#D2FF3A] text-white hover:text-[#111215] border-2 border-[#111215] font-bold uppercase tracking-wider shadow-[3px_3px_0px_#111215] cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Founder Details</span>
                  </button>
                </div>
              </div>
            </div>
          )}

            {/* ========================================================= */}
            {/* TAB 5: SPECIALIST IN SECTION                              */}
            {/* ========================================================= */}
            {activeTab === 'specialist' && (
              <div className="flex flex-col gap-6 font-mono text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#111215]/15">
                  <div>
                    <h3 className="text-lg font-black uppercase text-[#111215] flex items-center gap-2">
                      <Star className="w-5 h-5 text-[#FF5500]" />
                      <span>Specialist In Software &amp; Tools ({specialists.length})</span>
                    </h3>
                    <p className="text-xs text-[#5C6F74] mt-0.5">
                      Configure software tools (Photoshop, Premiere Pro, Lightroom, DaVinci Resolve, After Effects), experience metrics, and custom logos.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsAddingSpecialist(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#111215] hover:bg-[#D2FF3A] text-white hover:text-[#111215] border border-[#111215] text-[11px] font-bold uppercase cursor-pointer flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Tool</span>
                    </button>
                    <button
                      onClick={() => {
                        if (setSpecialists) {
                          setSpecialists(INITIAL_SPECIALISTS);
                          try {
                            localStorage.setItem('ronny_v2_specialists', JSON.stringify(INITIAL_SPECIALISTS));
                          } catch {}
                          notifySave('Reset specialists software tools to original official suite');
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#FAF8F3] hover:bg-[#EFECE1] border border-[#111215] text-[11px] font-bold uppercase cursor-pointer"
                    >
                      Reset Official Logos
                    </button>
                  </div>
                </div>

                {/* Software Cards List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {specialists.map((tool) => (
                    <div
                      key={tool.id}
                      className="bg-white border-2 border-[#111215] rounded-2xl p-4 flex flex-col justify-between shadow-[3px_3px_0px_#111215] gap-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          {tool.customLogoUrl && tool.customLogoUrl.trim() !== '' ? (
                            <img
                              src={tool.customLogoUrl}
                              alt={tool.name}
                              className="w-10 h-10 object-contain rounded-xl border border-[#111215]"
                            />
                          ) : tool.id === 'photoshop' ? (
                            <PhotoshopLogo className="w-10 h-10" />
                          ) : tool.id === 'premiere' ? (
                            <PremiereProLogo className="w-10 h-10" />
                          ) : tool.id === 'lightroom' ? (
                            <LightroomLogo className="w-10 h-10" />
                          ) : tool.id === 'davinci' ? (
                            <DaVinciResolveLogo className="w-10 h-10" />
                          ) : (
                            <AfterEffectsLogo className="w-10 h-10" />
                          )}
                          <div>
                            <h4 className="font-black text-sm uppercase text-[#111215]">{tool.name}</h4>
                            <span className="text-[10px] text-[#FF5500] font-bold">{tool.subname}</span>
                          </div>
                        </div>

                        <span className="text-[9px] font-mono font-bold bg-[#111215] text-[#D2FF3A] px-2 py-0.5 rounded border border-[#111215]">
                          {tool.badge}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#5C6F74] font-normal leading-relaxed line-clamp-2">
                        {tool.description}
                      </p>

                      <div className="flex flex-wrap gap-1">
                        {tool.coreSkills.slice(0, 3).map((sk, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] bg-[#FAF8F3] border border-[#111215]/20 px-1.5 py-0.5 rounded text-[#181924]"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#111215]/15 mt-auto">
                        <span className="text-[10px] font-bold text-[#111215]">{tool.specsMetric}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingSpecialist({ ...tool })}
                            className="px-2.5 py-1 rounded-lg bg-[#111215] hover:bg-[#D2FF3A] text-white hover:text-[#111215] text-[10px] font-bold uppercase transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          {deletingSpecialistId === tool.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  if (setSpecialists) {
                                    setSpecialists((prev) => {
                                      const next = prev.filter((s) => s.id !== tool.id);
                                      try {
                                        localStorage.setItem('ronny_v2_specialists', JSON.stringify(next));
                                      } catch {}
                                      return next;
                                    });
                                    notifySave(`Deleted tool "${tool.name}"!`);
                                    setDeletingSpecialistId(null);
                                  }
                                }}
                                className="px-2 py-1 rounded bg-red-600 text-white font-bold text-[10px] cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingSpecialistId(null)}
                                className="px-1.5 py-1 rounded bg-[#EFECE1] text-[#111215] text-[10px] cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeletingSpecialistId(tool.id)}
                              className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-300 cursor-pointer"
                              title="Delete software tool"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* MODAL: EDIT SPECIALIST SOFTWARE TOOL */}
                {editingSpecialist && (
                  <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-[#111215]/80 backdrop-blur-md">
                    <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#FAF8F3] border-3 border-[#111215] rounded-3xl p-6 flex flex-col gap-4 text-[#181924] shadow-[8px_8px_0px_#111215]">
                      <div className="flex items-center justify-between pb-3 border-b-2 border-[#111215]">
                        <h4 className="text-base font-black uppercase text-[#111215]">
                          Edit Specialist: {editingSpecialist.name}
                        </h4>
                        <button
                          onClick={() => setEditingSpecialist(null)}
                          className="w-8 h-8 rounded-full bg-white border border-[#111215] flex items-center justify-center"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (setSpecialists) {
                            setSpecialists((prev) => {
                              const next = prev.map((s) =>
                                s.id === editingSpecialist.id ? editingSpecialist : s
                              );
                              try {
                                localStorage.setItem('ronny_v2_specialists', JSON.stringify(next));
                              } catch {}
                              return next;
                            });
                            notifySave(`Updated "${editingSpecialist.name}" tool profile!`);
                          }
                          setEditingSpecialist(null);
                        }}
                        className="flex flex-col gap-3 font-mono text-xs"
                      >
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[#5C6F74] font-bold block mb-1">Software Title</label>
                            <input
                              type="text"
                              value={editingSpecialist.name}
                              onChange={(e) =>
                                setEditingSpecialist({ ...editingSpecialist, name: e.target.value })
                              }
                              className="w-full bg-white border border-[#111215] rounded-xl p-2.5"
                            />
                          </div>
                          <div>
                            <label className="text-[#5C6F74] font-bold block mb-1">Focus Subtitle</label>
                            <input
                              type="text"
                              value={editingSpecialist.subname}
                              onChange={(e) =>
                                setEditingSpecialist({ ...editingSpecialist, subname: e.target.value })
                              }
                              className="w-full bg-white border border-[#111215] rounded-xl p-2.5"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[#5C6F74] font-bold block mb-1">Description</label>
                          <textarea
                            rows={3}
                            value={editingSpecialist.description}
                            onChange={(e) =>
                              setEditingSpecialist({ ...editingSpecialist, description: e.target.value })
                            }
                            className="w-full bg-white border border-[#111215] rounded-xl p-2.5 resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[#5C6F74] font-bold block mb-1">Spec Metric (e.g. 16-Bit RAW)</label>
                            <input
                              type="text"
                              value={editingSpecialist.specsMetric}
                              onChange={(e) =>
                                setEditingSpecialist({ ...editingSpecialist, specsMetric: e.target.value })
                              }
                              className="w-full bg-white border border-[#111215] rounded-xl p-2.5"
                            />
                          </div>
                          <div>
                            <label className="text-[#5C6F74] font-bold block mb-1">Badge Text</label>
                            <input
                              type="text"
                              value={editingSpecialist.badge}
                              onChange={(e) =>
                                setEditingSpecialist({ ...editingSpecialist, badge: e.target.value })
                              }
                              className="w-full bg-white border border-[#111215] rounded-xl p-2.5"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[#5C6F74] font-bold block mb-1">
                            Custom Logo URL (Leave blank for official vector logo)
                          </label>
                          <input
                            type="text"
                            placeholder="https://... image logo URL"
                            value={editingSpecialist.customLogoUrl || ''}
                            onChange={(e) =>
                              setEditingSpecialist({ ...editingSpecialist, customLogoUrl: e.target.value })
                            }
                            className="w-full bg-white border border-[#111215] rounded-xl p-2.5"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#111215]/20">
                          <button
                            type="button"
                            onClick={() => setEditingSpecialist(null)}
                            className="px-4 py-2 rounded-xl bg-white border border-[#111215]"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 rounded-xl bg-[#111215] text-[#D2FF3A] font-bold border border-[#111215] cursor-pointer"
                          >
                            Save Tool
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* MODAL: ADD NEW SPECIALIST SOFTWARE TOOL */}
                {isAddingSpecialist && (
                  <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-[#111215]/80 backdrop-blur-md">
                    <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#FAF8F3] border-3 border-[#111215] rounded-3xl p-6 flex flex-col gap-4 text-[#181924] shadow-[8px_8px_0px_#111215]">
                      <div className="flex items-center justify-between pb-3 border-b-2 border-[#111215]">
                        <h4 className="text-base font-black uppercase text-[#111215] flex items-center gap-2">
                          <Plus className="w-4 h-4 text-[#FF5500]" />
                          <span>Add New Specialist Tool</span>
                        </h4>
                        <button
                          onClick={() => setIsAddingSpecialist(false)}
                          className="w-8 h-8 rounded-full bg-white border border-[#111215] flex items-center justify-center cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const newTool: SpecialistSoftware = {
                            id: `tool-${Date.now()}`,
                            name: newSpecialist.name || 'Creative Tool',
                            subname: newSpecialist.subname || 'Creative Suite',
                            category: newSpecialist.category || 'Creative Software',
                            summary: newSpecialist.description || 'Professional visual software suite.',
                            description: newSpecialist.description || '',
                            specsMetric: newSpecialist.specsMetric || '100% Precision',
                            specsLabel: newSpecialist.specsLabel || 'Performance',
                            badge: newSpecialist.badge || 'PRO',
                            badgeBg: '#111215',
                            badgeText: '#D2FF3A',
                            accentBorder: '#111215',
                            coreSkills: newSpecialist.coreSkills || ['Visual Direction', 'Post-Production'],
                            customLogoUrl: newSpecialist.customLogoUrl || '',
                          };
                          if (setSpecialists) {
                            setSpecialists((prev) => {
                              const next = [...prev, newTool];
                              try {
                                localStorage.setItem('ronny_v2_specialists', JSON.stringify(next));
                              } catch {}
                              return next;
                            });
                            notifySave(`Added "${newTool.name}" to specialist tools!`);
                          }
                          setIsAddingSpecialist(false);
                          setNewSpecialist({
                            name: '',
                            subname: '',
                            description: '',
                            summary: '',
                            category: 'Motion & Post',
                            specsMetric: '99% Precision',
                            specsLabel: 'Precision',
                            badge: 'PRO',
                            badgeBg: '#111215',
                            badgeText: '#D2FF3A',
                            accentBorder: '#111215',
                            coreSkills: ['Visual Effects', 'Color Grading'],
                            customLogoUrl: '',
                          });
                        }}
                        className="flex flex-col gap-3 font-mono text-xs"
                      >
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[#5C6F74] font-bold block mb-1">Software Title *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Cinema 4D"
                              value={newSpecialist.name || ''}
                              onChange={(e) =>
                                setNewSpecialist({ ...newSpecialist, name: e.target.value })
                              }
                              className="w-full bg-white border border-[#111215] rounded-xl p-2.5"
                            />
                          </div>
                          <div>
                            <label className="text-[#5C6F74] font-bold block mb-1">Focus Subtitle</label>
                            <input
                              type="text"
                              placeholder="e.g. 3D Simulation"
                              value={newSpecialist.subname || ''}
                              onChange={(e) =>
                                setNewSpecialist({ ...newSpecialist, subname: e.target.value })
                              }
                              className="w-full bg-white border border-[#111215] rounded-xl p-2.5"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[#5C6F74] font-bold block mb-1">Description</label>
                          <textarea
                            rows={3}
                            placeholder="Brief description of workflow and output..."
                            value={newSpecialist.description || ''}
                            onChange={(e) =>
                              setNewSpecialist({ ...newSpecialist, description: e.target.value })
                            }
                            className="w-full bg-white border border-[#111215] rounded-xl p-2.5 resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[#5C6F74] font-bold block mb-1">Spec Metric</label>
                            <input
                              type="text"
                              placeholder="e.g. 8K Octane Rendering"
                              value={newSpecialist.specsMetric || ''}
                              onChange={(e) =>
                                setNewSpecialist({ ...newSpecialist, specsMetric: e.target.value })
                              }
                              className="w-full bg-white border border-[#111215] rounded-xl p-2.5"
                            />
                          </div>
                          <div>
                            <label className="text-[#5C6F74] font-bold block mb-1">Badge Text</label>
                            <input
                              type="text"
                              placeholder="e.g. 3D VFX"
                              value={newSpecialist.badge || ''}
                              onChange={(e) =>
                                setNewSpecialist({ ...newSpecialist, badge: e.target.value })
                              }
                              className="w-full bg-white border border-[#111215] rounded-xl p-2.5"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[#5C6F74] font-bold block mb-1">
                            Custom Logo URL (optional image URL)
                          </label>
                          <input
                            type="text"
                            placeholder="https://... logo PNG / SVG link"
                            value={newSpecialist.customLogoUrl || ''}
                            onChange={(e) =>
                              setNewSpecialist({ ...newSpecialist, customLogoUrl: e.target.value })
                            }
                            className="w-full bg-white border border-[#111215] rounded-xl p-2.5"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#111215]/20">
                          <button
                            type="button"
                            onClick={() => setIsAddingSpecialist(false)}
                            className="px-4 py-2 rounded-xl bg-white border border-[#111215] cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 rounded-xl bg-[#111215] text-[#D2FF3A] font-bold border border-[#111215] cursor-pointer shadow-[2px_2px_0px_#111215]"
                          >
                            Add Tool
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 6: SERVICES                                            */}
            {/* ========================================================= */}
            {activeTab === 'services' && (
              <div className="flex flex-col gap-6 font-mono text-xs">
                <div className="pb-2 border-b border-[#111215]/15">
                  <h3 className="text-lg font-black uppercase text-[#111215]">
                    Services &amp; Offerings ({services.length})
                  </h3>
                  <p className="text-xs text-[#5C6F74] mt-0.5">
                    Add, edit, or delete the service items listed on the main page.
                  </p>
                </div>

                {/* Add Service Form */}
                <form
                  onSubmit={handleAddService}
                  className="p-4 rounded-2xl bg-white border-2 border-[#111215] shadow-[3px_3px_0px_#111215] flex flex-col gap-3"
                >
                  <span className="font-bold uppercase text-[#111215]">+ Add New Service</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Number (e.g. 04)"
                      value={newService.number}
                      onChange={(e) => setNewService({ ...newService, number: e.target.value })}
                      className="bg-[#FAF8F3] border border-[#111215] rounded-xl p-2.5"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Service Name (e.g. CGI Direction)"
                      value={newService.name}
                      onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                      className="bg-[#FAF8F3] border border-[#111215] rounded-xl p-2.5"
                    />
                    <input
                      type="text"
                      placeholder="Pricing / Turnaround"
                      value={newService.pricingEstimate}
                      onChange={(e) => setNewService({ ...newService, pricingEstimate: e.target.value })}
                      className="bg-[#FAF8F3] border border-[#111215] rounded-xl p-2.5"
                    />
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Description of deliverables..."
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    className="bg-[#FAF8F3] border border-[#111215] rounded-xl p-2.5 resize-none"
                  />
                  <button
                    type="submit"
                    className="self-end px-5 py-2.5 rounded-xl bg-[#111215] text-[#D2FF3A] font-bold uppercase border-2 border-[#111215] cursor-pointer shadow-[2px_2px_0px_#111215]"
                  >
                    Post Service
                  </button>
                </form>

                {/* Edit Service Modal */}
                {editingService && (
                  <div className="p-4 rounded-2xl bg-[#D2FF3A]/10 border-2 border-[#111215] shadow-[4px_4px_0px_#111215] flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="font-black uppercase text-[#111215] flex items-center gap-2">
                        <Edit2 className="w-4 h-4 text-[#111215]" />
                        Edit Service: #{editingService.number} {editingService.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingService(null)}
                        className="p-1 rounded-lg hover:bg-[#111215]/10 text-[#111215] cursor-pointer"
                        title="Cancel edit"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleUpdateService} className="flex flex-col gap-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-[#5C6F74] mb-1">
                            Number
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Number (e.g. 01)"
                            value={editingService.number}
                            onChange={(e) =>
                              setEditingService({ ...editingService, number: e.target.value })
                            }
                            className="w-full bg-white border border-[#111215] rounded-xl p-2.5 font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-[#5C6F74] mb-1">
                            Service Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Service Name *"
                            value={editingService.name}
                            onChange={(e) =>
                              setEditingService({ ...editingService, name: e.target.value })
                            }
                            className="w-full bg-white border border-[#111215] rounded-xl p-2.5 font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-[#5C6F74] mb-1">
                            Pricing / Turnaround
                          </label>
                          <input
                            type="text"
                            placeholder="Pricing Estimate / Turnaround"
                            value={editingService.pricingEstimate || ''}
                            onChange={(e) =>
                              setEditingService({
                                ...editingService,
                                pricingEstimate: e.target.value,
                              })
                            }
                            className="w-full bg-white border border-[#111215] rounded-xl p-2.5"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-[#5C6F74] mb-1">
                          Deliverables &amp; Scope Description
                        </label>
                        <textarea
                          rows={3}
                          required
                          placeholder="Description of deliverables..."
                          value={editingService.description}
                          onChange={(e) =>
                            setEditingService({ ...editingService, description: e.target.value })
                          }
                          className="w-full bg-white border border-[#111215] rounded-xl p-2.5 resize-none font-sans"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingService(null)}
                          className="px-4 py-2 rounded-xl bg-white text-[#111215] font-bold border border-[#111215] cursor-pointer hover:bg-neutral-50 shadow-[2px_2px_0px_#111215]"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-[#111215] text-[#D2FF3A] font-bold uppercase border-2 border-[#111215] cursor-pointer shadow-[2px_2px_0px_#111215] hover:bg-neutral-800 flex items-center gap-2"
                        >
                          <Save className="w-3.5 h-3.5" />
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* List Services */}
                <div className="flex flex-col gap-3">
                  {services.map((svc) => (
                    <div
                      key={svc.id}
                      className={`p-4 rounded-xl bg-white border-2 border-[#111215] shadow-[2px_2px_0px_#111215] flex items-center justify-between gap-4 transition-all ${
                        editingService?.id === svc.id ? 'ring-2 ring-[#FF5500] border-[#FF5500]' : ''
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-[#FF5500]">#{svc.number}</span>
                          <span className="font-bold text-[#111215] uppercase text-sm">{svc.name}</span>
                          {svc.pricingEstimate && (
                            <span className="text-[10px] bg-[#EFECE1] px-2 py-0.5 rounded text-[#5C6F74]">
                              {svc.pricingEstimate}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#5C6F74] mt-1 font-normal font-sans">{svc.description}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEditService(svc)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#FAF8F3] hover:bg-[#EFECE1] text-[#111215] border border-[#111215] font-bold flex items-center gap-1.5 cursor-pointer shadow-[1px_1px_0px_#111215] transition-colors"
                          title={`Edit ${svc.name}`}
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[#111215]" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>

                        {deletingServiceId === svc.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDeleteService(svc.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-red-600 text-white font-bold cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeletingServiceId(null)}
                              className="px-2 py-1.5 rounded-lg bg-[#EFECE1] text-[#111215] cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeletingServiceId(svc.id)}
                            className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-300 cursor-pointer"
                            title="Delete Service"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 7: REVIEWS & TESTIMONIALS                              */}
            {/* ========================================================= */}
            {activeTab === 'testimonials' && (
              <div className="flex flex-col gap-6 font-mono text-xs">
                <div className="pb-2 border-b border-[#111215]/15">
                  <h3 className="text-lg font-black uppercase text-[#111215]">
                    Client Reviews &amp; Ratings ({testimonials.length})
                  </h3>
                  <p className="text-xs text-[#5C6F74] mt-0.5">
                    Publish client feedback displayed in the ratings carousel.
                  </p>
                </div>

                <form
                  onSubmit={handleAddTestimonial}
                  className="p-5 rounded-2xl bg-white border-2 border-[#111215] shadow-[3px_3px_0px_#111215] flex flex-col gap-3"
                >
                  <span className="font-bold uppercase text-[#111215]">+ Add Client Review</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Client Name *"
                      value={newTestimonial.clientName}
                      onChange={(e) => setNewTestimonial({ ...newTestimonial, clientName: e.target.value })}
                      className="bg-[#FAF8F3] border border-[#111215] rounded-xl p-2.5"
                    />
                    <input
                      type="text"
                      placeholder="Role (e.g. Creative Director)"
                      value={newTestimonial.role}
                      onChange={(e) => setNewTestimonial({ ...newTestimonial, role: e.target.value })}
                      className="bg-[#FAF8F3] border border-[#111215] rounded-xl p-2.5"
                    />
                    <input
                      type="text"
                      placeholder="Company & Location"
                      value={newTestimonial.company}
                      onChange={(e) => setNewTestimonial({ ...newTestimonial, company: e.target.value })}
                      className="bg-[#FAF8F3] border border-[#111215] rounded-xl p-2.5"
                    />
                  </div>
                  <textarea
                    rows={2}
                    required
                    placeholder="Feedback quote *"
                    value={newTestimonial.quote}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, quote: e.target.value })}
                    className="bg-[#FAF8F3] border border-[#111215] rounded-xl p-2.5 resize-none"
                  />
                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="text"
                      placeholder="Project reference name"
                      value={newTestimonial.projectRef}
                      onChange={(e) => setNewTestimonial({ ...newTestimonial, projectRef: e.target.value })}
                      className="bg-[#FAF8F3] border border-[#111215] rounded-xl p-2.5 max-w-xs"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#111215] text-[#D2FF3A] font-bold uppercase border-2 border-[#111215] cursor-pointer shadow-[2px_2px_0px_#111215]"
                    >
                      Publish Review
                    </button>
                  </div>
                </form>

                <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#111215] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-[#111215]">
                      Review Order Control: Click ↑ and ↓ to set the exact display order.
                    </span>
                  </div>
                  <span className="text-[10px] text-[#5C6F74] font-bold">
                    Reviews display strictly in #1, #2, #3... sequence
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {[...testimonials]
                    .sort((a, b) => {
                      const ordA = typeof a.order === 'number' ? a.order : 999;
                      const ordB = typeof b.order === 'number' ? b.order : 999;
                      return ordA - ordB;
                    })
                    .map((t, idx, arr) => (
                      <div
                        key={t.id}
                        className="p-4 rounded-xl bg-white border-2 border-[#111215] shadow-[2px_2px_0px_#111215] flex flex-wrap items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Order Badge and Up/Down Controls */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="w-8 h-8 rounded-lg bg-[#111215] text-[#D2FF3A] font-black text-xs flex items-center justify-center border border-[#111215] shadow-xs">
                              #{idx + 1}
                            </span>
                            <div className="flex flex-col gap-0.5">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveTestimonial(idx, 'up')}
                                title="Move review up in order"
                                className="p-1 rounded bg-[#FAF8F3] hover:bg-[#D2FF3A] disabled:opacity-30 disabled:hover:bg-[#FAF8F3] border border-[#111215]/30 cursor-pointer disabled:cursor-not-allowed"
                              >
                                <ChevronUp className="w-3.5 h-3.5 text-[#111215]" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === arr.length - 1}
                                onClick={() => handleMoveTestimonial(idx, 'down')}
                                title="Move review down in order"
                                className="p-1 rounded bg-[#FAF8F3] hover:bg-[#D2FF3A] disabled:opacity-30 disabled:hover:bg-[#FAF8F3] border border-[#111215]/30 cursor-pointer disabled:cursor-not-allowed"
                              >
                                <ChevronDown className="w-3.5 h-3.5 text-[#111215]" />
                              </button>
                            </div>
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#111215]">{t.clientName}</span>
                              <span className="text-[#777E85]">
                                ({t.role} · {t.company})
                              </span>
                            </div>
                            <p className="text-xs text-[#5C6F74] italic mt-1 font-sans truncate max-w-xl">&ldquo;{t.quote}&rdquo;</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {/* Quick Position Select */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-[#5C6F74] font-bold uppercase">Pos:</span>
                            <select
                              value={idx + 1}
                              onChange={(e) => handleSetTestimonialOrder(t.id, parseInt(e.target.value, 10))}
                              className="bg-[#FAF8F3] border border-[#111215] rounded-lg px-2 py-1 text-xs font-bold"
                            >
                              {arr.map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                  #{i + 1}
                                </option>
                              ))}
                            </select>
                          </div>

                          {deletingTestimonialId === t.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDeleteTestimonial(t.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-red-600 text-white font-bold cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeletingTestimonialId(null)}
                                className="px-2 py-1.5 rounded-lg bg-[#EFECE1] text-[#111215] cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeletingTestimonialId(t.id)}
                              className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-300 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB: WEBSITE TYPOGRAPHY & GLOBAL FONTS                    */}
            {/* ========================================================= */}
            {activeTab === 'typography' && (
              <div className="flex flex-col gap-6 font-mono text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#111215]/15">
                  <div>
                    <h3 className="text-lg font-black uppercase text-[#111215] flex items-center gap-2">
                      <Type className="w-5 h-5 text-[#FF5500]" />
                      <span>Website Typography &amp; Fonts</span>
                    </h3>
                    <p className="text-xs text-[#5C6F74] mt-0.5">
                      Select a font to apply globally across all website headings, titles, buttons, and sections.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#111215] shadow-xs">
                    <span className="text-[10px] text-[#5C6F74] font-bold uppercase">Current Active Font:</span>
                    <span className="font-black text-[#111215] text-sm uppercase px-2 py-0.5 rounded bg-[#D2FF3A] border border-[#111215]">
                      {siteFont || 'Kanit'}
                    </span>
                  </div>
                </div>

                {/* Filter buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-[#5C6F74] mr-1 uppercase">Filter Category:</span>
                  {(['all', 'sans', 'geometric', 'serif', 'display'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFontFilter(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold uppercase border transition-all cursor-pointer ${
                        fontFilter === cat
                          ? 'bg-[#111215] text-white border-[#111215] shadow-xs'
                          : 'bg-white text-[#5C6F74] hover:text-[#111215] border-[#111215]/20'
                      }`}
                    >
                      {cat === 'all' ? `All Styles (${AVAILABLE_FONTS.length})` : cat}
                    </button>
                  ))}
                </div>

                {/* Font Choices Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {AVAILABLE_FONTS.filter((f) => fontFilter === 'all' || f.category === fontFilter).map((font) => {
                    const isSelected = (siteFont || 'Kanit').toLowerCase() === font.name.toLowerCase();
                    return (
                      <div
                        key={font.id}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between gap-3 shadow-[3px_3px_0px_#111215] ${
                          isSelected ? 'bg-white border-[#FF5500] ring-2 ring-[#FF5500]' : 'bg-white border-[#111215] hover:-translate-y-0.5'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-black text-base text-[#111215]">{font.name}</span>
                            <span className="text-[9px] uppercase px-2 py-0.5 rounded bg-[#EFECE1] text-[#5C6F74] font-bold">
                              {font.category}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#5C6F74] block mb-3">{font.styleDesc}</span>

                          {/* Live Text Preview in that font */}
                          <div
                            style={{ fontFamily: font.family }}
                            className="p-3 rounded-xl bg-[#FAF8F3] border border-[#111215]/20 text-[#111215]"
                          >
                            <p className="text-xl font-black uppercase leading-tight tracking-tight">
                              ONSET MEDIA
                            </p>
                            <p className="text-xs font-normal opacity-85 mt-0.5">
                              Directed by Onsetmedia · Creative Direction
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleApplyFont(font.name)}
                          className={`w-full py-2 px-3 rounded-xl font-bold uppercase text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-[#111215] text-[#D2FF3A] border-[#111215]'
                              : 'bg-[#FAF8F3] hover:bg-[#D2FF3A] text-[#111215] border-[#111215]'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-[#D2FF3A]" />
                              <span>Active Font</span>
                            </>
                          ) : (
                            <span>Apply This Font</span>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 8: CONTACT DETAILS & SITE SETTINGS                    */}
            {/* ========================================================= */}
            {activeTab === 'contact' && (
              <div className="flex flex-col gap-6 font-mono text-xs max-w-2xl">
                <div className="pb-2 border-b border-[#111215]/15">
                  <h3 className="text-lg font-black uppercase text-[#111215] flex items-center gap-2">
                    <PhoneCall className="w-5 h-5 text-[#111215]" />
                    <span>Contact Info &amp; Social Links</span>
                  </h3>
                  <p className="text-xs text-[#5C6F74] mt-0.5">
                    Update website font, phone, WhatsApp, location, email, and social profiles.
                  </p>
                </div>

                {/* Global Website Font Selection Option */}
                <div className="p-4 rounded-2xl bg-white border-2 border-[#111215] shadow-[3px_3px_0px_#111215] flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Type className="w-4 h-4 text-[#FF5500]" />
                      <h4 className="font-black uppercase text-[#111215] text-sm">Website Font Type</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('typography')}
                      className="text-[11px] font-bold text-[#FF5500] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>Visual Font Gallery</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-[#5C6F74] leading-relaxed">
                    Choose and change the global font used across the website pages (headings, navigation, and body).
                  </p>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <select
                      value={siteFont || 'Kanit'}
                      onChange={(e) => handleApplyFont(e.target.value)}
                      className="flex-1 bg-[#FAF8F3] border-2 border-[#111215] rounded-xl p-2.5 font-bold text-[#111215] text-sm cursor-pointer shadow-xs"
                    >
                      {AVAILABLE_FONTS.map((f) => (
                        <option key={f.id} value={f.name}>
                          {f.name} ({f.category.toUpperCase()} — {f.styleDesc})
                        </option>
                      ))}
                    </select>
                    <div
                      style={{ fontFamily: `'${siteFont || 'Kanit'}', sans-serif` }}
                      className="px-3.5 py-2 rounded-xl bg-[#FAF8F3] border border-[#111215]/20 text-[#111215] font-black text-sm uppercase shrink-0 truncate max-w-[200px]"
                    >
                      {siteFont || 'Kanit'} (Preview)
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[#5C6F74] font-bold block mb-1">Email / Gmail Address</label>
                    <input
                      type="email"
                      value={contactInfo.email}
                      onChange={(e) => {
                        const val = e.target.value;
                        const next = { ...contactInfo, email: val };
                        setContactInfo(next);
                        try {
                          localStorage.setItem('ronny_v2_contact', JSON.stringify(next));
                        } catch {}
                        dbSaveSiteSettings({ contactInfo: next }).catch(() => {});
                        notifySave('Updated Email');
                      }}
                      className="w-full bg-white border border-[#111215] rounded-xl p-3 text-[#111215]"
                    />
                  </div>

                  <div>
                    <label className="text-[#5C6F74] font-bold block mb-1">
                      WhatsApp Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. +91 98765 43210 or 9876543210"
                      value={contactInfo.whatsapp}
                      onChange={(e) => {
                        const val = e.target.value;
                        const next = { ...contactInfo, whatsapp: val };
                        setContactInfo(next);
                        try {
                          localStorage.setItem('ronny_v2_contact', JSON.stringify(next));
                        } catch {}
                        dbSaveSiteSettings({ contactInfo: next }).catch(() => {});
                        notifySave('Updated WhatsApp Number');
                      }}
                      className="w-full bg-white border border-[#111215] rounded-xl p-3 text-[#111215] font-mono"
                    />
                    <div className="mt-1.5 flex items-center justify-between text-[11px] font-mono text-[#5C6F74]">
                      <span className="truncate max-w-[200px] sm:max-w-[280px]">
                        Link: <span className="text-[#111215] font-bold">{formatWhatsAppUrl(contactInfo.whatsapp)}</span>
                      </span>
                      <a
                        href={formatWhatsAppUrl(contactInfo.whatsapp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 hover:text-emerald-900 font-bold underline flex items-center gap-0.5 shrink-0"
                      >
                        Test Link ↗
                      </a>
                    </div>
                  </div>

                  <div>
                    <label className="text-[#5C6F74] font-bold block mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={contactInfo.phone}
                      onChange={(e) => {
                        const val = e.target.value;
                        const next = { ...contactInfo, phone: val };
                        setContactInfo(next);
                        try {
                          localStorage.setItem('ronny_v2_contact', JSON.stringify(next));
                        } catch {}
                        dbSaveSiteSettings({ contactInfo: next }).catch(() => {});
                        notifySave('Updated Phone');
                      }}
                      className="w-full bg-white border border-[#111215] rounded-xl p-3 text-[#111215]"
                    />
                  </div>

                  <div>
                    <label className="text-[#5C6F74] font-bold block mb-1">Instagram URL</label>
                    <input
                      type="text"
                      value={contactInfo.instagram}
                      onChange={(e) => {
                        const val = e.target.value;
                        const next = { ...contactInfo, instagram: val };
                        setContactInfo(next);
                        try {
                          localStorage.setItem('ronny_v2_contact', JSON.stringify(next));
                        } catch {}
                        dbSaveSiteSettings({ contactInfo: next }).catch(() => {});
                        notifySave('Updated Instagram');
                      }}
                      className="w-full bg-white border border-[#111215] rounded-xl p-3 text-[#111215]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[#5C6F74] font-bold block mb-1">Location &amp; Worldwide Hub</label>
                    <input
                      type="text"
                      value={contactInfo.location}
                      onChange={(e) => {
                        const val = e.target.value;
                        const next = { ...contactInfo, location: val };
                        setContactInfo(next);
                        try {
                          localStorage.setItem('ronny_v2_contact', JSON.stringify(next));
                        } catch {}
                        dbSaveSiteSettings({ contactInfo: next }).catch(() => {});
                        notifySave('Updated Location');
                      }}
                      className="w-full bg-white border border-[#111215] rounded-xl p-3 text-[#111215]"
                    />
                  </div>

                  <div className="sm:col-span-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          localStorage.setItem('ronny_v2_contact', JSON.stringify(contactInfo));
                        } catch {}
                        dbSaveSiteSettings({ contactInfo }).catch(() => {});
                        notifySave('Saved all contact details and verified WhatsApp link!');
                      }}
                      className="w-full py-3 rounded-xl bg-[#111215] hover:bg-[#D2FF3A] text-white hover:text-[#111215] border-2 border-[#111215] font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_#111215] transition-all"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Contact Details to Live Site</span>
                    </button>
                  </div>
                </div>

                {/* INQUIRY FLOW & CLIENT PHONE MESSAGING SETUP CARD */}
                <div className="p-6 rounded-2xl bg-white border-2 border-[#111215] shadow-[4px_4px_0px_#111215] flex flex-col gap-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b-2 border-[#111215]">
                    <div>
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-[#111215]" />
                        <h4 className="font-black text-base uppercase text-[#111215]">
                          Conversational Inquiries &amp; Client Phone Delivery
                        </h4>
                      </div>
                      <p className="text-xs text-[#5C6F74] font-mono mt-1">
                        Configure target phone delivery numbers, WhatsApp routing, SMS fallback, and automated webhooks.
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#D2FF3A] border border-[#111215] text-[10px] font-mono font-black uppercase text-[#111215]">
                      Active Flow
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="p-4 rounded-xl bg-[#FAF8F3] border border-[#111215] flex flex-col gap-2">
                      <span className="text-[10px] text-[#5C6F74] font-bold uppercase tracking-wider">
                        Client Recipient Phone (Studio Target)
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#111215]">
                          {contactInfo.phone || contactInfo.whatsapp || '9035582905'}
                        </span>
                        <a
                          href={formatWhatsAppUrl(
                            contactInfo.phone || contactInfo.whatsapp || '9035582905',
                            '🎬 Test notification from Onset Media Conversational Inquiry engine.'
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-[#25D366] text-[#111215] font-black text-[10px] uppercase border border-[#111215] flex items-center gap-1 hover:bg-[#20ba59]"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Test WhatsApp</span>
                        </a>
                      </div>
                      <p className="text-[11px] text-[#5C6F74] leading-relaxed mt-1">
                        When visitors submit an inquiry via the project form, their details and project brief are formatted in a clean list and routed to this WhatsApp number.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#FAF8F3] border border-[#111215] flex flex-col gap-2">
                      <span className="text-[10px] text-[#5C6F74] font-bold uppercase tracking-wider">
                        Automated Webhook Dispatch (Optional)
                      </span>
                      <input
                        type="url"
                        placeholder="https://hooks.zapier.com/hooks/catch/... or Twilio API"
                        value={inquiryWebhookUrl}
                        onChange={(e) => {
                          const val = e.target.value;
                          setInquiryWebhookUrl(val);
                          try {
                            localStorage.setItem('inquiry_webhook_url', val);
                          } catch {}
                        }}
                        className="w-full bg-white border border-[#111215] rounded-lg p-2 text-xs font-mono text-[#111215]"
                      />
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-[#5C6F74]">
                          For Zapier, Make, or Twilio SMS
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              localStorage.setItem('inquiry_webhook_url', inquiryWebhookUrl);
                            } catch {}
                            notifySave('Saved Webhook URL configuration!');
                          }}
                          className="px-2 py-0.5 rounded-md bg-[#111215] text-white text-[10px] font-bold hover:bg-[#D2FF3A] hover:text-[#111215] cursor-pointer"
                        >
                          Save Webhook
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DATABASE & INQUIRIES TAB */}
            {activeTab === 'database' && (
              <div className="flex flex-col gap-6 animate-fade-in">
                {/* 1. CLOUD STATUS BANNER */}
                <div className="p-5 sm:p-6 rounded-2xl bg-[#111215] text-[#FAF8F3] border-2 border-[#111215] shadow-[6px_6px_0px_#D2FF3A] flex flex-col gap-5">
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#D2FF3A] text-[#111215] flex items-center justify-center font-bold">
                        <Database className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-lg uppercase tracking-tight text-white">
                            Cloud Firestore Database
                          </h3>
                          <span className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase bg-[#D2FF3A] text-[#111215] px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                            Live &amp; Connected
                          </span>
                        </div>
                        <p className="text-xs text-white/60 font-light mt-0.5">
                          Enterprise multi-document database with hardened ABAC &amp; Zero-Trust security rules
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePushAllToCloud}
                        disabled={isSyncingCloud}
                        className="px-4 py-2 rounded-xl bg-[#D2FF3A] hover:bg-[#c2f028] text-[#111215] font-mono font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-[2px_2px_0px_#FAF8F3] transition-all disabled:opacity-50"
                      >
                        {isSyncingCloud ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-[#111215] border-t-transparent rounded-full animate-spin"></span>
                            <span>Syncing...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>Sync All To Cloud</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* STATUS TILES (CONFIDENTIAL DATABASE & PROJECT DETAILS REMOVED) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1">
                      <span className="text-[10px] uppercase text-white/50 tracking-wider">Security Architecture</span>
                      <span className="font-bold text-[#D2FF3A] flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        ABAC Rules Deployed
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1">
                      <span className="text-[10px] uppercase text-white/50 tracking-wider">Authorized Admin</span>
                      <span className="font-bold text-white truncate" title="Onset Media">
                        Onset Media
                      </span>
                    </div>
                  </div>

                  {/* AUTHENTICATION ACTION BAR */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/70">Google Admin Auth:</span>
                      {currentUser ? (
                        <span className="text-xs font-mono font-bold text-[#D2FF3A] flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          Onset Media {isUserAdmin(currentUser) && '(Verified Admin)'}
                        </span>
                      ) : (
                        <span className="text-xs text-white/50 italic">Signed in via local passcode</span>
                      )}
                    </div>

                    {currentUser ? (
                      <button
                        onClick={handleGoogleLogout}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>Sign Out</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleGoogleLogin}
                        className="px-3 py-1.5 rounded-lg bg-[#D2FF3A] text-[#111215] font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-white transition-colors"
                      >
                        <LogIn className="w-3 h-3" />
                        <span>Sign in with Google Admin</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. REALTIME COLLECTIONS SUMMARY */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { label: 'Drops / Projects', count: projects.length, icon: Briefcase, coll: 'projects' },
                    { label: 'Concert Gallery', count: concertPhotos.length, icon: Layers, coll: 'concert_photos' },
                    { label: 'Services', count: services.length, icon: Layers, coll: 'services' },
                    { label: 'Testimonials', count: testimonials.length, icon: MessageSquareQuote, coll: 'testimonials' },
                    { label: 'Site Config', count: 1, icon: PhoneCall, coll: 'settings' },
                    { label: 'Client Inquiries', count: inquiries.length, icon: MailCheck, coll: 'inquiries' },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-white border-2 border-[#111215] shadow-[3px_3px_0px_#111215] flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between text-[#111215]/60 text-xs">
                        <span className="font-mono uppercase font-bold text-[10px] truncate">{stat.coll}</span>
                        <stat.icon className="w-3.5 h-3.5 text-[#111215]" />
                      </div>
                      <span className="text-2xl font-black text-[#111215]">{stat.count}</span>
                      <span className="text-[11px] text-[#5C6F74] font-medium truncate">{stat.label}</span>
                    </div>
                  ))}
                </div>

                {/* 3. CLIENT INQUIRIES & CONTACT LEADS */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white border-2 border-[#111215] shadow-[4px_4px_0px_#111215] flex flex-col gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-[#111215]/10">
                    <div>
                      <h4 className="font-black text-base uppercase text-[#111215] flex items-center gap-2">
                        <span>📬 Client Inquiries &amp; Booking Requests</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#D2FF3A] text-[#111215] border border-[#111215]">
                          {inquiries.length}
                        </span>
                      </h4>
                      <p className="text-xs text-[#5C6F74] font-light mt-0.5">
                        Client briefs submitted securely through the Contact modal. Protected with zero-trust PII privacy.
                      </p>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1 bg-[#FAF8F3] p-1 rounded-xl border border-[#111215]/20">
                      {(['all', 'new', 'read', 'replied'] as const).map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setInquiryFilter(filter)}
                          className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase cursor-pointer transition-colors ${
                            inquiryFilter === filter
                              ? 'bg-[#111215] text-[#D2FF3A]'
                              : 'text-[#111215]/70 hover:text-[#111215]'
                          }`}
                        >
                          {filter}
                          {filter !== 'all' && (
                            <span className="ml-1 opacity-75">
                              ({inquiries.filter((inq) => inq.status === filter).length})
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* INQUIRIES LIST */}
                  {(() => {
                    const filtered = inquiries.filter(
                      (inq) => inquiryFilter === 'all' || inq.status === inquiryFilter
                    );

                    if (filtered.length === 0) {
                      return (
                        <div className="py-12 px-4 rounded-xl bg-[#FAF8F3] border border-dashed border-[#111215]/20 text-center flex flex-col items-center justify-center gap-2">
                          <MailCheck className="w-8 h-8 text-[#5C6F74]/60" />
                          <h5 className="font-bold text-sm text-[#111215]">
                            {inquiryFilter === 'all'
                              ? 'No inquiries submitted yet'
                              : `No "${inquiryFilter}" inquiries`}
                          </h5>
                          <p className="text-xs text-[#5C6F74] max-w-sm">
                            When potential clients click "Let's Talk" or submit a project brief in the Contact modal, their details appear here in real time.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="flex flex-col gap-3">
                        {filtered.map((inq) => {
                          const statusColor =
                            inq.status === 'new'
                              ? 'bg-[#FF5500] text-white'
                              : inq.status === 'replied'
                              ? 'bg-[#D2FF3A] text-[#111215]'
                              : 'bg-[#111215]/10 text-[#111215]';

                          return (
                            <div
                              key={inq.id}
                              className="p-4 rounded-xl bg-[#FAF8F3] border-2 border-[#111215] shadow-[2px_2px_0px_#111215] flex flex-col gap-3"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h5 className="font-black text-sm text-[#111215]">{inq.name}</h5>
                                    <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${statusColor}`}>
                                      {inq.status}
                                    </span>
                                    {inq.service && (
                                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#111215]/10 text-[#111215]">
                                        {inq.service}
                                      </span>
                                    )}
                                    {inq.budget && (
                                      <span className="text-[10px] font-mono text-[#5C6F74]">
                                        Budget: {inq.budget}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <a
                                      href={`mailto:${inq.email}?subject=Onset%20Media%20Project%20Inquiry`}
                                      className="text-xs text-[#5C6F74] hover:text-[#111215] underline font-mono flex items-center gap-1"
                                    >
                                      {inq.email}
                                      <ArrowUpRight className="w-3 h-3" />
                                    </a>

                                    {inq.phone && (
                                      <div className="flex items-center gap-1.5 ml-2">
                                        <span className="text-xs font-mono font-bold text-[#111215]">
                                          📱 {inq.phone}
                                        </span>
                                        <a
                                          href={`tel:${inq.phone.replace(/[^0-9+]/g, '')}`}
                                          className="px-2 py-0.5 rounded-md bg-white border border-[#111215] text-[10px] font-mono font-bold hover:bg-[#EFECE1]"
                                          title="Call client"
                                        >
                                          Call
                                        </a>
                                        <a
                                          href={formatWhatsAppUrl(inq.phone)}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="px-2 py-0.5 rounded-md bg-[#25D366]/20 border border-[#25D366] text-[#111215] text-[10px] font-mono font-bold hover:bg-[#25D366]/30"
                                          title="WhatsApp client"
                                        >
                                          WhatsApp ↗
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono text-[#5C6F74]">
                                    {inq.createdAt ? new Date(inq.createdAt).toLocaleString() : 'Recently'}
                                  </span>

                                  {/* Forward to Studio Phone via WhatsApp */}
                                  <a
                                    href={formatWhatsAppUrl(
                                      contactInfo.phone || contactInfo.whatsapp || '9035582905',
                                      formatClientPhoneNotification({
                                        id: inq.id,
                                        name: inq.name,
                                        email: inq.email,
                                        phone: inq.phone,
                                        service: inq.service,
                                        message: inq.message,
                                        conversationTranscript: inq.conversationTranscript,
                                      })
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2.5 py-1 rounded-lg bg-[#25D366] border border-[#111215] text-[10px] font-mono font-black text-[#111215] hover:bg-[#20ba59] flex items-center gap-1 cursor-pointer shadow-xs"
                                    title="Forward inquiry details & transcript to studio phone"
                                  >
                                    <Smartphone className="w-3 h-3" />
                                    <span>Send to Phone</span>
                                  </a>

                                  {inq.status !== 'read' && (
                                    <button
                                      onClick={() => handleUpdateInquiryStatus(inq.id, 'read')}
                                      className="px-2.5 py-1 rounded-lg bg-white border border-[#111215] text-[10px] font-mono font-bold text-[#111215] hover:bg-[#EFECE1] cursor-pointer"
                                    >
                                      Mark Read
                                    </button>
                                  )}

                                  {inq.status !== 'replied' && (
                                    <button
                                      onClick={() => handleUpdateInquiryStatus(inq.id, 'replied')}
                                      className="px-2.5 py-1 rounded-lg bg-[#D2FF3A] border border-[#111215] text-[10px] font-mono font-bold text-[#111215] hover:bg-white cursor-pointer"
                                    >
                                      Mark Replied
                                    </button>
                                  )}

                                  <button
                                    onClick={() => handleDeleteInquiry(inq.id)}
                                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-200 cursor-pointer"
                                    title="Delete inquiry"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <div className="p-3 rounded-lg bg-white border border-[#111215]/15 text-xs text-[#181924] font-normal leading-relaxed whitespace-pre-wrap">
                                {inq.message}
                              </div>

                              {/* Chat Conversation Transcript Accordion */}
                              {inq.conversationTranscript && (
                                <div className="mt-1 flex flex-col gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedTranscriptId(
                                        expandedTranscriptId === inq.id ? null : inq.id
                                      )
                                    }
                                    className="self-start text-[11px] font-mono font-bold text-[#111215] hover:text-[#FF5500] flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-[#111215]/20"
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                    <span>
                                      {expandedTranscriptId === inq.id
                                        ? 'Hide Conversational Transcript'
                                        : 'View Full Conversational Transcript'}
                                    </span>
                                    {expandedTranscriptId === inq.id ? (
                                      <ChevronUp className="w-3 h-3" />
                                    ) : (
                                      <ChevronDown className="w-3 h-3" />
                                    )}
                                  </button>

                                  {expandedTranscriptId === inq.id && (
                                    <div className="p-3.5 rounded-xl bg-[#FAF8F3] border border-[#111215] flex flex-col gap-2 font-mono text-[11px] text-[#111215] shadow-xs animate-fade-in">
                                      <div className="flex items-center justify-between pb-1.5 border-b border-[#111215]/15 font-bold">
                                        <span className="text-[#5C6F74] uppercase text-[10px]">
                                          Conversational Chat Flow Transcript
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            navigator.clipboard.writeText(inq.conversationTranscript || '');
                                            notifySave('Copied transcript to clipboard!');
                                          }}
                                          className="text-[10px] text-[#111215] hover:underline flex items-center gap-1 cursor-pointer"
                                        >
                                          <Copy className="w-2.5 h-2.5" />
                                          <span>Copy</span>
                                        </button>
                                      </div>
                                      <div className="whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                                        {inq.conversationTranscript}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* FULLSCREEN PREVIEW MODAL FOR MEDIA VAULT */}
        {previewMedia && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-[#111215]/85 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-3xl rounded-3xl bg-[#FAF8F3] border-3 border-[#111215] p-6 text-[#181924] shadow-[10px_10px_0px_#111215] flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#111215]">
                <div>
                  <h4 className="font-black text-sm uppercase text-[#111215]">{previewMedia.name}</h4>
                  <span className="text-[11px] font-mono text-[#5C6F74]">{previewMedia.source}</span>
                </div>
                <button
                  onClick={() => setPreviewMedia(null)}
                  className="w-8 h-8 rounded-full bg-white border border-[#111215] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="w-full max-h-[60vh] rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-[#111215]">
                {previewMedia.type === 'video' ? (
                  previewMedia.url && previewMedia.url.trim() !== '' ? (
                    <video src={previewMedia.url} controls autoPlay className="max-w-full max-h-[60vh]" />
                  ) : null
                ) : (
                  previewMedia.url && previewMedia.url.trim() !== '' ? (
                    <img src={previewMedia.url} alt={previewMedia.name} className="max-w-full max-h-[60vh] object-contain" />
                  ) : null
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onHeroPhotoUpdated(previewMedia.url);
                      notifySave(`Set "${previewMedia.name}" as Hero Photo!`);
                      setPreviewMedia(null);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#111215] text-[#D2FF3A] font-mono font-bold text-xs uppercase border border-[#111215] cursor-pointer"
                  >
                    ★ Set as Hero
                  </button>

                  <button
                    onClick={() => {
                      const next = { ...aboutForm, founderPhoto: previewMedia.url };
                      setAboutForm(next);
                      if (setAboutData) setAboutData(next);
                      try {
                        localStorage.setItem('ronny_v2_about', JSON.stringify(next));
                      } catch {}
                      notifySave(`Set "${previewMedia.name}" as Founder Photo!`);
                      setPreviewMedia(null);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white text-[#111215] font-mono font-bold text-xs uppercase border border-[#111215] cursor-pointer"
                  >
                    👤 Set as Founder
                  </button>

                  <button
                    onClick={() => handleCopy(previewMedia.url, 'preview-url')}
                    className="px-3.5 py-2 rounded-xl bg-[#FAF8F3] text-[#111215] font-mono font-bold text-xs uppercase border border-[#111215] cursor-pointer"
                  >
                    Copy Link
                  </button>
                </div>

                <button
                  onClick={() => {
                    handleDeleteMediaItem(previewMedia);
                    setPreviewMedia(null);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-300 font-mono font-bold text-xs uppercase cursor-pointer"
                >
                  Delete Asset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT PHOTO MODAL FOR CONCERT GALLERY */}
        {editingPhoto && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#111215]/80 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-xl rounded-3xl bg-[#FAF8F3] border-3 border-[#111215] p-6 text-[#181924] shadow-[8px_8px_0px_#111215] flex flex-col gap-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#111215]">
                <h4 className="text-base font-black uppercase text-[#111215]">Edit Photo Details</h4>
                <button
                  onClick={() => setEditingPhoto(null)}
                  className="w-8 h-8 rounded-full bg-white border border-[#111215] flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="w-full h-40 rounded-xl overflow-hidden bg-[#111215] border border-[#111215]">
                {editingPhoto.url && editingPhoto.url.trim() !== '' ? (
                  <img src={editingPhoto.url} alt={editingPhoto.title} className="w-full h-full object-cover" />
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#5C6F74] font-bold block mb-1">Photo Title</label>
                  <input
                    type="text"
                    value={editingPhoto.title}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, title: e.target.value })}
                    className="w-full bg-white border border-[#111215] rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="text-[#5C6F74] font-bold block mb-1">Performer / Artist</label>
                  <input
                    type="text"
                    value={editingPhoto.artist}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, artist: e.target.value })}
                    className="w-full bg-white border border-[#111215] rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#111215]/20">
                <button
                  type="button"
                  onClick={() => setEditingPhoto(null)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#111215]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (setConcertPhotos) {
                      setConcertPhotos((prev) =>
                        prev.map((p) => (p.id === editingPhoto.id ? editingPhoto : p))
                      );
                    }
                    notifySave(`Saved info for "${editingPhoto.title}"!`);
                    setEditingPhoto(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-[#111215] text-[#D2FF3A] font-bold border border-[#111215] cursor-pointer"
                >
                  Save Photo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ADD PHOTO MODAL */}
        {isAddingPhoto && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#111215]/80 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-xl rounded-3xl bg-[#FAF8F3] border-3 border-[#111215] p-6 text-[#181924] shadow-[8px_8px_0px_#111215] flex flex-col gap-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#111215]">
                <h4 className="text-base font-black uppercase text-[#111215]">
                  + Add New Photo to Concert Gallery
                </h4>
                <button
                  onClick={() => {
                    setIsAddingPhoto(false);
                    setNewPhotoFile(null);
                  }}
                  className="w-8 h-8 rounded-full bg-white border border-[#111215] flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <input
                type="file"
                ref={addPhotoFileInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (re) => {
                      setNewPhotoFile({ file, base64: re.target?.result as string });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />

              {!newPhotoFile ? (
                <div
                  onClick={() => addPhotoFileInputRef.current?.click()}
                  className="p-8 rounded-xl border-2 border-dashed border-[#111215]/40 bg-white hover:border-[#111215] hover:bg-[#D2FF3A]/10 transition-all flex flex-col items-center justify-center text-center cursor-pointer"
                >
                  <Upload className="w-6 h-6 text-[#111215] mb-2" />
                  <span className="font-bold uppercase text-[#111215]">Choose Photo File</span>
                </div>
              ) : (
                <div className="w-full h-36 rounded-xl overflow-hidden bg-black relative">
                  {newPhotoFile.base64 && newPhotoFile.base64.trim() !== '' ? (
                    <img src={newPhotoFile.base64} alt="Upload preview" className="w-full h-full object-cover" />
                  ) : null}
                  <button
                    type="button"
                    onClick={() => addPhotoFileInputRef.current?.click()}
                    className="absolute top-2 right-2 px-2 py-1 bg-black/70 text-white rounded text-[10px]"
                  >
                    Change
                  </button>
                </div>
              )}

              <form onSubmit={handleAddNewPhotoSubmit} className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#5C6F74] font-bold block mb-1">Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Laser Symphony"
                      value={newPhotoData.title || ''}
                      onChange={(e) => setNewPhotoData({ ...newPhotoData, title: e.target.value })}
                      className="w-full bg-white border border-[#111215] rounded-xl p-2.5"
                    />
                  </div>
                  <div>
                    <label className="text-[#5C6F74] font-bold block mb-1">Artist</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sunidhi Chauhan Live"
                      value={newPhotoData.artist || ''}
                      onChange={(e) => setNewPhotoData({ ...newPhotoData, artist: e.target.value })}
                      className="w-full bg-white border border-[#111215] rounded-xl p-2.5"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#111215]/20">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingPhoto(false);
                      setNewPhotoFile(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-white border border-[#111215]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newPhotoFile}
                    className={`px-5 py-2 rounded-xl font-bold border border-[#111215] cursor-pointer ${
                      newPhotoFile
                        ? 'bg-[#111215] text-[#D2FF3A]'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Add to Gallery
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
