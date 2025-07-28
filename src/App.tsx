import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  TextInput,
  Button,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Settings, Patient, OpenMRSCredentials } from './types';
import { DEFAULT_SERVER, DEFAULT_OPENMRS_CREDENTIALS } from './constants';
import ServerSelector from './components/ServerSelector';
import SettingsScreen from './components/SettingsScreen';
import PatientSelector from './components/PatientSelector';
import ShenAIScanner from './components/ShenAIScanner';
import ServerService from './services/serverService';
import OpenMRSService from './services/openmrsService';

type AppScreen = 'main' | 'settings' | 'scanner';

function App(): React.JSX.Element {
  // App state
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('main');
  const [message, setMessage] = useState('');
  const [serverResponse, setServerResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState<Settings>({
    serverUrl: DEFAULT_SERVER,
    customServerUrl: '',
    openmrsCredentials: DEFAULT_OPENMRS_CREDENTIALS,
  });
  
  // Patient state
  const [selectedPatient, setSelectedPatient] = useState<Patient | undefined>();

  // Services
  const serverService = new ServerService(getBaseUrl());

  function getBaseUrl(): string {
    if (settings.serverUrl === 'custom' && settings.customServerUrl.trim()) {
      return settings.customServerUrl.trim();
    }
    return settings.serverUrl;
  }

  const handleServerChange = (server: string) => {
    setSettings(prev => ({ ...prev, serverUrl: server }));
    serverService.updateBaseUrl(getBaseUrl());
  };

  const handleCustomUrlChange = (url: string) => {
    setSettings(prev => ({ ...prev, customServerUrl: url }));
    serverService.updateBaseUrl(getBaseUrl());
  };

  const handleCredentialsChange = (credentials: OpenMRSCredentials) => {
    setSettings(prev => ({ ...prev, openmrsCredentials: credentials }));
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const sendMessage = async () => {
    if (!message.trim()) {
      return;
    }
    
    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      setServerResponse('Error: Please select or enter a server address');
      return;
    }

    setLoading(true);
    setServerResponse(null);
    
    try {
      const response = await serverService.sendMessage(message);
      setServerResponse(response);
      setMessage('');
    } catch (error: any) {
      console.error('Network error:', error);
      setServerResponse(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const startScanner = () => {
    if (!selectedPatient) {
      Alert.alert('Error', 'Please select a patient first');
      return;
    }
    
    setCurrentScreen('scanner');
  };

  const sendMockData = async () => {
    if (!selectedPatient) {
      Alert.alert('Error', 'Please select a patient first');
      return;
    }

    setLoading(true);
    try {
      const openmrsService = new OpenMRSService(settings.openmrsCredentials);
      
      const mockResults = {
        heartRate: 72,
        systolicBloodPressureMmhg: 118,
        diastolicBloodPressureMmhg: 78,
        hrvSdnnMs: 42.5,
        breathingRate: 16,
      };

      const visitData = {
        patientUuid: selectedPatient.uuid,
        measurements: {
          timestamp: Date.now(),
          hrv_sdnn_ms: mockResults.hrvSdnnMs,
          heart_rate_bpm: mockResults.heartRate,
          breathing_rate_bpm: mockResults.breathingRate,
          blood_pressure_mmhg: {
            systolic: mockResults.systolicBloodPressureMmhg,
            diastolic: mockResults.diastolicBloodPressureMmhg,
          },
        },
      };

      const response = await openmrsService.createVisit(visitData);
      Alert.alert('Success', 'Mock data sent to OpenMRS successfully!');
    } catch (error: any) {
      console.error('Error sending mock data:', error);
      Alert.alert('Error', `Failed to send mock data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const sendConservativeData = async () => {
    if (!selectedPatient) {
      Alert.alert('Error', 'Please select a patient first');
      return;
    }

    setLoading(true);
    try {
      const openmrsService = new OpenMRSService(settings.openmrsCredentials);
      
      const mockResults = {
        heartRate: 65,
        systolicBloodPressureMmhg: 110,
        diastolicBloodPressureMmhg: 70,
        hrvSdnnMs: 35.0,
        breathingRate: 14,
      };

      const visitData = {
        patientUuid: selectedPatient.uuid,
        measurements: {
          timestamp: Date.now(),
          hrv_sdnn_ms: mockResults.hrvSdnnMs,
          heart_rate_bpm: mockResults.heartRate,
          breathing_rate_bpm: mockResults.breathingRate,
          blood_pressure_mmhg: {
            systolic: mockResults.systolicBloodPressureMmhg,
            diastolic: mockResults.diastolicBloodPressureMmhg,
          },
        },
      };

      const response = await openmrsService.createVisit(visitData);
      Alert.alert('Success', 'Conservative data sent to OpenMRS successfully!');
    } catch (error: any) {
      console.error('Error sending conservative data:', error);
      Alert.alert('Error', `Failed to send conservative data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderMainScreen = () => (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Medical Service App</Text>
      
      <ServerSelector
        selectedServer={settings.serverUrl}
        customServerUrl={settings.customServerUrl}
        onServerChange={handleServerChange}
        onCustomUrlChange={handleCustomUrlChange}
        disabled={loading}
      />

      <TouchableOpacity 
        style={styles.settingsButton} 
        onPress={() => setCurrentScreen('settings')}>
        <Text style={styles.settingsButtonText}>⚙️ OpenMRS Settings</Text>
      </TouchableOpacity>

      <PatientSelector
        credentials={settings.openmrsCredentials}
        onPatientSelect={handlePatientSelect}
        selectedPatient={selectedPatient}
      />

      <View style={styles.buttonContainer}>
        <Button 
          title="Start Shen AI Scanner" 
          onPress={startScanner} 
          disabled={loading || !getBaseUrl() || !selectedPatient} 
        />
      </View>

      {selectedPatient && (
        <View style={styles.buttonContainer}>
          <Button 
            title="🧪 Send Mock Data" 
            onPress={sendMockData} 
            disabled={loading || !getBaseUrl()} 
          />
          <Button 
            title="🧪 Send Conservative Data" 
            onPress={sendConservativeData} 
            disabled={loading || !getBaseUrl()} 
          />
        </View>
      )}

      <View style={styles.divider}>
        <Text style={styles.dividerText}>OR</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Enter your message"
        value={message}
        onChangeText={setMessage}
        editable={!loading}
      />
      <View style={styles.buttonContainer}>
        <Button 
          title={loading ? 'Sending...' : 'Send Message'} 
          onPress={sendMessage} 
          disabled={loading} 
        />
      </View>
      {serverResponse && <Text style={styles.response}>{serverResponse}</Text>}
    </SafeAreaView>
  );

  const renderSettingsScreen = () => (
    <SettingsScreen
      credentials={settings.openmrsCredentials}
      onCredentialsChange={handleCredentialsChange}
      onBack={() => setCurrentScreen('main')}
    />
  );

  const renderScannerScreen = () => (
    <ShenAIScanner
      onBack={() => setCurrentScreen('main')}
      selectedPatient={selectedPatient}
      openmrsCredentials={settings.openmrsCredentials}
    />
  );

  // Render current screen
  switch (currentScreen) {
    case 'settings':
      return renderSettingsScreen();
    case 'scanner':
      return renderScannerScreen();
    default:
      return renderMainScreen();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    marginBottom: 16,
    fontWeight: '600',
  },
  settingsButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  settingsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 12,
  },
  response: {
    marginTop: 12,
    textAlign: 'center',
    color: 'green',
  },
  divider: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});

export default App; 