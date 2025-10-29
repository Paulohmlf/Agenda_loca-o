import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { Button, Card, Divider, Text, TextInput } from 'react-native-paper';
import { useCarrosContext } from '../../src/context/CarrosContext';
import { inserirCarro } from '../../src/database/queries';

export default function CadastroScreen() {
  const [modelo, setModelo] = useState('');
  const [placa, setPlaca] = useState('');
  const [valorDiaria, setValorDiaria] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setRefreshCarros } = useCarrosContext();

  const handleCadastrar = async () => {
    if (!modelo.trim() || !placa.trim() || !valorDiaria.trim()) {
      Alert.alert('⚠️ Atenção', 'Preencha todos os campos');
      return;
    }

    const valorDiariaNum = parseFloat(valorDiaria.replace(',', '.'));
    if (isNaN(valorDiariaNum) || valorDiariaNum <= 0) {
      Alert.alert('⚠️ Atenção', 'Digite um valor de diária válido');
      return;
    }

    setLoading(true);
    try {
      await inserirCarro(modelo.trim(), placa.toUpperCase().trim(), valorDiariaNum);
      Alert.alert('✅ Sucesso', 'Carro cadastrado com sucesso!');
      setModelo('');
      setPlaca('');
      setValorDiaria('');
      
      setRefreshCarros(true);
      router.push('/locacao');
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        Alert.alert('❌ Erro', 'Esta placa já está cadastrada!');
      } else {
        Alert.alert('❌ Erro', 'Erro ao cadastrar carro: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.titulo}>
            🚗 Cadastrar Novo Carro
          </Text>
          <Divider style={styles.divider} />
          
          <TextInput
            label="Modelo do Carro"
            value={modelo}
            onChangeText={setModelo}
            mode="outlined"
            style={styles.input}
            placeholder="Ex: Fiat Uno, Chevrolet Onix, Toyota Corolla"
            left={<TextInput.Icon icon="car" />}
          />

          <TextInput
            label="Placa"
            value={placa}
            onChangeText={setPlaca}
            mode="outlined"
            style={styles.input}
            placeholder="Ex: ABC-1234 ou ABC1D34"
            autoCapitalize="characters"
            maxLength={8}
            left={<TextInput.Icon icon="card-text" />}
          />

          <TextInput
            label="Valor da Diária (R$)"
            value={valorDiaria}
            onChangeText={setValorDiaria}
            mode="outlined"
            style={styles.input}
            placeholder="Ex: 100.00"
            keyboardType="numeric"
            left={<TextInput.Icon icon="currency-usd" />}
          />

          <Button 
            mode="contained" 
            onPress={handleCadastrar}
            style={styles.botao}
            icon="car-plus"
            loading={loading}
            disabled={loading}
          >
            Cadastrar Carro
          </Button>

          <Card style={styles.infoCard}>
            <Card.Content>
              <Text variant="titleSmall" style={styles.infoTitulo}>
                💡 Dica
              </Text>
              <Text variant="bodySmall">
                • Digite o modelo completo do veículo{'\n'}
                • A placa será salva automaticamente em maiúsculas{'\n'}
                • O valor da diária será usado para calcular o total das locações{'\n'}
                • Use ponto ou vírgula para separar centavos (ex: 100.50 ou 100,50)
              </Text>
            </Card.Content>
          </Card>
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
    elevation: 4,
  },
  titulo: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  divider: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  botao: {
    marginTop: 16,
    paddingVertical: 8,
  },
  infoCard: {
    marginTop: 24,
    backgroundColor: '#E3F2FD',
  },
  infoTitulo: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
