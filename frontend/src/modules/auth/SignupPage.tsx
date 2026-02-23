import { type ReactNode, useState } from 'react';
import { Form, Input, Button, Typography, App } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { signupApi } from '../../services/auth';
import { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../../types/api';
import celebrationBg from '../../assets/celebration-background.jpg';

const { Title, Text } = Typography;

interface SignupFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function SignupPage(): ReactNode {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { message } = App.useApp();

  const handleSubmit = async (values: SignupFormValues): Promise<void> => {
    setLoading(true);
    try {
      await signupApi({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      message.success('Account created! Please check your email to verify.');
      navigate('/check-email', { replace: true, state: { email: values.email } });
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        const apiError = error.response.data as ApiErrorResponse;
        message.error(apiError.error?.message || 'Signup failed');
      } else {
        message.error('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left - Image */}
      <div
        className="flex-1 relative flex items-end p-10 bg-cover bg-center"
        style={{ backgroundImage: `url(${celebrationBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/[.08] to-black/[.02]" />
        <div className="relative z-10 max-w-[420px]">
          <Title level={3} className="text-white m-0 font-semibold leading-snug">
            Start something great.
          </Title>
          <Text className="text-white/75 text-[15px] mt-2 block">
            Create an account to start planning and discovering events.
          </Text>
        </div>
      </div>

      {/* Right - Form */}
      <div className="w-[460px] flex flex-col justify-center px-[52px] py-12 bg-white">
        <div className="mb-9">
          <Text strong className="text-[13px] text-[#888] tracking-[0.5px] uppercase">
            Get started
          </Text>
          <Title level={3} className="mt-2 mb-0 font-semibold">
            Create your account
          </Title>
        </div>

        <Form<SignupFormValues>
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          requiredMark={false}
          size="large"
        >
          <Form.Item
            name="name"
            label="Full name"
            rules={[{ required: true, message: 'Please enter your name' }]}
          >
            <Input
              prefix={<UserOutlined className="text-[#bfbfbf]" />}
              placeholder="John Doe"
            />
          </Form.Item>

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
            rules={[
              { required: true, message: 'Please enter a password' },
              { min: 8, message: 'Password must be at least 8 characters' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-[#bfbfbf]" />}
              placeholder="Min. 8 characters"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-[#bfbfbf]" />}
              placeholder="Repeat your password"
            />
          </Form.Item>

          <Form.Item className="mt-3">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="h-11 font-medium"
            >
              Create Account
            </Button>
          </Form.Item>
        </Form>

        <Text type="secondary" className="text-center block mt-3">
          Already have an account?{' '}
          <Link to="/login" className="font-medium">Sign in</Link>
        </Text>
      </div>
    </div>
  );
}
