/**
 * Medical Service App - Refactored TypeScript Version
 * 
 * This app integrates ShenAI SDK for medical measurements and OpenMRS for patient data management.
 * Features:
 * - Server configuration with dropdown selection
 * - OpenMRS credentials and location management
 * - Patient selection from configured locations
 * - ShenAI scanner with automatic measurement sending to OpenMRS
 * - Complete visit creation with measurements
 */

import React from 'react';
import MainApp from './src/App';

function App(): React.JSX.Element {
  return <MainApp />;
}

export default App;
