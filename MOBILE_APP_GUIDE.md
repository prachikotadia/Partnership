# Together - Mobile App Development Guide

This guide will help you convert the Together web application into native iOS and Android apps for the App Store and Google Play Store.

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **Android Studio** (for Android development)
4. **Xcode** (for iOS development - macOS only)
5. **Java Development Kit (JDK)** (for Android)

### Installation

```bash
# Install dependencies
npm install

# Build the web app
npm run build

# Sync with Capacitor
npm run cap:sync
```

## 📱 Platform Setup

### Android Setup

1. **Install Android Studio**
   - Download from [developer.android.com](https://developer.android.com/studio)
   - Install Android SDK and build tools

2. **Set up environment variables**
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

3. **Build and run Android app**
   ```bash
   npm run build:android
   ```

### iOS Setup (macOS only)

1. **Install Xcode**
   - Download from the Mac App Store
   - Install Xcode Command Line Tools: `xcode-select --install`

2. **Install CocoaPods**
   ```bash
   sudo gem install cocoapods
   ```

3. **Build and run iOS app**
   ```bash
   npm run build:ios
   ```

## 🛠️ Available Scripts

```bash
# Development
npm run dev                    # Start development server
npm run build                  # Build web app for production
npm run build:dev              # Build web app for development

# Mobile Development
npm run cap:add:ios            # Add iOS platform
npm run cap:add:android        # Add Android platform
npm run cap:sync               # Sync web assets to native projects
npm run cap:copy               # Copy web assets to native projects
npm run cap:open:ios           # Open iOS project in Xcode
npm run cap:open:android       # Open Android project in Android Studio
npm run cap:run:ios            # Run iOS app on simulator/device
npm run cap:run:android        # Run Android app on emulator/device

# Mobile Build Scripts
npm run build:mobile           # Build web app and sync with Capacitor
npm run build:ios              # Build and open iOS project
npm run build:android          # Build and open Android project
```

## 📋 App Store Preparation

### App Store (iOS)

1. **Apple Developer Account**
   - Sign up at [developer.apple.com](https://developer.apple.com)
   - Enroll in Apple Developer Program ($99/year)

2. **App Store Connect Setup**
   - Create new app in App Store Connect
   - Set app name: "Together - Partner Collaboration"
   - Bundle ID: `com.together.partnercollaboration`
   - Category: Productivity or Social Networking

3. **App Icons and Screenshots**
   - Generate app icons using the provided SVG files
   - Create screenshots for different device sizes
   - Required sizes: iPhone, iPad, Apple Watch (if applicable)

4. **App Store Listing**
   - App name: "Together - Partner Collaboration"
   - Subtitle: "Strengthen your relationship with shared tasks, notes, and goals"
   - Description: "Together is a comprehensive partner collaboration platform designed to help couples and partners stay connected, organized, and engaged. Features include shared task management, collaborative note-taking, financial planning, streak tracking, and real-time synchronization across all devices."

### Google Play Store (Android)

1. **Google Play Console Account**
   - Sign up at [play.google.com/console](https://play.google.com/console)
   - Pay one-time $25 registration fee

2. **Play Console Setup**
   - Create new app in Play Console
   - Set app name: "Together - Partner Collaboration"
   - Package name: `com.together.partnercollaboration`
   - Category: Productivity or Social

3. **App Icons and Screenshots**
   - Generate app icons using the provided SVG files
   - Create screenshots for different device sizes
   - Required sizes: Phone, Tablet, TV (if applicable)

4. **Play Store Listing**
   - App name: "Together - Partner Collaboration"
   - Short description: "Strengthen your relationship with shared tasks, notes, and goals"
   - Full description: "Together is a comprehensive partner collaboration platform designed to help couples and partners stay connected, organized, and engaged. Features include shared task management, collaborative note-taking, financial planning, streak tracking, and real-time synchronization across all devices."

## 🎨 App Assets

### App Icons
- **Source**: `public/icons/icon.svg`
- **Required sizes**:
  - iOS: 1024x1024 (App Store), 180x180, 167x167, 152x152, 120x120, 87x87, 80x80, 76x76, 60x60, 58x58, 40x40, 29x29, 20x20
  - Android: 512x512 (Play Store), 192x192, 144x144, 96x96, 72x72, 48x48, 36x36

### Splash Screen
- **Source**: `public/icons/splash.svg`
- **Required sizes**:
  - iOS: 2048x2732, 1668x2388, 1536x2048, 1125x2436, 1242x2688, 750x1334, 640x1136
  - Android: 1080x1920, 720x1280, 480x800

### Screenshots
Create screenshots showcasing:
1. Login/Authentication screen
2. Dashboard overview
3. Task management interface
4. Notes and collaboration features
5. Financial planning tools
6. Streak tracking and engagement

## 🔧 Configuration

### Capacitor Configuration
The app is configured in `capacitor.config.ts`:
- **App ID**: `com.together.partnercollaboration`
- **App Name**: "Together - Partner Collaboration"
- **Web Directory**: `dist`

### Mobile Features
The app includes the following mobile-specific features:
- Push notifications
- Local notifications
- Haptic feedback
- Network status monitoring
- App state management
- Device information
- Share functionality
- Camera integration
- File system access

## 🚀 Deployment Process

### 1. Build for Production
```bash
npm run build
npm run cap:sync
```

### 2. iOS Deployment
```bash
npm run build:ios
# Open Xcode project and:
# 1. Set signing team and bundle identifier
# 2. Build for device/simulator
# 3. Archive for App Store
# 4. Upload to App Store Connect
```

### 3. Android Deployment
```bash
npm run build:android
# Open Android Studio and:
# 1. Generate signed APK/AAB
# 2. Upload to Google Play Console
```

## 📱 Testing

### iOS Testing
- Use Xcode Simulator for basic testing
- Test on physical devices for full functionality
- Test push notifications on device

### Android Testing
- Use Android Studio Emulator for basic testing
- Test on physical devices for full functionality
- Test push notifications on device

## 🔐 Security Considerations

1. **API Keys**: Store securely in environment variables
2. **User Data**: Implement proper encryption for sensitive data
3. **Authentication**: Use secure token-based authentication
4. **Network**: Use HTTPS for all API calls
5. **Permissions**: Request only necessary permissions

## 📊 Analytics and Monitoring

Consider integrating:
- **Firebase Analytics** for user behavior tracking
- **Crashlytics** for crash reporting
- **Performance Monitoring** for app performance
- **Push Notification Analytics** for engagement metrics

## 🆘 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall

2. **Capacitor Sync Issues**
   - Ensure web app builds successfully first
   - Check Capacitor configuration
   - Verify platform-specific dependencies

3. **iOS Issues**
   - Ensure Xcode is properly installed
   - Check CocoaPods installation
   - Verify signing certificates

4. **Android Issues**
   - Check Android SDK installation
   - Verify environment variables
   - Ensure proper permissions in manifest

## 📞 Support

For issues related to:
- **Capacitor**: [capacitorjs.com/docs](https://capacitorjs.com/docs)
- **React**: [reactjs.org/docs](https://reactjs.org/docs)
- **Vite**: [vitejs.dev/guide](https://vitejs.dev/guide)
- **App Store**: [developer.apple.com/support](https://developer.apple.com/support)
- **Play Store**: [support.google.com/googleplay](https://support.google.com/googleplay)

## 🎯 Next Steps

1. **Complete Development**: Finish any remaining features
2. **Testing**: Comprehensive testing on both platforms
3. **App Store Submission**: Submit to both stores
4. **Marketing**: Prepare marketing materials and launch strategy
5. **Updates**: Plan for future updates and feature additions

---

**Good luck with your mobile app launch! 🚀**
