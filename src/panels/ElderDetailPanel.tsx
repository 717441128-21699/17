import { useMemo } from 'react';
import { Button, Tag, Space, List, message } from 'antd';
import {
  CloseOutlined,
  PhoneOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  HeartOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { useAppStore } from '../store/useAppStore';
import { getCareAdvice } from '../utils/healthScore';
import type { Elder } from '../types';

interface ElderDetailPanelProps {
  elderId: string;
  onClose: () => void;
}

const careLevelText: Record<string, string> = {
  self: '自理',
  semi: '半护理',
  full: '全护理',
};

const careLevelColor: Record<string, string> = {
  self: 'green',
  semi: 'gold',
  full: 'red',
};

function getScoreColor(score: number): string {
  if (score < 60) return '#FF4D4F';
  if (score <= 80) return '#FAAD14';
  return '#00D4AA';
}

export default function ElderDetailPanel({ elderId, onClose }: ElderDetailPanelProps) {
  const elders = useAppStore((s) => s.elders);
  const rooms = useAppStore((s) => s.rooms);

  const elder = useMemo<Elder | undefined>(
    () => elders.find((e) => e.id === elderId),
    [elders, elderId]
  );

  const room = useMemo(
    () => rooms.find((r) => r.id === elder?.roomId),
    [rooms, elder]
  );

  const advice = useMemo(
    () => (elder ? getCareAdvice(elder.healthScore) : ''),
    [elder]
  );

  const heartRateOption = useMemo(() => {
    if (!elder) return {};
    const hours = elder.vitalHistory.map((_, i) => `${String(i).padStart(2, '0')}:00`);
    const values = elder.vitalHistory.map((v) => v.heartRate);
    return {
      backgroundColor: 'transparent',
      grid: { left: 40, right: 20, top: 30, bottom: 30 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15, 30, 54, 0.9)',
        borderColor: 'rgba(0, 212, 170, 0.3)',
        textStyle: { color: '#e0e6f0' },
      },
      xAxis: {
        type: 'category',
        data: hours,
        axisLine: { lineStyle: { color: 'rgba(0, 212, 170, 0.3)' } },
        axisLabel: { color: '#8C9BB3', fontSize: 10 },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        min: 40,
        max: 160,
        axisLine: { show: false },
        axisLabel: { color: '#8C9BB3', fontSize: 10 },
        splitLine: { lineStyle: { color: 'rgba(0, 212, 170, 0.1)' } },
      },
      series: [
        {
          type: 'line',
          data: values,
          smooth: true,
          symbol: 'none',
          lineStyle: { color: '#FF4D4F', width: 2 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(255, 77, 79, 0.3)' },
                { offset: 1, color: 'rgba(255, 77, 79, 0)' },
              ],
            },
          },
        },
      ],
    };
  }, [elder]);

  const bloodOxygenOption = useMemo(() => {
    if (!elder) return {};
    const hours = elder.vitalHistory.map((_, i) => `${String(i).padStart(2, '0')}:00`);
    const values = elder.vitalHistory.map((v) => v.bloodOxygen);
    return {
      backgroundColor: 'transparent',
      grid: { left: 40, right: 20, top: 30, bottom: 30 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15, 30, 54, 0.9)',
        borderColor: 'rgba(0, 212, 170, 0.3)',
        textStyle: { color: '#e0e6f0' },
      },
      xAxis: {
        type: 'category',
        data: hours,
        axisLine: { lineStyle: { color: 'rgba(0, 212, 170, 0.3)' } },
        axisLabel: { color: '#8C9BB3', fontSize: 10 },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        min: 85,
        max: 100,
        axisLine: { show: false },
        axisLabel: { color: '#8C9BB3', fontSize: 10 },
        splitLine: { lineStyle: { color: 'rgba(0, 212, 170, 0.1)' } },
      },
      series: [
        {
          type: 'line',
          data: values,
          smooth: true,
          symbol: 'none',
          lineStyle: { color: '#1890FF', width: 2 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
                { offset: 1, color: 'rgba(24, 144, 255, 0)' },
              ],
            },
          },
        },
      ],
    };
  }, [elder]);

  const scoreGaugeOption = useMemo(() => {
    if (!elder) return {};
    const color = getScoreColor(elder.healthScore);
    return {
      backgroundColor: 'transparent',
      series: [
        {
          type: 'gauge',
          startAngle: 220,
          endAngle: -40,
          min: 0,
          max: 100,
          radius: '90%',
          progress: {
            show: true,
            width: 14,
            itemStyle: { color },
          },
          axisLine: {
            lineStyle: {
              width: 14,
              color: [[1, 'rgba(0, 212, 170, 0.1)']],
            },
          },
          pointer: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          anchor: { show: false },
          title: { show: false },
          detail: {
            valueAnimation: true,
            formatter: '{value}',
            color,
            fontSize: 48,
            fontWeight: 700,
            offsetCenter: [0, '0%'],
          },
          data: [{ value: elder.healthScore }],
        },
      ],
    };
  }, [elder]);

  if (!elder) {
    return (
      <div className="glass-panel glow-border p-6 w-[480px] animate-[fadeIn_0.3s_ease-out]">
        <p className="text-[#8C9BB3]">未找到老人信息</p>
      </div>
    );
  }

  return (
    <div className="glass-panel glow-border w-[520px] max-h-[90vh] overflow-y-auto animate-[slideInRight_0.3s_ease-out]">
      <div className="sticky top-0 z-10 bg-[rgba(15,30,54,0.9)] backdrop-blur-md border-b border-[rgba(0,212,170,0.2)] p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00D4AA]/30 to-[#00D4AA]/10 border border-[#00D4AA]/40 flex items-center justify-center text-2xl">
            {elder.gender === 'female' ? '👵' : '👴'}
          </div>
          <div>
            <div className="text-lg font-semibold text-white">{elder.name}</div>
            <div className="flex items-center gap-2 text-sm text-[#8C9BB3]">
              <span>{elder.age}岁</span>
              <span>·</span>
              <span>{elder.gender === 'female' ? '女' : '男'}</span>
              <span>·</span>
              <span>{room?.name || '未知房间'}</span>
            </div>
          </div>
        </div>
        <Space>
          <Tag color={careLevelColor[elder.careLevel]} style={{ margin: 0 }}>
            {careLevelText[elder.careLevel]}
          </Tag>
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={onClose}
            style={{ color: '#8C9BB3' }}
          />
        </Space>
      </div>

      <div className="p-5 space-y-5">
        <div className="flex items-center gap-6">
          <div className="w-40 h-40 flex-shrink-0">
            <ReactECharts option={scoreGaugeOption} style={{ width: '100%', height: '100%' }} />
          </div>
          <div className="flex-1">
            <div className="text-sm text-[#8C9BB3] mb-2">健康评分</div>
            <div
              className="text-3xl font-bold mb-3"
              style={{ color: getScoreColor(elder.healthScore) }}
            >
              {elder.healthScore} 分
            </div>
            <div className="text-sm text-[#8C9BB3] leading-relaxed">{advice}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[rgba(255,77,79,0.08)] border border-[rgba(255,77,79,0.2)] rounded-lg p-3">
            <div className="flex items-center gap-2 text-[#FF4D4F] text-sm mb-1">
              <HeartOutlined /> 心率
            </div>
            <div className="text-2xl font-bold text-white">
              {elder.heartRate}
              <span className="text-sm font-normal text-[#8C9BB3] ml-1">次/分</span>
            </div>
          </div>
          <div className="bg-[rgba(24,144,255,0.08)] border border-[rgba(24,144,255,0.2)] rounded-lg p-3">
            <div className="flex items-center gap-2 text-[#1890FF] text-sm mb-1">
              🩸 血氧
            </div>
            <div className="text-2xl font-bold text-white">
              {elder.bloodOxygen}
              <span className="text-sm font-normal text-[#8C9BB3] ml-1">%</span>
            </div>
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-white mb-2 flex items-center gap-2">
            <HeartOutlined style={{ color: '#FF4D4F' }} />
            24小时心率趋势
          </div>
          <div className="h-48">
            <ReactECharts option={heartRateOption} style={{ width: '100%', height: '100%' }} />
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-white mb-2 flex items-center gap-2">
            🩸 24小时血氧趋势
          </div>
          <div className="h-48">
            <ReactECharts option={bloodOxygenOption} style={{ width: '100%', height: '100%' }} />
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-white mb-3">💊 今日用药记录</div>
          <List
            dataSource={elder.medications}
            renderItem={(med) => (
              <List.Item
                className="!px-0 !py-2 border-b !border-[rgba(0,212,170,0.1)] last:border-0"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    {med.taken ? (
                      <CheckCircleOutlined style={{ color: '#00D4AA', fontSize: 18 }} />
                    ) : (
                      <ClockCircleOutlined style={{ color: '#FAAD14', fontSize: 18 }} />
                    )}
                    <div>
                      <div className="text-white text-sm font-medium">{med.medicineName}</div>
                      <div className="text-[#8C9BB3] text-xs">
                        {med.dosage} · {med.time}
                      </div>
                    </div>
                  </div>
                  <Tag color={med.taken ? 'green' : 'warning'}>
                    {med.taken ? '已服用' : '待服用'}
                  </Tag>
                </div>
              </List.Item>
            )}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="primary"
            icon={<PhoneOutlined />}
            onClick={() => message.success('已呼叫护工前往')}
            className="flex-1 tech-btn-primary"
            style={{ height: 40 }}
          >
            呼叫护工
          </Button>
          <Button
            icon={<HistoryOutlined />}
            onClick={() => message.info('查看历史记录功能开发中')}
            className="flex-1 tech-btn"
            style={{ height: 40 }}
          >
            查看历史
          </Button>
          <Button
            onClick={onClose}
            className="flex-1"
            style={{
              height: 40,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#8C9BB3',
            }}
          >
            关闭
          </Button>
        </div>
      </div>
    </div>
  );
}
