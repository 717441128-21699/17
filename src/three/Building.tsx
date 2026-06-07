import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import type { Room } from '../types';

interface BuildingProps {
  rooms: Room[];
}

export default function Building({ rooms }: BuildingProps) {
  const edgeMaterialRef = useRef<THREE.LineBasicMaterial>(null);
  const decorMaterialRef = useRef<THREE.MeshStandardMaterial>(null);

  const bounds = useMemo(() => {
    let minX = Infinity,
      maxX = -Infinity,
      minZ = Infinity,
      maxZ = -Infinity;
    let maxH = 0;

    rooms.forEach((room) => {
      if (room.type === 'garden') return;
      const { x, z, w, d, h } = room.position;
      minX = Math.min(minX, x - w / 2);
      maxX = Math.max(maxX, x + w / 2);
      minZ = Math.min(minZ, z - d / 2);
      maxZ = Math.max(maxZ, z + d / 2);
      maxH = Math.max(maxH, h);
    });

    const padding = 2;
    return {
      minX: minX - padding,
      maxX: maxX + padding,
      minZ: minZ - padding,
      maxZ: maxZ + padding,
      centerX: (minX + maxX) / 2,
      centerZ: (minZ + maxZ) / 2,
      width: maxX - minX + padding * 2,
      depth: maxZ - minZ + padding * 2,
      height: maxH + 1.5,
    };
  }, [rooms]);

  useFrame((state) => {
    if (decorMaterialRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 1.5) * 0.3 + 0.7;
      decorMaterialRef.current.emissiveIntensity = pulse * 0.5;
    }
    if (edgeMaterialRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 1.2) * 0.3 + 0.7;
      edgeMaterialRef.current.opacity = pulse;
    }
  });

  const gardenRoom = rooms.find((r) => r.type === 'garden');

  return (
    <group>
      <mesh position={[bounds.centerX, -0.15, bounds.centerZ]}>
        <boxGeometry args={[bounds.width + 10, 0.3, bounds.depth + 10]} />
        <meshStandardMaterial color="#1a2840" roughness={0.9} />
      </mesh>
      <mesh position={[bounds.centerX, bounds.height / 2, bounds.centerZ]}>
        <boxGeometry args={[bounds.width, bounds.height, bounds.depth]} />
        <meshStandardMaterial
          color="#6B8E9F"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>
      <mesh position={[bounds.centerX, bounds.height / 2, bounds.centerZ]}>
        <boxGeometry args={[bounds.width, bounds.height, bounds.depth]} />
        <meshStandardMaterial
          color="#8BA5B5"
          transparent
          opacity={0.06}
          side={THREE.FrontSide}
          wireframe={false}
        />
        <Edges color="#00D4AA" lineWidth={1.5} transparent>
          <lineBasicMaterial
            ref={edgeMaterialRef}
            color="#00D4AA"
            transparent
            opacity={0.7}
            linewidth={1.5}
          />
        </Edges>
      </mesh>
      <mesh position={[bounds.centerX, bounds.height + 0.1, bounds.centerZ]}>
        <boxGeometry args={[bounds.width + 0.4, 0.2, bounds.depth + 0.4]} />
        <meshStandardMaterial
          ref={decorMaterialRef}
          color="#00D4AA"
          emissive="#00D4AA"
          emissiveIntensity={0.5}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[bounds.centerX, bounds.height + 0.35, bounds.centerZ]}>
        <boxGeometry args={[bounds.width, 0.15, bounds.depth]} />
        <meshStandardMaterial
          color="#00B894"
          emissive="#00D4AA"
          emissiveIntensity={0.3}
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>
      {[
        [bounds.minX, bounds.minZ],
        [bounds.maxX, bounds.minZ],
        [bounds.minX, bounds.maxZ],
        [bounds.maxX, bounds.maxZ],
      ].map(([cx, cz], idx) => (
        <group key={idx}>
          <mesh position={[cx, bounds.height / 2, cz]}>
            <cylinderGeometry args={[0.15, 0.2, bounds.height + 0.6, 8]} />
            <meshStandardMaterial
              color="#00D4AA"
              emissive="#00D4AA"
              emissiveIntensity={0.3}
              metalness={0.6}
              roughness={0.3}
            />
          </mesh>
          <mesh position={[cx, bounds.height + 0.6, cz]}>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshStandardMaterial
              color="#00D4AA"
              emissive="#00D4AA"
              emissiveIntensity={0.8}
            />
          </mesh>
        </group>
      ))}
      {gardenRoom && (
        <mesh
          position={[gardenRoom.position.x, -0.08, gardenRoom.position.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[gardenRoom.position.w, gardenRoom.position.d]} />
          <meshStandardMaterial
            color="#2ED573"
            transparent
            opacity={0.5}
            roughness={0.9}
          />
        </mesh>
      )}
      {gardenRoom &&
        (() => {
          const { x, z, w, d } = gardenRoom.position;
          const trees = [];
          for (let i = 0; i < 8; i++) {
            const tx = x + (Math.random() - 0.5) * w * 0.85;
            const tz = z + (Math.random() - 0.5) * d * 0.85;
            trees.push(
              <group key={`tree-${i}`} position={[tx, 0, tz]}>
                <mesh position={[0, 0.3, 0]}>
                  <cylinderGeometry args={[0.08, 0.1, 0.6, 6]} />
                  <meshStandardMaterial color="#8B4513" roughness={0.9} />
                </mesh>
                <mesh position={[0, 0.9, 0]}>
                  <coneGeometry args={[0.4, 0.8, 8]} />
                  <meshStandardMaterial color="#228B22" roughness={0.8} />
                </mesh>
                <mesh position={[0, 1.3, 0]}>
                  <coneGeometry args={[0.3, 0.6, 8]} />
                  <meshStandardMaterial color="#32CD32" roughness={0.8} />
                </mesh>
              </group>
            );
          }
          return trees;
        })()}
    </group>
  );
}
