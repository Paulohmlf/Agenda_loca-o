import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Menu, Text, TextInput } from 'react-native-paper';
import { inserirLocacao, listarCarros } from '../database/queries';

export default function NovaLocacaoScreen({ navigation }) {
  const [carros, setCarros] = useState([]);
  const [carroSelecionado, setCarroSelecionado] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [cliente, setCliente] = useState('');
  
  const [dataInicio, setDataInicio] = useState(new Date());
  const [horaInicio, setHoraInicio] = useState(new Date());
  const [dataFim, setDataFim] = useState(new Date());
  const [horaFim, setHoraFim] = useState(new Date());
  
  const [showDateInicio, setShowDateInicio] = useState(false);
  const [showTimeInicio, setShowTimeInicio] = useState(false);
  const [showDateFim, setShowDateFim] = useState(false);
  const [showTimeFim, setShowTimeFim] = useState(false);

  useEffect(() => {
    carregarCarros();
  }, []);

  const carregarCarros = async () => {
    const lista = await listarCarros();
    setCarros(lista);
  };

  const handleCadastrarLocacao = async () => {
    if (!carroSelecionado || !cliente.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    const dataInicioStr = dataInicio.toISOString().split('T')[0];
    const horaInicioStr = horaInicio.toTimeString().split(' ')[0].substring(0, 5);
    const dataFimStr = dataFim.toISOString().split('T')[0];
    const horaFimStr = horaFim.toTimeString().split(' ')[0].substring(0, 5);

    try {
      await inserirLocacao(
        carroSelecionado.id,
        cliente,
        dataInicioStr,
        horaInicioStr,
        dataFimStr,
        horaFimStr
      );
      
      Alert.alert('Sucesso', 'Locação cadastrada com sucesso!');
      setCliente('');
      setCarroSelecionado(null);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao cadastrar locação: ' + error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.titulo}>
            📝 Nova Locação
          </Text>

          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Button 
                mode="outlined" 
                onPress={() => setMenuVisible(true)}
                style={styles.input}
              >
                {carroSelecionado ? `${carroSelecionado.modelo} - ${carroSelecionado.placa}` : 'Selecionar Carro'}
              </Button>
            }
          >
            {carros.map((carro) => (
              <Menu.Item
                key={carro.id}
                onPress={() => {
                  setCarroSelecionado(carro);
                  setMenuVisible(false);
                }}
                title={`${carro.modelo} - ${carro.placa}`}
              />
            ))}
          </Menu>

          <TextInput
            label="Nome do Cliente"
            value={cliente}
            onChangeText={setCliente}
            mode="outlined"
            style={styles.input}
            placeholder="Digite o nome do cliente"
          />

          <Text variant="titleMedium" style={styles.subtitulo}>
            Data e Hora de Início
          </Text>
          
          <View style={styles.dateTimeRow}>
            <Button 
              mode="outlined" 
              onPress={() => setShowDateInicio(true)}
              style={styles.dateButton}
            >
              📅 {dataInicio.toLocaleDateString('pt-BR')}
            </Button>
            
            <Button 
              mode="outlined" 
              onPress={() => setShowTimeInicio(true)}
              style={styles.dateButton}
            >
              🕐 {horaInicio.toTimeString().substring(0, 5)}
            </Button>
          </View>

          <Text variant="titleMedium" style={styles.subtitulo}>
            Data e Hora de Devolução
          </Text>
          
          <View style={styles.dateTimeRow}>
            <Button 
              mode="outlined" 
              onPress={() => setShowDateFim(true)}
              style={styles.dateButton}
            >
              📅 {dataFim.toLocaleDateString('pt-BR')}
            </Button>
            
            <Button 
              mode="outlined" 
              onPress={() => setShowTimeFim(true)}
              style={styles.dateButton}
            >
              🕐 {horaFim.toTimeString().substring(0, 5)}
            </Button>
          </View>

          <Button 
            mode="contained" 
            onPress={handleCadastrarLocacao}
            style={styles.botao}
            icon="check"
          >
            Cadastrar Locação
          </Button>
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
  card: {
    marginTop: 16,
  },
  titulo: {
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
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
  },
  dateButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  botao: {
    marginTop: 24,
    paddingVertical: 8,
  },
});
