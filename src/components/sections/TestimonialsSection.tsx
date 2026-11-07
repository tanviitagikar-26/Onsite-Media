import React, { useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import { ChevronLeft, ChevronRight, Star, Quote, CheckCircle2 } from 'lucide-react';
import { FadeIn } from '../ui/FadeIn';
import { Testimonial } from '../../types';
import { soundFX } from '../../utils/soundEffects';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  testimonials,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reactions, setReactions] = useState<Record<string, number>>({
    '🔥': 48,
    '🚀': 32,
    '🤯': 19,
    '💯': 56,
  });

  // Sort testimonials by their numerical order so they always strictly follow user order (1, 2, 3...)
  const sortedTestimonials = useMemo(() => {
    if (!testimonials || testimonials.length === 0) return [];
    return [...testimonials].sort((a, b) => {
      const ordA = typeof a.order === 'number' ? a.order : 999;
      const ordB = typeof b.order === 'number' ? b.order : 999;
      return ordA - ordB;
    });
  }, [testimonials]);

  if (sortedTestimonials.length === 0) return null;

  // Clamp index within bounds
  const safeIndex = Math.min(Math.max(0, currentIndex), sortedTestimonials.length - 1);
  const current = sortedTestimonials[safeIndex];

  // Navigate backwards: 3 -> 2 -> 1 -> 3
  const handlePrev = () => {
    soundFX.playPop();
    setCurrentIndex((prev) => (prev === 0 ? sortedTestimonials.length - 1 : prev - 1));
  };

  // Navigate forwards: 1 -> 2 -> 3 -> 1
  const handleNext = () => {
    soundFX.playPop();
    setCurrentIndex((prev) => (prev === sortedTestimonials.length - 1 ? 0 : prev + 1));
  };

  const handleReaction = (emoji: string, e: React.MouseEvent) => {
    soundFX.playHype();
    setReactions((prev) => ({
      ...prev,
      [emoji]: (prev[emoji] || 0) + 1,
    }));

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    confetti({
      particleCount: 25,
      spread: 50,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      },
      colors: ['#75B4B7', '#5D616B', '#F1E9D7', '#111215'],
    });
  };

  return (
    <section
      id="testimonials"
      className="bg-[#F1E9D7] text-[#181924] py-24 sm:py-32 px-5 sm:px-8 md:px-10 border-t-2 border-[#111215] relative z-10 select-none selection:bg-[#75B4B7] selection:text-[#111215]"
    >
      <div className="max-w-5xl mx-auto w-full">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 sm:mb-16 gap-6">
          <FadeIn delay={0} y={20}>

            <h2 className="text-3xl sm:text-5xl font-black uppercase text-[#181924] tracking-tight">
              RATINGS &amp; REVIEWS
            </h2>
          </FadeIn>

          {/* Slider controls */}
          <FadeIn delay={0.1} y={20} className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#5D616B] mr-2 tabular-nums font-bold">
              0{safeIndex + 1} / 0{sortedTestimonials.length}
            </span>
            <button
              onClick={handlePrev}
              className="funky-sticker w-11 h-11 rounded-2xl bg-white hover:bg-[#75B4B7] text-[#111215] flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95 border-2 border-[#111215]"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="funky-sticker w-11 h-11 rounded-2xl bg-white hover:bg-[#75B4B7] text-[#111215] flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95 border-2 border-[#111215]"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </FadeIn>
        </div>

        {/* Feedback Card */}
        <FadeIn delay={0.2} y={30} className="w-full relative">


          <div className="rounded-[36px] bg-white border-2 border-[#111215] p-8 sm:p-12 md:p-16 relative overflow-hidden shadow-[6px_6px_0px_#111215] hover:shadow-[8px_8px_0px_#75B4B7] transition-all">
            <Quote className="absolute top-8 right-8 w-16 h-16 sm:w-24 sm:h-24 text-[#DCD9B8]/30 pointer-events-none" />

            {/* Stars & Sender Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-1.5 text-[#FFC837]">
                {Array.from({ length: current.rating || 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#FFC837]" />
                ))}
              </div>

              <span className="funky-sticker text-[10px] font-mono font-bold uppercase bg-[#75B4B7] text-[#111215] px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-[#111215]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#111215]" />
                <span>VERIFIED COLLAB</span>
              </span>
            </div>

            {/* Quote */}
            <p className="text-lg sm:text-2xl md:text-3xl font-normal text-[#181924] leading-relaxed mb-8 sm:mb-10 font-sans">
              &ldquo;{current.quote}&rdquo;
            </p>

            {/* Emoji Reactions Bar */}
            <div className="flex flex-wrap items-center gap-2 mb-8 pt-4 border-t border-[#111215]/10">
              <span className="text-[11px] font-mono uppercase text-[#5C6F74] mr-1 font-bold">
                Tap Reactions:
              </span>
              {Object.entries(reactions).map(([emoji, count]) => (
                <button
                  key={emoji}
                  onClick={(e) => handleReaction(emoji, e)}
                  title={`React with ${emoji}`}
                  className="funky-sticker bg-white hover:bg-[#75B4B7] text-[#111215] px-3 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer active:scale-90 transition-transform border border-[#111215]/20"
                >
                  <span>{emoji}</span>
                  <span className="tabular-nums">{count}</span>
                </button>
              ))}
            </div>

            {/* Client info */}
            <div className="pt-6 border-t-2 border-[#111215]/15">
              <div className="text-base sm:text-lg font-black text-[#181924] uppercase tracking-wide">
                {current.clientName}
              </div>
              <div className="text-xs sm:text-sm text-[#5C6F74] font-medium">
                {current.role} · {current.company}
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
