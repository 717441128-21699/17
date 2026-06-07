import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import dayjs from 'dayjs';
import Scene from '../three/Scene';
import ElderDetailPanel from '../panels/ElderDetailPanel';
import AlarmPanel from '../panels/AlarmPanel';
import SchedulePanel from '../panels/SchedulePanel';
import PharmacyPanel from '../panels/PharmacyPanel';
import VisitorPanel from '../panels/VisitorPanel';
import ReportPanel from '../panels/ReportPanel';
import {
  UserOutlined,
  BellOutlined,
  ScheduleOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
  BarChartOutlined,
  LogoutOutlined,
  HomeOutlined,
  HeartOutlined,
  WarningOutlined,
  SmileOutlined,
  UsergroupAddOutlined,
  AlertOutlined,
} from '@ant-design/icons';
import type { ActivePanel } from '../types';

const navItems: Array<{
  key: ActivePanel;
  label: string;
  icon: JSX.Element;
}> = [
  { key: 'elder', label: '老人管理', icon: <UserOutlined /> },
  { key: 'alarms', label: '告警中心', icon: <BellOutlined /> },
  { key: 'schedule', label: '排班管理', icon: <ScheduleOutlined /> },
  { key: 'pharmacy', label: '药品管理', icon: <MedicineBoxOutlined /> },
  { key: 'visitors', label: '访客管理', icon: <TeamOutlined /> },
  { key: 'reports', label: '运营报表', icon: <BarChartOutlined /> },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const {
    currentUser,
    activePanel,
    selectedElderId,
    evacuationMode,
    elders,
    alarms,
    schedules,
    rooms,
    patrolRobots,
    logout,
    setActivePanel,
    selectElder,
    toggleEvacuationMode,
    updateElderVital,
    updateRobotPosition,
    triggerAlarm,
  } = useAppStore();

  const [currentTime, setCurrentTime] = useState(dayjs());

  const stats = useMemo(() => {
    const totalCapacity = rooms.reduce((s, r) => s + r.capacity, 0);
    const totalOccupancy = rooms.reduce((s, r) => s + r.occupancy, 0);
    const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;
    const inHouseCount = elders.length;
    const todayAlarms = alarms.filter((a) => dayjs(a.timestamp).isSame(dayjs(), 'day')).length;
    const avgHealthScore =
      elders.length > 0 ? Math.round(elders.reduce((s, e) => s + e.healthScore, 0) / elders.length) : 0;
    const today = dayjs().format('YYYY-MM-DD');
    const onDutyCount = schedules.filter((s) => s.date === today).length;
    return { occupancyRate, inHouseCount, todayAlarms, avgHealthScore, onDutyCount };
  }, [elders, alarms, schedules, rooms]);

  const statCards = [
    { label: '入住率', value: `${stats.occupancyRate}%`, icon: <HomeOutlined />, color: 'text-medical-cyan' },
    { label: '在院人数', value: stats.inHouseCount, icon: <UsergroupAddOutlined />, color: 'text-path-blue' },
    { label: '今日告警', value: stats.todayAlarms, icon: <WarningOutlined />, color: 'text-alert-red' },
    { label: '健康评分均值', value: stats.avgHealthScore, icon: <SmileOutlined />, color: 'text-data-green' },
    { label: '在班护工数', value: stats.onDutyCount, icon: <HeartOutlined />, color: 'text-info-purple' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomElders = [...elders].sort(() => Math.random() - 0.5).slice(0, 3);
      randomElders.forEach((elder) => {
        let heartRate = 60 + Math.floor(Math.random() * 50);
        let bloodOxygen = 90 + Math.floor(Math.random() * 10);

        if (Math.random() < 0.15) {
          heartRate = 101 + Math.floor(Math.random() * 30);
        } else if (Math.random() < 0.1) {
          bloodOxygen = 85 + Math.floor(Math.random() * 5);
        }

        updateElderVital(elder.id, heartRate, bloodOxygen);

        const isHeartAbnormal = heartRate > 100 || heartRate < 55;
        const isOxygenLow = bloodOxygen < 90;

        if (isHeartAbnormal || isOxygenLow) {
          triggerAlarm({
            id: `alarm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            type: isHeartAbnormal ? 'heart_rate' : 'fall',
            level: isHeartAbnormal && heartRate > 120 ? 'critical' : 'high',
            elderId: elder.id,
            roomId: elder.roomId,
            timestamp: Date.now(),
            status: 'pending',
            message: isHeartAbnormal
              ? `${elder.name} 心率异常，当前心率 ${heartRate} 次/分`
              : `${elder.name} 血氧偏低，当前血氧 ${bloodOxygen}%`,
          });
        }
      });

      patrolRobots.forEach((robot) => {
        if (robot.status === 'patrolling') {
          updateRobotPosition(robot.id, {
            x: Math.max(0, Math.min(46, robot.position.x + (Math.random() - 0.5) * 0.8)),
            y: robot.position.y,
            z: Math.max(0, Math.min(47, robot.position.z + (Math.random() - 0.5) * 0.8)),
          });
        }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [elders, patrolRobots, updateElderVital, updateRobotPosition, triggerAlarm]);

  const handleNavClick = (key: ActivePanel) => {
    if (activePanel === key) {
      setActivePanel('none');
      if (key === 'elder') {
        selectElder(null);
      }
    } else {
      if (key === 'elder' && !selectedElderId && elders.length > 0) {
        selectElder(elders[0].id);
      }
      setActivePanel(key);
    }
  };

  const renderActivePanel = () => {
    switch (activePanel) {
      case 'elder':
        return selectedElderId ? (
          <ElderDetailPanel elderId={selectedElderId} onClose={() => { setActivePanel('none'); selectElder(null); }} />
        ) : null;
      case 'alarms':
        return <AlarmPanel />;
      case 'schedule':
        return <SchedulePanel />;
      case 'pharmacy':
        return <PharmacyPanel />;
      case 'visitors':
        return <VisitorPanel />;
      case 'reports':
        return <ReportPanel />;
      default:
        return null;
    }
  };

  const activePanelContent = renderActivePanel();

  return (
    <div className="relative w-full h-full overflow-hidden bg-bg-primary flex flex-col">
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0, 212, 170, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 170, 0.08) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <header className="relative z-10 glass-panel mx-4 mt-4 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-medical-cyan to-path-blue flex items-center justify-center">
            <HomeOutlined className="text-xl text-bg-primary" />
          </div>
          <div>
            <h1 className="font-tech text-xl font-bold tracking-wider text-medical-cyan">3D智慧养老院</h1>
            <p className="text-xs text-gray-400">综合运营与应急调度平台</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {statCards.map((card, idx) => (
            <div key={idx} className="glass-panel px-4 py-2 flex items-center gap-3 min-w-[140px]">
              <div className={`text-xl ${card.color}`}>{card.icon}</div>
              <div>
                <div className="dashboard-number-sm leading-none">{card.value}</div>
                <div className="text-xs text-gray-400 mt-1">{card.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-medical-cyan/30 to-path-blue/30 flex items-center justify-center text-lg">
              {currentUser?.avatar}
            </div>
            <div>
              <div className="text-white text-sm font-medium">{currentUser?.name}</div>
              <div className="text-xs text-gray-400">
                {currentUser?.role === 'director'
                  ? '院长'
                  : currentUser?.role === 'head_nurse'
                    ? '护士长'
                    : '护工'}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="tech-btn flex items-center gap-2"
          >
            <LogoutOutlined />
            <span>退出</span>
          </button>
        </div>
      </header>

      <div className="relative z-10 flex-1 flex gap-4 p-4 overflow-hidden">
        <aside className="glass-panel p-3 flex flex-col gap-2 w-20 flex-shrink-0">
          {navItems.map((item) => {
            const isActive = activePanel === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.key)}
                className={`relative flex flex-col items-center justify-center gap-1 py-4 px-2 rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-br from-medical-cyan/25 to-medical-cyan/5 text-medical-cyan border border-medical-cyan/50 shadow-[0_0_15px_rgba(0,212,170,0.25)]'
                    : 'text-gray-400 hover:text-medical-cyan hover:bg-medical-cyan/5 border border-transparent'
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-medical-cyan rounded-r" />
                )}
              </button>
            );
          })}
        </aside>

        <main className="flex-1 relative rounded-xl overflow-hidden border border-medical-cyan/10 bg-[#050a14]">
          <Scene />
        </main>

        <aside
          className={`transition-all duration-500 overflow-hidden flex-shrink-0 ${
            activePanelContent ? 'opacity-100' : 'w-0 opacity-0'
          }`}
        >
          {activePanelContent}
        </aside>
      </div>

      <div className="relative z-10 flex items-center justify-between px-4 pb-4">
        <button
          onClick={toggleEvacuationMode}
          className={`relative px-8 py-4 rounded-xl font-bold text-lg tracking-wider transition-all duration-300 overflow-hidden ${
            evacuationMode
              ? 'bg-gradient-to-r from-alert-red to-warning-orange text-white shadow-[0_0_30px_rgba(255,71,87,0.6)] alert-blink'
              : 'bg-gradient-to-r from-alert-red/80 to-alert-red text-white hover:shadow-[0_0_25px_rgba(255,71,87,0.5)] hover:scale-105'
          }`}
        >
          <span className="flex items-center gap-3">
            <AlertOutlined className="text-2xl" />
            {evacuationMode ? '疏散模式已启动 - 点击取消' : '一键疏散'}
          </span>
        </button>

        <div className="glass-panel px-6 py-3 flex items-center gap-4">
          <div className="text-right">
            <div className="font-tech text-2xl text-medical-cyan tracking-wider leading-none">
              {currentTime.format('HH:mm:ss')}
            </div>
            <div className="text-xs text-gray-400 mt-1">{currentTime.format('YYYY年MM月DD日 dddd')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
