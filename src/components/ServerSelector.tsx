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

  const getSelectedServerLabel = () => {
    const option = SERVER_OPTIONS.find(opt => opt.value === selectedServer);
    return option ? option.label : 'Custom Address';
  };

  const handleServerChange = (value: string) => {
    onServerChange(value);
    setShowDropdown(false);
  };

  const showCustomInput = selectedServer === 'custom';

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
      
      {showCustomInput && (
        <TextInput
          style={[styles.customInput, disabled && styles.disabled]}
          placeholder="Enter custom server URL (e.g., http://192.168.1.100:3000)"
          value={customServerUrl}
          onChangeText={onCustomUrlChange}
          editable={!disabled}
        />
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
  customInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 12,
    marginTop: 8,
  },
});

export default ServerSelector; 