import { Html } from '@react-three/drei';
import type { Elder } from '../types';

interface HealthLabelProps {
  elder: Elder;
}

const careLevelLabels: Record<string, { text: string; color: string }> = {
  self: { text: '自理', color: '#5CB85C' },
  semi: { text: '半护理', color: '#F0AD4E' },
  full: { text: '全护理', color: '#FF4D4F' },
};

export default function HealthLabel({ elder }: HealthLabelProps) {
  const isHeartRateAbnormal = elder.heartRate < 60 || elder.heartRate > 100;
  const isOxygenAbnormal = elder.bloodOxygen < 95;

  return (
    <Html
      position={[0, 2.2, 0]}
      center
      distanceFactor={10}
      style={{
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.75)',
          border: '1px solid #00D4AA',
          borderRadius: '6px',
          padding: '6px 10px',
          minWidth: '140px',
          color: '#e0e6f0',
          fontSize: '12px',
          fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
          boxShadow: '0 0 10px rgba(0, 212, 170, 0.3)',
          animation: 'floatLabel 2s ease-in-out infinite',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <style>{`
          @keyframes floatLabel {
            0%, 100% { transform: translate(-50%, -50%) translateY(0); }
            50% { transform: translate(-50%, -50%) translateY(-4px); }
          }
        `}</style>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '4px',
          }}
        >
          <span style={{ fontWeight: 'bold', color: '#00D4AA' }}>
            {elder.name}
          </span>
          <span style={{ color: '#8C9BB3', fontSize: '11px' }}>
            {elder.age}岁
          </span>
        </div>
        <div
          style={{
            display: 'inline-block',
            padding: '1px 6px',
            borderRadius: '3px',
            fontSize: '10px',
            marginBottom: '4px',
            background: careLevelLabels[elder.careLevel].color + '33',
            color: careLevelLabels[elder.careLevel].color,
            border: `1px solid ${careLevelLabels[elder.careLevel].color}`,
          }}
        >
          {careLevelLabels[elder.careLevel].text}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '4px',
            fontSize: '11px',
          }}
        >
          <span style={{ color: isHeartRateAbnormal ? '#FF4D4F' : '#e0e6f0' }}>
            ❤️ {elder.heartRate}
          </span>
          <span style={{ color: isOxygenAbnormal ? '#FF4D4F' : '#e0e6f0' }}>
            💧 {elder.bloodOxygen}%
          </span>
        </div>
      </div>
    </Html>
  );
}
