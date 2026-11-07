import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const WIDTH = 1280;
const HEIGHT = 720;
const FPS = 30;
const DURATION = 7.0; // 7 seconds matching the exact uploaded video
const TOTAL_FRAMES = Math.round(FPS * DURATION); // 210 frames

const FRAMES_DIR = '/tmp/onset_video_frames';
if (!fs.existsSync(FRAMES_DIR)) {
  fs.mkdirSync(FRAMES_DIR, { recursive: true });
} else {
  // Clear existing frames
  const existing = fs.readdirSync(FRAMES_DIR);
  for (const f of existing) {
    fs.unlinkSync(path.join(FRAMES_DIR, f));
  }
}

// Generate deterministic particles for ambient embers
const PARTICLE_COUNT = 36;
const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  seedX: (i * 137.5) % WIDTH,
  seedY: 450 + ((i * 83.2) % 250),
  size: 1.2 + (i % 3) * 0.8,
  speedY: 20 + (i % 5) * 12,
  speedX: ((i % 7) - 3) * 6,
  alphaBase: 0.25 + (i % 4) * 0.2,
}));

function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function clamp(v: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}

for (let i = 0; i < TOTAL_FRAMES; i++) {
  const t = i / FPS; // Time in seconds

  // Master fade in / out
  let masterAlpha = 1;
  if (t < 0.4) {
    masterAlpha = 0;
  } else if (t < 1.4) {
    masterAlpha = easeInOutQuad((t - 0.4) / 1.0);
  } else if (t > 5.2) {
    masterAlpha = clamp(1 - easeInOutQuad((t - 5.2) / 1.6));
  }

  // Horizon glow fade
  const horizonAlpha = clamp((t - 0.4) / 1.1) * masterAlpha;

  // Glyph mark fade & scale
  const markProgress = clamp((t - 0.7) / 1.2);
  const markAlpha = easeInOutQuad(markProgress) * masterAlpha;

  // Text fade
  const textProgress = clamp((t - 1.8) / 1.0);
  const textAlpha = easeInOutQuad(textProgress) * masterAlpha;

  // Camera drift (smooth subtle zoom in from 1.00 to 1.035)
  const driftProgress = t / DURATION;
  const scale = 1.0 + Math.sin(driftProgress * Math.PI) * 0.035;
  const cameraY = -Math.sin(driftProgress * Math.PI) * 6;

  // Particle positions at time t
  const renderedParticles = particles.map((p) => {
    const py = (p.seedY - t * p.speedY) % 720;
    const px = (p.seedX + Math.sin(t * 0.8 + p.seedY) * p.speedX) % 1280;
    const pAlpha = p.alphaBase * masterAlpha * (py < 620 ? 1 : 0);
    return `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${p.size}" fill="#F2C17D" opacity="${pAlpha.toFixed(2)}" filter="url(#glow)" />`;
  }).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">
  <defs>
    <!-- Background Vignette -->
    <radialGradient id="bg" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stop-color="#141418" />
      <stop offset="55%" stop-color="#0a0a0c" />
      <stop offset="100%" stop-color="#000000" />
    </radialGradient>

    <!-- Golden Horizon Glow -->
    <radialGradient id="horizonGlow" cx="50%" cy="92%" r="55%">
      <stop offset="0%" stop-color="#FFB800" stop-opacity="0.45" />
      <stop offset="25%" stop-color="#FF7700" stop-opacity="0.22" />
      <stop offset="65%" stop-color="#141418" stop-opacity="0.0" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.0" />
    </radialGradient>

    <!-- Warm Logo Mark Glow -->
    <filter id="markGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <filter id="textGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2" />
    </filter>
  </defs>

  <!-- 1. Deep Space Black Backdrop -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#000000" />
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)" />

  <!-- 2. Golden Horizon Arc at Bottom -->
  <g opacity="${horizonAlpha.toFixed(3)}">
    <!-- Big ambient solar atmospheric haze -->
    <ellipse cx="640" cy="740" rx="680" ry="240" fill="url(#horizonGlow)" />
    <!-- Sharp brilliant golden curved rim line -->
    <path d="M 40 710 Q 640 600 1240 710" fill="none" stroke="#F5C518" stroke-width="2.5" opacity="0.65" filter="url(#glow)" />
    <path d="M 120 710 Q 640 602 1160 710" fill="none" stroke="#FFFFFF" stroke-width="1.2" opacity="0.75" />
  </g>

  <!-- 3. Ambient Golden Dust Embers -->
  <g>
    ${renderedParticles}
  </g>

  <!-- 4. Center Brand Lockup with Smooth Camera Drift -->
  <g transform="translate(640, ${310 + cameraY}) scale(${scale}) translate(-640, -310)">
    <!-- Stylized Logo Glyph Mark -->
    <g opacity="${markAlpha.toFixed(3)}" filter="url(#markGlow)">
      <!-- Left Horizontal Bar with Angled Terminal -->
      <path d="M 525 285 L 545 285 L 642 285 L 642 264 L 540 264 L 525 285 Z" fill="#FFFFFF" />
      <!-- Vertical Stem -->
      <rect x="622" y="232" width="20" height="60" fill="#FFFFFF" />
      <!-- Circular Loop -->
      <path d="M 642 274 C 688 274, 722 304, 722 344 C 722 384, 688 414, 642 414 C 596 414, 570 384, 575 344 C 580 316, 604 294, 630 292 L 630 316 C 612 318, 598 332, 597 348 C 595 370, 614 392, 642 392 C 672 392, 698 368, 698 344 C 698 318, 672 296, 642 296 Z" fill="#FFFFFF" />
      <!-- Golden Rim Highlight on Lower Curve of Loop -->
      <path d="M 605 372 C 614 386, 627 392, 642 392 C 672 392, 698 368, 698 344" fill="none" stroke="#F5C518" stroke-width="3" opacity="0.85" filter="url(#glow)" />
    </g>

    <!-- Brand Typography -->
    <g opacity="${textAlpha.toFixed(3)}">
      <!-- "Onset Media" in rich glowing gold -->
      <text x="640" y="468" text-anchor="middle" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="900" fill="#FFC837" letter-spacing="-0.5" filter="url(#textGlow)">
        Onset Media
      </text>
      <!-- "Production House" in elegant clean white -->
      <text x="640" y="502" text-anchor="middle" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="400" fill="#FFFFFF" letter-spacing="3" opacity="0.95">
        Production House
      </text>
    </g>
  </g>
</svg>`;

  const frameFileName = path.join(FRAMES_DIR, `frame_${String(i + 1).padStart(4, '0')}.svg`);
  fs.writeFileSync(frameFileName, svg);
}

console.log(`Generated ${TOTAL_FRAMES} SVG frames in ${FRAMES_DIR}. Now encoding MP4 with ffmpeg...`);

const OUT_MP4 = '/app/applet/public/onset-media-brand-video.mp4';
const cmd = `ffmpeg -framerate ${FPS} -i ${FRAMES_DIR}/frame_%04d.svg -c:v libx264 -preset fast -crf 19 -pix_fmt yuv420p -movflags +faststart ${OUT_MP4} -y`;
console.log(`Running: ${cmd}`);
execSync(cmd, { stdio: 'inherit' });

console.log(`Video successfully generated at ${OUT_MP4}! Size: ${fs.statSync(OUT_MP4).size} bytes`);
