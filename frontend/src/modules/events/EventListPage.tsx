import { type ReactNode } from 'react';
import {
  List,
  Tag,
  Space,
  Input,
  Select,
  Segmented,
  Typography,
  Empty,
  Alert,
  Spin,
  Pagination,
  Button,
} from 'antd';
import {
  CalendarOutlined,
  EnvironmentOutlined,
  UserOutlined,
  SearchOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEvents } from '../../hooks/useEvent';
import { useTags } from '../../hooks/useTags';
import { useAuth } from '../../hooks/useAuth';
import type { EventItem } from '../../types/events';
import { EventFormDrawer } from './components/EventFormDrawer';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export function EventListPage(): ReactNode {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { events, total, loading, error, pagination, filters, setPagination, setFilters, refetch } =
    useEvents();
  const { tags } = useTags();

  const drawerOpen = location.pathname === '/events/new';

  const handleDrawerClose = (): void => {
    navigate('/events');
  };

  const handleDrawerSuccess = (): void => {
    navigate('/events');
    refetch();
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isUpcoming = (dateStr: string): boolean => new Date(dateStr) >= new Date();

  const renderEventCard = (event: EventItem): ReactNode => (
    <List.Item key={event.id} style={{ padding: '6px 0' }}>
      <div
        onClick={() => navigate(`/events/${event.id}`)}
        style={{
          width: '100%',
          padding: '16px 20px',
          background: '#fff',
          border: '1px solid #eee',
          borderRadius: 8,
          cursor: 'pointer',
          transition: 'border-color 0.2s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = '#d0d0d0';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = '#eee';
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text strong style={{ fontSize: 15, display: 'block', marginBottom: 4 }}>
              {event.title}
            </Text>
            {event.description && (
              <Paragraph
                ellipsis={{ rows: 1 }}
                style={{ margin: '0 0 8px', color: '#888', fontSize: 13 }}
              >
                {event.description}
              </Paragraph>
            )}
            <Space size={16} wrap>
              <Text type="secondary" style={{ fontSize: 13 }}>
                <CalendarOutlined style={{ marginRight: 4 }} />
                {formatDate(event.date_time)}
              </Text>
              {event.location && (
                <Text type="secondary" style={{ fontSize: 13 }}>
                  <EnvironmentOutlined style={{ marginRight: 4 }} />
                  {event.location}
                </Text>
              )}
              <Text type="secondary" style={{ fontSize: 13 }}>
                <UserOutlined style={{ marginRight: 4 }} />
                {event.creator_name}
              </Text>
            </Space>
          </div>

          <Space size={4} style={{ flexShrink: 0 }}>
            {event.is_public ? (
              <Tag color="green" style={{ margin: 0 }}>Public</Tag>
            ) : (
              <Tag color="orange" style={{ margin: 0 }}>Private</Tag>
            )}
            {isUpcoming(event.date_time) ? (
              <Tag color="blue" style={{ margin: 0 }}>Upcoming</Tag>
            ) : (
              <Tag style={{ margin: 0 }}>Past</Tag>
            )}
          </Space>
        </div>

        {event.tags.length > 0 && (
          <div style={{ marginTop: 10 }}>
            {event.tags.map((tag) => (
              <Tag key={tag.id} style={{ margin: '0 6px 0 0', fontSize: 12 }}>
                {tag.name}
              </Tag>
            ))}
          </div>
        )}
      </div>
    </List.Item>
  );

  return (
    <>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Title level={4} style={{ margin: 0, fontWeight: 600 }}>Events</Title>
          {isAuthenticated && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/events/new')}
              style={{ borderRadius: 6 }}
            >
              New Event
            </Button>
          )}
        </div>

        {/* Filters */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            marginBottom: 20,
            padding: '14px 16px',
            background: '#fff',
            border: '1px solid #eee',
            borderRadius: 8,
          }}
        >
          <Input
            placeholder="Search events..."
            prefix={<SearchOutlined style={{ color: '#bbb' }} />}
            allowClear
            style={{ width: 220 }}
            onChange={(e) => {
              const value = e.target.value;
              setTimeout(() => setFilters({ ...filters, search: value || undefined }), 300);
            }}
          />

          <Select
            placeholder="Filter by tag"
            allowClear
            style={{ width: 160 }}
            onChange={(value: string | undefined) => setFilters({ ...filters, tag_id: value })}
          >
            {tags.map((tag) => (
              <Option key={tag.id} value={tag.id}>
                {tag.name}
              </Option>
            ))}
          </Select>

          <Segmented
            options={[
              { label: 'All', value: 'all' },
              { label: 'Upcoming', value: 'upcoming' },
              { label: 'Past', value: 'past' },
            ]}
            onChange={(value) =>
              setFilters({
                ...filters,
                time_filter: value === 'all' ? undefined : (value as 'upcoming' | 'past'),
              })
            }
          />

          <Select
            defaultValue="date_time"
            style={{ width: 130 }}
            onChange={(value: string) => setPagination({ sortBy: value })}
          >
            <Option value="date_time">By Date</Option>
            <Option value="created_at">By Created</Option>
            <Option value="title">By Title</Option>
          </Select>

          <Select
            defaultValue="asc"
            style={{ width: 120 }}
            onChange={(value: 'asc' | 'desc') => setPagination({ order: value })}
          >
            <Option value="asc">Ascending</Option>
            <Option value="desc">Descending</Option>
          </Select>
        </div>

        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <Spin size="large" />
          </div>
        ) : events.length === 0 ? (
          <Empty
            description="No events found"
            style={{ padding: 48 }}
          >
            {isAuthenticated && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/events/new')}>
                Create Your First Event
              </Button>
            )}
          </Empty>
        ) : (
          <>
            <List
              dataSource={events}
              renderItem={renderEventCard}
              split={false}
            />
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Pagination
                current={pagination.page}
                pageSize={pagination.limit}
                total={total}
                showSizeChanger
                showTotal={(t) => `${t} events`}
                onChange={(page, pageSize) => setPagination({ page, limit: pageSize })}
              />
            </div>
          </>
        )}
      </div>

      <EventFormDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        onSuccess={handleDrawerSuccess}
      />
    </>
  );
}
