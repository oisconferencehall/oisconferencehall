'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default function ScrollDevices3D({
  macbookUrl = '/macbook_pro_2021.glb',
  iphoneUrl = '/iphone_16_pro_max.glb',
  mouseUrl = '/mouse_arrow.glb'
}) {
  const containerRef = useRef(null);

  // References for MacBook Pro (Right Side - Perfectly Symmetrical)
  const macbookRef = useRef(null);
  const macbookTargetRotY = useRef(1.45);
  const macbookTargetRotX = useRef(0.22);
  const macbookCurrentScale = useRef(0.05);
  const macbookTargetScale = useRef(0.05);
  const macbookCurrentX = useRef(2.25);
  const macbookTargetX = useRef(2.25);

  // References for iPhone 16 Pro Max (Left Side - Clearly Visible & Proportional)
  const iphoneRef = useRef(null);
  const iphoneTargetRotY = useRef(1.85); // Front Display Screen facing user
  const iphoneTargetRotX = useRef(0.2);
  const iphoneCurrentScale = useRef(0.05);
  const iphoneTargetScale = useRef(0.05);
  const iphoneCurrentX = useRef(-2.25);
  const iphoneTargetX = useRef(-2.25);

  // References for 3D Mouse Arrow (Under/At Bottom of Yellow Button)
  const mouseArrowRef = useRef(null);
  const mouseTargetPos = useRef({ x: -0.22, y: -0.75, z: 0.8 });
  const mouseCurrentPos = useRef({ x: -0.22, y: -0.75, z: 0.8 });
  const mouseTargetScale = useRef(0.05);
  const mouseCurrentScale = useRef(0.05);
  const proximityFactor = useRef(0);
  const isClicking = useRef(false);

  // Interactive Hover & Drag State
  const activeDrag = useRef(null);
  const previousMouse = useRef({ x: 0, y: 0 });
  const macbookDragOffset = useRef({ x: 0, y: 0 });
  const iphoneDragOffset = useRef({ x: 0, y: 0 });
  const isHovered = useRef(false);
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

    // Studio Lighting
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

    const loader = new GLTFLoader();

    // 1. Load MacBook Pro (Right Side, X = 2.25)
    loader.load(
      macbookUrl,
      (gltf) => {
        const model = gltf.scene;
        macbookRef.current = model;

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.x = 2.25;
        model.position.y = -center.y + 0.1;
        model.position.z = -center.z;

        model.scale.set(0.05, 0.05, 0.05);
        model.rotation.set(0.22, 1.45, 0);

        scene.add(model);
        handleScroll();
      },
      undefined,
      (err) => console.error('Error loading 3D MacBook:', err)
    );

    // 2. Load iPhone 16 Pro Max (Left Side, X = -2.25, Front Screen Facing User)
    loader.load(
      iphoneUrl,
      (gltf) => {
        const model = gltf.scene;
        iphoneRef.current = model;

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) {
          const s = 1.05 / maxDim; // Beautiful proportional iPhone size
          model.scale.set(s, s, s);
        }

        model.position.x = -2.25;
        model.position.y = -center.y + 0.1;
        model.position.z = -center.z;

        // Front glass screen facing user
        model.rotation.set(0.2, 1.85, 0);

        scene.add(model);
        handleScroll();
      },
      undefined,
      (err) => console.error('Error loading 3D iPhone:', err)
    );

    // 3. Load 3D Mouse Arrow (Under / At Bottom of Yellow Button)
    loader.load(
      mouseUrl,
      (gltf) => {
        const model = gltf.scene;
        mouseArrowRef.current = model;

        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) {
          const s = 0.14 / maxDim;
          model.scale.set(s, s, s);
        }

        // Under bottom-left of yellow button pointing ↖️ UP-LEFT onto button
        model.position.set(-0.22, -0.75, 0.8);
        model.rotation.set(0.1, 0.35, -0.65);

        scene.add(model);
        handleScroll();
      },
      undefined,
      (err) => console.error('Error loading 3D Mouse Arrow:', err)
    );

    // Real-time Scroll Listener: Smooth scaling and entrance glide
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const progress = Math.min(Math.max((windowHeight - rect.top) / (windowHeight + rect.height), 0), 1);

      if (progress > 0.05 && progress < 0.95) {
        const sineProgress = Math.sin(progress * Math.PI);
        
        // MacBook Pro (Right Side, X = 2.25)
        macbookTargetScale.current = 0.2 + sineProgress * 0.45;
        macbookTargetX.current = 2.25;

        // iPhone 16 Pro Max (Left Side, X = -2.25)
        iphoneTargetScale.current = 0.2 + sineProgress * 0.45;
        iphoneTargetX.current = -2.25;

        // 3D Mouse Arrow
        mouseTargetScale.current = 0.2 + sineProgress * 0.45;
      } else {
        macbookTargetScale.current = 0.05;
        macbookTargetX.current = 2.25;

        iphoneTargetScale.current = 0.05;
        iphoneTargetX.current = -2.25;

        mouseTargetScale.current = 0.05;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Drag & Hover & Real Cursor Proximity Tracking
    const onMouseDown = (e) => {
      isClicking.current = true;

      const rect = container.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      if (clickX > rect.width * 0.65) {
        activeDrag.current = 'macbook';
      } else if (clickX < rect.width * 0.35) {
        activeDrag.current = 'iphone';
      }
      previousMouse.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) - 0.5;
      const y = ((e.clientY - rect.top) / rect.height) - 0.5;

      mouseTilt.current = { x, y };

      // Proximity to button center
      const buttonDist = Math.hypot(x - 0, y - 0.20);
      const prox = Math.max(0, 1 - buttonDist * 2.2);
      proximityFactor.current = prox;

      // Resting under bottom-left of button: (-0.22, -0.75)
      // As real cursor approaches: 3D cursor moves UP onto button face: (-0.18, -0.65) to push it!
      const targetArrowX = -0.22 + prox * 0.06;
      const targetArrowY = -0.75 + prox * 0.10;

      mouseTargetPos.current = { x: targetArrowX, y: targetArrowY, z: 0.8 };

      if (activeDrag.current) {
        const deltaX = (e.clientX - previousMouse.current.x) * 0.008;
        const deltaY = (e.clientY - previousMouse.current.y) * 0.008;

        if (activeDrag.current === 'macbook') {
          macbookDragOffset.current.x += deltaX;
          macbookDragOffset.current.y -= deltaY;
        } else if (activeDrag.current === 'iphone') {
          iphoneDragOffset.current.x += deltaX;
          iphoneDragOffset.current.y -= deltaY;
        }
        previousMouse.current = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseUp = () => {
      isClicking.current = false;
      activeDrag.current = null;
    };

    const onMouseEnter = () => {
      isHovered.current = true;
    };

    const onMouseLeave = () => {
      isHovered.current = false;
      activeDrag.current = null;
      isClicking.current = false;
      proximityFactor.current = 0;
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', onMouseDown);
    domElem.addEventListener('mouseenter', onMouseEnter);
    domElem.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const time = performance.now() * 0.001;

      // Slow, Gentle Wave Levitations
      const floatX = Math.cos(time * 0.6) * 0.025;
      const floatY = Math.sin(time * 0.8) * 0.03;
      const floatTiltZ = Math.sin(time * 0.5) * 0.015;

      const targetHover = isHovered.current ? 1.06 : 1.0;
      hoverScale.current += (targetHover - hoverScale.current) * 0.04;

      // Magnetic Snap-Back Physics
      if (activeDrag.current !== 'macbook') {
        macbookDragOffset.current.x *= 0.92;
        macbookDragOffset.current.y *= 0.92;
      }
      if (activeDrag.current !== 'iphone') {
        iphoneDragOffset.current.x *= 0.92;
        iphoneDragOffset.current.y *= 0.92;
      }

      // 1. Animate MacBook Pro (Right Side, X = 2.25)
      if (macbookRef.current) {
        const m = macbookRef.current;
        macbookCurrentScale.current += (macbookTargetScale.current - macbookCurrentScale.current) * 0.035;
        const s = Math.max(0.01, macbookCurrentScale.current) * hoverScale.current;
        m.scale.set(s * 1.8, s * 1.8, s * 1.8);

        macbookCurrentX.current += (macbookTargetX.current - macbookCurrentX.current) * 0.035;
        m.position.x = macbookCurrentX.current + floatX + macbookDragOffset.current.x;
        m.position.y = 0.1 + floatY + macbookDragOffset.current.y;

        const targetRotY = macbookTargetRotY.current + (isHovered.current ? mouseTilt.current.x * 0.12 : 0);
        const targetRotX = macbookTargetRotX.current + (isHovered.current ? mouseTilt.current.y * 0.12 : 0);
        m.rotation.y += (targetRotY - m.rotation.y) * 0.035;
        m.rotation.x += (targetRotX - m.rotation.x) * 0.035;
        m.rotation.z = floatTiltZ;
      }

      // 2. Animate iPhone 16 Pro Max (Left Side, X = -2.25, Front Screen Facing User)
      if (iphoneRef.current) {
        const p = iphoneRef.current;
        iphoneCurrentScale.current += (iphoneTargetScale.current - iphoneCurrentScale.current) * 0.035;
        const s = Math.max(0.01, iphoneCurrentScale.current) * hoverScale.current;
        p.scale.set(s * 0.85, s * 0.85, s * 0.85);

        iphoneCurrentX.current += (iphoneTargetX.current - iphoneCurrentX.current) * 0.035;
        p.position.x = iphoneCurrentX.current - floatX + iphoneDragOffset.current.x;
        p.position.y = 0.1 - floatY + iphoneDragOffset.current.y;

        const targetRotY = iphoneTargetRotY.current + (isHovered.current ? mouseTilt.current.x * 0.12 : 0);
        const targetRotX = iphoneTargetRotX.current + (isHovered.current ? mouseTilt.current.y * 0.12 : 0);
        p.rotation.y += (targetRotY - p.rotation.y) * 0.035;
        p.rotation.x += (targetRotX - p.rotation.x) * 0.035;
        p.rotation.z = -floatTiltZ;
      }

      // 3. Animate 3D Mouse Arrow (Under / At Bottom of Yellow Button, pushing button down)
      if (mouseArrowRef.current) {
        const a = mouseArrowRef.current;
        mouseCurrentPos.current.x += (mouseTargetPos.current.x - mouseCurrentPos.current.x) * 0.08;
        mouseCurrentPos.current.y += (mouseTargetPos.current.y - mouseCurrentPos.current.y) * 0.08;
        
        mouseCurrentScale.current += (mouseTargetScale.current - mouseCurrentScale.current) * 0.05;
        const isNear = proximityFactor.current > 0.55;
        const clickDip = (isClicking.current || isNear) ? 0.80 : 1.0;
        const scaleVal = Math.max(0.01, mouseCurrentScale.current) * clickDip;

        a.scale.set(scaleVal * 0.35, scaleVal * 0.35, scaleVal * 0.35);
        a.position.x = mouseCurrentPos.current.x + floatX * 0.15;
        a.position.y = mouseCurrentPos.current.y + floatY * 0.15;
        
        const pushDepth = (isNear || isClicking.current) ? 0.5 : 0.8;
        a.position.z = pushDepth;

        // Points UP-LEFT ↖️ onto the bottom edge of the yellow button
        a.rotation.x = 0.12 + (isNear ? 0.18 : 0);
        a.rotation.y = 0.35;
        a.rotation.z = -0.65 + (isNear ? -0.15 : 0);
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
  }, [macbookUrl, iphoneUrl, mouseUrl]);

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
        zIndex: 15,
        pointerEvents: 'auto',
        cursor: 'grab'
      }}
    />
  );
}
