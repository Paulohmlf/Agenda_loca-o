import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Clipboard, Linking, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, IconButton, Text } from 'react-native-paper';
import { cancelarLocacao, getAgendaDoDia } from '../../src/database/queries';

export default function AgendaScreen() {
  const router = useRouter();
  const [date, setDate] = useState(new Date());
  const [agenda, setAgenda] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    carregarAgenda();
  }, [date]);

  const carregarAgenda = async () => {
    try {
      const dataFormatada = date.toISOString().split('T')[0];
      const dados = await getAgendaDoDia(dataFormatada);
      setAgenda(dados);
    } catch (error) {
      console.error('Erro ao carregar agenda:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarAgenda();
    setRefreshing(false);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const copiarNumero = (numero: string, cliente: string) => {
    if (numero && numero.trim()) {
      Clipboard.setString(numero);
      Alert.alert('📋 Copiado!', `Número de ${cliente} copiado: ${numero}`);
    } else {
      Alert.alert('⚠️ Aviso', 'Este cliente não possui número cadastrado');
    }
  };

  const ligarParaCliente = (numero: string, cliente: string) => {
    if (numero && numero.trim()) {
      const numeroLimpo = numero.replace(/\D/g, ''); // Remove caracteres não numéricos
      const url = `tel:${numeroLimpo}`;
      
      Linking.canOpenURL(url)
        .then((supported) => {
          if (supported) {
            Linking.openURL(url);
          } else {
            Alert.alert('❌ Erro', 'Não é possível realizar chamadas neste dispositivo');
          }
        })
        .catch((err) => {
          console.error('Erro ao tentar ligar:', err);
          Alert.alert('❌ Erro', 'Erro ao tentar realizar a chamada');
        });
    } else {
      Alert.alert('⚠️ Aviso', 'Este cliente não possui número cadastrado');
    }
  };

  const handleEditarLocacao = (locacaoId: number) => {
    router.push(`/editarLocacao?id=${locacaoId}`);
  };

  const handleCancelarLocacao = (locacaoId: number, carro: string, cliente: string) => {
    Alert.alert(
      '⚠️ Cancelar Locação',
      `Tem certeza que deseja cancelar a locação do ${carro} para ${cliente}?`,
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, Cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelarLocacao(locacaoId);
              Alert.alert('✅ Sucesso', 'Locação cancelada com sucesso!');
              await carregarAgenda();
            } catch (error: any) {
              Alert.alert('❌ Erro', 'Erro ao cancelar locação: ' + error.message);
            }
          },
        },
      ]
    );
  };

  const getCorPorTipo = (tipo: string) => {
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
            📅 Agenda de Hoje
          </Text>
          <Button 
            mode="outlined" 
            onPress={() => setShowDatePicker(true)}
            style={styles.botaoData}
            icon="calendar"
          >
            {date.toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: 'long', 
              year: 'numeric' 
            })}
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

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {agenda.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>
                ✅ Nenhuma locação agendada para este dia
              </Text>
            </Card.Content>
          </Card>
        ) : (
          agenda.map((item: any) => (
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
                
                {/* Campo de número com botões de copiar e ligar */}
                <View style={styles.numeroContainer}>
                  <Text variant="bodyMedium" style={styles.numeroTexto}>
                    📞 Número: {item.numero_cliente || 'Não informado'}
                  </Text>
                  {item.numero_cliente && (
                    <View style={styles.numeroActions}>
                      <IconButton
                        icon="phone"
                        size={20}
                        onPress={() => ligarParaCliente(item.numero_cliente, item.cliente)}
                        style={styles.botaoAcao}
                        iconColor="#4CAF50"
                      />
                      <IconButton
                        icon="content-copy"
                        size={20}
                        onPress={() => copiarNumero(item.numero_cliente, item.cliente)}
                        style={styles.botaoAcao}
                      />
                    </View>
                  )}
                </View>

                <View style={styles.horarioContainer}>
                  <Text variant="bodySmall">
                    ⏰ Início: {new Date(item.data_inicio).toLocaleDateString('pt-BR')} às {item.hora_inicio}
                  </Text>
                  <Text variant="bodySmall">
                    🏁 Fim: {new Date(item.data_fim).toLocaleDateString('pt-BR')} às {item.hora_fim}
                  </Text>
                </View>

                <View style={styles.actionsContainer}>
                  <Button
                    mode="outlined"
                    icon="pencil"
                    onPress={() => handleEditarLocacao(item.id)}
                    style={styles.actionButton}
                  >
                    Editar
                  </Button>
                  <Button
                    mode="outlined"
                    icon="delete"
                    onPress={() => handleCancelarLocacao(item.id, item.carro, item.cliente)}
                    style={styles.actionButton}
                    textColor="#d32f2f"
                  >
                    Cancelar
                  </Button>
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
    elevation: 4,
  },
  titulo: {
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
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
  numeroContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  numeroTexto: {
    flex: 1,
  },
  numeroActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botaoAcao: {
    margin: 0,
    marginLeft: 4,
  },
  horarioContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  emptyCard: {
    marginTop: 50,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#757575',
    padding: 20,
  },
});
