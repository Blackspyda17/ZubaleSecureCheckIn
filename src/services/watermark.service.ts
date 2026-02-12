import { Skia } from '@shopify/react-native-skia';
import { WatermarkData } from '../types';
import { CAMERA_CONFIG } from '../constants/config';
import { formatDateTime, formatCoordinates } from '../utils/format.utils';

/**
 * Apply a watermark with date/time and GPS coordinates onto an image.
 * Uses Skia canvas for high-performance image manipulation.
 * Returns the watermarked image as a base64 string.
 */
export async function applyWatermark(
  imageBase64: string,
  watermarkData: WatermarkData
): Promise<string> {
  // Decode the original image
  const imageData = Skia.Data.fromBase64(imageBase64);
  const originalImage = Skia.Image.MakeImageFromEncoded(imageData);

  if (!originalImage) {
    throw new Error('Failed to decode image for watermark');
  }

  const width = originalImage.width();
  const height = originalImage.height();

  // Create an offscreen surface to draw on
  const surface = Skia.Surface.MakeOffscreen(width, height)!;
  const canvas = surface.getCanvas();

  // Draw the original image
  const imagePaint = Skia.Paint();
  canvas.drawImage(originalImage, 0, 0, imagePaint);

  // Prepare watermark text
  const { WATERMARK_FONT_SIZE, WATERMARK_PADDING, WATERMARK_BG_OPACITY } =
    CAMERA_CONFIG;

  const fontSize = Math.max(WATERMARK_FONT_SIZE, width * 0.025);
  const padding = WATERMARK_PADDING;

  const lines = [
    formatDateTime(new Date(watermarkData.dateTime).getTime()),
    `GPS: ${formatCoordinates(watermarkData.latitude, watermarkData.longitude)}`,
  ];

  if (watermarkData.address) {
    lines.push(watermarkData.address);
  }

  const lineHeight = fontSize * 1.4;
  const blockHeight = lines.length * lineHeight + padding * 2;
  const blockY = height - blockHeight - padding;

  // Draw semi-transparent background
  const bgPaint = Skia.Paint();
  bgPaint.setColor(Skia.Color(`rgba(0, 0, 0, ${WATERMARK_BG_OPACITY})`));
  const bgRect = Skia.XYWHRect(0, blockY, width, blockHeight + padding);
  canvas.drawRect(bgRect, bgPaint);

  // Draw text lines
  const font = Skia.Font();
  font.setSize(fontSize);
  const textPaint = Skia.Paint();
  textPaint.setColor(Skia.Color('white'));

  lines.forEach((line, index) => {
    const y = blockY + padding + (index + 1) * lineHeight;
    canvas.drawText(line, padding, y, textPaint, font);
  });

  // Encode the result
  const snapshot = surface.makeImageSnapshot();
  const encoded = snapshot.encodeToBase64();

  return encoded;
}

/**
 * Generate watermark text lines for the camera overlay preview.
 * This is used to show a live preview before the photo is taken.
 */
export function getWatermarkPreviewLines(
  watermarkData: WatermarkData
): string[] {
  const lines = [
    formatDateTime(new Date(watermarkData.dateTime).getTime()),
    `GPS: ${formatCoordinates(watermarkData.latitude, watermarkData.longitude)}`,
  ];
  if (watermarkData.address) {
    lines.push(watermarkData.address);
  }
  return lines;
}
