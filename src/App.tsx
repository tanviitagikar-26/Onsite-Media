/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  INITIAL_PROJECTS,
  INITIAL_SERVICES,
  INITIAL_TESTIMONIALS,
  INITIAL_SHOWREEL,
  INITIAL_CONTACT_INFO,
  UPLOADED_CONCERT_PHOTOS,
  INITIAL_ABOUT,
  INITIAL_ABOUT_US,
  INITIAL_SPECIALISTS,
  INITIAL_DROP_TYPES,
  PRIMARY_PHONE_NUMBER,
  AboutData,
} from './data/initialData';
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
} from './types';
import { parseDropDescription, formatDropDescription } from './utils/drops';
import { HeroSection } from './components/sections/HeroSection';
import { MarqueeSection } from './components/sections/MarqueeSection';
import { AboutUsSection } from './components/sections/AboutUsSection';
import { AboutSection } from './components/sections/AboutSection';
import { ServicesSection } from './components/sections/ServicesSection';
import { ProjectsSection } from './components/sections/ProjectsSection';
import { TestimonialsSection } from './components/sections/TestimonialsSection';
import { ContactSection } from './components/sections/ContactSection';
import { SpecialistSection } from './components/sections/SpecialistSection';
import { ProjectDetailModal } from './components/modals/ProjectDetailModal';
import { ContactModal } from './components/modals/ContactModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { StickerNavMenu } from './components/ui/StickerNavMenu';
import { FixedContactBar } from './components/ui/FixedContactBar';
import { Settings } from 'lucide-react';
import {
  testConnection,
  seedInitialDatabaseIfEmpty,
  subscribeProjects,
  subscribeConcertPhotos,
  saveConcertPhoto,
  subscribeServices,
  subscribeTestimonials,
  subscribeSiteSettings,
  subscribeDropTypes,
} from './services/firebase';
import {
  saveConcertPhotosLocal,
  loadConcertPhotosLocal,
  savePhotosMapLocal,
  loadPhotosMapLocal,
  saveProjectsLocal,
  loadProjectsLocal,
  saveHeroVideoLocal,
  loadHeroVideoLocal,
} from './utils/mediaStorage';

interface FadeInUpSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const FadeInUpSection: React.FC<FadeInUpSectionProps> = ({
  children,
  className = '',
  delay = 0,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = domRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.02,
        rootMargin: '100px 0px 50px 0px',
      }
    );

    observer.observe(el);

    // Fallback timer so content is never stuck hidden under any browser condition
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 600);

    return () => {
      clearTimeout(timer);
      if (el) observer.unobserve(el);
    };
  }, []);

  return (
    <div
      ref={domRef}
      style={{
        transitionDelay: delay ? `${delay}ms` : undefined,
      }}
      className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] transform will-change-[opacity,transform] ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  );
};

const deduplicatePhotos = (items: ConcertMediaItem[]): ConcertMediaItem[] => {
  const seenFilenames = new Set<string>();
  const seenIds = new Set<string>();
  const seenUrls = new Set<string>();

  return items.filter((item) => {
    const fn = (item.filename || '').trim().toLowerCase();
    const id = (item.id || '').trim();
    const url = (item.url || '').trim();
    const isRealUrl = Boolean(
      url && (url.startsWith('data:') || url.startsWith('http') || url.startsWith('/'))
    );

    if (id && seenIds.has(id)) return false;
    if (fn && seenFilenames.has(fn)) return false;
    if (isRealUrl && seenUrls.has(url)) return false;

    if (id) seenIds.add(id);
    if (fn) seenFilenames.add(fn);
    if (isRealUrl) seenUrls.add(url);
    return true;
  });
};

export default function App() {
  // 1. Live state with LocalStorage persistence
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem('ronny_v2_projects');
      if (saved) {
        const parsedList = JSON.parse(saved);
        if (Array.isArray(parsedList) && parsedList.length > 0) {
          return parsedList.map((p: Project) => {
            const descFields = parseDropDescription(p);
            return {
              ...p,
              artistName: descFields.artistName,
              liveAt: descFields.liveAt,
              artistDescription: descFields.artistDescription,
              description: formatDropDescription(descFields),
            };
          });
        }
      }
      return INITIAL_PROJECTS;
    } catch {
      return INITIAL_PROJECTS;
    }
  });

  const [services, setServices] = useState<ServiceItem[]>(() => {
    try {
      const saved = localStorage.getItem('ronny_v2_services');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          Array.isArray(parsed) &&
          parsed.some((s: ServiceItem) => s.name === '3D Modeling' || s.name === 'Rendering')
        ) {
          localStorage.setItem('ronny_v2_services', JSON.stringify(INITIAL_SERVICES));
          return INITIAL_SERVICES;
        }
        return parsed;
      }
      return INITIAL_SERVICES;
    } catch {
      return INITIAL_SERVICES;
    }
  });

  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    try {
      const saved = localStorage.getItem('ronny_v2_testimonials');
      const list: Testimonial[] = saved ? JSON.parse(saved) : INITIAL_TESTIMONIALS;
      return [...list].sort((a, b) => {
        const ordA = typeof a.order === 'number' ? a.order : 999;
        const ordB = typeof b.order === 'number' ? b.order : 999;
        return ordA - ordB;
      });
    } catch {
      return INITIAL_TESTIMONIALS;
    }
  });

  const [showreel, setShowreel] = useState<ShowreelData>(() => {
    try {
      const saved = localStorage.getItem('ronny_v2_showreel');
      return saved ? JSON.parse(saved) : INITIAL_SHOWREEL;
    } catch {
      return INITIAL_SHOWREEL;
    }
  });

  const [dropTypes, setDropTypes] = useState<DropType[]>(() => {
    try {
      const saved = localStorage.getItem('ronny_v2_drop_types');
      return saved ? JSON.parse(saved) : INITIAL_DROP_TYPES;
    } catch {
      return INITIAL_DROP_TYPES;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ronny_v2_drop_types', JSON.stringify(dropTypes));
    } catch {}
  }, [dropTypes]);

  const [contactInfo, setContactInfo] = useState<ContactInfo>(() => {
    try {
      const saved = localStorage.getItem('ronny_v2_contact');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.phone || parsed.phone.includes('310') || parsed.phone.includes('89205')) {
          parsed.phone = PRIMARY_PHONE_NUMBER;
        }
        if (!parsed.whatsapp || parsed.whatsapp.includes('310') || parsed.whatsapp.includes('89205')) {
          parsed.whatsapp = PRIMARY_PHONE_NUMBER;
        }
        if (!parsed.email || parsed.email.includes('ronny')) {
          parsed.email = 'onsetmedia.in@gmail.com';
        }
        return parsed;
      }
      return INITIAL_CONTACT_INFO;
    } catch {
      return INITIAL_CONTACT_INFO;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ronny_v2_contact', JSON.stringify(contactInfo));
    } catch {}
  }, [contactInfo]);

  const [heroPhoto, setHeroPhoto] = useState<string | null>(() => {
    try {
      return localStorage.getItem('ronny_v2_hero_photo') || null;
    } catch {
      return null;
    }
  });

  const handleHeroPhotoUpdated = (photo: string | null) => {
    setHeroPhoto(photo);
    try {
      if (photo) {
        localStorage.setItem('ronny_v2_hero_photo', photo);
      } else {
        localStorage.removeItem('ronny_v2_hero_photo');
      }
    } catch (err) {
      console.warn('LocalStorage limit for hero photo', err);
    }
  };

  const [heroVideo, setHeroVideo] = useState<string | null>(() => {
    try {
      return localStorage.getItem('ronny_v2_hero_video') || null;
    } catch {
      return null;
    }
  });

  // Load hero video asynchronously from IndexedDB cache
  useEffect(() => {
    loadHeroVideoLocal().then((saved) => {
      if (saved) {
        setHeroVideo(saved);
      }
    });
  }, []);

  const handleHeroVideoUpdated = (video: string | null) => {
    setHeroVideo(video);
    saveHeroVideoLocal(video);
  };

  const [siteFont, setSiteFont] = useState<string>(() => {
    try {
      return localStorage.getItem('ronny_v2_site_font') || 'Kanit';
    } catch {
      return 'Kanit';
    }
  });

  const handleSiteFontUpdated = (fontName: string) => {
    setSiteFont(fontName);
    try {
      localStorage.setItem('ronny_v2_site_font', fontName);
    } catch (err) {
      console.warn('LocalStorage error for site font', err);
    }
  };

  // Dynamically load selected Google Font and apply globally across all website elements
  useEffect(() => {
    if (!siteFont) return;
    const fontId = `google-font-${siteFont.toLowerCase().replace(/\s+/g, '-')}`;
    if (!document.getElementById(fontId)) {
      const link = document.createElement('link');
      link.id = fontId;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
        siteFont
      )}:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700&display=swap`;
      document.head.appendChild(link);
    }

    let styleTag = document.getElementById('active-site-font-style') as HTMLStyleElement | null;
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'active-site-font-style';
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = `
      :root {
        --app-selected-font: '${siteFont}', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      body, button, input, select, textarea, .hero-heading, .font-sans, h1, h2, h3, h4, h5, h6, p, a, span {
        font-family: var(--app-selected-font) !important;
      }
      .font-mono {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
      }
    `;
  }, [siteFont]);

  const [originalPhoto, setOriginalPhoto] = useState<string | null>(() => {
    try {
      return localStorage.getItem('ronny_v2_original_photo') || null;
    } catch {
      return null;
    }
  });

  const [photosMap, setPhotosMap] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('ronny_v2_photos_map');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const photosMapRef = useRef(photosMap);
  useEffect(() => {
    photosMapRef.current = photosMap;
  }, [photosMap]);

  const [concertPhotos, setConcertPhotos] = useState<ConcertMediaItem[]>(() => {
    try {
      const saved = localStorage.getItem('ronny_v2_concert_photos');
      return saved ? deduplicatePhotos(JSON.parse(saved)) : UPLOADED_CONCERT_PHOTOS;
    } catch {
      return UPLOADED_CONCERT_PHOTOS;
    }
  });

  // Restore high-capacity IndexedDB cache on initial client load
  useEffect(() => {
    loadConcertPhotosLocal().then((saved) => {
      if (saved && saved.length > 0) {
        setConcertPhotos((prev) => {
          const hasUploaded = saved.some(
            (s) => s.url && (s.url.startsWith('data:') || s.url.startsWith('http'))
          );
          return hasUploaded ? deduplicatePhotos(saved) : prev;
        });
      }
    });

    loadPhotosMapLocal().then((savedMap) => {
      if (savedMap && Object.keys(savedMap).length > 0) {
        setPhotosMap((prev) => ({ ...savedMap, ...prev }));
      }
    });

    loadProjectsLocal().then((savedProjects) => {
      if (savedProjects && savedProjects.length > 0) {
        setProjects((prev) => {
          const cloudOrExistingMap = new Map(prev.map((p) => [p.id, p]));
          const merged = savedProjects.map((sp) => {
            const existing = cloudOrExistingMap.get(sp.id);
            if (!existing) return sp;
            return {
              ...existing,
              ...sp,
              videoUrl: sp.videoUrl || existing.videoUrl,
              col1Image1: sp.col1Image1 || existing.col1Image1,
              col1Image2: sp.col1Image2 || existing.col1Image2,
              col2Image: sp.col2Image || existing.col2Image,
            };
          });
          const savedIds = new Set(savedProjects.map((sp) => sp.id));
          const remainingPrev = prev.filter((p) => !savedIds.has(p.id));
          return [...merged, ...remainingPrev];
        });
      }
    });
  }, []);

  useEffect(() => {
    const dedupled = deduplicatePhotos(concertPhotos);
    saveConcertPhotosLocal(dedupled);
    try {
      localStorage.setItem('ronny_v2_concert_photos', JSON.stringify(dedupled));
    } catch {}
  }, [concertPhotos]);

  const handlePhotoUploaded = (base64Url: string, filename?: string) => {
    setOriginalPhoto(base64Url);
    const targetFilename = filename || `concert_photo_${Date.now()}.jpg`;

    // 1. Update photosMap and IndexedDB
    setPhotosMap((prev) => {
      const next = { ...prev, [targetFilename]: base64Url };
      savePhotosMapLocal(next);
      try {
        localStorage.setItem('ronny_v2_photos_map', JSON.stringify(next));
      } catch {}
      return next;
    });

    // 2. Update concertPhotos
    setConcertPhotos((prev) => {
      const norm = targetFilename.trim().toLowerCase();
      let matchedIndex = prev.findIndex(
        (p) => p.filename.trim().toLowerCase() === norm
      );

      // If no exact filename match, find the first placeholder template card
      if (matchedIndex === -1) {
        matchedIndex = prev.findIndex(
          (p) =>
            !p.url.startsWith('data:') &&
            !p.url.startsWith('http') &&
            !photosMapRef.current[p.filename]
        );
      }

      let updatedCard: ConcertMediaItem;
      let nextList: ConcertMediaItem[];

      if (matchedIndex !== -1) {
        updatedCard = {
          ...prev[matchedIndex],
          url: base64Url,
          filename: targetFilename,
        };
        nextList = prev.map((p, i) => (i === matchedIndex ? updatedCard : p));
      } else {
        const cleanTitle = targetFilename
          .replace(/\.[^/.]+$/, '')
          .replace(/[_-]/g, ' ')
          .replace(/^(SaveClip\.App|SaveInta\.com)\s*/i, '');

        updatedCard = {
          id: `concert-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          filename: targetFilename,
          title: cleanTitle || 'Live Concert Capture',
          artist: 'Live Performer',
          category: 'Arena Tour',
          venue: 'Live Arena',
          year: '2026',
          url: base64Url,
          description: '',
        };
        nextList = [updatedCard, ...prev];
      }

      const dedupled = deduplicatePhotos(nextList);
      saveConcertPhotosLocal(dedupled);

      // 3. PERSIST DIRECTLY TO FIRESTORE DATABASE
      saveConcertPhoto(updatedCard).catch((err) =>
        console.warn('Firestore concert photo save fallback:', err)
      );

      return dedupled;
    });

    try {
      localStorage.setItem('ronny_v2_original_photo', base64Url);
    } catch (err) {
      console.warn('Storage limit for photo', err);
    }
  };

  const handleBatchUploaded = (newMap: Record<string, string>) => {
    setPhotosMap(newMap);
    savePhotosMapLocal(newMap);
    try {
      localStorage.setItem('ronny_v2_photos_map', JSON.stringify(newMap));
    } catch {}

    setConcertPhotos((prev) => {
      let current = [...prev];
      const savedItems: ConcertMediaItem[] = [];

      Object.entries(newMap).forEach(([fn, base64Url]) => {
        const norm = fn.trim().toLowerCase();
        let targetIdx = current.findIndex(
          (p) => p.filename.trim().toLowerCase() === norm
        );

        if (targetIdx === -1) {
          targetIdx = current.findIndex(
            (p) =>
              !p.url.startsWith('data:') &&
              !p.url.startsWith('http') &&
              !photosMapRef.current[p.filename]
          );
        }

        if (targetIdx !== -1) {
          const updated = {
            ...current[targetIdx],
            url: base64Url,
            filename: fn,
          };
          current[targetIdx] = updated;
          savedItems.push(updated);
        } else {
          const exists = current.some((p) => p.url === base64Url);
          if (!exists) {
            const cleanTitle = fn
              .replace(/\.[^/.]+$/, '')
              .replace(/[_-]/g, ' ')
              .replace(/^(SaveClip\.App|SaveInta\.com)\s*/i, '');

            const newCard: ConcertMediaItem = {
              id: `concert-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              filename: fn,
              title: cleanTitle || 'Live Concert Capture',
              artist: 'Live Performer',
              category: 'Arena Tour',
              venue: 'Live Arena',
              year: '2026',
              url: base64Url,
              description: '',
            };
            current.unshift(newCard);
            savedItems.push(newCard);
          }
        }
      });

      const dedupled = deduplicatePhotos(current);
      saveConcertPhotosLocal(dedupled);

      // Persist all allocated items to Firestore database
      savedItems.forEach((item) => {
        saveConcertPhoto(item).catch((err) =>
          console.warn('Firestore batch photo save fallback:', err)
        );
      });

      return dedupled;
    });
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ronny_v2_projects', JSON.stringify(projects));
    } catch {}
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem('ronny_v2_services', JSON.stringify(services));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ronny_services_updated', { detail: services }));
      }
    } catch {}
  }, [services]);

  useEffect(() => {
    try {
      localStorage.setItem('ronny_v2_testimonials', JSON.stringify(testimonials));
    } catch {}
  }, [testimonials]);

  useEffect(() => {
    try {
      localStorage.setItem('ronny_v2_showreel', JSON.stringify(showreel));
    } catch {}
  }, [showreel]);

  useEffect(() => {
    try {
      localStorage.setItem('ronny_v2_contact', JSON.stringify(contactInfo));
    } catch {}
  }, [contactInfo]);

  const [aboutData, setAboutData] = useState<AboutData>(() => {
    try {
      const saved = localStorage.getItem('ronny_v2_about');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed.paragraph &&
          (parsed.paragraph.includes('3D systems that slap') ||
            parsed.paragraph.includes("where I've captured high-energy performances of artists like Sonu Nigam") ||
            parsed.paragraph.includes('Beyond the lens, I am also an editor—shaping') ||
            parsed.paragraph.includes('across weddings, concerts, and live events') ||
            parsed.paragraph.includes('\n\nMy work extends deep into the live music space'))
        ) {
          const updated = {
            ...parsed,
            paragraph: INITIAL_ABOUT.paragraph,
          };
          localStorage.setItem('ronny_v2_about', JSON.stringify(updated));
          return updated;
        }
        return parsed;
      }
      return INITIAL_ABOUT;
    } catch {
      return INITIAL_ABOUT;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ronny_v2_about', JSON.stringify(aboutData));
    } catch {}
  }, [aboutData]);

  const [aboutUsData, setAboutUsData] = useState<AboutUsData>(() => {
    try {
      const saved = localStorage.getItem('ronny_v2_about_us');
      return saved ? JSON.parse(saved) : INITIAL_ABOUT_US;
    } catch {
      return INITIAL_ABOUT_US;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ronny_v2_about_us', JSON.stringify(aboutUsData));
    } catch {}
  }, [aboutUsData]);

  const [specialists, setSpecialists] = useState<SpecialistSoftware[]>(() => {
    try {
      const saved = localStorage.getItem('ronny_v2_specialists');
      return saved ? JSON.parse(saved) : INITIAL_SPECIALISTS;
    } catch {
      return INITIAL_SPECIALISTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ronny_v2_specialists', JSON.stringify(specialists));
    } catch {}
  }, [specialists]);

  // Connect to Firestore and sync real-time database changes
  useEffect(() => {
    testConnection();
    seedInitialDatabaseIfEmpty({
      projects: INITIAL_PROJECTS,
      concertPhotos: UPLOADED_CONCERT_PHOTOS,
      services: INITIAL_SERVICES,
      testimonials: INITIAL_TESTIMONIALS,
      contactInfo: INITIAL_CONTACT_INFO,
      aboutData: INITIAL_ABOUT,
    });

    const unsubProjects = subscribeProjects((cloudProjects) => {
      if (cloudProjects && cloudProjects.length > 0) {
        setProjects((prev) => {
          // Intelligently merge cloudProjects with local state so uploaded media & newly created drops NEVER disappear!
          const cloudMap = new Map(cloudProjects.map((cp) => [cp.id, cp]));
          const merged = prev.map((localProj) => {
            const cloudProj = cloudMap.get(localProj.id);
            if (!cloudProj) return localProj; // Keep local drop that has not synced to cloud yet

            return {
              ...cloudProj,
              // If local has loaded video or image, preserve it
              videoUrl:
                localProj.videoUrl &&
                (cloudProj.videoUrl === '__LOCAL_STORED_VIDEO__' || !cloudProj.videoUrl)
                  ? localProj.videoUrl
                  : cloudProj.videoUrl || localProj.videoUrl,
              col1Image1:
                localProj.col1Image1 && localProj.col1Image1.startsWith('data:') && !cloudProj.col1Image1?.startsWith('data:')
                  ? localProj.col1Image1
                  : cloudProj.col1Image1 || localProj.col1Image1,
              col1Image2:
                localProj.col1Image2 && localProj.col1Image2.startsWith('data:') && !cloudProj.col1Image2?.startsWith('data:')
                  ? localProj.col1Image2
                  : cloudProj.col1Image2 || localProj.col1Image2,
              col2Image:
                localProj.col2Image && localProj.col2Image.startsWith('data:') && !cloudProj.col2Image?.startsWith('data:')
                  ? localProj.col2Image
                  : cloudProj.col2Image || localProj.col2Image,
            };
          });

          // Add any new cloud projects that were not present locally
          const localIds = new Set(prev.map((p) => p.id));
          const newFromCloud = cloudProjects.filter((cp) => !localIds.has(cp.id));
          const result = [...merged, ...newFromCloud];

          saveProjectsLocal(result);
          return result;
        });
      }
    });

    const unsubConcert = subscribeConcertPhotos((cloudPhotos) => {
      if (cloudPhotos && cloudPhotos.length > 0) {
        setConcertPhotos((prev) => {
          // Merge cloudPhotos with existing state and photosMap so uploaded photos are NEVER wiped
          const merged = cloudPhotos.map((cp) => {
            if (cp.url && (cp.url.startsWith('data:') || cp.url.startsWith('http'))) {
              return cp;
            }
            const localImg = photosMapRef.current[cp.filename];
            if (localImg) {
              return { ...cp, url: localImg };
            }
            const existing = prev.find((p) => p.id === cp.id || p.filename === cp.filename);
            if (
              existing &&
              existing.url &&
              (existing.url.startsWith('data:') || existing.url.startsWith('http'))
            ) {
              return { ...cp, url: existing.url };
            }
            return cp;
          });

          const cloudIds = new Set(merged.map((m) => m.id));
          const extraLocal = prev.filter(
            (p) =>
              !cloudIds.has(p.id) &&
              p.url &&
              (p.url.startsWith('data:') || p.url.startsWith('http'))
          );

          const result = deduplicatePhotos([...extraLocal, ...merged]);
          saveConcertPhotosLocal(result);
          return result;
        });
      }
    });

    const unsubServices = subscribeServices((cloudServices) => {
      if (cloudServices && cloudServices.length > 0) {
        setServices(cloudServices);
      }
    });

    const unsubTestimonials = subscribeTestimonials((cloudReviews) => {
      if (cloudReviews && cloudReviews.length > 0) {
        setTestimonials(cloudReviews);
      }
    });

    const unsubSettings = subscribeSiteSettings((cloudSettings) => {
      if (cloudSettings) {
        if (cloudSettings.contactInfo) {
          setContactInfo(cloudSettings.contactInfo);
          try {
            localStorage.setItem('ronny_v2_contact', JSON.stringify(cloudSettings.contactInfo));
          } catch {}
        }
        if (cloudSettings.aboutData) setAboutData(cloudSettings.aboutData);
        if (cloudSettings.heroPhoto !== undefined) setHeroPhoto(cloudSettings.heroPhoto);
        if (cloudSettings.heroVideo !== undefined) setHeroVideo(cloudSettings.heroVideo);
        if (cloudSettings.siteFont) setSiteFont(cloudSettings.siteFont);
      }
    });

    const unsubDropTypes = subscribeDropTypes((cloudTypes) => {
      if (cloudTypes && cloudTypes.length > 0) {
        setDropTypes(cloudTypes);
      }
    });

    return () => {
      unsubProjects();
      unsubConcert();
      unsubServices();
      unsubTestimonials();
      unsubSettings();
      unsubDropTypes?.();
    };
  }, []);

  // Reset to factory defaults
  const handleResetDefaults = () => {
    setProjects(INITIAL_PROJECTS);
    setServices(INITIAL_SERVICES);
    setTestimonials(INITIAL_TESTIMONIALS);
    setShowreel(INITIAL_SHOWREEL);
    setContactInfo(INITIAL_CONTACT_INFO);
    setConcertPhotos(UPLOADED_CONCERT_PHOTOS);
    setAboutData(INITIAL_ABOUT);
    setAboutUsData(INITIAL_ABOUT_US);
    setSpecialists(INITIAL_SPECIALISTS);
    setDropTypes(INITIAL_DROP_TYPES);
    localStorage.removeItem('ronny_v2_projects');
    localStorage.removeItem('ronny_v2_services');
    localStorage.removeItem('ronny_v2_testimonials');
    localStorage.removeItem('ronny_v2_showreel');
    localStorage.removeItem('ronny_v2_contact');
    localStorage.removeItem('ronny_v2_concert_photos');
    localStorage.removeItem('ronny_v2_about');
    localStorage.removeItem('ronny_v2_about_us');
    localStorage.removeItem('ronny_v2_specialists');
    localStorage.removeItem('ronny_v2_drop_types');
  };

  // Modals
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  return (
    <div
      style={{ overflowX: 'clip' }}
      className="bg-[#F8F6F0] min-h-screen text-[#44455F] font-['Kanit',sans-serif] relative"
    >
      {/* 1. HOME / HERO SECTION */}
      <HeroSection
        onOpenContact={() => setIsContactOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        heroPhoto={heroPhoto}
        heroVideo={heroVideo}
      />

      {/* 2. MARQUEE SECTION & CONCERT MEDIA */}
      <FadeInUpSection>
        <MarqueeSection
          originalPhoto={originalPhoto}
          photosMap={photosMap}
          photos={concertPhotos}
          onPhotoUploaded={handlePhotoUploaded}
          onBatchUploaded={handleBatchUploaded}
        />
      </FadeInUpSection>

      {/* 3. ABOUT US */}
      <FadeInUpSection>
        <AboutUsSection
          onOpenContact={() => setIsContactOpen(true)}
          aboutUsData={aboutUsData}
        />
      </FadeInUpSection>

      {/* 4. MEET THE FOUNDER */}
      <FadeInUpSection>
        <AboutSection
          onOpenContact={() => setIsContactOpen(true)}
          founderPhoto={heroPhoto}
          aboutData={aboutData}
        />
      </FadeInUpSection>

      {/* 4. SERVICES */}
      <FadeInUpSection>
        <ServicesSection
          services={services}
          onSelectService={(service) => {
            setSelectedCategory(service.name);
            setIsContactOpen(true);
          }}
        />
      </FadeInUpSection>

      {/* 5. SPECIALIST IN */}
      <FadeInUpSection>
        <SpecialistSection
          specialists={specialists}
          onOpenContact={() => setIsContactOpen(true)}
        />
      </FadeInUpSection>

      {/* 6. DROPS */}
      <FadeInUpSection>
        <ProjectsSection
          projects={projects}
          dropTypes={dropTypes}
          onOpenProject={(proj) => setSelectedProject(proj)}
          photosMap={photosMap}
        />
      </FadeInUpSection>

      {/* 7. RATINGS AND REVIEWS */}
      <FadeInUpSection>
        <TestimonialsSection testimonials={testimonials} />
      </FadeInUpSection>

      {/* 8. CONTACT */}
      <FadeInUpSection>
        <ContactSection
          contactInfo={contactInfo}
          services={services}
        />
      </FadeInUpSection>

      {/* FOOTER */}
      <FadeInUpSection>
        <footer className="bg-[#F2EFE6] border-t border-[#DCD9B8] py-12 px-6 md:px-10 text-[#8FA3A8] text-xs font-mono flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            Onset Media. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[#44455F] transition-colors cursor-pointer"
            >
              Back to Top ↑
            </a>
            <button
              onClick={() => setIsAdminOpen(true)}
              className="hover:text-[#44455F] text-[#8FA3A8] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-[#F2C17D]" />
              <span>Studio CMS</span>
            </button>
          </div>
        </footer>
      </FadeInUpSection>



      {/* PERSISTENT FLOATING STICKER NAV MENU (RIGHT SIDE CENTER OF PAGE) */}
      <StickerNavMenu onOpenContact={() => setIsContactOpen(true)} />

      {/* PERSISTENT FIXED CONTACT BAR (DOCKED AT BOTTOM OF SCREEN ACROSS ALL PAGES) */}
      <FixedContactBar
        contactInfo={contactInfo}
        onOpenContact={() => setIsContactOpen(true)}
      />

      {/* MODALS */}
      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onOpenContact={() => setIsContactOpen(true)}
        photosMap={photosMap}
      />

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => {
          setIsContactOpen(false);
          setSelectedCategory('');
        }}
        contactInfo={contactInfo}
        services={services}
        defaultCategory={selectedCategory}
      />

      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        projects={projects}
        setProjects={setProjects}
        dropTypes={dropTypes}
        setDropTypes={setDropTypes}
        services={services}
        setServices={setServices}
        testimonials={testimonials}
        setTestimonials={setTestimonials}
        showreel={showreel}
        setShowreel={setShowreel}
        contactInfo={contactInfo}
        setContactInfo={setContactInfo}
        onResetDefaults={handleResetDefaults}
        heroPhoto={heroPhoto}
        onHeroPhotoUpdated={handleHeroPhotoUpdated}
        heroVideo={heroVideo}
        onHeroVideoUpdated={handleHeroVideoUpdated}
        siteFont={siteFont}
        onSiteFontUpdated={handleSiteFontUpdated}
        concertPhotos={concertPhotos}
        setConcertPhotos={setConcertPhotos}
        originalPhoto={originalPhoto}
        photosMap={photosMap}
        setPhotosMap={setPhotosMap}
        onPhotoUploaded={handlePhotoUploaded}
        onBatchUploaded={handleBatchUploaded}
        aboutData={aboutData}
        setAboutData={setAboutData}
        aboutUsData={aboutUsData}
        setAboutUsData={setAboutUsData}
        specialists={specialists}
        setSpecialists={setSpecialists}
      />
    </div>
  );
}
