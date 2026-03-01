import { type ReactNode, useState, useEffect, useMemo } from 'react';
import { Calendar, Badge, Typography, Spin, Alert, Card, List, Empty } from 'antd';
import type { BadgeProps, CalendarProps } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs, { type Dayjs } from 'dayjs';
import { useAuth } from '../../hooks/useAuth';
import { getEvents } from '../../services/events';
import { getEventsAttending } from '../../services/rsvp';
import type { EventItem } from '../../types/events';

const { Title, Text } = Typography;

interface CalendarEvent extends EventItem {
  source: 'created' | 'attending';
}

export function CalendarPage(): ReactNode {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchCalendarEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const [createdResult, attendingResult] = await Promise.all([
          getEvents({ page: 1, limit: 50, my_events: true }),
          getEventsAttending({ page: 1, limit: 50 }),
        ]);

        const createdEvents: CalendarEvent[] = createdResult.items.map((e) => ({
          ...e,
          source: 'created' as const,
        }));

        const attendingEvents: CalendarEvent[] = attendingResult.items
          .filter((e) => e.user_id !== user?.id)
          .map((e) => ({ ...e, source: 'attending' as const }));

        setEvents([...createdEvents, ...attendingEvents]);
      } catch {
        setError('Failed to load calendar events');
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarEvents();
  }, [isAuthenticated, navigate, user?.id]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((event) => {
      const dateKey = dayjs(event.date_time).format('YYYY-MM-DD');
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(event);
    });
    return map;
  }, [events]);

  const selectedDateEvents = useMemo(() => {
    const dateKey = selectedDate.format('YYYY-MM-DD');
    return eventsByDate.get(dateKey) || [];
  }, [selectedDate, eventsByDate]);

  const upcomingEvents = useMemo(() => {
    const now = dayjs();
    return events
      .filter((e) => dayjs(e.date_time).isAfter(now) || dayjs(e.date_time).isSame(now, 'day'))
      .sort((a, b) => dayjs(a.date_time).valueOf() - dayjs(b.date_time).valueOf())
      .slice(0, 20);
  }, [events]);

  const isPastEvent = (dateStr: string) => dayjs(dateStr).isBefore(dayjs(), 'day');

  const getListData = (value: Dayjs): { type: BadgeProps['status']; content: string; id: string }[] => {
    const dateKey = value.format('YYYY-MM-DD');
    const dateEvents = eventsByDate.get(dateKey) || [];

    return dateEvents.map((event) => ({
      type: event.source === 'created' ? 'success' : 'processing',
      content: event.title,
      id: event.id,
    }));
  };

  const getMonthData = (value: Dayjs) => {
    const monthKey = value.format('YYYY-MM');
    let count = 0;
    events.forEach((event) => {
      if (dayjs(event.date_time).format('YYYY-MM') === monthKey) {
        count++;
      }
    });
    return count > 0 ? count : null;
  };

  const monthCellRender = (value: Dayjs) => {
    const num = getMonthData(value);
    return num ? (
      <div className="text-center">
        <Badge count={num} style={{ backgroundColor: '#1677ff' }} />
      </div>
    ) : null;
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value);
    const isPast = isPastEvent(value.toISOString());

    return (
      <ul className="list-none p-0 m-0">
        {listData.slice(0, 3).map((item) => (
          <li key={item.id} className={isPast ? 'opacity-50' : ''}>
            <Badge status={item.type} text={<span className="text-xs">{item.content}</span>} />
          </li>
        ))}
        {listData.length > 3 && (
          <li className="text-xs text-gray-400">+{listData.length - 3} more</li>
        )}
      </ul>
    );
  };

  const cellRender: CalendarProps<Dayjs>['cellRender'] = (current, info) => {
    if (info.type === 'date') {
      return dateCellRender(current);
    }
    if (info.type === 'month') {
      return monthCellRender(current);
    }
    return info.originNode;
  };

  const handleDateSelect = (date: Dayjs) => {
    setSelectedDate(date);
  };

  const renderEventItem = (event: CalendarEvent) => {
    const isPast = isPastEvent(event.date_time);
    return (
      <List.Item
        key={event.id}
        className={`cursor-pointer hover:bg-gray-50 px-3 py-2 -mx-3 rounded transition-colors ${isPast ? 'opacity-60' : ''}`}
        onClick={() => navigate(`/events/${event.id}`)}
      >
        <div className="w-full">
          <div className="flex items-center gap-2 mb-1">
            <Badge status={event.source === 'created' ? 'success' : 'processing'} />
            <Text strong className="text-sm">{event.title}</Text>
          </div>
          <div className="text-xs text-gray-500 ml-4 space-y-0.5">
            <div className="flex items-center gap-1">
              <ClockCircleOutlined />
              {dayjs(event.date_time).format('h:mm A')}
              {isMobile && ` - ${dayjs(event.date_time).format('MMM D')}`}
            </div>
            {event.location && (
              <div className="flex items-center gap-1">
                <EnvironmentOutlined />
                {event.location}
              </div>
            )}
          </div>
        </div>
      </List.Item>
    );
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isMobile) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <Title level={4} className="m-0 font-semibold">My Calendar</Title>
        </div>

        <div className="flex gap-3 text-xs mb-4">
          <span><Badge status="success" /> Created by me</span>
          <span><Badge status="processing" /> Attending</span>
        </div>

        {error && <Alert message={error} type="error" showIcon className="mb-4" />}

        {loading ? (
          <div className="text-center py-12">
            <Spin size="large" />
          </div>
        ) : upcomingEvents.length === 0 ? (
          <Empty description="No upcoming events" className="py-12" />
        ) : (
          <Card title="Upcoming Events" size="small">
            <List
              dataSource={upcomingEvents}
              renderItem={renderEventItem}
              split={false}
            />
          </Card>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <Title level={4} className="m-0 font-semibold">My Calendar</Title>
        <div className="flex gap-4 text-sm">
          <span><Badge status="success" /> Created by me</span>
          <span><Badge status="processing" /> Attending</span>
        </div>
      </div>

      {error && <Alert message={error} type="error" showIcon className="mb-4" />}

      {loading ? (
        <div className="text-center py-12">
          <Spin size="large" />
        </div>
      ) : (
        <div className="flex gap-6">
          <div className="flex-1">
            <Calendar cellRender={cellRender} onSelect={handleDateSelect} value={selectedDate} />
          </div>

          <div className="w-80 shrink-0">
            <Card
              title={
                <span className="flex items-center gap-2">
                  <CalendarOutlined />
                  {selectedDate.format('MMMM D, YYYY')}
                </span>
              }
              className="shadow-sm sticky top-6"
            >
              {selectedDateEvents.length === 0 ? (
                <Text type="secondary">No events on this date</Text>
              ) : (
                <List
                  dataSource={selectedDateEvents}
                  renderItem={renderEventItem}
                  split={false}
                />
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
