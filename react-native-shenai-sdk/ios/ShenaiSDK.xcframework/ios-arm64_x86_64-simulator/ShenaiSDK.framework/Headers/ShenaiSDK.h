#import <Foundation/Foundation.h>
#import "ShenaiHealthRisks.h"

typedef NS_ENUM(NSInteger, InitializationResult) {
  InitializationResultSuccess = 0,
  InitializationResultFailureInvalidApiKey,
  InitializationResultFailureConnectionError,
  InitializationResultFailureInternalError,
};

typedef NS_ENUM(NSInteger, OperatingMode) {
  OperatingModePositioning = 0,
  OperatingModeMeasure = 1,
  OperatingModeSystemOverloaded = 2,
};

typedef NS_ENUM(NSInteger, CalibrationState) {
  CalibrationStateCalibrated = 0,
  CalibrationStateNotCalibrated = 1,
  CalibrationStateOutdated = 2,
};

typedef NS_ENUM(NSInteger, PrecisionMode) {
  PrecisionModeStrict = 0,
  PrecisionModeRelaxed = 1,
};

typedef NS_ENUM(NSInteger, Screen) {
  ScreenInitialization = 0,
  ScreenOnboarding = 1,
  ScreenMeasurement = 2,
  ScreenInstructions = 3,
  ScreenResults = 4,
  ScreenHealthRisks = 5,
  ScreenHealthRisksEdit = 6,
};

typedef NS_ENUM(NSInteger, Metric) {
  MetricHeartRate = 0,
  MetricHrvSdnn = 1,
  MetricBreathingRate = 2,
  MetricSystolicBp = 3,
  MetricDiastolicBp = 4,
  MetricCardiacStress = 5,
  MetricPnsActivity = 6,
  MetricCardiacWorkload = 7,
  MetricAge = 8,
  MetricBmi = 9,
  MetricBloodPressure = 10,
};

typedef NS_ENUM(NSInteger, HealthIndex) {
  HealthIndexWellnessScore = 0,
  HealthIndexVascularAge = 1,
  HealthIndexCardiovascularDiseaseRisk = 2,
  HealthIndexHardAndFatalEventsRisks = 3,
  HealthIndexCardioVascularRiskScore = 4,
  HealthIndexWaistToHeightRatio = 5,
  HealthIndexBodyFatPercentage = 6,
  HealthIndexBodyRoundnessIndex = 7,
  HealthIndexABodyShapeIndex = 8,
  HealthIndexConicityIndex = 9,
  HealthIndexBasalMetabolicRate = 10,
  HealthIndexTotalDailyEnergyExpenditure = 11,
  HealthIndexHypertensionRisk = 12,
  HealthIndexDiabetesRisk = 13,
  HealthIndexNonAlcoholicFattyLiverDiseaseRisk = 14
};

typedef NS_ENUM(NSInteger, MeasurementPreset) {
  MeasurementPresetOneMinuteHrHrvBr = 0,
  MeasurementPresetOneMinuteBetaMetrics = 1,
  MeasurementPresetInfiniteHr = 2,
  MeasurementPresetInfiniteMetrics = 3,
  MeasurementPresetFourtyFiveSecondsUnvalidated = 4,
  MeasurementPresetThirtySecondsUnvalidated = 5,
  MeasurementPresetCustom = 6,
  MeasurementPresetOneMinuteAllMetrics = 7,
  MeasurementPresetFourtyFiveSecondsAllMetrics = 8,
  MeasurementPresetThirtySecondsAllMetrics = 9,
};

typedef NS_ENUM(NSInteger, CameraMode) {
  CameraModeOff = 0,
  CameraModeFacingUser = 1,
  CameraModeFacingEnvironment = 2,
};

typedef NS_ENUM(NSInteger, OnboardingMode) {
  OnboardingModeHidden = 0,
  OnboardingModeShowOnce = 1,
  OnboardingModeShowAlways = 2,
};

typedef NS_ENUM(NSInteger, InitializationMode) {
  Measurement = 0,
  Calibration = 1,
  CalibratedMeasurement = 2,
};

typedef NS_ENUM(NSInteger, FaceState) {
  FaceStateOk = 0,
  FaceStateTooFar = 1,
  FaceStateTooClose = 2,
  FaceStateNotCentered = 3,
  FaceStateNotVisible = 4,
  FaceStateUnknown = 5,
};

typedef NS_ENUM(NSInteger, BmiCategory) {
  BmiCategoryUnderweightSevere,
  BmiCategoryUnderweightModerate,
  BmiCategoryUnderweightMild,
  BmiCategoryNormal,
  BmiCategoryOverweight,
  BmiCategoryObeseClassI,
  BmiCategoryObeseClassII,
  BmiCategoryObeseClassIII,
  BmiCategoryUnknown,
};

typedef NS_ENUM(NSInteger, MeasurementState) {
  MeasurementStateNotStarted = 0,
  MeasurementStateWaitingForFace = 1,
  MeasurementStateRunningSignalShort = 2,
  MeasurementStateRunningSignalGood = 3,
  MeasurementStateRunningSignalBad = 4,
  MeasurementStateRunningSignalBadDeviceUnstable = 5,
  MeasurementStateFinished = 6,
  MeasurementStateFailed = 7,
};

typedef NS_ENUM(NSInteger, Event) {
  EventStartButtonClicked = 0,
  EventStopButtonClicked = 1,
  EventMeasurementFinished = 2,
  EventUserFlowFinished = 3,
};

__attribute__((visibility("default")))
@interface InitializationSettings : NSObject

@property(nonatomic) PrecisionMode precisionMode;
@property(nonatomic) OperatingMode operatingMode;
@property(nonatomic) MeasurementPreset measurementPreset;
@property(nonatomic) CameraMode cameraMode;
@property(nonatomic) OnboardingMode onboardingMode;
@property(nonatomic) InitializationMode initializationMode;

@property(nonatomic) BOOL showUserInterface;
@property(nonatomic) BOOL showFacePositioningOverlay;
@property(nonatomic) BOOL showVisualWarnings;
@property(nonatomic) BOOL enableCameraSwap;
@property(nonatomic) BOOL showFaceMask;
@property(nonatomic) BOOL showBloodFlow;
@property(nonatomic) BOOL hideShenaiLogo;
@property(nonatomic) BOOL enableStartAfterSuccess;
@property(nonatomic) BOOL enableSummaryScreen;
@property(nonatomic) BOOL enableHealthRisks;
@property(nonatomic) BOOL showOutOfRangeResultIndicators;
@property(nonatomic) BOOL showSignalQualityIndicator;
@property(nonatomic) BOOL showSignalTile;
@property(nonatomic) BOOL showTrialMetricLabels;

@property(nonatomic, copy, nullable) void (^eventCallback)(Event event);
@property(nonatomic, strong, nullable) RisksFactors *risksFactors;

- (nonnull instancetype)init;

@end

__attribute__((visibility("default")))
@interface CustomMeasurementConfig : NSObject
@property(nonatomic, nullable, strong) NSNumber *durationSeconds;
@property(nonatomic) BOOL infiniteMeasurement;
@property(nonatomic, strong, nullable) NSArray<NSNumber *> *instantMetrics;
@property(nonatomic, strong, nullable) NSArray<NSNumber *> *summaryMetrics;
@property(nonatomic, strong, nullable) NSArray<NSNumber *> *healthIndices;
@property(nonatomic, nullable, strong) NSNumber *realtimeHrPeriodSeconds;
@property(nonatomic, nullable, strong) NSNumber *realtimeHrvPeriodSeconds;
@property(nonatomic, nullable, strong) NSNumber *realtimeCardiacStressPeriodSeconds;

- (nonnull instancetype)init;
@end

__attribute__((visibility("default")))
@interface CustomColorTheme : NSObject
@property(nonatomic, copy, nonnull) NSString *themeColor;
@property(nonatomic, copy, nonnull) NSString *textColor;
@property(nonatomic, copy, nonnull) NSString *backgroundColor;
@property(nonatomic, copy, nonnull) NSString *tileColor;
@end

__attribute__((visibility("default")))
@interface NormalizedFaceBbox : NSObject
@property(nonatomic, assign) float x;
@property(nonatomic, assign) float y;
@property(nonatomic, assign) float width;
@property(nonatomic, assign) float height;
@end

__attribute__((visibility("default")))
@interface Heartbeat : NSObject
@property(nonatomic, assign) double startLocationSec;
@property(nonatomic, assign) double endLocationSec;
@property(nonatomic, assign) double durationMs;
@end

__attribute__((visibility("default")))
@interface MeasurementResults : NSObject
@property(nonatomic, assign) double heartRateBpm;
@property(nonatomic, nullable, strong) NSNumber *hrvSdnnMs;
@property(nonatomic, nullable, strong) NSNumber *hrvLnrmssdMs;
@property(nonatomic, nullable, strong) NSNumber *stressIndex;
@property(nonatomic, nullable, strong) NSNumber *parasympatheticActivity;
@property(nonatomic, nullable, strong) NSNumber *breathingRateBpm;
@property(nonatomic, nullable, strong) NSNumber *systolicBloodPressureMmhg;
@property(nonatomic, nullable, strong) NSNumber *diastolicBloodPressureMmhg;
@property(nonatomic, nullable, strong) NSNumber *cardiacWorkloadMmhgPerSec;
@property(nonatomic, nullable, strong) NSNumber *ageYears;
@property(nonatomic, nullable, strong) NSNumber *bmiKgPerM2;
@property(nonatomic) BmiCategory bmiCategory;
@property(nonatomic, nullable, strong) NSNumber *weightKg;
@property(nonatomic, nullable, strong) NSNumber *heightCm;
@property(nonatomic, nonnull, strong) NSArray<Heartbeat *> *heartbeats;
@property(nonatomic, assign) double averageSignalQuality;
@end

__attribute__((visibility("default")))
@interface MeasurementResultsWithMetadata : NSObject
@property(nonatomic, strong, nonnull) MeasurementResults *measurementResults;
@property(nonatomic, strong, nonnull) NSNumber *epochTimestamp;
@property(nonatomic, assign) BOOL isCalibration;
@end

__attribute__((visibility("default")))
@interface MeasurementResultsHistory : NSObject
@property(nonatomic, strong, nonnull) NSArray<MeasurementResultsWithMetadata *> *history;
@end

__attribute__((visibility("default")))
@interface ShenaiSDK : NSObject

+ (InitializationResult)initialize:(nonnull NSString *)apiKey
                            userID:(nullable NSString *)userID
                          settings:(nullable InitializationSettings *)settings;

+ (BOOL)isInitialized;
+ (void)deinitialize;
+ (void)setOperatingMode:(OperatingMode)mode;
+ (OperatingMode)getOperatingMode;
+ (CalibrationState)getCalibrationState;
+ (void)setPrecisionMode:(PrecisionMode)mode;
+ (PrecisionMode)getPrecisionMode;
+ (void)setMeasurementPreset:(MeasurementPreset)preset;
+ (MeasurementPreset)getMeasurementPreset;
+ (void)setBpCalibrationOffset:(double)systolicOffset diastolic:(double)diastolicOffset;
+ (double)getSbpCalibrationOffset;
+ (double)getDbpCalibrationOffset;
+ (void)setCameraMode:(CameraMode)mode;
+ (CameraMode)getCameraMode;

+ (void)setShowUserInterface:(BOOL)show;
+ (BOOL)getShowUserInterface;
+ (void)setShowFacePositioningOverlay:(BOOL)show;
+ (BOOL)getShowFacePositioningOverlay;
+ (void)setShowVisualWarnings:(BOOL)show;
+ (BOOL)getShowVisualWarnings;
+ (void)setEnableCameraSwap:(BOOL)enable;
+ (BOOL)getEnableCameraSwap;
+ (void)setShowFaceMask:(BOOL)show;
+ (BOOL)getShowFaceMask;
+ (void)setShowBloodFlow:(BOOL)show;
+ (BOOL)getShowBloodFlow;
+ (void)setEnableStartAfterSuccess:(BOOL)show;
+ (BOOL)getEnableStartAfterSuccess;

+ (FaceState)getFaceState;
+ (nullable NormalizedFaceBbox *)getNormalizedFaceBbox;

+ (MeasurementState)getMeasurementState;

+ (float)getMeasurementProgressPercentage;

+ (nullable NSNumber *)getHeartRate10s;
+ (nullable NSNumber *)getHeartRate4s;

+ (nullable MeasurementResults *)getRealtimeMetrics:(double)periodSec;
+ (nullable MeasurementResults *)getMeasurementResults;

+ (nullable MeasurementResultsHistory *)getMeasurementResultsHistory;

+ (nonnull NSArray<Heartbeat *> *)getRealtimeHeartbeats:(nullable NSNumber *)periodSec;

+ (void)setRecordingEnabled:(BOOL)enabled;
+ (BOOL)isRecordingEnabled;
+ (float)getTotalBadSignalSeconds;
+ (float)getCurrentSignalQualityMetric;

+ (nullable NSData *)getSignalQualityMapPng;
+ (nullable NSData *)getFaceTexturePng;

+ (nonnull NSArray<NSNumber *> *)getFullPPGSignal;

+ (void)setCustomMeasurementConfig:(nonnull CustomMeasurementConfig *)config;
+ (void)setCustomColorTheme:(nonnull CustomColorTheme *)theme;

+ (void)setLanguage:(nonnull NSString *)language;

+ (void)openMeasurementResultsPdfInBrowser;
+ (void)sendMeasurementResultsPdfToEmail:(nonnull NSString *)email;
+ (void)requestMeasurementResultsPdfUrl;
+ (nullable NSString *)getMeasurementResultsPdfUrl;
+ (void)requestMeasurementResultsPdfBytes;
+ (nullable NSData *)getMeasurementResultsPdfBytes;

@end