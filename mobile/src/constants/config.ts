import { Platform } from 'react-native';

/**
 * Your development PC's Wi-Fi LAN IP address.
 * Ensure your physical mobile phone is connected to the same Wi-Fi network.
 */
export const HOST_LAN_IP = '10.78.168.205';

const getDefaultBaseUrl = (): string => {
  // 1. Explicit environment variable takes top precedence
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Browser web application
  if (Platform.OS === 'web') {
    return 'http://localhost:8080';
  }

  // 3. Physical mobile device or emulator on the local network
  return `http://${HOST_LAN_IP}:8080`;
};

export const API_BASE_URL = getDefaultBaseUrl();
export const API_TIMEOUT_MS = 15000;
