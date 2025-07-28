import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Patient } from '../types';
import OpenMRSService from '../services/openmrsService';
import { OpenMRSCredentials } from '../types';
import { getServerConfig } from '../constants';

interface PatientSelectorProps {
  credentials: OpenMRSCredentials;
  onPatientSelect: (patient: Patient) => void;
  selectedPatient?: Patient;
}

const PatientSelector: React.FC<PatientSelectorProps> = ({
  credentials,
  onPatientSelect,
  selectedPatient,
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Create OpenMRSService instance only when credentials change
  const openmrsService = useMemo(() => {
    return new OpenMRSService(credentials);
  }, [credentials.baseUrl, credentials.username, credentials.password, credentials.locationUuid]);

  // Test connection when credentials change
  useEffect(() => {
    const testConnection = async () => {
      try {
        const isConnected = await openmrsService.testConnection();
        if (!isConnected) {
          Alert.alert(
            'Connection Error', 
            'Failed to connect to OpenMRS. Please check your credentials and server URL.'
          );
        }
      } catch (error) {
        Alert.alert(
          'Connection Error', 
          `Failed to connect to OpenMRS: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    };

    testConnection();
  }, [openmrsService]);

  const loadPatients = async () => {
    setLoading(true);
    try {
      // Get patient UUIDs from server config
      const serverConfig = getServerConfig(credentials.baseUrl);
      console.log("🔍 Server config:", serverConfig);
      
      if (!serverConfig) {
        // For custom servers, we can't load predefined patients
        Alert.alert(
          'Custom Server', 
          'Custom servers don\'t have predefined patients. Please configure patients manually in your OpenMRS server.'
        );
        setPatients([]);
        return;
      }
      
      if (!serverConfig.patientUuids || serverConfig.patientUuids.length === 0) {
        throw new Error('No patient UUIDs configured for this server');
      }
      
      const patientsData = await openmrsService.getPatientsByUUIDs(serverConfig.patientUuids);
      setPatients(patientsData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert(
        'Error Loading Patients', 
        `Failed to load patients: ${errorMessage}\n\nPlease check your OpenMRS connection and credentials.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    onPatientSelect(patient);
    setShowDropdown(false);
  };

  const getSelectedPatientName = () => {
    if (!selectedPatient) {
      return 'Select a patient';
    }
    // Use display field if available, otherwise fall back to given_name + family_name
    return selectedPatient.display || `${selectedPatient.given_name} ${selectedPatient.family_name}`;
  };

  // Always show the patient selector since we have a preset location

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Patient:</Text>
      
      <TouchableOpacity
        style={styles.loadButton}
        onPress={loadPatients}
        disabled={loading}>
        <Text style={styles.loadButtonText}>
          {loading ? 'Loading...' : 'Load Specific Patients'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setShowDropdown(!showDropdown)}
        disabled={loading || patients.length === 0}>
        <Text style={styles.dropdownButtonText}>
          {loading ? 'Loading patients...' : getSelectedPatientName()}
        </Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>

      {showDropdown && (
        <View style={styles.dropdownList}>
          {patients.length === 0 ? (
            <Text style={styles.noPatientsText}>No patients found</Text>
          ) : (
            patients.map((patient) => (
              <TouchableOpacity
                key={patient.uuid}
                style={styles.dropdownItem}
                onPress={() => handlePatientSelect(patient)}>
                <Text style={styles.dropdownItemText}>
                  {patient.display || `${patient.given_name} ${patient.family_name}`}
                </Text>
                <Text style={styles.dropdownItemSubtext}>
                  {patient.gender} • {patient.birth_date}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}

      {selectedPatient && (
        <View style={styles.selectedPatientInfo}>
          <Text style={styles.selectedPatientText}>
            Selected: {selectedPatient.display || `${selectedPatient.given_name} ${selectedPatient.family_name}`}
          </Text>
          <Text style={styles.selectedPatientSubtext}>
            {selectedPatient.gender} • {selectedPatient.birth_date}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  noLocationText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 12,
    backgroundColor: 'white',
  },
  dropdownButtonText: {
    flex: 1,
    fontSize: 16,
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
  },
  dropdownList: {
    backgroundColor: 'white',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 4,
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownItemSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  noPatientsText: {
    padding: 12,
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  selectedPatientInfo: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#e8f5e8',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#34C759',
  },
  selectedPatientText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d5a2d',
  },
  selectedPatientSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  loadButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 12,
  },
  loadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PatientSelector; 