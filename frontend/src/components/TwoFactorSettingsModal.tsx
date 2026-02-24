import { type ReactNode, useState } from 'react';
import { Modal, Switch, Typography, App, Space } from 'antd';
import { SafetyOutlined } from '@ant-design/icons';
import { toggle2FAApi } from '../services/auth';
import { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../types/api';

const { Text, Paragraph } = Typography;

interface TwoFactorSettingsModalProps {
  open: boolean;
  onClose: () => void;
  is2FAEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function TwoFactorSettingsModal({
  open,
  onClose,
  is2FAEnabled,
  onToggle,
}: TwoFactorSettingsModalProps): ReactNode {
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  const handleToggle = async (checked: boolean): Promise<void> => {
    setLoading(true);
    try {
      await toggle2FAApi({ enable: checked });
      onToggle(checked);
      message.success(
        checked
          ? 'Two-factor authentication enabled'
          : 'Two-factor authentication disabled'
      );
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        const apiError = error.response.data as ApiErrorResponse;
        message.error(apiError.error?.message || 'Failed to update 2FA settings');
      } else {
        message.error('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <SafetyOutlined />
          Security Settings
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={480}
    >
      <div className="py-4">
        <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex-1 mr-4">
            <Text strong className="block mb-1">
              Two-Factor Authentication
            </Text>
            <Paragraph type="secondary" className="mb-0 text-sm">
              Add an extra layer of security to your account. When enabled, you'll
              need to enter a verification code sent to your email each time you
              log in.
            </Paragraph>
          </div>
          <Switch
            checked={is2FAEnabled}
            onChange={handleToggle}
            loading={loading}
          />
        </div>
      </div>
    </Modal>
  );
}
