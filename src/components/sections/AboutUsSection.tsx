import React from 'react';
import confetti from 'canvas-confetti';
import { FadeIn } from '../ui/FadeIn';
import { Globe } from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';
import { INITIAL_ABOUT_US } from '../../data/initialData';
import { AboutUsData, AboutUsStat } from '../../types';

interface AboutUsSectionProps {
  onOpenContact?: () => void;
  aboutUsData?: AboutUsData;
}

export const AboutUsSection: React.FC<AboutUsSectionProps> = ({
  aboutUsData = INITIAL_ABOUT_US,
}) => {
  const current = aboutUsData || INITIAL_ABOUT_US;

  const handleStatClick = () => {
    soundFX.playHype();
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#D2FF3A', '#75B4B7', '#F2C17D', '#111215'],
    });
  };

  return (
    <section
      id="about-us"
      className="relative w-full flex flex-col items-center justify-center px-5 sm:px-8 md:px-12 py-20 sm:py-28 bg-[#F8F6F0] border-t-2 border-[#111215] overflow-hidden select-none selection:bg-[#D2FF3A] selection:text-[#111215] transition-colors duration-700"
    >
      {/* Background Subtle Neo-Brutalist Grid Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: 'radial-gradient(#111215 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        {/* Section Heading */}
        <FadeIn delay={0.06} y={25} className="w-full text-center">
          <h2 className="hero-heading font-black uppercase tracking-tight text-center text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-none text-[#181924] max-w-5xl mx-auto">
            {current.headline || 'ABOUT ONSET MEDIA'}
          </h2>
        </FadeIn>

        {/* Decorative Divider */}
        <FadeIn delay={0.1} y={15}>
          <div className="w-20 h-1.5 bg-[#111215] my-8 sm:my-10 mx-auto rounded-full shadow-[2px_2px_0px_#D2FF3A]" />
        </FadeIn>

        {/* Studio Story Grid (Two-Column Neo-Brutalist Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Main Story Narrative Card */}
          <FadeIn delay={0.15} y={20} className="lg:col-span-7 flex flex-col">
            <div className="funky-card flex-1 rounded-[28px] bg-white border-2 border-[#111215] p-7 sm:p-9 flex flex-col justify-between shadow-[5px_5px_0px_#111215] relative group">
              <div className="space-y-4 text-sm sm:text-base text-[#2E313D] leading-relaxed font-sans">
                <p className="font-medium">
                  {current.paragraph1}
                </p>
                {current.paragraph2 && (
                  <p className="text-[#5C6F74] font-normal">
                    {current.paragraph2}
                  </p>
                )}
              </div>

              {/* Informative Capabilities Note at Bottom of Card */}
              <div className="mt-8 pt-5 border-t border-[#111215]/10 flex items-center gap-2 text-xs font-mono text-[#5C6F74]">
                <Globe className="w-4 h-4 text-[#75B4B7]" />
                <span>Worldwide Capabilities · Stadium &amp; Brand Inquiries</span>
              </div>
            </div>
          </FadeIn>

          {/* Quick Metrics Column */}
          <FadeIn delay={0.2} y={20} className="lg:col-span-5 flex flex-col gap-4 justify-between">
            <div className="grid grid-cols-2 gap-3.5 h-full">
              {current.stats.map((stat: AboutUsStat, idx: number) => {
                const colors = ['#D2FF3A', '#75B4B7', '#F2C17D', '#EFECE1'];
                const bg = colors[idx % colors.length];
                return (
                  <div
                    key={stat.id || idx}
                    onClick={handleStatClick}
                    className="funky-card rounded-2xl bg-white border-2 border-[#111215] p-5 flex flex-col justify-center items-center text-center shadow-[4px_4px_0px_#111215] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#111215] cursor-pointer transition-all duration-200 group"
                  >
                    <span 
                      style={{ backgroundColor: bg }} 
                      className="font-black font-sans text-2xl sm:text-3xl text-[#111215] px-2.5 py-0.5 rounded-lg border border-[#111215] shadow-xs group-hover:scale-105 transition-transform"
                    >
                      {stat.value}
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase text-[#5C6F74] mt-2 tracking-wider leading-tight">
                      {stat.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};
