import React from 'react';

export interface OnsetMediaLogoProps {
  className?: string;
  theme?: 'video' | 'black' | 'white' | 'gold';
  showSubtitle?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  layout?: 'horizontal' | 'stacked';
  showGoldenRim?: boolean;
}

/**
 * Exact replica of the Onset Media Production House logo from the reference video.
 * Features:
 * - Geometric glyph mark: vertical ascender, left wing with rounded tip, circular loop with concentric inner hole
 * - Uniform stroke width across all glyph elements
 * - Radiant gold "Onset Media" typography (#FFC837)
 * - Clean crisp white "Production House" subtitle (#FFFFFF)
 * - Optional warm golden rim reflection on the loop curve
 */
export const OnsetMediaLogo: React.FC<OnsetMediaLogoProps> = ({
  className = '',
  theme = 'video',
  showSubtitle = true,
  size = 'md',
  layout = 'horizontal',
  showGoldenRim,
}) => {
  const colorMap = {
    video: {
      mark: '#FFFFFF',
      title: '#FFC837',
      subtitle: '#FFFFFF',
      rim: '#F5C518',
    },
    black: {
      mark: '#111215',
      title: '#111215',
      subtitle: '#22232E',
      rim: '#FF5500',
    },
    white: {
      mark: '#FFFFFF',
      title: '#FFFFFF',
      subtitle: '#E5E7EB',
      rim: '#FFC837',
    },
    gold: {
      mark: '#FFC837',
      title: '#FAF8F3',
      subtitle: '#D2FF3A',
      rim: '#FFB800',
    },
  };

  const colors = colorMap[theme];
  const displayRim = showGoldenRim ?? (theme === 'video');

  // Scale based on size preset
  const sizeStyles = {
    horizontal: {
      sm: 'h-8 text-xs',
      md: 'h-11 sm:h-12 text-sm',
      lg: 'h-14 sm:h-16 text-base',
      xl: 'h-20 sm:h-24 text-lg',
    },
    stacked: {
      sm: 'w-36 text-xs',
      md: 'w-52 text-sm',
      lg: 'w-64 text-base',
      xl: 'w-80 text-lg',
    },
  };

  // Glyph SVG Mark matching exact reference video geometry
  const GlyphMark = (
    <svg
      viewBox="-100 -96 200 192"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={
        layout === 'stacked'
          ? 'w-24 sm:w-28 md:w-32 h-auto aspect-[200/192] shrink-0'
          : 'h-full w-auto aspect-[200/192] shrink-0'
      }
      aria-hidden="true"
    >
      {/* Exact Glyph Path: Vertical Stem + Rounded Left Wing + Concentric Circular Bowl */}
      <path
        d="
          M 33 -26
          L 33 -86
          L 5 -86
          L 5 -26
          L -75 -26
          A 14 14 0 0 0 -75 2
          L -15.5 2
          A 56 56 0 1 0 33 -26
          Z
          M 33 2
          A 28 28 0 1 0 33 58
          A 28 28 0 1 0 33 2
          Z
        "
        fill={colors.mark}
        fillRule="evenodd"
      />

      {/* Warm Golden Rim Highlight on bottom curve matching reference video */}
      {displayRim && (
        <path
          d="M 5 30 A 28 28 0 0 0 33 58 A 56 56 0 0 0 89 30"
          fill="none"
          stroke={colors.rim}
          strokeWidth="3.5"
          opacity="0.85"
        />
      )}
    </svg>
  );

  if (layout === 'stacked') {
    return (
      <div
        className={`flex flex-col items-center justify-center text-center select-none ${sizeStyles.stacked[size]} ${className}`}
        aria-label="Onset Media Production House"
      >
        {GlyphMark}
        <div className="flex flex-col items-center mt-3 sm:mt-4 leading-none">
          <span
            style={{ color: colors.title }}
            className="font-sans font-black tracking-[-0.02em] text-xl sm:text-2xl md:text-3xl leading-tight"
          >
            Onset Media
          </span>
          {showSubtitle && (
            <span
              style={{ color: colors.subtitle }}
              className="font-sans font-normal tracking-[0.14em] text-[10px] sm:text-xs md:text-sm mt-1 sm:mt-1.5 opacity-95 uppercase"
            >
              Production House
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-3 sm:gap-3.5 select-none ${sizeStyles.horizontal[size]} ${className}`}
      aria-label="Onset Media Production House"
    >
      {GlyphMark}

      {/* Typography: "Onset Media" & "Production House" */}
      <div className="flex flex-col justify-center leading-none text-left">
        <span
          style={{ color: colors.title }}
          className="font-sans font-black tracking-[-0.03em] text-base sm:text-xl md:text-2xl leading-[0.95]"
        >
          Onset Media
        </span>
        {showSubtitle && (
          <span
            style={{ color: colors.subtitle }}
            className="font-sans font-normal tracking-[0.08em] text-[9px] sm:text-[11px] md:text-[12px] mt-1 opacity-90 leading-tight uppercase"
          >
            Production House
          </span>
        )}
      </div>
    </div>
  );
};
