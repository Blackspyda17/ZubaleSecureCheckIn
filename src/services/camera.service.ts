import { Camera } from 'expo-camera';
import {
  documentDirectory,
  getInfoAsync,
  makeDirectoryAsync,
  writeAsStringAsync,
  deleteAsync,
  EncodingType,
} from 'expo-file-system/legacy';

/**
 * Request camera permissions.
 * Returns true if granted.
 */
export async function requestCameraPermission(): Promise<boolean> {
  const { status } = await Camera.requestCameraPermissionsAsync();
  return status === 'granted';
}

/**
 * Save a base64 photo to the local file system.
 * Returns the file URI.
 */
export async function savePhotoLocally(
  base64Data: string,
  fileName: string
): Promise<string> {
  const dir = `${documentDirectory}checkin-photos/`;

  // Ensure directory exists
  const dirInfo = await getInfoAsync(dir);
  if (!dirInfo.exists) {
    await makeDirectoryAsync(dir, { intermediates: true });
  }

  const fileUri = `${dir}${fileName}.jpg`;
  await writeAsStringAsync(fileUri, base64Data, {
    encoding: EncodingType.Base64,
  });

  return fileUri;
}

/**
 * Delete a locally saved photo.
 * Used for cleanup after successful sync.
 */
export async function deleteLocalPhoto(uri: string): Promise<void> {
  try {
    const info = await getInfoAsync(uri);
    if (info.exists) {
      await deleteAsync(uri);
    }
  } catch {
    // Silent fail - cleanup is best-effort
  }
}
