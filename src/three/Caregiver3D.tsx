import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface Caregiver3DProps {
  position: { x: number; y: number; z: number };
  name?: string;
}

export default function Caregiver3D({ position, name }: Caregiver3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const breatheScale = useRef(1);

  useFrame((state) => {
    breatheScale.current = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.02;
    if (groupRef.current) {
      groupRef.current.scale.setScalar(breatheScale.current);
    }
  });

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]}>
      <mesh position={[0, 0.4, 0]}>
        <capsuleGeometry args={[0.2, 0.5, 4, 8]} />
        <meshStandardMaterial color="#2E86DE" metalness={0.2} roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.0, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#F5DEB3" metalness={0.1} roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.0, 0.17]}>
        <sphereGeometry args={[0.16, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.42, 0.06, 0.3]} />
        <meshStandardMaterial color="#ffffff" metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.45, 0.18]}>
        <boxGeometry args={[0.15, 0.05, 0.02]} />
        <meshStandardMaterial color="#FF4D4F" emissive="#FF4D4F" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[-0.28, 0.5, 0]} rotation={[0, 0, 0.2]}>
        <capsuleGeometry args={[0.06, 0.3, 4, 8]} />
        <meshStandardMaterial color="#F5DEB3" metalness={0.1} roughness={0.8} />
      </mesh>
      <mesh position={[0.28, 0.5, 0]} rotation={[0, 0, -0.2]}>
        <capsuleGeometry args={[0.06, 0.3, 4, 8]} />
        <meshStandardMaterial color="#F5DEB3" metalness={0.1} roughness={0.8} />
      </mesh>
      <Html
        position={[0, 1.5, 0]}
        center
        distanceFactor={12}
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            border: '1px solid #2E86DE',
            borderRadius: '4px',
            padding: '3px 8px',
            color: '#fff',
            fontSize: '10px',
            whiteSpace: 'nowrap',
            fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <span style={{ color: '#2E86DE', fontWeight: 'bold' }}>👩‍⚕️ 护工</span>
          {name && <span style={{ marginLeft: '4px', color: '#8C9BB3' }}>{name}</span>}
        </div>
      </Html>
    </group>
  );
}
