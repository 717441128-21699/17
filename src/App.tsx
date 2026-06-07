import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import { useAppStore } from './store/useAppStore';

function App() {
  const { currentUser } = useAppStore();
  const location = useLocation();

  const isLoginPage = location.pathname === '/login';

  if (!currentUser && !isLoginPage) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser && isLoginPage) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#00D4AA',
          colorInfo: '#00D4AA',
          colorSuccess: '#00D4AA',
          colorWarning: '#FAAD14',
          colorError: '#FF4D4F',
          colorBgBase: '#0A1628',
          colorBgContainer: '#0F1E36',
          colorBgElevated: '#15294B',
          colorBorder: 'rgba(0, 212, 170, 0.2)',
          colorBorderSecondary: 'rgba(0, 212, 170, 0.1)',
          colorText: '#e0e6f0',
          colorTextSecondary: '#8C9BB3',
          colorTextTertiary: '#5C6B85',
          borderRadius: 6,
          fontSize: 14,
        },
        components: {
          Button: {
            colorPrimary: '#00D4AA',
            algorithm: true,
          },
          Input: {
            colorBorder: 'rgba(0, 212, 170, 0.3)',
            colorPrimaryHover: '#00D4AA',
            algorithm: true,
          },
          Card: {
            colorBorderSecondary: 'rgba(0, 212, 170, 0.15)',
            colorBgContainer: 'rgba(15, 30, 54, 0.75)',
            algorithm: true,
          },
          Table: {
            colorBgContainer: 'transparent',
            colorBorderSecondary: 'rgba(0, 212, 170, 0.1)',
            algorithm: true,
          },
          Modal: {
            colorBgElevated: '#0F1E36',
            colorBorder: 'rgba(0, 212, 170, 0.2)',
            algorithm: true,
          },
        },
      }}
    >
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </ConfigProvider>
  );
}

export default App;
