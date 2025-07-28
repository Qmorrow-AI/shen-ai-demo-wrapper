import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { ShenaiSdkView, InitializationResult } from "react-native-shenai-sdk";
import { MeasurementResult, Patient } from '../types';
import ShenAIService from '../services/shenaiService';
import OpenMRSService from '../services/openmrsService';
import { OpenMRSCredentials } from '../types';

interface ShenAIScannerProps {
  onBack: () => void;
  selectedPatient?: Patient;
  openmrsCredentials: OpenMRSCredentials;
}

const ShenAIScanner: React.FC<ShenAIScannerProps> = ({
  onBack,
  selectedPatient,
  openmrsCredentials,
}) => {
  const [initResult, setInitResult] = useState<InitializationResult | null | false>(null);
  const [scannerLoading, setScannerLoading] = useState(false);
  const [measurementSent, setMeasurementSent] = useState(false);
  const [measurementResults, setMeasurementResults] = useState<MeasurementResult | null>(null);
  const [isSendingMeasurement, setIsSendingMeasurement] = useState(false);

  const shenaiService = new ShenAIService();
  const openmrsService = new OpenMRSService(openmrsCredentials);
  const { useRealtimeHeartRate, useMeasurementResults } = shenaiService.getHooks();

  // Shen AI SDK hooks
  const hr = useRealtimeHeartRate();
  const results = useMeasurementResults();

  useEffect(() => {
    initializeShenAiSdk();
    return () => {
      shenaiService.cleanup();
    };
  }, []);

  useEffect(() => {
    if (results && !measurementSent && selectedPatient && !isSendingMeasurement) {
      console.log("📡 Sending measurement to OpenMRS", results);
      const processedResults = shenaiService.processMeasurementResults(results, hr || undefined);
      setMeasurementResults(processedResults);
      
      // Add a small delay to prevent rapid-fire requests
      const timeoutId = setTimeout(() => {
        sendMeasurementToOpenMRS(processedResults);
      }, 1000); // 1 second delay
      
      return () => clearTimeout(timeoutId);
    }
  }, [results, measurementSent, selectedPatient, isSendingMeasurement]);

  const initializeShenAiSdk = async () => {
    setScannerLoading(true);
    try {
      const result = await shenaiService.initialize();
      setInitResult(result);
      setMeasurementSent(false);
    } catch (error) {
      console.error("ShenAI initialization error:", error);
      setInitResult(false);
    } finally {
      setScannerLoading(false);
    }
  };

  const sendMeasurementToOpenMRS = async (results: MeasurementResult) => {
    if (!selectedPatient) {
      Alert.alert('Error', 'Please select a patient first');
      return;
    }

    if (isSendingMeasurement) {
      console.log('⏳ Measurement already being sent, skipping...');
      return;
    }

    setIsSendingMeasurement(true);
    const MAX_RETRY_ATTEMPTS = 3;
    let attemptCount = 0;

    const visitData = {
      patientUuid: selectedPatient.uuid,
      measurements: {
        timestamp: Date.now(),
        hrv_sdnn_ms: results.hrvSdnnMs,
        heart_rate_bpm: results.heartRate,
        breathing_rate_bpm: results.breathingRate,
        blood_pressure_mmhg: {
          systolic: results.systolicBloodPressureMmhg,
          diastolic: results.diastolicBloodPressureMmhg,
        },
      },
    };

    try {
      while (attemptCount < MAX_RETRY_ATTEMPTS) {
        try {
          attemptCount++;
          console.log(`🔄 Attempt ${attemptCount}/${MAX_RETRY_ATTEMPTS} to send measurement to OpenMRS`);
          
          const response = await openmrsService.createVisit(visitData);
          console.log("✅ Successfully created visit in OpenMRS:", response);
          setMeasurementSent(true);
          Alert.alert('Success', 'Measurement data sent to OpenMRS successfully!');
          
          // Reset after 5 seconds to allow new measurements
          setTimeout(() => {
            setMeasurementSent(false);
          }, 5000);
          
          return; // Success, exit the retry loop
        } catch (error) {
          console.error(`❌ Error sending measurement to OpenMRS (attempt ${attemptCount}/${MAX_RETRY_ATTEMPTS}):`, error);
          
          // Check if it's a visit overlap error
          const errorMessage = (error as any)?.message || '';
          if (errorMessage.includes('overlap') || errorMessage.includes('Visit.visitCannotOverlapAnotherVisitOfTheSamePatient')) {
            console.log('🔄 Visit overlap detected, retrying with cleanup...');
            // For overlap errors, we can retry immediately since the service now handles cleanup
            continue;
          }
          
          if (attemptCount >= MAX_RETRY_ATTEMPTS) {
            // Final attempt failed
            Alert.alert(
              'Error', 
              `Failed to send measurement to OpenMRS after ${MAX_RETRY_ATTEMPTS} attempts. Please check your connection and try again.`
            );
          } else {
            // Wait a bit before retrying (exponential backoff)
            const delayMs = Math.pow(2, attemptCount) * 1000; // 2s, 4s, 8s
            console.log(`⏳ Waiting ${delayMs}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
          }
        }
      }
    } finally {
      setIsSendingMeasurement(false);
    }
  };

  const sendMockMeasurement = async () => {
    if (!selectedPatient) {
      Alert.alert('Error', 'Please select a patient first');
      return;
    }

    console.log("🧪 Sending mock measurement data to OpenMRS");
    
    const mockResults: MeasurementResult = {
      heartRate: 72,
      systolicBloodPressureMmhg: 118,
      diastolicBloodPressureMmhg: 78,
      hrvSdnnMs: 42.5,
      breathingRate: 16,
    };

    // Set the mock results to display them
    setMeasurementResults(mockResults);
    
    await sendMeasurementToOpenMRS(mockResults);
  };

  const sendConservativeMockMeasurement = async () => {
    if (!selectedPatient) {
      Alert.alert('Error', 'Please select a patient first');
      return;
    }

    console.log("🧪 Sending conservative mock measurement data to OpenMRS");
    
    const mockResults: MeasurementResult = {
      heartRate: 65,
      systolicBloodPressureMmhg: 110,
      diastolicBloodPressureMmhg: 70,
      hrvSdnnMs: 35.0,
      breathingRate: 14,
    };

    // Set the mock results to display them
    setMeasurementResults(mockResults);
    
    await sendMeasurementToOpenMRS(mockResults);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scannerHeader}>
        <Text style={styles.scannerTitle}>Shen AI Scanner</Text>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>

      {selectedPatient && (
        <View style={styles.patientInfo}>
          <Text style={styles.patientInfoText}>
            Patient: {selectedPatient.given_name} {selectedPatient.family_name}
          </Text>
        </View>
      )}
      
      {scannerLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Initializing Shen AI SDK...</Text>
        </View>
      )}
      
      {initResult === false && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Shen AI SDK initialization failed</Text>
          <TouchableOpacity style={styles.retryButton} onPress={initializeShenAiSdk}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.debugButton} 
            onPress={sendMockMeasurement}
            disabled={isSendingMeasurement}
          >
            <Text style={styles.debugButtonText}>
              {isSendingMeasurement ? 'Sending...' : '🧪 Send Mock Data (Debug)'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.debugButton, { backgroundColor: '#FF6B35', marginTop: 10 }]} 
            onPress={sendConservativeMockMeasurement}
            disabled={isSendingMeasurement}
          >
            <Text style={styles.debugButtonText}>
              {isSendingMeasurement ? 'Sending...' : '🧪 Send Conservative Data'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {initResult === null && !scannerLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Initializing...</Text>
          <TouchableOpacity 
            style={styles.debugButton} 
            onPress={sendMockMeasurement}
            disabled={isSendingMeasurement}
          >
            <Text style={styles.debugButtonText}>
              {isSendingMeasurement ? 'Sending...' : '🧪 Send Mock Data'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.debugButton, { backgroundColor: '#FF6B35', marginTop: 10 }]} 
            onPress={sendConservativeMockMeasurement}
            disabled={isSendingMeasurement}
          >
            <Text style={styles.debugButtonText}>
              {isSendingMeasurement ? 'Sending...' : '🧪 Send Conservative Data'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {hr && (
        <View style={styles.measurementDisplay}>
          <Text style={styles.measurementText}>Heart Rate: {hr} BPM</Text>
        </View>
      )}
      
      {initResult === 0 && (
        <>
          <ShenaiSdkView style={styles.scannerView} />
          <TouchableOpacity 
            style={styles.debugButton} 
            onPress={sendMockMeasurement}
            disabled={isSendingMeasurement}
          >
            <Text style={styles.debugButtonText}>
              {isSendingMeasurement ? 'Sending...' : '🧪 Send Mock Data'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.debugButton, { backgroundColor: '#FF6B35', marginTop: 10 }]} 
            onPress={sendConservativeMockMeasurement}
            disabled={isSendingMeasurement}
          >
            <Text style={styles.debugButtonText}>
              {isSendingMeasurement ? 'Sending...' : '🧪 Send Conservative Data'}
            </Text>
          </TouchableOpacity>
        </>
      )}
      
      {measurementResults && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Measurement Results:</Text>
          <Text style={styles.resultsText}>HRV: {measurementResults?.hrvSdnnMs} MS</Text>
          <Text style={styles.resultsText}>
            BP: {measurementResults?.systolicBloodPressureMmhg} / {measurementResults?.diastolicBloodPressureMmhg} MMHG
          </Text>
          {measurementSent && (
            <Text style={styles.sentText}>✅ Sent to OpenMRS</Text>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  scannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
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
  patientInfo: {
    padding: 12,
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  patientInfoText: {
    color: '#34C759',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: 'white',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#FF3B30',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scannerView: {
    flex: 1,
    width: '100%',
  },
  measurementDisplay: {
    position: 'absolute',
    top: 120,
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
  sentText: {
    color: '#34C759',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
  debugButton: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: '#FF9500',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    zIndex: 1000,
  },
  debugButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ShenAIScanner; 