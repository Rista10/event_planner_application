import { type ReactNode, useState } from 'react';
import { Form, Input, Button, Typography, App } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
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
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const handleSubmit = async (values: SignupFormValues): Promise<void> => {
    setLoading(true);
    try {
      await signup({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      message.success('Account created successfully');
      navigate('/', { replace: true });
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
            Start something great.
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, marginTop: 8, display: 'block' }}>
            Create an account to start planning and discovering events.
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
            Get started
          </Text>
          <Title level={3} style={{ margin: '8px 0 0', fontWeight: 600 }}>
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
              prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
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
              prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
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
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
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
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Repeat your password"
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
              Create Account
            </Button>
          </Form.Item>
        </Form>

        <Text type="secondary" style={{ textAlign: 'center', display: 'block', marginTop: 12 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 500 }}>Sign in</Link>
        </Text>
      </div>
    </div>
  );
}
