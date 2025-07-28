import { NativeEventEmitter, NativeModules } from "react-native";
import {
  initialize,
  MeasurementPreset,
  useRealtimeHeartRate,
  useMeasurementResults,
  InitializationResult,
} from "react-native-shenai-sdk";
import { MeasurementResult } from '../types';
import { SHENAI_API_KEY } from '../constants';

const { ShenaiSdkNativeModule } = NativeModules;
const sdkEventEmitter = new NativeEventEmitter(ShenaiSdkNativeModule);

class ShenAIService {
  private eventSubscription: any = null;

  async initialize(): Promise<InitializationResult> {
    try {
      // Set up event listener
      this.eventSubscription = sdkEventEmitter.addListener("ShenAIEvent", (event) => {
        const eventName = event?.EventName;
        if (eventName) {
          console.log("ShenAI Event:", eventName);
        }
      });

      console.log("Initializing Shen AI SDK");
      const result = await initialize(SHENAI_API_KEY, "", {
        measurementPreset: MeasurementPreset.THIRTY_SECONDS_UNVALIDATED,
      });
      console.log("Initialization result", result);
      return result;
    } catch (error) {
      console.error("ShenAI initialization error:", error);
      throw error;
    }
  }

  cleanup() {
    if (this.eventSubscription) {
      this.eventSubscription.remove();
      this.eventSubscription = null;
    }
  }

  // Hooks for React components
  getHooks() {
    return {
      useRealtimeHeartRate,
      useMeasurementResults,
    };
  }

  // Process measurement results into standardized format
  processMeasurementResults(results: any, heartRate?: number): MeasurementResult {
    return {
      hrvSdnnMs: results?.hrvSdnnMs ?? undefined,
      systolicBloodPressureMmhg: results?.systolicBloodPressureMmhg ?? undefined,
      diastolicBloodPressureMmhg: results?.diastolicBloodPressureMmhg ?? undefined,
      heartRate: heartRate ?? undefined,
    };
  }

  // Create payload for server transmission
  createMeasurementPayload(results: MeasurementResult) {
    return {
      timestamp: Date.now(),
      hrv_sdnn_ms: results.hrvSdnnMs,
      heart_rate_bpm: results.heartRate,
      blood_pressure_mmhg: {
        systolic: results.systolicBloodPressureMmhg,
        diastolic: results.diastolicBloodPressureMmhg,
      },
    };
  }
}

export default ShenAIService; 