import type {
  User,
  Elder,
  Room,
  Alarm,
  Schedule,
  ShiftChangeRequest,
  Medicine,
  Visitor,
  PatrolRobot,
  MedicationRecord,
  CareLevel
} from '../types'
import { generateVitalSigns, generateVitalHistory, generateHealthScore, generateRandomPosition } from './dataGenerator'

const elderNames: { name: string; gender: 'male' | 'female' }[] = [
  { name: '王奶奶', gender: 'female' },
  { name: '李爷爷', gender: 'male' },
  { name: '张奶奶', gender: 'female' },
  { name: '刘爷爷', gender: 'male' },
  { name: '陈奶奶', gender: 'female' },
  { name: '赵爷爷', gender: 'male' },
  { name: '孙奶奶', gender: 'female' },
  { name: '周爷爷', gender: 'male' },
  { name: '吴奶奶', gender: 'female' },
  { name: '郑爷爷', gender: 'male' },
  { name: '冯奶奶', gender: 'female' },
  { name: '钱爷爷', gender: 'male' },
  { name: '许奶奶', gender: 'female' },
  { name: '何爷爷', gender: 'male' },
  { name: '谢奶奶', gender: 'female' },
  { name: '韩爷爷', gender: 'male' }
]

const caregiverNames = ['张秀英', '李桂芳', '王美华', '刘淑珍', '陈玉兰', '杨秀兰', '周凤英', '吴桂英']

const medicineData = [
  { name: '阿司匹林肠溶片', dosage: '100mg' },
  { name: '硝苯地平缓释片', dosage: '30mg' },
  { name: '二甲双胍片', dosage: '500mg' },
  { name: '美托洛尔片', dosage: '25mg' },
  { name: '阿托伐他汀钙片', dosage: '20mg' },
  { name: '氯吡格雷片', dosage: '75mg' },
  { name: '缬沙坦胶囊', dosage: '80mg' },
  { name: '奥美拉唑肠溶胶囊', dosage: '20mg' },
  { name: '氨氯地平片', dosage: '5mg' },
  { name: '辛伐他汀片', dosage: '40mg' },
  { name: '氢氯噻嗪片', dosage: '25mg' },
  { name: '螺内酯片', dosage: '25mg' },
  { name: '左氧氟沙星片', dosage: '500mg' },
  { name: '头孢克洛胶囊', dosage: '250mg' },
  { name: '氨溴索口服液', dosage: '10ml' },
  { name: '多潘立酮片', dosage: '10mg' },
  { name: '艾司唑仑片', dosage: '1mg' },
  { name: '甲钴胺片', dosage: '0.5mg' },
  { name: '维生素D滴剂', dosage: '400IU' },
  { name: '钙片', dosage: '600mg' }
]

const careLevels: CareLevel[] = ['self', 'semi', 'full']

const doseTimes = ['08:00', '12:00', '18:00', '21:00']

function generateMedications(elderId: string): MedicationRecord[] {
  const numMeds = Math.floor(Math.random() * 4) + 2
  const meds: MedicationRecord[] = []
  const selectedIndices = new Set<number>()

  while (selectedIndices.size < numMeds) {
    selectedIndices.add(Math.floor(Math.random() * medicineData.length))
  }

  let idx = 0
  selectedIndices.forEach((medIdx) => {
    const med = medicineData[medIdx]
    meds.push({
      id: `med_${elderId}_${idx}`,
      medicineName: med.name,
      dosage: med.dosage,
      time: doseTimes[idx % doseTimes.length],
      taken: Math.random() > 0.3
    })
    idx++
  })

  return meds
}

export const users: User[] = [
  {
    id: 'user_caregiver_1',
    name: '张秀英',
    role: 'caregiver',
    avatar: '👩‍⚕️',
    department: '护理部'
  },
  {
    id: 'user_headnurse_1',
    name: '林护士长',
    role: 'head_nurse',
    avatar: '👩‍⚕️‍⚕️',
    department: '护理部'
  },
  {
    id: 'user_director_1',
    name: '王院长',
    role: 'director',
    avatar: '👨‍💼',
    department: '院办公室'
  }
]

export const caregivers: User[] = caregiverNames.map((name, idx) => ({
  id: `caregiver_${idx + 1}`,
  name,
  role: 'caregiver' as const,
  avatar: '👩‍⚕️',
  department: '护理部'
}))

export const rooms: Room[] = [
  {
    id: 'room_bed_1',
    name: '1号居室',
    type: 'bedroom',
    position: { x: 0, y: 0, z: 0, w: 8, h: 3, d: 6 },
    occupancy: 2,
    capacity: 2,
    isAlerting: false
  },
  {
    id: 'room_bed_2',
    name: '2号居室',
    type: 'bedroom',
    position: { x: 10, y: 0, z: 0, w: 8, h: 3, d: 6 },
    occupancy: 2,
    capacity: 2,
    isAlerting: false
  },
  {
    id: 'room_bed_3',
    name: '3号居室',
    type: 'bedroom',
    position: { x: 20, y: 0, z: 0, w: 8, h: 3, d: 6 },
    occupancy: 2,
    capacity: 2,
    isAlerting: true
  },
  {
    id: 'room_bed_4',
    name: '4号居室',
    type: 'bedroom',
    position: { x: 30, y: 0, z: 0, w: 8, h: 3, d: 6 },
    occupancy: 2,
    capacity: 2,
    isAlerting: false
  },
  {
    id: 'room_bed_5',
    name: '5号居室',
    type: 'bedroom',
    position: { x: 0, y: 0, z: 10, w: 8, h: 3, d: 6 },
    occupancy: 2,
    capacity: 2,
    isAlerting: false
  },
  {
    id: 'room_bed_6',
    name: '6号居室',
    type: 'bedroom',
    position: { x: 10, y: 0, z: 10, w: 8, h: 3, d: 6 },
    occupancy: 2,
    capacity: 2,
    isAlerting: false
  },
  {
    id: 'room_bed_7',
    name: '7号居室',
    type: 'bedroom',
    position: { x: 20, y: 0, z: 10, w: 8, h: 3, d: 6 },
    occupancy: 2,
    capacity: 2,
    isAlerting: false
  },
  {
    id: 'room_bed_8',
    name: '8号居室',
    type: 'bedroom',
    position: { x: 30, y: 0, z: 10, w: 8, h: 3, d: 6 },
    occupancy: 2,
    capacity: 2,
    isAlerting: false
  },
  {
    id: 'room_activity',
    name: '活动区',
    type: 'activity',
    position: { x: 8, y: 0, z: 20, w: 24, h: 3, d: 10 },
    occupancy: 5,
    capacity: 30,
    isAlerting: false
  },
  {
    id: 'room_nursing',
    name: '护理站',
    type: 'nursing',
    position: { x: 40, y: 0, z: 0, w: 6, h: 3, d: 8 },
    occupancy: 3,
    capacity: 10,
    isAlerting: false
  },
  {
    id: 'room_dining',
    name: '餐厅',
    type: 'dining',
    position: { x: 0, y: 0, z: 20, w: 6, h: 3, d: 10 },
    occupancy: 8,
    capacity: 40,
    isAlerting: false
  },
  {
    id: 'room_pharmacy',
    name: '药房',
    type: 'pharmacy',
    position: { x: 40, y: 0, z: 10, w: 6, h: 3, d: 6 },
    occupancy: 1,
    capacity: 5,
    isAlerting: false
  },
  {
    id: 'room_monitor',
    name: '监控中心',
    type: 'monitor',
    position: { x: 40, y: 0, z: 18, w: 6, h: 3, d: 6 },
    occupancy: 2,
    capacity: 8,
    isAlerting: false
  },
  {
    id: 'room_garden',
    name: '户外花园',
    type: 'garden',
    position: { x: 0, y: 0, z: 32, w: 46, h: 0, d: 15 },
    occupancy: 4,
    capacity: 50,
    isAlerting: false
  }
]

function getBedRoomById(id: string): Room | undefined {
  return rooms.find(r => r.id === id)
}

export const elders: Elder[] = elderNames.map((info, idx) => {
  const roomIdx = idx % 8
  const roomId = `room_bed_${roomIdx + 1}`
  const room = getBedRoomById(roomId)!
  const age = Math.floor(Math.random() * 26) + 70
  const careLevel = careLevels[idx % 3]
  const activityLevel = Math.floor(Math.random() * 50) + 40
  const sleepQuality = Math.floor(Math.random() * 40) + 50
  const { heartRate, bloodOxygen } = generateVitalSigns()
  const vitalHistory = generateVitalHistory(24)
  const avgHeartRate = vitalHistory.reduce((sum, v) => sum + v.heartRate, 0) / vitalHistory.length
  const avgOxygen = vitalHistory.reduce((sum, v) => sum + v.bloodOxygen, 0) / vitalHistory.length
  const healthScore = generateHealthScore(activityLevel, sleepQuality, avgHeartRate, avgOxygen)

  return {
    id: `elder_${idx + 1}`,
    name: info.name,
    age,
    gender: info.gender,
    careLevel,
    roomId,
    position: generateRandomPosition(room.position),
    heartRate,
    bloodOxygen,
    activityLevel,
    sleepQuality,
    healthScore,
    vitalHistory,
    medications: generateMedications(`elder_${idx + 1}`)
  }
})

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export const schedules: Schedule[] = (() => {
  const result: Schedule[] = []
  const today = new Date()
  const shifts: ('morning' | 'afternoon' | 'night')[] = ['morning', 'afternoon', 'night']
  const areas = ['A区', 'B区', 'C区', 'D区']
  let scheduleId = 1

  for (let day = 0; day < 14; day++) {
    const date = new Date(today)
    date.setDate(today.getDate() + day)
    const dateStr = formatDate(date)

    caregivers.forEach((cg, cgIdx) => {
      const shiftIdx = (cgIdx + day) % 3
      if (Math.random() > 0.2) {
        result.push({
          id: `schedule_${scheduleId++}`,
          caregiverId: cg.id,
          date: dateStr,
          shift: shifts[shiftIdx],
          area: areas[cgIdx % areas.length]
        })
      }
    })
  }

  return result
})()

export const shiftChangeRequests: ShiftChangeRequest[] = [
  {
    id: 'request_1',
    applicantId: 'caregiver_1',
    originalScheduleId: 'schedule_1',
    targetDate: formatDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)),
    targetShift: 'night',
    reason: '家中有事需要处理，申请与同事调班',
    status: 'pending_head'
  },
  {
    id: 'request_2',
    applicantId: 'caregiver_3',
    originalScheduleId: 'schedule_10',
    targetDate: formatDate(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)),
    targetShift: 'afternoon',
    reason: '身体不适，需要去医院复查',
    status: 'pending_director',
    headNurseApproved: true
  },
  {
    id: 'request_3',
    applicantId: 'caregiver_5',
    originalScheduleId: 'schedule_20',
    targetDate: formatDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
    targetShift: 'morning',
    reason: '孩子家长会',
    status: 'approved',
    headNurseApproved: true,
    directorApproved: true
  },
  {
    id: 'request_4',
    applicantId: 'caregiver_7',
    originalScheduleId: 'schedule_30',
    targetDate: formatDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
    targetShift: 'afternoon',
    reason: '个人事务',
    status: 'rejected',
    headNurseApproved: false
  }
]

export const medicines: Medicine[] = medicineData.map((med, idx) => {
  let remainingDays: number
  if (idx < 3) {
    remainingDays = Math.floor(Math.random() * 2) + 1
  } else if (idx < 6) {
    remainingDays = Math.floor(Math.random() * 4) + 3
  } else {
    remainingDays = Math.floor(Math.random() * 25) + 7
  }

  const hour = 6 + Math.floor(Math.random() * 12)
  const minute = [0, 30][Math.floor(Math.random() * 2)]
  const dailyDose = med.dosage.includes('3次') ? 3 : med.dosage.includes('2次') ? 2 : 1
  const remainingQuantity = remainingDays * dailyDose + Math.floor(Math.random() * 5)

  return {
    id: `medicine_${idx + 1}`,
    name: med.name,
    dosage: med.dosage,
    remainingDays,
    remainingQuantity,
    nextDoseTime: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    position: {
      x: 41 + Math.random() * 4,
      y: 0.5 + Math.random() * 1.5,
      z: 11 + Math.random() * 4
    },
    refillRequested: remainingDays < 3
  }
})

export const visitors: Visitor[] = [
  {
    id: 'visitor_1',
    name: '王小明',
    phone: '13800138001',
    visitDate: formatDate(new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)),
    visitElderId: 'elder_1',
    status: 'pending'
  },
  {
    id: 'visitor_2',
    name: '李小华',
    phone: '13800138002',
    visitDate: formatDate(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)),
    visitElderId: 'elder_3',
    status: 'approved',
    approvedBy: 'user_headnurse_1'
  },
  {
    id: 'visitor_3',
    name: '张小丽',
    phone: '13800138003',
    visitDate: formatDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)),
    visitElderId: 'elder_5',
    status: 'pending'
  },
  {
    id: 'visitor_4',
    name: '刘小强',
    phone: '13800138004',
    visitDate: formatDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
    visitElderId: 'elder_7',
    status: 'completed',
    approvedBy: 'user_headnurse_1'
  },
  {
    id: 'visitor_5',
    name: '陈小燕',
    phone: '13800138005',
    visitDate: formatDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
    visitElderId: 'elder_9',
    status: 'rejected',
    approvedBy: 'user_headnurse_1'
  }
]

export const patrolRobots: PatrolRobot[] = [
  {
    id: 'robot_1',
    name: '巡护1号',
    position: { x: 15, y: 0, z: 5 },
    currentRoute: 'A区居室走廊',
    status: 'patrolling',
    battery: 85
  },
  {
    id: 'robot_2',
    name: '巡护2号',
    position: { x: 42, y: 0, z: 12 },
    currentRoute: '充电中',
    status: 'charging',
    battery: 25
  }
]

const now = Date.now()

export const alarms: Alarm[] = [
  {
    id: 'alarm_1',
    type: 'heart_rate',
    level: 'critical',
    elderId: 'elder_1',
    roomId: 'room_bed_3',
    timestamp: now - 5 * 60 * 1000,
    status: 'pending',
    message: '王奶奶心率异常，当前心率135次/分'
  },
  {
    id: 'alarm_2',
    type: 'fall',
    level: 'high',
    elderId: 'elder_3',
    roomId: 'room_bed_1',
    timestamp: now - 15 * 60 * 1000,
    status: 'handling',
    handlerId: 'caregiver_1',
    message: '张奶奶房间检测到疑似跌倒事件'
  },
  {
    id: 'alarm_3',
    type: 'medicine',
    level: 'medium',
    elderId: 'elder_5',
    roomId: 'room_bed_2',
    timestamp: now - 30 * 60 * 1000,
    status: 'pending',
    message: '赵爷爷尚未服用12:00的降压药'
  },
  {
    id: 'alarm_4',
    type: 'patrol',
    level: 'low',
    roomId: 'room_activity',
    timestamp: now - 45 * 60 * 1000,
    status: 'resolved',
    handlerId: 'caregiver_2',
    message: '活动区人员聚集提醒，当前8人'
  },
  {
    id: 'alarm_5',
    type: 'heart_rate',
    level: 'high',
    elderId: 'elder_8',
    roomId: 'room_bed_4',
    timestamp: now - 60 * 60 * 1000,
    status: 'resolved',
    handlerId: 'caregiver_3',
    message: '周爷爷血氧偏低，已处理，当前恢复正常'
  }
]
