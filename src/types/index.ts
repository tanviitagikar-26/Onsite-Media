export interface DropType {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  textColor?: string;
  order?: number;
  description?: string;
}

export interface Project {
  id: string;
  number: string;
  name: string;
  category: 'Client' | 'Personal' | 'Commercial' | 'Films' | 'Motion' | string;
  mediaType?: 'photos' | 'videos' | string;
  dropTypeId?: string;
  dropTypeName?: string;
  year: string;
  description: string;
  artistName?: string;
  liveAt?: string;
  artistDescription?: string;
  tools?: string[];
  clientName?: string;
  col1Image1: string;
  col1Image2: string;
  col2Image: string;
  videoUrl?: string;
  liveUrl?: string;
}

export interface ServiceItem {
  id: string;
  number: string;
  name: string;
  description: string;
  pricingEstimate?: string;
}

export interface Testimonial {
  id: string;
  clientName: string;
  role: string;
  company: string;
  avatar?: string;
  quote: string;
  projectRef: string;
  rating: number;
  order?: number;
}

export interface ShowreelData {
  title: string;
  subtitle: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  whatsapp: string;
  location: string;
  instagram: string;
  youtube: string;
  twitter: string;
  behance: string;
}

export interface ConcertMediaItem {
  id: string;
  filename: string;
  title: string;
  artist: string;
  url: string;
  category?: string;
  venue?: string;
  year?: string;
  description?: string;
}

export interface SpecialistSoftware {
  id: string;
  name: string;
  subname: string;
  category: string;
  badge: string;
  badgeBg: string;
  badgeText: string;
  accentBorder: string;
  customLogoUrl?: string;
  summary: string;
  description: string;
  coreSkills: string[];
  specsMetric: string;
  specsLabel: string;
}

export interface AboutUsPillar {
  id: string;
  title: string;
  description: string;
  tag: string;
}

export interface AboutUsStat {
  id: string;
  value: string;
  label: string;
}

export interface AboutUsData {
  headline: string;
  tagline: string;
  badge: string;
  subBadge: string;
  paragraph1: string;
  paragraph2: string;
  stats: AboutUsStat[];
  pillars: AboutUsPillar[];
}
