import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { FadeIn } from '../ui/FadeIn';
import { soundFX } from '../../utils/soundEffects';
import { Check, Sparkles, Zap, Star } from 'lucide-react';
import { INITIAL_SPECIALISTS } from '../../data/initialData';
import { SpecialistSoftware } from '../../types';

// Dedicated SVG Logos for Adobe Photoshop, Premiere Pro, Lightroom, DaVinci Resolve, and After Effects
export const PhotoshopLogo: React.FC<{ className?: string }> = ({ className = 'w-12 h-12' }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="14" fill="#001E36" stroke="#31A8FF" strokeWidth="2.5" />
    <text
      x="16"
      y="43"
      fill="#31A8FF"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      fontWeight="900"
      fontSize="27"
      letterSpacing="-1.5"
    >
      Ps
    </text>
    <rect x="5" y="5" width="54" height="54" rx="10" stroke="#31A8FF" strokeOpacity="0.25" strokeWidth="1" fill="none" />
  </svg>
);

export const PremiereProLogo: React.FC<{ className?: string }> = ({ className = 'w-12 h-12' }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="14" fill="#1C002B" stroke="#EA77FF" strokeWidth="2.5" />
    <text
      x="17"
      y="43"
      fill="#EA77FF"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      fontWeight="900"
      fontSize="27"
      letterSpacing="-1.5"
    >
      Pr
    </text>
    <rect x="5" y="5" width="54" height="54" rx="10" stroke="#EA77FF" strokeOpacity="0.25" strokeWidth="1" fill="none" />
  </svg>
);

export const LightroomLogo: React.FC<{ className?: string }> = ({ className = 'w-12 h-12' }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="14" fill="#001D26" stroke="#3DF5FF" strokeWidth="2.5" />
    <text
      x="17"
      y="43"
      fill="#3DF5FF"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      fontWeight="900"
      fontSize="27"
      letterSpacing="-1.5"
    >
      Lr
    </text>
    <rect x="5" y="5" width="54" height="54" rx="10" stroke="#3DF5FF" strokeOpacity="0.25" strokeWidth="1" fill="none" />
  </svg>
);

export const DaVinciResolveLogo: React.FC<{ className?: string }> = ({ className = 'w-12 h-12' }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Dark neobrutalist badge container */}
    <rect width="64" height="64" rx="14" fill="#15171C" stroke="#FF5500" strokeWidth="2.5" />
    {/* Blackmagic DaVinci Resolve iconic three-petal color flower */}
    <g transform="translate(32, 32)">
      {/* Top Red Petal */}
      <path
        d="M0 -3 C4 -12 12 -15 15 -9 C18 -3 14 7 0 3 Z"
        fill="#FF3B30"
        transform="rotate(0)"
      />
      {/* Bottom Right Blue Petal */}
      <path
        d="M0 -3 C4 -12 12 -15 15 -9 C18 -3 14 7 0 3 Z"
        fill="#007AFF"
        transform="rotate(120)"
      />
      {/* Bottom Left Green Petal */}
      <path
        d="M0 -3 C4 -12 12 -15 15 -9 C18 -3 14 7 0 3 Z"
        fill="#34C759"
        transform="rotate(240)"
      />
      {/* Center White Anchor Dot */}
      <circle cx="0" cy="0" r="3.2" fill="#FFFFFF" />
    </g>
    <rect x="5" y="5" width="54" height="54" rx="10" stroke="#FF5500" strokeOpacity="0.3" strokeWidth="1" fill="none" />
  </svg>
);

export const AfterEffectsLogo: React.FC<{ className?: string }> = ({ className = 'w-12 h-12' }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="14" fill="#1F0038" stroke="#9999FF" strokeWidth="2.5" />
    <text
      x="15"
      y="43"
      fill="#9999FF"
      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      fontWeight="900"
      fontSize="27"
      letterSpacing="-1.5"
    >
      Ae
    </text>
    <rect x="5" y="5" width="54" height="54" rx="10" stroke="#9999FF" strokeOpacity="0.25" strokeWidth="1" fill="none" />
  </svg>
);

interface SoftwareSpecialist {
  id: string;
  name: string;
  subname: string;
  category: string;
  badge: string;
  badgeBg: string;
  badgeText: string;
  accentBorder: string;
  logo: React.ReactNode;
  summary: string;
  description: string;
  coreSkills: string[];
  specsMetric: string;
  specsLabel: string;
}

const SOFTWARE_SPECIALISTS: SoftwareSpecialist[] = [
  {
    id: 'photoshop',
    name: 'Adobe Photoshop',
    subname: 'Advanced Compositing & Key Art',
    category: 'Visual Craft & Manipulation',
    badge: 'PHOTOSHOP MASTER',
    badgeBg: 'bg-[#31A8FF]',
    badgeText: 'text-[#001E36]',
    accentBorder: 'hover:border-[#31A8FF]',
    logo: <PhotoshopLogo className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 shadow-sm" />,
    summary: 'High-end photo manipulation, creative composite posters, and razor-sharp key art.',
    description:
      'Precision image retouching, bespoke concert tour key art, complex frequency separation, and multi-layer compositing that turns raw moments into iconic visuals.',
    coreSkills: ['Tour Poster Art', 'High-End Compositing', 'Complex Masking', 'Texture Blending', 'Key Visuals'],
    specsMetric: 'Full 16-Bit RAW',
    specsLabel: 'Depth Pipeline',
  },
  {
    id: 'premiere',
    name: 'Adobe Premiere Pro',
    subname: 'Cinematic Timeline & Concert Assembly',
    category: 'Editorial Pacing & Assembly',
    badge: 'LIGHTNING CUT',
    badgeBg: 'bg-[#EA77FF]',
    badgeText: 'text-[#1C002B]',
    accentBorder: 'hover:border-[#EA77FF]',
    logo: <PremiereProLogo className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 shadow-sm" />,
    summary: 'Rhythmic pacing, multi-cam live performance editing, and dynamic storytelling.',
    description:
      'Fast-paced concert and festival video cutting with synchronized audio transients, multi-angle stadium switching, and rapid turnaround for live drops.',
    coreSkills: ['Multi-Cam Switching', 'Rhythmic Pacing', 'Concert Recaps', 'Audio Sync', 'Speed Ramping'],
    specsMetric: 'Sub-Frame Sync',
    specsLabel: 'Timeline Precision',
  },
  {
    id: 'lightroom',
    name: 'Adobe Lightroom',
    subname: 'Live Concert & RAW Color Grading',
    category: 'Color Development & Presets',
    badge: 'RAW SCIENTIST',
    badgeBg: 'bg-[#3DF5FF]',
    badgeText: 'text-[#001D26]',
    accentBorder: 'hover:border-[#3DF5FF]',
    logo: <LightroomLogo className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 shadow-sm" />,
    summary: 'Concert low-light exposure rescue, tone curve mastering, and signature grading profiles.',
    description:
      'High-volume RAW processing built for punishing stadium lighting, smoke hazers, and high-contrast lasers to deliver rich blacks and electric highlights.',
    coreSkills: ['Laser Balance', 'Low-Light Rescue', 'Custom Presets', 'Tone Curve Science', 'Batch Curation'],
    specsMetric: 'Zero Dynamic Loss',
    specsLabel: 'Exposure Recovery',
  },
  {
    id: 'davinci',
    name: 'DaVinci Resolve Studio',
    subname: 'Hollywood-Grade ACES Color Grading',
    category: 'Color Science & Finishing',
    badge: 'COLOR MASTER',
    badgeBg: 'bg-[#FF5500]',
    badgeText: 'text-white',
    accentBorder: 'hover:border-[#FF5500]',
    logo: <DaVinciResolveLogo className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 shadow-sm" />,
    summary: 'Node-based color grading, analog film print emulation, and studio broadcast finishing.',
    description:
      'Hollywood-caliber color grading utilizing ACES color management, Kodak 2383 film emulsion LUTs, skin-tone preservation, and theater-ready master deliverables.',
    coreSkills: ['Node Color Tree', 'ACES Workflow', 'Film Emulation', 'HDR Finishing', 'Skin Tone Isolation'],
    specsMetric: 'ACES Color Space',
    specsLabel: 'Studio Pipeline',
  },
  {
    id: 'aftereffects',
    name: 'Adobe After Effects',
    subname: 'Kinetic Motion & Tour Stage Visuals',
    category: 'Motion Graphics & VFX',
    badge: 'MOTION & VFX',
    badgeBg: 'bg-[#9999FF]',
    badgeText: 'text-[#1F0038]',
    accentBorder: 'hover:border-[#9999FF]',
    logo: <AfterEffectsLogo className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 shadow-sm" />,
    summary: 'Kinetic typography, 3D camera tracking, stage LED backdrop animation, and VFX cleanups.',
    description:
      'Eye-melting visual effects, 3D camera matchmoving, custom glitch shaders, and high-energy motion design optimized for stage LED walls and viral social formats.',
    coreSkills: ['3D Camera Tracking', 'Kinetic Typography', 'Tour LED Loops', 'VFX Cleanups', 'Procedural Rigs'],
    specsMetric: 'Seamless 60FPS',
    specsLabel: 'Motion Flow',
  },
];

interface SpecialistSectionProps {
  onOpenContact?: () => void;
  specialists?: SpecialistSoftware[];
}

export const getSpecialistLogo = (item: SpecialistSoftware) => {
  if (item.customLogoUrl && item.customLogoUrl.trim() !== '') {
    return (
      <img
        src={item.customLogoUrl}
        alt={item.name}
        className="w-12 h-12 sm:w-14 sm:h-14 object-contain rounded-xl border border-[#111215]"
      />
    );
  }
  switch (item.id) {
    case 'photoshop':
      return <PhotoshopLogo className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 shadow-sm" />;
    case 'premiere':
      return <PremiereProLogo className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 shadow-sm" />;
    case 'lightroom':
      return <LightroomLogo className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 shadow-sm" />;
    case 'davinci':
      return <DaVinciResolveLogo className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 shadow-sm" />;
    case 'aftereffects':
      return <AfterEffectsLogo className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 shadow-sm" />;
    default:
      return <PhotoshopLogo className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 shadow-sm" />;
  }
};

export const SpecialistSection: React.FC<SpecialistSectionProps> = ({
  onOpenContact,
  specialists = INITIAL_SPECIALISTS,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const currentSpecialists = specialists && specialists.length > 0 ? specialists : INITIAL_SPECIALISTS;

  const handleCardClick = (item: SpecialistSoftware, e: React.MouseEvent) => {
    soundFX.playPop();
    setActiveId((prev) => (prev === item.id ? null : item.id));

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    confetti({
      particleCount: 22,
      spread: 50,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      },
      colors: ['#75B4B7', '#9D9D9B', '#111215', '#FFFFFF'],
    });
  };

  return (
    <section
      id="specialist"
      className="bg-[#F7F7F7] text-[#181924] rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-10 sm:-mt-12 md:-mt-14 z-10 relative px-5 sm:px-8 md:px-10 pt-20 sm:pt-24 md:pt-32 pb-24 sm:pb-32 border-t-2 border-[#111215] select-none selection:bg-[#75B4B7] selection:text-[#111215]"
    >
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <FadeIn delay={0} y={30} className="w-full text-center mb-14 sm:mb-18 md:mb-20">


          <h2 className="hero-heading font-black uppercase text-center leading-none tracking-tight text-[clamp(2.5rem,8.5vw,120px)] text-[#181924]">
            SPECIALIST IN
          </h2>
          <p className="text-xs sm:text-sm text-[#5D616B] font-mono uppercase tracking-widest mt-4 max-w-2xl mx-auto">
            Adobe Photoshop · Adobe Premiere Pro · Adobe Lightroom · DaVinci Resolve · Adobe After Effects
          </p>
        </FadeIn>

        {/* 5 Software Specialist Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full">
          {currentSpecialists.map((item, idx) => {
            const isSelected = activeId === item.id;

            return (
              <FadeIn
                key={item.id}
                delay={idx * 0.06}
                y={25}
                className={`w-full ${
                  // On 3-column grid, make the 4th and 5th items balance aesthetically on larger screens
                  idx === 3 ? 'lg:col-span-1 lg:col-start-1' : ''
                }`}
              >
                <div
                  onClick={(e) => handleCardClick(item, e)}
                  className={`group relative h-full bg-white border-2 border-[#111215] rounded-3xl p-6 sm:p-7 flex flex-col transition-all duration-200 cursor-pointer shadow-[4px_4px_0px_#111215] hover:shadow-[7px_7px_0px_#75B4B7] hover:-translate-y-1 ${item.accentBorder} ${
                    isSelected ? 'ring-3 ring-[#75B4B7] bg-white shadow-[7px_7px_0px_#75B4B7]' : ''
                  }`}
                >
                  <div>
                    {/* Top Row: Software Logo & Badge */}
                    <div className="flex items-center justify-between gap-3 mb-5">
                      <div className="group-hover:scale-105 transition-transform duration-200">
                        {getSpecialistLogo(item)}
                      </div>

                      <span
                        className={`funky-sticker text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-lg border border-[#111215] shadow-xs ${item.badgeBg} ${item.badgeText}`}
                      >
                        {item.badge}
                      </span>
                    </div>

                    {/* Category */}
                    <div className="text-[10px] font-mono font-bold uppercase text-[#777E85] tracking-wider mb-1">
                      {item.category}
                    </div>

                    {/* Software Title */}
                    <h3 className="font-extrabold text-xl sm:text-2xl text-[#111215] tracking-tight uppercase leading-snug mb-1">
                      {item.name}
                    </h3>
                    <div className="text-xs font-mono font-bold text-[#75B4B7] mb-3">
                      {item.subname}
                    </div>

                    {/* Summary & Description */}
                    <p className="text-xs sm:text-sm text-[#5C6F74] leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>
                </div>
              </FadeIn>
            );
          })}

          {/* 6th Card: The Integrated Onset Media Pipeline Card */}
          <FadeIn delay={0.3} y={25} className="w-full">
            <div className="h-full bg-[#111215] text-white border-2 border-[#111215] rounded-3xl p-6 sm:p-7 flex flex-col shadow-[4px_4px_0px_#75B4B7] hover:shadow-[7px_7px_0px_#75B4B7] transition-all">
              <div>
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="flex -space-x-2 overflow-hidden py-1">
                    <div className="w-8 h-8 rounded-lg border border-[#111215] bg-[#001E36] flex items-center justify-center text-[10px] font-black text-[#31A8FF]">Ps</div>
                    <div className="w-8 h-8 rounded-lg border border-[#111215] bg-[#1C002B] flex items-center justify-center text-[10px] font-black text-[#EA77FF]">Pr</div>
                    <div className="w-8 h-8 rounded-lg border border-[#111215] bg-[#001D26] flex items-center justify-center text-[10px] font-black text-[#3DF5FF]">Lr</div>
                    <div className="w-8 h-8 rounded-lg border border-[#111215] bg-[#15171C] flex items-center justify-center text-[10px] font-black text-[#FF5500]">Dv</div>
                    <div className="w-8 h-8 rounded-lg border border-[#111215] bg-[#1F0038] flex items-center justify-center text-[10px] font-black text-[#9999FF]">Ae</div>
                  </div>

                  <span className="funky-sticker text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-lg bg-[#75B4B7] text-[#111215] border border-[#111215]">
                    ALL-IN-ONE SUITE
                  </span>
                </div>

                <div className="text-[10px] font-mono font-bold uppercase text-[#75B4B7] tracking-wider mb-1">
                  Unified Creative Pipeline
                </div>

                <h3 className="font-extrabold text-xl sm:text-2xl text-white tracking-tight uppercase leading-snug mb-3">
                  Seamless Cross-Software Workflow
                </h3>

                <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-normal">
                  Zero friction between grading in DaVinci, kinetic VFX in After Effects, timeline assembly in Premiere Pro, and hero stills perfected in Photoshop & Lightroom.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>

      </div>
    </section>
  );
};
