import React, { useEffect, useRef, useState } from 'react';

interface HeroBrandVideoProps {
  className?: string;
  videoSrc?: string;
}

/**
 * Polished brand-logo video for Onset Media Production House.
 * Displays the exact brand-logo video uploaded for the hero section:
 * - Direct MP4 playback of `/onset-media-brand-video.mp4`
 * - Deep pitch-black obsidian space backdrop
 * - Curved golden planet horizon arc rising at the base
 * - Glowing white stylized logo glyph with reflective warm gold rim lighting
 * - "Onset Media" blooming in vibrant prestige gold typography
 * - "Production House" in crisp clean white directly beneath
 * - Smooth camera drift, ambient golden dust embers, seamless silent loop
 * - Automatic high-fidelity Canvas fallback ensuring 100% reliability
 */
export const HeroBrandVideo: React.FC<HeroBrandVideoProps> = ({
  className = '',
  videoSrc = '/onset-media-brand-video.mp4',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Attempt video auto-play whenever videoSrc changes
  useEffect(() => {
    if (!videoSrc) return;
    setVideoError(false);
    setVideoLoaded(false);
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.load();
      video.play().catch(() => {
        // Autoplay policy or playback restriction: keep muted and fallback to canvas if error
      });
    }
  }, [videoSrc]);

  // High-fidelity procedural canvas fallback matching exact 7-second video animation
  useEffect(() => {
    // If video element is actively playing and no error, canvas rendering can sleep
    if (videoLoaded && !videoError) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Ambient golden dust embers
    const embers = Array.from({ length: 36 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.8,
      speedY: -(Math.random() * 0.35 + 0.15),
      speedX: (Math.random() - 0.5) * 0.2,
      alpha: Math.random() * 0.6 + 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.01,
      phase: Math.random() * Math.PI * 2,
    }));

    const loopDuration = 7000; // 7-second exact loop
    const startTime = performance.now();

    const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));
    const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

    const render = (now: number) => {
      const elapsed = (now - startTime) % loopDuration;
      const t = elapsed / 1000; // seconds 0 to 7

      // Master fade in (0.3s - 1.3s) and out (5.2s - 6.8s)
      let masterAlpha = 1;
      if (t < 0.3) {
        masterAlpha = 0;
      } else if (t < 1.3) {
        masterAlpha = easeInOut((t - 0.3) / 1.0);
      } else if (t > 5.2) {
        masterAlpha = clamp(1 - easeInOut((t - 5.2) / 1.6));
      }

      const horizonAlpha = clamp((t - 0.4) / 1.1) * masterAlpha;
      const markAlpha = easeInOut(clamp((t - 0.7) / 1.2)) * masterAlpha;
      const textAlpha = easeInOut(clamp((t - 1.8) / 1.0)) * masterAlpha;

      // Camera drift
      const drift = t / 7.0;
      const scale = 1.0 + Math.sin(drift * Math.PI) * 0.035;
      const cameraY = -Math.sin(drift * Math.PI) * 6;

      ctx.clearRect(0, 0, width, height);

      // 1. Deep Obsidian Space Backdrop
      ctx.fillStyle = '#020204';
      ctx.fillRect(0, 0, width, height);

      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height * 0.44 + cameraY,
        width * 0.05,
        width / 2,
        height * 0.5,
        width * 0.75
      );
      bgGrad.addColorStop(0, '#121216');
      bgGrad.addColorStop(0.55, '#070709');
      bgGrad.addColorStop(1, '#000000');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Golden Curved Horizon Arc at the Bottom
      if (horizonAlpha > 0.01) {
        ctx.save();
        ctx.globalAlpha = horizonAlpha;
        const horizonY = height * 0.90;
        const horizonRadiusX = width * 0.82;
        const horizonRadiusY = height * 0.32;

        const horizonGrad = ctx.createRadialGradient(
          width / 2,
          horizonY + 30,
          10,
          width / 2,
          horizonY,
          width * 0.65
        );
        horizonGrad.addColorStop(0, 'rgba(255, 184, 0, 0.42)');
        horizonGrad.addColorStop(0.25, 'rgba(255, 119, 0, 0.20)');
        horizonGrad.addColorStop(0.65, 'rgba(20, 20, 24, 0.05)');
        horizonGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.ellipse(width / 2, horizonY + 70, horizonRadiusX, horizonRadiusY, 0, 0, Math.PI * 2);
        ctx.fillStyle = horizonGrad;
        ctx.fill();

        // Sharp golden rim line
        ctx.beginPath();
        ctx.ellipse(width / 2, horizonY + 60, horizonRadiusX * 0.88, horizonRadiusY * 0.8, 0, Math.PI * 1.16, Math.PI * 1.84);
        ctx.strokeStyle = '#F5C518';
        ctx.lineWidth = 2.2;
        ctx.shadowColor = '#FFC837';
        ctx.shadowBlur = 14;
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(width / 2, horizonY + 60, horizonRadiusX * 0.82, horizonRadiusY * 0.79, 0, Math.PI * 1.2, Math.PI * 1.8);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.0;
        ctx.shadowBlur = 8;
        ctx.stroke();

        ctx.restore();
      }

      // 3. Floating Ambient Gold Dust Embers
      if (masterAlpha > 0.05) {
        ctx.save();
        embers.forEach((p) => {
          p.y += p.speedY;
          p.x += p.speedX;
          p.phase += p.pulseSpeed;

          if (p.y < 0) p.y = height;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;

          const dynamicAlpha = Math.max(0.05, p.alpha * masterAlpha * (0.6 + Math.sin(p.phase) * 0.4));
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(242, 193, 125, ${dynamicAlpha})`;
          ctx.shadowColor = '#FFC837';
          ctx.shadowBlur = 6;
          ctx.fill();
        });
        ctx.restore();
      }

      // 4. Center Brand Lockup: Stylized White Glyph + Gold "Onset Media" + White "Production House"
      ctx.save();
      ctx.translate(width / 2, height * 0.44 + cameraY);
      ctx.scale(scale, scale);

      // Glowing Stylized Logo Mark
      if (markAlpha > 0.01) {
        ctx.save();
        ctx.globalAlpha = markAlpha;
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 24;

        ctx.fillStyle = '#FFFFFF';
        // Exact geometric glyph contour
        ctx.beginPath();
        ctx.moveTo(33, -26);
        ctx.lineTo(33, -86);
        ctx.lineTo(5, -86);
        ctx.lineTo(5, -26);
        ctx.lineTo(-75, -26);
        // Rounded left tip
        ctx.arc(-75, -12, 14, -Math.PI / 2, Math.PI / 2, true);
        ctx.lineTo(-15.5, 2);
        // Outer loop arc
        ctx.arc(33, 30, 56, Math.PI * 1.16, -Math.PI / 2, false);
        ctx.closePath();

        // Inner circle counter (drawn counter-clockwise)
        ctx.moveTo(33 + 28, 30);
        ctx.arc(33, 30, 28, 0, Math.PI * 2, true);
        ctx.fill('evenodd');

        // Warm gold rim highlight on lower curve of loop matching video
        ctx.strokeStyle = '#F5C518';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#FFC837';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(33, 30, 42, Math.PI * 0.45, Math.PI * 1.05);
        ctx.stroke();

        ctx.restore();
      }

      // Brand Typography
      if (textAlpha > 0.01) {
        ctx.save();
        ctx.globalAlpha = textAlpha;
        ctx.textAlign = 'center';

        // "Onset Media" in rich glowing gold
        ctx.font = '900 32px system-ui, -apple-system, BlinkMacSystemFont, "Kanit", sans-serif';
        ctx.fillStyle = '#FFC837';
        ctx.shadowColor = 'rgba(255, 200, 55, 0.7)';
        ctx.shadowBlur = 14;
        ctx.fillText('Onset Media', 0, 82);

        // "Production House" in elegant clean white
        ctx.font = '400 14px system-ui, -apple-system, BlinkMacSystemFont, "Kanit", sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 4;
        ctx.letterSpacing = '3px';
        ctx.fillText('Production House', 0, 108);

        ctx.restore();
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [videoLoaded, videoError]);

  return (
    <div
      className={`relative w-full h-full overflow-hidden select-none pointer-events-none bg-[#020204] ${className}`}
      aria-hidden="true"
    >
      {/* 1. Direct High-Fidelity MP4 Video Element */}
      {Boolean(videoSrc && videoSrc.trim() !== '') && !videoError && (
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          onError={() => setVideoError(true)}
          className={`w-full h-full object-cover transition-opacity duration-700 ${
            videoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* 2. Seamless Canvas Fallback matching exact animation if video is loading or unsupported */}
      {(!videoLoaded || videoError) && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full block object-cover"
        />
      )}

      {/* Subtle cinematic vignette */}
      <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/40 pointer-events-none" />
    </div>
  );
};
