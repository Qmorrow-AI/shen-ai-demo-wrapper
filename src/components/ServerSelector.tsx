import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
} from 'react-native';
import { SERVER_OPTIONS } from '../constants';
import { ServerOption } from '../types';

interface ServerSelectorProps {
  selectedServer: string;
  customServerUrl: string;
  onServerChange: (server: string) => void;
  onCustomUrlChange: (url: string) => void;
  disabled?: boolean;
}

const ServerSelector: React.FC<ServerSelectorProps> = ({
  selectedServer,
  customServerUrl,
  onServerChange,
  onCustomUrlChange,
  disabled = false,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customUrl, setCustomUrl] = useState(customServerUrl);

  const getSelectedServerLabel = () => {
    if (selectedServer === 'custom') {
      return customServerUrl || 'Custom Server';
    }
    const option = SERVER_OPTIONS.find(opt => opt.value === selectedServer);
    return option ? option.label : 'Select Server';
  };

  const handleServerChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomInput(true);
      setShowDropdown(false);
    } else {
      onServerChange(value);
      setShowDropdown(false);
    }
  };

  const handleCustomUrlSubmit = () => {
    if (customUrl.trim()) {
      onCustomUrlChange(customUrl.trim());
      onServerChange('custom');
      setShowCustomInput(false);
    }
  };

  const handleCustomUrlCancel = () => {
    setCustomUrl(customServerUrl);
    setShowCustomInput(false);
    setShowDropdown(false);
  };


  return (
    <View style={styles.container}>
      <Text style={styles.label}>Server Address:</Text>
      <TouchableOpacity
        style={[styles.dropdownButton, disabled && styles.disabled]}
        onPress={() => setShowDropdown(!showDropdown)}
        disabled={disabled}>
        <Text style={styles.dropdownButtonText}>{getSelectedServerLabel()}</Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>
      
      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}>
          <View style={styles.dropdownList}>
            <FlatList
              data={SERVER_OPTIONS}
              keyExtractor={(item) => item.value}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => handleServerChange(item.value)}>
                  <Text style={styles.dropdownItemText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
      
      {/* Custom Server Input Modal */}
      <Modal
        visible={showCustomInput}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCustomUrlCancel}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCustomUrlCancel}>
          <View style={styles.customInputContainer}>
            <Text style={styles.customInputTitle}>Enter Custom Server URL</Text>
            <TextInput
              style={styles.customInput}
              value={customUrl}
              onChangeText={setCustomUrl}
              placeholder="https://your-server.com/openmrs"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <View style={styles.customInputButtons}>
              <TouchableOpacity
                style={[styles.customInputButton, styles.cancelButton]}
                onPress={handleCustomUrlCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.customInputButton, styles.submitButton]}
                onPress={handleCustomUrlSubmit}>
                <Text style={styles.submitButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
  disabled: {
    opacity: 0.6,
  },
  dropdownButtonText: {
    flex: 1,
    fontSize: 16,
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownList: {
    backgroundColor: 'white',
    borderRadius: 8,
    maxHeight: 300,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemText: {
    fontSize: 16,
  },
  customInputContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  customInputTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  customInput: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  customInputButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  customInputButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#007bff',
    borderWidth: 1,
    borderColor: '#007bff',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

});

export default ServerSelector; 