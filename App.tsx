/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState, useEffect} from 'react';
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
import { ShenaiSdkView, InitializationResult } from "react-native-shenai-sdk";
import { NativeEventEmitter, NativeModules } from "react-native";
import {
  initialize,
  MeasurementPreset,
  useRealtimeHeartRate,
  useMeasurementResults,
} from "react-native-shenai-sdk";

const { ShenaiSdkNativeModule } = NativeModules;
const sdkEventEmitter = new NativeEventEmitter(ShenaiSdkNativeModule);

// Predefined server addresses
const SERVER_OPTIONS = [
  {label: 'Docker Server (192.168.1.26:13337)', value: 'http://192.168.1.26:13337'},
  {label: 'Android Emulator (10.0.2.2:3000)', value: 'http://10.0.2.2:3000'},
  {label: 'iOS Simulator (localhost:3000)', value: 'http://localhost:3000'},
  {label: 'Custom Address', value: 'custom'},
];

interface MeasurementResult {
  hrvSdnnMs?: number;
  systolicBloodPressureMmhg?: number;
  diastolicBloodPressureMmhg?: number;
  heartRate?: number;
}

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
  
  // Shen AI Scanner states
  const [showScanner, setShowScanner] = useState(false);
  const [initResult, setInitResult] = useState<InitializationResult | null | false>(null);
  const [scannerLoading, setScannerLoading] = useState(false);
  // Track if measurement has been sent successfully to avoid duplicates
  const [measurementSent, setMeasurementSent] = useState(false);

  // Shen AI SDK hooks
  const hr = useRealtimeHeartRate();
  const results = useMeasurementResults();

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

  // Shen AI Scanner functions
  const initializeShenAiSdk = async () => {
    setScannerLoading(true);
    try {
      const subscription = sdkEventEmitter.addListener("ShenAIEvent", (event) => {
        const eventName = event?.EventName;
        if (eventName) {
          console.log("Event Name:", eventName);
        }
      });

      console.log("Initializing Shen AI SDK");
      const result = await initialize("01440e21d73c4f5fa96b46a3539c879e", "", {
        measurementPreset: MeasurementPreset.THIRTY_SECONDS_UNVALIDATED,
      });
      console.log("Initialization result", result);
      setInitResult(result);

      return () => {
        subscription.remove();
      };
    } catch (error) {
      console.log(error);
      setInitResult(false);
    } finally {
      setScannerLoading(false);
    }
  };

  const sendMeasurementToServer = async (results: MeasurementResult) => {
    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      console.error('No server URL configured');
      return;
    }

    const payload = {
      timestamp: Date.now(),
      hrv_sdnn_ms: results.hrvSdnnMs,
      heart_rate_bpm: results.heartRate,
      blood_pressure_mmhg: {
        systolic: results.systolicBloodPressureMmhg,
        diastolic: results.diastolicBloodPressureMmhg,
      },
    };

    console.log("📦 Sending measurement payload:", JSON.stringify(payload, null, 2));

    try {
      const response = await fetch(`${baseUrl}/shenai/measurements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("✅ Response status:", response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.warn("❌ Failed to send Shen-AI data:", errorText);
      } else {
        console.log("✅ Successfully sent measurement data to server");
        // mark as sent to prevent duplicate submissions
        setMeasurementSent(true);
      }
    } catch (error) {
      console.error("💥 Error sending Shen-AI data:", error);
    }
  };

  const startScanner = async () => {
    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      setServerResponse('Error: Please select or enter a server address first');
      return;
    }
    
    await initializeShenAiSdk();
    // reset flag each new scan session
    setMeasurementSent(false);
    setShowScanner(true);
  };

  // Effect to send measurement data when available
  useEffect(() => {
    if (results && showScanner && !measurementSent) {
      console.log("📡 Sending first complete measurement to API", results);
      sendMeasurementToServer({
        hrvSdnnMs: results.hrvSdnnMs ?? undefined,
        systolicBloodPressureMmhg: results.systolicBloodPressureMmhg ?? undefined,
        diastolicBloodPressureMmhg: results.diastolicBloodPressureMmhg ?? undefined,
        // capture latest HR value available at this moment
        heartRate: hr ?? undefined,
      });
    }
  }, [results, showScanner, measurementSent]);

  // Shen AI Scanner Screen
  if (showScanner) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.scannerHeader}>
          <Text style={styles.scannerTitle}>Shen AI Scanner</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setShowScanner(false)}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
        
        {scannerLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Initializing Shen AI SDK...</Text>
          </View>
        )}
        
        {initResult === false && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Shen AI SDK initialization failed</Text>
            <Button title="Retry" onPress={initializeShenAiSdk} />
          </View>
        )}
        
        {initResult === null && !scannerLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Initializing...</Text>
          </View>
        )}
        
        {hr && (
          <View style={styles.measurementDisplay}>
            <Text style={styles.measurementText}>Heart Rate: {hr} BPM</Text>
          </View>
        )}
        
        {initResult === InitializationResult.OK && (
          <ShenaiSdkView style={styles.scannerView} />
        )}
        
        {results && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Measurement Results:</Text>
            <Text style={styles.resultsText}>HRV: {results?.hrvSdnnMs} MS</Text>
            <Text style={styles.resultsText}>
              BP: {results?.systolicBloodPressureMmhg} / {results?.diastolicBloodPressureMmhg} MMHG
            </Text>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // Main App Screen
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Medical Service App</Text>
      
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

      <View style={styles.buttonContainer}>
        <Button 
          title="Start Shen AI Scanner" 
          onPress={startScanner} 
          disabled={loading || !getBaseUrl()} 
        />
      </View>

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
        <Button title={loading ? 'Sending...' : 'Send Message'} onPress={sendMessage} disabled={loading} />
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
  // Scanner styles
  scannerHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  scannerTitle: {
    fontSize: 24,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  scannerView: {
    flex: 1,
    width: '100%',
  },
  measurementDisplay: {
    position: 'absolute',
    top: 100,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 8,
    zIndex: 1000,
  },
  measurementText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 15,
    borderRadius: 8,
  },
  resultsTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultsText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 4,
  },
});

export default App;
