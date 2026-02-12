# ZubaleSecureCheckIn

**Secure Check-In Module** - Zubale Senior Mobile Engineer Technical Challenge (Option 3: "The Secure Enforcer")

A React Native app that verifies physical presence at a store location via geofencing, captures photos with a custom camera (no system picker), and burns GPS/date watermarks onto images for anti-fraud.

## Demo

### Check-In Flow
Full check-in process: geofence verification, camera capture, GPS watermark applied, and photo submission with offline support.

[Watch Demo Video](https://drive.google.com/file/d/1RQ1WmQ4RCTUVVAm8pbmWhmPwiGpL29oi/view?usp=sharing)

### Mock Location Detection (Bonus)
Detecting and blocking fake GPS locations using Android system flags and teleportation heuristics (impossible speed between location updates).

[Watch Demo Video](https://drive.google.com/file/d/1JbRDQJPQhCEZ2xmL7OonS_jaJntJK-Bo/view?usp=sharing)

---

## Architecture Overview

```
app/                    # Expo Router - file-based navigation
src/
  components/           # Presentational UI components
    Camera/             # CameraView, CaptureButton, CompassOverlay
    CheckIn/            # GeofenceIndicator, CheckInButton, MockLocationBanner
    common/             # StatusBanner, LoadingSkeleton
  hooks/                # Custom hooks (business logic bridge)
    useGeofence.ts      # Location tracking + distance calculation
    useCompass.ts       # Magnetometer heading for compass overlay
    useNetworkStatus.ts # Online/offline detection
    useSyncQueue.ts     # Offline sync queue management
  services/             # Data layer (hardware + network)
    location.service    # GPS operations via expo-location
    camera.service      # Photo capture + local storage
    watermark.service   # Skia canvas manipulation
    sync.service        # Offline queue + mock server
    mockDetector.service # Fake GPS detection
  store/                # Zustand + MMKV persistence
  utils/                # Pure functions (Haversine, formatting)
  types/                # Shared TypeScript interfaces
  constants/            # Configuration (target location, thresholds)
```

## Download & Install

### Android APK

**Note**: Due to the APK size (146 MB), download it from [GitHub Releases](https://github.com/Blackspyda17/ZubaleSecureCheckIn/releases/tag/v1.0.0)

#### Installation Steps

1. **Enable Unknown Sources**
   - Go to Settings > Security (or Apps & Notifications > Special app access)
   - Enable "Install unknown apps" for your browser or file manager

2. **Download & Install**
   - Download the APK from GitHub Releases
   - Open the APK file on your Android device
   - Tap "Install"

3. **Grant Permissions**
   - When prompted, grant Camera and Location permissions
   - Both are required for the app to function

4. **Test the Geofence**
   - The default target location is in Golfito, Costa Rica (8.639°, -83.162°)
   - To test at your location: modify `TARGET_LOCATION` in `src/constants/config.ts` and rebuild

#### System Requirements
- Android 5.0 (Lollipop) or higher (API 21+)
- 150+ MB free storage
- GPS and Camera hardware
- Internet connection (for sync; offline mode supported)

#### Build Information
See [BUILD_INFO.md](./releases/v1.0.0/BUILD_INFO.md) for detailed build metadata, SHA256 checksum, and technical specifications.

---

### Key Architectural Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| **Framework** | Expo SDK 54 + dev-client | Full native access + superior DX + EAS builds + OTA-ready. Justified over bare RN CLI because expo-camera, expo-location, expo-sensors provide everything needed for hardware integration. |
| **Language** | TypeScript (strict) | Type safety at compile time, better refactoring, industry standard for production RN apps. |
| **State Management** | Zustand + MMKV | Zustand: minimal boilerplate, selector-based re-renders. MMKV: 30x faster than AsyncStorage (rubric mentions it explicitly). Combined via `persist` middleware. |
| **Camera** | expo-camera (CameraView) | Custom camera view, NOT system picker. Supports overlay rendering for compass and watermark preview. |
| **Watermark** | @shopify/react-native-skia | Production-grade 2D rendering. Draws text overlay (date/time + GPS coords) directly onto captured image bytes. |
| **Navigation** | expo-router v6 | File-based routing, deep linking built-in, modern Expo standard. |
| **Offline Strategy** | Queue + MMKV + NetInfo | Check-ins saved locally when offline, auto-synced with exponential backoff when connection returns. Persistent across app kills. |

### Rubric Alignment

**1. Architecture & Offline-First (25%)**
- Layered architecture: UI (components) -> Logic (hooks) -> Data (services/store)
- MMKV persistence survives app kills
- Offline sync queue with retry + exponential backoff
- Network status monitoring with auto-sync on reconnect

**2. Performance & Optimization (25%)**
- `useCallback`/`useMemo` throughout to prevent re-renders
- Zustand selectors for granular subscriptions
- Reanimated for 60fps animations (on UI thread)
- Skia for off-thread image processing

**3. UX & Polish (25%)**
- Haptic feedback on capture and check-in
- Animated geofence distance indicator
- Loading skeleton while GPS acquires fix
- Offline/online status banner
- Optimistic updates (check-in shows success immediately)

**4. Seniority / Bonus Points (25%)**
- Mock Location Detector (system flag + teleportation heuristic)
- Compass Overlay pointing to target store (magnetometer)

## Getting Started

### Prerequisites

- Node.js 18+ (via nvm: `nvm use --lts`)
- Watchman: `brew install watchman`
- iOS: Xcode 15+, CocoaPods
- Android: Android Studio, JDK 17

### Install & Run

```bash
# Install dependencies
npm install

# iOS
npx expo run:ios

# Android
npx expo run:android

# Development server (Expo Go - limited, use dev build for camera/location)
npx expo start --dev-client
```

### Run Tests

```bash
# Unit tests (utils, services)
npm test

# TypeScript check
npm run lint
```

### Build from Source

#### Development Build
```bash
# Run on connected device/emulator
npx expo run:android  # Android
npx expo run:ios      # iOS
```

#### Production APK
```bash
# Build release APK (unsigned)
npx expo run:android --variant release --no-install

# Output: android/app/build/outputs/apk/release/app-release.apk
```

**Note**: The unsigned APK is sufficient for testing on real devices. For Google Play Store distribution, sign with a production keystore using `jarsigner` or configure signing in `android/app/build.gradle`.

## Testing the Geofence

### Quick Test (Pre-built APK)
1. [Download the APK from GitHub Releases](https://github.com/[username]/ZubaleSecureCheckIn/releases/tag/v1.0.0)
2. Install on your Android device (see [installation instructions above](#download--install))
3. The app uses the default location in Golfito, Costa Rica
4. To test at your location, you'll need to build from source (see below)

### Testing from Source

The target location is configured in `src/constants/config.ts`:

```typescript
export const TARGET_LOCATION = {
  coords: { latitude: 8.639, longitude: -83.162 },
  name: 'Zubale Store - Golfito',
  radiusMeters: 500,
};
```

**To test:**
1. Change coordinates to a location near you
2. Run the app on a physical device
3. Walk within 500m of the target to enable check-in
4. For emulator testing: use Android Studio's "Set Location" feature

**To test mock detection:**
1. Enable Developer Options on Android
2. Enable "Allow mock locations"
3. Use a fake GPS app - the banner should appear

**To test offline:**
1. Take a check-in photo while online
2. Enable airplane mode
3. Take another check-in
4. Disable airplane mode - pending check-ins auto-sync

## Tech Stack

- React Native 0.81 / Expo SDK 54
- TypeScript 5.9 (strict)
- Zustand 5 + MMKV 4
- expo-camera, expo-location, expo-sensors
- @shopify/react-native-skia
- react-native-reanimated 4
- @tanstack/react-query 5
- Jest + Testing Library
