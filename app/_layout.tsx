import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { CarrosProvider } from '../src/context/CarrosContext';
import { initDatabase } from '../src/database/database';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initDatabase();
        setDbReady(true);
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error('❌ Erro ao inicializar banco de dados:', error);
      }
    };

    setupDatabase();
  }, []);

  if (!dbReady) {
    return null;
  }

  return (
    <PaperProvider>
      <CarrosProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </CarrosProvider>
    </PaperProvider>
  );
}
