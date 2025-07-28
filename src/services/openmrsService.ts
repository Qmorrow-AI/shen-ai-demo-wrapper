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
    
    console.log('🔐 OpenMRS Debug Info:');
    console.log(`   URL: ${url}`);
    console.log(`   Username: ${this.credentials.username}`);
    console.log(`   Password: ${this.credentials.password ? '***' : 'NOT SET'}`);
    console.log(`   Auth String: ${authString}`);
    console.log(`   Auth Header: ${authHeader}`);
    console.log(`   Session ID: ${this.sessionId || 'None'}`);
    console.log(`   Method: ${options.method || 'GET'}`);
    console.log(`   Headers:`, headers);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log('📡 Response Debug Info:');
      console.log(`   Status: ${response.status} ${response.statusText}`);
      console.log(`   Headers:`, Object.fromEntries(response.headers.entries()));
      
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
          console.error('   Expected auth header:', authHeader);
          console.error('   This should match curl: Basic QWRtaW46QWRtaW4xMjM=');
          
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
      console.log(`   Response Data:`, JSON.stringify(data, null, 2));
      
      return data;
    } catch (error) {
      console.error('❌ Network error in makeRequest:', error);
      throw error;
    }
  }

  async getLocations(): Promise<Location[]> {
    console.log('🏥 Using preset location only...');
    // Always return the preset location, no API call needed
    return [{
      uuid: locationUuid,
      name: 'Preset Location',
      description: 'Default location for patient access'
    }];
  }

  async getPatientsByLocation(locationUuid: string): Promise<Patient[]> {
    console.log('👥 Fetching patients for location:', locationUuid);
    try {
      const data = await this.makeRequest(`/patient?location=${locationUuid}&v=full`);
      console.log(`✅ Successfully fetched ${data.results?.length || 0} patients`);
      return data.results.map((patient: any) => ({
        uuid: patient.uuid,
        given_name: patient.person?.names?.[0]?.givenName || '',
        family_name: patient.person?.names?.[0]?.familyName || '',
        gender: patient.person?.gender || '',
        birth_date: patient.person?.birthdate || '',
        openmrs_location: locationUuid,
      }));
    } catch (error) {
      console.error('❌ Error fetching patients:', error);
      console.error('   Location UUID:', locationUuid);
      console.error('   Credentials:', {
        baseUrl: this.credentials.baseUrl,
        username: this.credentials.username,
        password: this.credentials.password ? '***' : 'NOT SET'
      });
      throw error;
    }
  }

  async createVisit(visitData: VisitData): Promise<any> {
    try {
      const visitPayload = {
        patient: visitData.patientUuid,
        visitType: "7b0f5697-27e3-40c4-8bae-f4049bbfb170", // Default visit type
        startDatetime: new Date().toISOString(),
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
        encounterDatetime: new Date().toISOString(),
        location: this.credentials.locationUuid || locationUuid || '',
        visit: visitResponse.uuid,
        obs: this.createObservations(visitData.measurements),
      };

      const encounterResponse = await this.makeRequest('/encounter', {
        method: 'POST',
        body: JSON.stringify(encounterPayload),
      });

      return {
        visit: visitResponse,
        encounter: encounterResponse,
      };
    } catch (error) {
      console.error('Error creating visit:', error);
      throw error;
    }
  }

  private createObservations(measurements: VisitData['measurements']): any[] {
    const observations = [];

    // Heart Rate observation
    if (measurements.heart_rate_bpm) {
      observations.push({
        concept: "3ce934fa-26fe-102b-80cb-0017a47871b2", // Heart Rate concept UUID
        value: measurements.heart_rate_bpm,
      });
    }

    // Blood Pressure observations
    if (measurements.blood_pressure_mmhg?.systolic || measurements.blood_pressure_mmhg?.diastolic) {
      if (measurements.blood_pressure_mmhg.systolic) {
        observations.push({
          concept: "3ce93b62-26fe-102b-80cb-0017a47871b2", // Systolic BP concept UUID
          value: measurements.blood_pressure_mmhg.systolic,
        });
      }
      if (measurements.blood_pressure_mmhg.diastolic) {
        observations.push({
          concept: "3ce93c70-26fe-102b-80cb-0017a47871b2", // Diastolic BP concept UUID
          value: measurements.blood_pressure_mmhg.diastolic,
        });
      }
    }

    // HRV observation (if you have a concept for it)
    if (measurements.hrv_sdnn_ms) {
      observations.push({
        concept: "3ce93d7e-26fe-102b-80cb-0017a47871b2", // Placeholder for HRV concept UUID
        value: measurements.hrv_sdnn_ms,
      });
    }

    return observations;
  }

  updateCredentials(credentials: OpenMRSCredentials) {
    this.credentials = credentials;
  }

  async getPatientsByUUIDs(patientUUIDs: string[]): Promise<Patient[]> {
    console.log('👥 Fetching specific patients by UUIDs:', patientUUIDs);
    const patients: Patient[] = [];
    
    for (const uuid of patientUUIDs) {
      try {
        // Use a simpler endpoint without v=full to avoid privilege issues
        const data = await this.makeRequest(`/patient/${uuid}`);
        console.log(`✅ Successfully fetched patient ${uuid}:`, data.person?.names?.[0]?.givenName || 'Unknown');
        
        patients.push({
          uuid: data.uuid,
          given_name: data.person?.names?.[0]?.givenName || 'Unknown',
          family_name: data.person?.names?.[0]?.familyName || 'Unknown',
          gender: data.person?.gender || 'Unknown',
          birth_date: data.person?.birthdate || 'Unknown',
          openmrs_location: this.credentials.locationUuid || locationUuid,
        });
      } catch (error) {
        console.error(`❌ Error fetching patient ${uuid}:`, error);
        // Continue with other patients even if one fails
      }
    }
    
    console.log(`✅ Successfully fetched ${patients.length} out of ${patientUUIDs.length} patients`);
    return patients;
  }

  async testConnection(): Promise<boolean> {
    console.log('🧪 Testing OpenMRS connection...');
    try {
      // Try a simple endpoint first - just get a single patient
      const data = await this.makeRequest(`/patient/${PATIENT_UUIDS[0]}?v=default`);
      console.log('✅ Connection test successful:', data.uuid ? `Patient ${data.uuid} found` : 'No patient data');
      return true;
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }
  }

  async debugAuth(): Promise<void> {
    console.log('🔍 Debugging authentication...');
    console.log('Credentials:', {
      baseUrl: this.credentials.baseUrl,
      username: this.credentials.username,
      password: this.credentials.password ? '***' : 'NOT SET',
      locationUuid: this.credentials.locationUuid
    });
    
    const authString = `${this.credentials.username}:${this.credentials.password}`;
    const authHeader = `Basic ${base64.encode(authString)}`;
    console.log('Auth header:', authHeader);
    console.log('Expected (from curl): Basic QWRtaW46QWRtaW4xMjM=');
    console.log('Match:', authHeader === 'Basic QWRtaW46QWRtaW4xMjM=' ? '✅' : '❌');
    
    // Test URL construction
    const testUrl = `${this.credentials.baseUrl}/ws/rest/v1/patient/${PATIENT_UUIDS[0]}`;
    console.log('Test URL:', testUrl);
    console.log('Expected URL: http://192.168.1.26/openmrs/ws/rest/v1/patient/8e35f9b9-9e4c-4c2a-b52e-e1bcb5857edf');
    console.log('URL Match:', testUrl === 'http://192.168.1.26/openmrs/ws/rest/v1/patient/8e35f9b9-9e4c-4c2a-b52e-e1bcb5857edf' ? '✅' : '❌');
    
    // Test basic fetch functionality
    try {
      console.log('🌐 Testing basic fetch functionality...');
      const testResponse = await fetch('https://httpbin.org/get');
      console.log('✅ Basic fetch test successful:', testResponse.status);
    } catch (error) {
      console.error('❌ Basic fetch test failed:', error);
    }
  }


}

export default OpenMRSService; 