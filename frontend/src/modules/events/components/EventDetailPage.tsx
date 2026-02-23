import { type ReactNode, useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Tag,
  Space,
  Button,
  Spin,
  Alert,
  Modal,
  App,
} from 'antd';
import {
  CalendarOutlined,
  EnvironmentOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { getEvent, deleteEvent } from '../../../services/events';
import type { EventItem } from '../../../types/events';
import { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../../../types/api';
import { EventFormDrawer } from './EventFormDrawer';

const { Title, Paragraph, Text } = Typography;

export function EventDetailPage(): ReactNode {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { message } = App.useApp();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isEditOpen = location.pathname.endsWith('/edit');

  const fetchEvent = useCallback(async (): Promise<void> => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getEvent(id);
      setEvent(data);
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data) {
        const apiError = err.response.data as ApiErrorResponse;
        setError(apiError.error?.message || 'Failed to load event');
      } else {
        setError('Failed to load event');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const handleDrawerClose = (): void => {
    navigate(`/events/${id}`);
  };

  const handleDrawerSuccess = (): void => {
    navigate(`/events/${id}`);
    fetchEvent();
  };

  const handleDelete = (): void => {
    if (!event) return;

    Modal.confirm({
      title: 'Delete Event',
      content: `Are you sure you want to delete "${event.title}"? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteEvent(event.id);
          message.success('Event deleted successfully');
          navigate('/events');
        } catch (err) {
          if (err instanceof AxiosError && err.response?.data) {
            const apiError = err.response.data as ApiErrorResponse;
            message.error(apiError.error?.message || 'Failed to delete event');
          } else {
            message.error('Failed to delete event');
          }
        }
      },
    });
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !event) {
    return <Alert message={error || 'Event not found'} type="error" showIcon />;
  }

  const isOwner = user?.id === event.user_id;
  const isUpcoming = new Date(event.date_time) >= new Date();

  return (
    <>
      <div>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/events')}
          className="mb-4 px-0 text-[#666]"
        >
          Back to Events
        </Button>

        <div className="bg-white border border-[#eee] rounded-lg p-[28px_32px]">
          {/* Header */}
          <div className="flex justify-between items-start mb-5">
            <div className="flex-1">
              <Space size={8} className="mb-2">
                {event.is_public ? (
                  <Tag color="green">Public</Tag>
                ) : (
                  <Tag color="orange">Private</Tag>
                )}
                {isUpcoming ? (
                  <Tag color="blue">Upcoming</Tag>
                ) : (
                  <Tag>Past</Tag>
                )}
              </Space>
              <Title level={3} className="m-0 font-semibold">
                {event.title}
              </Title>
            </div>

            {isOwner && (
              <Space size={8}>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/events/${event.id}/edit`)}
                  className="rounded-md"
                >
                  Edit
                </Button>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleDelete}
                  className="rounded-md"
                >
                  Delete
                </Button>
              </Space>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <Paragraph className="text-[15px] text-[#555] mb-6 leading-relaxed">
              {event.description}
            </Paragraph>
          )}

          {/* Meta */}
          <div
            className="grid gap-4 py-5 border-t border-[#f0f0f0]"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              borderBottom: event.tags.length > 0 ? '1px solid #f0f0f0' : 'none',
            }}
          >
            <div>
              <Text type="secondary" className="text-xs uppercase tracking-[0.5px]">
                <CalendarOutlined className="mr-1.5" />
                Date &amp; Time
              </Text>
              <div className="mt-1 font-medium">{formatDate(event.date_time)}</div>
            </div>
            <div>
              <Text type="secondary" className="text-xs uppercase tracking-[0.5px]">
                <EnvironmentOutlined className="mr-1.5" />
                Location
              </Text>
              <div className="mt-1 font-medium">{event.location || 'Not specified'}</div>
            </div>
            <div>
              <Text type="secondary" className="text-xs uppercase tracking-[0.5px]">
                <UserOutlined className="mr-1.5" />
                Organizer
              </Text>
              <div className="mt-1 font-medium">{event.creator_name}</div>
            </div>
          </div>

          {/* Tags */}
          {event.tags.length > 0 && (
            <div className="pt-4">
              <Text type="secondary" className="text-xs uppercase tracking-[0.5px] block mb-2">
                Tags
              </Text>
              <Space wrap>
                {event.tags.map((tag) => (
                  <Tag key={tag.id} className="text-[13px]">
                    {tag.name}
                  </Tag>
                ))}
              </Space>
            </div>
          )}
        </div>
      </div>

      <EventFormDrawer
        open={isEditOpen}
        eventId={id}
        onClose={handleDrawerClose}
        onSuccess={handleDrawerSuccess}
      />
    </>
  );
}
