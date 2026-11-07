import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Send,
  CheckCircle2,
  Loader2,
  Sparkles,
  MessageSquare,
  Phone,
  FileText,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  Smartphone,
  Calendar,
  User,
  Mail,
  Tag,
  AlignLeft,
  ShieldCheck,
  MapPin,
} from 'lucide-react';
import { submitInquiry, saveInquiryLocally } from '../../services/firebase';
import { soundFX } from '../../utils/soundEffects';
import { INITIAL_SERVICES, PRIMARY_PHONE_NUMBER } from '../../data/initialData';
import { ServiceItem } from '../../types';
import {
  InquiryDeliveryPayload,
  formatClientPhoneNotification,
  formatOwnerWhatsAppDeliveryUrl,
  formatStructuredWhatsAppUrl,
  formatSmsUrl,
  formatVisitorWhatsAppConfirmationUrl,
  dispatchInquiryWebhook,
} from '../../utils/inquiryDeliveryHelper';
import {
  validatePhoneWithCountryCode,
  validateLocation,
  formatStructuredWhatsAppMessage,
} from '../../utils/formValidation';

interface UnifiedContactFormProps {
  className?: string;
  onSuccess?: () => void;
  defaultCategory?: string;
  clientPhone?: string;
  ownerName?: string;
  initialMode?: 'chat' | 'traditional'; // kept for prop backward compatibility, always uses classic form
  services?: ServiceItem[];
}

/**
 * Returns dynamic project category options directly synced with owner's offered services.
 * Automatically extracts service names, deduplicates, and falls back cleanly.
 */
export function getServiceCategoryOptions(
  servicesList?: ServiceItem[] | null,
  fallbackServices: ServiceItem[] = INITIAL_SERVICES
): string[] {
  let list = servicesList;
  if (!list || list.length === 0) {
    try {
      const storage =
        typeof window !== 'undefined' && window.localStorage
          ? window.localStorage
          : typeof localStorage !== 'undefined'
          ? localStorage
          : null;
      const saved = storage ? storage.getItem('ronny_v2_services') : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed;
        }
      }
    } catch {
      // fallback
    }
  }
  if (!list || list.length === 0) {
    list = fallbackServices;
  }

  const names = (list || [])
    .map((s) => s.name?.trim())
    .filter((name): name is string => Boolean(name && name.length > 0));

  const unique = Array.from(new Set(names));
  if (!unique.includes('Others')) {
    unique.push('Others');
  }
  return unique.length > 0 ? unique : ['General Studio Inquiry', 'Others'];
}

export const DEFAULT_PROJECT_CATEGORIES = [...INITIAL_SERVICES.map((s) => s.name), 'Others'];
export const PROJECT_CATEGORIES = DEFAULT_PROJECT_CATEGORIES;


export const UnifiedContactForm: React.FC<UnifiedContactFormProps> = ({
  className = '',
  onSuccess,
  defaultCategory,
  clientPhone = PRIMARY_PHONE_NUMBER,
  ownerName = 'Onsetmedia',
  services: propServices,
}) => {
  // Synchronized services state supporting props, localStorage, and real-time events
  const [internalServices, setInternalServices] = useState<ServiceItem[]>(() => {
    if (propServices && propServices.length > 0) return propServices;
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('ronny_v2_services') : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_SERVICES;
  });

  // Keep internal services in sync with prop updates
  useEffect(() => {
    if (propServices && propServices.length > 0) {
      setInternalServices(propServices);
    }
  }, [propServices]);

  // Listen for storage changes and real-time CMS custom event updates
  useEffect(() => {
    const handleSync = (e?: Event) => {
      if (e instanceof CustomEvent && Array.isArray(e.detail) && e.detail.length > 0) {
        setInternalServices(e.detail);
        return;
      }
      try {
        const saved = localStorage.getItem('ronny_v2_services');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setInternalServices(parsed);
          }
        }
      } catch {}
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('ronny_services_updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('ronny_services_updated', handleSync);
    };
  }, []);

  const activeServices = propServices && propServices.length > 0 ? propServices : internalServices;
  const categories = useMemo(() => {
    return getServiceCategoryOptions(activeServices);
  }, [activeServices]);

  const initialSelectedCategory =
    defaultCategory && categories.includes(defaultCategory)
      ? defaultCategory
      : categories[0] || 'Concert Photography & Cinematography';

  // Form state capturing all required fields with clean labels
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    projectType: initialSelectedCategory,
    message: '',
  });

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    message?: string;
  }>({});

  // Automatically keep selected category synchronized when services or defaultCategory change
  useEffect(() => {
    if (categories.length === 0) return;
    setFormState((prev) => {
      if (defaultCategory && categories.includes(defaultCategory)) {
        return { ...prev, projectType: defaultCategory };
      }
      if (categories.includes(prev.projectType)) {
        return prev;
      }
      return { ...prev, projectType: categories[0] };
    });
  }, [categories, defaultCategory]);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [submittedTimestamp, setSubmittedTimestamp] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    name: string;
    email: string;
    phone: string;
    service: string;
    location: string;
    message: string;
  } | null>(null);

  // Target owner phone for delivery
  const targetOwnerPhone = clientPhone || PRIMARY_PHONE_NUMBER;

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const name = formState.name.trim();
    const email = formState.email.trim();
    const message = formState.message.trim();
    const phone = formState.phone.trim();
    const location = formState.location.trim();
    const service = formState.projectType.trim() || categories[0] || 'General Studio Inquiry';

    const errors: typeof fieldErrors = {};

    // Field validations
    if (!name) {
      errors.name = 'Please provide your name.';
    }
    if (!email || !email.includes('@')) {
      errors.email = 'Please provide a valid email address.';
    }

    // Phone / WhatsApp format validation with mandatory country code
    const phoneValidation = validatePhoneWithCountryCode(phone);
    if (!phoneValidation.isValid) {
      errors.phone = phoneValidation.error;
    }

    // Location mandatory validation
    const locationValidation = validateLocation(location);
    if (!locationValidation.isValid) {
      errors.location = locationValidation.error;
    }

    if (!message) {
      errors.message = 'Please provide a brief description of your project or requirements.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage('Please fill in all mandatory fields with valid information.');
      soundFX.playPop();
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);
    soundFX.playPop();

    const timestamp = new Date().toISOString();
    setSubmittedTimestamp(timestamp);

    const lockedData = {
      name,
      email,
      phone,
      location,
      service,
      message,
    };
    setSubmittedData(lockedData);

    const payload: InquiryDeliveryPayload = {
      name,
      email,
      phone,
      location,
      service,
      project_category: service,
      message,
      ownerName,
      ownerPhone: targetOwnerPhone,
      clientTargetPhone: targetOwnerPhone,
      createdAt: timestamp,
    };

    // Auto-dispatch to WhatsApp with strictly the 4 fields
    const autoWhatsApp = formatStructuredWhatsAppUrl(targetOwnerPhone, {
      name,
      phone,
      service,
      location,
    });

    if (autoWhatsApp.url && typeof window !== 'undefined') {
      try {
        const link = document.createElement('a');
        link.href = autoWhatsApp.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.warn('Auto WhatsApp dispatch notification:', err);
      }
    }

    try {
      const newId = await submitInquiry({
        name,
        email,
        phone,
        location,
        service,
        message,
        conversationTranscript: `Inquiry submitted via Classic Project Form: ${message}`,
        deliveryMethod: 'phone_whatsapp_sms',
      });

      const effectiveId = newId || `inq-${Date.now()}`;
      setSubmittedId(effectiveId);

      // Webhook dispatch if configured
      const webhookUrl =
        (typeof window !== 'undefined' && localStorage.getItem('inquiry_webhook_url')) ||
        (import.meta.env.VITE_INQUIRY_WEBHOOK_URL as string | undefined);

      if (webhookUrl) {
        dispatchInquiryWebhook(webhookUrl, {
          ...payload,
          id: effectiveId,
        });
      }

      soundFX.playShutter();
      setIsSubmitted(true);

      confetti({
        particleCount: 85,
        spread: 80,
        origin: { y: 0.65 },
        colors: ['#D2FF3A', '#FF5500', '#111215', '#FAF8F3'],
      });

      if (onSuccess) {
        setTimeout(onSuccess, 3500);
      }
    } catch (err: any) {
      console.warn('Inquiry submit warning (fallback mode):', err);
      const fallbackId = `inq-local-${Date.now()}`;
      saveInquiryLocally({
        id: fallbackId,
        name: (name || 'Anonymous Client').trim(),
        email: (email || 'client@example.com').trim(),
        phone: phone.trim(),
        location: location.trim(),
        service: service?.trim() || undefined,
        message: (message || 'Project inquiry submitted').trim(),
        createdAt: timestamp,
        status: 'new',
        conversationTranscript: `Inquiry submitted via Classic Project Form: ${message}`,
        deliveryMethod: 'phone_whatsapp_sms',
      });
      setSubmittedId(fallbackId);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to submit another inquiry
  const handleReset = () => {
    setIsSubmitted(false);
    setSubmittedId(null);
    setSubmittedData(null);
    setErrorMessage(null);
    setFieldErrors({});
    setFormState({
      name: '',
      email: '',
      phone: '',
      location: '',
      projectType:
        defaultCategory && categories.includes(defaultCategory)
          ? defaultCategory
          : categories[0] || 'General Studio Inquiry',
      message: '',
    });
  };

  // Active values (committed submittedData if available, fallback to formState)
  const activeName = submittedData ? submittedData.name : formState.name;
  const activeEmail = submittedData ? submittedData.email : formState.email;
  const activePhone = submittedData ? submittedData.phone : formState.phone;
  const activeLocation = submittedData ? submittedData.location : formState.location;
  const activeCategory = submittedData ? submittedData.service : formState.projectType;
  const activeMessage = submittedData ? submittedData.message : formState.message;

  // Format payload for delivery & display
  const deliveryPayload: InquiryDeliveryPayload = {
    id: submittedId || undefined,
    name: activeName,
    email: activeEmail,
    phone: activePhone,
    service: activeCategory,
    project_category: activeCategory,
    message: activeMessage,
    ownerName,
    ownerPhone: targetOwnerPhone,
    createdAt: submittedTimestamp || new Date().toISOString(),
  };

  // WhatsApp delivery configurations: strictly 4 structured fields (Name, Phone Number, Project Category, Location)
  const structuredWhatsAppText = formatStructuredWhatsAppMessage({
    name: activeName,
    phone: activePhone,
    service: activeCategory,
    project_category: activeCategory,
    location: activeLocation,
  });

  const ownerWhatsApp = formatStructuredWhatsAppUrl(targetOwnerPhone, {
    name: activeName,
    phone: activePhone,
    service: activeCategory,
    project_category: activeCategory,
    location: activeLocation,
  });

  const formattedSummaryText = structuredWhatsAppText;
  const ownerSmsUrl = formatSmsUrl(targetOwnerPhone, structuredWhatsAppText);
  const visitorWhatsAppUrl = activePhone
    ? formatVisitorWhatsAppConfirmationUrl(activePhone, deliveryPayload, ownerName)
    : null;

  // Copy inquiry summary text to clipboard
  const handleCopySummary = () => {
    soundFX.playPop();
    navigator.clipboard.writeText(structuredWhatsAppText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  // =========================================================================
  // POST-SUBMISSION CONFIRMATION SCREEN (CLEAN, READABLE LIST FORMAT)
  // =========================================================================
  if (isSubmitted) {
    const formattedDate = new Date(submittedTimestamp || Date.now()).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    return (
      <div
        className={`py-8 px-5 sm:px-8 flex flex-col items-center justify-center text-center rounded-2xl bg-white border-2 border-[#111215] shadow-[6px_6px_0px_#111215] animate-fade-in ${className}`}
      >
        <div className="w-16 h-16 rounded-2xl bg-[#D2FF3A] border-2 border-[#111215] flex items-center justify-center text-[#111215] mb-4 shadow-[3px_3px_0px_#111215]">
          <CheckCircle2 className="w-8 h-8 text-[#111215]" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F3] border border-[#111215] text-[10px] font-mono font-bold uppercase text-[#111215] mb-2 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#FF5500]" />
          <span>Inquiry Submitted Successfully</span>
        </div>

        <h4 className="text-xl sm:text-2xl font-black uppercase text-[#111215] mb-2 tracking-tight">
          Project Inquiry Dispatched!
        </h4>

        <p className="text-xs sm:text-sm text-[#5C6F74] font-mono max-w-lg mb-6 leading-relaxed">
          Thank you, <strong className="text-[#111215]">{activeName}</strong>. Your project details have been recorded
          and formatted for direct routing to <strong className="text-[#111215]">{ownerName}</strong>'s WhatsApp.
        </p>

        {/* Clean, Easy-to-Read List Format of All Submitted Values */}
        <div className="w-full max-w-xl bg-[#FAF8F3] border-2 border-[#111215] rounded-2xl p-5 sm:p-6 mb-6 text-left shadow-[4px_4px_0px_#111215]">
          <div className="flex items-center justify-between pb-3.5 border-b-2 border-[#111215] mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#111215]" />
              <span className="text-xs font-mono font-black uppercase text-[#111215] tracking-wide">
                Submitted Inquiry Summary
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#D2FF3A] border border-[#111215] text-[#111215]">
              {submittedId || 'CONFIRMED'}
            </span>
          </div>

          {/* Structured 4-Field List Format (1. Name, 2. Phone Number, 3. Project Category, 4. Location) */}
          <ul className="flex flex-col gap-3 font-mono text-xs text-[#111215]">
            <li className="flex flex-col sm:flex-row sm:items-baseline justify-between pb-2 border-b border-[#111215]/10 gap-1">
              <span className="text-[#5C6F74] font-bold uppercase text-[10px] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#111215]" />
                1. Name:
              </span>
              <span className="font-bold text-[#111215]">{activeName || 'N/A'}</span>
            </li>

            <li className="flex flex-col sm:flex-row sm:items-baseline justify-between pb-2 border-b border-[#111215]/10 gap-1">
              <span className="text-[#5C6F74] font-bold uppercase text-[10px] flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-[#111215]" />
                2. Phone Number:
              </span>
              <span className="font-bold text-[#111215]">{activePhone || 'N/A'}</span>
            </li>

            <li className="flex flex-col sm:flex-row sm:items-baseline justify-between pb-2 border-b border-[#111215]/10 gap-1">
              <span className="text-[#5C6F74] font-bold uppercase text-[10px] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#111215]" />
                3. Project Category:
              </span>
              <span className="font-bold text-[#111215] bg-white px-2 py-0.5 rounded border border-[#111215]/20 inline-block w-fit">
                {activeCategory || 'N/A'}
              </span>
            </li>

            <li className="flex flex-col sm:flex-row sm:items-baseline justify-between pb-2 border-b border-[#111215]/10 gap-1">
              <span className="text-[#5C6F74] font-bold uppercase text-[10px] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#111215]" />
                4. Location:
              </span>
              <span className="font-bold text-[#111215]">{activeLocation || 'N/A'}</span>
            </li>
          </ul>

          {/* Primary Owner WhatsApp Delivery Action */}
          <div className="mt-5 pt-4 border-t-2 border-[#111215] flex flex-col gap-2.5">
            <span className="text-[10px] font-mono font-bold uppercase text-[#5C6F74] tracking-wider">
              Direct Owner WhatsApp Dispatch ({targetOwnerPhone}):
            </span>

            <a
              href={ownerWhatsApp.url}
              target="onset_whatsapp"
              rel="noopener noreferrer"
              onClick={() => soundFX.playPop()}
              className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-[#111215] border-2 border-[#111215] font-mono font-black text-xs uppercase flex items-center justify-center gap-2 shadow-[3px_3px_0px_#111215] hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Send to Owner via WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            <div className="flex flex-wrap sm:flex-nowrap gap-2 pt-1">
              <a
                href={ownerSmsUrl}
                onClick={() => soundFX.playPop()}
                className="flex-1 py-2.5 px-3 rounded-xl bg-white hover:bg-[#FAF8F3] text-[#111215] border-2 border-[#111215] font-mono font-bold text-xs uppercase flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#111215] transition-all cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>SMS Dispatch</span>
              </a>

              {visitorWhatsAppUrl && (
                <a
                  href={visitorWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-white hover:bg-[#FAF8F3] text-[#111215] border-2 border-[#111215] font-mono font-bold text-xs uppercase flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#111215] transition-all cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Client Copy</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Secondary Actions: Copy Summary & Submit New Inquiry */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleCopySummary}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF8F3] text-[#111215] border-2 border-[#111215] text-xs font-mono font-bold uppercase cursor-pointer shadow-[2px_2px_0px_#111215] flex items-center gap-1.5 transition-all"
          >
            {copiedSummary ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Summary Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Inquiry Summary</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl bg-[#FAF8F3] hover:bg-[#D2FF3A] text-[#111215] border-2 border-[#111215] text-xs font-mono font-bold uppercase cursor-pointer shadow-[2px_2px_0px_#111215] flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Submit Another Inquiry</span>
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CLASSIC FORM AS THE SOLE OPTION AND DEFAULT EXPERIENCE
  // =========================================================================
  return (
    <div
      className={`flex flex-col rounded-2xl bg-white border-2 border-[#111215] shadow-[6px_6px_0px_#111215] overflow-hidden ${className}`}
    >
      {/* Clean Single Header (No mode switcher / No chat toggle) */}
      <div className="p-4 sm:p-5 bg-[#FAF8F3] border-b-2 border-[#111215] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#111215] text-[#D2FF3A] border-2 border-[#111215] flex items-center justify-center font-bold shadow-[2px_2px_0px_#111215]">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h5 className="font-mono font-black text-sm sm:text-base text-[#111215] uppercase tracking-tight">
                Project Inquiry Form
              </h5>
            </div>
            <p className="text-[11px] font-mono text-[#5C6F74] mt-0.5">
              Fill in your project details for direct delivery to {ownerName}'s WhatsApp
            </p>
          </div>
        </div>
      </div>

      {/* Error message banner */}
      {errorMessage && (
        <div className="m-4 mb-0 p-3.5 rounded-xl bg-rose-50 border-2 border-rose-400 text-rose-800 text-xs font-mono font-bold">
          {errorMessage}
        </div>
      )}

      {/* Classic Form with Clearly Labeled Fields */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 flex flex-col gap-4 font-mono text-xs">
        {/* Row 1: Name and Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-wider text-[#111215] font-black flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#5C6F74]" />
              <span>Your Name *</span>
            </label>
            <input
              id="client-name-input"
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder="e.g. Alex Morgan"
              value={formState.name}
              onChange={(e) => {
                setFormState({ ...formState, name: e.target.value });
                if (fieldErrors.name) {
                  setFieldErrors((prev) => ({ ...prev, name: undefined }));
                }
              }}
              className={`w-full bg-white border-2 ${
                fieldErrors.name ? 'border-rose-500 ring-2 ring-rose-200' : 'border-[#111215]'
              } rounded-xl px-4 py-3 text-[#111215] placeholder-[#8FA3A8] text-sm focus:outline-none focus:ring-2 focus:ring-[#D2FF3A] font-medium shadow-xs`}
            />
            {fieldErrors.name && (
              <p className="text-[11px] font-mono text-rose-600 font-bold mt-0.5 flex items-center gap-1">
                <span>⚠</span> {fieldErrors.name}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-wider text-[#111215] font-black flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#5C6F74]" />
              <span>Email Address *</span>
            </label>
            <input
              type="email"
              required
              placeholder="e.g. alex@brand.com"
              value={formState.email}
              onChange={(e) => setFormState({ ...formState, email: e.target.value })}
              className="w-full bg-white border-2 border-[#111215] rounded-xl px-4 py-3 text-[#111215] placeholder-[#8FA3A8] text-sm focus:outline-none focus:ring-2 focus:ring-[#D2FF3A] font-medium shadow-xs"
            />
          </div>
        </div>

        {/* Row 2: Phone/WhatsApp * and Location/City * (Both Mandatory) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-wider text-[#111215] font-black flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-[#5C6F74]" />
              <span>Phone / WhatsApp *</span>
            </label>
            <input
              type="tel"
              required
              autoComplete="tel"
              placeholder="e.g. +1 (555) 000-0000 or +91 9035582905"
              value={formState.phone}
              onChange={(e) => {
                setFormState({ ...formState, phone: e.target.value });
                if (fieldErrors.phone) {
                  setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                }
              }}
              className={`w-full bg-white border-2 ${
                fieldErrors.phone ? 'border-rose-500 ring-2 ring-rose-200' : 'border-[#111215]'
              } rounded-xl px-4 py-3 text-[#111215] placeholder-[#8FA3A8] text-sm focus:outline-none focus:ring-2 focus:ring-[#D2FF3A] font-medium shadow-xs`}
            />
            {fieldErrors.phone && (
              <p className="text-[11px] font-mono text-rose-600 font-bold mt-0.5 flex items-center gap-1">
                <span>⚠</span> {fieldErrors.phone}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-wider text-[#111215] font-black flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#5C6F74]" />
              <span>Location / City *</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Los Angeles, CA or Mumbai, India"
              value={formState.location}
              onChange={(e) => {
                setFormState({ ...formState, location: e.target.value });
                if (fieldErrors.location) {
                  setFieldErrors((prev) => ({ ...prev, location: undefined }));
                }
              }}
              className={`w-full bg-white border-2 ${
                fieldErrors.location ? 'border-rose-500 ring-2 ring-rose-200' : 'border-[#111215]'
              } rounded-xl px-4 py-3 text-[#111215] placeholder-[#8FA3A8] text-sm focus:outline-none focus:ring-2 focus:ring-[#D2FF3A] font-medium shadow-xs`}
            />
            {fieldErrors.location && (
              <p className="text-[11px] font-mono text-rose-600 font-bold mt-0.5 flex items-center gap-1">
                <span>⚠</span> {fieldErrors.location}
              </p>
            )}
          </div>
        </div>

        {/* Row 3: Project Category * */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs uppercase tracking-wider text-[#111215] font-black flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-[#5C6F74]" />
            <span>Project Category *</span>
          </label>
          <select
            value={formState.projectType}
            onChange={(e) => setFormState({ ...formState, projectType: e.target.value })}
            className="w-full bg-white border-2 border-[#111215] rounded-xl px-4 py-3 text-[#111215] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#D2FF3A] shadow-xs cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Row 3: Project Brief / Message */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs uppercase tracking-wider text-[#111215] font-black flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-[#5C6F74]" />
              <span>Project Brief / Message *</span>
            </label>
            <span className="text-[10px] text-[#5C6F74] font-medium">Deliverables, Timeline, Goals</span>
          </div>

          <textarea
            rows={4}
            required
            placeholder="Describe your project vision, timeline, deliverables, or questions for Onsetmedia and team..."
            value={formState.message}
            onChange={(e) => setFormState({ ...formState, message: e.target.value })}
            className="w-full bg-white border-2 border-[#111215] rounded-xl p-4 text-[#111215] placeholder-[#8FA3A8] text-sm focus:outline-none focus:ring-2 focus:ring-[#D2FF3A] font-medium resize-none shadow-xs leading-relaxed"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 px-6 rounded-2xl bg-[#111215] hover:bg-[#D2FF3A] text-white hover:text-[#111215] border-2 border-[#111215] font-mono font-black uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-[4px_4px_0px_#111215] hover:-translate-y-0.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#D2FF3A]" />
              <span>Submitting Inquiry...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit &amp; Deliver to Studio Owner</span>
              <Sparkles className="w-3.5 h-3.5 text-[#FF5500]" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
