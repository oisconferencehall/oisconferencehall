'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RotateCw, Maximize2, Sparkles, Monitor } from 'lucide-react';

export default function Macbook3DViewer({ modelUrl = '/macbook_pro_2021.glb' }) {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const controlsRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 450;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2.5, 6);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Clean container before appending
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 2.0;
    controls.maxPolarAngle = Math.PI / 2 + 0.1;
    controls.minDistance = 2;
    controls.maxDistance = 12;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight1.position.set(5, 10, 7);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 2048;
    dirLight1.shadow.mapSize.height = 2048;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffdd00, 1.2);
    dirLight2.position.set(-5, 5, -5);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffdd00, 2, 10);
    pointLight.position.set(0, 3, 2);
    scene.add(pointLight);

    // Ground Shadow Plane
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.ShadowMaterial({ opacity: 0.15 })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.01;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // GLTF Loader
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene;

        // Auto-center and fit model size
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        model.position.x += model.position.x - center.x;
        model.position.y += model.position.y - center.y;
        model.position.z += model.position.z - center.z;

        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) {
          const scale = 3.2 / maxDim;
          model.scale.set(scale, scale, scale);
        }

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(model);
        setLoading(false);
      },
      (xhr) => {
        if (xhr.lengthComputable) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100);
          setProgress(percent);
        }
      },
      (error) => {
        console.error('Error loading 3D model:', error);
        setLoading(false);
      }
    );

    // Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle Resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 450;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [modelUrl]);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  const toggleAutoRotate = () => {
    setAutoRotate(prev => !prev);
  };

  const resetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '460px',
      borderRadius: '28px',
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)',
      border: '1px solid rgba(255, 221, 0, 0.3)',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25), 0 0 30px rgba(255, 221, 0, 0.1)',
      overflow: 'hidden'
    }}>
      {/* Top Header Badge */}
      <div style={{
        position: 'absolute', top: '20px', left: '24px', zIndex: 10,
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '6px 16px', borderRadius: '100px',
        background: 'rgba(255, 221, 0, 0.15)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 221, 0, 0.35)', color: '#FFDD00',
        fontSize: '13px', fontWeight: 700
      }}>
        <Sparkles size={14} /> Interactive 3D Tech Demo
      </div>

      {/* Control Buttons */}
      <div style={{
        position: 'absolute', top: '20px', right: '24px', zIndex: 10,
        display: 'flex', gap: '10px'
      }}>
        <button
          onClick={toggleAutoRotate}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', borderRadius: '100px',
            background: autoRotate ? '#FFDD00' : 'rgba(255, 255, 255, 0.12)',
            color: autoRotate ? '#000000' : '#ffffff',
            border: 'none', fontSize: '12px', fontWeight: 700,
            cursor: 'pointer', transition: 'all 0.2s ease'
          }}
        >
          <RotateCw size={14} className={autoRotate ? 'spin-slow' : ''} />
          {autoRotate ? 'Pause 3D' : 'Rotate 3D'}
        </button>

        <button
          onClick={resetView}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', borderRadius: '100px',
            background: 'rgba(255, 255, 255, 0.12)',
            color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.2)',
            fontSize: '12px', fontWeight: 700,
            cursor: 'pointer', transition: 'all 0.2s ease'
          }}
        >
          <Maximize2 size={14} />
          Reset Camera
        </button>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 5,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(15, 23, 42, 0.9)', color: '#ffffff'
        }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid rgba(255,221,0,0.2)', borderTopColor: '#FFDD00', animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#FFDD00' }}>Loading 3D MacBook Pro...</div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>{progress}% completed</div>
        </div>
      )}

      {/* 3D Canvas Mount Point */}
      <div ref={containerRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />

      {/* Bottom Hint */}
      <div style={{
        position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 10,
        color: '#94a3b8', fontSize: '12px', fontWeight: 600,
        pointerEvents: 'none', background: 'rgba(0,0,0,0.4)', padding: '4px 14px', borderRadius: '100px'
      }}>
        💡 Click & drag to rotate 360° • Scroll to zoom
      </div>

      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
