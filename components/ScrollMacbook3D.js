'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default function ScrollMacbook3D({ modelUrl = '/macbook_pro_2021.glb' }) {
  const containerRef = useRef(null);
  const modelRef = useRef(null);
  const targetRotationY = useRef(1.45);
  const targetRotationX = useRef(0.25);
  const currentScale = useRef(0.05);
  const targetScale = useRef(0.05);
  const currentPosX = useRef(0);
  const targetPosX = useRef(0);

  // Interactive Hover & Drag State
  const isHovered = useRef(false);
  const isDragging = useRef(false);
  const previousMouse = useRef({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });
  const hoverScale = useRef(1.0);
  const mouseTilt = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 550;

    // Scene (100% Transparent)
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0.1, 4.5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting (Bright screen & keyboard illumination)
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.8);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 3.8);
    mainLight.position.set(5, 8, 6);
    scene.add(mainLight);

    const frontLight = new THREE.DirectionalLight(0xffffff, 2.5);
    frontLight.position.set(0, 2, 8);
    scene.add(frontLight);

    const warmLight = new THREE.DirectionalLight(0xffdd00, 2.2);
    warmLight.position.set(-5, 4, -2);
    scene.add(warmLight);

    // Load 3D Model
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene;
        modelRef.current = model;

        // Center geometry
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.x = 0;
        model.position.y = -center.y + 0.1;
        model.position.z = -center.z;

        model.scale.set(0.05, 0.05, 0.05);
        // Face open screen & keyboard toward user
        model.rotation.set(0.25, 1.45, 0);

        scene.add(model);
        handleScroll();
      },
      undefined,
      (err) => console.error('Error loading 3D laptop:', err)
    );

    // Real-time Scroll Listener: Glide out to the right side with SCREEN & KEYBOARD facing front
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const progress = Math.min(Math.max((windowHeight - rect.top) / (windowHeight + rect.height), 0), 1);

      if (progress > 0.05 && progress < 0.95) {
        const sineProgress = Math.sin(progress * Math.PI);
        targetScale.current = 0.2 + sineProgress * 0.55;
        // Positioned cleanly on far right side (3.2), clear of text
        targetPosX.current = sineProgress * 3.2;
        // Rotated 180° so open SCREEN and KEYBOARD face the user!
        targetRotationY.current = 1.45;
        targetRotationX.current = 0.25;
      } else {
        targetScale.current = 0.05;
        targetPosX.current = 0;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Interactive Drag & Hover Handlers
    const onMouseDown = (e) => {
      isDragging.current = true;
      previousMouse.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) - 0.5;
      const y = ((e.clientY - rect.top) / rect.height) - 0.5;

      mouseTilt.current = { x, y };

      if (isDragging.current) {
        const deltaX = (e.clientX - previousMouse.current.x) * 0.008;
        const deltaY = (e.clientY - previousMouse.current.y) * 0.008;

        dragOffset.current.x += deltaX;
        dragOffset.current.y -= deltaY; // Invert Y for 3D world space
        previousMouse.current = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseUp = () => {
      isDragging.current = false;
    };

    const onMouseEnter = () => {
      isHovered.current = true;
    };

    const onMouseLeave = () => {
      isHovered.current = false;
      isDragging.current = false;
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', onMouseDown);
    domElem.addEventListener('mouseenter', onMouseEnter);
    domElem.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Render animation loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const time = performance.now() * 0.001;

      if (modelRef.current) {
        const m = modelRef.current;

        // 1. Gentle, Slow Floating Wave Animation
        const floatX = Math.cos(time * 0.6) * 0.025;
        const floatY = Math.sin(time * 0.8) * 0.03;
        const floatTiltZ = Math.sin(time * 0.5) * 0.015;

        // 2. Hover React Animation (Subtle scale boost)
        const targetHover = isHovered.current ? 1.06 : 1.0;
        hoverScale.current += (targetHover - hoverScale.current) * 0.04;

        // 3. Magnetic Snap-Back Physics
        if (!isDragging.current) {
          dragOffset.current.x *= 0.92;
          dragOffset.current.y *= 0.92;
        }

        // 4. Silky-Smooth Lerp Damping (Slow, elegant transitions)
        currentScale.current += (targetScale.current - currentScale.current) * 0.035;
        const s = Math.max(0.01, currentScale.current) * hoverScale.current;
        m.scale.set(s * 2.2, s * 2.2, s * 2.2);

        currentPosX.current += (targetPosX.current - currentPosX.current) * 0.035;
        
        m.position.x = currentPosX.current + floatX + dragOffset.current.x;
        m.position.y = 0.1 + floatY + dragOffset.current.y;

        // Rotations with subtle mouse tilt
        const targetRotY = targetRotationY.current + (isHovered.current ? mouseTilt.current.x * 0.12 : 0);
        const targetRotX = targetRotationX.current + (isHovered.current ? mouseTilt.current.y * 0.12 : 0);

        m.rotation.y += (targetRotY - m.rotation.y) * 0.035;
        m.rotation.x += (targetRotX - m.rotation.x) * 0.035;
        m.rotation.z = floatTiltZ;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 550;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      domElem.removeEventListener('mousedown', onMouseDown);
      domElem.removeEventListener('mouseenter', onMouseEnter);
      domElem.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [modelUrl]);

  return (
    <div 
      ref={containerRef} 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        zIndex: 5,
        pointerEvents: 'auto',
        cursor: 'grab'
      }}
    />
  );
}
