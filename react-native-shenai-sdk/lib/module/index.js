import { requireNativeComponent, UIManager, Platform, NativeModules } from "react-native";
const {
  ShenaiSdkNativeModule
} = NativeModules;
const LINKING_ERROR = `The package 'react-native-shenai-sdk' doesn't seem to be linked. Make sure: \n\n` + Platform.select({
  ios: "- You have run 'pod install'\n",
  default: ""
}) + "- You rebuilt the app after installing the package\n" + "- You are not using Expo Go\n";
const ComponentName = "ShenaiSdkView";
export const ShenaiSdkView = UIManager.getViewManagerConfig(ComponentName) != null ? requireNativeComponent(ComponentName) : () => {
  throw new Error(LINKING_ERROR);
};
export let InitializationResult = /*#__PURE__*/function (InitializationResult) {
  InitializationResult[InitializationResult["OK"] = 0] = "OK";
  InitializationResult[InitializationResult["INVALID_API_KEY"] = 1] = "INVALID_API_KEY";
  InitializationResult[InitializationResult["CONNECTION_ERROR"] = 2] = "CONNECTION_ERROR";
  InitializationResult[InitializationResult["INTERNAL_ERROR"] = 3] = "INTERNAL_ERROR";
  return InitializationResult;
}({});
export let OperatingMode = /*#__PURE__*/function (OperatingMode) {
  OperatingMode[OperatingMode["POSITIONING"] = 0] = "POSITIONING";
  OperatingMode[OperatingMode["MEASURE"] = 1] = "MEASURE";
  OperatingMode[OperatingMode["SYSTEM_OVERLOADED"] = 2] = "SYSTEM_OVERLOADED";
  return OperatingMode;
}({});
export let CalibrationState = /*#__PURE__*/function (CalibrationState) {
  CalibrationState[CalibrationState["CALIBRATED"] = 0] = "CALIBRATED";
  CalibrationState[CalibrationState["NOT_CALIBRATED"] = 1] = "NOT_CALIBRATED";
  CalibrationState[CalibrationState["OUTDATED"] = 2] = "OUTDATED";
  return CalibrationState;
}({});
export let PrecisionMode = /*#__PURE__*/function (PrecisionMode) {
  PrecisionMode[PrecisionMode["STRICT"] = 0] = "STRICT";
  PrecisionMode[PrecisionMode["RELAXED"] = 1] = "RELAXED";
  return PrecisionMode;
}({});
export let Screen = /*#__PURE__*/function (Screen) {
  Screen[Screen["INITIALIZATION"] = 0] = "INITIALIZATION";
  Screen[Screen["ONBOARDING"] = 1] = "ONBOARDING";
  Screen[Screen["MEASUREMENT"] = 2] = "MEASUREMENT";
  Screen[Screen["INSTRUCTIONS"] = 3] = "INSTRUCTIONS";
  Screen[Screen["RESULTS"] = 4] = "RESULTS";
  Screen[Screen["HEALTH_RISKS"] = 5] = "HEALTH_RISKS";
  Screen[Screen["HEALTH_RISKS_EDIT"] = 6] = "HEALTH_RISKS_EDIT";
  return Screen;
}({});
export let Metric = /*#__PURE__*/function (Metric) {
  Metric[Metric["HEART_RATE"] = 0] = "HEART_RATE";
  Metric[Metric["HRV_SDNN"] = 1] = "HRV_SDNN";
  Metric[Metric["BREATHING_RATE"] = 2] = "BREATHING_RATE";
  Metric[Metric["SYSTOLIC_BP"] = 3] = "SYSTOLIC_BP";
  Metric[Metric["DIASTOLIC_BP"] = 4] = "DIASTOLIC_BP";
  Metric[Metric["CARDIAC_STRESS"] = 5] = "CARDIAC_STRESS";
  Metric[Metric["PNS_ACTIVITY"] = 6] = "PNS_ACTIVITY";
  Metric[Metric["CARDIAC_WORKLOAD"] = 7] = "CARDIAC_WORKLOAD";
  Metric[Metric["AGE"] = 8] = "AGE";
  Metric[Metric["BMI"] = 9] = "BMI";
  Metric[Metric["BLOOD_PRESSURE"] = 10] = "BLOOD_PRESSURE";
  return Metric;
}({});
export let BmiCategory = /*#__PURE__*/function (BmiCategory) {
  BmiCategory[BmiCategory["UNDERWEIGHT_SEVERE"] = 0] = "UNDERWEIGHT_SEVERE";
  BmiCategory[BmiCategory["UNDERWEIGHT_MODERATE"] = 1] = "UNDERWEIGHT_MODERATE";
  BmiCategory[BmiCategory["UNDERWEIGHT_MILD"] = 2] = "UNDERWEIGHT_MILD";
  BmiCategory[BmiCategory["NORMAL"] = 3] = "NORMAL";
  BmiCategory[BmiCategory["OVERWEIGHT"] = 4] = "OVERWEIGHT";
  BmiCategory[BmiCategory["OBESE_CLASS_I"] = 5] = "OBESE_CLASS_I";
  BmiCategory[BmiCategory["OBESE_CLASS_II"] = 6] = "OBESE_CLASS_II";
  BmiCategory[BmiCategory["OBESE_CLASS_III"] = 7] = "OBESE_CLASS_III";
  return BmiCategory;
}({});
export let HealthIndex = /*#__PURE__*/function (HealthIndex) {
  HealthIndex[HealthIndex["WELLNESS_SCORE"] = 0] = "WELLNESS_SCORE";
  HealthIndex[HealthIndex["VASCULAR_AGE"] = 1] = "VASCULAR_AGE";
  HealthIndex[HealthIndex["CARDIOVASCULAR_DISEASE_RISK"] = 2] = "CARDIOVASCULAR_DISEASE_RISK";
  HealthIndex[HealthIndex["HARD_AND_FATAL_EVENTS_RISKS"] = 3] = "HARD_AND_FATAL_EVENTS_RISKS";
  HealthIndex[HealthIndex["CARDIO_VASCULAR_RISK_SCORE"] = 4] = "CARDIO_VASCULAR_RISK_SCORE";
  HealthIndex[HealthIndex["WAIST_TO_HEIGHT_RATIO"] = 5] = "WAIST_TO_HEIGHT_RATIO";
  HealthIndex[HealthIndex["BODY_FAT_PERCENTAGE"] = 6] = "BODY_FAT_PERCENTAGE";
  HealthIndex[HealthIndex["BODY_ROUNDNESS_INDEX"] = 7] = "BODY_ROUNDNESS_INDEX";
  HealthIndex[HealthIndex["A_BODY_SHAPE_INDEX"] = 8] = "A_BODY_SHAPE_INDEX";
  HealthIndex[HealthIndex["CONICITY_INDEX"] = 9] = "CONICITY_INDEX";
  HealthIndex[HealthIndex["BASAL_METABOLIC_RATE"] = 10] = "BASAL_METABOLIC_RATE";
  HealthIndex[HealthIndex["TOTAL_DAILY_ENERGY_EXPENDITURE"] = 11] = "TOTAL_DAILY_ENERGY_EXPENDITURE";
  HealthIndex[HealthIndex["HYPERTENSION_RISK"] = 12] = "HYPERTENSION_RISK";
  HealthIndex[HealthIndex["DIABETES_RISK"] = 13] = "DIABETES_RISK";
  HealthIndex[HealthIndex["NON_ALCOHOLIC_FATYY_LIVER_DISEASE_RISK"] = 14] = "NON_ALCOHOLIC_FATYY_LIVER_DISEASE_RISK";
  return HealthIndex;
}({});
export let MeasurementPreset = /*#__PURE__*/function (MeasurementPreset) {
  MeasurementPreset[MeasurementPreset["ONE_MINUTE_HR_HRV_BR"] = 0] = "ONE_MINUTE_HR_HRV_BR";
  MeasurementPreset[MeasurementPreset["ONE_MINUTE_BETA_METRICS"] = 1] = "ONE_MINUTE_BETA_METRICS";
  MeasurementPreset[MeasurementPreset["INFINITE_HR"] = 2] = "INFINITE_HR";
  MeasurementPreset[MeasurementPreset["INFINITE_METRICS"] = 3] = "INFINITE_METRICS";
  MeasurementPreset[MeasurementPreset["FOURTY_FIVE_SECONDS_UNVALIDATED"] = 4] = "FOURTY_FIVE_SECONDS_UNVALIDATED";
  MeasurementPreset[MeasurementPreset["THIRTY_SECONDS_UNVALIDATED"] = 5] = "THIRTY_SECONDS_UNVALIDATED";
  MeasurementPreset[MeasurementPreset["CUSTOM"] = 6] = "CUSTOM";
  MeasurementPreset[MeasurementPreset["ONE_MINUTE_ALL_METRICS"] = 7] = "ONE_MINUTE_ALL_METRICS";
  MeasurementPreset[MeasurementPreset["FOURTY_FIVE_SECONDS_ALL_METRICS"] = 8] = "FOURTY_FIVE_SECONDS_ALL_METRICS";
  MeasurementPreset[MeasurementPreset["THIRTY_SECONDS_ALL_METRICS"] = 9] = "THIRTY_SECONDS_ALL_METRICS";
  return MeasurementPreset;
}({});
export let CameraMode = /*#__PURE__*/function (CameraMode) {
  CameraMode[CameraMode["OFF"] = 0] = "OFF";
  CameraMode[CameraMode["FACING_USER"] = 1] = "FACING_USER";
  CameraMode[CameraMode["FACING_ENVIRONMENT"] = 2] = "FACING_ENVIRONMENT";
  return CameraMode;
}({});
export let OnboardingMode = /*#__PURE__*/function (OnboardingMode) {
  OnboardingMode[OnboardingMode["HIDDEN"] = 0] = "HIDDEN";
  OnboardingMode[OnboardingMode["SHOW_ONCE"] = 1] = "SHOW_ONCE";
  OnboardingMode[OnboardingMode["SHOW_ALWAYS"] = 2] = "SHOW_ALWAYS";
  return OnboardingMode;
}({});
function ensureNativeModuleAvailable() {
  if (!ShenaiSdkNativeModule) {
    throw new Error(LINKING_ERROR);
  }
}
export async function initialize(apiKey, userId, settings) {
  ensureNativeModuleAvailable();
  return ShenaiSdkNativeModule.initialize(apiKey, userId ?? "", settings ?? {});
}
export async function isInitialized() {
  ensureNativeModuleAvailable();
  return ShenaiSdkNativeModule.isInitialized();
}
export async function deinitialize() {
  ensureNativeModuleAvailable();
  await ShenaiSdkNativeModule.deinitialize();
}
export async function setOperatingMode(operatingMode) {
  ensureNativeModuleAvailable();
  await ShenaiSdkNativeModule.setOperatingMode(operatingMode);
}
export async function getOperatingMode() {
  ensureNativeModuleAvailable();
  return ShenaiSdkNativeModule.getOperatingMode();
}
export async function getCalibrationState() {
  ensureNativeModuleAvailable();
  return ShenaiSdkNativeModule.getCalibrationState();
}
export async function setPrecisionMode(precisionMode) {
  ensureNativeModuleAvailable();
  await ShenaiSdkNativeModule.setPrecisionMode(precisionMode);
}
export async function getPrecisionMode() {
  ensureNativeModuleAvailable();
  return ShenaiSdkNativeModule.getPrecisionMode();
}
export async function setMeasurementPreset(measurementPreset) {
  ensureNativeModuleAvailable();
  await ShenaiSdkNativeModule.setMeasurementPreset(measurementPreset);
}
export async function getMeasurementPreset() {
  ensureNativeModuleAvailable();
  return ShenaiSdkNativeModule.getMeasurementPreset();
}
export async function setCustomMeasurementConfig(config) {
  ensureNativeModuleAvailable();
  await ShenaiSdkNativeModule.setCustomMeasurementConfig(config);
}
export async function setCustomColorTheme(theme) {
  ensureNativeModuleAvailable();
  await ShenaiSdkNativeModule.setCustomColorTheme(theme);
}
export async function setCameraMode(cameraMode) {
  ensureNativeModuleAvailable();
  await ShenaiSdkNativeModule.setCameraMode(cameraMode);
}
export async function getCameraMode() {
  ensureNativeModuleAvailable();
  return ShenaiSdkNativeModule.getCameraMode();
}

//* ---- SDK interface elements ---- *//

export async function setShowUserInterface(showUserInterface) {
  ensureNativeModuleAvailable();
  await ShenaiSdkNativeModule.setShowUserInterface(showUserInterface);
}
export async function getShowUserInterface() {
  ensureNativeModuleAvailable();
  return ShenaiSdkNativeModule.getShowUserInterface();
}
export async function setShowFacePositioningOverlay(showFacePositioningOverlay) {
  ensureNativeModuleAvailable();
  await ShenaiSdkNativeModule.setShowFacePositioningOverlay(showFacePositioningOverlay);
}
export async function getShowFacePositioningOverlay() {
  ensureNativeModuleAvailable();
  return ShenaiSdkNativeModule.getShowFacePositioningOverlay();
}
export async function setShowVisualWarnings(showVisualWarnings) {
  ensureNativeModuleAvailable();
  await ShenaiSdkNativeModule.setShowVisualWarnings(showVisualWarnings);
}
export async function getShowVisualWarnings() {
  ensureNativeModuleAvailable();
  return ShenaiSdkNativeModule.getShowVisualWarnings();
}
export async function setEnableCameraSwap(enableCameraSwap) {
  ensureNativeModuleAvailable();
  await ShenaiSdkNativeModule.setEnableCameraSwap(enableCameraSwap);
}
export async function getEnableCameraSwap() {
  ensureNativeModuleAvailable();
  return ShenaiSdkNativeModule.getEnableCameraSwap();
}
export async function setShowFaceMask(showFaceMask) {
  ensureNativeModuleAvailable();
  await ShenaiSdkNativeModule.setShowFaceMask(showFaceMask);
}
export async function getShowFaceMask() {
  ensureNativeModuleAvailable();
  return ShenaiSdkNativeModule.getShowFaceMask();
}
export async function setShowBloodFlow(showBloodFlow) {
  ensureNativeModuleAvailable();
  await ShenaiSdkNativeModule.setShowBloodFlow(showBloodFlow);
}
export async function getShowBloodFlow() {
  ensureNativeModuleAvailable();
  return ShenaiSdkNativeModule.getShowBloodFlow();
}
export async function setEnableStartAfterSuccess(enableStartAfterSuccess) {
  ensureNativeModuleAvailable();
  await ShenaiSdkNativeModule.setEnableStartAfterSuccess(enableStartAfterSuccess);
}
export async function getEnableStartAfterSuccess() {
  ensureNativeModuleAvailable();
  return ShenaiSdkNativeModule.getEnableStartAfterSuccess();
}

//* ---- SDK face positioning ---- *//

export let FaceState = /*#__PURE__*/function (FaceState) {
  FaceState[FaceState["OK"] = 0] = "OK";
  FaceState[FaceState["TOO_FAR"] = 1] = "TOO_FAR";
  FaceState[FaceState["TOO_CLOSE"] = 2] = "TOO_CLOSE";
  FaceState[FaceState["NOT_CENTERED"] = 3] = "NOT_CENTERED";
  FaceState[FaceState["NOT_VISIBLE"] = 4] = "NOT_VISIBLE";
  FaceState[FaceState["UNKNOWN"] = 5] = "UNKNOWN";
  return FaceState;
}({});
export async function getFaceState() {
  ensureNativeModuleAvailable();
  return ShenaiSdkNativeModule.getFaceState();
}
export async function getNormalizedFaceBbox() {
  ensureNativeModuleAvailable();
  return ShenaiSdkNativeModule.getNormalizedFaceBbox();
}

//* ---- SDK measurement state ---- *//

export let MeasurementState = /*#__PURE__*/function (MeasurementState) {
  MeasurementState[MeasurementState["NOT_STARTED"] = 0] = "NOT_STARTED";
  MeasurementState[MeasurementState["WAITING_FOR_FACE"] = 1] = "WAITING_FOR_FACE";
  MeasurementState[MeasurementState["RUNNING_SIGNAL_SHORT"] = 2] = "RUNNING_SIGNAL_SHORT";
  MeasurementState[MeasurementState["RUNNING_SIGNAL_GOOD"] = 3] = "RUNNING_SIGNAL_GOOD";
  MeasurementState[MeasurementState["RUNNING_SIGNAL_BAD"] = 4] = "RUNNING_SIGNAL_BAD";
  MeasurementState[MeasurementState["RUNNING_SIGNAL_BAD_DEVICE_UNSTABLE"] = 5] = "RUNNING_SIGNAL_BAD_DEVICE_UNSTABLE";
  MeasurementState[MeasurementState["FINISHED"] = 6] = "FINISHED";
  MeasurementState[MeasurementState["FAILED"] = 7] = "FAILED";
  return MeasurementState;
}({}); // Measurement has failed
export async function getMeasurementState() {
  ensureNativeModuleAvailable();
  return ShenaiSdkNativeModule.getMeasurementState();
}
export async function getMeasurementProgressPercentage() {
  ensureNativeModuleAvailable();
  return ShenaiSdkNativeModule.getMeasurementProgressPercentage();
}

//* ---- Event ---- *//

export let Event = /*#__PURE__*/function (Event) {
  Event[Event["START_BUTTON_CLICKED"] = 0] = "START_BUTTON_CLICKED";
  Event[Event["STOP_BUTTON_CLICKED"] = 1] = "STOP_BUTTON_CLICKED";
  Event[Event["MEASUREMENT_FINISHED"] = 2] = "MEASUREMENT_FINISHED";
  Event[Event["USER_FLOW_FINISHED"] = 3] = "USER_FLOW_FINISHED";
  return Event;
}({});

/* ---- SDK measurement results ---- */

export async function getHeartRate10s() {
  ensureNativeModuleAvailable();
  return ShenaiSdkNativeModule.getHeartRate10s();
}
export async function getHeartRate4s() {
  ensureNativeModuleAvailable();
  return ShenaiSdkNativeModule.getHeartRate4s();
}
export async function getRealtimeMetrics(periodSec) {
  ensureNativeModuleAvailable();
  return ShenaiSdkNativeModule.getRealtimeMetrics(periodSec);
}
export async function getMeasurementResults() {
  ensureNativeModuleAvailable();
  return ShenaiSdkNativeModule.getMeasurementResults();
}
export async function getMeasurementResultsHistory() {
  ensureNativeModuleAvailable();
  return ShenaiSdkNativeModule.getMeasurementResultsHistory();
}

//* ---- SDK signals ---- *//

export async function getHeartRateHistory10s(maxTimeSec) {
  ensureNativeModuleAvailable();
  return ShenaiSdkNativeModule.getHeartRateHistory10s(maxTimeSec);
}
export async function getHeartRateHistory4s(maxTimeSec) {
  ensureNativeModuleAvailable();
  return ShenaiSdkNativeModule.getHeartRateHistory4s(maxTimeSec);
}
export async function getRealtimeHeartbeats(periodSec) {
  ensureNativeModuleAvailable();
  return ShenaiSdkNativeModule.getRealtimeHeartbeats(periodSec);
}
export async function getFullPpgSignal() {
  ensureNativeModuleAvailable();
  return ShenaiSdkNativeModule.getFullPpgSignal();
}

//* ---- SDK recording ---- *//

export async function setRecordingEnabled(enabled) {
  ensureNativeModuleAvailable();
  await ShenaiSdkNativeModule.setRecordingEnabled(enabled);
}
export async function getRecordingEnabled() {
  ensureNativeModuleAvailable();
  return ShenaiSdkNativeModule.getRecordingEnabled();
}

//* ---- SDK quality control ---- *//

export async function getTotalBadSignalSeconds() {
  ensureNativeModuleAvailable();
  return ShenaiSdkNativeModule.getTotalBadSignalSeconds();
}
export async function getCurrentSignalQualityMetric() {
  ensureNativeModuleAvailable();
  return ShenaiSdkNativeModule.getCurrentSignalQualityMetric();
}

//* ---- SDK visualizations ---- *//

export async function getSignalQualityMapPng() {
  ensureNativeModuleAvailable();
  return ShenaiSdkNativeModule.getSignalQualityMapPng();
}
export async function getFaceTexturePng() {
  ensureNativeModuleAvailable();
  return ShenaiSdkNativeModule.getFaceTexturePng();
}
export async function setLanguage(language) {
  ensureNativeModuleAvailable();
  await ShenaiSdkNativeModule.setLanguage(language);
}

//* ---- Health Risks ---- *//

export let Gender = /*#__PURE__*/function (Gender) {
  Gender[Gender["MALE"] = 0] = "MALE";
  Gender[Gender["FEMALE"] = 1] = "FEMALE";
  Gender[Gender["OTHER"] = 2] = "OTHER";
  return Gender;
}({});
export let Race = /*#__PURE__*/function (Race) {
  Race[Race["WHITE"] = 0] = "WHITE";
  Race[Race["AFRICAN_AMERICAN"] = 1] = "AFRICAN_AMERICAN";
  Race[Race["OTHER"] = 2] = "OTHER";
  return Race;
}({});
export let HypertensionTreatment = /*#__PURE__*/function (HypertensionTreatment) {
  HypertensionTreatment[HypertensionTreatment["NOT_NEEDED"] = 0] = "NOT_NEEDED";
  HypertensionTreatment[HypertensionTreatment["NO"] = 1] = "NO";
  HypertensionTreatment[HypertensionTreatment["YES"] = 2] = "YES";
  return HypertensionTreatment;
}({});
export let ParentalHistory = /*#__PURE__*/function (ParentalHistory) {
  ParentalHistory[ParentalHistory["NONE"] = 0] = "NONE";
  ParentalHistory[ParentalHistory["ONE"] = 1] = "ONE";
  ParentalHistory[ParentalHistory["BOTH"] = 2] = "BOTH";
  return ParentalHistory;
}({});
export let FamilyHistory = /*#__PURE__*/function (FamilyHistory) {
  FamilyHistory[FamilyHistory["NONE"] = 0] = "NONE";
  FamilyHistory[FamilyHistory["NONE_FIRST_DEGREE"] = 1] = "NONE_FIRST_DEGREE";
  FamilyHistory[FamilyHistory["FIRST_DEGREE"] = 2] = "FIRST_DEGREE";
  return FamilyHistory;
}({});
export let NAFLDRisk = /*#__PURE__*/function (NAFLDRisk) {
  NAFLDRisk[NAFLDRisk["LOW"] = 0] = "LOW";
  NAFLDRisk[NAFLDRisk["MODERATE"] = 1] = "MODERATE";
  NAFLDRisk[NAFLDRisk["HIGH"] = 2] = "HIGH";
  return NAFLDRisk;
}({});
export async function getHealthRisksFactors() {
  ensureNativeModuleAvailable();
  return ShenaiSdkNativeModule.getHealthRisksFactors();
}
export async function getHealthRisks() {
  ensureNativeModuleAvailable();
  return ShenaiSdkNativeModule.getHealthRisks();
}
export async function computeHealthRisks(factors) {
  ensureNativeModuleAvailable();
  return ShenaiSdkNativeModule.computeHealthRisks(factors);
}
export async function getMaximalRisks(factors) {
  ensureNativeModuleAvailable();
  return ShenaiSdkNativeModule.getMaximalRisks(factors);
}
export async function getMinimalRisks(factors) {
  ensureNativeModuleAvailable();
  return ShenaiSdkNativeModule.getMinimalRisks(factors);
}
export async function getReferenceRisks(factors) {
  ensureNativeModuleAvailable();
  return ShenaiSdkNativeModule.getReferenceRisks(factors);
}
export async function openMeasurementResultsPdfInBrowser() {
  ensureNativeModuleAvailable();
  await ShenaiSdkNativeModule.openMeasurementResultsPdfInBrowser();
}
export async function sendMeasurementResultsPdfToEmail(email) {
  ensureNativeModuleAvailable();
  await ShenaiSdkNativeModule.sendMeasurementResultsPdfToEmail(email);
}
export async function requestMeasurementResultsPdfUrl() {
  ensureNativeModuleAvailable();
  await ShenaiSdkNativeModule.requestMeasurementResultsPdfUrl();
}
export async function getMeasurementResultsPdfUrl() {
  ensureNativeModuleAvailable();
  return ShenaiSdkNativeModule.getMeasurementResultsPdfUrl();
}
export async function requestMeasurementResultsPdfBytes() {
  ensureNativeModuleAvailable();
  await ShenaiSdkNativeModule.requestMeasurementResultsPdfBytes();
}
export async function getMeasurementResultsPdfBytes() {
  ensureNativeModuleAvailable();
  return ShenaiSdkNativeModule.getMeasurementResultsPdfBytes();
}
export * from "./hooks";
//# sourceMappingURL=index.js.map