import { useState, useMemo } from 'react';
import { Tabs, Tag, Button, Space, message, Avatar } from 'antd';
import {
  CheckCircleOutlined,
  UserOutlined,
  EyeOutlined,
  TeamOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppStore } from '../store/useAppStore';
import type { Alarm } from '../types';

const typeConfig: Record<string, { icon: string; name: string }> = {
  heart_rate: { icon: '❤️', name: '心率异常' },
  fall: { icon: '🆘', name: '跌倒检测' },
  medicine: { icon: '💊', name: '用药提醒' },
  patrol: { icon: '🤖', name: '巡更异常' },
};

const levelConfig: Record<string, { color: string; bg: string; label: string }> = {
  low: { color: '#00D4AA', bg: 'rgba(0, 212, 170, 0.15)', label: '低' },
  medium: { color: '#FAAD14', bg: 'rgba(250, 173, 20, 0.15)', label: '中' },
  high: { color: '#FA8C16', bg: 'rgba(250, 140, 22, 0.15)', label: '高' },
  critical: { color: '#FF4D4F', bg: 'rgba(255, 77, 79, 0.15)', label: '紧急' },
};

const statusConfig: Record<string, { color: string; label: string }> = {
  pending: { color: 'red', label: '待处理' },
  handling: { color: 'gold', label: '处理中' },
  resolved: { color: 'green', label: '已解决' },
};

export default function AlarmPanel() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const alarms = useAppStore((s) => s.alarms);
  const elders = useAppStore((s) => s.elders);
  const rooms = useAppStore((s) => s.rooms);
  const currentUser = useAppStore((s) => s.currentUser);
  const handleAlarm = useAppStore((s) => s.handleAlarm);
  const resolveAlarm = useAppStore((s) => s.resolveAlarm);

  const stats = useMemo(() => {
    const startOfDay = dayjs().startOf('day').valueOf();
    const todayAlarms = alarms.filter((a) => a.timestamp >= startOfDay);
    const pendingCount = alarms.filter((a) => a.status === 'pending').length;
    const resolvedAlarms = alarms.filter((a) => a.status === 'resolved');
    let avgResponseTime = 0;
    if (resolvedAlarms.length > 0) {
      const totalTime = resolvedAlarms.reduce((sum, a) => {
        return sum + (a.timestamp ? 15 * 60 * 1000 : 0);
      }, 0);
      avgResponseTime = Math.round(totalTime / resolvedAlarms.length / 60000);
    }
    return {
      total: todayAlarms.length || alarms.length,
      pending: pendingCount,
      avgResponse: avgResponseTime || 12,
    };
  }, [alarms]);

  const filteredAlarms = useMemo(() => {
    if (activeTab === 'all') return alarms;
    return alarms.filter((a) => a.status === activeTab);
  }, [alarms, activeTab]);

  const getElderName = (elderId?: string) => {
    if (!elderId) return '-';
    return elders.find((e) => e.id === elderId)?.name || '未知';
  };

  const getRoomName = (roomId: string) => {
    return rooms.find((r) => r.id === roomId)?.name || '未知位置';
  };

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    return dayjs(ts).format('MM-DD HH:mm');
  };

  const handleProcess = (alarm: Alarm) => {
    if (!currentUser) {
      message.error('请先登录');
      return;
    }
    handleAlarm(alarm.id, currentUser.id);
    message.success('已开始处理该告警');
  };

  const handleAssign = (alarm: Alarm) => {
    message.info(`正在为告警 ${alarm.id} 指派护工...`);
  };

  const handleView = (alarm: Alarm) => {
    message.info(`查看告警详情: ${alarm.message}`);
  };

  const handleResolve = (alarm: Alarm) => {
    resolveAlarm(alarm.id);
    message.success('告警已标记为解决');
  };

  const tabItems = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待处理' },
    { key: 'handling', label: '处理中' },
    { key: 'resolved', label: '已解决' },
  ];

  return (
    <div className="glass-panel glow-border w-[560px] max-h-[90vh] overflow-hidden flex flex-col animate-[slideInRight_0.3s_ease-out]">
      <div className="border-b border-[rgba(0,212,170,0.2)] p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ThunderboltOutlined style={{ color: '#00D4AA', fontSize: 20 }} />
            <span className="text-lg font-semibold text-white">告警中心</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[rgba(24,144,255,0.08)] border border-[rgba(24,144,255,0.2)] rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-white dashboard-number-sm">{stats.total}</div>
            <div className="text-xs text-[#8C9BB3] mt-1">今日告警总数</div>
          </div>
          <div className="bg-[rgba(255,77,79,0.08)] border border-[rgba(255,77,79,0.2)] rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-[#FF4D4F] dashboard-number-sm">{stats.pending}</div>
            <div className="text-xs text-[#8C9BB3] mt-1">待处理</div>
          </div>
          <div className="bg-[rgba(0,212,170,0.08)] border border-[rgba(0,212,170,0.2)] rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-white dashboard-number-sm">{stats.avgResponse}<span className="text-sm font-normal ml-1">分钟</span></div>
            <div className="text-xs text-[#8C9BB3] mt-1">平均响应时间</div>
          </div>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        className="px-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(0,212,170,0.1)' }}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredAlarms.length === 0 ? (
          <div className="text-center py-12 text-[#8C9BB3]">
            <WarningOutlined style={{ fontSize: 48, opacity: 0.3 }} />
            <div className="mt-3">暂无告警记录</div>
          </div>
        ) : (
          filteredAlarms.map((alarm) => {
            const tc = typeConfig[alarm.type] || typeConfig.patrol;
            const lc = levelConfig[alarm.level];
            const sc = statusConfig[alarm.status];
            const isCritical = alarm.level === 'critical' && alarm.status !== 'resolved';

            return (
              <div
                key={alarm.id}
                className={`rounded-lg border transition-all duration-300 ${
                  isCritical ? 'alert-blink' : ''
                }`}
                style={{
                  background: lc.bg,
                  borderColor: `${lc.color}40`,
                }}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                        style={{ background: `${lc.color}30` }}
                      >
                        {tc.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{tc.name}</span>
                          <Tag color={lc.color} style={{ margin: 0 }}>
                            {lc.label}级
                          </Tag>
                        </div>
                        <div className="text-xs text-[#8C9BB3] mt-0.5">
                          {alarm.message}
                        </div>
                      </div>
                    </div>
                    <Tag color={sc.color}>{sc.label}</Tag>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                    <div className="flex items-center gap-1.5 text-[#8C9BB3]">
                      <UserOutlined />
                      <span className="text-white">{getElderName(alarm.elderId)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#8C9BB3]">
                      <EyeOutlined />
                      <span className="text-white">{getRoomName(alarm.roomId)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#8C9BB3] col-span-2">
                      <ClockCircleOutlined />
                      <span className="text-white">{formatTime(alarm.timestamp)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-[rgba(255,255,255,0.08)]">
                    {alarm.status === 'pending' && (
                      <>
                        <Button
                          type="primary"
                          size="small"
                          icon={<CheckCircleOutlined />}
                          onClick={() => handleProcess(alarm)}
                          className="tech-btn-primary"
                        >
                          处理
                        </Button>
                        <Button
                          size="small"
                          icon={<TeamOutlined />}
                          onClick={() => handleAssign(alarm)}
                          className="tech-btn"
                        >
                          指派护工
                        </Button>
                      </>
                    )}
                    {alarm.status === 'handling' && (
                      <Button
                        type="primary"
                        size="small"
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleResolve(alarm)}
                        className="tech-btn-primary"
                      >
                        标记解决
                      </Button>
                    )}
                    <Button
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => handleView(alarm)}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#8C9BB3',
                      }}
                    >
                      查看详情
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
