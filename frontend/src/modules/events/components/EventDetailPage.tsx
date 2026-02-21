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
      <div style={{ textAlign: 'center', padding: 48 }}>
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
          style={{ marginBottom: 16, padding: '4px 0', color: '#666' }}
        >
          Back to Events
        </Button>

        <div
          style={{
            background: '#fff',
            border: '1px solid #eee',
            borderRadius: 8,
            padding: '28px 32px',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div style={{ flex: 1 }}>
              <Space size={8} style={{ marginBottom: 8 }}>
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
              <Title level={3} style={{ margin: 0, fontWeight: 600 }}>
                {event.title}
              </Title>
            </div>

            {isOwner && (
              <Space size={8}>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/events/${event.id}/edit`)}
                  style={{ borderRadius: 6 }}
                >
                  Edit
                </Button>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleDelete}
                  style={{ borderRadius: 6 }}
                >
                  Delete
                </Button>
              </Space>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <Paragraph style={{ fontSize: 15, color: '#555', marginBottom: 24, lineHeight: 1.7 }}>
              {event.description}
            </Paragraph>
          )}

          {/* Meta */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
              padding: '20px 0',
              borderTop: '1px solid #f0f0f0',
              borderBottom: event.tags.length > 0 ? '1px solid #f0f0f0' : 'none',
            }}
          >
            <div>
              <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                <CalendarOutlined style={{ marginRight: 6 }} />
                Date & Time
              </Text>
              <div style={{ marginTop: 4, fontWeight: 500 }}>{formatDate(event.date_time)}</div>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                <EnvironmentOutlined style={{ marginRight: 6 }} />
                Location
              </Text>
              <div style={{ marginTop: 4, fontWeight: 500 }}>{event.location || 'Not specified'}</div>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                <UserOutlined style={{ marginRight: 6 }} />
                Organizer
              </Text>
              <div style={{ marginTop: 4, fontWeight: 500 }}>{event.creator_name}</div>
            </div>
          </div>

          {/* Tags */}
          {event.tags.length > 0 && (
            <div style={{ paddingTop: 16 }}>
              <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>
                Tags
              </Text>
              <Space wrap>
                {event.tags.map((tag) => (
                  <Tag key={tag.id} style={{ fontSize: 13 }}>
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
