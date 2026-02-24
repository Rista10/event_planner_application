import { type ReactNode } from 'react';
import { Result, Button, Typography } from 'antd';
import { HomeOutlined, LoginOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

const { Text } = Typography;

export function NotFoundPage(): ReactNode {
  const location = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] px-4">
      <div className="max-w-xl w-full bg-white rounded-lg shadow-sm border border-[#f0f0f0] p-8">
        <Result
          status="404"
          title="Page not found"
          subTitle={
            <Text type="secondary">
              The page <Text strong>{location.pathname}</Text> does not exist or may have been moved.
            </Text>
          }
          extra={[
            <Link key="home" to="/">
              <Button type="primary" icon={<HomeOutlined />}>
                Go to home
              </Button>
            </Link>,
            <Link key="login" to="/login">
              <Button icon={<LoginOutlined />}>Go to login</Button>
            </Link>,
          ]}
        />
      </div>
    </div>
  );
}
