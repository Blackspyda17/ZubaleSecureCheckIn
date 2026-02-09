import React, { useCallback, useState } from 'react';
import { View, Text, Image, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useCheckInStore } from '../../src/store/checkIn.store';
import { useSyncQueue } from '../../src/hooks/useSyncQueue';
import { CheckInButton } from '../../src/components/CheckIn/CheckInButton';
import { formatDateTime, formatCoordinates } from '../../src/utils/format.utils';
import { PendingSyncItem } from '../../src/types';

export default function PreviewScreen() {
  const router = useRouter();
  const { currentPhoto, setStep, setPhoto, isOnline } = useCheckInStore();
  const { addPendingItem, processQueue } = useSyncQueue();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!currentPhoto) return;

    setIsSubmitting(true);

    // Optimistic update: show success immediately
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const syncItem: PendingSyncItem = {
      id: currentPhoto.id,
      photo: currentPhoto,
      retryCount: 0,
      lastAttempt: null,
    };

    addPendingItem(syncItem);

    // Attempt immediate sync if online
    if (isOnline) {
      await processQueue();
    }

    setStep('done');
    setPhoto(null);
    setIsSubmitting(false);

    Alert.alert(
      'Check-In Submitted',
      isOnline
        ? 'Your check-in has been uploaded successfully.'
        : 'Your check-in has been saved and will sync when you are back online.',
      [
        {
          text: 'OK',
          onPress: () => router.replace('/check-in'),
        },
      ]
    );
  }, [currentPhoto, isOnline, addPendingItem, processQueue, setStep, setPhoto, router]);

  const handleRetake = useCallback(() => {
    setStep('camera');
    setPhoto(null);
    router.back();
  }, [setStep, setPhoto, router]);

  if (!currentPhoto) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No photo available</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Watermarked photo preview */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: currentPhoto.watermarkedUri || currentPhoto.uri }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Metadata */}
      <View style={styles.metadata}>
        <Text style={styles.metaLabel}>Captured At</Text>
        <Text style={styles.metaValue}>
          {formatDateTime(currentPhoto.capturedAt)}
        </Text>

        <Text style={styles.metaLabel}>GPS Coordinates</Text>
        <Text style={styles.metaValue}>
          {formatCoordinates(
            currentPhoto.watermark.latitude,
            currentPhoto.watermark.longitude
          )}
        </Text>

        {!isOnline && (
          <View style={styles.offlineBadge}>
            <Text style={styles.offlineText}>
              Will sync when online
            </Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <CheckInButton
          onPress={handleRetake}
          disabled={isSubmitting}
          isLoading={false}
          label="Retake Photo"
        />
        <CheckInButton
          onPress={handleSubmit}
          disabled={false}
          isLoading={isSubmitting}
          label={isOnline ? 'Submit Check-In' : 'Save for Later Sync'}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  imageContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  metadata: {
    padding: 16,
  },
  metaLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 8,
  },
  metaValue: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  offlineBadge: {
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    borderRadius: 8,
    padding: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  offlineText: {
    color: '#FF9800',
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    paddingBottom: 16,
    gap: 4,
  },
  errorText: {
    color: '#F44336',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});
