import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Edges } from '@react-three/drei';
import * as THREE from 'three';
import type { Room } from '../types';

interface Room3DProps {
  room: Room;
}

const roomColors: Record<string, string> = {
  bedroom: '#4A90D9',
  activity: '#5CB85C',
  nursing: '#00D4AA',
  dining: '#F0AD4E',
  pharmacy: '#A29BFE',
  monitor: '#1E90FF',
  garden: '#2ED573',
};

export default function Room3D({ room }: Room3DProps) {
  const edgesRef = useRef<THREE.LineSegments>(null);
  const edgesMaterialRef = useRef<THREE.LineBasicMaterial>(null);
  const pillarRefs = useRef<THREE.MeshStandardMaterial[]>([]);

  const color = roomColors[room.type] || '#888888';
  const { x, y, z, w, h, d } = room.position;

  const halfW = w / 2;
  const halfD = d / 2;

  const corners = [
    [x - halfW, z - halfD],
    [x + halfW, z - halfD],
    [x - halfW, z + halfD],
    [x + halfW, z + halfD],
  ];

  useFrame((state) => {
    if (room.isAlerting && edgesMaterialRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 5) * 0.5 + 0.5;
      edgesMaterialRef.current.color = new THREE.Color(
        pulse > 0.5 ? '#FF4D4F' : '#FF0000'
      );
      edgesMaterialRef.current.opacity = 0.5 + pulse * 0.5;
    } else if (edgesMaterialRef.current) {
      edgesMaterialRef.current.color = new THREE.Color(color);
      edgesMaterialRef.current.opacity = 0.9;
    }

    pillarRefs.current.forEach((mat, idx) => {
      if (mat) {
        const offset = idx * 0.5;
        const glow = Math.sin(state.clock.elapsedTime * 2 + offset) * 0.3 + 0.7;
        mat.emissiveIntensity = glow * 0.4;
      }
    });
  });

  if (room.type === 'garden') {
    return (
      <group>
        <mesh position={[x, y - 0.05, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[w, d]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={0.6}
            roughness={0.9}
          />
        </mesh>
        <Html
          position={[x, y + 0.5, z]}
          center
          distanceFactor={15}
          style={{ pointerEvents: 'none' }}
        >
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              border: `1px solid ${color}`,
              borderRadius: '4px',
              padding: '4px 10px',
              color: color,
              fontSize: '12px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
              transform: 'translate(-50%, -50%)',
            }}
          >
            🌿 {room.name}
          </div>
        </Html>
      </group>
    );
  }

  return (
    <group>
      <mesh position={[x, y + h / 2, z]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
        <Edges
          ref={edgesRef as any}
          color={room.isAlerting ? '#FF4D4F' : color}
          lineWidth={2}
          transparent
          opacity={0.9}
        >
          <lineBasicMaterial
            ref={edgesMaterialRef}
            color={room.isAlerting ? '#FF4D4F' : color}
            transparent
            opacity={0.9}
            linewidth={2}
          />
        </Edges>
      </mesh>
      <mesh position={[x, y + 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w * 0.95, d * 0.95]} />
        <meshStandardMaterial color={color} transparent opacity={0.3} />
      </mesh>
      {corners.map(([cx, cz], idx) => (
        <mesh
          key={idx}
          position={[cx, y + h / 2, cz]}
          ref={(el) => {
            if (el && pillarRefs.current) {
              pillarRefs.current[idx] = el.material as THREE.MeshStandardMaterial;
            }
          }}
        >
          <cylinderGeometry args={[0.08, 0.1, h + 0.2, 8]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.3}
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>
      ))}
      {corners.map(([cx, cz], idx) => (
        <mesh key={`top-${idx}`} position={[cx, y + h + 0.15, cz]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.6}
          />
        </mesh>
      ))}
      <Html
        position={[x, y + h + 0.6, z]}
        center
        distanceFactor={15}
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            border: `1px solid ${room.isAlerting ? '#FF4D4F' : color}`,
            borderRadius: '4px',
            padding: '4px 10px',
            color: '#fff',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
            boxShadow: room.isAlerting ? '0 0 10px rgba(255, 77, 79, 0.5)' : 'none',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <span style={{ color: room.isAlerting ? '#FF4D4F' : color, fontWeight: 'bold' }}>
            {room.isAlerting && '🚨 '}
            {room.name}
          </span>
          <span style={{ color: '#8C9BB3', marginLeft: '6px', fontSize: '11px' }}>
            {room.occupancy}/{room.capacity}
          </span>
        </div>
      </Html>
    </group>
  );
}
