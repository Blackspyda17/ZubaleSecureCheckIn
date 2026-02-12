import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Pressable,
  Linking,
  ActivityIndicator,
  InteractionManager,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCameraPermissions } from 'expo-camera';
import { useCheckInStore } from '../../src/store/checkIn.store';
import { CustomCameraView } from '../../src/components/Camera/CameraView';
import { applyWatermark } from '../../src/services/watermark.service';
import { savePhotoLocally } from '../../src/services/camera.service';
import { generateId } from '../../src/utils/format.utils';
import { TARGET_LOCATION } from '../../src/constants/config';
import { WatermarkData, CheckInPhoto } from '../../src/types';

export default function CameraScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const { currentLocation, geofence, setPhoto, setStep } = useCheckInStore();

  const watermarkData: WatermarkData = {
    dateTime: new Date().toISOString(),
    latitude: currentLocation?.coords.latitude ?? 0,
    longitude: currentLocation?.coords.longitude ?? 0,
    address: TARGET_LOCATION.address,
  };

  const handlePhotoCaptured = useCallback(
    async (base64: string) => {
      setIsProcessing(true);

      // Let the loading overlay render before starting heavy processing
      InteractionManager.runAfterInteractions(async () => {
        try {
          const captureTime = new Date().toISOString();
          const photoId = generateId();

          // Save original photo immediately (fast)
          const originalUri = await savePhotoLocally(
            base64,
            `${photoId}-original`
          );

          // Apply watermark (CPU-intensive)
          const watermarkedBase64 = await applyWatermark(base64, {
            ...watermarkData,
            dateTime: captureTime,
          });

          // Save watermarked version
          const watermarkedUri = await savePhotoLocally(
            watermarkedBase64,
            `${photoId}-watermarked`
          );

          const photo: CheckInPhoto = {
            id: photoId,
            uri: originalUri,
            watermarkedUri,
            watermark: {
              dateTime: captureTime,
              latitude: currentLocation?.coords.latitude ?? 0,
              longitude: currentLocation?.coords.longitude ?? 0,
              address: TARGET_LOCATION.address,
            },
            capturedAt: Date.now(),
            syncStatus: 'pending',
          };

          setPhoto(photo);
          setStep('preview');
          router.replace('/check-in/preview');
        } catch (error) {
          setIsProcessing(false);
          Alert.alert(
            'Error',
            'Failed to process photo. Please try again.',
            [{ text: 'OK' }]
          );
        }
      });
    },
    [watermarkData, currentLocation, setPhoto, setStep, router]
  );

  // Still loading permission status
  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.message}>Initializing camera...</Text>
      </View>
    );
  }

  // Permission not granted
  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Camera Access Required</Text>
        <Text style={styles.message}>
          We need camera access to take check-in photos with GPS watermarks.
        </Text>
        {permission.canAskAgain ? (
          <Pressable style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Grant Permission</Text>
          </Pressable>
        ) : (
          <Pressable
            style={styles.button}
            onPress={() => Linking.openSettings()}
          >
            <Text style={styles.buttonText}>Open Settings</Text>
          </Pressable>
        )}
        <Pressable
          style={[styles.button, styles.secondaryButton]}
          onPress={() => router.back()}
        >
          <Text style={[styles.buttonText, styles.secondaryText]}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomCameraView
        watermarkData={watermarkData}
        bearingToTarget={geofence.bearing}
        distanceMeters={geofence.distanceMeters}
        targetName={TARGET_LOCATION.name}
        isWithinFence={geofence.isWithinFence}
        onPhotoCaptured={handlePhotoCaptured}
      />

      {/* Processing overlay */}
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <View style={styles.processingCard}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.processingTitle}>Processing Photo</Text>
            <Text style={styles.processingSubtitle}>
              Applying GPS watermark...
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    color: '#aaa',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#555',
  },
  secondaryText: {
    color: '#aaa',
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    minWidth: 220,
  },
  processingTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 6,
  },
  processingSubtitle: {
    color: '#aaa',
    fontSize: 14,
  },
});
