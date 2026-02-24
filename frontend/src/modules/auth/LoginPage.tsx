import { type ReactNode, useState } from 'react';
import { Form, Input, Button, Typography, App } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { LoginRequest } from '../../types/auth';
import { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../../types/api';
import celebrationBg from '../../assets/event-planner.jpg';


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
      const result = await login(values);
      if (result.requires2FA) {
        navigate('/verify-2fa', { state: { from: { pathname: from } } });
      } else {
        message.success('Login successful');
        navigate(from, { replace: true });
      }
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
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] p-4">
      <div className="w-full max-w-[1400px] min-h-[600px] lg:min-h-[700px] bg-white rounded-2xl shadow-lg flex flex-col lg:flex-row overflow-hidden">
        <div
          className="hidden lg:flex lg:flex-[1.5] relative items-end p-10 bg-cover bg-center"
          style={{ backgroundImage: `url(${celebrationBg})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/[.08] to-black/[.02]" />
          <div className="relative z-10 max-w-[420px]">
            <Title level={3} className="!text-white m-0 font-semibold leading-snug">
              Plan events that matter.
            </Title>
            <Text className="!text-white/75 text-[15px] mt-2 block">
              Organize, discover, and manage events effortlessly.
            </Text>
          </div>
        </div>

        {/* Right - Form */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-8 lg:px-12 py-10 lg:py-12">
          <div className="mb-8 relative">
            <div className="flex justify-end mb-6 text-2xl font-semibold text-black">
              Event<span className="text-blue-500">Planner</span>
            </div>
            <Text strong className="text-[13px] text-[#888] tracking-[0.5px] uppercase">
              Welcome back
            </Text>
            <Title level={3} className="mt-2 mb-0 font-semibold">
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
                prefix={<MailOutlined className="text-[#bfbfbf]" />}
                placeholder="you@example.com"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-[#bfbfbf]" />}
                placeholder="Enter your password"
              />
            </Form.Item>

            <Link to="/forgot-password" className="text-sm text-[#1677ff] mb-4 block">
              Forgot password?
            </Link>

            <Form.Item className="mt-6 mb-0">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="h-11 font-medium"
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <Text type="secondary" className="text-center block mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-medium">
              Create one
            </Link>
          </Text>
        </div>
      </div>
    </div>
  );
}
