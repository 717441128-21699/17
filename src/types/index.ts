export type Role = 'caregiver' | 'head_nurse' | 'director';

export type CareLevel = 'self' | 'semi' | 'full';

export type ActivePanel = 'none' | 'elder' | 'alarms' | 'schedule' | 'pharmacy' | 'visitors' | 'reports';

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface Bounds3D extends Position3D {
  w: number;
  h: number;
  d: number;
}

export type Box3D = Bounds3D;

export interface User {
  id: string;
  name: string;
  role: Role;
  avatar: string;
  faceFeature?: string;
  department: string;
}

export interface VitalSign {
  timestamp: number;
  heartRate: number;
  bloodOxygen: number;
}

export interface MedicationRecord {
  id: string;
  medicineName: string;
  dosage: string;
  time: string;
  taken: boolean;
}

export interface Elder {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  careLevel: CareLevel;
  roomId: string;
  position: Position3D;
  heartRate: number;
  bloodOxygen: number;
  activityLevel: number;
  sleepQuality: number;
  healthScore: number;
  vitalHistory: VitalSign[];
  medications: MedicationRecord[];
}

export interface Room {
  id: string;
  name: string;
  type: 'bedroom' | 'activity' | 'nursing' | 'dining' | 'pharmacy' | 'monitor' | 'garden';
  area?: string;
  position: Bounds3D;
  occupancy: number;
  capacity: number;
  isAlerting: boolean;
}

export interface Alarm {
  id: string;
  type: 'heart_rate' | 'fall' | 'medicine' | 'patrol';
  level: 'low' | 'medium' | 'high' | 'critical';
  elderId?: string;
  roomId: string;
  timestamp: number;
  status: 'pending' | 'handling' | 'resolved';
  handlerId?: string;
  message: string;
}

export interface Schedule {
  id: string;
  caregiverId: string;
  date: string;
  shift: 'morning' | 'afternoon' | 'night';
  area: string;
}

export interface ShiftChangeRequest {
  id: string;
  applicantId: string;
  originalScheduleId: string;
  targetDate: string;
  targetShift: 'morning' | 'afternoon' | 'night';
  reason: string;
  status: 'pending_head' | 'pending_director' | 'approved' | 'rejected';
  headNurseApproved?: boolean;
  directorApproved?: boolean;
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  remainingDays: number;
  nextDoseTime: string;
  position: Position3D;
  refillRequested: boolean;
}

export interface Visitor {
  id: string;
  name: string;
  phone: string;
  visitDate: string;
  visitElderId: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  approvedBy?: string;
}

export interface PatrolRobot {
  id: string;
  name: string;
  position: Position3D;
  currentRoute: string;
  status: 'patrolling' | 'charging' | 'alert';
  battery: number;
}

export interface VisitorPath {
  visitorId: string;
  from: Position3D;
  to: Position3D;
  points: Position3D[];
}

export interface DailyReport {
  occupancyStats: Array<{
    areaName: string;
    roomCount: number;
    occupied: number;
    occupancyRate: number;
  }>;
  healthEventStats: Array<{
    eventType: string;
    count: number;
    resolveRate: number;
  }>;
  scheduleStats: Array<{
    caregiverName: string;
    morningDays: number;
    afternoonDays: number;
    nightDays: number;
    totalDays: number;
  }>;
}
