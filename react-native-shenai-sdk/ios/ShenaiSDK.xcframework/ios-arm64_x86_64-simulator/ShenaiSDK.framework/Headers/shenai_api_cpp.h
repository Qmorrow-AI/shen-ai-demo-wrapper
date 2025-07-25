#pragma once

#include <any>
#include <functional>
#include <optional>
#include <string>
#include <vector>

#include "bmi.h"
#include "health_risks.h"

#define SHEN_PUBLIC_API __attribute__((visibility("default"))) __attribute__((used))

/**
 * This is a minimal C++ API surface for Shen AI SDK.
 * Only one instance of the SDK exists at a time.
 */

namespace shen {

/**
 * The precision mode of the SDK.
 */
enum class PrecisionMode { Strict = 0, Relaxed };

/**
 * The current screen displayed by the SDK.
 */
enum class Screen {
  Initialization = 0,
  Onboarding,
  Measurement,
  Instructions,
  Results,
  HealthRisks,
  HealthRisksEdit,
  CalibrationOnboarding,
  CalibrationFinish,
  EnterId,
  CalibrationDataEntry,
  History,
};

/**
 * The operating mode of the SDK.
 */
enum class OperatingMode { Positioning = 0, Measure, SystemOverloaded };

/**
 * The available metrics for the measurement session.
 */
enum class Metric {
  HeartRate,
  HrvSdnn,
  BreathingRate,
  SystolicBp,
  DiastolicBp,
  CardiacStress,
  PnsActivity,
  CardiacWorkload,
  Age,
  Bmi,
  BloodPressure
};

/**
 * The available health indices the measurement session.
 */

enum class HealthIndex {
  WellnessScore,
  VascularAge,
  CardiovascularDiseaseRisk,
  HardAndFatalEventsRisks,
  CardiovascularRiskScore,
  WaistToHeightRatio,
  BodyFatPercentage,
  BodyRoundnessIndex,
  ABodyShapeIndex,
  ConicityIndex,
  BasalMetabolicRate,
  TotalDailyEnergyExpenditure,
  HypertensionRisk,
  DiabetesRisk,
  NonAlcoholicFattyLiverDiseaseRisk
};

/**
 * Publicly available presets for the measurement session.
 */
enum class MeasurementPreset {
  OneMinuteHrHrvBr = 0,
  OneMinuteBetaMetrics,
  InfiniteHr,
  InfiniteMetrics,
  FourtyFiveSecondsUnvalidated,
  ThirtySecondsUnvalidated,
  Custom,
  OneMinuteAllMetrics,
  FourtyFiveSecondsAllMetrics,
  ThirtySecondsAllMetrics
};

/*
 * SDK flow mode
 */
enum class InitializationMode { Measurement = 0, Calibration, CalibratedMeasurement };

/*
 * Calibration state
 */
enum class CalibrationState { Calibrated = 0, NotCalibrated, Outdated };

/**
 * Configuration for a custom measurement session.
 */
struct custom_measurement_config {
  std::optional<float> duration_seconds;
  std::optional<bool> infinite_measurement;

  std::vector<Metric> instant_metrics;
  std::vector<Metric> summary_metrics;
  std::vector<HealthIndex> health_indices;

  std::optional<float> realtime_hr_period_seconds;
  std::optional<float> realtime_hrv_period_seconds;
  std::optional<float> realtime_cardiac_stress_period_seconds;
};

/**
 * Calibration result data
 */
struct calibration_data {
  std::vector<std::string> sbps, dbps, pulses, sdk_sbps, sdk_dbps, sdk_pulses, measurement_ids;
  std::string trace_id;
};

/**
 * Configuration for a custom color theme.
 */
struct custom_color_theme {
  std::string theme_color;
  std::string text_color;
  std::string background_color;
  std::string tile_color;
};

/**
 * Camera modes for the SDK.
 */
enum class CameraMode { Off = 0, FacingUser, FacingEnvironment, DeviceId, MediaStream };

/**
 * User onboarding mode
 */
enum class OnboardingMode { Hidden = 0, ShowOnce, ShowAlways };

/**
 * Events that can be sent to the event callback.
 */
enum class Event { START_BUTTON_CLICKED, STOP_BUTTON_CLICKED, MEASUREMENT_FINISHED, USER_FLOW_FINISHED };

/**
 * Additional settings for the initialization.
 */
struct initialization_settings {
  PrecisionMode precisionMode{PrecisionMode::Strict};
  OperatingMode operatingMode{OperatingMode::Positioning};
  MeasurementPreset measurementPreset{MeasurementPreset::OneMinuteBetaMetrics};
  CameraMode cameraMode{CameraMode::FacingUser};
  OnboardingMode onboardingMode{OnboardingMode::ShowOnce};
  InitializationMode initializationMode{InitializationMode::Measurement};

  bool showUserInterface{true};
  bool showFacePositioningOverlay{true};
  bool showVisualWarnings{true};
  bool enableCameraSwap{true};
  bool showFaceMask{true};
  bool showBloodFlow{true};
  bool proVersionLock{false};
  bool hideShenaiLogo{true};
  bool enableStartAfterSuccess{true};
  bool enableSummaryScreen{true};
  bool enableHealthRisks{true};
  bool showOutOfRangeResultIndicators{true};
  bool showTrialMetricLabels{false};
  bool enableFullFrameProcessing{false};
  bool showSignalQualityIndicator{true};
  bool showSignalTile{true};

  std::string language{"auto"};
  std::optional<custom_measurement_config> customMeasurementConfig;
  std::optional<custom_color_theme> customColorTheme;
  std::optional<mx::health_risks::RisksFactors> risksFactors;

  std::function<void(Event)> eventCallback;

  bool offlineProcessing{false};
};

/**
 * The result of the SDK initialization.
 */
enum class InitializationResult { Success = 0, FailureInvalidApiKey, FailureConnectionError, FailureInternalError };

/**
 * Gets version of the SDK.
 */
SHEN_PUBLIC_API std::string GetVersion();

/**
 * Initializes the SDK.
 * This function must be called before any other function in this API (except for IsInitialized()).
 *
 * @param api_key The API key to use for license validation.
 * @param user_id The user ID to use for license validation (optional).
 * @param settings Additional settings for the initialization (optional).
 * @return The result of the initialization. If the SDK has previously been initialized and not deinitialized, this
 * function will return Success immediately.
 */
SHEN_PUBLIC_API InitializationResult Initialize(std::string api_key, std::string user_id = "",
                                                initialization_settings settings = {});

/**
 * Checks if the SDK has been successfully initialized.
 * @return True if the SDK has been successfully initialized, false otherwise.
 */
SHEN_PUBLIC_API bool IsInitialized();

/**
 * Deinitializes the SDK, releasing all resources.
 * This function must be called before the application exits.
 */
SHEN_PUBLIC_API void Deinitialize();

/**
 * Terminates tracing and sends remaining telemetry data to the server.
 * To be used as a last measure if the SDK wasn't deinitialized and the runtime is about to be terminated.
 */
SHEN_PUBLIC_API void FinalizeTracing();

/**
 * Gets current SDK config string.
 * @return Current SDK config string.
 */
SHEN_PUBLIC_API std::string GetSDKConfigString();

/**
 * Applies an SDK configuration.
 * @param config_json The SDK configuration JSON string to apply.
 */
SHEN_PUBLIC_API void ApplySDKConfig(std::string config_json);

/**
 * Sets the operational mode of the SDK.
 * @param mode The operational mode to set.
 */
SHEN_PUBLIC_API void SetOperatingMode(OperatingMode mode);

/**
 * Gets the operational mode of the SDK.
 * @return The operational mode of the SDK.
 */
SHEN_PUBLIC_API OperatingMode GetOperatingMode();

/**
 * Sets the view mode of the SDK.
 * @param mode The view mode to set.
 */
SHEN_PUBLIC_API void SetScreen(Screen screen);

/**
 * Gets the view mode of the SDK.
 * @return The view mode of the SDK.
 */
SHEN_PUBLIC_API Screen GetScreen();

/**
 * Sets the precision mode of the SDK.
 * @param mode The precision mode to set.
 */
SHEN_PUBLIC_API void SetPrecisionMode(PrecisionMode mode);

/**
 * Gets the precision mode of the SDK.
 * @return The precision mode of the SDK.
 */
SHEN_PUBLIC_API PrecisionMode GetPrecisionMode();

/**
 * Sets the measurement preset of the SDK.
 * @param preset The measurement preset to set.
 */
SHEN_PUBLIC_API void SetMeasurementPreset(MeasurementPreset preset);

/**
 * @brief Sets the BP calibration offset of the SDK.
 *
 * @param systolic_offset The systolic pressure calibration offset to set.
 * @param diastolic_offset The diastolic pressure calibration offset to set.
 */
SHEN_PUBLIC_API void SetBpCalibrationOffset(double systolic_offset, double diastolic_offset);

/**
 * Sets the custom measurement configuration of the SDK.
 * Causes the SDK to enter Custom measurement mode.
 * @param config The custom measurement configuration to set.
 */
SHEN_PUBLIC_API void SetCustomMeasurementConfig(custom_measurement_config config);

/**
 * Gets the custom measurement configuration of the SDK.
 * @return The custom measurement configuration of the SDK.
 */
SHEN_PUBLIC_API custom_measurement_config GetCustomMeasurementConfig();

/**
 * Gets the measurement preset of the SDK.
 * @return The measurement preset of the SDK.
 */
SHEN_PUBLIC_API MeasurementPreset GetMeasurementPreset();

/**
 * Sets the camera mode of the SDK.
 * @param mode The camera mode to set.
 */
SHEN_PUBLIC_API void SetCameraMode(CameraMode mode);

/**
 * Gets the camera mode of the SDK.
 * @return The camera mode of the SDK.
 */
SHEN_PUBLIC_API CameraMode GetCameraMode();

/**
 *  Selects the camera by ID (and changes to DeviceID mode if needed)
 *  and optionally specifies whether the camera is facing the user
 * @param device_id The ID of the selected camera device.
 * @param facing_user Whether the camera is facing the user.
 */
SHEN_PUBLIC_API void SelectCameraByDeviceId(std::string device_id, std::optional<bool> facing_user = std::nullopt);

/**
 *  Sets custom media stream as camera input (and changes to MediaStream mode if needed)
 *  and optionally specifies whether the camera is facing the user
 * @param stream The custom media stream object (platform-specific).
 * @param facing_user Whether the camera is facing the user.
 */
SHEN_PUBLIC_API void SetMediaStream(std::any stream, std::optional<bool> facing_user = std::nullopt);

/**
 * Sets the custom color theme of the SDK.
 * @param theme The custom color theme to set.
 */
SHEN_PUBLIC_API void SetCustomColorTheme(custom_color_theme theme);

/**
 * Gets the custom color theme of the SDK.
 * @return The custom color theme of the SDK.
 */
SHEN_PUBLIC_API custom_color_theme GetCustomColorTheme();

/**
 * Sets whether the user interface should be shown.
 * @param show True if the user interface should be shown, false otherwise.
 */
SHEN_PUBLIC_API void SetShowUserInterface(bool show);

/**
 * Gets whether the user interface should be shown.
 * @return True if the user interface should be shown, false otherwise.
 */
SHEN_PUBLIC_API bool GetShowUserInterface();

/**
 * Sets whether the face positioning interface should be shown.
 * @param show True if the face positioning interface should be shown, false otherwise.
 */
SHEN_PUBLIC_API void SetShowFacePositioningOverlay(bool show);

/**
 * Gets whether the face positioning interface should be shown.
 * @return True if the face positioning interface should be shown, false otherwise.
 */
SHEN_PUBLIC_API bool GetShowFacePositioningOverlay();

/**
 * Sets whether the visual warnings should be shown.
 * @param show True if the visual warnings should be shown, false otherwise.
 */
SHEN_PUBLIC_API void SetShowVisualWarnings(bool show);

/**
 * Gets whether the visual warnings should be shown.
 * @return True if the visual warnings should be shown, false otherwise.
 */
SHEN_PUBLIC_API bool GetShowVisualWarnings();

/**
 * Sets whether the camera swap button should be shown.
 * @param enable True if the camera swap button should be shown, false otherwise.
 */
SHEN_PUBLIC_API void SetEnableCameraSwap(bool enable);

/**
 * Gets whether the camera swap button should be shown.
 * @return True if the camera swap button should be shown, false otherwise.
 */
SHEN_PUBLIC_API bool GetEnableCameraSwap();

/**
 * Sets whether the face mask should be shown.
 * @param show True if the face mask should be shown, false otherwise.
 */
SHEN_PUBLIC_API void SetShowFaceMask(bool show);

/**
 * Gets whether the face mask should be shown.
 * @return True if the face mask should be shown, false otherwise.
 */
SHEN_PUBLIC_API bool GetShowFaceMask();

/**
 * Sets whether the blood flow visualization should be shown.
 * @param show True if the blood flow should be shown, false otherwise.
 */
SHEN_PUBLIC_API void SetShowBloodFlow(bool show);

/**
 * Gets whether the blood flow visualization should be shown.
 * @return True if the blood flow should be shown, false otherwise.
 */
SHEN_PUBLIC_API bool GetShowBloodFlow();

/**
 * Sets whether it should be possible to start another measurement after the measurement has succeeded.
 * @param show True if it should be possible to start another measurement after the measurement has succeeded, false
 */
SHEN_PUBLIC_API void SetEnableStartAfterSuccess(bool show);

/**
 * Gets whether it should be possible to start another measurement after the measurement has succeeded.
 * @return True if it should be possible to start another measurement after the measurement has succeeded, false
 * otherwise.
 */
SHEN_PUBLIC_API bool GetEnableStartAfterSuccess();

SHEN_PUBLIC_API void SetHideShenaiLogo(bool hide);
SHEN_PUBLIC_API bool GetHideShenaiLogo();
SHEN_PUBLIC_API void SetShowOutOfRangeResultIndicators(bool show);
SHEN_PUBLIC_API bool GetShowOutOfRangeResultIndicators();
SHEN_PUBLIC_API void SetShowTrialMetricLabels(bool show);
SHEN_PUBLIC_API bool GetShowTrialMetricLabels();
SHEN_PUBLIC_API void SetShowSignalTile(bool show);
SHEN_PUBLIC_API bool GetShowSignalTile();
SHEN_PUBLIC_API void SetShowSignalQualityIndicator(bool show);
SHEN_PUBLIC_API bool GetShowSignalQualityIndicator();

/**
 * Face states for the SDK.
 */
enum class FaceState { Ok = 0, TooFar, TooClose, NotCentered, NotVisible, TurnedAway, Unknown };

/**
 * Gets the current face state.
 * @return The current face state.
 */
SHEN_PUBLIC_API FaceState GetFaceState();

struct NormalizedFaceBbox {
  float x;
  float y;
  float width;
  float height;
};

/**
 * Gets the current face bounding box.
 * @return The current face bounding box.
 */
SHEN_PUBLIC_API std::optional<NormalizedFaceBbox> GetNormalizedFaceBbox();

enum class MeasurementState {
  NotStarted = 0,                  // Measurement has not started yet
  WaitingForFace,                  // Waiting for face to be properly positioned in the frame
  RunningSignalShort,              // Measurement started: Signal is too short for any conclusions
  RunningSignalGood,               // Measurement proceeding: Signal quality is good
  RunningSignalBad,                // Measurement stalled due to poor signal quality
  RunningSignalBadDeviceUnstable,  // Measurement stalled due to poor signal quality (because of unstable device)
  Finished,                        // Measurement has finished successfully
  Failed,                          // Measurement has failed
};

/**
 * Gets the current measurement state.
 * @return The current measurement state.
 */
SHEN_PUBLIC_API MeasurementState GetMeasurementState();

/**
 * Gets the current measurement progress percentage.
 * @return The current measurement progress percentage.
 */
SHEN_PUBLIC_API float GetMeasurementProgressPercentage();

/**
 * Gets the current heart rate based on the last 10 seconds of signal
 * @return The current heart rate based on the last 10 seconds of signal
 */
SHEN_PUBLIC_API std::optional<int> GetHeartRate10s();

/**
 * Gets the current heart rate based on the last 4 seconds of signal
 * @return The current heart rate based on the last 4 seconds of signal
 */
SHEN_PUBLIC_API std::optional<int> GetHeartRate4s();

/**
 * Gets the current heart rate based on the last N seconds of signal (N=10 or as specified in custom measurement config)
 * @return The current heart rate
 */
SHEN_PUBLIC_API std::optional<int> GetRealtimeHeartRate();

/**
 * Gets the current HRV SDNN based on the last N seconds of signal (N=30 or as specified in custom measurement config)
 * @return The current HRV SDNN
 */
SHEN_PUBLIC_API std::optional<double> GetRealtimeHrvSdnn();

/**
 * Gets the current Cardiac Stress Index based on the last N seconds of signal (N=30 or as specified in custom
 * measurement config)
 * @return The current Cardiac Stress Index
 */
SHEN_PUBLIC_API std::optional<double> GetRealtimeCardiacStress();

struct heartbeat {
  double start_location_sec;  // exact start location in seconds
  double end_location_sec;    // exact end location in seconds
  double duration_ms;         // heartbeat duration, rounded to 1 ms
};

struct measurement_results {
  double heart_rate_bpm;                                // Heart rate, rounded to 1 BPM
  std::optional<double> hrv_sdnn_ms;                    // Heart rate variability, SDNN metric, rounded to 1 ms
  std::optional<double> hrv_lnrmssd_ms;                 // Heart rate variability, lnRMSSD metric, rounded to 0.1 ms
  std::optional<double> stress_index;                   // Cardiac Stress, rounded to 0.1
  std::optional<double> parasympathetic_activity;       // Parasympathetic activity, rounded to 1%
  std::optional<double> breathing_rate_bpm;             // Breathing rate, rounded to 1 BPM
  std::optional<double> systolic_blood_pressure_mmhg;   // Systolic blood pressure, rounded to 1 mmHg
  std::optional<double> diastolic_blood_pressure_mmhg;  // Diastolic blood pressure, rounded to 1 mmHg
  std::optional<double> cardiac_workload_mmhg_per_sec;  // Cardiac workload, rounded to 1 mmHg/s
  std::optional<double> age_years;                      // Age, rounded to 1 year
  std::optional<double> bmi_kg_per_m2;                  // BMI, rounded to 0.01 kg/m^2
  std::optional<mx::BmiCategory> bmi_category;          // BMI category
  std::optional<double> weight_kg;                      // Weight, rounded to 1 kg
  std::optional<double> height_cm;                      // Height, rounded to 1 cm
  std::vector<heartbeat> heartbeats;                    // Heartbeat locations
  double average_signal_quality;                        // Average signal quality metric value
};

struct measurement_results_with_metadata {
  measurement_results measurement_results;
  int epoch_timestamp;
  bool is_calibration;
};

struct measurement_results_history {
  std::vector<measurement_results_with_metadata> history;
};

struct vector3d {
  float x, y, z;
};
struct euler_angles {
  float yaw, pitch, roll;
};
struct face_pose {
  vector3d position;
  euler_angles rotation;
};

/**
 * Gets the realtime heartbeat metrics based on the last `period_sec` seconds of signal
 * @param period_sec The duration in seconds of the period of interest
 * @return The realtime heartbeat metrics based on the last `period_sec` seconds of signal
 */
SHEN_PUBLIC_API std::optional<measurement_results> GetRealtimeMetrics(float period_sec);

/**
 * Gets the result of the latest measurement.
 * @return The current measurement results.
 */
SHEN_PUBLIC_API std::optional<measurement_results> GetMeasurementResults();

SHEN_PUBLIC_API std::optional<measurement_results_history> GetMeasurementResultsHistory();

/**
 * Gets the health risks factors, provided by the user in the embedded UI.
 * @return The health risks factors.
 */
SHEN_PUBLIC_API std::optional<mx::health_risks::RisksFactors> GetHealthRisksFactors();

/**
 * Gets the health risks, computed in the embedded UI, based on the factors provided by the user.
 * @return The health risks.
 */
SHEN_PUBLIC_API std::optional<mx::health_risks::HealthRisks> GetHealthRisks();

/**
 * Computes all the health risks available from the provided risk factors.
 * @return The health risks.
 */
SHEN_PUBLIC_API mx::health_risks::HealthRisks ComputeHealthRisks(const mx::health_risks::RisksFactors& risk_factors);

/**
 * Computes the maximal risks available for the provided factors (gender and base - cholesterol or BMI).
 * @return The health risks.
 */
SHEN_PUBLIC_API mx::health_risks::HealthRisks GetMaximalRisks(const mx::health_risks::RisksFactors& risk_factors);

/**
 * Computes the minimal risks available for the provided factors (gender and base - cholesterol or BMI).
 * @return The health risks.
 */
SHEN_PUBLIC_API mx::health_risks::HealthRisks GetMinimalRisks(const mx::health_risks::RisksFactors& risk_factors);

/**
 * Computes the reference risks (based on the reference risks factors).
 * @return The health risks.
 */
SHEN_PUBLIC_API mx::health_risks::HealthRisks GetReferenceRisks(const mx::health_risks::RisksFactors& risk_factors);

struct momentary_hr_value {
  double timestamp_sec;  // exact timestamp in seconds
  int hr_bpm;            // Heart rate, rounded to 1 BPM
};

/**
 * Gets heartbeats detected in realtime.
 * @param max_time The maximum time to return values for. If not specified, all values are returned.
 * @return The heartbeats detected in realtime.
 */
SHEN_PUBLIC_API std::vector<heartbeat> GetRealtimeHeartbeats(std::optional<float> period_sec = std::nullopt);

/**
 * Gets the latest pose of the subject's face (position and rotation).
 * @return The latest pose of the subject's face.
 */
SHEN_PUBLIC_API std::optional<face_pose> GetFacePose();

/**
 * Sets whether the SDK should record the measurement and send it to MX Labs.
 * @param enabled True if the SDK should record the measurement, false otherwise.
 */
SHEN_PUBLIC_API void SetRecordingEnabled(bool enabled);

/**
 * Gets whether the SDK is recording the measurement and sending it to MX Labs.
 * @return True if the SDK is recording the measurement, false otherwise.
 */
SHEN_PUBLIC_API bool GetRecordingEnabled();

/**
 * Gets the total number of seconds of bad signal since tracking started.
 * @return The total number of seconds of bad signal since tracking started.
 */
SHEN_PUBLIC_API float GetTotalBadSignalSeconds();

/**
 * Gets the current value of the signal quality metric.
 * Higher values indicate better signal quality.
 */
SHEN_PUBLIC_API float GetCurrentSignalQualityMetric();

/**
 * Gets a small PNG image representing the map of signal quality across the face.
 * @return A small PNG image representing the map of signal quality across the face
 * @note Will return an empty vector if the measurement hasn't finished yet
 */
SHEN_PUBLIC_API std::vector<uint8_t> GetSignalQualityMapPng();

/**
 * Gets a small PNG image representing the average analyzed texture of the face.
 * @return A small PNG image representing the average analyzed texture of the face
 * @note Will return an empty vector if the measurement hasn't finished yet
 */
SHEN_PUBLIC_API std::vector<uint8_t> GetFaceTexturePng();

/**
 * Gets a small PNG image representing the source of metadata such as Age and BMI.
 * @return A small PNG image representing the source of metadata such as Age and BMI.
 * @note Will return an empty vector if the measurement hasn't finished yet
 */
SHEN_PUBLIC_API std::vector<uint8_t> GetMetaPredictionImagePng();

/**
 * Gets the full PPG signal computed as part of the measurement.
 * @return The full PPG signal computed as part of the measurement
 * @note Will return an empty vector if the measurement hasn't finished yet
 */
SHEN_PUBLIC_API std::vector<float> GetFullPPGSignal();

/**
 * Gets the Shen Trace ID of the current SDK session.
 * @return The Trace ID of the current SDK session.
 * @note Will return an empty string if the SDK hasn't been initialized yet
 */
SHEN_PUBLIC_API std::string GetTraceID();

/**
 * Gets the Measurement ID of the latest ongoing or finished SDK measurement.
 * @return Measurement ID of the current SDK measurement.
 * @note Will return an empty string if no measurement has started yet.
 */
SHEN_PUBLIC_API std::string GetMeasurementID();

/**
 * Sets the language of the SDK.
 * @param language The language to set.
 */
SHEN_PUBLIC_API void SetLanguage(std::string language);

/**
 * Gets the language of the SDK.
 * @return The language of the SDK.
 */
SHEN_PUBLIC_API std::string GetSelectedLanguage();

/**
 * Gets the pricing plan of the current license used to initialize the SDK.
 * @return The name of the current pricing plan.
 * @note Will return an empty string if the SDK hasn't been initialized yet
 */
SHEN_PUBLIC_API std::string GetPricingPlan();

/**
 * Gets the current color theme of the SDK.
 * @return The current color theme of the SDK.
 */
SHEN_PUBLIC_API void SetOnboardingMode(OnboardingMode mode);

/**
 * Gets the onboarding mode of the SDK.
 * @return The onboarding mode of the SDK.
 */
SHEN_PUBLIC_API OnboardingMode GetOnboardingMode();

/**
 * Sets the color theme of the SDK.
 * @param theme The color theme to set.
 */
SHEN_PUBLIC_API void SetEnableSummaryScreen(bool enable);

/**
 * Gets whether the summary screen should be enabled.
 * @return True if the summary screen should be enabled, false otherwise.
 */
SHEN_PUBLIC_API bool GetEnableSummaryScreen();

/**
 * Sets whether the health risks should be enabled.
 * @param enable True if the health risks should be enabled, false otherwise.
 */
SHEN_PUBLIC_API void SetEnableHealthRisks(bool enable);

/**
 * Gets whether the health risks should be enabled.
 * @return True if the health risks should be enabled, false otherwise.
 */
SHEN_PUBLIC_API bool GetEnableHealthRisks();

/**
 * Sets whether the full frame processing should be enabled.
 * @param enable True if the full frame processing should be enabled, false otherwise.
 */
SHEN_PUBLIC_API void SetEnableFullFrameProcessing(bool enable);

/**
 * Gets whether the full frame processing should be enabled.
 * @return True if the full frame processing should be enabled, false otherwise.
 */
SHEN_PUBLIC_API bool GetEnableFullFrameProcessing();

/**
 * Retrieves the current calibration state of the system.
 * This indicates if calibration is completed, not calibrated, or out of date.
 * @return The current CalibrationState.
 */
SHEN_PUBLIC_API CalibrationState GetCalibrationState();

/**
 * Retrieves the calibration data including blood pressure arrays,
 * pulse arrays, and trace identifiers.
 * @return A calibration_data struct with all collected calibration information.
 */
SHEN_PUBLIC_API calibration_data GetCalibrationData();

/**
 * Retrieves the current systolic blood pressure (SBP) calibration offset, if any.
 * The offset adjusts measured SBP values to account for calibration.
 * @return An optional double containing the SBP offset if calibration is set,
 *         or std::nullopt otherwise.
 */
SHEN_PUBLIC_API double GetSbpCalibrationOffset();

/**
 * Retrieves the current diastolic blood pressure (DBP) calibration offset, if any.
 * The offset adjusts measured DBP values to account for calibration.
 * @return An optional double containing the DBP offset if calibration is set,
 *         or std::nullopt otherwise.
 */
SHEN_PUBLIC_API double GetDbpCalibrationOffset();

/**
 * @brief Opens a *print-ready* browser view of the measurement results.
 *
 * The SDK constructs a content-embedded URL to a web app which renders a pdf-like
 * preview and launches the user's default browser.
 *
 * The browser immediately shows its native **Print** dialog, enabling the
 * user to save or send a PDF *client-side*.  No server-side PDF rendering
 * or round-trip is involved.
 *
 * @note If no finished measurement exists, the call is a no-op.
 */
SHEN_PUBLIC_API void OpenMeasurementResultsPdfInBrowser();

/**
 * @brief Sends the measurement-results PDF to a specified e-mail address.
 *
 * The SDK enqueues a server-side e-mail job. The callback will be invoked
 * once the email job has been successfully scheduled.
 *
 * @param email     Destination e-mail address (must be RFC-valid).
 * @param callback  `void(bool success)`—true if the message was accepted by
 *                  the server, false otherwise (invalid address, quota
 *                  exceeded, etc.).
 */
SHEN_PUBLIC_API void SendMeasurementResultsPdfToEmail(std::string email,
                                                      std::function<void(bool /*success*/)> callback);

/**
 * @brief Retrieves the URL of the rendered measurement-results PDF.
 *
 * The SDK starts a render job if needed; once complete, the callback receives
 * a pre-signed HTTPS link valid for at least 24 h.
 *
 * @param callback  `void(const std::string& url)`—called with the URL on
 *                  success.  On failure the URL parameter is an empty string.
 */
SHEN_PUBLIC_API void GetMeasurementResultsPdfUrl(std::function<void(std::string /*url*/)> callback);

// polling version
SHEN_PUBLIC_API void RequestMeasurementResultsPdfUrl();
SHEN_PUBLIC_API std::string GetMeasurementResultsPdfUrl();

/**
 * @brief Downloads the raw bytes of the rendered measurement-results PDF.
 *
 * Suitable for in-app previews or custom storage workflows. The callback
 * is invoked with the complete document when available.
 *
 * @param callback  `void(const std::vector<uint8_t>& bytes)`—called with the
 *                  full PDF buffer.  On failure the vector is empty.
 */
SHEN_PUBLIC_API void GetMeasurementResultsPdfBytes(std::function<void(std::vector<uint8_t> /*bytes*/)> callback);

// polling version
SHEN_PUBLIC_API void RequestMeasurementResultsPdfBytes();
SHEN_PUBLIC_API std::vector<uint8_t> GetMeasurementResultsPdfBytes();

}  // namespace shen