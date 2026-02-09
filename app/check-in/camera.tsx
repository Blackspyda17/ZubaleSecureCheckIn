import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useCheckInStore } from '../../src/store/checkIn.store';
import { CustomCameraView } from '../../src/components/Camera/CameraView';
import { applyWatermark } from '../../src/services/watermark.service';
import { savePhotoLocally } from '../../src/services/camera.service';
import { formatDateTime, formatCoordinates, generateId } from '../../src/utils/format.utils';
import { TARGET_LOCATION } from '../../src/constants/config';
import { WatermarkData, CheckInPhoto } from '../../src/types';

export default function CameraScreen() {
  const router = useRouter();
  const { currentLocation, geofence, setPhoto, setStep } = useCheckInStore();

  const watermarkData: WatermarkData = {
    dateTime: new Date().toISOString(),
    latitude: currentLocation?.coords.latitude ?? 0,
    longitude: currentLocation?.coords.longitude ?? 0,
    address: TARGET_LOCATION.address,
  };

  const handlePhotoCaptured = useCallback(
    async (base64: string) => {
      try {
        // Apply watermark to the captured photo
        const watermarkedBase64 = await applyWatermark(base64, {
          ...watermarkData,
          dateTime: new Date().toISOString(), // Update to capture time
        });

        // Save both original and watermarked locally
        const photoId = generateId();
        const originalUri = await savePhotoLocally(
          base64,
          `${photoId}-original`
        );
        const watermarkedUri = await savePhotoLocally(
          watermarkedBase64,
          `${photoId}-watermarked`
        );

        const photo: CheckInPhoto = {
          id: photoId,
          uri: originalUri,
          watermarkedUri,
          watermark: {
            dateTime: new Date().toISOString(),
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
        Alert.alert(
          'Error',
          'Failed to process photo. Please try again.',
          [{ text: 'OK' }]
        );
      }
    },
    [watermarkData, currentLocation, setPhoto, setStep, router]
  );

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
