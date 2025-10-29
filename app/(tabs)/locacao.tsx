import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, Divider, List, Text, TextInput } from 'react-native-paper';
import { useCarrosContext } from '../../src/context/CarrosContext';
import { inserirLocacao, listarCarros } from '../../src/database/queries';

export default function NovaLocacaoScreen() {
  const { refreshCarros, setRefreshCarros } = useCarrosContext();

  const [carros, setCarros] = useState<any[]>([]);
  const [carroSelecionado, setCarroSelecionado] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [cliente, setCliente] = useState('');
  const [numeroCliente, setNumeroCliente] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [dataInicio, setDataInicio] = useState(new Date());
  const [horaInicio, setHoraInicio] = useState(new Date());
  const [dataFim, setDataFim] = useState(new Date());
  const [horaFim, setHoraFim] = useState(new Date());
  
  const [showDateInicio, setShowDateInicio] = useState(false);
  const [showTimeInicio, setShowTimeInicio] = useState(false);
  const [showDateFim, setShowDateFim] = useState(false);
  const [showTimeFim, setShowTimeFim] = useState(false);

  const carregarCarros = async () => {
    const lista = await listarCarros();
    setCarros(lista);
  };

  useEffect(() => {
    carregarCarros();
  }, []);

  useEffect(() => {
    if (refreshCarros) {
      carregarCarros();
      setRefreshCarros(false);
    }
  }, [refreshCarros]);

  const handleSelecionarCarro = (carro: any) => {
    setCarroSelecionado(carro);
    setModalVisible(false);
  };

  const handleCadastrarLocacao = async () => {
    if (!carroSelecionado || !cliente.trim()) {
      Alert.alert('⚠️ Atenção', 'Preencha todos os campos obrigatórios');
      return;
    }

    const dataInicioStr = dataInicio.toISOString().split('T')[0];
    const horaInicioStr = horaInicio.toTimeString().split(' ')[0].substring(0, 5);
    const dataFimStr = dataFim.toISOString().split('T')[0];
    const horaFimStr = horaFim.toTimeString().split(' ')[0].substring(0, 5);

    setLoading(true);
    try {
      await inserirLocacao(
        carroSelecionado.id,
        cliente.trim(),
        numeroCliente.trim(),
        dataInicioStr,
        horaInicioStr,
        dataFimStr,
        horaFimStr
      );
      
      Alert.alert('✅ Sucesso', 'Locação cadastrada com sucesso!');
      setCliente('');
      setNumeroCliente('');
      setCarroSelecionado(null);
      await carregarCarros();
    } catch (error: any) {
      Alert.alert('❌ Erro', 'Erro ao cadastrar locação: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.titulo}>
            📝 Nova Locação
          </Text>
          <Divider style={styles.divider} />

          <Text variant="titleMedium" style={styles.label}>Selecionar Carro</Text>
          <Button 
            mode="outlined" 
            onPress={() => setModalVisible(true)}
            style={styles.input}
            icon="car"
          >
            {carroSelecionado 
              ? `${carroSelecionado.modelo} - ${carroSelecionado.placa}` 
              : 'Selecionar Carro'}
          </Button>

          <TextInput
            label="Nome do Cliente *"
            value={cliente}
            onChangeText={setCliente}
            mode="outlined"
            style={styles.input}
            placeholder="Digite o nome completo do cliente"
            left={<TextInput.Icon icon="account" />}
          />

          <TextInput
            label="Número do Cliente"
            value={numeroCliente}
            onChangeText={setNumeroCliente}
            mode="outlined"
            style={styles.input}
            placeholder="Digite o número/telefone do cliente"
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

          <Button 
            mode="contained" 
            onPress={handleCadastrarLocacao}
            style={styles.botao}
            icon="check-circle"
            loading={loading}
            disabled={loading}
          >
            Cadastrar Locação
          </Button>
        </Card.Content>
      </Card>

      {/* Modal de Seleção de Carros */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text variant="headlineSmall" style={styles.modalTitulo}>
              🚗 Selecione um Carro
            </Text>
            <Divider style={styles.modalDivider} />
            
            <ScrollView style={styles.modalScroll}>
              {carros.length === 0 ? (
                <Text style={styles.emptyText}>Nenhum carro cadastrado</Text>
              ) : (
                carros.map((carro) => (
                  <TouchableOpacity 
                    key={carro.id} 
                    onPress={() => handleSelecionarCarro(carro)}
                  >
                    <List.Item
                      title={carro.modelo}
                      description={`Placa: ${carro.placa}`}
                      left={props => <List.Icon {...props} icon="car" />}
                      style={styles.listItem}
                    />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            <Button 
              mode="outlined" 
              onPress={() => setModalVisible(false)}
              style={styles.modalBotaoFechar}
            >
              Fechar
            </Button>
          </View>
        </View>
      </Modal>

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
  label: {
    marginBottom: 8,
    fontWeight: 'bold',
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
  botao: {
    marginTop: 24,
    paddingVertical: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
  },
  modalTitulo: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalDivider: {
    marginBottom: 16,
  },
  modalScroll: {
    maxHeight: 400,
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: '#757575',
  },
  modalBotaoFechar: {
    marginTop: 16,
  },
});
