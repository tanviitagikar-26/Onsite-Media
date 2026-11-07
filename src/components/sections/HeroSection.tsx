import React from 'react';
import { HeroBrandVideo } from '../ui/HeroBrandVideo';
import { ContactButton } from '../ui/ContactButton';
import { ONSET_MEDIA_BRAND_VIDEO_URL } from '../../data/initialData';

interface HeroSectionProps {
  onOpenContact?: () => void;
  onOpenAdmin?: () => void;
  onOpenShowreel?: () => void;
  heroPhoto?: string | null;
  heroVideo?: string | null;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenContact,
  heroVideo,
}) => {
  const activeVideoSrc =
    heroVideo && heroVideo.trim() !== '' ? heroVideo : ONSET_MEDIA_BRAND_VIDEO_URL;

  return (
    <section
      id="home"
      className="relative h-screen w-full flex flex-col justify-between overflow-x-clip select-none bg-[#030202] selection:bg-[#75B4B7] selection:text-[#111215]"
    >
      {/* 0. HERO SECTION BACKGROUND VIDEO:
          Plays the uploaded video or authentic default Onset Media brand video.
          Seamless loop, silent, high-fidelity object-cover canvas/video fallback. */}
      <div className="absolute inset-0 z-0 opacity-100 pointer-events-none transition-opacity duration-1000">
        <HeroBrandVideo videoSrc={activeVideoSrc} />
      </div>

      {/* Ambient teal glow harmonizing Home section with POPULAR palette (#75B4B7) */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#75B4B7]/25 via-[#75B4B7]/5 to-transparent pointer-events-none z-10" />

      {/* 1. UPPER CORNER 'GET IN TOUCH' BUTTON (HERO SECTION ONLY - NOT ON EVERY PAGE):
          High-contrast highlight button (#FFE043) standing out clearly against the dark video background. */}
      <header className="relative z-30 w-full pt-4 sm:pt-6 md:pt-8 px-4 sm:px-6 md:px-8 flex justify-end items-start pointer-events-none">
        <div className="pointer-events-auto">
          <ContactButton
            onClick={onOpenContact}
            label="GET IN TOUCH"
            variant="highlight"
          />
        </div>
      </header>

      {/* HERO CENTER: Spacious cinematic canvas allowing the hero video to command focus */}
      <div className="flex-1 w-full" aria-hidden="true" />
    </section>
  );
};
