import React, { useRef, useState, useMemo } from 'react';
import {
  Volume2,
  VolumeX,
  Flame,
  Camera,
  Film,
  Eye,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Play,
  Layers,
  Briefcase,
  Music,
  Star,
  Award,
  Heart,
  Zap,
  Mic,
  Radio,
  Disc,
  Image as ImageIcon,
  Video as VideoIcon,
  Tag,
} from 'lucide-react';
import { FadeIn } from '../ui/FadeIn';
import { Project, DropType } from '../../types';
import { INITIAL_DROP_TYPES } from '../../data/initialData';
import { soundFX } from '../../utils/soundEffects';

export const RenderTypeIcon: React.FC<{ iconName?: string; className?: string }> = ({
  iconName = 'Camera',
  className = 'w-4 h-4',
}) => {
  const norm = (iconName || '').toLowerCase().trim();
  switch (norm) {
    case 'camera':
    case 'photos':
    case 'photo':
      return <Camera className={className} />;
    case 'film':
    case 'videos':
    case 'video':
      return <Film className={className} />;
    case 'briefcase':
    case 'freelancer':
    case 'work':
    case 'client':
      return <Briefcase className={className} />;
    case 'music':
    case 'concerts':
    case 'concert':
    case 'audio':
      return <Music className={className} />;
    case 'star':
    case 'featured':
      return <Star className={className} />;
    case 'award':
      return <Award className={className} />;
    case 'heart':
      return <Heart className={className} />;
    case 'zap':
    case 'energy':
      return <Zap className={className} />;
    case 'mic':
      return <Mic className={className} />;
    case 'radio':
      return <Radio className={className} />;
    case 'disc':
      return <Disc className={className} />;
    case 'image':
      return <ImageIcon className={className} />;
    case 'layers':
      return <Layers className={className} />;
    case 'flame':
    case 'fire':
      return <Flame className={className} />;
    case 'tag':
      return <Tag className={className} />;
    default:
      return <Sparkles className={className} />;
  }
};

export function isProjectInType(project: Project, type: DropType): boolean {
  // 1. Direct dropTypeId or slug match
  if (project.dropTypeId) {
    if (project.dropTypeId === type.id || project.dropTypeId === type.slug) return true;
    if (project.dropTypeId.toLowerCase() === type.name.toLowerCase()) return true;
    if (project.dropTypeId.toLowerCase() === type.slug.toLowerCase()) return true;
  }
  // 2. Direct dropTypeName match
  if (project.dropTypeName && project.dropTypeName.toLowerCase() === type.name.toLowerCase()) {
    return true;
  }
  // 3. Fallbacks if no explicit dropTypeId was set
  if (!project.dropTypeId) {
    if (type.slug === 'photos' || type.id === 'type-photos') {
      return project.mediaType !== 'videos' && !project.videoUrl;
    }
    if (type.slug === 'videos' || type.id === 'type-videos') {
      return project.mediaType === 'videos' || Boolean(project.videoUrl);
    }
    // Match by category name
    if (project.category && project.category.toLowerCase() === type.name.toLowerCase()) {
      return true;
    }
  }
  return false;
}

interface DropTileCardProps {
  project: Project;
  rankingIndex?: number;
  onOpenProject: (project: Project) => void;
  photosMap?: Record<string, string>;
}

const DropTileCard: React.FC<DropTileCardProps> = ({
  project,
  onOpenProject,
  photosMap = {},
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  const isVideo = Boolean(project.mediaType === 'videos' || project.videoUrl);

  const resolveImg = (src?: string): string | null => {
    if (!src || !src.trim()) return null;
    if (photosMap[src]) return photosMap[src];
    return src;
  };

  const previewPoster = resolveImg(project.col2Image) || resolveImg(project.col1Image1) || null;

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div
      onClick={() => onOpenProject(project)}
      className="group relative h-full bg-white border-2 border-[#111215] rounded-[30px] sm:rounded-[34px] p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-[5px_5px_0px_#111215] hover:shadow-[9px_9px_0px_#75B4B7] hover:-translate-y-1.5 select-none"
    >
      {/* Media Preview Tile */}
      <div className="relative w-full aspect-[16/11] rounded-2xl overflow-hidden border-2 border-[#111215] bg-[#EFECE1] shadow-[3px_3px_0px_#111215]">
        {isVideo && project.videoUrl && project.videoUrl.trim() !== '' ? (
          <div className="relative w-full h-full bg-black/90 flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              src={project.videoUrl}
              poster={previewPoster || undefined}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />

            {/* Sound toggle button */}
            <div className="absolute bottom-3 right-3 z-10">
              <button
                type="button"
                onClick={toggleSound}
                className="funky-sticker p-2 rounded-lg bg-white hover:bg-[#75B4B7] text-[#111215] shadow-sm transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full overflow-hidden">
            {previewPoster ? (
              <img
                src={previewPoster}
                alt={project.name}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#EFECE1] text-xs font-mono text-[#5C6F74] p-4 text-center">
                <Camera className="w-6 h-6 text-[#75B4B7] mb-1.5 opacity-60" />
                <span>PREVIEW COMING SOON</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card Footer: Only the VIEW / WATCH button */}
      <div className="pt-4 flex items-center justify-end">
        <span
          className={`funky-sticker px-3.5 py-2 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider border border-[#111215] flex items-center gap-1.5 transition-transform group-hover:translate-x-0.5 ${
            isVideo
              ? 'bg-[#111215] text-[#75B4B7] shadow-[2px_2px_0px_#111215]'
              : 'bg-[#75B4B7] text-[#111215] shadow-[2px_2px_0px_#111215]'
          }`}
        >
          {isVideo ? (
            <>
              <Play className="w-3 h-3 fill-current" />
              <span>WATCH</span>
            </>
          ) : (
            <>
              <Eye className="w-3 h-3" />
              <span>VIEW</span>
            </>
          )}
          <ArrowUpRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
};

interface ProjectsSectionProps {
  projects: Project[];
  dropTypes?: DropType[];
  onOpenProject: (project: Project) => void;
  photosMap?: Record<string, string>;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projects,
  dropTypes = INITIAL_DROP_TYPES,
  onOpenProject,
  photosMap = {},
}) => {
  // Sort dropTypes by order
  const sortedDropTypes = useMemo(() => {
    const list = dropTypes && dropTypes.length > 0 ? dropTypes : INITIAL_DROP_TYPES;
    return [...list].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [dropTypes]);

  // Active category / type ID
  const [activeTypeId, setActiveTypeId] = useState<string>(() => sortedDropTypes[0]?.id || 'type-photos');

  // Ensure activeType is always valid if list changes
  const activeType = useMemo(() => {
    const found = sortedDropTypes.find((t) => t.id === activeTypeId || t.slug === activeTypeId);
    return found || sortedDropTypes[0];
  }, [sortedDropTypes, activeTypeId]);

  // 'More' state per category ID
  const [showAllMap, setShowAllMap] = useState<Record<string, boolean>>({});

  const isExpanded = activeType ? Boolean(showAllMap[activeType.id]) : false;

  const handleToggleMore = (typeId: string) => {
    soundFX.playPop();
    setShowAllMap((prev) => ({ ...prev, [typeId]: !prev[typeId] }));
  };

  const handleSelectType = (typeId: string) => {
    soundFX.playPop();
    setActiveTypeId(typeId);
  };

  // Precompute project lists and counts for each type
  const projectsByType = useMemo(() => {
    const map = new Map<string, Project[]>();
    sortedDropTypes.forEach((type) => {
      const filtered = projects.filter((p) => isProjectInType(p, type));
      map.set(type.id, filtered);
    });
    return map;
  }, [sortedDropTypes, projects]);

  const activeProjects = activeType ? projectsByType.get(activeType.id) || [] : [];
  const visibleProjects = isExpanded ? activeProjects : activeProjects.slice(0, 3);

  return (
    <section
      id="projects"
      className="bg-[#FAF2EB] text-[#44455F] rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-10 sm:-mt-12 md:-mt-14 z-10 relative px-5 sm:px-8 md:px-10 pt-20 sm:pt-24 md:pt-32 pb-28 sm:pb-36 select-none selection:bg-[#F2C17D] selection:text-[#44455F]"
    >
      <div className="max-w-6xl mx-auto w-full">
        {/* Section Heading */}
        <FadeIn delay={0} y={30} className="w-full text-center mb-12 sm:mb-16">


          <h2 className="hero-heading font-black uppercase leading-none tracking-tight text-center text-[clamp(2.8rem,10vw,140px)] text-[#181924]">
            DROPS
          </h2>
        </FadeIn>

        {/* Dynamic Category Selector Bar: Matches Reference Design */}
        <FadeIn delay={0.1} y={20} className="w-full flex flex-col items-center mb-12 sm:mb-16">
          <div className="inline-flex flex-wrap items-center justify-center p-1.5 sm:p-2 rounded-2xl bg-white border-2 border-[#111215] shadow-[4px_4px_0px_#F2C17D] gap-1.5 sm:gap-2 max-w-full">
            {sortedDropTypes.map((type) => {
              const isSelected = activeType?.id === type.id;
              const count = (projectsByType.get(type.id) || []).length;
              const activeBg = type.color || '#F2C17D';
              const activeText = type.textColor || '#111215';

              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleSelectType(type.id)}
                  style={isSelected ? { backgroundColor: activeBg, color: activeText } : undefined}
                  className={`funky-sticker px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl font-mono font-black text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 border-2 ${
                    isSelected
                      ? 'border-[#111215] shadow-[2px_2px_0px_#111215] scale-[1.02]'
                      : 'bg-transparent text-[#5C6F74] hover:text-[#111215] border-transparent hover:bg-white/60'
                  }`}
                >
                  <RenderTypeIcon iconName={type.icon} className="w-4 h-4 shrink-0" />
                  <span>{type.name}</span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ml-1 font-bold ${
                      isSelected
                        ? 'bg-white/90 text-[#111215] border-[#111215]/30'
                        : 'bg-white/80 text-[#111215] border-[#111215]/20'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 text-[11px] font-mono text-[#8FA3A8] uppercase tracking-wider flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: activeType?.color || '#F2C17D' }}
            />
            <span>
              {activeProjects.length > 0
                ? `Showing ${isExpanded ? `All ${activeProjects.length}` : Math.min(3, activeProjects.length)} ${activeType?.name} Drops // ${activeProjects.length > 3 ? (isExpanded ? 'Click Show Top 3' : 'Click More To See All') : 'Curated Selection'}`
                : `No Drops in ${activeType?.name} yet // Add drops in Creator CMS`}
            </span>
          </div>
        </FadeIn>

        {/* DYNAMIC CATEGORY CONTENT */}
        {activeType && (
          <div className="w-full">
            {/* Category Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b-2 border-[#111215]">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl border-2 border-[#111215] flex items-center justify-center shadow-[2px_2px_0px_#111215]"
                  style={{
                    backgroundColor: activeType.color || '#75B4B7',
                    color: activeType.textColor || '#111215',
                  }}
                >
                  <RenderTypeIcon iconName={activeType.icon} className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#111215]">
                      {activeType.name}
                    </h3>
                    <span
                      className="funky-sticker text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md border border-[#111215]"
                      style={{
                        backgroundColor: activeType.color || '#75B4B7',
                        color: activeType.textColor || '#111215',
                      }}
                    >
                      {isExpanded ? `ALL ${activeProjects.length} DROPS` : activeProjects.length > 3 ? 'TOP 3 TILES' : `${activeProjects.length} DROPS`}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-[#5C6F74] uppercase">
                    {activeType.description || `${activeType.name} Production · 4K Color Grading · Master Visuals`}
                  </p>
                </div>
              </div>

              {/* Quick toggle in header */}
              {activeProjects.length > 3 && (
                <button
                  type="button"
                  onClick={() => handleToggleMore(activeType.id)}
                  className="funky-sticker px-4 py-2 rounded-xl bg-white hover:bg-[#EFF7F7] text-[#111215] font-mono text-xs font-bold uppercase border-2 border-[#111215] shadow-[2px_2px_0px_#111215] cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  {isExpanded ? (
                    <>
                      <span>SHOW TOP 3</span>
                      <ChevronUp className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <span>MORE ({activeProjects.length - 3} MORE)</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              )}
            </div>

            {/* 3 Tiles Layout Grid */}
            {activeProjects.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 w-full">
                  {visibleProjects.map((project, idx) => (
                    <FadeIn key={project.id || `${activeType.id}-${idx}`} delay={idx * 0.05} y={20} className="w-full">
                      <DropTileCard
                        project={project}
                        rankingIndex={idx}
                        onOpenProject={onOpenProject}
                        photosMap={photosMap}
                      />
                    </FadeIn>
                  ))}
                </div>

                {/* "MORE" Button below the 3 Tiles Layout */}
                {activeProjects.length > 3 && (
                  <div className="w-full flex justify-center mt-10 sm:mt-12">
                    <button
                      type="button"
                      onClick={() => handleToggleMore(activeType.id)}
                      style={{
                        backgroundColor: activeType.color || '#75B4B7',
                        color: activeType.textColor || '#111215',
                      }}
                      className="funky-sticker group px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl hover:bg-white hover:text-[#111215] font-mono font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-[#111215] shadow-[4px_4px_0px_#111215] hover:shadow-[7px_7px_0px_#75B4B7] cursor-pointer transition-all flex items-center gap-2.5 active:translate-x-0.5 active:translate-y-0.5"
                    >
                      {isExpanded ? (
                        <>
                          <span>▲ SHOW TOP 3 ONLY</span>
                        </>
                      ) : (
                        <>
                          <span>+ MORE {activeType.name} (SEE ALL {activeProjects.length})</span>
                          <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Empty state when newly added category has no drops yet */
              <div className="w-full py-16 px-6 text-center border-2 border-dashed border-[#111215]/30 rounded-3xl bg-white">
                <div
                  className="w-14 h-14 mx-auto rounded-2xl border-2 border-[#111215] flex items-center justify-center mb-4 shadow-[2px_2px_0px_#111215]"
                  style={{
                    backgroundColor: activeType.color || '#75B4B7',
                    color: activeType.textColor || '#111215',
                  }}
                >
                  <RenderTypeIcon iconName={activeType.icon} className="w-7 h-7" />
                </div>
                <h4 className="font-mono font-black text-lg uppercase text-[#111215] mb-2">
                  No Drops in {activeType.name} Yet
                </h4>
                <p className="text-xs font-mono text-[#5C6F74] max-w-md mx-auto mb-4">
                  New drops can be added and assigned to &ldquo;{activeType.name}&rdquo; anytime from the Admin Panel.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
