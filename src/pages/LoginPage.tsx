import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { users } from '../data/mockData';
import { UserOutlined, SafetyOutlined, CrownOutlined, ScanOutlined, CheckCircleOutlined } from '@ant-design/icons';

const roleLabels: Record<string, { label: string; icon: JSX.Element; color: string }> = {
  caregiver: { label: '护工', icon: <UserOutlined />, color: 'from-blue-500/30 to-blue-600/10' },
  head_nurse: { label: '护士长', icon: <SafetyOutlined />, color: 'from-medical-cyan/30 to-medical-cyan/10' },
  director: { label: '院长', icon: <CrownOutlined />, color: 'from-info-purple/30 to-info-purple/10' },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAppStore();
  const [scanProgress, setScanProgress] = useState(0);
  const [status, setStatus] = useState<'scanning' | 'success'>('scanning');
  const [statusText, setStatusText] = useState('正在识别...');

  useEffect(() => {
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 2;
      });
    }, 40);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus('success');
      setStatusText('识别成功');
      const director = users.find((u) => u.role === 'director') || users[0];
      setTimeout(() => {
        login(director);
        navigate('/dashboard');
      }, 600);
    }, 2000);
    return () => clearTimeout(timer);
  }, [login, navigate]);

  const handleRoleLogin = (role: 'caregiver' | 'head_nurse' | 'director') => {
    const user = users.find((u) => u.role === role);
    if (user) {
      login(user);
      navigate('/dashboard');
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-bg-primary">
      <div className="absolute inset-0 bg-gradient-to-br from-bg-primary via-[#0c1a30] to-[#0a1525]" />

      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0, 212, 170, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 170, 0.15) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-medical-cyan/10 blur-[120px] rounded-full -translate-x-1/4 -translate-y-1/4" />
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-path-blue/10 blur-[120px] rounded-full translate-x-1/4 translate-y-1/4" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-8">
        <div className="mb-12 text-center">
          <h1
            className="font-tech text-4xl md:text-5xl font-bold tracking-wider mb-3"
            style={{
              background: 'linear-gradient(135deg, #00D4AA 0%, #00F5CC 50%, #1E90FF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            3D智慧养老院综合运营与应急调度平台
          </h1>
          <p className="text-gray-400 text-lg tracking-wide">Smart Nursing Home Integrated Operations Platform</p>
        </div>

        <div className="flex items-center gap-16">
          <div className="flex flex-col items-center">
            <div className="relative w-72 h-72">
              <div className="absolute inset-0 rounded-full border-4 border-medical-cyan/30" />
              <div className="absolute inset-2 rounded-full border border-medical-cyan/50" />
              <div className="absolute inset-4 rounded-full bg-bg-secondary/50 backdrop-blur-md border border-medical-cyan/20 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-medical-cyan/80">
                    <svg viewBox="0 0 100 100" className="w-36 h-36">
                      <circle cx="50" cy="35" r="18" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
                      <path
                        d="M20 90 Q20 60 50 60 Q80 60 80 90"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        opacity="0.6"
                      />
                      <circle cx="43" cy="33" r="2" fill="currentColor" opacity="0.4" />
                      <circle cx="57" cy="33" r="2" fill="currentColor" opacity="0.4" />
                      <path d="M45 42 Q50 45 55 42" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
                    </svg>
                  </div>
                </div>

                {status === 'scanning' && (
                  <>
                    <div
                      className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-medical-cyan to-transparent shadow-[0_0_10px_rgba(0,212,170,0.8)]"
                      style={{ top: `${scanProgress}%` }}
                    />
                    <div
                      className="absolute left-0 right-0 h-16 bg-gradient-to-b from-medical-cyan/20 via-medical-cyan/5 to-transparent"
                      style={{ top: `calc(${scanProgress}% - 32px)` }}
                    />
                  </>
                )}

                {status === 'success' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-data-green/10">
                    <CheckCircleOutlined className="text-6xl text-data-green animate-pulse" />
                  </div>
                )}
              </div>

              {status === 'scanning' && (
                <div className="absolute inset-0 rounded-full border-2 border-medical-cyan/60 animate-ping opacity-30" />
              )}

              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-medical-cyan" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-medical-cyan" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-medical-cyan" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-medical-cyan" />
            </div>

            <div className="mt-8 flex items-center gap-3">
              <ScanOutlined
                className={`text-2xl ${status === 'scanning' ? 'text-medical-cyan animate-pulse' : 'text-data-green'}`}
              />
              <span
                className={`text-xl font-medium tracking-wider ${
                  status === 'scanning' ? 'text-medical-cyan' : 'text-data-green'
                }`}
              >
                {statusText}
              </span>
            </div>

            <p className="mt-2 text-gray-500 text-sm">请正视摄像头，保持面部在识别区域内</p>
          </div>

          <div className="h-80 w-px bg-gradient-to-b from-transparent via-medical-cyan/30 to-transparent" />

          <div className="flex flex-col gap-5">
            <p className="text-gray-400 text-sm text-center mb-1">快速登录（选择角色）</p>
            {(['caregiver', 'head_nurse', 'director'] as const).map((role) => {
              const info = roleLabels[role];
              return (
                <button
                  key={role}
                  onClick={() => handleRoleLogin(role)}
                  className={`glass-panel glow-border group cursor-pointer w-56 px-6 py-4 flex items-center gap-4 hover:scale-105 hover:border-medical-cyan/60 transition-all duration-300`}
                >
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${info.color} flex items-center justify-center text-2xl text-medical-cyan group-hover:scale-110 transition-transform`}
                  >
                    {info.icon}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-white text-lg font-medium">{info.label}</span>
                    <span className="text-gray-400 text-xs">点击直接登录</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="absolute bottom-6 text-gray-600 text-xs">
          © 2024 Smart Nursing Home Platform · All Rights Reserved
        </div>
      </div>
    </div>
  );
}
