import { type ReactNode, useState } from 'react';
import { Form, Input, Button, Typography, App, Result } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { forgotPasswordApi } from '../../services/auth';
import { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../../types/api';
import celebrationBg from '../../assets/event-planner.jpg';

const { Title, Text } = Typography;

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
       <div className="mb-8 relative">
            <div className="flex justify-end mb-6 text-2xl font-semibold text-black">
              Event<span className="text-blue-500">Planner</span>
            </div>
        <Text strong className="text-[13px] text-[#888] tracking-[0.5px] uppercase">
          Forgot password
        </Text>
        <Title level={3} className="mt-2 mb-0 font-semibold">
          Reset your password
        </Title>
        <Text type="secondary" className="block mt-2">
          Enter your email address and we'll send you a link to reset your password.
        </Text>
      </div>

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
            prefix={<MailOutlined className="text-[#bfbfbf]" />}
            placeholder="you@example.com"
          />
        </Form.Item>

        <Form.Item className="mt-6 mb-0">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            className="h-11 font-medium"
          >
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
        icon={<MailOutlined className="text-[#1677ff] text-[64px]" />}
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
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] p-4">
      <div className="w-full max-w-[1400px] min-h-[600px] lg:min-h-[700px] bg-white rounded-2xl shadow-lg flex flex-col lg:flex-row overflow-hidden">
        {/* Left - Image */}
        <div
          className="hidden lg:flex lg:flex-[1.5] relative items-end p-10 bg-cover bg-center"
          style={{ backgroundImage: `url(${celebrationBg})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/[.08] to-black/[.02]" />
          <div className="relative z-10 max-w-[420px]">
            <Title level={3} className="!text-white m-0 font-semibold leading-snug">
              {submitted ? 'Check your inbox' : 'Forgot your password?'}
            </Title>
            <Text className="!text-white/75 text-[15px] mt-2 block">
              {submitted
                ? 'Follow the link in your email to reset your password.'
                : 'No worries, we help you get back into your account.'}
            </Text>
          </div>
        </div>

        {/* Right - Content */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-8 lg:px-12 py-10 lg:py-12">
          {submitted ? renderSuccess() : renderForm()}
        </div>
      </div>
    </div>
  );
}
