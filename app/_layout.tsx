import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { CarrosProvider } from '../src/context/CarrosContext';
import { initDatabase } from '../src/database/database';
import { requestNotificationPermissions } from '../src/utils/notifications'; // <--- Importado

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const setupApp = async () => {
      try {
        // 1. Inicializa o Banco de Dados
        await initDatabase();
        
        // 2. Solicita permissão para notificações (importante fazer no início)
        await requestNotificationPermissions();

        // 3. Libera o App
        setDbReady(true);
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error('❌ Erro ao inicializar o aplicativo:', error);
      }
    };

    setupApp();
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