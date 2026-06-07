import type { Position3D, Bounds3D } from '../types';

interface Obstacle {
  position: Bounds3D;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpPoint(a: Position3D, b: Position3D, t: number): Position3D {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    z: lerp(a.z, b.z, t),
  };
}

export function generatePath(
  from: Position3D,
  to: Position3D,
  obstacles?: Obstacle[],
  segments: number = 20
): Position3D[] {
  const points: Position3D[] = [];
  const midPoint: Position3D = {
    x: (from.x + to.x) / 2,
    y: Math.max(from.y, to.y) + 0.5,
    z: (from.z + to.z) / 2,
  };

  if (obstacles && obstacles.length > 0) {
    for (const obs of obstacles) {
      const ox = obs.position.x;
      const oz = obs.position.z;
      const ow = obs.position.w;
      const od = obs.position.d;
      if (
        midPoint.x > ox - ow / 2 &&
        midPoint.x < ox + ow / 2 &&
        midPoint.z > oz - od / 2 &&
        midPoint.z < oz + od / 2
      ) {
        midPoint.x += ow;
        midPoint.z += od * 0.5;
        break;
      }
    }
  }

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    if (t < 0.5) {
      const localT = t * 2;
      points.push(lerpPoint(from, midPoint, localT));
    } else {
      const localT = (t - 0.5) * 2;
      points.push(lerpPoint(midPoint, to, localT));
    }
  }

  return points;
}

export function getEscapePaths(buildingBounds: Bounds3D): Position3D[][] {
  const paths: Position3D[][] = [];
  const { x, y, z, w, d } = buildingBounds;

  paths.push([
    { x: x - w / 2, y, z: z - d / 2 },
    { x: x - w / 2 + w * 0.2, y, z: z - d / 2 + d * 0.1 },
    { x: x - w / 2 + w * 0.4, y, z: z - d / 2 + d * 0.3 },
    { x: x - w / 2 + w * 0.6, y, z: z - d / 2 + d * 0.5 },
    { x: x - w / 2 + w * 0.8, y, z: z - d / 2 + d * 0.7 },
    { x: x + w / 2, y, z: z + d / 2 },
  ]);

  paths.push([
    { x: x + w / 2, y, z: z - d / 2 },
    { x: x + w / 2 - w * 0.2, y: y + 1, z: z - d / 2 + d * 0.1 },
    { x: x + w / 2 - w * 0.4, y: y + 1, z: z - d / 2 + d * 0.3 },
    { x: x + w / 2 - w * 0.6, y: y + 1, z: z - d / 2 + d * 0.5 },
    { x: x + w / 2 - w * 0.8, y: y + 1, z: z - d / 2 + d * 0.7 },
    { x: x - w / 2, y: y + 1, z: z + d / 2 },
  ]);

  paths.push([
    { x, y, z: z - d / 2 },
    { x, y, z: z - d / 4 },
    { x, y, z },
    { x, y, z: z + d / 4 },
    { x, y, z: z + d / 2 },
  ]);

  return paths;
}

export function getRescuePaths(buildingBounds: Bounds3D): Position3D[][] {
  const paths: Position3D[][] = [];
  const { x, y, z, w, d } = buildingBounds;

  paths.push([
    { x: x - w / 2, y, z: z + d / 2 },
    { x: x - w / 2 + w * 0.25, y, z: z + d / 2 - d * 0.2 },
    { x: x - w / 2 + w * 0.5, y, z: z + d / 2 - d * 0.4 },
    { x: x - w / 2 + w * 0.75, y, z: z + d / 2 - d * 0.6 },
    { x: x + w / 2, y, z: z + d / 2 - d * 0.8 },
    { x: x + w / 2, y, z: z - d / 2 },
  ]);

  paths.push([
    { x: x + w / 2, y: y + 1, z: z + d / 2 },
    { x: x + w / 2 - w * 0.25, y: y + 1, z: z + d / 2 - d * 0.2 },
    { x: x + w / 2 - w * 0.5, y: y + 1, z: z + d / 2 - d * 0.4 },
    { x: x + w / 2 - w * 0.75, y: y + 1, z: z + d / 2 - d * 0.6 },
    { x: x - w / 2, y: y + 1, z: z + d / 2 - d * 0.8 },
    { x: x - w / 2, y: y + 1, z: z - d / 2 },
  ]);

  paths.push([
    { x: x - w / 2, y, z },
    { x: x - w / 4, y, z },
    { x, y, z },
    { x: x + w / 4, y, z },
    { x: x + w / 2, y, z },
  ]);

  return paths;
}
