import { type ReactNode, useState, useEffect } from 'react';
import { Layout, Button, Dropdown, Space, Typography } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { TwoFactorSettingsModal } from './TwoFactorSettingsModal';
import type { MenuProps } from 'antd';

const { Header, Content } = Layout;
const { Text } = Typography;

export function AppLayout(): ReactNode {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled ?? false);

  useEffect(() => {
    setTwoFactorEnabled(user?.twoFactorEnabled ?? false);
  }, [user?.twoFactorEnabled]);

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: user?.name || 'Profile',
      disabled: true,
    },
    {
      key: 'security',
      icon: <SafetyOutlined />,
      label: 'Security',
    },
    { type: 'divider' },
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
    }
  };

  return (
    <Layout className="min-h-screen !bg-white">
      <Header className="flex items-center justify-between px-8 border-b border-[#eee] !h-20 !leading-[64px] !bg-white">
          <Text
            strong
          className="!text-2xl cursor-pointer text-[#1a1a1a] tracking-tight"
          onClick={() => navigate('/events')}
          >
            Event<span className="text-blue-500">Planner</span>
          </Text>

        <Space size={8}>
          {isAuthenticated ? (
            <>
              <Dropdown
                menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
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
