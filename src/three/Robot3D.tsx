import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { PatrolRobot } from '../types';

interface Robot3DProps {
  robot: PatrolRobot;
}

export default function Robot3D({ robot }: Robot3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.Mesh>(null);
  const lightMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const baseMaterialRef = useRef<THREE.MeshStandardMaterial>(null);

  const targetPos = useRef(new THREE.Vector3(robot.position.x, robot.position.y, robot.position.z));
  const currentPos = useRef(new THREE.Vector3(robot.position.x, robot.position.y, robot.position.z));

  const { camera } = useThree();

  useFrame((state, delta) => {
    targetPos.current.set(robot.position.x, robot.position.y, robot.position.z);
    currentPos.current.lerp(targetPos.current, Math.min(delta * 3, 1));

    if (groupRef.current) {
      groupRef.current.position.copy(currentPos.current);
    }

    if (robot.status === 'alert' && lightMaterialRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 8) * 0.5 + 0.5;
      lightMaterialRef.current.emissiveIntensity = pulse;
    } else if (lightMaterialRef.current) {
      lightMaterialRef.current.emissiveIntensity = 0.3;
    }

    if (robot.battery < 30 && baseMaterialRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.3 + 0.7;
      baseMaterialRef.current.emissive = new THREE.Color('#FF8C42');
      baseMaterialRef.current.emissiveIntensity = (1 - robot.battery / 30) * pulse * 0.5;
    } else if (baseMaterialRef.current) {
      baseMaterialRef.current.emissive = new THREE.Color('#000000');
      baseMaterialRef.current.emissiveIntensity = 0;
    }
  });

  const batteryColor = robot.battery > 60 ? '#5CB85C' : robot.battery > 30 ? '#F0AD4E' : '#FF4D4F';
  const lightColor = robot.status === 'alert' ? '#FF4D4F' : '#2ED573';

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.35, 0.4, 0.5, 16]} />
        <meshStandardMaterial
          ref={baseMaterialRef}
          color="#E8ECF1"
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[0, 0.75, 0]}>
        <sphereGeometry args={[0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#E8ECF1" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.05, 16]} />
        <meshStandardMaterial color="#0066FF" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh ref={lightRef} position={[0, 1.05, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial
          ref={lightMaterialRef}
          color={lightColor}
          emissive={lightColor}
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh position={[0, 0.5, 0.32]}>
        <boxGeometry args={[0.3, 0.15, 0.02]} />
        <meshStandardMaterial color="#1a1a2e" emissive="#00D4AA" emissiveIntensity={0.3} />
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
            border: '1px solid #0066FF',
            borderRadius: '4px',
            padding: '3px 8px',
            color: '#fff',
            fontSize: '10px',
            whiteSpace: 'nowrap',
            fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div style={{ fontWeight: 'bold', color: '#00D4AA' }}>{robot.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            <div
              style={{
                width: '40px',
                height: '4px',
                background: '#333',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${robot.battery}%`,
                  height: '100%',
                  background: batteryColor,
                }}
              />
            </div>
            <span style={{ fontSize: '9px', color: batteryColor }}>{robot.battery}%</span>
          </div>
        </div>
      </Html>
    </group>
  );
}
