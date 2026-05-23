import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Icosahedron, MeshDistortMaterial, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

const CoreShape = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.3;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.4;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <Icosahedron ref={meshRef} args={[1.2, 4]}>
        <MeshDistortMaterial
          color="#06b6d4"
          emissive="#0891b2"
          emissiveIntensity={0.8}
          distort={0.4}
          speed={3}
          roughness={0.1}
          metalness={0.9}
          wireframe={true}
        />
      </Icosahedron>
      {/* Inner solid core */}
      <Icosahedron args={[0.8, 2]}>
        <meshStandardMaterial color="#a855f7" emissive="#7e22ce" emissiveIntensity={0.5} />
      </Icosahedron>
    </Float>
  );
};

export const Loading3D: React.FC<{ text?: string }> = ({ text = "Processing Neural Data..." }) => {
  return (
    <div className="w-full h-64 relative flex flex-col items-center justify-center rounded-xl overflow-hidden bg-black/40 border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 4] }}>
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#06b6d4" />
          <pointLight position={[-10, -10, -10]} intensity={1} color="#a855f7" />
          <Stars radius={50} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
          <CoreShape />
        </Canvas>
      </div>
      <div className="z-10 mt-48 text-cyan-400 font-mono text-sm tracking-widest animate-pulse">
        {text}
      </div>
    </div>
  );
};