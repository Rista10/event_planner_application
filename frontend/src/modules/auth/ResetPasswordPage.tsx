import { type ReactNode, useState } from 'react';
import { Form, Input, Button, Typography, App, Result } from 'antd';
import { LockOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Link, useSearchParams } from 'react-router-dom';
import { resetPasswordApi } from '../../services/auth';
import { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../../types/api';
import { AuthPageLayout, AuthHeader } from '../../components/auth/AuthPageLayout';

const { Text } = Typography;

interface ResetPasswordFormValues {
  newPassword: string;
  confirmPassword: string;
}

type PageStatus = 'form' | 'success' | 'error';

export function ResetPasswordPage(): ReactNode {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<PageStatus>('form');
  const [errorMessage, setErrorMessage] = useState('');
  const { message } = App.useApp();

  const token = searchParams.get('token');

  const handleSubmit = async (values: ResetPasswordFormValues): Promise<void> => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Invalid reset link. No token provided.');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordApi({ token, newPassword: values.newPassword });
      setStatus('success');
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        const apiError = error.response.data as ApiErrorResponse;
        const errMsg = apiError.error?.message || 'Failed to reset password';
        if (apiError.error?.code === 'INVALID_TOKEN' || apiError.error?.code === 'TOKEN_EXPIRED') {
          setStatus('error');
          setErrorMessage(errMsg);
        } else {
          message.error(errMsg);
        }
      } else {
        message.error('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderForm = (): ReactNode => {
    if (!token) {
      return (
        <>
          <Result
            icon={<CloseCircleOutlined className="text-error text-[64px]" />}
            title="Invalid reset link"
            subTitle="This password reset link is invalid. Please request a new one."
            className="p-0"
          />
          <div className="mt-8">
            <Link to="/forgot-password" className="block w-full">
              <Button type="primary" block className="h-11 font-medium">
                Request new reset link
              </Button>
            </Link>
          </div>
        </>
      );
    }

    return (
      <>
        <AuthHeader
          subtitle="Reset password"
          title="Create new password"
          description="Enter a new password for your account."
        />

        <Form<ResetPasswordFormValues>
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          requiredMark={false}
          size="large"
        >
          <Form.Item
            name="newPassword"
            label="New password"
            rules={[
              { required: true, message: 'Please enter a new password' },
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
            label="Confirm new password"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-text-placeholder" />}
              placeholder="Repeat your new password"
            />
          </Form.Item>

          <Form.Item className="mt-6 mb-0">
            <Button type="primary" htmlType="submit" loading={loading} block className="h-11 font-medium">
              Reset password
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
  };

  const renderSuccess = (): ReactNode => (
    <>
      <Result
        icon={<CheckCircleOutlined className="text-success text-[64px]" />}
        title="Password reset successful!"
        subTitle="Your password has been reset successfully. You can now sign in with your new password."
        className="p-0"
      />
      <div className="mt-8">
        <Link to="/login" className="block w-full">
          <Button type="primary" block className="h-11 font-medium">
            Sign in to your account
          </Button>
        </Link>
      </div>
    </>
  );

  const renderError = (): ReactNode => (
    <>
      <Result
        icon={<CloseCircleOutlined className="text-error text-[64px]" />}
        title="Reset failed"
        subTitle={errorMessage}
        className="p-0"
      />
      <div className="mt-8 flex flex-col gap-3">
        <Link to="/forgot-password" className="block w-full">
          <Button type="primary" block className="h-11 font-medium">
            Request new reset link
          </Button>
        </Link>
        <Link to="/login" className="block w-full">
          <Button block className="h-11 font-medium">
            Back to Login
          </Button>
        </Link>
      </div>
    </>
  );

  const renderContent = (): ReactNode => {
    switch (status) {
      case 'success':
        return renderSuccess();
      case 'error':
        return renderError();
      default:
        return renderForm();
    }
  };

  return (
    <AuthPageLayout
      heroTitle={status === 'success' ? 'All set!' : 'Create new password'}
      heroSubtitle={
        status === 'success'
          ? 'Your password has been updated successfully.'
          : 'Choose a strong password for your account.'
      }
    >
      {renderContent()}
    </AuthPageLayout>
  );
}
