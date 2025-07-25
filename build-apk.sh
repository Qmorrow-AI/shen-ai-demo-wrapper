#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Building React Native Release APK...${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "android" ]; then
    echo -e "${RED}Error: Please run this script from the React Native project root directory${NC}"
    exit 1
fi

# Clean previous builds (optional)
if [ "$1" = "--clean" ]; then
    echo -e "${YELLOW}Cleaning previous builds...${NC}"
    cd android && ./gradlew clean && cd ..
fi

# Build the APK
echo -e "${YELLOW}Building release APK...${NC}"
cd android

if ./gradlew assembleRelease; then
    cd ..
    APK_PATH="android/app/build/outputs/apk/release/app-release.apk"
    APP_ID="com.testapp.prod"
    
    if [ -f "$APK_PATH" ]; then
        APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
        echo -e "${GREEN}✅ Release APK built successfully!${NC}"
        echo -e "${GREEN}📱 APK location: ${APK_PATH}${NC}"
        echo -e "${GREEN}📏 APK size: ${APK_SIZE}${NC}"
        echo -e "${BLUE}🏷️  App ID: ${APP_ID}${NC}"
        echo -e "${YELLOW}💡 To install: ./install-apk.sh${NC}"
        echo -e "${YELLOW}💡 To uninstall: adb uninstall ${APP_ID}${NC}"
        echo -e "${BLUE}📋 This is a standalone APK (no Metro required)${NC}"
    else
        echo -e "${RED}❌ APK file not found at expected location${NC}"
        exit 1
    fi
else
    cd ..
    echo -e "${RED}❌ APK build failed${NC}"
    exit 1
fi 