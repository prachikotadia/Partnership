import { useEffect, useState } from 'react';
import { mobileService } from '@/services/mobileService';
import { Network } from '@capacitor/network';
import { App } from '@capacitor/app';

export const useMobile = () => {
  const [isNative, setIsNative] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [appState, setAppState] = useState<'active' | 'inactive' | 'background'>('active');
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  useEffect(() => {
    // Initialize mobile service
    const initMobile = async () => {
      setIsNative(mobileService.isNativeApp());
      setDeviceInfo(mobileService.getDeviceInfo());
      
      // Initialize push notifications if native
      if (mobileService.isNativeApp()) {
        await mobileService.initializePushNotifications();
      }
    };

    initMobile();

    // Network status listener
    const networkListener = Network.addListener('networkStatusChange', status => {
      setIsOnline(status.connected);
    });

    // App state listener
    const appStateListener = App.addListener('appStateChange', ({ isActive }) => {
      setAppState(isActive ? 'active' : 'background');
    });

    return () => {
      networkListener.remove();
      appStateListener.remove();
    };
  }, []);

  return {
    isNative,
    isOnline,
    appState,
    deviceInfo,
    platform: mobileService.getPlatform(),
    isIOS: mobileService.isIOS(),
    isAndroid: mobileService.isAndroid(),
    isWeb: mobileService.isWeb(),
    triggerHaptic: mobileService.triggerHaptic.bind(mobileService),
    shareContent: mobileService.shareContent.bind(mobileService),
    scheduleNotification: mobileService.scheduleLocalNotification.bind(mobileService),
  };
};
