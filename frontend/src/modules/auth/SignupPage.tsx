import { type ReactNode, useState } from 'react';
import { Form, Input, Button, Typography, App } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { signupApi } from '../../services/auth';
import { AuthPageLayout, AuthHeader } from '../../components/auth/AuthPageLayout';
import { handleApiError } from '../../utils/errorHandler';

const { Text } = Typography;

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
      message.error(handleApiError(error, 'Unable to create account. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageLayout
      heroTitle="Start something great."
      heroSubtitle="Create an account to start planning and discovering events."
      maxWidth="wide"
    >
      <AuthHeader subtitle="Get started" title="Create your account" />

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
          <Input prefix={<UserOutlined className="text-text-placeholder" />} placeholder="John Doe" />
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
            prefix={<MailOutlined className="text-text-placeholder" />}
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
            prefix={<LockOutlined className="text-text-placeholder" />}
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
            prefix={<LockOutlined className="text-text-placeholder" />}
            placeholder="Repeat your password"
          />
        </Form.Item>

        <Form.Item className="mt-6 mb-0">
          <Button type="primary" htmlType="submit" loading={loading} block className="h-11 font-medium">
            Create Account
          </Button>
        </Form.Item>
      </Form>

      <Text type="secondary" className="text-center block mt-6">
        Already have an account?{' '}
        <Link to="/login" className="font-medium">
          Sign in
        </Link>
      </Text>
    </AuthPageLayout>
  );
}
