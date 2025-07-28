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
  private onFlowFinishedCallback: ((results: any) => void) | null = null;

  async initialize(): Promise<InitializationResult> {
    try {
      // Set up event listener
      this.eventSubscription = sdkEventEmitter.addListener("ShenAIEvent", (event) => {
        const eventName = event?.EventName;
        if (eventName) {
          // Handle USER_FLOW_FINISHED event
          if (eventName === "USER_FLOW_FINISHED") {
            if (this.onFlowFinishedCallback) {
              this.onFlowFinishedCallback(event);
            }
          }
        }
      });

      console.log("Initializing Shen AI SDK");
      const result = await initialize(SHENAI_API_KEY, "", {
        measurementPreset: 5, // THIRTY_SECONDS_UNVALIDATED
      });
      return result;
    } catch (error) {
      console.error("ShenAI initialization error:", error);
      throw error;
    }
  }

  // Set callback for when flow finishes
  setOnFlowFinishedCallback(callback: (results: any) => void) {
    this.onFlowFinishedCallback = callback;
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
      heartRate: results?.heartRateBpm ?? heartRate ?? undefined,
      breathingRate: results?.breathingRateBpm ?? undefined,
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