#!/usr/bin/env bash
# Simple helper to bootstrap the minimal_app project.
# 1. Installs JS dependencies with Yarn (fast & skips SDK prepare script)
# 2. Starts Metro bundler with npm
#
# Usage: ./develop.sh
#
# Tip: make it executable first ->  chmod +x develop.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📦 Installing JS dependencies with Yarn…"
yarn install --silent

echo "🚀 Starting Metro bundler (npm start)…"
npm start 