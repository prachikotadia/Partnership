import React from 'react';
import { useResponsive } from '@/hooks/use-responsive';
import { DesktopLayout } from './DesktopLayout';
import { MobileLayout } from './MobileLayout';

interface ResponsiveLayoutProps {
  userName: string;
  partnerName: string;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ userName, partnerName }) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  if (isMobile) {
    return <MobileLayout userName={userName} partnerName={partnerName} />;
  }

  return <DesktopLayout userName={userName} partnerName={partnerName} />;
};
