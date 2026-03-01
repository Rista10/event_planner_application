import { type ReactNode, useState, useEffect } from 'react';
import { Layout, Button, Dropdown, Space, Typography } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  SafetyOutlined,
  UnorderedListOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { TwoFactorSettingsModal } from './TwoFactorSettingsModal';
import type { MenuProps } from 'antd';

const { Header, Content } = Layout;
const { Text } = Typography;

export function AppLayout(): ReactNode {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled ?? false);

  useEffect(() => {
    setTwoFactorEnabled(user?.twoFactorEnabled ?? false);
  }, [user?.twoFactorEnabled]);

  const getActiveTab = () => {
    if (location.pathname.startsWith('/calendar')) return 'calendar';
    return 'events';
  };

  const activeTab = getActiveTab();

  // Desktop menu - without navigation items
  const desktopMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: user?.name || 'Profile',
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'security',
      icon: <SafetyOutlined />,
      label: 'Security',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
    },
  ];

  // Mobile menu - with navigation items
  const mobileMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: user?.name || 'Profile',
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'events',
      icon: <UnorderedListOutlined />,
      label: 'Events',
    },
    {
      key: 'calendar',
      icon: <CalendarOutlined />,
      label: 'Calendar',
    },
    { type: 'divider' },
    {
      key: 'security',
      icon: <SafetyOutlined />,
      label: 'Security',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
    },
  ];

  const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      logout().then(() => navigate('/login'));
    } else if (key === 'security') {
      setSecurityModalOpen(true);
    } else if (key === 'events') {
      navigate('/events');
    } else if (key === 'calendar') {
      navigate('/calendar');
    }
  };

  return (
    <Layout className="min-h-screen !bg-white">
      <Header className="flex items-center justify-between px-4 sm:px-8 border-b border-[#eee] !h-16 sm:!h-20 !leading-[64px] !bg-white">
        <Text
          strong
          className="!text-lg sm:!text-2xl cursor-pointer text-[#1a1a1a] tracking-tight"
          onClick={() => navigate('/events')}
        >
          Event<span className="text-blue-500">Planner</span>
        </Text>

        {/* Desktop Navigation Tabs - hidden on mobile */}
        {isAuthenticated && (
          <div className="hidden sm:flex gap-6 absolute left-1/2 -translate-x-1/2">
            <div
              onClick={() => navigate('/events')}
              className={`flex items-center gap-2 cursor-pointer py-2 transition-colors ${
                activeTab === 'events'
                  ? 'text-blue-500'
                  : 'border-transparent text-[#555] hover:text-blue-500'
              }`}
            >
              <UnorderedListOutlined />
              <span>Events</span>
            </div>
            <div
              onClick={() => navigate('/calendar')}
              className={`flex items-center gap-2 cursor-pointer py-2 transition-colors ${
                activeTab === 'calendar'
                  ? 'text-blue-500'
                  : 'border-transparent text-[#555] hover:text-blue-500'
              }`}
            >
              <CalendarOutlined />
              <span>Calendar</span>
            </div>
          </div>
        )}

        <Space size={8}>
          {isAuthenticated ? (
            <>
              {/* Desktop dropdown - without nav items */}
              <div className="hidden sm:block">
                <Dropdown
                  menu={{ items: desktopMenuItems, onClick: handleUserMenuClick }}
                  placement="bottomRight"
                >
                  <Button
                    type="text"
                    size="large"
                    icon={<UserOutlined />}
                    className="text-[#555]"
                  >
                    {user?.name}
                  </Button>
                </Dropdown>
              </div>
              {/* Mobile dropdown - with nav items */}
              <div className="sm:hidden">
                <Dropdown
                  menu={{ items: mobileMenuItems, onClick: handleUserMenuClick }}
                  placement="bottomRight"
                >
                  <Button
                    type="text"
                    size="large"
                    icon={<UserOutlined />}
                    className="text-[#555]"
                  >
                    {user?.name}
                  </Button>
                </Dropdown>
              </div>
            </>
          ) : (
            <>
              <Button
                type="text"
                size="large"
                onClick={() => navigate('/login')}
                className="text-[#555]"
              >
                Log in
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={() => navigate('/signup')}
                className="rounded-md"
              >
                Sign up
              </Button>
            </>
          )}
        </Space>
      </Header>

      <Content className="flex-1 bg-white">
        <div className="max-w-[1400px] mx-auto px-8 py-6">
          <Outlet />
        </div>
      </Content>

      <TwoFactorSettingsModal
        open={securityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
        is2FAEnabled={twoFactorEnabled}
        onToggle={setTwoFactorEnabled}
      />
    </Layout>
  );
}
