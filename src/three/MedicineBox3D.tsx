import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { Medicine } from '../types';

interface MedicineBox3DProps {
  medicine: Medicine;
}

const tagColors = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#FF8C42',
];

export default function MedicineBox3D({ medicine }: MedicineBox3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  const tagColor = useMemo(() => {
    const hash = medicine.name
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return tagColors[hash % tagColors.length];
  }, [medicine.name]);

  const isLow = medicine.remainingDays < 3;

  useFrame((state) => {
    if (isLow && materialRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 4) * 0.5 + 0.5;
      materialRef.current.emissive = new THREE.Color(
        pulse > 0.5 ? '#FF8C42' : '#FF4500'
      );
      materialRef.current.emissiveIntensity = pulse * 0.6;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group position={[medicine.position.x, medicine.position.y, medicine.position.z]}>
      <mesh ref={meshRef}>
        <boxGeometry args={[0.5, 0.3, 0.35]} />
        <meshStandardMaterial
          ref={materialRef}
          color="#ffffff"
          metalness={0.3}
          roughness={0.5}
          emissive={isLow ? '#FF8C42' : '#000000'}
          emissiveIntensity={isLow ? 0.3 : 0}
        />
      </mesh>
      <mesh position={[0, 0, 0.18]}>
        <boxGeometry args={[0.46, 0.12, 0.01]} />
        <meshStandardMaterial color={tagColor} />
      </mesh>
      <mesh position={[0, 0.08, 0.18]}>
        <boxGeometry args={[0.46, 0.06, 0.01]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <Html
        position={[0, 0.4, 0]}
        center
        distanceFactor={12}
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            border: `1px solid ${isLow ? '#FF8C42' : '#00D4AA'}`,
            borderRadius: '4px',
            padding: '3px 8px',
            color: '#fff',
            fontSize: '10px',
            whiteSpace: 'nowrap',
            fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div style={{ fontWeight: 'bold' }}>{medicine.name}</div>
          <div style={{ color: isLow ? '#FF8C42' : '#8C9BB3', fontSize: '9px' }}>
            剩余 {medicine.remainingDays} 天
          </div>
        </div>
      </Html>
    </group>
  );
}
