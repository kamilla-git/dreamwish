'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Stars } from '@react-three/drei';
import * as THREE from 'three';

function NeonSphere({ position, color, size, speed, distort }: any) {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      meshRef.current.position.x = position[0] + Math.sin(t * 0.2) * 1.5;
      meshRef.current.position.y = position[1] + Math.cos(t * 0.3) * 1.5;
      
      if (typeof window !== 'undefined' && window.innerWidth > 768) {
        meshRef.current.position.x += state.mouse.x * 2;
        meshRef.current.position.y += state.mouse.y * 2;
      }
    }
  });

  return (
    <Float speed={speed} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[size, 64, 64]} position={position}>
        <MeshDistortMaterial
          color={color}
          speed={2}
          distort={distort}
          radius={1}
          metalness={0.8}
          roughness={0.1}
          emissive={color}
          emissiveIntensity={0.4}
          transparent
          opacity={0.5}
        />
      </Sphere>
    </Float>
  );
}

export default function Background3D({ showSpheres = true }: { showSpheres?: boolean }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 -z-10 bg-background pointer-events-none overflow-hidden">
      <Canvas camera={{ position: [0, 0, 20], fov: 55 }}>
        <ambientLight intensity={0.5} />
        {showSpheres && (
          <>
            <pointLight position={[15, 15, 10]} intensity={2} color="#fbbf24" />
            <pointLight position={[-15, -15, -10]} intensity={1.5} color="#84cc16" />
            
            <NeonSphere position={[-12, 8, -5]} color="#fbbf24" size={4} speed={1} distort={0.5} />
            <NeonSphere position={[12, -8, -5]} color="#84cc16" size={4.5} speed={0.8} distort={0.4} />
            <NeonSphere position={[0, -12, -8]} color="#fde047" size={3} speed={1.2} distort={0.6} />
          </>
        )}
        <Stars radius={100} depth={60} count={showSpheres ? 6000 : 2000} factor={5} saturation={0} fade speed={2} />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80 pointer-events-none" />
    </div>
  );
}
