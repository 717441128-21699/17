import type { Position3D, Bounds3D, Room } from '../types';

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

function interpolatePath(points: Position3D[], segmentsPerStep: number = 6): Position3D[] {
  const result: Position3D[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    for (let j = 0; j < segmentsPerStep; j++) {
      result.push(lerpPoint(points[i], points[i + 1], j / segmentsPerStep));
    }
  }
  if (points.length > 0) {
    result.push(points[points.length - 1]);
  }
  return result;
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

export function getEscapePaths(rooms: Room[]): Position3D[][] {
  const paths: Position3D[][] = [];
  const bedrooms = rooms.filter((r) => r.type === 'bedroom');
  const garden = rooms.find((r) => r.type === 'garden');
  const activity = rooms.find((r) => r.type === 'activity');
  const exit = { x: 2, y: 0, z: -1 };

  if (bedrooms.length > 0 && garden) {
    const sortedBeds = [...bedrooms].sort((a, b) => a.position.x - b.position.x);

    const firstRow = sortedBeds.filter((_, i) => i % 2 === 0);
    if (firstRow.length > 0) {
      const waypoints: Position3D[] = [];
      waypoints.push(exit);
      firstRow.forEach((bed) => {
        waypoints.push({ x: bed.position.x, y: 0, z: bed.position.z - bed.position.d / 2 - 0.5 });
      });
      if (activity) {
        waypoints.push({ x: activity.position.x, y: 0, z: activity.position.z + activity.position.d / 2 + 1 });
      }
      waypoints.push({ x: garden.position.x, y: 0, z: garden.position.z });
      paths.push(interpolatePath(waypoints));
    }

    const secondRow = sortedBeds.filter((_, i) => i % 2 === 1);
    if (secondRow.length > 0) {
      const waypoints: Position3D[] = [];
      waypoints.push({ x: 40, y: 0, z: -1 });
      secondRow.forEach((bed) => {
        waypoints.push({ x: bed.position.x, y: 0, z: bed.position.z - bed.position.d / 2 - 0.5 });
      });
      waypoints.push({ x: garden.position.x + garden.position.w / 3, y: 0, z: garden.position.z });
      paths.push(interpolatePath(waypoints));
    }

    const centerPath: Position3D[] = [];
    centerPath.push({ x: 23, y: 0, z: -1 });
    centerPath.push({ x: 23, y: 0, z: 5 });
    centerPath.push({ x: 23, y: 0, z: 15 });
    if (activity) {
      centerPath.push({ x: activity.position.x, y: 0, z: activity.position.z });
    }
    centerPath.push({ x: 23, y: 0, z: garden ? garden.position.z : 35 });
    paths.push(interpolatePath(centerPath));
  }

  if (paths.length === 0) {
    return getEscapePathsFallback(rooms);
  }

  return paths;
}

function getEscapePathsFallback(rooms: Room[]): Position3D[][] {
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  rooms.forEach((room) => {
    if (room.type === 'garden') return;
    const { x, z, w, d } = room.position;
    minX = Math.min(minX, x - w / 2);
    maxX = Math.max(maxX, x + w / 2);
    minZ = Math.min(minZ, z - d / 2);
    maxZ = Math.max(maxZ, z + d / 2);
  });
  const cx = (minX + maxX) / 2;
  const cz = (minZ + maxZ) / 2;
  const w = maxX - minX;
  const d = maxZ - minZ;
  return [
    interpolatePath([
      { x: minX, y: 0, z: minZ },
      { x: minX + w * 0.3, y: 0, z: cz },
      { x: cx, y: 0, z: cz },
      { x: maxX - w * 0.3, y: 0, z: cz },
      { x: maxX, y: 0, z: maxZ },
    ]),
    interpolatePath([
      { x: maxX, y: 0, z: minZ },
      { x: maxX - w * 0.3, y: 0, z: minZ + d * 0.3 },
      { x: cx, y: 0, z: cz },
      { x: minX + w * 0.3, y: 0, z: maxZ - d * 0.3 },
      { x: minX, y: 0, z: maxZ },
    ]),
    interpolatePath([
      { x: cx, y: 0, z: minZ },
      { x: cx, y: 0, z: cz },
      { x: cx, y: 0, z: maxZ },
    ]),
  ];
}

export function getRescuePaths(rooms: Room[]): Position3D[][] {
  const paths: Position3D[][] = [];
  const nursing = rooms.find((r) => r.type === 'nursing');
  const pharmacy = rooms.find((r) => r.type === 'pharmacy');
  const monitor = rooms.find((r) => r.type === 'monitor');
  const bedrooms = rooms.filter((r) => r.type === 'bedroom');
  const entrance = { x: 2, y: 0, z: -1 };

  if (nursing && pharmacy && bedrooms.length > 0) {
    const path1: Position3D[] = [];
    path1.push(entrance);
    path1.push({ x: nursing.position.x - nursing.position.w / 2 - 0.5, y: 0, z: nursing.position.z });
    path1.push({ x: nursing.position.x, y: 0, z: nursing.position.z });
    if (pharmacy) {
      path1.push({ x: pharmacy.position.x, y: 0, z: pharmacy.position.z });
    }
    if (monitor) {
      path1.push({ x: monitor.position.x, y: 0, z: monitor.position.z });
    }
    bedrooms.slice(0, 3).forEach((bed) => {
      path1.push({ x: bed.position.x, y: 0, z: bed.position.z });
    });
    paths.push(interpolatePath(path1));

    const sortedBeds = [...bedrooms].sort((a, b) => b.position.x - a.position.x);
    const path2: Position3D[] = [];
    path2.push({ x: 40, y: 0, z: -1 });
    path2.push({ x: nursing.position.x, y: 0, z: nursing.position.z });
    sortedBeds.slice(0, 4).forEach((bed) => {
      path2.push({ x: bed.position.x, y: 0, z: bed.position.z });
    });
    const activity = rooms.find((r) => r.type === 'activity');
    if (activity) {
      path2.push({ x: activity.position.x, y: 0, z: activity.position.z });
    }
    paths.push(interpolatePath(path2));

    const path3: Position3D[] = [];
    path3.push({ x: 23, y: 0, z: -1 });
    path3.push({ x: 23, y: 0, z: 5 });
    bedrooms.forEach((bed) => {
      if (Math.abs(bed.position.x - 23) < 10) {
        path3.push({ x: bed.position.x, y: 0, z: bed.position.z });
      }
    });
    path3.push({ x: 23, y: 0, z: 15 });
    const dining = rooms.find((r) => r.type === 'dining');
    if (dining) {
      path3.push({ x: dining.position.x, y: 0, z: dining.position.z });
    }
    path3.push({ x: 23, y: 0, z: 32 });
    paths.push(interpolatePath(path3));
  }

  if (paths.length === 0) {
    return getRescuePathsFallback(rooms);
  }

  return paths;
}

function getRescuePathsFallback(rooms: Room[]): Position3D[][] {
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  rooms.forEach((room) => {
    if (room.type === 'garden') return;
    const { x, z, w, d } = room.position;
    minX = Math.min(minX, x - w / 2);
    maxX = Math.max(maxX, x + w / 2);
    minZ = Math.min(minZ, z - d / 2);
    maxZ = Math.max(maxZ, z + d / 2);
  });
  const cx = (minX + maxX) / 2;
  const cz = (minZ + maxZ) / 2;
  const w = maxX - minX;
  const d = maxZ - minZ;
  return [
    interpolatePath([
      { x: minX, y: 0, z: maxZ },
      { x: minX + w * 0.25, y: 0, z: maxZ - d * 0.2 },
      { x: cx, y: 0, z: cz },
      { x: maxX - w * 0.25, y: 0, z: minZ + d * 0.2 },
      { x: maxX, y: 0, z: minZ },
    ]),
    interpolatePath([
      { x: maxX, y: 0, z: maxZ },
      { x: maxX - w * 0.25, y: 0, z: maxZ - d * 0.2 },
      { x: cx, y: 0, z: cz },
      { x: minX + w * 0.25, y: 0, z: minZ + d * 0.2 },
      { x: minX, y: 0, z: minZ },
    ]),
    interpolatePath([
      { x: minX, y: 0, z: cz },
      { x: cx, y: 0, z: cz },
      { x: maxX, y: 0, z: cz },
    ]),
  ];
}
