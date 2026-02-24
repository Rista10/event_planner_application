import { type ReactNode, useEffect, useState } from 'react';
import { Button, Typography, Result, Spin } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyEmailApi } from '../../services/auth';
import { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../../types/api';
import celebrationBg from '../../assets/event-planner.jpg';

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
            icon={<CheckCircleOutlined className="text-[#52c41a] text-[64px]" />}
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
          icon={<CloseCircleOutlined className="text-[#ff4d4f] text-[64px]" />}
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
              {status === 'success' ? 'Welcome aboard!' : 'Email verification'}
            </Title>
            <Text className="!text-white/75 text-[15px] mt-2 block">
              {status === 'success'
                ? 'Your account is ready. Start planning amazing events!'
                : 'Confirming your email address...'}
            </Text>
          </div>
        </div>

        {/* Right - Content */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-8 lg:px-12 py-10 lg:py-12">
           <div className="mb-8 relative">
            <div className="flex justify-end mb-6 text-2xl font-semibold text-black">
              Event<span className="text-blue-500">Planner</span>
            </div>
            </div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
