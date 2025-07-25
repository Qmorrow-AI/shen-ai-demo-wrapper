/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  TextInput,
  Button,
  View,
  Text,
  Platform,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';

// Predefined server addresses
const SERVER_OPTIONS = [
  {label: 'Docker Server (192.168.1.26:13337)', value: 'http://192.168.1.26:13337'},
  {label: 'Android Emulator (10.0.2.2:3000)', value: 'http://10.0.2.2:3000'},
  {label: 'iOS Simulator (localhost:3000)', value: 'http://localhost:3000'},
  {label: 'Custom Address', value: 'custom'},
];

function App(): React.JSX.Element {
  const [message, setMessage] = useState('');
  const [serverResponse, setServerResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedServer, setSelectedServer] = useState(
    Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000'
  );
  const [customServerUrl, setCustomServerUrl] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const getSelectedServerLabel = () => {
    const option = SERVER_OPTIONS.find(opt => opt.value === selectedServer);
    return option ? option.label : 'Custom Address';
  };

  const handleServerChange = (value: string) => {
    setSelectedServer(value);
    setShowDropdown(false);
    if (value === 'custom') {
      setShowCustomInput(true);
    } else {
      setShowCustomInput(false);
      setCustomServerUrl('');
    }
  };

  const getBaseUrl = () => {
    if (selectedServer === 'custom' && customServerUrl.trim()) {
      return customServerUrl.trim();
    }
    return selectedServer;
  };

  const sendMessage = async () => {
    if (!message.trim()) {
      return; // Don't send empty messages
    }
    
    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      setServerResponse('Error: Please select or enter a server address');
      return;
    }

    setLoading(true);
    setServerResponse(null);
    
    console.log(`Attempting to send message to: ${baseUrl}/shenai/measurements`);
    console.log(`Message: ${message}`);
    
    try {
      const res = await fetch(`${baseUrl}/shenai/measurements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({message}),
      });

      console.log(`Response status: ${res.status}`);
      console.log(`Response headers:`, res.headers);

      const data = await res.json();
      console.log(`Response data:`, data);
      
      if (!res.ok) {
        throw new Error(data?.error || 'Unknown server error');
      }
      setServerResponse(data?.response || 'Success');
      setMessage('');
    } catch (error: any) {
      console.error('Network error:', error);
      setServerResponse(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Send Message to Mock Server</Text>
      
      <View style={styles.serverSection}>
        <Text style={styles.label}>Server Address:</Text>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setShowDropdown(!showDropdown)}
          disabled={loading}>
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
            style={styles.customInput}
            placeholder="Enter custom server URL (e.g., http://192.168.1.100:3000)"
            value={customServerUrl}
            onChangeText={setCustomServerUrl}
            editable={!loading}
          />
        )}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Enter your message"
        value={message}
        onChangeText={setMessage}
        editable={!loading}
      />
      <View style={styles.buttonContainer}>
        <Button title={loading ? 'Sending...' : 'Send'} onPress={sendMessage} disabled={loading} />
      </View>
      {serverResponse && <Text style={styles.response}>{serverResponse}</Text>}
    </SafeAreaView>
  );
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
  serverSection: {
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
});

export default App;
