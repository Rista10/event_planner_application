import { type ReactNode, useState } from 'react';
import { Form, Input, Button, Typography, App } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { LoginRequest } from '../../types/auth';
import { AuthPageLayout, AuthHeader } from '../../components/auth/AuthPageLayout';
import { handleApiError } from '../../utils/errorHandler';

const { Text } = Typography;

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
        message.success('Welcome back!');
        navigate(from, { replace: true });
      }
    } catch (error) {
      message.error(handleApiError(error, 'Unable to sign in. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageLayout
      heroTitle="Plan events that matter."
      heroSubtitle="Organize, discover, and manage events effortlessly."
    >
      <AuthHeader subtitle="Welcome back" title="Sign in to your account" />

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
            prefix={<MailOutlined className="text-text-placeholder" />}
            placeholder="you@example.com"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: 'Please enter your password' }]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-text-placeholder" />}
            placeholder="Enter your password"
          />
        </Form.Item>

        <Link to="/forgot-password" className="text-sm text-primary mb-4 block">
          Forgot password?
        </Link>

        <Form.Item className="mt-6 mb-0">
          <Button type="primary" htmlType="submit" loading={loading} block className="h-11 font-medium">
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
    </AuthPageLayout>
  );
}
