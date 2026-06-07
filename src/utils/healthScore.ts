import type { Elder } from '../types';

export function calculateHealthScore(elder: Elder): number {
  const activityScore = elder.activityLevel * 0.3;
  const sleepScore = elder.sleepQuality * 0.3;
  const heartScore = (elder.heartRate > 100 || elder.heartRate < 60 ? 50 : 80) * 0.2;
  const oxygenScore = (elder.bloodOxygen < 95 ? 50 : 80) * 0.2;
  return Math.round(activityScore + sleepScore + heartScore + oxygenScore);
}

export function getCareAdvice(score: number): string {
  if (score < 60) {
    return '健康状况较差，建议立即调整护理方案，增加巡视频次，必要时联系医生进行全面检查。';
  }
  if (score <= 80) {
    return '健康状况一般，建议按常规护理方案执行，关注老人饮食与睡眠，适度增加活动量。';
  }
  return '健康状况良好，请继续保持当前护理方案，鼓励老人参与社交活动，维持身心愉悦。';
}
