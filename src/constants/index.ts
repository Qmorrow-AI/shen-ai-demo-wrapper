import { Platform } from 'react-native';
import { ServerOption } from '../types';

// Server configurations with their respective data
export const SERVER_CONFIGS = {
  local: {
    baseUrl: 'http://192.168.1.26/openmrs',
    label: 'Local OpenMRS (192.168.1.26)',
    locationUuid: '73e7259f-6cf6-4443-93e7-3f89fa9aa831',
    patientUuids: [
      '8e35f9b9-9e4c-4c2a-b52e-e1bcb5857edf',
      '132b3bdf-d3e3-4f6b-bb71-87ba1fa4c815',
    ],
    credentials: {
      username: 'Admin',
      password: 'Admin123',
    }
  },
  remote: {
    baseUrl: 'http://qmorrow.tojest.dev/openmrs',
    label: 'Remote OpenMRS (qmorrow.tojest.dev)',
    locationUuid: '8639ead4-ad6c-419f-9944-7d92ff32dcac', // Same location for now
    patientUuids: [
      '693b80d8-87a1-4cdc-90fe-09047c6428c3', // Same patients for now
      'db27db0b-2048-4918-a93a-58b10ba432de',
    ],
    credentials: {
      username: 'Admin',
      password: 'Admin123',
    }
  }
};

export const SERVER_OPTIONS: ServerOption[] = [
  {label: SERVER_CONFIGS.local.label, value: SERVER_CONFIGS.local.baseUrl},
  {label: SERVER_CONFIGS.remote.label, value: SERVER_CONFIGS.remote.baseUrl},
  {label: 'Custom Server', value: 'custom'},
];

export const DEFAULT_SERVER = SERVER_CONFIGS.remote.baseUrl;

export const SHENAI_API_KEY = "01440e21d73c4f5fa96b46a3539c879e";

// Helper function to get config for a server URL
export const getServerConfig = (serverUrl: string) => {
  console.log("🔍 getServerConfig called with:", serverUrl);
  console.log("🔍 Available configs:", Object.keys(SERVER_CONFIGS));
  
  if (serverUrl === 'custom') {
    console.log("🔍 Custom server selected - no predefined config");
    return null; // Custom servers don't have predefined configs
  } else if (serverUrl === SERVER_CONFIGS.local.baseUrl) {
    console.log("🔍 Returning local config");
    return SERVER_CONFIGS.local;
  } else if (serverUrl === SERVER_CONFIGS.remote.baseUrl) {
    console.log("🔍 Returning remote config");
    return SERVER_CONFIGS.remote;
  }
  
  console.log("🔍 No exact match, returning local config as fallback");
  return SERVER_CONFIGS.local; // Default fallback
};

// Default configuration (remote)
export const DEFAULT_OPENMRS_CREDENTIALS = {
  baseUrl: SERVER_CONFIGS.remote.baseUrl,
  username: SERVER_CONFIGS.remote.credentials.username,
  password: SERVER_CONFIGS.remote.credentials.password,
  locationUuid: SERVER_CONFIGS.remote.locationUuid,
}; 