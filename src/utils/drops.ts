import { Project } from '../types';

export interface DropDescriptionFields {
  artistName: string;
  liveAt: string;
  artistDescription: string;
}

/**
 * Extracts the 3 required Drops description fields:
 * - Artist name:
 * - Live at:
 * - Artist's description:
 */
export function parseDropDescription(project: Partial<Project> | null | undefined): DropDescriptionFields {
  if (!project) {
    return {
      artistName: '',
      liveAt: '',
      artistDescription: '',
    };
  }

  let artistName = (project.artistName || '').trim();
  let liveAt = (project.liveAt || '').trim();
  let artistDescription = (project.artistDescription || '').trim();

  // If explicit fields are not present or partially missing, parse from project.description
  if (project.description) {
    const lines = project.description.split('\n');
    for (const rawLine of lines) {
      const line = rawLine.trim();
      const lower = line.toLowerCase();
      if (lower.startsWith('artist name:')) {
        const val = line.substring(line.indexOf(':') + 1).trim();
        if (val && !artistName) artistName = val;
      } else if (lower.startsWith('live at:')) {
        const val = line.substring(line.indexOf(':') + 1).trim();
        if (val && !liveAt) liveAt = val;
      } else if (lower.startsWith("artist's description:") || lower.startsWith('artist description:')) {
        const val = line.substring(line.indexOf(':') + 1).trim();
        if (val && !artistDescription) artistDescription = val;
      }
    }
  }

  // Graceful fallbacks for existing data without structured lines
  if (!artistName) {
    artistName = (project.clientName || project.name || 'Onset Media').trim();
  }
  if (!liveAt) {
    liveAt = 'Global Live Stage';
  }
  if (!artistDescription) {
    // If project.description has text that wasn't formatted, use it or fallback
    const rawDesc = (project.description || '').trim();
    if (rawDesc && !rawDesc.toLowerCase().includes('artist name:')) {
      artistDescription = rawDesc;
    } else {
      artistDescription = 'High-voltage concert visuals and live stage production capture.';
    }
  }

  return { artistName, liveAt, artistDescription };
}

/**
 * Formats the 3 fields into the standard multiline string
 */
export function formatDropDescription(fields: {
  artistName: string;
  liveAt: string;
  artistDescription: string;
}): string {
  return `Artist name: ${fields.artistName.trim()}\nLive at: ${fields.liveAt.trim()}\nArtist's description: ${fields.artistDescription.trim()}`;
}
