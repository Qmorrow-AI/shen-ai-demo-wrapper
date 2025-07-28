import { OpenMRSCredentials, Location, Patient, VisitData } from '../types';
import { locationUuid, PATIENT_UUIDS } from '../constants';
// @ts-ignore
import base64 from 'react-native-base64';

class OpenMRSService {
  private credentials: OpenMRSCredentials;
  private sessionId: string | null = null;

  constructor(credentials: OpenMRSCredentials) {
    this.credentials = credentials;
  }

  private async establishSession(): Promise<void> {
    if (this.sessionId) {
      return; // Session already established
    }

    console.log('🔐 Establishing OpenMRS session...');
    
    const sessionUrl = `${this.credentials.baseUrl}/ws/rest/v1/session`;
    const authString = `${this.credentials.username}:${this.credentials.password}`;
    const authHeader = `Basic ${base64.encode(authString)}`;
    
    try {
      const response = await fetch(sessionUrl, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        // Extract session ID from cookies if available
        const setCookieHeader = response.headers.get('set-cookie');
        if (setCookieHeader) {
          const jsessionMatch = setCookieHeader.match(/JSESSIONID=([^;]+)/);
          if (jsessionMatch) {
            this.sessionId = jsessionMatch[1];
            console.log('✅ Session established with ID:', this.sessionId);
          }
        }
        
        // Even if no session ID in cookie, the session is established
        console.log('✅ OpenMRS session established successfully');
      } else {
        console.error('❌ Failed to establish session:', response.status, response.statusText);
        throw new Error(`Failed to establish session: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Error establishing session:', error);
      throw error;
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    // Ensure session is established before making requests
    await this.establishSession();
    
    const url = `${this.credentials.baseUrl}/ws/rest/v1${endpoint}`;
    
    // Create Basic Auth header
    const authString = `${this.credentials.username}:${this.credentials.password}`;
    const authHeader = `Basic ${base64.encode(authString)}`;
    
    // Prepare headers with session cookie if available
    const headers: Record<string, string> = {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Add any additional headers from options
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value: string, key: string) => {
          headers[key] = value;
        });
      } else if (typeof options.headers === 'object') {
        Object.assign(headers, options.headers);
      }
    }

    // Add session cookie if we have one
    if (this.sessionId) {
      headers['Cookie'] = `JSESSIONID=${this.sessionId}`;
    }
    
    console.log(`🔐 OpenMRS Request: ${options.method || 'GET'} ${endpoint}`);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log(`📡 Response: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        let errorBody = '';
        try {
          errorBody = await response.text();
          console.log(`   Error Body: ${errorBody}`);
        } catch (e) {
          console.log(`   Could not read error body: ${e}`);
        }
        
        // Check if it's an authentication error
        if (response.status === 401) {
          console.error('🔐 Authentication failed. Please check credentials.');
          
          // Clear session and retry once
          if (this.sessionId) {
            console.log('🔄 Clearing session and retrying...');
            this.sessionId = null;
            await this.establishSession();
            return this.makeRequest(endpoint, options);
          }
        }
        
        throw new Error(`OpenMRS API error: ${response.status} ${response.statusText} - ${errorBody}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Network error in makeRequest:', error);
      throw error;
    }
  }

  async getLocations(): Promise<Location[]> {
    // Always return the preset location, no API call needed
    return [{
      uuid: locationUuid,
      name: 'Preset Location',
      description: 'Default location for patient access'
    }];
  }

  async getPatientsByLocation(locationUuid: string): Promise<Patient[]> {
    try {
      const data = await this.makeRequest(`/patient?location=${locationUuid}`);
      console.log(`✅ Fetched ${data.results?.length || 0} patients`);
      return data.results.map((patient: any) => ({
        uuid: patient.uuid,
        given_name: patient.person?.names?.[0]?.givenName || '',
        family_name: patient.person?.names?.[0]?.familyName || '',
        gender: patient.person?.gender || '',
        birth_date: patient.person?.birthdate || '',
        openmrs_location: locationUuid,
        display: patient.display || `${patient.person?.names?.[0]?.givenName || ''} ${patient.person?.names?.[0]?.familyName || ''}`.trim(),
      }));
    } catch (error) {
      console.error('❌ Error fetching patients:', error);
      throw error;
    }
  }

  async createVisit(visitData: VisitData): Promise<any> {
    try {
      // First, check for existing active visits for this patient
      const existingVisits = await this.makeRequest(`/visit?v=default&patient=${visitData.patientUuid}`);
      const activeVisits = existingVisits.results?.filter((visit: any) => !visit.stopDatetime) || [];
      
      // End any existing active visits first
      for (const activeVisit of activeVisits) {
        try {
          const endTime = new Date();
          endTime.setSeconds(endTime.getSeconds() - 1); // End 1 second ago to ensure no overlap
          
          await this.makeRequest(`/visit/${activeVisit.uuid}`, {
            method: 'POST',
            body: JSON.stringify({
              stopDatetime: endTime.toISOString(),
            }),
          });
        } catch (error) {
          console.warn(`⚠️ Failed to end existing visit ${activeVisit.uuid}:`, error);
        }
      }

      // Create new visit with proper timing
      const startTime = new Date();
      const visitPayload = {
        patient: visitData.patientUuid,
        visitType: "7b0f5697-27e3-40c4-8bae-f4049abfb4ed", // Facility visit type (same as Python bridge)
        startDatetime: startTime.toISOString(),
        location: this.credentials.locationUuid || locationUuid || '',
      };

      const visitResponse = await this.makeRequest('/visit', {
        method: 'POST',
        body: JSON.stringify(visitPayload),
      });

      // Create encounter for the visit
      const encounterPayload = {
        patient: visitData.patientUuid,
        encounterType: "67a71486-1a54-468f-ac3e-7091a9a79584", // Vitals encounter type
        encounterDatetime: startTime.toISOString(),
        location: this.credentials.locationUuid || locationUuid || '',
        visit: visitResponse.uuid,
        obs: this.createObservations(visitData.measurements),
      };

      let encounterResponse;
      try {
        encounterResponse = await this.makeRequest('/encounter', {
          method: 'POST',
          body: JSON.stringify(encounterPayload),
        });
      } catch (encounterError) {
        console.warn('Failed to create encounter with observations, creating visit without observations:', encounterError);
        
        // Try to create encounter without observations as fallback
        const fallbackEncounterPayload = {
          patient: visitData.patientUuid,
          encounterType: "67a71486-1a54-468f-ac3e-7091a9a79584", // Vitals encounter type
          encounterDatetime: startTime.toISOString(),
          location: this.credentials.locationUuid || locationUuid || '',
          visit: visitResponse.uuid,
          obs: [], // Empty observations
        };
        
        encounterResponse = await this.makeRequest('/encounter', {
          method: 'POST',
          body: JSON.stringify(fallbackEncounterPayload),
        });
      }

      // End the visit after creating the encounter with a small delay
      const endTime = new Date(startTime.getTime() + 1000); // End 1 second after start
      const endVisitPayload = {
        stopDatetime: endTime.toISOString(),
      };

      const endVisitResponse = await this.makeRequest(`/visit/${visitResponse.uuid}`, {
        method: 'POST',
        body: JSON.stringify(endVisitPayload),
      });

      return {
        visit: visitResponse,
        encounter: encounterResponse,
        endVisit: endVisitResponse,
      };
    } catch (error) {
      console.error('Error creating visit:', error);
      
      // Check if it's a validation error
      const errorMessage = (error as any)?.message || '';
      if (errorMessage.includes('outOfRange') || errorMessage.includes('validation')) {
        console.error('Validation error - values may be outside acceptable ranges');
        console.error('Please check that heart rate, blood pressure, and other values are within normal ranges');
      }
      
      throw error;
    }
  }

  private createObservations(measurements: VisitData['measurements']): any[] {
    const observations = [];

    // Heart Rate observation - validate range (40-200 BPM)
    if (measurements.heart_rate_bpm) {
      const heartRate = Math.max(40, Math.min(200, measurements.heart_rate_bpm));
      observations.push({
        concept: "5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", // Heart Rate concept UUID (corrected)
        value: heartRate,
      });
    }

    // Blood Pressure observations - validate ranges
    if (measurements.blood_pressure_mmhg?.systolic || measurements.blood_pressure_mmhg?.diastolic) {
      if (measurements.blood_pressure_mmhg.systolic) {
        // Systolic BP range: 70-250 mmHg
        const systolic = Math.max(70, Math.min(250, measurements.blood_pressure_mmhg.systolic));
        observations.push({
          concept: "5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", // Systolic BP concept UUID (same as Python bridge)
          value: systolic,
        });
      }
      if (measurements.blood_pressure_mmhg.diastolic) {
        // Diastolic BP range: 40-150 mmHg
        const diastolic = Math.max(40, Math.min(150, measurements.blood_pressure_mmhg.diastolic));
        observations.push({
          concept: "5086AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", // Diastolic BP concept UUID (same as Python bridge)
          value: diastolic,
        });
      }
    }

    // Breathing Rate observation - validate range (8-40 BPM)
    if (measurements.breathing_rate_bpm) {
      const breathingRate = Math.max(8, Math.min(40, measurements.breathing_rate_bpm));
      observations.push({
        concept: "5242AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", // Breathing Rate concept UUID (same as Python bridge)
        value: breathingRate,
      });
    }

    return observations;
  }

  updateCredentials(credentials: OpenMRSCredentials) {
    this.credentials = credentials;
  }

  async getPatientsByUUIDs(patientUUIDs: string[]): Promise<Patient[]> {
    const patients: Patient[] = [];
    
    for (const uuid of patientUUIDs) {
      try {
        // Use a simpler endpoint without v=full to avoid privilege issues
        const data = await this.makeRequest(`/patient/${uuid}`);
        
        patients.push({
          uuid: data.uuid,
          given_name: data.person?.names?.[0]?.givenName || 'Unknown',
          family_name: data.person?.names?.[0]?.familyName || 'Unknown',
          gender: data.person?.gender || 'Unknown',
          birth_date: data.person?.birthdate || 'Unknown',
          openmrs_location: this.credentials.locationUuid || locationUuid,
          display: data.display || `${data.person?.names?.[0]?.givenName || 'Unknown'} ${data.person?.names?.[0]?.familyName || 'Unknown'}`.trim(),
        });
      } catch (error) {
        console.error(`❌ Error fetching patient ${uuid}:`, error);
        // Continue with other patients even if one fails
      }
    }
    
    console.log(`✅ Fetched ${patients.length}/${patientUUIDs.length} patients`);
    return patients;
  }

  async testConnection(): Promise<boolean> {
    try {
      // Try a simple endpoint first - just get a single patient
      const data = await this.makeRequest(`/patient/${PATIENT_UUIDS[0]}`);
      console.log('✅ Connection test successful');
      return true;
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }
  }

  async debugAuth(): Promise<void> {
    console.log('🔍 Testing authentication...');
    
    const authString = `${this.credentials.username}:${this.credentials.password}`;
    const authHeader = `Basic ${base64.encode(authString)}`;
    
    // Test basic fetch functionality
    try {
      const testResponse = await fetch('https://httpbin.org/get');
      console.log('✅ Basic fetch test successful');
    } catch (error) {
      console.error('❌ Basic fetch test failed:', error);
    }
  }


}

export default OpenMRSService; 