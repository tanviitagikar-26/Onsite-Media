import {
  Project,
  ServiceItem,
  Testimonial,
  ShowreelData,
  ContactInfo,
  ConcertMediaItem,
  SpecialistSoftware,
  DropType,
  AboutUsData,
} from '../types';

export const UPLOADED_CONCERT_PHOTOS: ConcertMediaItem[] = [
  {
    id: 'concert-01',
    filename: 'SaveInta.com_758469193_18089254955417540_9161247027050578589_n.jpg',
    title: 'Silver Lehenga Live Arena Performance',
    artist: 'Lead Female Vocalist',
    url: 'SaveInta.com_758469193_18089254955417540_9161247027050578589_n.jpg',
  },
  {
    id: 'concert-02',
    filename: 'SaveClip.App_603722550_18066483578417540_6734046564953240793_n.jpg',
    title: 'Emerald Laser Stage Collaboration',
    artist: 'Duo Live Vocalists',
    url: 'SaveClip.App_603722550_18066483578417540_6734046564953240793_n.jpg',
  },
  {
    id: 'concert-03',
    filename: 'SaveClip.App_592417684_18066395564417540_3836775238257214476_n.jpg',
    title: 'Cryo Smoke Cannon Kinetic Leap',
    artist: 'Live Stage Performer',
    url: 'SaveClip.App_592417684_18066395564417540_3836775238257214476_n.jpg',
  },
  {
    id: 'concert-04',
    filename: 'SaveClip.App_573330207_18062021183417540_6576455843552787326_n.jpg',
    title: 'Celestial Bubble Constellation',
    artist: 'Concert Spotlight Vocalist',
    url: 'SaveClip.App_573330207_18062021183417540_6576455843552787326_n.jpg',
  },
  {
    id: 'concert-05',
    filename: 'SaveClip.App_670298338_18078704057417540_3220327478708686819_n.jpg',
    title: 'Acoustic Folk Rock Tour',
    artist: 'Raghu Dixit Live',
    url: 'SaveClip.App_670298338_18078704057417540_3220327478708686819_n.jpg',
  },
  {
    id: 'concert-06',
    filename: 'SaveClip.App_670445379_18077646761417540_4404046325622464358_n.jpg',
    title: 'Golden Haze Anthem',
    artist: 'Stadium Rock Vocalist',
    url: 'SaveClip.App_670445379_18077646761417540_4404046325622464358_n.jpg',
  },
  {
    id: 'concert-07',
    filename: 'SaveClip.App_573787552_18062464991417540_2009049114757899816_n.jpg',
    title: 'High-Voltage Pop Powerhouse',
    artist: 'Sunidhi Chauhan Live',
    url: 'SaveClip.App_573787552_18062464991417540_2009049114757899816_n.jpg',
  },
  {
    id: 'concert-08',
    filename: 'SaveClip.App_574476449_18062579750417540_8264699522030436125_n.jpg',
    title: 'Symphony of Legends Tour',
    artist: 'Sonu Nigam Live Concert',
    url: 'SaveClip.App_574476449_18062579750417540_8264699522030436125_n.jpg',
  },
  {
    id: 'concert-09',
    filename: 'SaveInta.com_653527926_18074801417417540_1835231916616690166_n.jpg',
    title: 'Acoustic Hymns Tour',
    artist: 'Mohit Chauhan Live',
    url: 'SaveInta.com_653527926_18074801417417540_1835231916616690166_n.jpg',
  },
];

export const MARQUEE_GIFS: string[] = UPLOADED_CONCERT_PHOTOS.map((p) => p.url);

export const INITIAL_PROJECTS: Project[] = [
  // --- VIDEOS DROPS ---
  {
    id: 'proj-01',
    number: '01',
    name: 'Nextlevel Studio',
    category: 'Client',
    mediaType: 'videos',
    year: '2026',
    clientName: 'Nextlevel Creative Lab',
    tools: ['Blender 4.2', 'Cinema 4D', 'Octane Render', 'After Effects'],
    artistName: 'Nextlevel Creative Lab',
    liveAt: 'Tokyo Media Dome',
    artistDescription: 'Futuristic architectural forms and physical simulations for live concert stages.',
    description:
      "Artist name: Nextlevel Creative Lab\nLive at: Tokyo Media Dome\nArtist's description: Futuristic architectural forms and physical simulations for live concert stages.",
    col1Image1:
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055344_5eff02e0-87a5-41ce-b64f-eb08da8f33db.png&w=1280&q=85',
    col1Image2:
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055431_11d841fd-8b41-46a5-82e4-b04f2407a7d8.png&w=1280&q=85',
    col2Image:
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055451_e317bf2d-28d4-48cc-86b0-6f72f25b6327.png&w=1280&q=85',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    liveUrl: 'https://nextlevelstudio.design',
  },
  {
    id: 'proj-02',
    number: '02',
    name: 'Aura Brand Identity',
    category: 'Personal',
    mediaType: 'videos',
    year: '2025',
    clientName: 'Aura Experiential',
    tools: ['Houdini', 'Redshift', 'Figma', 'Substance 3D Painter'],
    artistName: 'Aura Experiential',
    liveAt: 'Neon Horizon Arena',
    artistDescription: 'Exploratory sculptural lighting and translucent materials for spatial stage identity.',
    description:
      "Artist name: Aura Experiential\nLive at: Neon Horizon Arena\nArtist's description: Exploratory sculptural lighting and translucent materials for spatial stage identity.",
    col1Image1:
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055654_911201c5-36d9-4bc6-bac7-331adfce159f.png&w=1280&q=85',
    col1Image2:
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055723_5ceda0b8-d9c2-4665-b2e3-83ba19ba76d1.png&w=1280&q=85',
    col2Image:
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055753_adc5dcbd-a8e6-49c0-b43a-9b030d835cea.png&w=1280&q=85',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    liveUrl: 'https://aurabrand.art',
  },
  {
    id: 'proj-03',
    number: '03',
    name: 'Solaris Digital',
    category: 'Client',
    mediaType: 'videos',
    year: '2025',
    clientName: 'Solaris Interactive Corp',
    tools: ['Unreal Engine 5.5', 'Cinema 4D', 'DaVinci Resolve', 'Octane'],
    artistName: 'Solaris Interactive Corp',
    liveAt: 'Grand Pavilion Stage',
    artistDescription: 'Micro-detailed closeups, brushed titanium reflections, and cinematic lighting setups.',
    description:
      "Artist name: Solaris Interactive Corp\nLive at: Grand Pavilion Stage\nArtist's description: Micro-detailed closeups, brushed titanium reflections, and cinematic lighting setups.",
    col1Image1:
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055759_963cfb0b-4bd1-4b0f-9d0a-09bd6cf95b2f.png&w=1280&q=85',
    col1Image2:
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_060108_438f781a-9846-4dcc-89ab-c4e6cb830f5b.png&w=1280&q=85',
    col2Image:
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055818_9d062121-ad7e-46b9-999a-1a6a692ef1ee.png&w=1280&q=85',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    liveUrl: 'https://solarisdigital.io',
  },
  {
    id: 'proj-04',
    number: '04',
    name: 'Cybernetic Stage LED Loops',
    category: 'Client',
    mediaType: 'videos',
    year: '2026',
    clientName: 'Apex Arena Live Festival',
    tools: ['After Effects', 'Notch', 'Unreal Engine 5', 'Cinema 4D'],
    artistName: 'Apex Arena Live Festival',
    liveAt: 'Apex Stadium Arena',
    artistDescription: 'Gigawatt LED backdrop loops engineered with audio-reactive pulses for massive stadium performances.',
    description:
      "Artist name: Apex Arena Live Festival\nLive at: Apex Stadium Arena\nArtist's description: Gigawatt LED backdrop loops engineered with audio-reactive pulses for massive stadium performances.",
    col1Image1: 'SaveClip.App_603722550_18066483578417540_6734046564953240793_n.jpg',
    col1Image2: 'SaveClip.App_592417684_18066395564417540_3836775238257214476_n.jpg',
    col2Image: 'SaveInta.com_758469193_18089254955417540_9161247027050578589_n.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    liveUrl: 'https://apexarena.live',
  },
  {
    id: 'proj-05',
    number: '05',
    name: 'Prism Motion Key Art',
    category: 'Personal',
    mediaType: 'videos',
    year: '2025',
    clientName: 'Onset Media Labs',
    tools: ['DaVinci Resolve', 'Premiere Pro', 'After Effects', 'Photoshop'],
    artistName: 'Onset Media Labs',
    liveAt: 'Metropolitan Live Grounds',
    artistDescription: 'High-energy kinetic title sequence combining dynamic typography and film grain textures.',
    description:
      "Artist name: Onset Media Labs\nLive at: Metropolitan Live Grounds\nArtist's description: High-energy kinetic title sequence combining dynamic typography and film grain textures.",
    col1Image1: 'SaveClip.App_573330207_18062021183417540_6576455843552787326_n.jpg',
    col1Image2: 'SaveClip.App_670298338_18078704057417540_3220327478708686819_n.jpg',
    col2Image: 'SaveClip.App_670445379_18077646761417540_4404046325622464358_n.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    liveUrl: 'https://onsetmedia.co/prism-motion',
  },
  {
    id: 'proj-06',
    number: '06',
    name: 'Quantum Arena Concert Recap',
    category: 'Client',
    mediaType: 'videos',
    year: '2025',
    clientName: 'Starlight Stadium Tour',
    tools: ['Premiere Pro', 'DaVinci Resolve ACES', 'Sony FX6', '85mm Prime'],
    artistName: 'Starlight Stadium Tour',
    liveAt: 'Quantum National Stadium',
    artistDescription: 'Multi-cam concert recap featuring lightning-fast cuts, crowd bass-drop transitions, and Kodak film emulation.',
    description:
      "Artist name: Starlight Stadium Tour\nLive at: Quantum National Stadium\nArtist's description: Multi-cam concert recap featuring lightning-fast cuts, crowd bass-drop transitions, and Kodak film emulation.",
    col1Image1: 'SaveClip.App_573787552_18062464991417540_2009049114757899816_n.jpg',
    col1Image2: 'SaveClip.App_574476449_18062579750417540_8264699522030436125_n.jpg',
    col2Image: 'SaveInta.com_653527926_18074801417417540_1835231916616690166_n.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    liveUrl: 'https://onsetmedia.co/quantum-arena',
  },

  // --- PHOTOS DROPS ---
  {
    id: 'proj-photo-01',
    number: '01',
    name: 'Arena Live Stage Stills',
    category: 'Client',
    mediaType: 'photos',
    year: '2026',
    clientName: 'Live Arena Tour Series',
    tools: ['Sony Alpha', 'Lightroom RAW', 'Photoshop CC', 'ACES Color'],
    artistName: 'Live Arena Tour Series',
    liveAt: 'Apex Stadium Arena',
    artistDescription: 'Ultra-sharp 4K concert photography capturing stadium lasers, cryo smoke, and roaring crowds.',
    description:
      "Artist name: Live Arena Tour Series\nLive at: Apex Stadium Arena\nArtist's description: Ultra-sharp 4K concert photography capturing stadium lasers, cryo smoke, and roaring crowds.",
    col1Image1: 'SaveInta.com_758469193_18089254955417540_9161247027050578589_n.jpg',
    col1Image2: 'SaveClip.App_603722550_18066483578417540_6734046564953240793_n.jpg',
    col2Image: 'SaveClip.App_592417684_18066395564417540_3836775238257214476_n.jpg',
    liveUrl: 'https://onsetmedia.co/arena-live-stills',
  },
  {
    id: 'proj-photo-02',
    number: '02',
    name: 'Aura Spectral Key Art',
    category: 'Personal',
    mediaType: 'photos',
    year: '2025',
    clientName: 'Aura Spatial Key Visuals',
    tools: ['Photoshop CC', 'Houdini Stills', 'Octane Render', 'Lightroom'],
    artistName: 'Aura Spatial Key Visuals',
    liveAt: 'Sphere Live Experience',
    artistDescription: 'Sculptural lighting monographs and translucent glass refraction key visuals.',
    description:
      "Artist name: Aura Spatial Key Visuals\nLive at: Sphere Live Experience\nArtist's description: Sculptural lighting monographs and translucent glass refraction key visuals.",
    col1Image1:
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055654_911201c5-36d9-4bc6-bac7-331adfce159f.png&w=1280&q=85',
    col1Image2:
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055723_5ceda0b8-d9c2-4665-b2e3-83ba19ba76d1.png&w=1280&q=85',
    col2Image:
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055753_adc5dcbd-a8e6-49c0-b43a-9b030d835cea.png&w=1280&q=85',
    liveUrl: 'https://onsetmedia.co/spectral-key-art',
  },
  {
    id: 'proj-photo-03',
    number: '03',
    name: 'Acoustic Hymns Tour Stills',
    category: 'Client',
    mediaType: 'photos',
    year: '2025',
    clientName: 'Mohit Chauhan & Raghu Dixit Live',
    tools: ['Sony ZV-E10', '85mm Prime', 'DaVinci Resolve Color Still', 'Lightroom'],
    artistName: 'Mohit Chauhan & Raghu Dixit Live',
    liveAt: 'Sunburn Acoustic Arena',
    artistDescription: 'Festival portraits capturing intimate backstage preparations, raw acoustic guitar moments, and dynamic golden haze arena anthems.',
    description:
      "Artist name: Mohit Chauhan & Raghu Dixit Live\nLive at: Sunburn Acoustic Arena\nArtist's description: Festival portraits capturing intimate backstage preparations, raw acoustic guitar moments, and dynamic golden haze arena anthems.",
    col1Image1: 'SaveClip.App_670298338_18078704057417540_3220327478708686819_n.jpg',
    col1Image2: 'SaveClip.App_670445379_18077646761417540_4404046325622464358_n.jpg',
    col2Image: 'SaveClip.App_574476449_18062579750417540_8264699522030436125_n.jpg',
    liveUrl: 'https://onsetmedia.co/acoustic-tour-stills',
  },
  {
    id: 'proj-photo-04',
    number: '04',
    name: 'Emerald Laser Stage Collaboration',
    category: 'Client',
    mediaType: 'photos',
    year: '2026',
    clientName: 'Duo Live Stadium Series',
    tools: ['Sony Alpha A7 IV', 'Lightroom CC', 'Photoshop CC'],
    artistName: 'Duo Live Stadium Series',
    liveAt: 'Emerald City Arena',
    artistDescription: 'Electrifying stage collaboration bathed in emerald laser lines, capturing synchronized vocalist duets in low-light RAW perfection.',
    description:
      "Artist name: Duo Live Stadium Series\nLive at: Emerald City Arena\nArtist's description: Electrifying stage collaboration bathed in emerald laser lines, capturing synchronized vocalist duets in low-light RAW perfection.",
    col1Image1: 'SaveClip.App_603722550_18066483578417540_6734046564953240793_n.jpg',
    col1Image2: 'SaveInta.com_758469193_18089254955417540_9161247027050578589_n.jpg',
    col2Image: 'SaveClip.App_603722550_18066483578417540_6734046564953240793_n.jpg',
    liveUrl: 'https://onsetmedia.co/laser-stage',
  },
  {
    id: 'proj-photo-05',
    number: '05',
    name: 'Cryo Cannon Kinetic Leap',
    category: 'Client',
    mediaType: 'photos',
    year: '2025',
    clientName: 'Live Arena Headliner',
    tools: ['Sony G-Master 24-70mm', 'Lightroom RAW', 'DaVinci Stills'],
    artistName: 'Live Arena Headliner',
    liveAt: 'National Indoor Stadium',
    artistDescription: 'Mid-air performer leap framed by high-pressure cryo carbon dioxide smoke cannons and stadium flare highlights.',
    description:
      "Artist name: Live Arena Headliner\nLive at: National Indoor Stadium\nArtist's description: Mid-air performer leap framed by high-pressure cryo carbon dioxide smoke cannons and stadium flare highlights.",
    col1Image1: 'SaveClip.App_592417684_18066395564417540_3836775238257214476_n.jpg',
    col1Image2: 'SaveClip.App_573330207_18062021183417540_6576455843552787326_n.jpg',
    col2Image: 'SaveClip.App_592417684_18066395564417540_3836775238257214476_n.jpg',
    liveUrl: 'https://onsetmedia.co/cryo-leap',
  },
  {
    id: 'proj-photo-06',
    number: '06',
    name: 'Sunidhi Chauhan High-Voltage Tour',
    category: 'Client',
    mediaType: 'photos',
    year: '2025',
    clientName: 'Sunidhi Chauhan Live Tour',
    tools: ['Sony Prime 50mm', 'Lightroom Tone Curve', 'Photoshop Composite'],
    artistName: 'Sunidhi Chauhan Live Tour',
    liveAt: 'D.Y. Patil Stadium, Mumbai',
    artistDescription: 'High-energy powerhouse performance stills highlighting stadium spotlights, hair whips, and roaring 50,000-fan crowds.',
    description:
      "Artist name: Sunidhi Chauhan Live Tour\nLive at: D.Y. Patil Stadium, Mumbai\nArtist's description: High-energy powerhouse performance stills highlighting stadium spotlights, hair whips, and roaring 50,000-fan crowds.",
    col1Image1: 'SaveClip.App_573787552_18062464991417540_2009049114757899816_n.jpg',
    col1Image2: 'SaveInta.com_653527926_18074801417417540_1835231916616690166_n.jpg',
    col2Image: 'SaveClip.App_573787552_18062464991417540_2009049114757899816_n.jpg',
    liveUrl: 'https://onsetmedia.co/sunidhi-tour',
  },
];

export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'serv-01',
    number: '01',
    name: 'Concert Photography & Cinematography',
    description:
      'Capturing the energy and emotion of live performances, from stage to crowd.',
  },
  {
    id: 'serv-02',
    number: '02',
    name: 'Event Coverage',
    description:
      'From fests to private events, preserving moments with energy and style.',
  },
  {
    id: 'serv-03',
    number: '03',
    name: 'Wedding Photography & Cinematography',
    description:
      'Capturing moments with emotion, detail, and a cinematic touch.',
  },
  {
    id: 'serv-04',
    number: '04',
    name: 'Video Editing & Post-Production',
    description:
      'Crafting impactful visuals through precise editing and color grading.',
  },
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-01',
    clientName: 'Marcus Vance',
    role: 'Head of Brand Design',
    company: 'Nextlevel Labs, San Francisco',
    quote:
      'Onsetmedia and Onset Media delivered a transcendent visual universe for our flagship product. The editorial rhythm and mastery of lighting transformed our campaign engagement.',
    projectRef: 'Nextlevel Studio Campaign',
    rating: 5,
    order: 1,
  },
  {
    id: 'test-02',
    clientName: 'Elena Rostova',
    role: 'Executive Creative Director',
    company: 'Aura Interactive, London',
    quote:
      'Working with Onsetmedia was exceptional. The level of detail in every 3D render surpassed all our expectations. A master visual team who understands high-end storytelling and technical artistry equally.',
    projectRef: 'Aura Spatial Series',
    rating: 5,
    order: 2,
  },
  {
    id: 'test-03',
    clientName: 'David Chen',
    role: 'VP Product Marketing',
    company: 'Solaris Systems, Tokyo',
    quote:
      'The renders and motion delivered by Onset Media for our keynote launch were breathtaking. Engagement rates spiked by +180%. Onsetmedia is our go-to creative director for critical productions.',
    projectRef: 'Solaris Digital Keynote',
    rating: 5,
    order: 3,
  },
];

export const ONSET_MEDIA_BRAND_VIDEO_URL = '/onset-media-brand-video.mp4';

export const INITIAL_SHOWREEL: ShowreelData = {
  title: 'Onset Media Brand Reel',
  subtitle: 'Selected Visual Direction, High-End CGI & Kinetic Motion by Onsetmedia',
  videoUrl: ONSET_MEDIA_BRAND_VIDEO_URL,
  thumbnailUrl: 'onset-media-logo.svg',
  duration: '00:07',
};

// Shared single source of truth for phone & WhatsApp communication
export const PRIMARY_PHONE_NUMBER = '9035582905';

export const INITIAL_CONTACT_INFO: ContactInfo = {
  email: 'onsetmedia.in@gmail.com',
  phone: PRIMARY_PHONE_NUMBER,
  whatsapp: PRIMARY_PHONE_NUMBER,
  location: 'Los Angeles, CA · Onset Media Worldwide',
  instagram: 'https://instagram.com/onsetmedia',
  youtube: 'https://youtube.com/@onsetmedia',
  twitter: 'https://x.com/onsetmedia',
  behance: 'https://behance.net/onsetmedia',
};

export const INITIAL_DROP_TYPES: DropType[] = [
  {
    id: 'type-photos',
    name: 'Photos',
    slug: 'photos',
    icon: 'Camera',
    color: '#75B4B7',
    textColor: '#111215',
    order: 1,
    description: 'Stage Stills · Tour Key Art · 4K Color Grading',
  },
  {
    id: 'type-videos',
    name: 'Videos',
    slug: 'videos',
    icon: 'Film',
    color: '#111215',
    textColor: '#75B4B7',
    order: 2,
    description: '3D Simulation · Stage LED Backdrops · Concert Recaps',
  },
];

export const ASSETS = {
  heroPortrait:
    'https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png',
  moonIcon:
    'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/moon_icon.11395d36.png',
  p59Icon:
    'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/p59_1.4659672e.png',
  legoIcon:
    'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/lego_icon-1.703bb594.png',
  group134Icon:
    'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/Group_134-1.2e04f3ce.png',
};

export interface AboutData {
  headline: string;
  paragraph: string;
  originBadge: string;
  craftBadge: string;
  founderPhoto?: string | null;
}

export const INITIAL_ABOUT: AboutData = {
  headline: 'MEET THE FOUNDER',
  paragraph:
    "I am a visual storyteller with 5+ years of experience across wedding, concert, and event photography and cinematography. My work extends deep into the live music space, where I’ve captured high-energy performances for artists such as Sonu Nigam, Mohit Chauhan, Sunidhi Chauhan, Javed Ali, The Raghu Dixit Project, Calvin Harris, Jasmine Sandlas, Aditya Rikhari, Mythri Iyer, Ritviz, Afterallmusic, Seedhe Maut, Rajesh Krishnan, Chaar Diwari, and many more. Beyond the lens, I am also an editor, shaping raw moments into compelling visual stories through precise cuts and deliberate creative direction. Whether documenting intimate weddings or electrifying concerts, my focus is always on capturing not just the visuals, but the raw feeling and emotion behind them.",
  originBadge: '',
  craftBadge: '⚡ 100% UNFILTERED CRAFT',
  founderPhoto: null,
};

export const INITIAL_ABOUT_US: AboutUsData = {
  headline: 'ABOUT ONSET MEDIA',
  tagline: 'High-Octane Visual Direction, Live Stage Cinematography & Cinematic Storytelling.',
  badge: '✦ THE STUDIO 🎬',
  subBadge: 'VISION & CREATIVE ETHOS',
  paragraph1:
    'Onset Media is a premier visual production and cinematography studio built for artists, arena tours, and trailblazing brands. We capture the unbridled adrenaline of live soundscapes and synthesize it into iconic motion art and still imagery.',
  paragraph2:
    'Founded on a discipline of zero compromise and unfiltered craft, our team works at the intersection of stage energy and sub-frame editorial precision—delivering everything from stadium tour recaps to high-end commercial campaigns.',
  stats: [
    { id: 'stat-1', value: '100M+', label: 'GLOBAL IMPRESSIONS' },
    { id: 'stat-2', value: '50+', label: 'ARENA & TOUR RECAPS' },
    { id: 'stat-3', value: '24HR', label: 'DROP TURNAROUND' },
    { id: 'stat-4', value: '100%', label: 'ORIGINAL CRAFT' },
  ],
  pillars: [
    {
      id: 'pillar-1',
      title: 'Arena & Stage Cinematography',
      description: 'Multi-camera concert coverage capturing stadium lasers, kinetic crowd drops, and raw stage emotion in ultra-sharp 4K.',
      tag: 'LIVE PRODUCTION',
    },
    {
      id: 'pillar-2',
      title: 'Sub-Frame Editorial Precision',
      description: 'Audio-transient-synced video editing with high-rhythm cuts, dynamic speed ramps, and industry-grade color grading.',
      tag: 'POST-PRODUCTION',
    },
    {
      id: 'pillar-3',
      title: 'Visual Direction & Key Art',
      description: 'Creative brand and tour identity, custom composite posters, and high-heat visual systems tailored for modern audiences.',
      tag: 'CREATIVE ETHOS',
    },
  ],
};

export const INITIAL_SPECIALISTS: SpecialistSoftware[] = [
  {
    id: 'photoshop',
    name: 'Adobe Photoshop',
    subname: 'Advanced Compositing & Key Art',
    category: 'Visual Craft & Manipulation',
    badge: 'PHOTOSHOP MASTER',
    badgeBg: 'bg-[#31A8FF]',
    badgeText: 'text-[#001E36]',
    accentBorder: 'hover:border-[#31A8FF]',
    summary: 'High-end photo manipulation, creative composite posters, and razor-sharp key art.',
    description:
      'Precision image retouching, bespoke concert tour key art, complex frequency separation, and multi-layer compositing that turns raw moments into iconic visuals.',
    coreSkills: ['Tour Poster Art', 'High-End Compositing', 'Complex Masking', 'Texture Blending', 'Key Visuals'],
    specsMetric: 'Full 16-Bit RAW',
    specsLabel: 'Depth Pipeline',
  },
  {
    id: 'premiere',
    name: 'Adobe Premiere Pro',
    subname: 'Cinematic Timeline & Concert Assembly',
    category: 'Editorial Pacing & Assembly',
    badge: 'LIGHTNING CUT',
    badgeBg: 'bg-[#EA77FF]',
    badgeText: 'text-[#1C002B]',
    accentBorder: 'hover:border-[#EA77FF]',
    summary: 'Rhythmic pacing, multi-cam live performance editing, and dynamic storytelling.',
    description:
      'Fast-paced concert and festival video cutting with synchronized audio transients, multi-angle stadium switching, and rapid turnaround for live drops.',
    coreSkills: ['Multi-Cam Switching', 'Rhythmic Pacing', 'Concert Recaps', 'Audio Sync', 'Speed Ramping'],
    specsMetric: 'Sub-Frame Sync',
    specsLabel: 'Timeline Precision',
  },
  {
    id: 'lightroom',
    name: 'Adobe Lightroom',
    subname: 'Live Concert & RAW Color Grading',
    category: 'Color Development & Presets',
    badge: 'RAW SCIENTIST',
    badgeBg: 'bg-[#3DF5FF]',
    badgeText: 'text-[#001D26]',
    accentBorder: 'hover:border-[#3DF5FF]',
    summary: 'Concert low-light exposure rescue, tone curve mastering, and signature grading profiles.',
    description:
      'High-volume RAW processing built for punishing stadium lighting, smoke hazers, and high-contrast lasers to deliver rich blacks and electric highlights.',
    coreSkills: ['Laser Balance', 'Low-Light Rescue', 'Custom Presets', 'Tone Curve Science', 'Batch Curation'],
    specsMetric: 'Zero Dynamic Loss',
    specsLabel: 'Exposure Recovery',
  },
  {
    id: 'davinci',
    name: 'DaVinci Resolve Studio',
    subname: 'Hollywood-Grade ACES Color Grading',
    category: 'Color Science & Finishing',
    badge: 'COLOR MASTER',
    badgeBg: 'bg-[#FF5500]',
    badgeText: 'text-white',
    accentBorder: 'hover:border-[#FF5500]',
    summary: 'Node-based color grading, analog film print emulation, and studio broadcast finishing.',
    description:
      'Hollywood-caliber color grading utilizing ACES color management, Kodak 2383 film emulsion LUTs, skin-tone preservation, and theater-ready master deliverables.',
    coreSkills: ['Node Color Tree', 'ACES Workflow', 'Film Emulation', 'HDR Finishing', 'Skin Tone Isolation'],
    specsMetric: 'ACES Color Space',
    specsLabel: 'Studio Pipeline',
  },
  {
    id: 'aftereffects',
    name: 'Adobe After Effects',
    subname: 'Kinetic Motion & Tour Stage Visuals',
    category: 'Motion Graphics & VFX',
    badge: 'MOTION & VFX',
    badgeBg: 'bg-[#9999FF]',
    badgeText: 'text-[#1F0038]',
    accentBorder: 'hover:border-[#9999FF]',
    summary: 'Kinetic typography, 3D camera tracking, stage LED backdrop animation, and VFX cleanups.',
    description:
      'Eye-melting visual effects, 3D camera matchmoving, custom glitch shaders, and high-energy motion design optimized for stage LED walls and viral social formats.',
    coreSkills: ['3D Camera Tracking', 'Kinetic Typography', 'Tour LED Loops', 'VFX Cleanups', 'Procedural Rigs'],
    specsMetric: 'Seamless 60FPS',
    specsLabel: 'Motion Flow',
  },
];

