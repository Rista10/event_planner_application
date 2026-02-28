import { type ReactNode, useState } from 'react';
import { Button, Typography, App, Result } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { resendVerificationApi } from '../../services/auth';
import { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../../types/api';
import { AuthPageLayout, AuthBrandHeader } from '../../components/auth/AuthPageLayout';

const { Text } = Typography;

interface LocationState {
  email?: string;
}

export function CheckEmailPage(): ReactNode {
  const [resending, setResending] = useState(false);
  const location = useLocation();
  const { message } = App.useApp();

  const state = location.state as LocationState | null;
  const email = state?.email;

  if (!email) {
    return <Navigate to="/signup" replace />;
  }

  const handleResend = async (): Promise<void> => {
    setResending(true);
    try {
      await resendVerificationApi({ email });
      message.success('Verification email sent');
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        const apiError = error.response.data as ApiErrorResponse;
        message.error(apiError.error?.message || 'Failed to resend email');
      } else {
        message.error('An unexpected error occurred');
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthPageLayout
      heroTitle="Almost there!"
      heroSubtitle="Just one more step to complete your registration."
    >
      <AuthBrandHeader />

      <Result
        icon={<MailOutlined className="text-primary text-[64px]" />}
        title="Check your email"
        subTitle={
          <>
            We've sent a verification link to <strong>{email}</strong>. Please check your inbox and
            click the link to verify your account.
          </>
        }
        className="p-0"
      />

      <div className="mt-8 flex flex-col gap-3">
        <Button
          type="primary"
          onClick={handleResend}
          loading={resending}
          block
          className="h-11 font-medium"
        >
          Resend verification email
        </Button>

        <Link to="/login" className="block w-full">
          <Button block className="h-11 font-medium">
            Back to Login
          </Button>
        </Link>
      </div>

      <Text type="secondary" className="text-center block mt-6">
        Didn't receive the email? Check your spam folder or try resending.
      </Text>
    </AuthPageLayout>
  );
}
