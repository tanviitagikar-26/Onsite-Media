import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Sparkles, Check, AlertTriangle, X, Trash2 } from 'lucide-react';
import { UPLOADED_CONCERT_PHOTOS } from '../../data/initialData';
import { ConcertMediaItem } from '../../types';

interface PhotoDropzoneProps {
  onPhotoUploaded: (base64Url: string, filename?: string) => void;
  onBatchUploaded?: (photosMap: Record<string, string>) => void;
  currentPhoto?: string | null;
  photosMap?: Record<string, string>;
  concertPhotos?: ConcertMediaItem[];
  onAddNewPhotoItem?: (newItem: ConcertMediaItem) => void;
  onDeleteSlot?: (photoId: string, filename?: string) => void;
  onDuplicateBlocked?: (duplicates: string[]) => void;
  onClearPhoto?: () => void;
  className?: string;
  compact?: boolean;
}

export const PhotoDropzone: React.FC<PhotoDropzoneProps> = ({
  onPhotoUploaded,
  onBatchUploaded,
  currentPhoto,
  photosMap = {},
  concertPhotos,
  onAddNewPhotoItem,
  onDeleteSlot,
  onDuplicateBlocked,
  onClearPhoto,
  className = '',
  compact = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const activePhotosList = concertPhotos && concertPhotos.length > 0 ? concertPhotos : UPLOADED_CONCERT_PHOTOS;

  const processFiles = async (fileList: FileList | File[]) => {
    const rawFiles = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (rawFiles.length === 0) {
      setDuplicateWarning('Please select valid image files (.jpg, .png, .webp).');
      return;
    }

    setIsUploading(true);
    setDuplicateWarning(null);
    setStatusMsg(`Checking ${rawFiles.length} photo(s) for duplicates and fidelity...`);

    const duplicates: string[] = [];
    const uniqueFiles: { file: File; base64: string }[] = [];
    const newMap: Record<string, string> = { ...photosMap };

    for (const file of rawFiles) {
      const normFileName = file.name.trim().toLowerCase();

      // Check 1: Filename duplicate in existing photos list or photosMap
      const nameExistsInPhotos = activePhotosList.some(
        (p) => p.filename.trim().toLowerCase() === normFileName
      );
      const nameExistsInMap = Object.keys(newMap).some(
        (k) => k.trim().toLowerCase() === normFileName
      );

      if (nameExistsInPhotos || nameExistsInMap) {
        duplicates.push(file.name);
        continue;
      }

      // Read file to check base64 content duplicate
      await new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          if (base64) {
            // Check 2: Exact content duplicate against existing base64 entries
            const isContentDuplicate =
              Object.values(newMap).includes(base64) ||
              activePhotosList.some((p) => p.url === base64) ||
              (currentPhoto && currentPhoto === base64);

            if (isContentDuplicate) {
              duplicates.push(`${file.name} (identical photo already uploaded)`);
            } else {
              uniqueFiles.push({ file, base64 });
              newMap[file.name] = base64;
            }
          }
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }

    // Handle duplicates
    if (duplicates.length > 0) {
      if (onDuplicateBlocked) {
        onDuplicateBlocked(duplicates);
      }
      setDuplicateWarning(
        duplicates.length === 1
          ? `Duplicate blocked: "${duplicates[0]}" has already been uploaded. Duplicates are not allowed.`
          : `Duplicate photos blocked: ${duplicates.length} duplicate file(s) were skipped (${duplicates.join(', ')}).`
      );
    }

    // If ALL selected files were duplicates, stop immediately
    if (uniqueFiles.length === 0) {
      setIsUploading(false);
      setStatusMsg(null);
      return;
    }

    const payloadFiles: { filename: string; base64: string }[] = [];

    for (const item of uniqueFiles) {
      payloadFiles.push({ filename: item.file.name, base64: item.base64 });

      // If it's the primary lead photo or single upload
      if (item.file.name.includes('758469193') || uniqueFiles.length === 1) {
        onPhotoUploaded(item.base64, item.file.name);
      }

      // If callback to add new photo item exists and item isn't in active list
      if (onAddNewPhotoItem && !activePhotosList.some((p) => p.filename.toLowerCase() === item.file.name.toLowerCase())) {
        const cleanTitle = item.file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[_-]/g, ' ')
          .replace(/^(SaveClip\.App|SaveInta\.com)\s*/i, '');

        onAddNewPhotoItem({
          id: `concert-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          filename: item.file.name,
          title: cleanTitle || 'Live Concert Performance',
          artist: 'Concert Performer',
          category: 'Arena Tour',
          venue: 'Live Arena Stage',
          year: new Date().getFullYear().toString(),
          url: item.base64,
          description: 'Live concert performance capture, preserved with 100% exact original fidelity.',
        });
      }
    }

    // Save map in localStorage
    try {
      localStorage.setItem('ronny_v2_photos_map', JSON.stringify(newMap));
      if (uniqueFiles[0]?.base64) {
        localStorage.setItem('ronny_v2_original_photo', uniqueFiles[0].base64);
      }
    } catch (err) {
      console.warn('LocalStorage limit reached for raw photos', err);
    }

    if (onBatchUploaded) {
      onBatchUploaded(newMap);
    }

    // Post to server disk sync (optional background cache)
    try {
      await fetch('/api/upload-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: payloadFiles }),
      });
    } catch (err) {
      console.warn('Server disk sync optional', err);
    }

    setIsUploading(false);
    const successText =
      duplicates.length > 0
        ? `Added ${uniqueFiles.length} new unique photo(s). Skipped ${duplicates.length} duplicate(s)!`
        : `Successfully loaded ${uniqueFiles.length} original concert photo(s) (100% untouched)!`;
    setStatusMsg(successText);
    setTimeout(() => setStatusMsg(null), 5000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleChange}
          multiple
          accept="image/*"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF8F3] hover:bg-[#EFECE1] border border-[#DCD9B8] text-xs uppercase tracking-wider text-[#44455F] transition-all cursor-pointer shadow-sm"
          title="Select original concert photos from device"
        >
          <Upload className="w-3.5 h-3.5 text-[#44455F]" />
          <span>Upload Original Photos</span>
        </button>
      </div>
    );
  }

  const uploadedCount = Object.keys(photosMap).length;

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`relative rounded-3xl border transition-all duration-300 p-5 flex flex-col items-center justify-center text-center ${
        isDragging
          ? 'border-[#44455F] bg-[#F2C17D]/10'
          : 'border-[#DCD9B8] bg-[#FAF8F3] hover:border-[#8FA3A8]'
      } ${className}`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        multiple
        accept="image/*"
        className="hidden"
      />

      <div className="flex flex-col items-center gap-3 w-full">
        <div className="w-12 h-12 rounded-2xl bg-[#EFECE1] border border-[#DCD9B8] flex items-center justify-center text-[#44455F]">
          <ImageIcon className="w-6 h-6" />
        </div>

        <div>
          <div className="text-base font-bold uppercase tracking-wider text-[#44455F] flex items-center justify-center gap-2">
            <span>Concert Photos Uploader (Duplicate-Protected)</span>
            {uploadedCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-mono border border-emerald-200">
                {uploadedCount} Active
              </span>
            )}
          </div>
          <p className="text-xs text-[#5C6F74] max-w-lg mt-1">
            Drag & drop concert photos here. Duplicate uploads are strictly blocked.
            Preserved 100% exactly with zero AI alteration, filtering, retouching, or modifications.
          </p>
        </div>

        {/* Duplicate Warning Alert Banner */}
        {duplicateWarning && (
          <div className="w-full my-1 p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-mono flex items-center justify-between gap-3 text-left animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{duplicateWarning}</span>
            </div>
            <button
              onClick={() => setDuplicateWarning(null)}
              className="text-amber-800 hover:text-black p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Slots Grid with Working Delete Slot Buttons */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3 text-left">
          {activePhotosList.map((item, idx) => {
            const hasLocal = Boolean(photosMap[item.filename] || (idx === 0 && currentPhoto));
            const rawSrc = photosMap[item.filename] || (idx === 0 ? currentPhoto : null) || item.url || '';
            const validImgSrc = rawSrc && rawSrc.trim() !== '' ? rawSrc : null;

            return (
              <div
                key={item.id}
                className={`p-2.5 rounded-2xl border transition-all flex flex-col gap-1.5 relative group ${
                  hasLocal
                    ? 'border-emerald-300 bg-emerald-50/50'
                    : 'border-[#DCD9B8] bg-[#F8F6F0]'
                }`}
              >
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#EFECE1] relative border border-[#DCD9B8]">
                  {validImgSrc ? (
                    <img
                      src={validImgSrc}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : null}
                  {hasLocal ? (
                    <div className="absolute top-1.5 left-1.5 bg-emerald-600 text-white p-0.5 rounded-full shadow">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-[10px] text-white/80 uppercase font-mono text-center p-1">
                      Slot {idx + 1}
                    </div>
                  )}

                  {/* FUNCTIONING DELETE SLOT BUTTON */}
                  {onDeleteSlot && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSlot(item.id, item.filename);
                      }}
                      className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md transition-all active:scale-95 cursor-pointer z-10"
                      title={`Delete Slot ${idx + 1} (${item.title || item.artist})`}
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between gap-1">
                  <div className="truncate text-[11px] font-semibold text-[#44455F]">
                    Slot {idx + 1}: {item.artist}
                  </div>
                </div>
                <div className="truncate text-[9px] font-mono text-[#8FA3A8]">
                  {item.filename}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#44455F] hover:bg-[#323348] text-xs font-bold uppercase tracking-wider text-[#FAF8F3] transition-all cursor-pointer shadow-md"
          >
            <Upload className="w-4 h-4 text-[#F2C17D]" />
            <span>Select Photos (Duplicate Protected)</span>
          </button>
          {uploadedCount > 0 && onClearPhoto && (
            <button
              onClick={onClearPhoto}
              className="px-3 py-2 rounded-xl bg-[#EFECE1] hover:bg-rose-50 text-[#5C6F74] hover:text-rose-700 border border-[#DCD9B8] text-xs transition-colors cursor-pointer"
            >
              Clear Cached Photos
            </button>
          )}
        </div>
      </div>

      {statusMsg && (
        <div className="mt-3 text-xs text-emerald-700 flex items-center gap-1.5 animate-fade-in font-medium">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          {statusMsg}
        </div>
      )}
    </div>
  );
};
