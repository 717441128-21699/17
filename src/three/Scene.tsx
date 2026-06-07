import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useAppStore } from '../store/useAppStore';
import { getEscapePaths, getRescuePaths } from '../utils/pathfinding';
import type { Room, Bounds3D } from '../types';
import Building from './Building';
import Room3D from './Room3D';
import Elder3D from './Elder3D';
import Caregiver3D from './Caregiver3D';
import Robot3D from './Robot3D';
import PathLine from './PathLine';
import MedicineBox3D from './MedicineBox3D';

function getBuildingBounds(rooms: Room[]): Bounds3D {
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

  return {
    x: (minX + maxX) / 2,
    y: maxH / 2,
    z: (minZ + maxZ) / 2,
    w: maxX - minX,
    h: maxH,
    d: maxZ - minZ,
  };
}

function AlertEffects() {
  const alertRooms = useAppStore((s) => s.rooms.filter((r) => r.isAlerting));
  const alarmGroupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (alarmGroupRef.current) {
      alarmGroupRef.current.children.forEach((child, idx) => {
        const mesh = child as THREE.Mesh;
        const pulse = Math.sin(state.clock.elapsedTime * 4 + idx) * 0.5 + 0.5;
        if (mesh.material) {
          const mat = mesh.material as THREE.MeshBasicMaterial;
          mat.opacity = 0.2 + pulse * 0.5;
        }
        mesh.scale.setScalar(1 + pulse * 0.15);
      });
    }
  });

  return (
    <group ref={alarmGroupRef}>
      {alertRooms.map((room) => (
        <mesh
          key={room.id}
          position={[room.position.x, room.position.y + room.position.h / 2, room.position.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry
            args={[Math.max(room.position.w, room.position.d) * 0.4, Math.max(room.position.w, room.position.d) * 0.6, 32]}
          />
          <meshBasicMaterial
            color="#FF4D4F"
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

function SceneContent() {
  const rooms = useAppStore((s) => s.rooms);
  const elders = useAppStore((s) => s.elders);
  const caregivers = useAppStore((s) => s.caregivers);
  const patrolRobots = useAppStore((s) => s.patrolRobots);
  const medicines = useAppStore((s) => s.medicines);
  const evacuationMode = useAppStore((s) => s.evacuationMode);
  const visitorPath = useAppStore((s) => s.visitorPath);
  const selectedElderId = useAppStore((s) => s.selectedElderId);
  const selectElder = useAppStore((s) => s.selectElder);

  const buildingBounds = useMemo(() => getBuildingBounds(rooms), [rooms]);

  const escapePaths = useMemo(
    () => (evacuationMode ? getEscapePaths(buildingBounds) : []),
    [evacuationMode, buildingBounds]
  );

  const rescuePaths = useMemo(
    () => (evacuationMode ? getRescuePaths(buildingBounds) : []),
    [evacuationMode, buildingBounds]
  );

  const caregiverPositions = useMemo(() => {
    const nursingRoom = rooms.find((r) => r.type === 'nursing');
    const activityRoom = rooms.find((r) => r.type === 'activity');
    return caregivers.map((cg, idx) => {
      if (idx === 0 && nursingRoom) {
        return {
          name: cg.name,
          position: {
            x: nursingRoom.position.x + (idx % 2 === 0 ? 1 : -1),
            y: 0,
            z: nursingRoom.position.z,
          },
        };
      }
      if (activityRoom) {
        return {
          name: cg.name,
          position: {
            x: activityRoom.position.x + (idx - 1) * 3 - 3,
            y: 0,
            z: activityRoom.position.z + (idx % 2 === 0 ? 2 : -2),
          },
        };
      }
      return {
        name: cg.name,
        position: { x: 20 + idx * 2, y: 0, z: 15 },
      };
    });
  }, [caregivers, rooms]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[15, 20, 10]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, 10, -10]} intensity={0.5} color="#00D4AA" distance={50} />
      <pointLight position={[30, 10, 25]} intensity={0.5} color="#4A90D9" distance={50} />

      <Building rooms={rooms} />

      {rooms.map((room) => (
        <Room3D key={room.id} room={room} />
      ))}

      {elders.map((elder) => (
        <Elder3D
          key={elder.id}
          elder={elder}
          isSelected={selectedElderId === elder.id}
          onClick={() => selectElder(elder.id)}
        />
      ))}

      {caregiverPositions.map((cg, idx) => (
        <Caregiver3D key={`cg-${idx}`} position={cg.position} name={cg.name} />
      ))}

      {patrolRobots.map((robot) => (
        <Robot3D key={robot.id} robot={robot} />
      ))}

      {medicines.map((medicine) => (
        <MedicineBox3D key={medicine.id} medicine={medicine} />
      ))}

      {escapePaths.map((path, idx) => (
        <PathLine key={`escape-${idx}`} points={path} color="#2ED573" />
      ))}

      {rescuePaths.map((path, idx) => (
        <PathLine key={`rescue-${idx}`} points={path} color="#1E90FF" />
      ))}

      {visitorPath && (
        <PathLine points={visitorPath.points} color="#00D4AA" />
      )}

      <AlertEffects />

      <OrbitControls
        makeDefault
        minDistance={10}
        maxDistance={60}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 2.2}
        enableDamping
        dampingFactor={0.05}
      />

      <EffectComposer>
        <Bloom luminanceThreshold={0.2} intensity={0.8} luminanceSmoothing={0.9} />
      </EffectComposer>
    </>
  );
}

export default function Scene() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        shadows
        camera={{
          position: [20, 18, 25],
          fov: 50,
          near: 0.1,
          far: 1000,
        }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: 'linear-gradient(180deg, #0A1628 0%, #0F1E36 100%)' }}
      >
        <fog attach="fog" args={['#0A1628', 40, 100]} />
        <SceneContent />
      </Canvas>
    </div>
  );
}
