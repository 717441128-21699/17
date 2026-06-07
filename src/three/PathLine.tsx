import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

interface PathLineProps {
  points: { x: number; y: number; z: number }[];
  color: string;
}

export default function PathLine({ points, color }: PathLineProps) {
  const lineRef = useRef<THREE.Line>(null);
  const dashedMaterialRef = useRef<THREE.LineDashedMaterial>(null);

  const threePoints = useMemo(
    () => points.map((p) => new THREE.Vector3(p.x, p.y + 0.1, p.z)),
    [points]
  );

  useFrame((_, delta) => {
    if (dashedMaterialRef.current) {
      (dashedMaterialRef.current as any).dashOffset -= delta * 0.5;
    }
  });

  if (points.length < 2) return null;

  return (
    <group>
      <Line
        ref={lineRef as any}
        points={threePoints}
        color={color}
        lineWidth={3}
        transparent
        opacity={0.9}
      >
        <lineDashedMaterial
          ref={dashedMaterialRef}
          color={color}
          dashSize={0.5}
          gapSize={0.3}
          linewidth={3}
          transparent
          opacity={0.9}
        />
      </Line>
      {threePoints.map((point, idx) => (
        <mesh key={idx} position={[point.x, point.y, point.z]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}
