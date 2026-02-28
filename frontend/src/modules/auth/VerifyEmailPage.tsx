import { type ReactNode, useEffect, useState } from 'react';
import { Button, Typography, Result, Spin } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyEmailApi } from '../../services/auth';
import { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../../types/api';
import { AuthPageLayout, AuthBrandHeader } from '../../components/auth/AuthPageLayout';

const { Title, Text } = Typography;

type VerificationStatus = 'loading' | 'success' | 'error';

export function VerifyEmailPage(): ReactNode {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async (): Promise<void> => {
      if (!token) {
        setStatus('error');
        setErrorMessage('Invalid verification link. No token provided.');
        return;
      }

      try {
        await verifyEmailApi({ token });
        setStatus('success');
      } catch (error) {
        setStatus('error');
        if (error instanceof AxiosError && error.response?.data) {
          const apiError = error.response.data as ApiErrorResponse;
          setErrorMessage(apiError.error?.message || 'Failed to verify email');
        } else {
          setErrorMessage('An unexpected error occurred');
        }
      }
    };

    verifyEmail();
  }, [token]);

  const renderContent = (): ReactNode => {
    if (status === 'loading') {
      return (
        <div className="text-center">
          <Spin size="large" />
          <Title level={4} className="mt-6">
            Verifying your email...
          </Title>
          <Text type="secondary">Please wait while we verify your email address.</Text>
        </div>
      );
    }

    if (status === 'success') {
      return (
        <>
          <Result
            icon={<CheckCircleOutlined className="text-success text-[64px]" />}
            title="Email verified!"
            subTitle="Your email has been verified successfully. You can now sign in to your account."
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
    }

    return (
      <>
        <Result
          icon={<CloseCircleOutlined className="text-error text-[64px]" />}
          title="Verification failed"
          subTitle={errorMessage}
          className="p-0"
        />
        <div className="mt-8 flex flex-col gap-3">
          <Link to="/signup" className="block w-full">
            <Button type="primary" block className="h-11 font-medium">
              Create a new account
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
  };

  return (
    <AuthPageLayout
      heroTitle={status === 'success' ? 'Welcome aboard!' : 'Email verification'}
      heroSubtitle={
        status === 'success'
          ? 'Your account is ready. Start planning amazing events!'
          : 'Confirming your email address...'
      }
    >
      <AuthBrandHeader />
      {renderContent()}
    </AuthPageLayout>
  );
}
