import { type ReactNode } from 'react';
import { Typography, Button, Space, Spin, Alert, App } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useRsvp } from '../../../hooks/useRsvp';
import type { RsvpResponse } from '../../../types/rsvp';

const { Text } = Typography;

interface RsvpSectionProps {
  eventId: string;
  isAuthenticated: boolean;
  isUpcoming: boolean;
  isOwner: boolean;
}

export function RsvpSection({ eventId, isAuthenticated, isUpcoming, isOwner }: RsvpSectionProps): ReactNode {
  const { myRsvp, summary, loading, submitting, submitRsvp, cancelMyRsvp } = useRsvp(
    eventId,
    isAuthenticated,
  );
  const { message } = App.useApp();

  const handleRsvp = async (response: RsvpResponse): Promise<void> => {
    try {
      await submitRsvp(response);
      message.success('RSVP recorded successfully');
    } catch {
      message.error('Failed to submit RSVP');
    }
  };

  const handleCancel = async (): Promise<void> => {
    try {
      await cancelMyRsvp();
      message.success('RSVP cancelled');
    } catch {
      message.error('Failed to cancel RSVP');
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-[#eee] rounded-lg p-6 mt-4 text-center">
        <Spin size="small" />
      </div>
    );
  }

  const getButtonType = (response: RsvpResponse): 'primary' | 'default' => {
    return myRsvp?.response === response ? 'primary' : 'default';
  };

  const getButtonStyle = (response: RsvpResponse): string => {
    if (myRsvp?.response !== response) return '';

    switch (response) {
      case 'YES':
        return 'bg-[#52c41a] border-[#52c41a] hover:bg-[#73d13d] hover:border-[#73d13d]';
      case 'NO':
        return 'bg-[#ff4d4f] border-[#ff4d4f] hover:bg-[#ff7875] hover:border-[#ff7875]';
      case 'MAYBE':
        return 'bg-[#faad14] border-[#faad14] hover:bg-[#ffc53d] hover:border-[#ffc53d]';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white border border-[#eee] rounded-lg p-6 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <TeamOutlined className="text-lg" />
        <Text strong className="text-base">
          RSVP
        </Text>
      </div>

      {summary && (
        <div className="flex gap-6 mb-4 pb-4 border-b border-[#f0f0f0]">
          <div className="text-center">
            <div className="text-xl font-semibold">{summary.yes}</div>
            <Text type="secondary" className="text-xs">
              Going
            </Text>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold">{summary.maybe}</div>
            <Text type="secondary" className="text-xs">
              Maybe
            </Text>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold">{summary.no}</div>
            <Text type="secondary" className="text-xs">
              Not Going
            </Text>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold">{summary.total}</div>
            <Text type="secondary" className="text-xs">
              Total
            </Text>
          </div>
        </div>
      )}

      {!isUpcoming && (
        <Alert message="This event has already passed" type="info" showIcon className="mb-4" />
      )}

      {!isAuthenticated && isUpcoming && (
        <Alert message="Please log in to RSVP for this event" type="info" showIcon />
      )}

      {isAuthenticated && isUpcoming && isOwner && (
        <Alert message="You are the organizer of this event" type="info" showIcon />
      )}

      {isAuthenticated && isUpcoming && !isOwner && (
        <div>
          {myRsvp && (
            <div className="mb-3">
              <Text type="secondary">
                Your response:{' '}
                <Text strong>
                  {myRsvp.response === 'YES' && 'Going'}
                  {myRsvp.response === 'NO' && 'Not Going'}
                  {myRsvp.response === 'MAYBE' && 'Maybe'}
                </Text>
              </Text>
            </div>
          )}

          <Space wrap>
            <Button
              type={getButtonType('YES')}
              icon={<CheckCircleOutlined />}
              onClick={() => handleRsvp('YES')}
              loading={submitting}
              disabled={submitting}
              className={getButtonStyle('YES')}
            >
              Going
            </Button>
            <Button
              type={getButtonType('MAYBE')}
              icon={<QuestionCircleOutlined />}
              onClick={() => handleRsvp('MAYBE')}
              loading={submitting}
              disabled={submitting}
              className={getButtonStyle('MAYBE')}
            >
              Maybe
            </Button>
            <Button
              type={getButtonType('NO')}
              icon={<CloseCircleOutlined />}
              onClick={() => handleRsvp('NO')}
              loading={submitting}
              disabled={submitting}
              className={getButtonStyle('NO')}
            >
              Not Going
            </Button>
            {myRsvp && (
              <Button onClick={handleCancel} loading={submitting} disabled={submitting}>
                Cancel RSVP
              </Button>
            )}
          </Space>
        </div>
      )}
    </div>
  );
}
