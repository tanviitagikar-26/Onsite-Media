import React, { useState, useRef, useEffect } from 'react';
import { soundFX } from '../../utils/soundEffects';
import { 
  Sparkles, 
  Flame, 
  Layers, 
  MessageSquare, 
  Send, 
  ChevronDown, 
  X,
  Compass,
  Home,
  User,
  Zap,
  Info
} from 'lucide-react';

interface StickerNavMenuProps {
  onOpenContact?: () => void;
  className?: string;
}

interface SectionItem {
  id: string;
  name: string;
  tag: string;
  badge: string;
  icon: React.ReactNode;
  bgHover: string;
  isAction?: boolean;
}

export const StickerNavMenu: React.FC<StickerNavMenuProps> = ({
  onOpenContact,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on escape or outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Alternating tab colors matching the website pages:
  // Palette 1 (POPULAR #75B4B7) & Palette 2 (SOFT #F2C17D)
  const sections: (SectionItem & { tabColor: string })[] = [
    {
      id: 'home',
      name: 'Home',
      tag: 'Top & Background Video',
      badge: 'HOME',
      icon: <Home className="w-3.5 h-3.5 text-[#111215]" />,
      bgHover: 'hover:bg-[#75B4B7]',
      tabColor: '#75B4B7',
    },
    {
      id: 'about-us',
      name: 'About Us',
      tag: 'Studio Vision & Ethos',
      badge: 'ABOUT',
      icon: <Info className="w-3.5 h-3.5 text-[#111215]" />,
      bgHover: 'hover:bg-[#F2C17D]',
      tabColor: '#F2C17D',
    },
    {
      id: 'about',
      name: 'Meet the Founder',
      tag: 'Founder Lore & Craft',
      badge: 'ORIGIN',
      icon: <User className="w-3.5 h-3.5 text-[#111215]" />,
      bgHover: 'hover:bg-[#75B4B7]',
      tabColor: '#75B4B7',
    },
    {
      id: 'services',
      name: 'Services',
      tag: 'Offerings & Menu',
      badge: 'MENU',
      icon: <Flame className="w-3.5 h-3.5 text-[#111215]" />,
      bgHover: 'hover:bg-[#75B4B7]',
      tabColor: '#75B4B7',
    },
    {
      id: 'specialist',
      name: 'Specialist In',
      tag: 'Adobe & DaVinci Suite',
      badge: 'SUITE',
      icon: <Zap className="w-3.5 h-3.5 text-[#111215]" />,
      bgHover: 'hover:bg-[#F2C17D]',
      tabColor: '#F2C17D',
    },
    {
      id: 'projects',
      name: 'Drops',
      tag: 'Photo Portfolio',
      badge: 'DROP',
      icon: <Layers className="w-3.5 h-3.5 text-[#111215]" />,
      bgHover: 'hover:bg-[#75B4B7]',
      tabColor: '#75B4B7',
    },
    {
      id: 'testimonials',
      name: 'Ratings & Reviews',
      tag: '5-Star Receipts',
      badge: 'VIBE',
      icon: <MessageSquare className="w-3.5 h-3.5 text-[#111215]" />,
      bgHover: 'hover:bg-[#F2C17D]',
      tabColor: '#F2C17D',
    },
  ];

  const handleNavigate = (sec: SectionItem) => {
    soundFX.playPop();
    setIsOpen(false);

    if (sec.id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (sec.id === 'contact' && onOpenContact) {
      const el = document.getElementById(sec.id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        onOpenContact();
      }
      return;
    }

    const el = document.getElementById(sec.id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Optional backdrop when open */}
      {isOpen && (
        <div
          onClick={() => {
            soundFX.playPop();
            setIsOpen(false);
          }}
          className="fixed inset-0 z-40 bg-black/15 backdrop-blur-[1px] transition-opacity"
        />
      )}

      {/* Persistent Floating Sticker Menu Button on the Right Side Center */}
      <aside
        ref={menuRef}
        aria-label="Site Navigation Menu"
        className={`fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-50 select-none ${className}`}
      >
        {/* The Funky Sticker Button - Gateway to all sections */}
        <button
          onClick={() => {
            soundFX.playPop();
            setIsOpen(!isOpen);
          }}
          aria-expanded={isOpen}
          aria-label="Explore All Website Sections"
          title="Explore All Website Sections"
          className={`funky-sticker group cursor-pointer flex items-center gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] font-mono font-black uppercase tracking-wider bg-[#D2FF3A] text-[#111215] border-2 border-[#111215] shadow-[3px_3px_0px_#111215] hover:shadow-[5px_5px_0px_#111215] hover:-translate-x-0.5 active:translate-x-0 active:shadow-[1px_1px_0px_#111215] transition-all duration-200 ${
            isOpen ? 'rotate-0 ring-2 ring-[#FF5500] bg-white' : '-rotate-2 hover:rotate-0'
          }`}
        >
          <span className="text-[#FF5500] text-sm group-hover:rotate-45 transition-transform">★</span>
          <span className="font-extrabold tracking-tight">EXPLORE</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-[#111215] transition-transform duration-300 ml-0.5 ${
              isOpen ? 'rotate-90' : '-rotate-90'
            }`}
          />
        </button>

        {/* Smaller, sleeker Popover Menu (Anchored to the Left of the button, centered vertically) */}
        {isOpen && (
          <div className="absolute right-0 sm:right-full sm:mr-3 top-1/2 -translate-y-1/2 w-[210px] sm:w-[230px] max-w-[calc(100vw-2rem)] bg-[#FAF8F3] border-2 border-[#111215] rounded-xl shadow-[5px_5px_0px_#111215] p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 origin-right">
            {/* Header */}
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#111215]/15">
              <div className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#FF5500]" />
                <span className="text-[10px] font-mono font-black uppercase text-[#111215] tracking-wider">
                  Explore Site
                </span>
              </div>
              <button
                onClick={() => {
                  soundFX.playPop();
                  setIsOpen(false);
                }}
                className="p-0.5 hover:bg-[#111215]/10 rounded text-[#111215] transition-colors cursor-pointer"
                title="Close explore menu"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Section List: Media, Services, Drops, Reviews, Reach Out */}
            <div className="space-y-1">
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => handleNavigate(sec)}
                  className={`w-full group text-left px-2 py-1.5 rounded-lg border border-transparent hover:border-[#111215] transition-all flex items-center justify-between cursor-pointer ${sec.bgHover}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-5 h-5 rounded bg-white border border-[#111215] flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                      {sec.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-[#111215] tracking-tight truncate leading-tight">
                        {sec.name}
                      </div>
                      <div className="text-[9px] font-mono text-[#6A7077] group-hover:text-inherit truncate leading-none">
                        {sec.tag}
                      </div>
                    </div>
                  </div>

                  <span
                    style={{ backgroundColor: sec.tabColor }}
                    className="shrink-0 text-[8px] font-mono font-black uppercase tracking-wider px-1.5 py-0.5 rounded border border-[#111215] text-[#111215] ml-1.5 shadow-xs"
                  >
                    {sec.badge}
                  </span>
                </button>
              ))}
            </div>

            {/* Compact Footer */}
            <div className="mt-2 pt-1.5 border-t border-[#111215]/10 flex items-center justify-end text-[9px] font-mono text-[#777E85]">
              {onOpenContact ? (
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playPop();
                    setIsOpen(false);
                    onOpenContact();
                  }}
                  className="text-[#FF5500] hover:text-[#111215] font-black uppercase cursor-pointer transition-colors"
                >
                  GET IN TOUCH →
                </button>
              ) : (
                <span className="text-[#FF5500] font-bold">EXPLORE</span>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
