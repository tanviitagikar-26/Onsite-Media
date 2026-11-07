import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

interface SonyZVE10CameraProps {
  className?: string;
  onOpenShowreel?: () => void;
  initialColor?: 'black' | 'white';
}

export const SonyZVE10Camera: React.FC<SonyZVE10CameraProps> = ({
  className = '',
  initialColor = 'black',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Interactive UI state
  const [isRecording] = useState(true);
  const [isScreenFlipped] = useState(true);
  const [cameraFinish] = useState<'black' | 'white'>(initialColor);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [recDuration, setRecDuration] = useState(14);

  // References for 3D state & animation
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraModelGroupRef = useRef<THREE.Group | null>(null);
  const lensGroupRef = useRef<THREE.Group | null>(null);
  const innerBarrelRef = useRef<THREE.Mesh | null>(null);
  const screenAssemblyRef = useRef<THREE.Group | null>(null);
  const tallyLightRef = useRef<THREE.Mesh | null>(null);
  const tallyPointLightRef = useRef<THREE.PointLight | null>(null);
  const materialsRef = useRef<{ [key: string]: THREE.Material }>({});
  const lcdCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lcdTextureRef = useRef<THREE.CanvasTexture | null>(null);

  // Target rotations for orbit and animations
  const targetRotation = useRef({ x: 0.12, y: -0.32 });
  const currentRotation = useRef({ x: 0.12, y: -0.32 });
  const targetDistance = useRef(4.6);
  const currentDistance = useRef(4.6);
  const isDragging = useRef(false);
  const previousPointerPosition = useRef({ x: 0, y: 0 });
  const targetScreenAngle = useRef(Math.PI); // Flipped out 180° by default
  const currentScreenAngle = useRef(Math.PI);
  const targetBarrelZ = useRef(0.2);
  const currentBarrelZ = useRef(0.2);

  // Recording timer
  useEffect(() => {
    if (!isRecording) return;
    const timer = setInterval(() => {
      setRecDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isRecording]);

  // Helper to create texture for SONY logo & body text
  const createLogoTexture = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, 512, 128);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 74px "Kanit", "Helvetica Neue", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.letterSpacing = '8px';
      ctx.fillText('SONY', 256, 64);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

  // Helper to create texture for lens ring
  const createLensRingTexture = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#151619';
      ctx.fillRect(0, 0, 1024, 1024);

      // Outer border circle
      ctx.strokeStyle = '#2d2f35';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.arc(512, 512, 490, 0, Math.PI * 2);
      ctx.stroke();

      // Circular text
      ctx.fillStyle = '#C4C7CC';
      ctx.font = 'bold 36px "Kanit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const text = 'SONY E-MOUNT · E PZ 16-50mm F3.5-5.6 OSS · Ø40.5 · ONSET MEDIA';
      const angleStep = (Math.PI * 2 * 0.9) / text.length;
      const radius = 430;

      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const angle = i * angleStep - Math.PI * 0.95;
        ctx.save();
        ctx.translate(512 + Math.cos(angle) * radius, 512 + Math.sin(angle) * radius);
        ctx.rotate(angle + Math.PI / 2);
        ctx.fillText(char, 0, 0);
        ctx.restore();
      }

      // Inner optic ring
      ctx.strokeStyle = '#051824';
      ctx.lineWidth = 28;
      ctx.beginPath();
      ctx.arc(512, 512, 350, 0, Math.PI * 2);
      ctx.stroke();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

  // Helper to draw live dynamic LCD screen
  const updateLCDCanvas = useCallback(
    (canvas: HTMLCanvasElement, recording: boolean, durationSec: number) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      // Dark cinematic viewfinder background
      ctx.fillStyle = '#0c0d12';
      ctx.fillRect(0, 0, w, h);

      // Subtle video preview vignette
      const grad = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w / 1.5);
      grad.addColorStop(0, '#1c1f2b');
      grad.addColorStop(1, '#08090d');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Rule of thirds grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w / 3, 0);
      ctx.lineTo(w / 3, h);
      ctx.moveTo((w * 2) / 3, 0);
      ctx.lineTo((w * 2) / 3, h);
      ctx.moveTo(0, h / 3);
      ctx.lineTo(w, h / 3);
      ctx.moveTo(0, (h * 2) / 3);
      ctx.lineTo(w, (h * 2) / 3);
      ctx.stroke();

      // Safe area boundary box
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.strokeRect(18, 18, w - 36, h - 36);

      // Active Real-time Eye AF tracking box (Sony signature green focus box)
      const pulse = Math.sin(Date.now() * 0.005);
      ctx.strokeStyle = recording ? '#22c55e' : '#eab308';
      ctx.lineWidth = 2;
      const boxSize = 54 + pulse * 2;
      const boxX = w / 2 - boxSize / 2 + Math.sin(Date.now() * 0.001) * 20;
      const boxY = h / 2 - boxSize / 2 + Math.cos(Date.now() * 0.001) * 12;

      // Focus corner markers
      const cLen = 12;
      ctx.beginPath();
      // Top left
      ctx.moveTo(boxX, boxY + cLen);
      ctx.lineTo(boxX, boxY);
      ctx.lineTo(boxX + cLen, boxY);
      // Top right
      ctx.moveTo(boxX + boxSize - cLen, boxY);
      ctx.lineTo(boxX + boxSize, boxY);
      ctx.lineTo(boxX + boxSize, boxY + cLen);
      // Bottom right
      ctx.moveTo(boxX + boxSize, boxY + boxSize - cLen);
      ctx.lineTo(boxX + boxSize, boxY + boxSize);
      ctx.lineTo(boxX + boxSize - cLen, boxY + boxSize);
      // Bottom left
      ctx.moveTo(boxX + cLen, boxY + boxSize);
      ctx.lineTo(boxX, boxY + boxSize);
      ctx.lineTo(boxX, boxY + boxSize - cLen);
      ctx.stroke();

      // Eye AF label
      ctx.fillStyle = recording ? '#22c55e' : '#eab308';
      ctx.font = '10px "Kanit", monospace';
      ctx.fillText('[👁 EYE AF-C]', boxX, boxY - 6);

      // TOP BAR UI
      // REC Status / STBY
      if (recording) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(32, 34, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 15px "Kanit", sans-serif';
        ctx.fillText('REC', 44, 39);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px monospace';
        const m = Math.floor(durationSec / 60)
          .toString()
          .padStart(2, '0');
        const s = (durationSec % 60).toString().padStart(2, '0');
        ctx.fillText(`00:${m}:${s}`, 82, 39);
      } else {
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 14px "Kanit", sans-serif';
        ctx.fillText('STBY', 32, 38);
      }

      // Codec & Quality
      ctx.fillStyle = '#f8fafc';
      ctx.font = '12px "Kanit", sans-serif';
      ctx.fillText('4K 24p XAVC S-I', w / 2 - 40, 38);

      // Battery & Storage icons
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px "Kanit", monospace';
      ctx.fillText('94% [||||]', w - 100, 38);

      // Dynamic Audio dB Levels (L & R meter)
      const audioVal1 = 0.5 + Math.sin(Date.now() * 0.008) * 0.35;
      const audioVal2 = 0.45 + Math.cos(Date.now() * 0.009) * 0.3;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '9px monospace';
      ctx.fillText('CH1', 30, h - 52);
      ctx.fillText('CH2', 30, h - 40);

      // CH1 bar
      ctx.fillStyle = audioVal1 > 0.75 ? '#ef4444' : '#22c55e';
      ctx.fillRect(52, h - 58, audioVal1 * 80, 6);
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.strokeRect(52, h - 58, 80, 6);

      // CH2 bar
      ctx.fillStyle = audioVal2 > 0.75 ? '#ef4444' : '#22c55e';
      ctx.fillRect(52, h - 46, audioVal2 * 80, 6);
      ctx.strokeRect(52, h - 46, 80, 6);

      // BOTTOM BAR UI: Exposure & Camera Settings
      ctx.fillStyle = '#f1f5f9';
      ctx.font = 'bold 13px "Kanit", monospace';
      ctx.fillText('F1.8', 160, h - 44);
      ctx.fillText('1/50', 215, h - 44);
      ctx.fillText('ISO 800', 270, h - 44);
      ctx.fillText('±0.0', 345, h - 44);

      // S-Log Profile & White Balance
      ctx.fillStyle = '#f59e0b';
      ctx.font = '11px "Kanit", sans-serif';
      ctx.fillText('S-Log3 / S-Gamut3.Cine · 5600K', w - 180, h - 44);
    },
    []
  );

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 400;
    const height = containerRef.current.clientHeight || 450;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.1, currentDistance.current);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    // 4. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    // Key Light (top-right-front)
    const keyLight = new THREE.DirectionalLight(0xfffbf0, 2.8);
    keyLight.position.set(4, 5, 5);
    scene.add(keyLight);

    // Fill Light (soft cool fill from left)
    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 1.6);
    fillLight.position.set(-5, 2, 3);
    scene.add(fillLight);

    // Rim/Backlight (highlights chrome edges, lens rim)
    const rimLight = new THREE.DirectionalLight(0xfff5ea, 3.2);
    rimLight.position.set(0, 4, -4);
    scene.add(rimLight);

    // Warm bounce light from bottom
    const bounceLight = new THREE.DirectionalLight(0xfef08a, 0.6);
    bounceLight.position.set(0, -3, 2);
    scene.add(bounceLight);

    // 5. Shared Materials Setup
    const isBlack = cameraFinish === 'black';

    const bodyMat = new THREE.MeshStandardMaterial({
      color: isBlack ? 0x222428 : 0xf2f1ee,
      roughness: isBlack ? 0.46 : 0.38,
      metalness: isBlack ? 0.28 : 0.18,
    });
    materialsRef.current['body'] = bodyMat;

    const gripMat = new THREE.MeshStandardMaterial({
      color: isBlack ? 0x141518 : 0xd8d6cf,
      roughness: 0.88,
      metalness: 0.08,
    });
    materialsRef.current['grip'] = gripMat;

    const topPlateMat = new THREE.MeshStandardMaterial({
      color: isBlack ? 0x1f2125 : 0xe4e2dc,
      roughness: 0.42,
      metalness: 0.35,
    });
    materialsRef.current['topPlate'] = topPlateMat;

    // Chrome Mount Collar
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe6e8ec,
      roughness: 0.15,
      metalness: 0.95,
    });

    // Famous Sony Orange Mount Accent Ring
    const sonyOrangeMat = new THREE.MeshStandardMaterial({
      color: 0xff4600,
      roughness: 0.35,
      metalness: 0.5,
      emissive: 0x992200,
      emissiveIntensity: 0.3,
    });

    // Lens Barrel Dark Anodized Metal
    const lensMetalMat = new THREE.MeshStandardMaterial({
      color: 0x1b1c20,
      roughness: 0.32,
      metalness: 0.65,
    });

    // Lens Rubber Focus/Zoom Grips
    const lensRubberMat = new THREE.MeshStandardMaterial({
      color: 0x121316,
      roughness: 0.85,
      metalness: 0.05,
    });

    // Glass Optical Elements (Front Convex Element)
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0e2230,
      roughness: 0.04,
      metalness: 0.1,
      transmission: 0.85,
      ior: 1.55,
      transparent: true,
      opacity: 0.82,
      reflectivity: 0.95,
    });

    // Red Record Collar Ring
    const redAccentMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.3,
      metalness: 0.4,
    });

    // Tally light glow material
    const tallyMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xef4444,
      emissiveIntensity: 2.2,
      roughness: 0.2,
    });
    materialsRef.current['tally'] = tallyMat;

    // 6. Camera Root Group
    const cameraModel = new THREE.Group();
    cameraModelGroupRef.current = cameraModel;
    scene.add(cameraModel);

    // ==========================================
    // A. MAIN CAMERA BODY (ZV-E10 chassis)
    // ==========================================
    const bodyWidth = 2.45;
    const bodyHeight = 1.48;
    const bodyDepth = 0.92;

    // Main Box Chassis
    const bodyGeom = new THREE.BoxGeometry(bodyWidth, bodyHeight, bodyDepth, 2, 2, 2);
    const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
    bodyMesh.position.set(0, 0, 0);
    cameraModel.add(bodyMesh);

    // Handgrip on Left (Front perspective: x < -0.6)
    const gripGeom = new THREE.BoxGeometry(0.58, 1.44, 0.52);
    const gripMesh = new THREE.Mesh(gripGeom, gripMat);
    gripMesh.position.set(-0.95, -0.02, 0.45);
    cameraModel.add(gripMesh);

    // Ergonomic Finger Contour on grip
    const gripBumpGeom = new THREE.CylinderGeometry(0.24, 0.28, 1.38, 24);
    const gripBumpMesh = new THREE.Mesh(gripBumpGeom, gripMat);
    gripBumpMesh.position.set(-1.18, -0.02, 0.56);
    cameraModel.add(gripBumpMesh);

    // Thumb Grip on back
    const thumbGripGeom = new THREE.BoxGeometry(0.38, 0.55, 0.1);
    const thumbGripMesh = new THREE.Mesh(thumbGripGeom, gripMat);
    thumbGripMesh.position.set(-0.95, 0.32, -0.48);
    cameraModel.add(thumbGripMesh);

    // SONY Front Logo Plate
    const logoTexture = createLogoTexture();
    const logoMat = new THREE.MeshBasicMaterial({
      map: logoTexture,
      transparent: true,
    });
    const logoPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.16), logoMat);
    logoPlane.position.set(0.18, 0.65, 0.465);
    cameraModel.add(logoPlane);

    // ZV-E10 subtle badge
    const badgeGeom = new THREE.PlaneGeometry(0.35, 0.08);
    const badgeCanvas = document.createElement('canvas');
    badgeCanvas.width = 256;
    badgeCanvas.height = 64;
    const bCtx = badgeCanvas.getContext('2d');
    if (bCtx) {
      bCtx.fillStyle = '#C4C7CC';
      bCtx.font = 'bold 36px "Kanit", sans-serif';
      bCtx.fillText('ZV-E10', 20, 44);
    }
    const badgeTex = new THREE.CanvasTexture(badgeCanvas);
    const badgeMat = new THREE.MeshBasicMaterial({ map: badgeTex, transparent: true });
    const badgeMesh = new THREE.Mesh(badgeGeom, badgeMat);
    badgeMesh.position.set(-0.92, 0.62, 0.465);
    cameraModel.add(badgeMesh);

    // 4K badge
    const badge4kGeom = new THREE.PlaneGeometry(0.22, 0.07);
    const b4kCanvas = document.createElement('canvas');
    b4kCanvas.width = 128;
    b4kCanvas.height = 48;
    const b4kCtx = b4kCanvas.getContext('2d');
    if (b4kCtx) {
      b4kCtx.fillStyle = '#eab308';
      b4kCtx.font = 'bold 32px "Kanit", sans-serif';
      b4kCtx.fillText('4K HDR', 10, 34);
    }
    const b4kTex = new THREE.CanvasTexture(b4kCanvas);
    const b4kMat = new THREE.MeshBasicMaterial({ map: b4kTex, transparent: true });
    const b4kMesh = new THREE.Mesh(badge4kGeom, b4kMat);
    b4kMesh.position.set(-0.92, 0.52, 0.465);
    cameraModel.add(b4kMesh);

    // ==========================================
    // B. E-MOUNT & SONY ORANGE COLLAR
    // ==========================================
    const mountCenter = new THREE.Vector3(0.22, 0.02, 0.46);

    // Mount housing cylinder
    const mountHousingGeom = new THREE.CylinderGeometry(0.72, 0.74, 0.12, 36);
    mountHousingGeom.rotateX(Math.PI / 2);
    const mountHousing = new THREE.Mesh(mountHousingGeom, bodyMat);
    mountHousing.position.copy(mountCenter);
    cameraModel.add(mountHousing);

    // Signature Orange Seal Ring (Sony Alpha iconic!)
    const orangeRingGeom = new THREE.TorusGeometry(0.68, 0.022, 16, 48);
    const orangeRing = new THREE.Mesh(orangeRingGeom, sonyOrangeMat);
    orangeRing.position.set(mountCenter.x, mountCenter.y, mountCenter.z + 0.05);
    cameraModel.add(orangeRing);

    // Chrome Lens Mount Bayonet Ring
    const chromeRingGeom = new THREE.CylinderGeometry(0.67, 0.67, 0.04, 42);
    chromeRingGeom.rotateX(Math.PI / 2);
    const chromeRing = new THREE.Mesh(chromeRingGeom, chromeMat);
    chromeRing.position.set(mountCenter.x, mountCenter.y, mountCenter.z + 0.07);
    cameraModel.add(chromeRing);

    // Lens Release Button (on camera body next to mount)
    const lensReleaseBtn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.065, 0.05, 16),
      chromeMat
    );
    lensReleaseBtn.rotateX(Math.PI / 2);
    lensReleaseBtn.position.set(-0.52, -0.15, 0.47);
    cameraModel.add(lensReleaseBtn);

    // ==========================================
    // C. SONY 16-50mm POWER ZOOM LENS ASSEMBLY
    // ==========================================
    const lensGroup = new THREE.Group();
    lensGroup.position.set(mountCenter.x, mountCenter.y, mountCenter.z + 0.08);
    lensGroupRef.current = lensGroup;
    cameraModel.add(lensGroup);

    // Lens Base Outer Barrel
    const lensBaseGeom = new THREE.CylinderGeometry(0.64, 0.64, 0.35, 42);
    lensBaseGeom.rotateX(Math.PI / 2);
    const lensBase = new THREE.Mesh(lensBaseGeom, lensMetalMat);
    lensBase.position.set(0, 0, 0.175);
    lensGroup.add(lensBase);

    // Zoom Ring with knurled rubber ridges
    const zoomRingGeom = new THREE.CylinderGeometry(0.645, 0.645, 0.18, 42);
    zoomRingGeom.rotateX(Math.PI / 2);
    const zoomRing = new THREE.Mesh(zoomRingGeom, lensRubberMat);
    zoomRing.position.set(0, 0, 0.22);
    lensGroup.add(zoomRing);

    // Motorized Inner Barrel (extends with zoom!)
    const innerBarrelGeom = new THREE.CylinderGeometry(0.56, 0.56, 0.32, 42);
    innerBarrelGeom.rotateX(Math.PI / 2);
    const innerBarrel = new THREE.Mesh(innerBarrelGeom, lensMetalMat);
    innerBarrel.position.set(0, 0, 0.36);
    innerBarrelRef.current = innerBarrel;
    lensGroup.add(innerBarrel);

    // Front Bezel with Printed Specs
    const lensRingTexture = createLensRingTexture();
    const frontBezelMat = new THREE.MeshStandardMaterial({
      map: lensRingTexture,
      roughness: 0.3,
      metalness: 0.4,
    });
    const frontBezel = new THREE.Mesh(new THREE.CircleGeometry(0.555, 42), frontBezelMat);
    frontBezel.position.set(0, 0, 0.165); // sits on front of inner barrel
    innerBarrel.add(frontBezel);

    // Glass Front Optical Element
    const glassGeom = new THREE.SphereGeometry(0.36, 32, 16, 0, Math.PI * 2, 0, Math.PI / 3);
    const glassMesh = new THREE.Mesh(glassGeom, glassMat);
    glassMesh.position.set(0, 0, 0.145);
    innerBarrel.add(glassMesh);

    // Subtle Internal Aperture Ring
    const apertureRing = new THREE.Mesh(
      new THREE.RingGeometry(0.12, 0.32, 24),
      new THREE.MeshStandardMaterial({ color: 0x0a0c10, roughness: 0.6 })
    );
    apertureRing.position.set(0, 0, 0.05);
    innerBarrel.add(apertureRing);

    // ==========================================
    // D. TOP PLATE CONTROLS & MICROPHONE
    // ==========================================
    // Top Plate Bevel Cover
    const topPlateGeom = new THREE.BoxGeometry(bodyWidth - 0.05, 0.08, bodyDepth - 0.05);
    const topPlate = new THREE.Mesh(topPlateGeom, topPlateMat);
    topPlate.position.set(0, bodyHeight / 2 + 0.04, 0);
    cameraModel.add(topPlate);

    // 1. Built-in 3-Capsule Directional Microphone Grille (Center-left)
    const micGrilleGeom = new THREE.BoxGeometry(0.78, 0.05, 0.36);
    const micMat = new THREE.MeshStandardMaterial({
      color: 0x18191c,
      roughness: 0.3,
      metalness: 0.85,
    });
    const micGrille = new THREE.Mesh(micGrilleGeom, micMat);
    micGrille.position.set(0.18, bodyHeight / 2 + 0.09, -0.05);
    cameraModel.add(micGrille);

    // 2. Multi-Interface (MI) Hot Shoe
    const hotShoeGeom = new THREE.BoxGeometry(0.35, 0.06, 0.38);
    const hotShoe = new THREE.Mesh(hotShoeGeom, chromeMat);
    hotShoe.position.set(0.72, bodyHeight / 2 + 0.09, -0.05);
    cameraModel.add(hotShoe);

    // 3. Iconic Dedicated MOVIE Record Button (with Red Accent Ring)
    const recButtonCollar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 0.05, 24),
      redAccentMat
    );
    recButtonCollar.position.set(-0.48, bodyHeight / 2 + 0.08, -0.15);
    cameraModel.add(recButtonCollar);

    const recButtonCenter = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.11, 0.06, 24),
      new THREE.MeshStandardMaterial({ color: 0x111215, roughness: 0.4 })
    );
    recButtonCenter.position.set(-0.48, bodyHeight / 2 + 0.095, -0.15);
    cameraModel.add(recButtonCenter);

    // 4. Shutter Button & Power Zoom Rocker Lever
    const shutterBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.16, 0.08, 24),
      chromeMat
    );
    shutterBase.position.set(-0.95, bodyHeight / 2 + 0.09, 0.22);
    cameraModel.add(shutterBase);

    const shutterButton = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.11, 0.06, 24),
      new THREE.MeshStandardMaterial({ color: 0x222429, roughness: 0.3 })
    );
    shutterButton.position.set(-0.95, bodyHeight / 2 + 0.13, 0.22);
    cameraModel.add(shutterButton);

    // 5. Mode Button (Still / Movie / S&Q)
    const modeBtn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 0.05, 20),
      new THREE.MeshStandardMaterial({ color: 0x1c1e22, roughness: 0.4 })
    );
    modeBtn.position.set(-0.76, bodyHeight / 2 + 0.08, -0.15);
    cameraModel.add(modeBtn);

    // 6. Rear Top Control Dial Wheel
    const dialGeom = new THREE.CylinderGeometry(0.22, 0.22, 0.08, 32);
    const dialMesh = new THREE.Mesh(
      dialGeom,
      new THREE.MeshStandardMaterial({ color: 0x151619, roughness: 0.5, metalness: 0.6 })
    );
    dialMesh.position.set(-1.02, bodyHeight / 2 + 0.08, -0.25);
    cameraModel.add(dialMesh);

    // 7. C1 Button (Background Defocus)
    const c1Btn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 0.04, 16),
      new THREE.MeshStandardMaterial({ color: 0x2a2c32, roughness: 0.5 })
    );
    c1Btn.position.set(-0.25, bodyHeight / 2 + 0.08, 0.22);
    cameraModel.add(c1Btn);

    // 8. TALLY LAMP (Front Red Recording LED)
    const tallyGeom = new THREE.SphereGeometry(0.045, 16, 16);
    const tallyMesh = new THREE.Mesh(tallyGeom, tallyMat);
    tallyMesh.position.set(-0.72, 0.56, 0.48);
    cameraModel.add(tallyMesh);
    tallyLightRef.current = tallyMesh;

    // PointLight to cast red glow when recording
    const tallyPointLight = new THREE.PointLight(0xef4444, 2.0, 1.8);
    tallyPointLight.position.set(-0.72, 0.56, 0.52);
    cameraModel.add(tallyPointLight);
    tallyPointLightRef.current = tallyPointLight;

    // ==========================================
    // E. VARI-ANGLE ARTICULATED FLIP-OUT LCD SCREEN
    // ==========================================
    // Hinge Pivot sits on camera's right side (viewer's right: x ≈ 1.22)
    const screenAssembly = new THREE.Group();
    screenAssembly.position.set(1.22, 0, -0.38);
    screenAssemblyRef.current = screenAssembly;
    cameraModel.add(screenAssembly);

    // Metal Hinge Bracket
    const hingeGeom = new THREE.CylinderGeometry(0.05, 0.05, 0.45, 16);
    const hinge = new THREE.Mesh(hingeGeom, chromeMat);
    hinge.position.set(0, 0, 0);
    screenAssembly.add(hinge);

    // Screen Housing (swivels around hinge)
    const screenWidth = 1.35;
    const screenHeight = 0.95;
    const screenDepth = 0.09;

    const screenHousingGeom = new THREE.BoxGeometry(screenWidth, screenHeight, screenDepth);
    const screenHousing = new THREE.Mesh(screenHousingGeom, bodyMat);
    // Center screen housing relative to hinge
    screenHousing.position.set(screenWidth / 2 + 0.05, 0, 0);
    screenAssembly.add(screenHousing);

    // Dynamic LCD Canvas & Texture
    const lcdCanvas = document.createElement('canvas');
    lcdCanvas.width = 512;
    lcdCanvas.height = 360;
    lcdCanvasRef.current = lcdCanvas;

    updateLCDCanvas(lcdCanvas, isRecording, recDuration);
    const lcdTexture = new THREE.CanvasTexture(lcdCanvas);
    lcdTexture.colorSpace = THREE.SRGBColorSpace;
    lcdTextureRef.current = lcdTexture;

    const lcdScreenMat = new THREE.MeshBasicMaterial({
      map: lcdTexture,
    });

    const lcdScreenMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(screenWidth - 0.12, screenHeight - 0.12),
      lcdScreenMat
    );
    // LCD faces forward when flipped 180° in selfie vlog mode!
    lcdScreenMesh.position.set(screenWidth / 2 + 0.05, 0, screenDepth / 2 + 0.005);
    screenAssembly.add(lcdScreenMesh);

    // Set initial screen rotation
    screenAssembly.rotation.y = isScreenFlipped ? Math.PI : 0;

    // ==========================================
    // F. CAMERA BACK CONTROLS
    // ==========================================
    const backGroup = new THREE.Group();
    backGroup.position.set(0, 0, -0.465);
    cameraModel.add(backGroup);

    // Rear Rotary D-Pad Wheel
    const dpad = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.03, 32),
      new THREE.MeshStandardMaterial({ color: 0x16171b, roughness: 0.5 })
    );
    dpad.rotateX(Math.PI / 2);
    dpad.position.set(-0.52, -0.15, 0);
    backGroup.add(dpad);

    // MENU button
    const menuBtn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.065, 0.03, 16),
      new THREE.MeshStandardMaterial({ color: 0x222428, roughness: 0.5 })
    );
    menuBtn.rotateX(Math.PI / 2);
    menuBtn.position.set(-0.52, 0.35, 0);
    backGroup.add(menuBtn);

    // Fn button
    const fnBtn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.065, 0.03, 16),
      new THREE.MeshStandardMaterial({ color: 0x222428, roughness: 0.5 })
    );
    fnBtn.rotateX(Math.PI / 2);
    fnBtn.position.set(-0.25, 0.18, 0);
    backGroup.add(fnBtn);

    // Ground Contact Shadow plane (radial soft drop shadow)
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(128, 128, 20, 128, 128, 120);
      grad.addColorStop(0, 'rgba(68, 69, 95, 0.35)');
      grad.addColorStop(0.5, 'rgba(68, 69, 95, 0.15)');
      grad.addColorStop(1, 'rgba(68, 69, 95, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 256, 256);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(4.8, 3.8),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.75 })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.set(0, -1.05, 0);
    scene.add(shadowPlane);

    // 7. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let lastMouseMoveTime = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const now = performance.now();
      const isCursorIdle = now - lastMouseMoveTime > 2500;

      // Smooth Lerp Rotations (only auto-spin if cursor has been idle)
      if (isAutoRotating && !isDragging.current && isCursorIdle) {
        targetRotation.current.y += 0.0035;
      }

      currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * 0.08;
      currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * 0.08;
      currentDistance.current += (targetDistance.current - currentDistance.current) * 0.08;

      if (cameraModelGroupRef.current) {
        // Floating levitation bobbing
        const floatY = Math.sin(elapsedTime * 1.5) * 0.04;
        cameraModelGroupRef.current.position.y = floatY;
        cameraModelGroupRef.current.rotation.x = currentRotation.current.x;
        cameraModelGroupRef.current.rotation.y = currentRotation.current.y;
      }

      // Smooth Screen hinge swivel animation
      if (screenAssemblyRef.current) {
        currentScreenAngle.current +=
          (targetScreenAngle.current - currentScreenAngle.current) * 0.1;
        screenAssemblyRef.current.rotation.y = currentScreenAngle.current;
      }

      // Smooth Lens zoom barrel extension
      if (innerBarrelRef.current) {
        currentBarrelZ.current += (targetBarrelZ.current - currentBarrelZ.current) * 0.12;
        innerBarrelRef.current.position.z = currentBarrelZ.current;
      }

      // Tally Light Pulsing Glow
      if (tallyLightRef.current && tallyPointLightRef.current) {
        if (isRecording) {
          const pulse = (Math.sin(elapsedTime * 6) + 1) * 0.5;
          const mat = tallyLightRef.current.material as THREE.MeshStandardMaterial;
          mat.emissiveIntensity = 1.2 + pulse * 1.8;
          tallyPointLightRef.current.intensity = 1.0 + pulse * 1.5;
        } else {
          const mat = tallyLightRef.current.material as THREE.MeshStandardMaterial;
          mat.emissiveIntensity = 0.05;
          tallyPointLightRef.current.intensity = 0;
        }
      }

      // Update LCD viewfinder texture every few frames
      if (lcdCanvasRef.current && lcdTextureRef.current) {
        updateLCDCanvas(lcdCanvasRef.current, isRecording, recDuration);
        lcdTextureRef.current.needsUpdate = true;
      }

      if (cameraRef.current) {
        cameraRef.current.position.z = currentDistance.current;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };

    // Global cursor tracking: 360 degree rotation on cursor movement
    const handleGlobalPointerMove = (e: PointerEvent) => {
      lastMouseMoveTime = performance.now();
      if (isDragging.current) return;

      // Full 360-degree rotation across screen width (-Math.PI to +Math.PI)
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = (e.clientY / window.innerHeight) * 2 - 1;

      targetRotation.current.y = normX * Math.PI;
      targetRotation.current.x = Math.max(-0.45, Math.min(0.45, normY * 0.45));
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('pointermove', handleGlobalPointerMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      scene.clear();
    };
  }, [cameraFinish, createLensRingTexture, createLogoTexture, updateLCDCanvas]);

  // Pointer drag event handlers for full 360° interactive orbit
  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    setIsAutoRotating(false);
    previousPointerPosition.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - previousPointerPosition.current.x;
    const deltaY = e.clientY - previousPointerPosition.current.y;

    targetRotation.current.y += deltaX * 0.008;
    targetRotation.current.x = Math.max(
      -0.6,
      Math.min(0.6, targetRotation.current.x + deltaY * 0.006)
    );

    previousPointerPosition.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex flex-col items-center justify-center select-none ${className}`}
    >
      {/* 1. Main 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none z-10"
        title="Drag to orbit Sony ZV-E10 camera in 3D"
      />
    </div>
  );
};
