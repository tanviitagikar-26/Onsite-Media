import React, { useEffect, useRef, useState } from 'react';
import { UPLOADED_CONCERT_PHOTOS } from '../../data/initialData';
import { ConcertMediaItem } from '../../types';
import { Music2, Upload, Sparkles } from 'lucide-react';

interface MarqueeSectionProps {
  originalPhoto?: string | null;
  photosMap?: Record<string, string>;
  photos?: ConcertMediaItem[];
  onPhotoUploaded?: (photo: string, filename?: string) => void;
  onBatchUploaded?: (photosMap: Record<string, string>) => void;
}

export const MarqueeSection: React.FC<MarqueeSectionProps> = ({
  originalPhoto,
  photosMap = {},
  photos,
  onPhotoUploaded,
  onBatchUploaded,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const currentPhotos = photos && photos.length > 0 ? photos : UPLOADED_CONCERT_PHOTOS;

  const resolvePhotoSrc = React.useCallback(
    (item: ConcertMediaItem, idx: number) => {
      if (!item) return '';
      // 1. Direct match in photosMap
      if (item.filename && photosMap[item.filename]) return photosMap[item.filename];
      // 2. Direct data URL or external URL in item.url
      if (
        item.url &&
        (item.url.startsWith('data:') ||
          item.url.startsWith('http://') ||
          item.url.startsWith('https://') ||
          item.url.startsWith('blob:') ||
          item.url.startsWith('/'))
      ) {
        return item.url;
      }
      // 3. Fuzzy match by partial filename in photosMap
      if (item.filename) {
        for (const [key, val] of Object.entries(photosMap)) {
          if (item.filename.includes(key) || key.includes(item.filename)) return val;
        }
      }
      // 4. Lead photo fallback
      if (idx === 0 && originalPhoto) return originalPhoto;
      return item.url || '';
    },
    [photosMap, originalPhoto]
  );

  // Deduplicate items strictly so no duplicate photo or template exists
  const uniquePhotos = React.useMemo(() => {
    const seenIds = new Set<string>();
    const seenFilenames = new Set<string>();
    const seenUrls = new Set<string>();

    return currentPhotos.filter((item, idx) => {
      if (!item) return false;
      const id = (item.id || '').trim().toLowerCase();
      const fn = (item.filename || '').trim().toLowerCase();
      const resolved = resolvePhotoSrc(item, idx);
      const isRealSrc = Boolean(
        resolved &&
          (resolved.startsWith('data:') ||
            resolved.startsWith('http') ||
            resolved.startsWith('blob:') ||
            resolved.startsWith('/'))
      );

      if (id && seenIds.has(id)) return false;
      if (fn && seenFilenames.has(fn)) return false;
      if (isRealSrc && seenUrls.has(resolved)) return false;

      if (id) seenIds.add(id);
      if (fn) seenFilenames.add(fn);
      if (isRealSrc) seenUrls.add(resolved);
      return true;
    });
  }, [currentPhotos, resolvePhotoSrc]);

  // Distribute unique photos between Row 1 and Row 2 without repeating
  // Row 1 and Row 2 share zero photos, so NO photo is visible twice
  const mid = Math.ceil(uniquePhotos.length / 2);
  const row1Photos = uniquePhotos.slice(0, mid);
  const row2Photos = uniquePhotos.slice(mid);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (sectionRef.current) {
            const rect = sectionRef.current.getBoundingClientRect();
            const sectionTop = rect.top + window.scrollY;
            const currentOffset = (window.scrollY - sectionTop + window.innerHeight) * 0.3;
            setOffset(currentOffset);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleFiles = async (fileList: FileList | File[]) => {
    const rawFiles = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (rawFiles.length === 0) return;

    const duplicates: string[] = [];
    const uniqueFiles: File[] = [];

    for (const file of rawFiles) {
      const norm = file.name.trim().toLowerCase();
      const isAlreadyLoaded = Boolean(
        photosMap[file.name] ||
        (photos &&
          photos.some(
            (p) =>
              p.filename.trim().toLowerCase() === norm &&
              ((p.url &&
                (p.url.startsWith('data:') ||
                  p.url.startsWith('http') ||
                  p.url.startsWith('/'))) ||
                Boolean(photosMap[p.filename]))
          ))
      );
      if (isAlreadyLoaded) {
        duplicates.push(file.name);
      } else {
        uniqueFiles.push(file);
      }
    }

    if (uniqueFiles.length === 0) {
      setUploadStatus(
        duplicates.length === 1
          ? `Duplicate blocked: "${duplicates[0]}" has already been uploaded.`
          : `Duplicate photos blocked: ${duplicates.length} duplicate file(s) skipped.`
      );
      setTimeout(() => setUploadStatus(null), 4000);
      return;
    }

    setUploadStatus(`Loading ${uniqueFiles.length} original photo(s) with 100% fidelity...`);

    const newMap: Record<string, string> = { ...photosMap };
    const payloadFiles: { filename: string; base64: string }[] = [];

    for (const file of uniqueFiles) {
      await new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          if (base64) {
            newMap[file.name] = base64;
            payloadFiles.push({ filename: file.name, base64 });

            if (onPhotoUploaded) {
              onPhotoUploaded(base64, file.name);
            }
          }
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }

    try {
      localStorage.setItem('ronny_v2_photos_map', JSON.stringify(newMap));
    } catch {}

    if (onBatchUploaded) {
      onBatchUploaded(newMap);
    }

    try {
      await fetch('/api/upload-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: payloadFiles }),
      });
    } catch {}

    const successMsg =
      duplicates.length > 0
        ? `Added ${uniqueFiles.length} photo(s). Skipped ${duplicates.length} duplicate(s)!`
        : `Added ${uniqueFiles.length} original concert photo(s) (100% untouched)!`;
    setUploadStatus(successMsg);
    setTimeout(() => setUploadStatus(null), 4000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const row1Transform = `translateX(${offset - 200}px)`;
  const row2Transform = `translateX(${-(offset - 200)}px)`;

  return (
    <section
      id="marquee"
      ref={sectionRef}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`bg-transparent pt-24 sm:pt-32 md:pt-40 pb-12 overflow-hidden w-full select-none transition-colors duration-700 relative selection:bg-[#F2C17D] selection:text-[#44455F] ${
        isDragging ? 'bg-[#F2C17D]/15' : ''
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
        }}
        multiple
        accept="image/*"
        className="hidden"
      />

      {/* Floating status alert if user drops or selects photos */}
      {uploadStatus && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#44455F] border border-[#F2C17D]/40 text-[#FAF8F3] px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider shadow-xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-[#F2C17D]" />
          <span>{uploadStatus}</span>
        </div>
      )}

      {/* Horizontal Moving Strap - repeating ONSET MEDIA text with stars removed */}
      <div className="mb-8 w-full overflow-hidden bg-[#54506B] py-2.5 -rotate-1 border-t border-[#6E6A8A] border-b-2 border-[#111215] shadow-md">
        <div className="flex whitespace-nowrap gap-10 font-mono font-black text-xs sm:text-sm text-[#DCC898] [text-shadow:0px_1px_2px_rgba(0,0,0,0.5)] tracking-widest uppercase animate-marquee">
          <span>ONSET MEDIA</span>
          <span>ONSET MEDIA</span>
          <span>ONSET MEDIA</span>
          <span>ONSET MEDIA</span>
          <span>ONSET MEDIA</span>
          <span>ONSET MEDIA</span>
          <span>ONSET MEDIA</span>
          <span>ONSET MEDIA</span>
          <span>ONSET MEDIA</span>
          <span>ONSET MEDIA</span>
          <span>ONSET MEDIA</span>
          <span>ONSET MEDIA</span>
          <span>ONSET MEDIA</span>
          <span>ONSET MEDIA</span>
          <span>ONSET MEDIA</span>
          <span>ONSET MEDIA</span>
          <span>ONSET MEDIA</span>
          <span>ONSET MEDIA</span>
        </div>
      </div>

        {/* Row 1 - moves RIGHT on scroll */}
        <div className="flex flex-col gap-5 w-full">
          <div
            style={{
              transform: row1Transform,
              willChange: 'transform',
            }}
            className="flex gap-5 w-max"
          >
            {row1Photos.map((item, idx) => {
              const src = resolvePhotoSrc(item, idx);
              const isLoaded = Boolean(
                src &&
                  (src.startsWith('data:') ||
                    src.startsWith('http') ||
                    src.startsWith('blob:') ||
                    src.startsWith('/')) &&
                  (photosMap[item.filename] ||
                    (item.url && (item.url.startsWith('data:') || item.url.startsWith('http'))) ||
                    (idx === 0 && originalPhoto))
              );

              return (
                <div
                  key={`row1-${item.id}-${idx}`}
                  className={`w-[280px] h-[190px] sm:w-[360px] sm:h-[240px] md:w-[420px] md:h-[280px] shrink-0 rounded-3xl overflow-hidden relative border-2 border-[#111215] shadow-[4px_4px_0px_#111215] hover:shadow-[7px_7px_0px_#111215] hover:-translate-y-1 transition-all group ${
                    isLoaded ? 'bg-[#181924]' : 'bg-gradient-to-br from-[#2D2E42] via-[#1E1F2E] to-[#111215]'
                  }`}
                >
                  {/* Live concert photo rendering */}
                  {isLoaded && src && src.trim() !== '' ? (
                    <img
                      src={src}
                      alt={`${item.artist} - ${item.title}`}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col justify-center items-center p-6 text-center select-none">
                      <div className="w-12 h-12 rounded-2xl bg-[#D2FF3A]/10 border border-[#D2FF3A]/30 flex items-center justify-center text-[#D2FF3A] mb-2 group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5 text-[#D2FF3A]" />
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#D2FF3A] font-bold">
                        Web Template Slot
                      </span>
                      <span className="text-[11px] font-mono text-white/50 mt-0.5">
                        Upload in Studio CMS
                      </span>
                    </div>
                  )}

                  {/* Aesthetic Concert Backdrop Overlay */}
                  {Boolean((item.artist && item.artist.trim() !== '') || (item.title && item.title.trim() !== '')) && (
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111215]/95 via-[#111215]/40 to-transparent flex flex-col justify-end p-5 pointer-events-none">
                      {item.artist && item.artist.trim() !== '' && (
                        <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-[#D2FF3A] uppercase font-semibold">
                          <Music2 className="w-3 h-3 text-[#D2FF3A]" />
                          <span>{item.artist}</span>
                        </div>
                      )}
                      {item.title && item.title.trim() !== '' && (
                        <h4 className="text-sm sm:text-base font-bold text-white tracking-wide truncate mt-0.5">
                          {item.title}
                        </h4>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Row 2 - moves LEFT on scroll (renders only if photos exist in row 2) */}
          {row2Photos.length > 0 && (
            <div
              style={{
                transform: row2Transform,
                willChange: 'transform',
              }}
              className="flex gap-4 w-max"
            >
              {row2Photos.map((item, idx) => {
                const src = resolvePhotoSrc(item, idx + row1Photos.length);
                const isLoaded = Boolean(
                  src &&
                    (src.startsWith('data:') ||
                      src.startsWith('http') ||
                      src.startsWith('blob:') ||
                      src.startsWith('/')) &&
                    (photosMap[item.filename] ||
                      (item.url && (item.url.startsWith('data:') || item.url.startsWith('http'))))
                );

                return (
                  <div
                    key={`row2-${item.id}-${idx}`}
                    className={`w-[280px] h-[190px] sm:w-[360px] sm:h-[240px] md:w-[420px] md:h-[280px] shrink-0 rounded-3xl overflow-hidden relative border-2 border-[#111215] shadow-[4px_4px_0px_#111215] hover:shadow-[7px_7px_0px_#111215] hover:-translate-y-1 transition-all group ${
                      isLoaded ? 'bg-[#181924]' : 'bg-gradient-to-br from-[#2D2E42] via-[#1E1F2E] to-[#111215]'
                    }`}
                  >
                    {isLoaded && src && src.trim() !== '' ? (
                      <img
                        src={src}
                        alt={`${item.artist} - ${item.title}`}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col justify-center items-center p-6 text-center select-none">
                        <div className="w-12 h-12 rounded-2xl bg-[#D2FF3A]/10 border border-[#D2FF3A]/30 flex items-center justify-center text-[#D2FF3A] mb-2 group-hover:scale-110 transition-transform">
                          <Upload className="w-5 h-5 text-[#D2FF3A]" />
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#D2FF3A] font-bold">
                          Web Template Slot
                        </span>
                        <span className="text-[11px] font-mono text-white/50 mt-0.5">
                          Upload in Studio CMS
                        </span>
                      </div>
                    )}

                    {Boolean((item.artist && item.artist.trim() !== '') || (item.title && item.title.trim() !== '')) && (
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111215]/95 via-[#111215]/40 to-transparent flex flex-col justify-end p-5 pointer-events-none">
                        {item.artist && item.artist.trim() !== '' && (
                          <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-[#D2FF3A] uppercase font-semibold">
                            <Music2 className="w-3 h-3 text-[#D2FF3A]" />
                            <span>{item.artist}</span>
                          </div>
                        )}
                        {item.title && item.title.trim() !== '' && (
                          <h4 className="text-sm sm:text-base font-bold text-white tracking-wide truncate mt-0.5">
                            {item.title}
                          </h4>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
    </section>
  );
};
