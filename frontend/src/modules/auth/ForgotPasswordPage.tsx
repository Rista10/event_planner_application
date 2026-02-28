import { type ReactNode, useState } from 'react';
import { Form, Input, Button, Typography, App, Result } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { forgotPasswordApi } from '../../services/auth';
import { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../../types/api';
import { AuthPageLayout, AuthHeader } from '../../components/auth/AuthPageLayout';

const { Text } = Typography;

interface ForgotPasswordFormValues {
  email: string;
}

export function ForgotPasswordPage(): ReactNode {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const { message } = App.useApp();

  const handleSubmit = async (values: ForgotPasswordFormValues): Promise<void> => {
    setLoading(true);
    try {
      await forgotPasswordApi({ email: values.email });
      setSubmittedEmail(values.email);
      setSubmitted(true);
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        const apiError = error.response.data as ApiErrorResponse;
        message.error(apiError.error?.message || 'Failed to send reset email');
      } else {
        message.error('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderForm = (): ReactNode => (
    <>
      <AuthHeader
        subtitle="Forgot password"
        title="Reset your password"
        description="Enter your email address and we'll send you a link to reset your password."
      />

      <Form<ForgotPasswordFormValues>
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

        <Form.Item className="mt-6 mb-0">
          <Button type="primary" htmlType="submit" loading={loading} block className="h-11 font-medium">
            Send reset link
          </Button>
        </Form.Item>
      </Form>

      <Text type="secondary" className="text-center block mt-6">
        Remember your password?{' '}
        <Link to="/login" className="font-medium">
          Sign in
        </Link>
      </Text>
    </>
  );

  const renderSuccess = (): ReactNode => (
    <>
      <Result
        icon={<MailOutlined className="text-primary text-[64px]" />}
        title="Check your email"
        subTitle={
          <>
            We've sent a password reset link to <strong>{submittedEmail}</strong>. Please check your
            inbox and click the link to reset your password.
          </>
        }
        className="p-0"
      />

      <div className="mt-8">
        <Link to="/login" className="block w-full">
          <Button type="primary" block className="h-11 font-medium">
            Back to Login
          </Button>
        </Link>
      </div>

      <Text type="secondary" className="text-center block mt-6">
        Didn't receive the email? Check your spam folder.
      </Text>
    </>
  );

  return (
    <AuthPageLayout
      heroTitle={submitted ? 'Check your inbox' : 'Forgot your password?'}
      heroSubtitle={
        submitted
          ? 'Follow the link in your email to reset your password.'
          : 'No worries, we help you get back into your account.'
      }
    >
      {submitted ? renderSuccess() : renderForm()}
    </AuthPageLayout>
  );
}
