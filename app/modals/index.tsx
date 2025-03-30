import { Redirect } from 'expo-router';

// This file is needed to ensure the modals directory is recognized as a route
// Redirects to tabs if someone navigates here directly
export default function ModalsIndex() {
  return <Redirect href="/(tabs)" />;
} 