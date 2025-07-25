#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "🐳 Building and running Shen-AI mock server in Docker..."
echo "📡 Server will be available at http://192.168.1.26:13337"

docker-compose up --build 