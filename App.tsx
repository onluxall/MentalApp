import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  )
}


//BACKEND TEAM: Consider these integration points:
//- Add global authentication state management here
//- Implement token storage/retrieval for persistent login
//- Add global loading state for API calls
//- Consider adding error handling middleware for API responses