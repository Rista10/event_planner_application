import { type ReactNode } from 'react';
import {
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
    <div key={event.id} className="py-[6px] px-0">
      <div
        onClick={() => navigate(`/events/${event.id}`)}
        className="w-full px-5 py-4 bg-white border border-[#eee] rounded-lg cursor-pointer transition-colors duration-200 hover:border-[#d0d0d0]"
      >
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <Text strong className="text-[15px] block mb-1">
              {event.title}
            </Text>
            {event.description && (
              <Paragraph
                ellipsis={{ rows: 1 }}
                className="m-0 mb-2 text-[#888] text-[13px]"
              >
                {event.description}
              </Paragraph>
            )}
            <Space size={16} wrap>
              <Text type="secondary" className="text-[13px]">
                <CalendarOutlined className="mr-1" />
                {formatDate(event.date_time)}
              </Text>
              {event.location && (
                <Text type="secondary" className="text-[13px]">
                  <EnvironmentOutlined className="mr-1" />
                  {event.location}
                </Text>
              )}
              <Text type="secondary" className="text-[13px]">
                <UserOutlined className="mr-1" />
                {event.creator_name}
              </Text>
            </Space>
          </div>

          <Space size={4} className="shrink-0">
            {event.is_public ? (
              <Tag color="green" className="m-0">Public</Tag>
            ) : (
              <Tag color="orange" className="m-0">Private</Tag>
            )}
            {isUpcoming(event.date_time) ? (
              <Tag color="blue" className="m-0">Upcoming</Tag>
            ) : (
              <Tag className="m-0">Past</Tag>
            )}
          </Space>
        </div>

        {event.tags.length > 0 && (
          <div className="mt-[10px]">
            {event.tags.map((tag) => (
              <Tag key={tag.id} className="mr-[6px] mb-0 mt-0 text-[12px]">
                {tag.name}
              </Tag>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-5">
          <Title level={4} className="m-0 font-semibold">Events</Title>
          {isAuthenticated && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/events/new')}
              className="rounded-md"
            >
              New Event
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-[10px] mb-5 px-4 py-[14px] bg-white border border-[#eee] rounded-lg">
          <Input
            placeholder="Search events..."
            prefix={<SearchOutlined className="text-[#bbb]" />}
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

        {error && <Alert message={error} type="error" showIcon className="mb-4" />}

        {loading ? (
          <div className="text-center py-12">
            <Spin size="large" />
          </div>
        ) : events.length === 0 ? (
          <Empty description="No events found" className="py-12">
            {isAuthenticated && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/events/new')}>
                Create Your First Event
              </Button>
            )}
          </Empty>
        ) : (
          <>
            <div>
              {events.map(renderEventCard)}
            </div>
            <div className="text-center mt-6">
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
