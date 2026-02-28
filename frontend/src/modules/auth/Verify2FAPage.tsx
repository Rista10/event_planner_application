import { type ReactNode, useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Typography, App } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../../types/api';
import { AuthPageLayout, AuthHeader } from '../../components/auth/AuthPageLayout';
import { tokenManager } from '../../services/tokenManager';

const { Text } = Typography;

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

  const userId = tokenManager.getPending2FAUserId();
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
    tokenManager.clearPending2FAUserId();
    navigate('/login');
  };

  if (!userId) {
    return null;
  }

  return (
    <AuthPageLayout
      heroTitle="Secure your account."
      heroSubtitle="Two-factor authentication adds an extra layer of security."
    >
      <AuthHeader
        subtitle="Verification Required"
        title="Enter verification code"
        description="Please enter the 6-digit code sent to your email."
      />

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
          <Input.OTP length={6} formatter={(str) => str.replace(/\D/g, '')} size="large" />
        </Form.Item>

        <Form.Item className="mt-10 mb-0">
          <Button type="primary" htmlType="submit" loading={loading} block className="h-11 font-medium">
            Verify
          </Button>
        </Form.Item>
      </Form>

      <Text type="secondary" className="text-center block mt-6">
        <Link to="/login" onClick={handleBackToLogin} className="font-medium">
          Back to login
        </Link>
      </Text>
    </AuthPageLayout>
  );
}
