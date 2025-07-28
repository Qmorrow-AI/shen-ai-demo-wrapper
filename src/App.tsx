import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Button,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Settings, Patient, OpenMRSCredentials, MeasurementData } from './types';
import { DEFAULT_SERVER, DEFAULT_OPENMRS_CREDENTIALS } from './constants';
import ServerSelector from './components/ServerSelector';
import SettingsScreen from './components/SettingsScreen';
import PatientSelector from './components/PatientSelector';
import ShenAIScanner from './components/ShenAIScanner';

import OpenMRSService from './services/openmrsService';

type AppScreen = 'main' | 'settings' | 'scanner';

function App(): React.JSX.Element {
  // App state
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('main');
  const [loading, setLoading] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState<Settings>({
    serverUrl: DEFAULT_SERVER,
    customServerUrl: '',
    openmrsCredentials: DEFAULT_OPENMRS_CREDENTIALS,
  });
  
  // Patient state
  const [selectedPatient, setSelectedPatient] = useState<Patient | undefined>();



  function getBaseUrl(): string {
    return settings.serverUrl;
  }

  const handleServerChange = (server: string) => {
    setSettings(prev => ({ ...prev, serverUrl: server }));
  };



  const handleCredentialsChange = (credentials: OpenMRSCredentials) => {
    setSettings(prev => ({ ...prev, openmrsCredentials: credentials }));
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
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
      
      const mockResults: MeasurementData = {
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
      Alert.alert(
        '✅ Success', 
        'Mock data sent to OpenMRS successfully!\n\n' +
        `Patient: ${selectedPatient.given_name} ${selectedPatient.family_name}\n` +
        `Heart Rate: ${mockResults.heartRate} BPM\n` +
        `Blood Pressure: ${mockResults.systolicBloodPressureMmhg}/${mockResults.diastolicBloodPressureMmhg} mmHg\n` +
        `Breathing Rate: ${mockResults.breathingRate} BPM\n` +
        `HRV SDNN: ${mockResults.hrvSdnnMs} ms`
      );
    } catch (error: any) {
      console.error('Error sending mock data:', error);
      Alert.alert('Error', `Failed to send mock data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };



  const renderMainScreen = () => (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Medical Service App</Text>
      
      <ServerSelector
        selectedServer={settings.serverUrl}
        customServerUrl=""
        onServerChange={handleServerChange}
        onCustomUrlChange={() => {}}
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
        </View>
      )}
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
  buttonContainer: {
    width: '100%',
    marginBottom: 12,
  },
});

export default App; 