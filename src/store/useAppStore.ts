import { create } from 'zustand';
import type {
  User,
  Elder,
  Alarm,
  Schedule,
  ShiftChangeRequest,
  Medicine,
  Visitor,
  PatrolRobot,
  Room,
  ActivePanel,
  VisitorPath,
  Role,
  Position3D,
  DailyReport,
  RefillRequest,
} from '../types';
import { SHIFT_APPROVAL_STATUS } from '../types';
import {
  users,
  caregivers,
  elders,
  alarms,
  schedules,
  shiftChangeRequests,
  medicines,
  visitors,
  patrolRobots,
  rooms,
  refillRequests as initialRefillRequests,
} from '../data/mockData';

interface AppState {
  currentUser: User | null;
  selectedElderId: string | null;
  activePanel: ActivePanel;
  evacuationMode: boolean;
  visitorPath: VisitorPath | null;
  elders: Elder[];
  caregivers: User[];
  alarms: Alarm[];
  schedules: Schedule[];
  shiftChangeRequests: ShiftChangeRequest[];
  medicines: Medicine[];
  refillRequests: RefillRequest[];
  visitors: Visitor[];
  patrolRobots: PatrolRobot[];
  rooms: Room[];

  login: (user: User) => void;
  logout: () => void;
  selectElder: (id: string | null) => void;
  setActivePanel: (panel: ActivePanel) => void;
  toggleEvacuationMode: () => void;
  setVisitorPath: (path: VisitorPath | null) => void;
  triggerAlarm: (alarm: Alarm) => void;
  handleAlarm: (alarmId: string, handlerId: string) => void;
  resolveAlarm: (alarmId: string) => void;
  updateElderVital: (elderId: string, heartRate: number, bloodOxygen: number) => void;
  updateRobotPosition: (robotId: string, position: Position3D) => void;
  submitShiftChange: (request: Omit<ShiftChangeRequest, 'id' | 'status'>) => void;
  approveShiftChange: (requestId: string, approverRole: Role, approved: boolean) => void;
  requestRefill: (medicineId: string) => void;
  approveRefill: (requestId: string, approved: boolean) => void;
  approveVisitor: (visitorId: string, approved: boolean) => void;
  exportDailyReport: (date: string) => DailyReport;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  selectedElderId: null,
  activePanel: 'none',
  evacuationMode: false,
  visitorPath: null,
  elders,
  caregivers,
  alarms,
  schedules,
  shiftChangeRequests,
  medicines,
  refillRequests: initialRefillRequests,
  visitors,
  patrolRobots,
  rooms,

  login: (user) => set({ currentUser: user }),
  logout: () => set({ currentUser: null, selectedElderId: null, activePanel: 'none' }),

  selectElder: (id) => set({ selectedElderId: id, activePanel: id ? 'elder' : 'none' }),

  setActivePanel: (panel) => set({ activePanel: panel }),

  toggleEvacuationMode: () => set((s) => ({ evacuationMode: !s.evacuationMode })),

  setVisitorPath: (path) => set({ visitorPath: path }),

  triggerAlarm: (alarm) =>
    set((s) => ({
      alarms: [alarm, ...s.alarms],
      rooms: s.rooms.map((r) => (r.id === alarm.roomId ? { ...r, isAlerting: true } : r)),
    })),

  handleAlarm: (alarmId, handlerId) =>
    set((s) => ({
      alarms: s.alarms.map((a) =>
        a.id === alarmId ? { ...a, status: 'handling', handlerId } : a
      ),
    })),

  resolveAlarm: (alarmId) => {
    const alarm = get().alarms.find((a) => a.id === alarmId);
    set((s) => ({
      alarms: s.alarms.map((a) => (a.id === alarmId ? { ...a, status: 'resolved' } : a)),
      rooms: alarm
        ? s.rooms.map((r) => {
            const otherActive = s.alarms.some(
              (a) => a.id !== alarmId && a.roomId === r.id && a.status !== 'resolved'
            );
            return r.id === alarm.roomId ? { ...r, isAlerting: otherActive } : r;
          })
        : s.rooms,
    }));
  },

  updateElderVital: (elderId, heartRate, bloodOxygen) =>
    set((s) => ({
      elders: s.elders.map((e) =>
        e.id === elderId
          ? {
              ...e,
              heartRate,
              bloodOxygen,
              vitalHistory: [
                ...e.vitalHistory.slice(-47),
                { timestamp: Date.now(), heartRate, bloodOxygen },
              ],
            }
          : e
      ),
    })),

  updateRobotPosition: (robotId, position) =>
    set((s) => ({
      patrolRobots: s.patrolRobots.map((r) =>
        r.id === robotId ? { ...r, position } : r
      ),
    })),

  submitShiftChange: (request) =>
    set((s) => ({
      shiftChangeRequests: [
        {
          ...request,
          id: `scr-${Date.now()}`,
          status: SHIFT_APPROVAL_STATUS.PENDING_HEAD,
        },
        ...s.shiftChangeRequests,
      ],
    })),

  approveShiftChange: (requestId, approverRole, approved) =>
    set((s) => ({
      shiftChangeRequests: s.shiftChangeRequests.map((r) => {
        if (r.id !== requestId) return r;
        if (!approved) {
          return { ...r, status: SHIFT_APPROVAL_STATUS.REJECTED };
        }
        if (approverRole === 'head_nurse') {
          return { ...r, status: SHIFT_APPROVAL_STATUS.PENDING_DIRECTOR, headNurseApproved: true };
        }
        if (approverRole === 'director') {
          return { ...r, status: SHIFT_APPROVAL_STATUS.APPROVED, directorApproved: true };
        }
        return r;
      }),
    })),

  requestRefill: (medicineId) => {
    const medicine = get().medicines.find((m) => m.id === medicineId);
    if (!medicine) return;
    const currentUser = get().currentUser;
    const newRequest = {
      id: `refill_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      medicineId,
      medicineName: medicine.name,
      quantity: 30,
      requestedBy: currentUser?.id,
      requestedAt: Date.now(),
      status: 'pending' as const,
    };
    set((s) => ({
      medicines: s.medicines.map((m) =>
        m.id === medicineId ? { ...m, refillRequested: true } : m
      ),
      refillRequests: [newRequest, ...s.refillRequests],
    }));
  },

  approveRefill: (requestId, approved) =>
    set((s) => ({
      refillRequests: s.refillRequests.map((r) =>
        r.id === requestId
          ? { ...r, status: approved ? 'approved' : 'rejected' }
          : r
      ),
    })),

  approveVisitor: (visitorId, approved) =>
    set((s) => ({
      visitors: s.visitors.map((v) => {
        if (v.id !== visitorId) return v;
        const currentUser = get().currentUser;
        return {
          ...v,
          status: approved ? 'approved' : 'rejected',
          approvedBy: currentUser?.id,
        };
      }),
    })),

  exportDailyReport: (date): DailyReport => {
    const state = get();

    const typeLabels: Record<string, string> = {
      bedroom: '老人居室',
      activity: '活动区',
      nursing: '护理站',
      dining: '餐厅',
      pharmacy: '药房',
      monitor: '监控中心',
      garden: '户外花园',
    };

    const areaMap = new Map<string, { rooms: Room[] }>();
    state.rooms.forEach((room) => {
      const areaName = typeLabels[room.type] || room.type;
      if (!areaMap.has(areaName)) areaMap.set(areaName, { rooms: [] });
      areaMap.get(areaName)!.rooms.push(room);
    });
    const occupancyStats = Array.from(areaMap.entries()).map(([areaName, data]) => {
      const roomCount = data.rooms.length;
      const occupied = data.rooms.reduce((sum, r) => sum + r.occupancy, 0);
      const capacity = data.rooms.reduce((sum, r) => sum + r.capacity, 0);
      return {
        areaName,
        roomCount,
        occupied,
        occupancyRate: capacity > 0 ? Math.round((occupied / capacity) * 100) : 0,
      };
    });

    const alarmTypeMap = new Map<string, Alarm[]>();
    state.alarms.forEach((alarm) => {
      if (!alarmTypeMap.has(alarm.type)) alarmTypeMap.set(alarm.type, []);
      alarmTypeMap.get(alarm.type)!.push(alarm);
    });
    const eventTypeLabels: Record<string, string> = {
      heart_rate: '心率异常',
      fall: '跌倒检测',
      medicine: '用药提醒',
      patrol: '巡更异常',
    };
    const allEventTypes = ['heart_rate', 'fall', 'medicine', 'patrol'];
    const healthEventStats = allEventTypes.map((type) => {
      const alarmsOfType = alarmTypeMap.get(type) || [];
      return {
        eventType: eventTypeLabels[type] || type,
        count: alarmsOfType.length,
        resolveRate:
          alarmsOfType.length > 0
            ? Math.round((alarmsOfType.filter((a) => a.status === 'resolved').length / alarmsOfType.length) * 100)
            : 0,
      };
    });

    const scheduleStats = state.caregivers.map((cg) => {
      const cgSchedules = state.schedules.filter(
        (s) => s.caregiverId === cg.id && s.date.startsWith(date.slice(0, 7))
      );
      const morningDays = cgSchedules.filter((s) => s.shift === 'morning').length;
      const afternoonDays = cgSchedules.filter((s) => s.shift === 'afternoon').length;
      const nightDays = cgSchedules.filter((s) => s.shift === 'night').length;
      return {
        caregiverName: cg.name,
        morningDays,
        afternoonDays,
        nightDays,
        totalDays: morningDays + afternoonDays + nightDays,
      };
    });

    return { occupancyStats, healthEventStats, scheduleStats };
  },
}));
