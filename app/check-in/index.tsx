import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useGeofence } from '../../src/hooks/useGeofence';
import { useNetworkStatus } from '../../src/hooks/useNetworkStatus';
import { useSyncQueue } from '../../src/hooks/useSyncQueue';
import { useCheckInStore } from '../../src/store/checkIn.store';
import { GeofenceIndicator } from '../../src/components/CheckIn/GeofenceIndicator';
import { CheckInButton } from '../../src/components/CheckIn/CheckInButton';
import { MockLocationBanner } from '../../src/components/CheckIn/MockLocationBanner';
import { StatusBanner } from '../../src/components/common/StatusBanner';
import { LoadingSkeleton } from '../../src/components/common/LoadingSkeleton';

export default function CheckInScreen() {
  const router = useRouter();

  const {
    currentLocation,
    geofence,
    isMockDetected,
    mockReason,
    locationError,
    targetLocation,
  } = useGeofence();

  const { isOnline } = useNetworkStatus();
  const { pendingCount } = useSyncQueue();
  const { step, setStep } = useCheckInStore();

  const canCheckIn = useMemo(
    () => geofence.isWithinFence && !isMockDetected && currentLocation !== null,
    [geofence.isWithinFence, isMockDetected, currentLocation]
  );

  const handleCheckIn = useCallback(() => {
    if (!canCheckIn) {
      if (isMockDetected) {
        Alert.alert(
          'Security Warning',
          'Mock location detected. Please disable fake GPS apps to continue.',
          [{ text: 'OK' }]
        );
        return;
      }
      if (!geofence.isWithinFence) {
        Alert.alert(
          'Out of Range',
          `You must be within ${targetLocation.radiusMeters}m of ${targetLocation.name} to check in.`,
          [{ text: 'OK' }]
        );
        return;
      }
      return;
    }

    setStep('camera');
    router.push('/check-in/camera');
  }, [canCheckIn, isMockDetected, geofence.isWithinFence, targetLocation, setStep, router]);

  const isLoading = currentLocation === null && !locationError;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBanner isOnline={isOnline} pendingSyncCount={pendingCount} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Secure Check-In</Text>
          <Text style={styles.subtitle}>
            {targetLocation.name}
          </Text>
          <Text style={styles.address}>{targetLocation.address}</Text>
        </View>

        {/* Location Error */}
        {locationError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{locationError}</Text>
          </View>
        )}

        {/* Loading State */}
        {isLoading && <LoadingSkeleton message="Acquiring GPS signal..." />}

        {/* Mock Location Warning */}
        <MockLocationBanner
          isVisible={isMockDetected}
          reason={mockReason}
        />

        {/* Geofence Indicator */}
        {currentLocation && (
          <GeofenceIndicator
            distanceMeters={geofence.distanceMeters}
            radiusMeters={targetLocation.radiusMeters}
            isWithinFence={geofence.isWithinFence}
            accuracy={currentLocation.accuracy}
          />
        )}

        {/* Check-In Info */}
        {currentLocation && (
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Your Coordinates</Text>
            <Text style={styles.infoValue}>
              {currentLocation.coords.latitude.toFixed(6)},{' '}
              {currentLocation.coords.longitude.toFixed(6)}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Check-In Button - fixed at bottom */}
      <View style={styles.bottomActions}>
        <CheckInButton
          onPress={handleCheckIn}
          disabled={!canCheckIn}
          isLoading={false}
          label={
            isMockDetected
              ? 'Mock GPS Detected'
              : !geofence.isWithinFence
                ? 'Move Closer to Store'
                : 'Take Check-In Photo'
          }
        />
      </View>
    </SafeAreaView>
  );
}

export const unstable_settings = {
  initialRouteName: 'index',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  header: {
    padding: 24,
    paddingBottom: 8,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  address: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    marginTop: 2,
  },
  errorContainer: {
    backgroundColor: 'rgba(244, 67, 54, 0.15)',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  errorText: {
    color: '#F44336',
    fontSize: 13,
  },
  infoCard: {
    backgroundColor: '#1E1E2E',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  infoLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'monospace',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 34,
    paddingTop: 8,
    backgroundColor: '#0f0f23',
  },
});
