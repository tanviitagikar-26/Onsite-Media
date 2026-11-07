import React from 'react';
import { soundFX } from '../../utils/soundEffects';

interface ContactButtonProps {
  onClick?: () => void;
  label?: string;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'highlight' | 'dark';
}

export const ContactButton: React.FC<ContactButtonProps> = ({
  onClick,
  label = 'GET IN TOUCH',
  className = '',
  type = 'button',
  variant = 'highlight',
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    soundFX.playPop();
    if (onClick) onClick();
  };

  const isHighlight = variant === 'highlight';

  return (
    <button
      type={type}
      onClick={handleClick}
      aria-label={label}
      className={`funky-button rounded-2xl font-black uppercase tracking-wider px-5 py-2.5 sm:px-7 sm:py-3 text-xs sm:text-sm cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 group transition-all duration-200 ${
        isHighlight
          ? 'bg-[#FFE043] text-[#111215] border-2 border-[#111215] shadow-[4px_4px_0px_#111215] drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)] hover:bg-white hover:text-[#111215] hover:shadow-[6px_6px_0px_#111215]'
          : 'bg-[#181924] text-[#FAF8F3] border-2 border-[#111215] hover:bg-[#FFE043] hover:text-[#111215] hover:border-[#111215]'
      } ${className}`}
    >
      <span className="font-extrabold">{label}</span>
      <span
        aria-hidden="true"
        className={`text-sm sm:text-base font-bold ${
          isHighlight ? 'text-[#111215]' : 'text-[#FFE043] group-hover:text-[#111215]'
        } group-hover:rotate-45 transition-transform duration-200 inline-block leading-none`}
      >
        ✦
      </span>
    </button>
  );
};
