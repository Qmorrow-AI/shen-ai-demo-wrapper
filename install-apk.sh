#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Installing Release APK...${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "android" ]; then
    echo -e "${RED}Error: Please run this script from the React Native project root directory${NC}"
    exit 1
fi

# Set APK path for release
APK_PATH="android/app/build/outputs/apk/release/app-release.apk"
APP_ID="com.testapp.prod"

# Check if APK exists
if [ ! -f "$APK_PATH" ]; then
    echo -e "${RED}❌ Release APK not found at: ${APK_PATH}${NC}"
    echo -e "${YELLOW}💡 Build the APK first with: ./build-apk.sh${NC}"
    exit 1
fi

# Check if device is connected
if ! adb devices | grep -q "device$"; then
    echo -e "${RED}❌ No Android device connected${NC}"
    echo -e "${YELLOW}💡 Connect a device or start an emulator first${NC}"
    exit 1
fi

# Install the APK
echo -e "${YELLOW}Installing ${APK_PATH}...${NC}"

if adb install -r "$APK_PATH"; then
    echo -e "${GREEN}✅ Release APK installed successfully!${NC}"
    echo -e "${BLUE}🏷️  App ID: ${APP_ID}${NC}"
    echo -e "${BLUE}📱 App Name: Medical Service${NC}"
    echo -e "${BLUE}🎨 Icon: Blue medical cross${NC}"
    echo -e "${YELLOW}💡 To uninstall: adb uninstall ${APP_ID}${NC}"
    echo -e "${BLUE}📋 This is a standalone app (no Metro required)${NC}"
else
    echo -e "${RED}❌ APK installation failed${NC}"
    exit 1
fi 