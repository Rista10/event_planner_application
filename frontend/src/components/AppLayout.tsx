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
    <Layout style={{ minHeight: '100vh', background: '#fafafa' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          background: '#fff',
          borderBottom: '1px solid #eee',
          height: 56,
          lineHeight: '56px',
        }}
      >
        <Text
          strong
          style={{
            fontSize: 16,
            cursor: 'pointer',
            color: '#1a1a1a',
            letterSpacing: '-0.3px',
          }}
          onClick={() => navigate('/')}
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
                  style={{ color: '#555' }}
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
                style={{ color: '#555' }}
              >
                Log in
              </Button>
              <Button
                type="primary"
                size="small"
                onClick={() => navigate('/signup')}
                style={{ borderRadius: 6 }}
              >
                Sign up
              </Button>
            </>
          )}
        </Space>
      </Header>

      <Content style={{ flex: 1, background: '#fafafa' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 32px' }}>
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
}
