import { type ReactNode } from 'react';
import { Typography } from 'antd';
import celebrationBg from '../../assets/event-planner.jpg';

const { Title, Text } = Typography;

interface AuthPageLayoutProps {
  children: ReactNode;
  heroTitle: string;
  heroSubtitle: string;
  maxWidth?: 'default' | 'wide';
}

export function AuthPageLayout({
  children,
  heroTitle,
  heroSubtitle,
  maxWidth = 'default',
}: AuthPageLayoutProps): ReactNode {
  const maxWidthClass = maxWidth === 'wide' ? 'max-w-[1400px]' : 'max-w-[1100px]';

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-page p-4">
      <div
        className={`w-full ${maxWidthClass} bg-white rounded-2xl shadow-lg flex flex-col lg:flex-row overflow-hidden`}
      >
        {/* Left - Image */}
        <div
          className="hidden lg:flex lg:flex-[1.5] relative items-end p-8 bg-cover bg-center"
          style={{ backgroundImage: `url(${celebrationBg})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/[.08] to-black/[.02]" />
          <div className="relative z-10 max-w-[420px]">
            <Title level={3} className="!text-white m-0 font-semibold leading-snug">
              {heroTitle}
            </Title>
            <Text className="!text-white/75 text-[15px] mt-2 block">{heroSubtitle}</Text>
          </div>
        </div>

        {/* Right - Content */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-8 lg:px-12 py-6 lg:py-8">
          {children}
        </div>
      </div>
    </div>
  );
}

interface AuthHeaderProps {
  subtitle?: string;
  title: string;
  description?: string;
}

export function AuthHeader({ subtitle, title, description }: AuthHeaderProps): ReactNode {
  return (
    <div className="mb-4 relative">
      <div className="flex justify-end mb-3 text-2xl font-semibold text-black">
        Event<span className="text-blue-500">Planner</span>
      </div>
      {subtitle && (
        <Text strong className="text-[13px] text-text-muted tracking-[0.5px] uppercase">
          {subtitle}
        </Text>
      )}
      <Title level={3} className="mt-2 mb-0 font-semibold">
        {title}
      </Title>
      {description && (
        <Text type="secondary" className="block mt-2">
          {description}
        </Text>
      )}
    </div>
  );
}

export function AuthBrandHeader(): ReactNode {
  return (
    <div className="mb-4 relative">
      <div className="flex justify-end mb-3 text-2xl font-semibold text-black">
        Event<span className="text-blue-500">Planner</span>
      </div>
    </div>
  );
}
