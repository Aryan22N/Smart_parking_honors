import { Platform } from 'react-native';

/**
 * Resolves the backend API base URL intelligently:
 * 1. Checks EXPO_PUBLIC_API_URL environment variable if set.
 * 2. On Android Emulator: Uses 10.0.2.2:8080 (which maps to host PC localhost:8080).
 * 3. On iOS Simulator / Web: Uses localhost:8080.
 * 4. For physical devices: Replace with your development machine's local LAN IP (e.g., http://192.168.1.X:8080).
 */
const getDefaultBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === 'android') {
    // Android emulator's loopback alias to host development machine
    return 'http://10.0.2.2:8080';
  }
  // iOS Simulator / Web / Desktop
  return 'http://localhost:8080';
};

export const API_BASE_URL = getDefaultBaseUrl();
export const API_TIMEOUT_MS = 15000;
