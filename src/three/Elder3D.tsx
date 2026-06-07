import { useRef } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import type { Elder } from '../types';
import HealthLabel from './HealthLabel';

interface Elder3DProps {
  elder: Elder;
  isSelected: boolean;
  onClick: () => void;
}

const genderColors: Record<string, string> = {
  male: '#5B9BD5',
  female: '#E67AA4',
};

const careLevelColors: Record<string, string> = {
  self: '#5CB85C',
  semi: '#F0AD4E',
  full: '#FF4D4F',
};

export default function Elder3D({ elder, isSelected, onClick }: Elder3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const selectionRingRef = useRef<THREE.Mesh>(null);
  const ringMaterialRef = useRef<THREE.MeshBasicMaterial>(null);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onClick();
  };

  useFrame((state) => {
    const breatheScale = 1 + Math.sin(state.clock.elapsedTime * 1.8) * 0.03;
    if (groupRef.current) {
      groupRef.current.scale.setScalar(breatheScale);
    }

    if (isSelected && ringMaterialRef.current) {
      ringMaterialRef.current.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
    }
  });

  const bodyColor = genderColors[elder.gender];
  const ringColor = careLevelColors[elder.careLevel];

  return (
    <group
      ref={groupRef}
      position={[elder.position.x, elder.position.y, elder.position.z]}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default';
      }}
    >
      <mesh position={[0, 0.35, 0]}>
        <capsuleGeometry args={[0.18, 0.45, 4, 8]} />
        <meshStandardMaterial color={bodyColor} metalness={0.15} roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.88, 0]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color="#F5DEB3" metalness={0.1} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.9, 0.15]}>
        <sphereGeometry args={[0.14, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color={elder.gender === 'female' ? '#C0C0C0' : '#E8E8E8'}
          metalness={0.2}
          roughness={0.7}
        />
      </mesh>
      <mesh position={[-0.05, 0.92, 0.28]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.05, 0.92, 0.28]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0, 0.18, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.25, 0.025, 8, 24]} />
        <meshStandardMaterial
          color={ringColor}
          emissive={ringColor}
          emissiveIntensity={0.4}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
      {isSelected && (
        <mesh ref={selectionRingRef} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.32, 0.4, 32]} />
          <meshBasicMaterial
            ref={ringMaterialRef}
            color="#FFD700"
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      <HealthLabel elder={elder} />
    </group>
  );
}
