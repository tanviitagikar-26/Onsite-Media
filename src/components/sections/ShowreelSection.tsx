import React, { useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Sparkles, Tv } from 'lucide-react';
import { FadeIn } from '../ui/FadeIn';
import { ShowreelData } from '../../types';
import { soundFX } from '../../utils/soundEffects';

interface ShowreelSectionProps {
  showreel: ShowreelData;
  onOpenContact: () => void;
  originalPhoto?: string | null;
}

export const ShowreelSection: React.FC<ShowreelSectionProps> = ({
  showreel,
  onOpenContact,
  originalPhoto,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isCrtMode, setIsCrtMode] = useState(false);

  const togglePlay = () => {
    soundFX.playPop();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleCrt = () => {
    soundFX.playScratch();
    setIsCrtMode((prev) => !prev);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 1;
    setProgress((current / dur) * 100);
  };

  const requestFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <section
      id="specialist"
      className="bg-[#FAF8F3] py-20 sm:py-28 px-5 sm:px-8 md:px-10 border-t-2 border-[#111215] relative select-none"
    >
      <span id="showreel" className="absolute -top-10" aria-hidden="true" />
      <div className="max-w-6xl mx-auto w-full">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
          <FadeIn delay={0} y={20}>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-[#111215] tracking-tight">
              SPECIALIST IN
            </h2>
            <p className="text-xs sm:text-sm font-mono text-[#5C6F74] uppercase tracking-wider mt-1">
              {showreel.title} · 4K Motion, CGI &amp; Concert Cinematography
            </p>
          </FadeIn>
          <FadeIn delay={0.1} y={20} className="flex items-center gap-3">
            <button
              onClick={toggleCrt}
              title="Toggle retro CRT scanlines"
              className={`funky-sticker text-xs font-mono font-bold uppercase px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all ${
                isCrtMode
                  ? 'bg-[#111215] text-[#D2FF3A]'
                  : 'bg-white text-[#111215] hover:bg-[#D2FF3A]'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>{isCrtMode ? 'CRT: ON' : 'CRT RETRO'}</span>
            </button>
            <p className="text-xs sm:text-sm text-[#5C6F74] font-mono">
              Runtime {showreel.duration}
            </p>
          </FadeIn>
        </div>

        {/* Video Canvas Container with Neo-Brutalist Frame */}
        <FadeIn delay={0.2} y={30} className="w-full relative">
          {/* Funky Tape Warning in corner */}
          <div className="funky-tape absolute -top-3 -right-2 z-20 px-3.5 py-1 text-[10px] font-mono font-black uppercase text-[#111215] shadow-md rotate-2 hidden sm:block">
            📼 MASTER REEL · 60 FPS
          </div>

          <div className="relative w-full aspect-video rounded-3xl sm:rounded-[36px] overflow-hidden bg-[#111215] border-2 border-[#111215] shadow-[6px_6px_0px_#111215] group">
            {showreel.videoUrl && showreel.videoUrl.trim() !== '' ? (
              <video
                ref={videoRef}
                src={showreel.videoUrl}
                poster={(originalPhoto || showreel.thumbnailUrl) || undefined}
                playsInline
                loop
                muted={isMuted}
                onTimeUpdate={handleTimeUpdate}
                onClick={togglePlay}
                className="w-full h-full object-cover cursor-pointer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/50 font-mono text-sm">
                Reel unavailable
              </div>
            )}

            {/* Optional Retro CRT Scanlines Overlay */}
            {isCrtMode && (
              <div className="absolute inset-0 crt-scanlines z-10 pointer-events-none" />
            )}

            {/* Camcorder MiniDV OSD HUD Overlay */}
            <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none z-10 text-[10px] sm:text-xs font-mono font-bold text-white/80 uppercase">
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-md">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span>REC 00:04:19:08</span>
              </div>
              <div className="flex items-center gap-3 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-md">
                <span>SP 60FPS</span>
                <span>BATTERY [■■■]</span>
              </div>
            </div>

            {/* Ambient Play Overlay button when paused */}
            {!isPlaying && (
              <div
                onClick={togglePlay}
                className="absolute inset-0 bg-[#111215]/40 backdrop-blur-[2px] flex items-center justify-center cursor-pointer transition-all duration-300 z-10"
              >
                <div className="funky-sticker w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#D2FF3A] hover:bg-white text-[#111215] border-2 border-[#111215] flex items-center justify-center group-hover:scale-105 transition-all duration-300 shadow-2xl">
                  <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1 fill-[#111215]" />
                </div>
              </div>
            )}

            {/* Cinematic bottom control bar */}
            <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-t from-black/95 via-black/50 to-transparent flex flex-col gap-3 opacity-95 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
              {/* Progress Line */}
              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#D2FF3A] to-[#FF5500] transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between text-white text-xs tracking-wider">
                <div className="flex items-center gap-4">
                  <button
                    onClick={togglePlay}
                    className="p-1 hover:text-[#D2FF3A] transition-colors focus:outline-none cursor-pointer"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
                  </button>
                  <button
                    onClick={toggleMute}
                    className="p-1 hover:text-[#D2FF3A] transition-colors focus:outline-none cursor-pointer"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <span className="font-mono text-[#D2FF3A] text-[11px] font-bold">4K 60FPS · CINEMATIC CUT</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={requestFullscreen}
                    className="p-1 hover:text-[#D2FF3A] transition-colors focus:outline-none cursor-pointer"
                    title="Fullscreen"
                  >
                    <Maximize2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
