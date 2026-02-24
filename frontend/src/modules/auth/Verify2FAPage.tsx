import { type ReactNode, useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Typography, App } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../../types/api';
import celebrationBg from '../../assets/celebration-background.jpg';

const { Title, Text } = Typography;

interface Verify2FAForm {
  otp: string;
}

export function Verify2FAPage(): ReactNode {
  const [loading, setLoading] = useState(false);
  const { verify2FA } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = App.useApp();
  const verifiedRef = useRef(false);

  const userId = sessionStorage.getItem('pending2FAUserId');
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  useEffect(() => {
    if (!userId && !verifiedRef.current) {
      navigate('/login', { replace: true });
    }
  }, [userId, navigate]);

  const handleSubmit = async (values: Verify2FAForm): Promise<void> => {
    if (!userId) return;

    setLoading(true);
    try {
      verifiedRef.current = true;
      await verify2FA({ userId, otp: values.otp });
      message.success('Login successful');
      navigate(from, { replace: true });
    } catch (error) {
      verifiedRef.current = false;
      if (error instanceof AxiosError && error.response?.data) {
        const apiError = error.response.data as ApiErrorResponse;
        message.error(apiError.error?.message || 'Invalid verification code');
      } else {
        message.error('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = (): void => {
    sessionStorage.removeItem('pending2FAUserId');
    navigate('/login');
  };

  if (!userId) {
    return null;
  }

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
            Secure your account.
          </Title>
          <Text className="text-white/75 text-[15px] mt-2 block">
            Two-factor authentication adds an extra layer of security.
          </Text>
        </div>
      </div>

      {/* Right - Form */}
      <div className="w-[460px] flex flex-col justify-center px-[52px] py-12 bg-white">
        <div className="mb-9">
          <Text strong className="text-[13px] text-[#888] tracking-[0.5px] uppercase">
            Verification Required
          </Text>
          <Title level={3} className="mt-2 mb-0 font-semibold">
            Enter verification code
          </Title>
          <Text type="secondary" className="block mt-2">
            Please enter the 6-digit code sent to your email.
          </Text>
        </div>

        <Form<Verify2FAForm>
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          requiredMark={false}
          size="large"
        >
          <Form.Item
            name="otp"
            rules={[
              { required: true, message: 'Please enter the verification code' },
              { len: 6, message: 'Code must be 6 digits' },
            ]}
          >
            <Input.OTP
              length={6}
              formatter={(str) => str.replace(/\D/g, '')}
              size="large"
            />
          </Form.Item>

          <Form.Item className="mt-10">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="h-11 font-medium"
            >
              Verify
            </Button>
          </Form.Item>
        </Form>

        <Text type="secondary" className="text-center block mt-3">
          <Link to="/login" onClick={handleBackToLogin} className="font-medium">
            Back to login
          </Link>
        </Text>
      </div>
    </div>
  );
}
