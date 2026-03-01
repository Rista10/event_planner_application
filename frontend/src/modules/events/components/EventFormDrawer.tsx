import { type ReactNode, useState, useEffect } from 'react';
import { Drawer, Form, Input, Button, DatePicker, Switch, Select, Typography, App, Spin } from 'antd';
import { useTags } from '../../../hooks/useTags';
import { createEvent, updateEvent, getEvent } from '../../../services/events';
import type { CreateEventData, UpdateEventData, EventItem } from '../../../types/events';
import { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../../../types/api';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;

interface EventFormValues {
  title: string;
  description?: string;
  date_time: dayjs.Dayjs;
  location?: string;
  is_public: boolean;
  tag_ids: string[];
}

interface EventFormDrawerProps {
  open: boolean;
  eventId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function EventFormDrawer({ open, eventId, onClose, onSuccess }: EventFormDrawerProps): ReactNode {
  const isEdit = Boolean(eventId);
  const { message } = App.useApp();
  const { tags, loading: tagsLoading } = useTags();
  const [form] = Form.useForm<EventFormValues>();
  const [loading, setLoading] = useState(false);
  const [fetchingEvent, setFetchingEvent] = useState(false);

  useEffect(() => {
    if (open && isEdit && eventId) {
      setFetchingEvent(true);
      getEvent(eventId)
        .then((event: EventItem) => {
          form.setFieldsValue({
            title: event.title,
            description: event.description || undefined,
            date_time: dayjs(event.date_time),
            location: event.location || undefined,
            is_public: event.is_public,
            tag_ids: event.tags.map((t) => t.id),
          });
        })
        .catch(() => message.error('Failed to load event'))
        .finally(() => setFetchingEvent(false));
    } else if (open && !isEdit) {
      form.resetFields();
    }
  }, [open, isEdit, eventId, form, message]);

  const handleClose = (): void => {
    form.resetFields();
    onClose();
  };

  const handleSubmit = async (values: EventFormValues): Promise<void> => {
    setLoading(true);
    try {
      if (isEdit && eventId) {
        const data: UpdateEventData = {
          title: values.title,
          description: values.description || null,
          date_time: values.date_time.toISOString(),
          location: values.location || null,
          is_public: values.is_public,
          tag_ids: values.tag_ids,
        };
        await updateEvent(eventId, data);
        message.success('Event updated successfully');
      } else {
        const data: CreateEventData = {
          title: values.title,
          description: values.description,
          date_time: values.date_time.toISOString(),
          location: values.location,
          is_public: values.is_public,
          tag_ids: values.tag_ids,
        };
        await createEvent(data);
        message.success('Event created successfully');
      }
      form.resetFields();
      onSuccess();
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data) {
        const apiError = err.response.data as ApiErrorResponse;
        message.error(apiError.error?.message || 'Failed to save event');
      } else {
        message.error('Failed to save event');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      title={
        <Title level={4} className="m-0">
          {isEdit ? 'Edit Event' : 'Create New Event'}
        </Title>
      }
      placement="right"
      size="large"
      onClose={handleClose}
      open={open}
      extra={
        <Button onClick={handleClose}>Cancel</Button>
      }
    >
      {fetchingEvent ? (
        <div className="text-center py-12">
          <Spin size="large" />
        </div>
      ) : (
        <Form<EventFormValues>
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ is_public: true, tag_ids: [] }}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="Event title" maxLength={255} />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea placeholder="Describe your event..." rows={4} maxLength={5000} showCount />
          </Form.Item>

          <Form.Item
            name="date_time"
            label="Date & Time"
            rules={[{ required: true, message: 'Please select a date and time' }]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              className="w-full"
              placeholder="Select date and time"
            />
          </Form.Item>

          <Form.Item name="location" label="Location">
            <Input placeholder="Event location" maxLength={500} />
          </Form.Item>

          <Form.Item name="is_public" label="Public Event" valuePropName="checked">
            <Switch checkedChildren="Public" unCheckedChildren="Private" />
          </Form.Item>

          <Form.Item name="tag_ids" label="Tags">
            <Select
              mode="multiple"
              placeholder="Select tags"
              loading={tagsLoading}
              allowClear
              optionFilterProp="label"
              options={tags.map((tag) => ({ value: tag.id, label: tag.name }))}
            />
          </Form.Item>

          <Form.Item className="mb-0 mt-6">
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              {isEdit ? 'Update Event' : 'Create Event'}
            </Button>
          </Form.Item>
        </Form>
      )}
    </Drawer>
  );
}
