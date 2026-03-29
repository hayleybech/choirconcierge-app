import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { WebView } from 'react-native-webview';
import * as SplashScreen from 'expo-splash-screen';
import {SafeAreaView} from "react-native-safe-area-context";
import {View} from "react-native";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        // For now, just simulate a delay for loading resources
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we need this to stay
      // visible until the WebView is loaded, we could handle it differently.
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-white" onLayout={onLayoutRootView}>
      <View className="flex-1">
        <WebView 
          source={{ uri: 'https://choirconcierge.com/app' }} 
          style={{ flex: 1 }}
        />
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}
