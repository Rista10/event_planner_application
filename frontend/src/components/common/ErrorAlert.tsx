import { type ReactNode } from 'react';
import { Alert, Button, Space } from 'antd';
import { ReloadOutlined, WifiOutlined } from '@ant-design/icons';

interface ErrorAlertProps {
  message: string;
  description?: string;
  type?: 'error' | 'warning' | 'info';
  showIcon?: boolean;
  isNetworkError?: boolean;
  onRetry?: () => void;
  className?: string;
}

/**
 * Reusable error alert component with retry functionality
 */
export function ErrorAlert({
  message,
  description,
  type = 'error',
  showIcon = true,
  isNetworkError = false,
  onRetry,
  className,
}: ErrorAlertProps): ReactNode {
  const icon = isNetworkError ? <WifiOutlined /> : undefined;

  const action = onRetry ? (
    <Button size="small" type="link" onClick={onRetry} icon={<ReloadOutlined />}>
      Try again
    </Button>
  ) : undefined;

  return (
    <Alert
      message={message}
      description={description}
      type={type}
      showIcon={showIcon}
      icon={icon}
      action={action}
      className={className}
    />
  );
}

interface ErrorStateProps {
  title?: string;
  message: string;
  isNetworkError?: boolean;
  onRetry?: () => void;
}

/**
 * Full-page error state component
 */
export function ErrorState({
  title = 'Something went wrong',
  message,
  isNetworkError = false,
  onRetry,
}: ErrorStateProps): ReactNode {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-6xl mb-4">{isNetworkError ? '📡' : '😕'}</div>
      <h2 className="text-xl font-semibold text-text-primary mb-2">{title}</h2>
      <p className="text-text-muted mb-6 max-w-md">{message}</p>
      {onRetry && (
        <Space>
          <Button type="primary" onClick={onRetry} icon={<ReloadOutlined />}>
            Try again
          </Button>
        </Space>
      )}
    </div>
  );
}

interface InlineErrorProps {
  message: string;
  className?: string;
}

/**
 * Small inline error message
 */
export function InlineError({ message, className }: InlineErrorProps): ReactNode {
  return <span className={`text-error text-sm ${className || ''}`}>{message}</span>;
}
