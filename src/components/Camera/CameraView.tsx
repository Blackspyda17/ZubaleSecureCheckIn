import React, { useRef, useCallback, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CameraView as ExpoCameraView, CameraType } from 'expo-camera';
import { CaptureButton } from './CaptureButton';
import { CompassOverlay } from './CompassOverlay';
import { getWatermarkPreviewLines } from '../../services/watermark.service';
import { WatermarkData } from '../../types';
import { formatDistance } from '../../utils/format.utils';

interface CameraViewProps {
  watermarkData: WatermarkData;
  bearingToTarget: number;
  distanceMeters: number;
  targetName: string;
  isWithinFence: boolean;
  onPhotoCaptured: (base64: string) => void;
}

/**
 * Custom camera view with watermark preview overlay and compass.
 * Does NOT use the system image picker - custom camera as required.
 * Overlays are rendered as siblings with absolute positioning (CameraView does not support children).
 */
export function CustomCameraView({
  watermarkData,
  bearingToTarget,
  distanceMeters,
  targetName,
  isWithinFence,
  onPhotoCaptured,
}: CameraViewProps) {
  const cameraRef = useRef<ExpoCameraView>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');

  const watermarkLines = getWatermarkPreviewLines(watermarkData);

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.5,
        exif: false,
      });

      if (photo?.base64) {
        onPhotoCaptured(photo.base64);
      }
    } catch (error) {
      // Photo capture failed - UI will remain in ready state
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, onPhotoCaptured]);

  const toggleFacing = useCallback(() => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  }, []);

  return (
    <View style={styles.container}>
      {/* Camera feed - no children allowed */}
      <ExpoCameraView ref={cameraRef} style={styles.camera} facing={facing} />

      {/* All overlays rendered as siblings with absolute positioning */}

      {/* Compass overlay - bonus feature */}
      <CompassOverlay
        bearingToTarget={bearingToTarget}
        distanceMeters={distanceMeters}
        targetName={targetName}
      />

      {/* Geofence status badge */}
      <View
        style={[
          styles.statusBadge,
          isWithinFence ? styles.withinFence : styles.outsideFence,
        ]}
      >
        <Text style={styles.statusText}>
          {isWithinFence
            ? `Within range (${formatDistance(distanceMeters)})`
            : `Out of range (${formatDistance(distanceMeters)})`}
        </Text>
      </View>

      {/* Watermark preview overlay */}
      <View style={styles.watermarkPreview}>
        {watermarkLines.map((line, index) => (
          <Text key={index} style={styles.watermarkText}>
            {line}
          </Text>
        ))}
      </View>

      {/* Bottom controls */}
      <View style={styles.controls}>
        <TouchableText onPress={toggleFacing} text="Flip" />
        <CaptureButton
          onCapture={handleCapture}
          disabled={!isWithinFence}
          isCapturing={isCapturing}
        />
        <View style={styles.placeholder} />
      </View>
    </View>
  );
}

function TouchableText({
  onPress,
  text,
}: {
  onPress: () => void;
  text: string;
}) {
  return (
    <Text onPress={onPress} style={styles.flipButton}>
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  statusBadge: {
    position: 'absolute',
    top: 60,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  withinFence: {
    backgroundColor: 'rgba(76, 175, 80, 0.85)',
  },
  outsideFence: {
    backgroundColor: 'rgba(244, 67, 54, 0.85)',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  watermarkPreview: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  watermarkText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  controls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  flipButton: {
    color: '#fff',
    fontSize: 16,
    padding: 10,
  },
  placeholder: {
    width: 40,
  },
});
