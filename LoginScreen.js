import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import * as SecureStore from 'expo-secure-store';
import * as Device from 'expo-device';
import * as Yup from 'yup';
import * as Linking from 'expo-linking';

const loginSchema = Yup.object().shape({
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required')
        .max(255, 'Email must be less than 191 characters'),
    password: Yup.string().required('Password is required')
        .min(8, 'Password must be at least 8 characters')
        .max(255, 'Password must be less than 255 characters'),
    two_factor_code: Yup.string().when('show2FA', {
        is: true,
        then: (schema) => schema.required('2FA code is required').min(6, '2FA code must be at least 6 characters'),
        otherwise: (schema) => schema.notRequired(),
    }),
});

const LoginScreen = ({onLoginSuccess}) => {
    const [loading, setLoading] = useState(false);
    const [show2FA, setShow2FA] = useState(true);
    const {
        control,
        handleSubmit,
        setError,
        formState: {errors},
    } = useForm({
        resolver: yupResolver(loginSchema),
        context: {show2FA},
        defaultValues: {
            email: '',
            password: '',
            two_factor_code: '',
        },
    });

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const body = {
                email: data.email,
                password: data.password,
                device_name: Device.deviceName || Device.modelName || 'Unknown Device'
            };

            if (show2FA) {
                body.two_factor_code = data.two_factor_code;
            }

            const response = await fetch('https://choirconcierge.com/api/sanctum/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (response.status === 403) {
                const errorData = await response.json();
                if (errorData.message === 'Two-factor authentication required') {
                    setShow2FA(true);
                    return;
                }
            }

            if (response.status === 422) {
                const errorText = await response.text();
                const errorData = JSON.parse(errorText);

                if (!errorData.errors) {
                    Alert.alert('Error', errorData.message || 'Invalid credentials');
                    return;
                }

                Object.keys(errorData.errors).forEach((field) => {
                    setError(field, {
                        type: 'manual',
                        message: errorData.errors[field][0], // Take the first error for each field
                    });
                });
                return;
            }

            if (!response.ok) {
                Alert.alert('Error', 'An unexpected error occurred. Please try again.');
                return;
            }

            const token = await response.text();

            // Ensure the token is placed in long-term storage
            if (await SecureStore.isAvailableAsync()) {
                await SecureStore.setItemAsync('userToken', token);
            } else {
                console.warn('SecureStore not available. Token not saved securely.');
            }

            onLoginSuccess(token);
        } catch (error) {
            Alert.alert('Error', 'Unable to connect to the server. Please check your internet connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = () => {
      Linking.openURL('https://choirconcierge.com/app/password/reset');
    };

    return (
        <View className="flex-1 justify-center items-center px-8 bg-slate-50">
            <View className="flex justify-center items-center">
                <Image
                    source={require('./assets/splash-logo.png')}
                    className="w-64"
                    resizeMode="contain"
                />
            </View>
            <View className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <View className="items-center mb-8">

                    <Text className="text-slate-500 mt-1">Please sign in to your account</Text>
                </View>

                <View className="space-y-4">
                    {!show2FA ? (
                        <>
                            <View>
                                <Text className="text-sm font-medium text-slate-700 mb-1 ml-1">Email address</Text>
                                <Controller
                                    control={control}
                                    name="email"
                                    render={({field: {onChange, onBlur, value}}) => (
                                        <TextInput
                                            className={`w-full h-12 bg-slate-50 border ${errors.email ? 'border-red-500' : 'border-slate-200'} rounded-xl px-4 text-slate-900 focus:border-purple-500`}
                                            placeholder="Enter your email address"
                                            placeholderTextColor="#94a3b8"
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                            autoCapitalize="none"
                                            keyboardType="email-address"
                                        />
                                    )}
                                />
                                {errors.email &&
                                    <Text className="text-red-500 text-xs mt-1 ml-1">{errors.email.message}</Text>}
                            </View>

                            <View className="mt-4">
                                <Text className="text-sm font-medium text-slate-700 mb-1 ml-1">Password</Text>
                                <Controller
                                    control={control}
                                    name="password"
                                    render={({field: {onChange, onBlur, value}}) => (
                                        <TextInput
                                            className={`w-full h-12 bg-slate-50 border ${errors.password ? 'border-red-500' : 'border-slate-200'} rounded-xl px-4 text-slate-900 focus:border-purple-500`}
                                            placeholder="Enter your password"
                                            placeholderTextColor="#94a3b8"
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                            secureTextEntry
                                        />
                                    )}
                                />
                                {errors.password &&
                                    <Text className="text-red-500 text-xs mt-1 ml-1">{errors.password.message}</Text>}
                            </View>
                        </>
                    ) : (
                        <View>
                            <Text className="text-sm font-medium text-slate-700 mb-1 ml-1">Two-Factor Authentication
                                Code</Text>
                            <Controller
                                control={control}
                                name="two_factor_code"
                                render={({field: {onChange, onBlur, value}}) => (
                                    <TextInput
                                        className={`w-full h-12 bg-slate-50 border ${errors.two_factor_code ? 'border-red-500' : 'border-slate-200'} rounded-xl px-4 text-slate-900 focus:border-purple-500`}
                                        placeholder="Enter your 2FA code"
                                        placeholderTextColor="#94a3b8"
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        keyboardType="number-pad"
                                        autoFocus
                                    />
                                )}
                            />
                            {errors.two_factor_code && <Text
                                className="text-red-500 text-xs mt-1 ml-1">{errors.two_factor_code.message}</Text>}
                            <TouchableOpacity
                                className="mt-2"
                                onPress={() => setShow2FA(false)}
                            >
                                <Text className="text-purple-600 text-xs ml-1">Back to Login</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <TouchableOpacity
                        className="w-full h-10 bg-purple-600 justify-center items-center rounded-xl mt-8 shadow-md shadow-purple-200 active:bg-purple-700"
                        onPress={handleSubmit(onSubmit)}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white"/>
                        ) : (
                            <Text className="text-white font-bol text-">{show2FA ? 'Verify Code' : 'Sign In'}</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity className="mt-6 items-center" onPress={handleForgotPassword}>
                    <Text className="text-purple-600 font-medium">Forgot Password?</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default LoginScreen;
