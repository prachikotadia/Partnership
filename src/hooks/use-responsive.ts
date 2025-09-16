import { useState, useEffect } from 'react';

export interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
}

export const useResponsive = (): ResponsiveState => {
  const [state, setState] = useState<ResponsiveState>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    screenWidth: 0,
    screenHeight: 0,
    orientation: 'landscape'
  });

  useEffect(() => {
    const updateResponsiveState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // More precise mobile detection
      const isMobile = width < 640; // sm breakpoint
      const isTablet = width >= 640 && width < 1024; // sm to lg
      const isDesktop = width >= 1024; // lg and above
      
      setState({
        isMobile,
        isTablet,
        isDesktop,
        screenWidth: width,
        screenHeight: height,
        orientation: width > height ? 'landscape' : 'portrait'
      });
    };

    updateResponsiveState();
    
    // Use passive listener for better performance
    window.addEventListener('resize', updateResponsiveState, { passive: true });
    
    return () => window.removeEventListener('resize', updateResponsiveState);
  }, []);

  return state;
};
