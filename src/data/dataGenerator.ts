import type { VitalSign, Elder, Position3D, Box3D } from '../types'

export function generateVitalSigns(): { heartRate: number; bloodOxygen: number } {
  const abnormalChance = Math.random()
  let heartRate: number
  let bloodOxygen: number

  if (abnormalChance < 0.05) {
    heartRate = Math.random() < 0.5 ? Math.floor(Math.random() * 20) + 30 : Math.floor(Math.random() * 30) + 120
    bloodOxygen = Math.floor(Math.random() * 10) + 80
  } else if (abnormalChance < 0.15) {
    heartRate = Math.random() < 0.5 ? Math.floor(Math.random() * 10) + 50 : Math.floor(Math.random() * 15) + 100
    bloodOxygen = Math.floor(Math.random() * 5) + 90
  } else {
    heartRate = Math.floor(Math.random() * 40) + 60
    bloodOxygen = Math.floor(Math.random() * 6) + 95
  }

  return { heartRate, bloodOxygen }
}

export function generateHealthScore(
  activityLevel: number,
  sleepQuality: number,
  avgHeartRate: number,
  avgOxygen: number
): number {
  const activityScore = activityLevel * 0.3

  const sleepScore = sleepQuality * 0.3

  let heartScore: number
  if (avgHeartRate >= 60 && avgHeartRate <= 100) {
    heartScore = 100
  } else if (avgHeartRate >= 50 && avgHeartRate <= 120) {
    heartScore = 70
  } else {
    heartScore = 40
  }
  heartScore *= 0.2

  let oxygenScore: number
  if (avgOxygen >= 95) {
    oxygenScore = 100
  } else if (avgOxygen >= 90) {
    oxygenScore = 70
  } else {
    oxygenScore = 40
  }
  oxygenScore *= 0.2

  return Math.round(activityScore + sleepScore + heartScore + oxygenScore)
}

export function shouldTriggerAlarm(elder: Elder): boolean {
  if (elder.heartRate > 120 || elder.heartRate < 50) return true
  if (elder.bloodOxygen < 90) return true
  if (elder.healthScore < 50 && Math.random() < 0.3) return true
  return Math.random() < 0.02
}

export function generateRandomPosition(area: Box3D): Position3D {
  return {
    x: area.x + Math.random() * area.w,
    y: area.y + Math.random() * area.h,
    z: area.z + Math.random() * area.d
  }
}

export function generateVitalHistory(hours: number = 24): VitalSign[] {
  const history: VitalSign[] = []
  const now = Date.now()
  const interval = 60 * 60 * 1000

  for (let i = hours; i >= 0; i--) {
    const { heartRate, bloodOxygen } = generateVitalSigns()
    history.push({
      timestamp: now - i * interval,
      heartRate,
      bloodOxygen
    })
  }

  return history
}
