# Build Information - v1.0.0

## Build Details
- **Version:** 1.0.0 (Build 1)
- **Built:** February 11, 2026
- **Platform:** Android
- **Min SDK:** 21 (Android 5.0 Lollipop)
- **Target SDK:** 35 (Android 15)
- **Architecture:** Universal APK (armeabi-v7a, arm64-v8a, x86, x86_64)

## Build Method
```bash
npx expo run:android --variant release --no-install
```

Built using Expo SDK 54 with local Gradle build.

## Installation
1. Enable "Install from Unknown Sources" in Android settings:
   - Settings > Security > "Install unknown apps" for your browser or file manager
2. Download the APK to your device
3. Open the APK file to install
4. Grant Camera and Location permissions when prompted

## File Info
- **File:** ZubaleSecureCheckIn-v1.0.0-android.apk
- **Size:** 146 MB
- **SHA256:** `2c7e9969d8289b1fec81c438ec7208597f6585a4cd56742c42771fed1b954dc0`

## Testing Notes
- Update `TARGET_LOCATION` in `src/constants/config.ts` for testing at your location
- Default location: Golfito, Costa Rica (8.639, -83.162)
- To enable mock location detection testing:
  1. Enable "Developer Options" on your Android device
  2. Go to Settings > System > Developer Options
  3. Enable "Allow mock locations"
  4. The app will detect this and show a warning banner

## Required Permissions
- **CAMERA** - For check-in photo capture with custom camera interface
- **ACCESS_FINE_LOCATION** - For precise geofence verification
- **ACCESS_COARSE_LOCATION** - Fallback location
- **ACCESS_BACKGROUND_LOCATION** - Store proximity detection

## Technical Details
- React Native: 0.81.5
- Expo SDK: 54.0.33
- State Management: Zustand + MMKV
- Camera: expo-camera with custom watermark overlay
- Location: expo-location with geofencing
- Graphics: @shopify/react-native-skia for watermark rendering
- Animations: react-native-reanimated v4

## Known Limitations
- Unsigned APK (shows "unknown developer" warning on install)
- For Play Store distribution, sign with production keystore
- Universal APK size is larger than split APKs (includes all architectures)
