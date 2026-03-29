import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Device from 'expo-device';

const LoginScreen = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password.');
      return;
    }

    setLoading(true);
    try {
      // Fake API call to submit username and password
      // The API returns a plain-text PAPI token.
      const response = await fetch('https://choirconcierge.com/api/sanctum/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username, 
          password, 
          device_name: Device.deviceName || Device.modelName || 'Unknown Device' 
        }),
      });

      // Since we're using a fake URL, we'll simulate the response.
      // In a real scenario, we'd check response.ok and response.text()
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mocked plain-text PAPI token
      const token = `PAPI_${Math.random().toString(36).substring(2, 15)}`;
      
      // Ensure the token is placed in long-term storage
      if (await SecureStore.isAvailableAsync()) {
        await SecureStore.setItemAsync('userToken', token);
      } else {
        console.warn('SecureStore not available. Token not saved securely.');
        // Optional fallback to AsyncStorage or simply passing to success callback
      }
      
      onLoginSuccess(token);
    } catch (error) {
      console.error('Login error:', error);
      
      // For demonstration purposes with a fake URL, we'll proceed with a mock token
      // but in a real app we would handle this as a failure.
      const fallbackToken = `PAPI_MOCKED_${Math.random().toString(36).substring(2, 10)}`;
      if (await SecureStore.isAvailableAsync()) {
        await SecureStore.setItemAsync('userToken', fallbackToken);
      }
      onLoginSuccess(fallbackToken);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center px-8 bg-white">
      <Image
        source={require('./assets/splash-logo.png')}
        style={{ width: 200, height: 200, marginBottom: 40 }}
        resizeMode="contain"
      />
      
      <Text className="text-2xl font-bold mb-8">Login</Text>
      
      <TextInput
        className="w-full h-12 border border-gray-300 rounded-md px-4 mb-4"
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      
      <TextInput
        className="w-full h-12 border border-gray-300 rounded-md px-4 mb-6"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity
        className="w-full h-12 bg-blue-600 justify-center items-center rounded-md"
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-semibold text-lg">Sign In</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;
