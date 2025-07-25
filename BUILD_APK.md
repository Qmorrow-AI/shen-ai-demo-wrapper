# Building APK for Manual Installation

This guide explains how to build a standalone APK file that you can manually install on Android devices, separate from your Metro development environment.

## Prerequisites

- Android SDK installed
- Java Development Kit (JDK) installed
- React Native development environment set up

## Two App Versions

### 1. Metro Development App
- **Package**: `com.testapp`
- **App Name**: "Medical Service (Dev)"
- **Icon**: Red background with white X
- **Command**: `npx react-native run-android`
- **Features**: Hot reload, Metro bundler, debugging

### 2. Standalone Release APK
- **Package**: `com.testapp.prod`
- **App Name**: "Medical Service"
- **Icon**: Blue background with white medical cross
- **Command**: `./build-apk.sh` then `./install-apk.sh`
- **Features**: Standalone, optimized, production-ready

**Note**: This setup creates only **one type of release APK** - a standalone production version that doesn't require Metro bundler.

## Building the Release APK

### Option 1: Using the shell script (Recommended)

```bash
# Build release APK
./build-apk.sh

# Build APK with clean (removes previous builds)
./build-apk.sh --clean
```

### Option 2: Using npm scripts

```bash
# Build release APK
npm run build-apk

# Build APK with clean
npm run build-apk-clean
```

### Option 3: Using Gradle directly

```bash
cd android
./gradlew assembleRelease
cd ..
```

## APK Location

After successful build, the APK will be located at:
```
android/app/build/outputs/apk/release/app-release.apk
```

## Installing the APK

### Option 1: Using the install script (Recommended)

```bash
# Install release APK
./install-apk.sh
```

### Option 2: Using ADB directly

```bash
# Install on connected device/emulator
adb install android/app/build/outputs/apk/release/app-release.apk

# Install on specific device (if multiple devices connected)
adb -s <device-id> install android/app/build/outputs/apk/release/app-release.apk
```

### Option 3: Manual Installation

1. Transfer the APK file to your Android device
2. Enable "Install from Unknown Sources" in your device settings
3. Open the APK file on your device to install

## ADB Connection Methods

### USB Cable Connection

#### Initial Setup:
```bash
# Enable USB debugging on your Android device
# Settings > Developer options > USB debugging

# Connect device via USB cable
# Check if device is detected
adb devices
```

#### Troubleshooting USB Connection:
```bash
# If device not detected, try:
adb kill-server
adb start-server
adb devices

# On some devices, you may need to:
# 1. Change USB mode to "File Transfer" or "MTP"
# 2. Accept the USB debugging prompt on device
# 3. Install device-specific USB drivers on your computer
```

### WiFi Connection

#### Method 1: Using ADB WiFi (Android 11+)
```bash
# On your Android device:
# Settings > Developer options > Wireless debugging > Enable

# Get pairing code and IP address from device
# Settings > Developer options > Wireless debugging > Pair device with pairing code

# On your computer, pair with the device:
adb pair <ip-address>:<port>
# Enter the pairing code when prompted

# After pairing, connect to the device:
adb connect <ip-address>:<port>

# Verify connection:
adb devices
```

#### Method 2: Using ADB over TCP (Legacy)
```bash
# First connect via USB cable
adb devices

# Enable TCP/IP mode:
adb tcpip 5555

# Get device IP address (from device settings or):
adb shell ip addr show wlan0

# Disconnect USB cable and connect via WiFi:
adb connect <device-ip>:5555

# Verify connection:
adb devices
```

#### Troubleshooting WiFi Connection:
```bash
# If connection fails:
adb kill-server
adb start-server
adb connect <ip-address>:<port>

# Check if device and computer are on same network
# Ensure firewall isn't blocking ADB ports
# Try different ports if 5555 is blocked
```

### Useful ADB Commands

```bash
# List connected devices
adb devices

# Get device info
adb shell getprop ro.product.model

# Check device IP address
adb shell ip addr show wlan0

# Restart ADB server
adb kill-server && adb start-server

# Install APK on specific device (if multiple connected)
adb -s <device-id> install <apk-path>
```

## Complete Workflow

### For Development:
```bash
# Start Metro bundler
npm start

# Run development app (connects to Metro)
npx react-native run-android
# OR
npm run android
```

### For Production Testing:
```bash
# Build standalone APK
./build-apk.sh

# Install APK
./install-apk.sh
```

## Backend Server

### Running the Mock Server:
```bash
# Start the Python mock server
python3 mock_server.py
```

The mock server will:
- Run on `http://localhost:3000`
- Accept POST requests to `/message` endpoint
- Print received messages to console
- Support JSON payload: `{'message': 'your message'}`

### Docker Server (Alternative):
If using the Docker server instead:
- Server runs on `http://192.168.1.26:13337`
- Endpoint: `/shenai/measurements`
- Use the dropdown in the app to select the correct server

## Managing Apps

### List installed apps:
```bash
adb shell pm list packages | grep testapp
```

### Uninstall apps:
```bash
# Uninstall development app
adb uninstall com.testapp

# Uninstall production app
adb uninstall com.testapp.prod
```

## Troubleshooting

### Build fails with signing errors
The app is configured to use debug signing for release builds. This is fine for manual installation.

### "Permission denied" when running script
Make sure the script is executable:
```bash
chmod +x build-apk.sh install-apk.sh
```

### APK not found after build
Check that the build completed successfully and look for the APK in the correct location.

### Both apps can coexist
The development and production apps have different package names, so they can be installed simultaneously without conflicts.

## Notes

- The release APK is signed with debug keys and cannot be published to Google Play Store
- The APK is optimized for manual installation and testing
- Make sure your device allows installation from unknown sources
- Both apps will appear in your app drawer with different names and icons
- **Single Release APK**: This setup creates only one type of release APK (standalone production version)
- **No Debug APK**: There's no separate debug APK - only the Metro development app and the standalone release APK 