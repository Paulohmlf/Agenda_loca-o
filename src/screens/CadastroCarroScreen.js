import { useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { Button, Card, Text, TextInput } from 'react-native-paper';
import { inserirCarro } from '../database/queries';

export default function CadastroCarroScreen({ navigation }) {
  const [modelo, setModelo] = useState('');
  const [placa, setPlaca] = useState('');

  const handleCadastrar = async () => {
    if (!modelo.trim() || !placa.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    try {
      await inserirCarro(modelo, placa.toUpperCase());
      Alert.alert('Sucesso', 'Carro cadastrado com sucesso!');
      setModelo('');
      setPlaca('');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao cadastrar carro: ' + error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.titulo}>
            🚗 Cadastrar Novo Carro
          </Text>
          
          <TextInput
            label="Modelo do Carro"
            value={modelo}
            onChangeText={setModelo}
            mode="outlined"
            style={styles.input}
            placeholder="Ex: Fiat Uno, Chevrolet Onix"
          />

          <TextInput
            label="Placa"
            value={placa}
            onChangeText={setPlaca}
            mode="outlined"
            style={styles.input}
            placeholder="Ex: ABC-1234"
            autoCapitalize="characters"
            maxLength={8}
          />

          <Button 
            mode="contained" 
            onPress={handleCadastrar}
            style={styles.botao}
            icon="car-plus"
          >
            Cadastrar Carro
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    marginTop: 16,
  },
  titulo: {
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  botao: {
    marginTop: 16,
    paddingVertical: 8,
  },
});
