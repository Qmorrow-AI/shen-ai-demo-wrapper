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
import { MeasurementResult, Patient, MeasurementData } from '../types';
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
  const [hasProcessedFinalResults, setHasProcessedFinalResults] = useState(false);

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
  }, []); // Only run once on mount

  useEffect(() => {
    if (results) {
      console.log("📡 Raw SDK results:", results);
      console.log("📡 Real-time heart rate:", hr);
      // Process results when they come in
      const processedResults = shenaiService.processMeasurementResults(results, hr || undefined);
      setMeasurementResults(processedResults);
      
      // Auto-send only if we have valid measurement data and haven't sent yet
      const hasValidData = processedResults.heartRate || processedResults.systolicBloodPressureMmhg || 
                          processedResults.diastolicBloodPressureMmhg || processedResults.breathingRate || 
                          processedResults.hrvSdnnMs;
      
      if (selectedPatient && !measurementSent && !isSendingMeasurement && hasValidData && !hasProcessedFinalResults) {
        console.log("📡 Auto-sending measurement results");
        setHasProcessedFinalResults(true);
        sendMeasurementToOpenMRS(processedResults);
      }
    }
  }, [results, hr, selectedPatient, measurementSent, isSendingMeasurement, hasProcessedFinalResults]);

  // Manual send function for testing
  const manualSendMeasurement = () => {
    if (measurementResults && selectedPatient) {
      console.log("📡 Manual send triggered");
      sendMeasurementToOpenMRS(measurementResults);
    } else {
      Alert.alert('Error', 'No measurement results available to send');
    }
  };

  const initializeShenAiSdk = async () => {
    setScannerLoading(true);
    try {
      const result = await shenaiService.initialize();
      setInitResult(result);
      setMeasurementSent(false);
      setHasProcessedFinalResults(false);
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
      return;
    }

    setIsSendingMeasurement(true);

    // Create measurement data in the same format as mock data
    const measurementData: MeasurementData = {
      heartRate: results.heartRate || 0,
      systolicBloodPressureMmhg: results.systolicBloodPressureMmhg || 0,
      diastolicBloodPressureMmhg: results.diastolicBloodPressureMmhg || 0,
      hrvSdnnMs: results.hrvSdnnMs || 0,
      breathingRate: results.breathingRate || 0,
    };

    console.log("📡 Measurement data being sent:", measurementData);

    const visitData = {
      patientUuid: selectedPatient.uuid,
      measurements: {
        timestamp: Date.now(),
        hrv_sdnn_ms: measurementData.hrvSdnnMs > 0 ? measurementData.hrvSdnnMs : undefined,
        heart_rate_bpm: measurementData.heartRate > 0 ? measurementData.heartRate : undefined,
        breathing_rate_bpm: measurementData.breathingRate > 0 ? measurementData.breathingRate : undefined,
        blood_pressure_mmhg: {
          systolic: measurementData.systolicBloodPressureMmhg > 0 ? measurementData.systolicBloodPressureMmhg : undefined,
          diastolic: measurementData.diastolicBloodPressureMmhg > 0 ? measurementData.diastolicBloodPressureMmhg : undefined,
        },
      },
    };

    console.log("📡 Visit data being sent:", JSON.stringify(visitData, null, 2));

    // Check if we have any valid measurements before sending
    const hasValidMeasurements = (
      (measurementData.heartRate > 0) ||
      (measurementData.systolicBloodPressureMmhg > 0) ||
      (measurementData.diastolicBloodPressureMmhg > 0) ||
      (measurementData.breathingRate > 0) ||
      (measurementData.hrvSdnnMs > 0)
    );

    if (!hasValidMeasurements) {
      Alert.alert('Error', 'No valid measurement data available to send. Please complete a scan first.');
      setIsSendingMeasurement(false);
      return;
    }

    try {
      const response = await openmrsService.createVisit(visitData);
      setMeasurementSent(true);
      Alert.alert(
        '✅ Success', 
        'Real scan measurement data sent to OpenMRS successfully!\n\n' +
        `Patient: ${selectedPatient.given_name} ${selectedPatient.family_name}\n` +
        `Heart Rate: ${measurementData.heartRate} BPM\n` +
        `Blood Pressure: ${measurementData.systolicBloodPressureMmhg}/${measurementData.diastolicBloodPressureMmhg} mmHg\n` +
        `Breathing Rate: ${measurementData.breathingRate} BPM\n` +
        `HRV SDNN: ${measurementData.hrvSdnnMs} ms`
      );
      
      // Reset after 5 seconds to allow new measurements
      setTimeout(() => {
        setMeasurementSent(false);
      }, 5000);
    } catch (error: any) {
      console.error('Error sending measurement data:', error);
      Alert.alert('Error', `Failed to send measurement data: ${error.message}`);
    } finally {
      setIsSendingMeasurement(false);
    }
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
        </View>
      )}
      
      {initResult === null && !scannerLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Initializing...</Text>
        </View>
      )}
      
      {initResult === 0 && (
        <View style={styles.scannerContainer}>
          {hr && (
            <View style={styles.measurementDisplay}>
              <Text style={styles.measurementText}>Heart Rate: {hr} BPM</Text>
            </View>
          )}
          
          <ShenaiSdkView style={styles.scannerView} />
        </View>
      )}
      
      {measurementResults && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Measurement Results:</Text>
          <Text style={styles.resultsText}>Heart Rate: {measurementResults?.heartRate || 'N/A'} BPM</Text>
          <Text style={styles.resultsText}>HRV SDNN: {measurementResults?.hrvSdnnMs || 'N/A'} ms</Text>
          <Text style={styles.resultsText}>
            BP: {measurementResults?.systolicBloodPressureMmhg || 'N/A'} / {measurementResults?.diastolicBloodPressureMmhg || 'N/A'} mmHg
          </Text>
          <Text style={styles.resultsText}>Breathing Rate: {measurementResults?.breathingRate || 'N/A'} BPM</Text>
          {measurementSent && (
            <Text style={styles.sentText}>✅ Successfully sent to OpenMRS</Text>
          )}
          
          <TouchableOpacity 
            style={styles.manualSendButton} 
            onPress={manualSendMeasurement}
            disabled={isSendingMeasurement}>
            <Text style={styles.manualSendButtonText}>
              {isSendingMeasurement ? 'Sending...' : '📤 Manual Send to OpenMRS'}
            </Text>
          </TouchableOpacity>
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
  scannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  scannerView: {
    flex: 1,
    width: '100%',
  },
  measurementDisplay: {
    position: 'absolute',
    top: 20,
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
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
  manualSendButton: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  manualSendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ShenAIScanner; 