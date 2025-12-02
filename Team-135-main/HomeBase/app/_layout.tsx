import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text, TextInput, View } from 'react-native';
import 'react-native-reanimated';
import {
  useFonts,
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from '@expo-google-fonts/nunito';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppProvider } from '../src/context/AppContext';

export const unstable_settings = {
  anchor: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  useEffect(() => {
    if (!fontsLoaded) return;

    const baseStyle = { fontFamily: 'Nunito_400Regular', letterSpacing: 0.15 };

    Text.defaultProps = {
      ...(Text.defaultProps || {}),
      style: { ...(Text.defaultProps?.style || {}), ...baseStyle },
    };

    TextInput.defaultProps = {
      ...(TextInput.defaultProps || {}),
      style: { ...(TextInput.defaultProps?.style || {}), fontFamily: 'Nunito_400Regular' },
    };
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#050408' }} />;
  }

  return (
    <AppProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AppProvider>
  );
}
