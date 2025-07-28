export interface MeasurementResult {
  hrvSdnnMs?: number;
  systolicBloodPressureMmhg?: number;
  diastolicBloodPressureMmhg?: number;
  heartRate?: number;
  breathingRate?: number;
}

export interface ServerOption {
  label: string;
  value: string;
}

export interface OpenMRSCredentials {
  baseUrl: string;
  username: string;
  password: string;
  locationUuid: string;
}

export interface Location {
  uuid: string;
  name: string;
  description?: string;
}

export interface Patient {
  uuid: string;
  given_name: string;
  family_name: string;
  gender: string;
  birth_date: string;
  openmrs_location: string;
}

export interface VisitData {
  patientUuid: string;
  measurements: {
    timestamp: number;
    hrv_sdnn_ms?: number;
    heart_rate_bpm?: number;
    breathing_rate_bpm?: number;
    blood_pressure_mmhg?: {
      systolic?: number;
      diastolic?: number;
    };
  };
}

export interface Settings {
  serverUrl: string;
  customServerUrl: string;
  openmrsCredentials: OpenMRSCredentials;
} 