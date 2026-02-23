import { type ReactNode } from 'react';
import { Layout, Button, Dropdown, Space, Typography } from 'antd';
import {
  UserOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { MenuProps } from 'antd';

const { Header, Content } = Layout;
const { Text } = Typography;

export function AppLayout(): ReactNode {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: user?.name || 'Profile',
      disabled: true,
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
    }
  };

  return (
    <Layout className="min-h-screen !bg-white">
      <Header className="flex items-center justify-between px-8 border-b border-[#eee] h-14 leading-[56px] !bg-white">
        <Text
          strong
          className="text-base cursor-pointer text-[#1a1a1a] tracking-tight"
          onClick={() => navigate('/events')}
        >
          EventPlanner
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
                  size="small"
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
                size="small"
                onClick={() => navigate('/login')}
                className="text-[#555]"
              >
                Log in
              </Button>
              <Button
                type="primary"
                size="small"
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
        <div className="max-w-[1200px] mx-auto px-8 py-6">
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
}
