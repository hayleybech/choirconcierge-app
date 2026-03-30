import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { WebView } from 'react-native-webview';
import * as SplashScreen from 'expo-splash-screen';
import {SafeAreaView, SafeAreaProvider} from "react-native-safe-area-context";
import {View} from "react-native";
import * as SecureStore from 'expo-secure-store';
import LoginScreen from './LoginScreen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    async function prepare() {
      try {
        // Check if SecureStore is available before using it
        const isSecureStoreAvailable = await SecureStore.isAvailableAsync();
        
        if (isSecureStoreAvailable) {
          SecureStore.deleteItemAsync('userToken');
          // Check for an existing token in SecureStore
          const token = await SecureStore.getItemAsync('userToken');
          if (token) {
            setUserToken(token);
          }
        } else {
          console.warn('SecureStore is not available on this platform/device.');
          // In a real app, we might fall back to AsyncStorage or handle it appropriately.
        }
        
        // Simulating resource loading
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn('Error during SecureStore operation:', e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately!
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-white" onLayout={onLayoutRootView}>
        <View className="flex-1">
          {!userToken ? (
            <LoginScreen onLoginSuccess={setUserToken} />
          ) : (
            <WebView 
              source={{
                uri: 'https://choirconcierge.com/app',
                headers: {
                  'X-WebView-Source': 'react-native-app', // Custom header
                  'Authorization': `Bearer ${userToken}`,
                },
              }}
              style={{ flex: 1 }}
            />
          )}
        </View>
        <StatusBar style="auto" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
