import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Text } from 'react-native-paper';
import { getAgendaDoDia } from '../database/queries';

export default function AgendaScreen() {
  const [date, setDate] = useState(new Date());
  const [agenda, setAgenda] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    carregarAgenda();
  }, [date]);

  const carregarAgenda = async () => {
    const dataFormatada = date.toISOString().split('T')[0];
    const dados = await getAgendaDoDia(dataFormatada);
    setAgenda(dados);
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const getCorPorTipo = (tipo) => {
    switch (tipo) {
      case 'Retirada':
        return '#4CAF50';
      case 'Devolução':
        return '#2196F3';
      default:
        return '#FF9800';
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.titulo}>
            📅 Agenda de Locações
          </Text>
          <Button 
            mode="outlined" 
            onPress={() => setShowDatePicker(true)}
            style={styles.botaoData}
          >
            {date.toLocaleDateString('pt-BR')}
          </Button>
        </Card.Content>
      </Card>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      <ScrollView style={styles.scrollView}>
        {agenda.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>
                Nenhuma locação agendada para este dia
              </Text>
            </Card.Content>
          </Card>
        ) : (
          agenda.map((item) => (
            <Card key={item.id} style={styles.agendaCard}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Chip 
                    style={[styles.chip, { backgroundColor: getCorPorTipo(item.tipo_agendamento) }]}
                    textStyle={styles.chipText}
                  >
                    {item.tipo_agendamento}
                  </Chip>
                </View>
                <Text variant="titleLarge" style={styles.carroNome}>
                  🚗 {item.carro}
                </Text>
                <Text variant="bodyMedium">📋 Placa: {item.placa}</Text>
                <Text variant="bodyMedium">👤 Cliente: {item.cliente}</Text>
                <View style={styles.horarioContainer}>
                  <Text variant="bodySmall">
                    ⏰ Início: {item.data_inicio} às {item.hora_inicio}
                  </Text>
                  <Text variant="bodySmall">
                    🏁 Fim: {item.data_fim} às {item.hora_fim}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
  },
  titulo: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  botaoData: {
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  agendaCard: {
    marginBottom: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 8,
  },
  chipText: {
    color: 'white',
    fontWeight: 'bold',
  },
  carroNome: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  horarioContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  emptyCard: {
    marginTop: 50,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#757575',
  },
});
