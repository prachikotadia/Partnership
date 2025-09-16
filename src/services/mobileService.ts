import { Capacitor } from '@capacitor/core';
import { 
  PushNotifications, 
  ActionPerformed, 
  PushNotificationSchema 
} from '@capacitor/push-notifications';
import { 
  LocalNotifications, 
  LocalNotificationSchema 
} from '@capacitor/local-notifications';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { App, AppState } from '@capacitor/app';
import { Network } from '@capacitor/network';
import { Device } from '@capacitor/device';
import { Share } from '@capacitor/share';

export class MobileService {
  private static instance: MobileService;
  private isNative: boolean;
  private deviceInfo: any = null;

  private constructor() {
    this.isNative = Capacitor.isNativePlatform();
    this.initialize();
  }

  public static getInstance(): MobileService {
    if (!MobileService.instance) {
      MobileService.instance = new MobileService();
    }
    return MobileService.instance;
  }

  private async initialize() {
    if (this.isNative) {
      await this.setupStatusBar();
      await this.setupKeyboard();
      await this.setupAppState();
      await this.setupNetwork();
      await this.loadDeviceInfo();
    }
  }

  // Status Bar Configuration
  private async setupStatusBar() {
    try {
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#ffffff' });
    } catch (error) {
      console.log('Status bar setup failed:', error);
    }
  }

  // Keyboard Configuration
  private async setupKeyboard() {
    try {
      await Keyboard.setResizeMode({ mode: KeyboardResize.Body });
      await Keyboard.setScroll({ isDisabled: false });
    } catch (error) {
      console.log('Keyboard setup failed:', error);
    }
  }

  // App State Management
  private async setupAppState() {
    try {
      App.addListener('appStateChange', ({ isActive }) => {
        console.log('App state changed. Is active?', isActive);
        // Handle app state changes (foreground/background)
      });

      App.addListener('appUrlOpen', (event) => {
        console.log('App opened with URL:', event.url);
        // Handle deep links
      });
    } catch (error) {
      console.log('App state setup failed:', error);
    }
  }

  // Network Monitoring
  private async setupNetwork() {
    try {
      Network.addListener('networkStatusChange', status => {
        console.log('Network status changed:', status);
        // Handle network connectivity changes
      });
    } catch (error) {
      console.log('Network setup failed:', error);
    }
  }

  // Device Information
  private async loadDeviceInfo() {
    try {
      this.deviceInfo = await Device.getInfo();
      console.log('Device info:', this.deviceInfo);
    } catch (error) {
      console.log('Device info failed:', error);
    }
  }

  // Push Notifications
  public async initializePushNotifications() {
    if (!this.isNative) return;

    try {
      // Request permissions
      const permStatus = await PushNotifications.requestPermissions();
      
      if (permStatus.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        await PushNotifications.register();
      }

      // Listen for registration
      PushNotifications.addListener('registration', (token) => {
        console.log('Registration token: ', token.value);
        // Send token to your server
      });

      // Listen for registration errors
      PushNotifications.addListener('registrationError', (err) => {
        console.error('Registration error: ', err.error);
      });

      // Listen for push notifications
      PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
        console.log('Push notification received: ', notification);
        // Handle received notification
      });

      // Listen for push notification actions
      PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
        console.log('Push notification action performed', notification.actionId, notification.inputValue);
        // Handle notification action
      });
    } catch (error) {
      console.log('Push notifications setup failed:', error);
    }
  }

  // Local Notifications
  public async scheduleLocalNotification(notification: LocalNotificationSchema) {
    if (!this.isNative) return;

    try {
      await LocalNotifications.schedule({ notifications: [notification] });
    } catch (error) {
      console.log('Local notification failed:', error);
    }
  }

  // Haptic Feedback
  public async triggerHaptic(style: ImpactStyle = ImpactStyle.Medium) {
    if (!this.isNative) return;

    try {
      await Haptics.impact({ style });
    } catch (error) {
      console.log('Haptic feedback failed:', error);
    }
  }

  // Share Content
  public async shareContent(title: string, text: string, url?: string) {
    if (!this.isNative) return;

    try {
      await Share.share({
        title,
        text,
        url,
      });
    } catch (error) {
      console.log('Share failed:', error);
    }
  }

  // Utility Methods
  public isNativeApp(): boolean {
    return this.isNative;
  }

  public getDeviceInfo() {
    return this.deviceInfo;
  }

  public getPlatform(): string {
    return Capacitor.getPlatform();
  }

  // Check if app is running on iOS
  public isIOS(): boolean {
    return this.getPlatform() === 'ios';
  }

  // Check if app is running on Android
  public isAndroid(): boolean {
    return this.getPlatform() === 'android';
  }

  // Check if app is running on web
  public isWeb(): boolean {
    return this.getPlatform() === 'web';
  }
}

export const mobileService = MobileService.getInstance();
