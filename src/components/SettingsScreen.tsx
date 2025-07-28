import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { OpenMRSCredentials, Location } from '../types';
import { DEFAULT_OPENMRS_CREDENTIALS, getServerConfig } from '../constants';
import OpenMRSService from '../services/openmrsService';

interface SettingsScreenProps {
  credentials: OpenMRSCredentials;
  onCredentialsChange: (credentials: OpenMRSCredentials) => void;
  onBack: () => void;
  currentServerUrl?: string;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({
  credentials,
  onCredentialsChange,
  onBack,
  currentServerUrl,
}) => {
  const [formData, setFormData] = useState<OpenMRSCredentials>(credentials);
  const [loading, setLoading] = useState(false);

  const openmrsService = new OpenMRSService(formData);

  // Get current server config
  const currentServerConfig = currentServerUrl ? getServerConfig(currentServerUrl) : null;
  const isCustomServer = currentServerUrl === 'custom';

  useEffect(() => {
    // Update form data when credentials change
    setFormData(credentials);
  }, [credentials]);

  const testConnection = async () => {
    if (!formData.baseUrl || !formData.username || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields first');
      return;
    }

    setLoading(true);
    try {
      const connectionOk = await openmrsService.testConnection();
      if (connectionOk) {
        Alert.alert('Success', 'Connection to OpenMRS successful!');
      } else {
        Alert.alert('Connection Failed', 'Could not connect to OpenMRS. Please check your credentials.');
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      Alert.alert('Error', 'Failed to test connection. Please check your OpenMRS connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!formData.baseUrl || !formData.username || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    onCredentialsChange(formData);
    Alert.alert('Success', 'Settings saved successfully');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>OpenMRS Settings</Text>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        {/* Current Server Info */}
        {currentServerUrl && (
          <View style={styles.serverInfo}>
            <Text style={styles.serverInfoTitle}>Current Server Configuration</Text>
            <Text style={styles.serverInfoText}>
              Server: {isCustomServer ? 'Custom Server' : currentServerConfig?.label || 'Unknown'}
            </Text>
            <Text style={styles.serverInfoText}>
              URL: {formData.baseUrl}
            </Text>
            {currentServerConfig && (
              <Text style={styles.serverInfoText}>
                Location UUID: {currentServerConfig.locationUuid}
              </Text>
            )}
          </View>
        )}

        <Text style={styles.label}>OpenMRS Base URL:</Text>
        <TextInput
          style={styles.input}
          placeholder="http://localhost/openmrs"
          value={formData.baseUrl}
          onChangeText={(text) => setFormData(prev => ({ ...prev, baseUrl: text }))}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Username:</Text>
        <TextInput
          style={styles.input}
          placeholder="admin"
          value={formData.username}
          onChangeText={(text) => setFormData(prev => ({ ...prev, username: text }))}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Password:</Text>
        <TextInput
          style={styles.input}
          placeholder="Admin123"
          value={formData.password}
          onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Location:</Text>
        <View style={styles.presetLocationInfo}>
          <Text style={styles.presetLocationText}>
            {isCustomServer ? 'Custom Server' : 'Preset Location (Configured)'}
          </Text>
          <Text style={styles.presetLocationSubtext}>
            Using location UUID: {formData.locationUuid}
          </Text>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.testButton} 
          onPress={testConnection}
          disabled={loading}>
          <Text style={styles.testButtonText}>
            {loading ? 'Testing Connection...' : 'Test Connection'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 8,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
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
    marginBottom: 16,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemText: {
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  testButton: {
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  presetLocationInfo: {
    padding: 12,
    backgroundColor: '#e8f5e8',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#34C759',
  },
  presetLocationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d5a2d',
  },
  presetLocationSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  serverInfo: {
    backgroundColor: '#e0f2f7',
    padding: 12,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
    marginBottom: 16,
  },
  serverInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d5a2d',
    marginBottom: 4,
  },
  serverInfoText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
});

export default SettingsScreen; 