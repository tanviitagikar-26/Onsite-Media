import React, { useRef, useState, useEffect, ReactNode } from 'react';

interface MagnetProps {
  children: ReactNode;
  padding?: number;
  strength?: number;
  activeTransition?: string;
  inactiveTransition?: string;
  className?: string;
}

export const Magnet: React.FC<MagnetProps> = ({
  children,
  padding = 150,
  strength = 3,
  activeTransition = 'transform 0.3s ease-out',
  inactiveTransition = 'transform 0.6s ease-in-out',
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Distance from mouse to center
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;

      // Bounds with padding
      const withinX =
        e.clientX >= rect.left - padding && e.clientX <= rect.right + padding;
      const withinY =
        e.clientY >= rect.top - padding && e.clientY <= rect.bottom + padding;

      if (withinX && withinY) {
        setIsHovered(true);
        // Magnetic pull divided by strength factor
        setPosition({
          x: distX / strength,
          y: distY / strength,
        });
      } else {
        setIsHovered(false);
        setPosition({ x: 0, y: 0 });
      }
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      setPosition({ x: 0, y: 0 });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [padding, strength]);

  return (
    <div
      ref={ref}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        transition: isHovered ? activeTransition : inactiveTransition,
        willChange: 'transform',
      }}
      className={`inline-block ${className}`}
    >
      {children}
    </div>
  );
};
