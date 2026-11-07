import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Project } from '../../types';
import { parseDropDescription } from '../../utils/drops';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
  onOpenContact: () => void;
  photosMap?: Record<string, string>;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  onClose,
  onOpenContact,
  photosMap = {},
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (project) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  const resolveImg = (src?: string): string | null => {
    if (!src || !src.trim()) return null;
    if (photosMap[src]) return photosMap[src];
    return src;
  };

  const heroShot = resolveImg(project.col2Image);
  const detail1 = resolveImg(project.col1Image1);
  const detail2 = resolveImg(project.col1Image2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-[#44455F]/60 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-5xl rounded-[32px] sm:rounded-[48px] bg-[#FAF8F3] border border-[#DCD9B8] p-6 sm:p-10 text-[#44455F] shadow-[0_30px_90px_rgba(68,69,95,0.25)] max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 sm:top-8 sm:right-8 w-11 h-11 rounded-full bg-[#EFECE1] hover:bg-[#DCD9B8] border border-[#DCD9B8] flex items-center justify-center text-[#44455F] transition-colors cursor-pointer z-20"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="pb-6 border-b border-[#DCD9B8] pr-12">
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-[#44455F] tracking-tight">
            {project.name}
          </h2>
        </div>

        {/* Drops 3-Field Description */}
        {(() => {
          const desc = parseDropDescription(project);
          return (
            <div className="py-6 border-b border-[#DCD9B8]">
              <div className="flex flex-col gap-2 font-mono text-sm sm:text-base text-[#5C6F74] max-w-3xl leading-relaxed">
                <div>
                  <span className="font-bold text-[#111215]">Artist name:</span>{' '}
                  <span className="text-[#181924]">{desc.artistName}</span>
                </div>
                <div>
                  <span className="font-bold text-[#111215]">Live at:</span>{' '}
                  <span className="text-[#181924]">{desc.liveAt}</span>
                </div>
                <div>
                  <span className="font-bold text-[#111215]">Artist&apos;s description:</span>{' '}
                  <span className="text-[#5C6F74]">{desc.artistDescription}</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Media Gallery Showcase */}
        <div className="flex flex-col gap-6 pt-2">
          {/* Main Hero Shot or Video Showcase */}
          {project.videoUrl && project.videoUrl.trim() !== '' ? (
            <div className="w-full rounded-3xl overflow-hidden bg-black/90 border border-[#DCD9B8] shadow-sm relative">
              <video
                src={project.videoUrl}
                poster={heroShot || undefined}
                controls
                autoPlay
                playsInline
                className="w-full h-auto max-h-[550px] object-contain mx-auto"
              />
            </div>
          ) : heroShot ? (
            <div className="w-full rounded-3xl overflow-hidden bg-[#EFECE1] border border-[#DCD9B8] shadow-sm">
              <img
                src={heroShot}
                alt={`${project.name} Main High-Res Render`}
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover max-h-[550px]"
              />
            </div>
          ) : null}

          {/* Secondary Details Grid - 2 Photos */}
          {(detail1 || detail2) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {detail1 && (
                <div className="rounded-3xl overflow-hidden bg-[#EFECE1] border border-[#DCD9B8] shadow-sm">
                  <img
                    src={detail1}
                    alt={`${project.name} Detail 1`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover max-h-[380px]"
                  />
                </div>
              )}
              {detail2 && (
                <div className="rounded-3xl overflow-hidden bg-[#EFECE1] border border-[#DCD9B8] shadow-sm">
                  <img
                    src={detail2}
                    alt={`${project.name} Detail 2`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover max-h-[380px]"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-8 mt-8 border-t border-[#DCD9B8]">
          <div className="text-xs text-[#8FA3A8] font-mono">
            Visual Direction &amp; Asset Creation by Onsetmedia · Onset Media
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                onClose();
                onOpenContact();
              }}
              className="px-6 py-2.5 rounded-full bg-[#44455F] text-[#FAF8F3] font-medium text-xs uppercase tracking-widest hover:bg-[#323348] shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              Inquire Similar Work
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
