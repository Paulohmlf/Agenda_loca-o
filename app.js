import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, PaperProvider } from 'react-native-paper';

import { initDatabase } from './src/database/database';
import AgendaScreen from './src/screens/AgendaScreen';
import CadastroCarroScreen from './src/screens/CadastroCarroScreen';
import NovaLocacaoScreen from './src/screens/NovaLocacaoScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    const setupDatabase = async () => {
      await initDatabase();
      setDbInitialized(true);
    };
    setupDatabase();
  }, []);

  if (!dbInitialized) {
    return null;
  }

  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Agenda"
          screenOptions={{
            headerStyle: { backgroundColor: '#6200ee' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        >
          <Stack.Screen 
            name="Agenda" 
            component={AgendaScreen}
            options={({ navigation }) => ({
              title: 'Agenda de Locações',
              headerRight: () => (
                <View style={styles.headerButtons}>
                  <Appbar.Action 
                    icon="car-plus" 
                    color="white"
                    onPress={() => navigation.navigate('CadastroCarro')} 
                  />
                  <Appbar.Action 
                    icon="file-document-plus" 
                    color="white"
                    onPress={() => navigation.navigate('NovaLocacao')} 
                  />
                </View>
              ),
            })}
          />
          <Stack.Screen 
            name="CadastroCarro" 
            component={CadastroCarroScreen}
            options={{ title: 'Cadastrar Carro' }}
          />
          <Stack.Screen 
            name="NovaLocacao" 
            component={NovaLocacaoScreen}
            options={{ title: 'Nova Locação' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  headerButtons: {
    flexDirection: 'row',
  },
});
