import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Divider, Text, TextInput } from 'react-native-paper';
import { atualizarLocacao, getLocacaoPorId } from '../src/database/queries';

export default function EditarLocacaoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const locacaoId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [carregando, setCarregando] = useState(true);
  
  const [carroModelo, setCarroModelo] = useState('');
  const [carroPlaca, setCarroPlaca] = useState('');
  const [cliente, setCliente] = useState('');
  const [numeroCliente, setNumeroCliente] = useState('');
  
  const [dataInicio, setDataInicio] = useState(new Date());
  const [horaInicio, setHoraInicio] = useState(new Date());
  const [dataFim, setDataFim] = useState(new Date());
  const [horaFim, setHoraFim] = useState(new Date());
  
  const [showDateInicio, setShowDateInicio] = useState(false);
  const [showTimeInicio, setShowTimeInicio] = useState(false);
  const [showDateFim, setShowDateFim] = useState(false);
  const [showTimeFim, setShowTimeFim] = useState(false);

  useEffect(() => {
    carregarLocacao();
  }, []);

  const carregarLocacao = async () => {
    try {
      const locacao = await getLocacaoPorId(parseInt(locacaoId));
      
      if (locacao) {
        setCarroModelo(locacao.carro_modelo);
        setCarroPlaca(locacao.carro_placa);
        setCliente(locacao.cliente);
        setNumeroCliente(locacao.numero_cliente || '');
        
        const [anoInicio, mesInicio, diaInicio] = locacao.data_inicio.split('-');
        const [horaI, minutoI] = locacao.hora_inicio.split(':');
        const dateInicio = new Date(parseInt(anoInicio), parseInt(mesInicio) - 1, parseInt(diaInicio));
        dateInicio.setHours(parseInt(horaI), parseInt(minutoI));
        setDataInicio(dateInicio);
        setHoraInicio(dateInicio);
        
        const [anoFim, mesFim, diaFim] = locacao.data_fim.split('-');
        const [horaF, minutoF] = locacao.hora_fim.split(':');
        const dateFim = new Date(parseInt(anoFim), parseInt(mesFim) - 1, parseInt(diaFim));
        dateFim.setHours(parseInt(horaF), parseInt(minutoF));
        setDataFim(dateFim);
        setHoraFim(dateFim);
      }
      
      setCarregando(false);
    } catch (error) {
      console.error('Erro ao carregar locação:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados da locação');
      router.back();
    }
  };

  const handleSalvar = async () => {
    if (!cliente.trim()) {
      Alert.alert('⚠️ Atenção', 'Preencha o nome do cliente');
      return;
    }

    const dataInicioStr = dataInicio.toISOString().split('T')[0];
    const horaInicioStr = horaInicio.toTimeString().split(' ')[0].substring(0, 5);
    const dataFimStr = dataFim.toISOString().split('T')[0];
    const horaFimStr = horaFim.toTimeString().split(' ')[0].substring(0, 5);

    setLoading(true);
    try {
      await atualizarLocacao(
        parseInt(locacaoId),
        cliente.trim(),
        numeroCliente.trim(),
        dataInicioStr,
        horaInicioStr,
        dataFimStr,
        horaFimStr
      );
      
      Alert.alert('✅ Sucesso', 'Locação atualizada com sucesso!');
      router.back();
    } catch (error: any) {
      Alert.alert('❌ Erro', 'Erro ao atualizar locação: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.titulo}>
            ✏️ Editar Locação
          </Text>
          <Divider style={styles.divider} />

          <View style={styles.infoCard}>
            <Text variant="titleMedium" style={styles.carroInfo}>
              🚗 {carroModelo}
            </Text>
            <Text variant="bodyMedium">📋 Placa: {carroPlaca}</Text>
          </View>

          <Divider style={styles.dividerInterno} />

          <TextInput
            label="Nome do Cliente *"
            value={cliente}
            onChangeText={setCliente}
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="account" />}
          />

          <TextInput
            label="Número do Cliente"
            value={numeroCliente}
            onChangeText={setNumeroCliente}
            mode="outlined"
            style={styles.input}
            keyboardType="phone-pad"
            left={<TextInput.Icon icon="phone" />}
          />

          <Text variant="titleMedium" style={styles.subtitulo}>
            📅 Data e Hora de Início
          </Text>
          
          <View style={styles.dateTimeRow}>
            <Button 
              mode="outlined" 
              onPress={() => setShowDateInicio(true)}
              style={styles.dateButton}
              icon="calendar"
            >
              {dataInicio.toLocaleDateString('pt-BR')}
            </Button>
            
            <Button 
              mode="outlined" 
              onPress={() => setShowTimeInicio(true)}
              style={styles.dateButton}
              icon="clock"
            >
              {horaInicio.toTimeString().substring(0, 5)}
            </Button>
          </View>

          <Text variant="titleMedium" style={styles.subtitulo}>
            🏁 Data e Hora de Devolução
          </Text>
          
          <View style={styles.dateTimeRow}>
            <Button 
              mode="outlined" 
              onPress={() => setShowDateFim(true)}
              style={styles.dateButton}
              icon="calendar"
            >
              {dataFim.toLocaleDateString('pt-BR')}
            </Button>
            
            <Button 
              mode="outlined" 
              onPress={() => setShowTimeFim(true)}
              style={styles.dateButton}
              icon="clock"
            >
              {horaFim.toTimeString().substring(0, 5)}
            </Button>
          </View>

          <View style={styles.buttonRow}>
            <Button 
              mode="outlined" 
              onPress={() => router.back()}
              style={styles.buttonHalf}
            >
              Cancelar
            </Button>
            
            <Button 
              mode="contained" 
              onPress={handleSalvar}
              style={styles.buttonHalf}
              loading={loading}
              disabled={loading}
            >
              Salvar
            </Button>
          </View>
        </Card.Content>
      </Card>

      {showDateInicio && (
        <DateTimePicker
          value={dataInicio}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDateInicio(false);
            if (selectedDate) setDataInicio(selectedDate);
          }}
        />
      )}

      {showTimeInicio && (
        <DateTimePicker
          value={horaInicio}
          mode="time"
          display="default"
          onChange={(event, selectedTime) => {
            setShowTimeInicio(false);
            if (selectedTime) setHoraInicio(selectedTime);
          }}
        />
      )}

      {showDateFim && (
        <DateTimePicker
          value={dataFim}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDateFim(false);
            if (selectedDate) setDataFim(selectedDate);
          }}
        />
      )}

      {showTimeFim && (
        <DateTimePicker
          value={horaFim}
          mode="time"
          display="default"
          onChange={(event, selectedTime) => {
            setShowTimeFim(false);
            if (selectedTime) setHoraFim(selectedTime);
          }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  dividerInterno: {
    marginVertical: 16,
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  carroInfo: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitulo: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  dateButton: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 8,
  },
  buttonHalf: {
    flex: 1,
  },
});
