import { MeasurementResult } from '../types';

class ServerService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  updateBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async sendMessage(message: string): Promise<string> {
    if (!message.trim()) {
      throw new Error('Message cannot be empty');
    }

    if (!this.baseUrl) {
      throw new Error('Server URL not configured');
    }

    const response = await fetch(`${this.baseUrl}/shenai/measurements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || 'Unknown server error');
    }

    return data?.response || 'Success';
  }

  async sendMeasurementData(results: MeasurementResult): Promise<void> {
    if (!this.baseUrl) {
      throw new Error('Server URL not configured');
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

    const response = await fetch(`${this.baseUrl}/shenai/measurements`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.warn("❌ Failed to send Shen-AI data:", errorText);
      throw new Error(`Failed to send measurement data: ${errorText}`);
    }
  }
}

export default ServerService; 