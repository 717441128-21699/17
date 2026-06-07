import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import type { Position3D } from '../types';

interface PathLineProps {
  points: Position3D[];
  color: string;
}

export default function PathLine({ points, color }: PathLineProps) {
  const lineRef = useRef<THREE.Line>(null);
  const dashedMaterialRef = useRef<THREE.LineDashedMaterial>(null);
  const { scene } = useThree();

  const threePoints = useMemo(
    () => points.map((p) => new THREE.Vector3(p.x, p.y + 0.15, p.z)),
    [points]
  );

  useEffect(() => {
    if (lineRef.current) {
      lineRef.current.computeLineDistances();
    }
  }, [threePoints, scene]);

  useFrame((_, delta) => {
    if (dashedMaterialRef.current) {
      (dashedMaterialRef.current as any).dashOffset -= delta * 0.6;
    }
  });

  if (points.length < 2) return null;

  return (
    <group>
      <Line
        ref={lineRef as any}
        points={threePoints}
        color={color}
        lineWidth={4}
        transparent
        opacity={0.95}
      >
        <lineDashedMaterial
          ref={dashedMaterialRef}
          color={color}
          dashSize={0.8}
          gapSize={0.4}
          linewidth={4}
          transparent
          opacity={0.95}
        />
      </Line>
      {threePoints.map((point, idx) => (
        <mesh key={idx} position={[point.x, point.y, point.z]}>
          <sphereGeometry args={[idx === 0 || idx === threePoints.length - 1 ? 0.15 : 0.08, 12, 12]} />
          <meshBasicMaterial color={color} transparent opacity={0.9} />
        </mesh>
      ))}
      <mesh position={[threePoints[0].x, threePoints[0].y + 0.3, threePoints[0].z]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
      <mesh position={[threePoints[threePoints.length - 1].x, threePoints[threePoints.length - 1].y + 0.3, threePoints[threePoints.length - 1].z]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}
