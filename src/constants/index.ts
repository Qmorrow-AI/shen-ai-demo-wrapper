import { Platform } from 'react-native';
import { ServerOption } from '../types';

export const SERVER_OPTIONS: ServerOption[] = [
  {label: 'Docker Server (192.168.1.26:13337)', value: 'http://192.168.1.26:13337'},
  {label: 'Android Emulator (10.0.2.2:3000)', value: 'http://10.0.2.2:3000'},
  {label: 'iOS Simulator (localhost:3000)', value: 'http://localhost:3000'},
  {label: 'Custom Address', value: 'custom'},
];

export const DEFAULT_SERVER = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

export const SHENAI_API_KEY = "01440e21d73c4f5fa96b46a3539c879e";

export const locationUuid = '73e7259f-6cf6-4443-93e7-3f89fa9aa831';

// Specific patient UUIDs to use instead of location-based fetching
export const PATIENT_UUIDS = [
  '8e35f9b9-9e4c-4c2a-b52e-e1bcb5857edf',
  '132b3bdf-d3e3-4f6b-bb71-87ba1fa4c815',
];

export const DEFAULT_OPENMRS_CREDENTIALS = {
  baseUrl: 'http://192.168.1.26/openmrs',
  //baseUrl: 'http://qmorrow.tojest.dev/openmrs',
  username: 'Admin',
  password: 'Admin123',
  locationUuid: locationUuid, // Always use preset location
}; 