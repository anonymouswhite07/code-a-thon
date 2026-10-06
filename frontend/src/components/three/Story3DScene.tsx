'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export type SceneType =
  | 'laptop-desk'
  | 'question-block'
  | 'coffee-mug'
  | 'trophy'
  | 'portal';

interface Story3DSceneProps {
  type: SceneType;
  width?: number;
  height?: number;
  className?: string;
}

export const Story3DScene: React.FC<Story3DSceneProps> = ({
  type,
  width = 320,
  height = 240,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Set up Three.js Scene, Camera, and Renderer
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 3.8);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Warm Studio Lighting (Warm cream & amber highlights)
    const ambientLight = new THREE.AmbientLight(0xfdfbf7, 1.2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffedd5, 2.0);
    mainLight.position.set(3, 5, 4);
    scene.add(mainLight);

    const accentLight = new THREE.DirectionalLight(0x3155ff, 1.0);
    accentLight.position.set(-3, 2, -2);
    scene.add(accentLight);

    // Group for objects to rotate/animate
    const group = new THREE.Group();
    scene.add(group);

    // Build procedural stylized 3D geometry per scene type
    if (type === 'laptop-desk') {
      // 1. Laptop Base
      const baseGeo = new THREE.BoxGeometry(1.6, 0.05, 1.1);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.3, metalness: 0.6 });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = -0.2;
      group.add(base);

      // Keyboard
      const kbGeo = new THREE.BoxGeometry(1.3, 0.02, 0.7);
      const kbMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 });
      const kb = new THREE.Mesh(kbGeo, kbMat);
      kb.position.set(0, -0.16, 0.05);
      group.add(kb);

      // Laptop Screen Lid (tilted back)
      const screenLidGeo = new THREE.BoxGeometry(1.6, 1.05, 0.04);
      const screenLidMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.4 });
      const screenLid = new THREE.Mesh(screenLidGeo, screenLidMat);
      screenLid.position.set(0, 0.35, -0.55);
      screenLid.rotation.x = -0.22;
      group.add(screenLid);

      // Glowing Screen Inset
      const screenDisplayGeo = new THREE.PlaneGeometry(1.48, 0.94);
      const screenDisplayMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
      const screenDisplay = new THREE.Mesh(screenDisplayGeo, screenDisplayMat);
      screenDisplay.position.set(0, 0.35, -0.52);
      screenDisplay.rotation.x = -0.22;
      group.add(screenDisplay);
    } else if (type === 'question-block') {
      // 2. 3D Floating Question / Invariant Crystal
      const cubeGeo = new THREE.BoxGeometry(1.1, 1.1, 1.1);
      const cubeMat = new THREE.MeshStandardMaterial({
        color: 0xff6b35,
        roughness: 0.2,
        metalness: 0.1
      });
      const cube = new THREE.Mesh(cubeGeo, cubeMat);
      group.add(cube);

      // Corner accent spheres
      const sphereGeo = new THREE.SphereGeometry(0.16, 16, 16);
      const sphereMat = new THREE.MeshStandardMaterial({ color: 0xffd84d, metalness: 0.8, roughness: 0.2 });
      [-0.55, 0.55].forEach((x) => {
        [-0.55, 0.55].forEach((y) => {
          [-0.55, 0.55].forEach((z) => {
            const s = new THREE.Mesh(sphereGeo, sphereMat);
            s.position.set(x, y, z);
            cube.add(s);
          });
        });
      });
    } else if (type === 'coffee-mug') {
      // 3. 3D Coffee Mug with Steam Ring
      const mugGeo = new THREE.CylinderGeometry(0.55, 0.45, 1.0, 32);
      const mugMat = new THREE.MeshStandardMaterial({ color: 0xf3f4f6, roughness: 0.3, metalness: 0.1 });
      const mug = new THREE.Mesh(mugGeo, mugMat);
      group.add(mug);

      // Coffee liquid
      const coffeeGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.1, 32);
      const coffeeMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.1 });
      const coffee = new THREE.Mesh(coffeeGeo, coffeeMat);
      coffee.position.y = 0.4;
      group.add(coffee);

      // Mug Handle
      const handleGeo = new THREE.TorusGeometry(0.3, 0.08, 16, 32, Math.PI);
      const handle = new THREE.Mesh(handleGeo, mugMat);
      handle.position.set(0.55, 0, 0);
      handle.rotation.z = -Math.PI / 2;
      group.add(handle);

      // Steam rings
      const ringGeo = new THREE.TorusGeometry(0.2, 0.03, 16, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xffedd5, transparent: true, opacity: 0.5 });
      const steamRing = new THREE.Mesh(ringGeo, ringMat);
      steamRing.position.y = 0.8;
      steamRing.rotation.x = Math.PI / 2;
      group.add(steamRing);
    } else if (type === 'trophy') {
      // 4. Grand 3D Championship Trophy
      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xffd84d,
        metalness: 0.85,
        roughness: 0.15
      });

      // Trophy Cup
      const cupGeo = new THREE.CylinderGeometry(0.7, 0.35, 0.9, 32);
      const cup = new THREE.Mesh(cupGeo, goldMat);
      cup.position.y = 0.4;
      group.add(cup);

      // Trophy Stem
      const stemGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.5, 16);
      const stem = new THREE.Mesh(stemGeo, goldMat);
      stem.position.y = -0.2;
      group.add(stem);

      // Base Pedestal
      const baseGeo = new THREE.CylinderGeometry(0.65, 0.75, 0.3, 32);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.5 });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = -0.55;
      group.add(base);

      // Handles
      const handleGeo = new THREE.TorusGeometry(0.4, 0.07, 16, 32, Math.PI);
      const handleL = new THREE.Mesh(handleGeo, goldMat);
      handleL.position.set(-0.7, 0.45, 0);
      handleL.rotation.z = Math.PI / 2;
      group.add(handleL);

      const handleR = new THREE.Mesh(handleGeo, goldMat);
      handleR.position.set(0.7, 0.45, 0);
      handleR.rotation.z = -Math.PI / 2;
      group.add(handleR);
    } else if (type === 'portal') {
      // 5. 3D Illuminated Gateway Portal
      const archMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.7, roughness: 0.2 });
      const archGeo = new THREE.TorusGeometry(1.1, 0.14, 16, 48, Math.PI);
      const arch = new THREE.Mesh(archGeo, archMat);
      arch.position.y = 0.2;
      group.add(arch);

      // Pillars
      const pillarGeo = new THREE.BoxGeometry(0.28, 1.4, 0.28);
      const pillarL = new THREE.Mesh(pillarGeo, archMat);
      pillarL.position.set(-1.1, -0.5, 0);
      group.add(pillarL);

      const pillarR = new THREE.Mesh(pillarGeo, archMat);
      pillarR.position.set(1.1, -0.5, 0);
      group.add(pillarR);

      // Glowing Inner Disc
      const portalDiscGeo = new THREE.CircleGeometry(0.95, 32);
      const portalDiscMat = new THREE.MeshBasicMaterial({ color: 0xff6b35, transparent: true, opacity: 0.3 });
      const disc = new THREE.Mesh(portalDiscGeo, portalDiscMat);
      disc.position.set(0, 0.2, -0.05);
      group.add(disc);
    }

    // Interactive mouse parallax tilt
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };

    container.addEventListener('mousemove', handleMouseMove);

    // Visibility-based rendering loop (pauses when offscreen to save GPU/battery)
    let isVisible = true;
    const observer = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
    });
    observer.observe(container);

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const elapsedTime = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Continuous subtle turntable motion
        group.rotation.y = elapsedTime * 0.4 + mouseX * 0.5;
        group.rotation.x = Math.sin(elapsedTime * 0.5) * 0.08 + mouseY * 0.3;

        // Subtle floating bob
        if (type === 'question-block' || type === 'trophy') {
          group.position.y = Math.sin(elapsedTime * 1.5) * 0.08;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      container.removeEventListener('mousemove', handleMouseMove);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [type, width, height]);

  return (
    <div
      ref={containerRef}
      style={{ width, height }}
      className={`relative flex items-center justify-center pointer-events-auto cursor-grab active:cursor-grabbing ${className}`}
      title="Interactive 3D Scene (Drag or hover to rotate)"
    />
  );
};
