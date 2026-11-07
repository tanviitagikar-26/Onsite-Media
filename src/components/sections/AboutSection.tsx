import React from 'react';
import confetti from 'canvas-confetti';
import { FadeIn } from '../ui/FadeIn';
import { AnimatedText } from '../ui/AnimatedText';
import { ContactButton } from '../ui/ContactButton';
import { Flame, Sparkles, Zap, Award } from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';
import { ASSETS, AboutData, INITIAL_ABOUT } from '../../data/initialData';

interface AboutSectionProps {
  onOpenContact: () => void;
  founderPhoto?: string | null;
  aboutData?: AboutData;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  onOpenContact,
  founderPhoto,
  aboutData = INITIAL_ABOUT,
}) => {
  const currentAbout = aboutData || INITIAL_ABOUT;
  const rawFounderPhoto = (currentAbout.founderPhoto && currentAbout.founderPhoto.trim() !== '')
    ? currentAbout.founderPhoto
    : (founderPhoto && founderPhoto.trim() !== '')
      ? founderPhoto
      : ASSETS.heroPortrait;
  const photoSrc = rawFounderPhoto || ASSETS.heroPortrait;
  const aboutParagraph = currentAbout.paragraph || INITIAL_ABOUT.paragraph;

  const handleStampClick = (label: string) => {
    soundFX.playHype();
    confetti({
      particleCount: 35,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#75B4B7', '#5D616B', '#F1E9D7', '#111215'],
    });
  };

  return (
    <section
      id="about"
      className="relative min-h-screen w-full flex flex-col items-center justify-center px-5 sm:px-8 md:px-12 py-24 sm:py-32 bg-[#F1E9D7] rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] border-t-2 border-[#111215] overflow-hidden select-none selection:bg-[#75B4B7] selection:text-[#111215] transition-colors duration-700"
    >
      {/* Center Content: Heading, Arranged Text, Photo beneath, Metrics & CTA */}
      <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto w-full text-center">

        {/* Section Heading */}
        <FadeIn delay={0.06} y={25} className="w-full">
          <h2 className="hero-heading font-black uppercase tracking-tight text-center text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-none text-[#181924]">
            {currentAbout.headline || 'MEET THE FOUNDER'}
          </h2>
        </FadeIn>

        {/* Decorative subtle accent line */}
        <FadeIn delay={0.1} y={15}>
          <div className="w-16 h-1 bg-[#5D616B] my-6 sm:my-8 mx-auto rounded-full shadow-[2px_2px_0px_#75B4B7]" />
        </FadeIn>

        {/* Founder Portrait Photo placed directly below heading and accent line */}
        <FadeIn delay={0.14} y={20} className="mb-6 sm:mb-8">
          <div className="relative group inline-block">
            {/* Neo-brutalist decorative sticker backdrop - responsive enlarged portrait fit */}
            <div className="w-48 h-56 sm:w-60 sm:h-68 md:w-72 md:h-80 max-w-full rounded-[28px] sm:rounded-[32px] overflow-hidden border-3 border-[#111215] bg-white shadow-[6px_6px_0px_#111215] group-hover:shadow-[8px_8px_0px_#75B4B7] group-hover:-translate-y-1 transition-all duration-300 relative mx-auto">
              {photoSrc ? (
                <img
                  src={photoSrc}
                  alt="Founder - Onset Media"
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';
                  }}
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </FadeIn>

        {/* Arranged Paragraph (Founder description placed right beneath the photo) */}
        <FadeIn delay={0.2} y={20} className="w-full mb-8 sm:mb-10">
          <AnimatedText text={aboutParagraph} />
        </FadeIn>

        {/* Funky Metric Stamps with Clickable Hype Reaction */}
        <FadeIn delay={0.28} y={20} className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={() => handleStampClick('trench')}
            className="funky-sticker bg-white hover:bg-[#75B4B7] text-[#111215] px-3.5 py-2 rounded-2xl flex items-center gap-2 text-xs sm:text-sm font-mono font-bold -rotate-1 cursor-pointer transition-all border-2 border-[#111215] shadow-[2px_2px_0px_#111215] active:scale-95"
          >
            <Flame className="w-4 h-4 text-[#75B4B7]" />
            <span>5+ YRS IN THE TRENCHES</span>
          </button>
          <button
            onClick={() => handleStampClick('skip')}
            className="funky-sticker bg-white hover:bg-[#75B4B7] text-[#111215] px-3.5 py-2 rounded-2xl flex items-center gap-2 text-xs sm:text-sm font-mono font-bold rotate-1 cursor-pointer transition-all border-2 border-[#111215] shadow-[2px_2px_0px_#111215] active:scale-95"
          >
            <Award className="w-4 h-4 text-[#75B4B7]" />
            <span>0% SKIP RATE</span>
          </button>
        </FadeIn>
      </div>
    </section>
  );
};
