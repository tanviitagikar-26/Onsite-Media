import React from 'react';

interface LiveProjectButtonProps {
  onClick?: () => void;
  label?: string;
  className?: string;
}

export const LiveProjectButton: React.FC<LiveProjectButtonProps> = ({
  onClick,
  label = 'Live Project',
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border border-[#44455F]/30 hover:border-[#44455F] bg-[#FAF8F3] hover:bg-[#44455F] text-[#44455F] hover:text-[#FAF8F3] shadow-[0_2px_10px_rgba(68,69,95,0.06)] hover:shadow-[0_8px_20px_rgba(68,69,95,0.15)] font-medium uppercase tracking-widest px-7 py-2.5 sm:px-9 sm:py-3 text-xs sm:text-sm active:scale-[0.98] transition-all duration-300 cursor-pointer inline-flex items-center justify-center whitespace-nowrap shrink-0 ${className}`}
    >
      <span>{label}</span>
    </button>
  );
};
