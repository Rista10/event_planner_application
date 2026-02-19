import { type ReactNode, useState } from 'react';
import { Form, Input, Button, Typography, App } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { LoginRequest } from '../../types/auth';
import { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../../types/api';
import celebrationBg from '../../assets/celebration-background.jpg';

const { Title, Text } = Typography;

export function LoginPage(): ReactNode {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = App.useApp();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSubmit = async (values: LoginRequest): Promise<void> => {
    setLoading(true);
    try {
      await login(values);
      message.success('Login successful');
      navigate(from, { replace: true });
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        const apiError = error.response.data as ApiErrorResponse;
        message.error(apiError.error?.message || 'Login failed');
      } else {
        message.error('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left - Image */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          padding: 40,
          backgroundImage: `url(${celebrationBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.02) 100%)',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 420 }}>
          <Title level={3} style={{ color: '#fff', margin: 0, fontWeight: 600, lineHeight: 1.3 }}>
            Plan events that matter.
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, marginTop: 8, display: 'block' }}>
            Organize, discover, and manage events effortlessly.
          </Text>
        </div>
      </div>

      {/* Right - Form */}
      <div
        style={{
          width: 460,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '48px 52px',
          background: '#fff',
        }}
      >
        <div style={{ marginBottom: 36 }}>
          <Text strong style={{ fontSize: 13, color: '#888', letterSpacing: 0.5, textTransform: 'uppercase' }}>
            Welcome back
          </Text>
          <Title level={3} style={{ margin: '8px 0 0', fontWeight: 600 }}>
            Sign in to your account
          </Title>
        </div>

        <Form<LoginRequest>
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          requiredMark={false}
          size="large"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="you@example.com"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Enter your password"
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 12 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ height: 44, fontWeight: 500 }}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <Text type="secondary" style={{ textAlign: 'center', display: 'block', marginTop: 12 }}>
          Don&apos;t have an account?{' '}
          <Link to="/signup" style={{ fontWeight: 500 }}>Create one</Link>
        </Text>
      </div>
    </div>
  );
}
