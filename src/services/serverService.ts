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

    console.log(`Sending message to: ${this.baseUrl}/shenai/measurements`);
    console.log(`Message: ${message}`);

    const response = await fetch(`${this.baseUrl}/shenai/measurements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    console.log(`Response status: ${response.status}`);

    const data = await response.json();
    console.log(`Response data:`, data);

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

    console.log("📦 Sending measurement payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(`${this.baseUrl}/shenai/measurements`, {
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
      throw new Error(`Failed to send measurement data: ${errorText}`);
    }

    console.log("✅ Successfully sent measurement data to server");
  }
}

export default ServerService; 