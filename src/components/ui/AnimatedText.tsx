import React, { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

interface AnimatedTextProps {
  text: string;
  className?: string;
}

interface CharProps {
  char: string;
  progress: MotionValue<number>;
  range: [number, number];
}

const AnimatedChar: React.FC<CharProps> = ({ char, progress, range }) => {
  const opacity = useTransform(progress, range, [0.25, 1]);

  if (char === ' ') {
    return <span>&nbsp;</span>;
  }

  return (
    <span className="relative inline-block">
      <span className="opacity-0 select-none pointer-events-none">{char}</span>
      <motion.span
        style={{ opacity }}
        className="absolute inset-0 select-text"
      >
        {char}
      </motion.span>
    </span>
  );
};

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.85', 'end 0.25'],
  });

  const rawParagraphs = text.split(/\n+/).filter(Boolean);
  const totalChars = text.length || 1;
  let charCounter = 0;

  return (
    <div
      ref={containerRef}
      className={`text-[#44455F] font-light text-center leading-relaxed sm:leading-loose text-base sm:text-lg md:text-xl max-w-2xl sm:max-w-3xl mx-auto px-4 space-y-4 sm:space-y-6 ${className}`}
    >
      {rawParagraphs.map((paraText, pIdx) => {
        const words = paraText.split(/\s+/).filter(Boolean);
        return (
          <p key={pIdx} className="leading-relaxed sm:leading-loose">
            {words.map((word, wordIdx) => {
              const wordChars = word.split('');
              const renderedWord = (
                <span key={wordIdx} className="inline-block whitespace-nowrap mr-[0.28em]">
                  {wordChars.map((char) => {
                    const charIndex = charCounter++;
                    const start = charIndex / totalChars;
                    const end = Math.min(1, (charIndex + 2) / totalChars);
                    return (
                      <AnimatedChar
                        key={charIndex}
                        char={char}
                        progress={scrollYProgress}
                        range={[start, end]}
                      />
                    );
                  })}
                </span>
              );
              // Account for the space character in counter
              charCounter++;
              return renderedWord;
            })}
          </p>
        );
      })}
    </div>
  );
};
