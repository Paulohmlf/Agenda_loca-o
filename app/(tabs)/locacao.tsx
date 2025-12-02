import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Vibration,
  View,
} from 'react-native';
import {
  Button,
  Card,
  Chip,
  Divider,
  HelperText,
  Surface,
  Text,
  TextInput,
} from 'react-native-paper';
import { useCarrosContext } from '../../src/context/CarrosContext';
import { inserirLocacao, listarCarros } from '../../src/database/queries';
import { scheduleNotification } from '../../src/utils/notifications'; // <--- Importação Adicionada

export default function NovaLocacaoScreen() {
  const { refreshCarros, setRefreshCarros } = useCarrosContext();
  const [carros, setCarros] = useState([]);
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

  // Validações
  const [clienteError, setClienteError] = useState(false);
  const [carroError, setCarroError] = useState(false);

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
    Vibration.vibrate(50);
    setCarroSelecionado(carro);
    setCarroError(false);
    setModalVisible(false);
  };

  const validarFormulario = () => {
    let valido = true;

    if (!cliente.trim()) {
      setClienteError(true);
      valido = false;
    } else {
      setClienteError(false);
    }

    if (!carroSelecionado) {
      setCarroError(true);
      valido = false;
    } else {
      setCarroError(false);
    }

    return valido;
  };

  const calcularDias = () => {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const diffTime = Math.abs(fim.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const calcularValorTotal = () => {
    if (!carroSelecionado) return 0;
    const dias = calcularDias();
    return carroSelecionado.valor_diaria * dias;
  };

  const handleCadastrarLocacao = async () => {
    if (!validarFormulario()) {
      Vibration.vibrate([0, 100, 50, 100]);
      Alert.alert(
        '⚠️ Campos Obrigatórios',
        'Por favor, preencha todos os campos obrigatórios:\n\n• Selecione um veículo\n• Digite o nome do cliente',
        [{ text: 'Entendi', style: 'default' }]
      );
      return;
    }

    // Verificar se data fim é maior que data início
    if (dataFim < dataInicio) {
      Alert.alert(
        '⚠️ Datas Inválidas',
        'A data de devolução não pode ser anterior à data de retirada.\n\nPor favor, corrija as datas.',
        [{ text: 'Entendi', style: 'default' }]
      );
      return;
    }

    const dias = calcularDias();
    const valorTotal = calcularValorTotal();

    // Confirmar com o usuário
    Alert.alert(
      '📋 Confirmar Locação',
      `Você está cadastrando:\n\n🚗 Veículo: ${carroSelecionado.modelo}\n📋 Placa: ${carroSelecionado.placa}\n👤 Cliente: ${cliente}\n📅 Período: ${dias} dia(s)\n💰 Valor Total: R$ ${valorTotal.toFixed(
        2
      )}\n\nDeseja confirmar?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim, Cadastrar',
          style: 'default',
          onPress: async () => {
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

              // --- LÓGICA DE NOTIFICAÇÃO ADICIONADA ---
              const dataLembrete = new Date(dataFim);
              dataLembrete.setHours(9, 0, 0, 0); // Define notificação para 09:00 do dia da devolução

              if (dataLembrete > new Date()) {
                await scheduleNotification(
                  '📅 Devolução Hoje',
                  `O cliente ${cliente} deve devolver o veículo ${carroSelecionado.modelo}.`,
                  dataLembrete
                );
              }
              // ----------------------------------------

              Vibration.vibrate(200);
              Alert.alert(
                '✅ Sucesso!',
                `A locação foi cadastrada com sucesso!\n\n🚗 ${carroSelecionado.modelo}\n👤 ${cliente}\n💰 R$ ${valorTotal.toFixed(
                  2
                )}`,
                [
                  {
                    text: 'Ok, Entendi',
                    style: 'default',
                    onPress: () => {
                      // Limpar formulário
                      setCliente('');
                      setNumeroCliente('');
                      setCarroSelecionado(null);
                      setDataInicio(new Date());
                      setHoraInicio(new Date());
                      setDataFim(new Date());
                      setHoraFim(new Date());
                    },
                  },
                ]
              );
              await carregarCarros();
            } catch (error: any) {
              Alert.alert(
                '❌ Erro ao Cadastrar',
                `Não foi possível cadastrar a locação:\n\n${error.message}\n\nTente novamente.`,
                [{ text: 'Entendi', style: 'default' }]
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const dias = calcularDias();
  const valorTotal = calcularValorTotal();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Cabeçalho */}
      <Surface style={styles.headerCard} elevation={4}>
        <Text style={styles.titulo}>📝 Nova Locação</Text>
        <Text style={styles.subtitulo}>
          Preencha as informações abaixo para cadastrar uma nova locação
        </Text>
      </Surface>

      {/* Card do Formulário */}
      <Card style={styles.formCard}>
        <Card.Content>
          {/* Seção: Selecionar Veículo */}
          <Text style={styles.secaoTitulo}>🚗 Veículo</Text>
          <Divider style={styles.dividerSecao} />

          <Button
            mode={carroSelecionado ? 'contained-tonal' : 'outlined'}
            icon="car"
            onPress={() => {
              Vibration.vibrate(30);
              setModalVisible(true);
            }}
            style={[styles.selectButton, carroError && styles.errorBorder]}
            labelStyle={styles.selectButtonLabel}
            contentStyle={styles.selectButtonContent}>
            {carroSelecionado
              ? `${carroSelecionado.modelo} - ${carroSelecionado.placa}`
              : 'Tocar Aqui Para Selecionar Veículo'}
          </Button>

          {carroError && (
            <HelperText type="error" visible={carroError} style={styles.helperText}>
              ⚠️ Você precisa selecionar um veículo
            </HelperText>
          )}

          {carroSelecionado && (
            <Surface style={styles.carroDetalhes} elevation={1}>
              <Text style={styles.carroDetalheLabel}>💰 Valor da Diária:</Text>
              <Text style={styles.carroDetalheValor}>
                R$ {carroSelecionado.valor_diaria.toFixed(2)}
              </Text>
            </Surface>
          )}

          {/* Seção: Dados do Cliente */}
          <Text style={styles.secaoTitulo}>👤 Cliente</Text>
          <Divider style={styles.dividerSecao} />

          <TextInput
            label="Nome do Cliente (Obrigatório)"
            value={cliente}
            onChangeText={(text) => {
              setCliente(text);
              if (text.trim()) setClienteError(false);
            }}
            mode="outlined"
            error={clienteError}
            style={styles.input}
            placeholder="Ex: João Silva"
            left={<TextInput.Icon icon="account" />}
          />
          {clienteError && (
            <HelperText type="error" visible={clienteError} style={styles.helperText}>
              ⚠️ Digite o nome do cliente
            </HelperText>
          )}

          <TextInput
            label="Telefone do Cliente (Opcional)"
            value={numeroCliente}
            onChangeText={setNumeroCliente}
            mode="outlined"
            style={styles.input}
            placeholder="Ex: (81) 99999-9999"
            keyboardType="phone-pad"
            left={<TextInput.Icon icon="phone" />}
          />

          {/* Seção: Data e Hora de Retirada */}
          <Text style={styles.secaoTitulo}>📅 Retirada do Veículo</Text>
          <Divider style={styles.dividerSecao} />

          <View style={styles.dateTimeRow}>
            <View style={styles.dateTimeItem}>
              <Text style={styles.dateTimeLabel}>Data:</Text>
              <Button
                mode="elevated"
                icon="calendar"
                onPress={() => {
                  Vibration.vibrate(30);
                  setShowDateInicio(true);
                }}
                style={styles.dateTimeButton}
                labelStyle={styles.dateTimeButtonLabel}
                contentStyle={styles.dateTimeButtonContent}>
                {dataInicio.toLocaleDateString('pt-BR')}
              </Button>
            </View>

            <View style={styles.dateTimeItem}>
              <Text style={styles.dateTimeLabel}>Hora:</Text>
              <Button
                mode="elevated"
                icon="clock"
                onPress={() => {
                  Vibration.vibrate(30);
                  setShowTimeInicio(true);
                }}
                style={styles.dateTimeButton}
                labelStyle={styles.dateTimeButtonLabel}
                contentStyle={styles.dateTimeButtonContent}>
                {horaInicio.toTimeString().substring(0, 5)}
              </Button>
            </View>
          </View>

          {/* Seção: Data e Hora de Devolução */}
          <Text style={styles.secaoTitulo}>🏁 Devolução do Veículo</Text>
          <Divider style={styles.dividerSecao} />

          <View style={styles.dateTimeRow}>
            <View style={styles.dateTimeItem}>
              <Text style={styles.dateTimeLabel}>Data:</Text>
              <Button
                mode="elevated"
                icon="calendar"
                onPress={() => {
                  Vibration.vibrate(30);
                  setShowDateFim(true);
                }}
                style={styles.dateTimeButton}
                labelStyle={styles.dateTimeButtonLabel}
                contentStyle={styles.dateTimeButtonContent}>
                {dataFim.toLocaleDateString('pt-BR')}
              </Button>
            </View>

            <View style={styles.dateTimeItem}>
              <Text style={styles.dateTimeLabel}>Hora:</Text>
              <Button
                mode="elevated"
                icon="clock"
                onPress={() => {
                  Vibration.vibrate(30);
                  setShowTimeFim(true);
                }}
                style={styles.dateTimeButton}
                labelStyle={styles.dateTimeButtonLabel}
                contentStyle={styles.dateTimeButtonContent}>
                {horaFim.toTimeString().substring(0, 5)}
              </Button>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Card de Resumo */}
      {carroSelecionado && cliente.trim() && (
        <Surface style={styles.resumoCard} elevation={4}>
          <Text style={styles.resumoTitulo}>📊 Resumo da Locação</Text>
          <Divider style={styles.dividerResumo} />

          <View style={styles.resumoRow}>
            <Text style={styles.resumoLabel}>⏱️ Total de Dias:</Text>
            <Chip mode="flat" style={styles.chipResumo} textStyle={styles.chipResumoText}>
              {dias} dia{dias > 1 ? 's' : ''}
            </Chip>
          </View>

          <View style={styles.resumoRow}>
            <Text style={styles.resumoLabel}>💵 Valor por Dia:</Text>
            <Text style={styles.resumoValor}>R$ {carroSelecionado.valor_diaria.toFixed(2)}</Text>
          </View>

          <Divider style={styles.dividerValorTotal} />

          <View style={styles.valorTotalContainer}>
            <Text style={styles.valorTotalLabel}>💰 Valor Total:</Text>
            <Text style={styles.valorTotal}>R$ {valorTotal.toFixed(2)}</Text>
          </View>
        </Surface>
      )}

      {/* Botão de Cadastrar */}
      <Button
        mode="contained"
        icon="check-circle"
        loading={loading}
        disabled={loading}
        onPress={handleCadastrarLocacao}
        style={styles.botaoCadastrar}
        labelStyle={styles.botaoCadastrarLabel}
        contentStyle={styles.botaoCadastrarContent}>
        {loading ? 'Cadastrando...' : 'Cadastrar Locação'}
      </Button>

      {/* Modal de Seleção de Carros */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <Surface style={styles.modalContent} elevation={5}>
            <Text style={styles.modalTitulo}>🚗 Selecione um Veículo</Text>
            <Divider style={styles.modalDivider} />

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {carros.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Nenhum veículo cadastrado</Text>
                  <Text style={styles.emptySubtext}>
                    Cadastre um veículo primeiro na aba "Novo"
                  </Text>
                </View>
              ) : (
                carros.map((carro: any) => (
                  <Card
                    key={carro.id}
                    style={styles.carroCard}
                    onPress={() => handleSelecionarCarro(carro)}>
                    <Card.Content>
                      <View style={styles.carroCardContent}>
                        <View style={styles.carroCardInfo}>
                          <Text style={styles.carroCardModelo}>🚗 {carro.modelo}</Text>
                          <Text style={styles.carroCardPlaca}>Placa: {carro.placa}</Text>
                          <Text style={styles.carroCardDiaria}>
                            💰 R$ {carro.valor_diaria.toFixed(2)}/dia
                          </Text>
                        </View>
                        <Text style={styles.carroCardArrow}>›</Text>
                      </View>
                    </Card.Content>
                  </Card>
                ))
              )}
            </ScrollView>

            <Button
              mode="outlined"
              onPress={() => {
                Vibration.vibrate(30);
                setModalVisible(false);
              }}
              style={styles.modalBotaoFechar}
              labelStyle={styles.modalBotaoFecharLabel}
              contentStyle={styles.modalBotaoFecharContent}>
              Fechar
            </Button>
          </Surface>
        </View>
      </Modal>

      {/* Date/Time Pickers */}
      {showDateInicio && (
        <DateTimePicker
          value={dataInicio}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
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
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
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
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
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
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
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
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  subtitulo: {
    fontSize: 17,
    textAlign: 'center',
    color: '#666',
    lineHeight: 24,
  },
  formCard: {
    marginBottom: 20,
    elevation: 4,
  },
  secaoTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  dividerSecao: {
    marginBottom: 16,
    height: 2,
  },
  selectButton: {
    marginBottom: 8,
  },
  selectButtonLabel: {
    fontSize: 17,
    fontWeight: '600',
  },
  selectButtonContent: {
    paddingVertical: 12,
  },
  errorBorder: {
    borderColor: '#d32f2f',
    borderWidth: 2,
  },
  helperText: {
    fontSize: 15,
    marginBottom: 8,
  },
  carroDetalhes: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  carroDetalheLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  carroDetalheValor: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  input: {
    marginBottom: 16,
    fontSize: 17,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
    flexWrap: 'wrap', // CORREÇÃO DE LAYOUT PARA FONTES GRANDES
  },
  dateTimeItem: {
    flex: 1,
    minWidth: 140, // CORREÇÃO DE LAYOUT PARA FONTES GRANDES
  },
  dateTimeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  dateTimeButton: {
    backgroundColor: '#fff',
  },
  dateTimeButtonLabel: {
    fontSize: 17,
    fontWeight: '600',
  },
  dateTimeButtonContent: {
    paddingVertical: 8,
  },
  resumoCard: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  resumoTitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 8,
  },
  dividerResumo: {
    marginBottom: 16,
    height: 2,
    backgroundColor: '#81c784',
  },
  resumoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resumoLabel: {
    fontSize: 18,
    color: '#1b5e20',
    fontWeight: '500',
  },
  chipResumo: {
    backgroundColor: '#4caf50',
    height: 32,
  },
  chipResumoText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
  },
  resumoValor: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2e7d32',
  },
  dividerValorTotal: {
    marginVertical: 16,
    height: 2,
    backgroundColor: '#4caf50',
  },
  valorTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valorTotalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1b5e20',
  },
  valorTotal: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  botaoCadastrar: {
    backgroundColor: '#4CAF50',
    marginBottom: 16,
  },
  botaoCadastrarLabel: {
    fontSize: 19,
    fontWeight: 'bold',
  },
  botaoCadastrarContent: {
    paddingVertical: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '92%',
    maxHeight: '85%',
  },
  modalTitulo: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  modalDivider: {
    marginBottom: 16,
    height: 2,
  },
  modalScroll: {
    maxHeight: 400,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 20,
    color: '#757575',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
    fontSize: 17,
    color: '#999',
    lineHeight: 24,
  },
  carroCard: {
    marginBottom: 12,
    backgroundColor: '#fafafa',
    elevation: 2,
  },
  carroCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  carroCardInfo: {
    flex: 1,
  },
  carroCardModelo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  carroCardPlaca: {
    fontSize: 17,
    color: '#666',
    marginBottom: 6,
  },
  carroCardDiaria: {
    fontSize: 19,
    fontWeight: '600',
    color: '#1976d2',
  },
  carroCardArrow: {
    fontSize: 40,
    color: '#6200ee',
    fontWeight: '300',
  },
  modalBotaoFechar: {
    marginTop: 16,
  },
  modalBotaoFecharLabel: {
    fontSize: 17,
    fontWeight: '600',
  },
  modalBotaoFecharContent: {
    paddingVertical: 8,
  },
});