# Choir Concierge App - Development Guidelines

This document outlines the coding standards, patterns, and best practices for the Choir Concierge mobile application.

## 1. Project Overview
Choir Concierge is an Expo-based React Native application that provides a native login interface and then wraps the main application in a `WebView`.

- **Framework**: Expo (React Native)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Form Management**: React Hook Form
- **Validation**: Yup
- **Persistence**: Expo SecureStore
- **Main Content**: WebView with Bearer authentication

---

## 2. Coding Standards

### 2.1 Functional Components
Always use functional components with Hooks. Avoid Class components.
```javascript
const MyComponent = ({ prop1 }) => {
  // logic here
  return (
    <View>
      <Text>{prop1}</Text>
    </View>
  );
};
```

### 2.2 Hooks Usage
- Use `useState` for local state.
- Use `useEffect` for side effects, ensuring clean-up functions are provided where necessary.
- Use `useCallback` for memoizing functions passed as props to optimized child components.

### 2.3 File Naming
- Use **PascalCase** for component files (e.g., `LoginScreen.js`).
- Use **camelCase** for utility or configuration files (e.g., `babel.config.js`).

### 2.4 Conditions and Loops
- Use ternary operators for simple conditions.
- Prefer `map` over `forEach` for creating lists.
- Avoid nested loops where possible.
- Prefer early returns rather than `else`.

---

## 3. Styling (NativeWind)

We use **NativeWind** (Tailwind CSS) for styling. Avoid inline styles or `StyleSheet.create` unless absolutely necessary for dynamic values that Tailwind cannot handle.

### 3.1 Class Names
Apply styles using the `className` attribute.
```javascript
<View className="flex-1 justify-center items-center px-8 bg-slate-50">
  <Text className="text-purple-600 font-bold">Hello World</Text>
</View>
```

### 3.2 Design Tokens
- Follow the color palette defined in `tailwind.config.js`.
- Use standard spacing and typography classes provided by Tailwind.

---

## 4. Forms and Validation

### 4.1 React Hook Form
Manage form state using `react-hook-form`. Use the `Controller` component for inputs to ensure cross-platform compatibility.

### 4.2 Validation with Yup
Define validation schemas using `Yup`. Use `yupResolver` to integrate with React Hook Form.

```javascript
const schema = Yup.object().shape({
  email: Yup.string().email().required(),
});

const { control, handleSubmit } = useForm({
  resolver: yupResolver(schema),
});
```

---

## 5. Security and Data Persistence

### 5.1 Sensitive Data
Never store sensitive information (like `userToken`) in plain `AsyncStorage`. Use **`expo-secure-store`**.

### 5.2 Token Handling
- Check for `SecureStore.isAvailableAsync()` before performing operations.
- The `userToken` should be passed to the WebView via the `Authorization` header.

---

## 6. WebView Integration

The main app functionality is delivered via a `WebView`.
- Custom header `X-WebView-Source: react-native-app` is used to identify the native app.
- Authenticated requests must include `Authorization: Bearer <token>`.

---

## 7. Performance and Best Practices

- **Splash Screen**: Keep the splash screen visible (`SplashScreen.preventAutoHideAsync()`) until all required resources and tokens are loaded.
- **Error Handling**: Use `Alert.alert` for user-facing errors and `console.warn`/`console.error` for development logging.
- **Environment**: Always test changes on both iOS and Android if possible, as NativeWind and WebView behavior can vary.

