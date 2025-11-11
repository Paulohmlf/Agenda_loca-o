import { useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Vibration,
  View,
} from 'react-native';
import {
  Button,
  Card,
  Chip,
  Dialog,
  Divider,
  Portal,
  RadioButton,
  Surface,
  Text,
  TextInput,
} from 'react-native-paper';
import {
  getEstatisticasFinanceiras,
  listarTodasLocacoes,
  registrarPagamento,
} from '../../src/database/queries';

export default function FinanceiroScreen() {
  const [estatisticas, setEstatisticas] = useState({
    receitaTotal: 0,
    receitaPendente: 0,
    receitaMesAtual: 0,
  });
  const [locacoes, setLocacoes] = useState([]);
  const [locacoesPendentes, setLocacoesPendentes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Dialog de confirmação de pagamento
  const [dialogVisible, setDialogVisible] = useState(false);
  const [locacaoSelecionada, setLocacaoSelecionada] = useState<any>(null);
  const [formaPagamento, setFormaPagamento] = useState('pix');
  const [valorRecebido, setValorRecebido] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      carregarDados();
    }, [])
  );

  const carregarDados = async () => {
    try {
      const stats = await getEstatisticasFinanceiras();
      const todasLocacoes = await listarTodasLocacoes();

      // Filtrar apenas locações ativas e pendentes
      const pendentes = todasLocacoes.filter(
        (l: any) => l.status_pagamento === 'pendente' && l.status === 'ativa'
      );

      setEstatisticas(stats);
      setLocacoes(todasLocacoes);
      setLocacoesPendentes(pendentes);
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
      Alert.alert('❌ Erro', 'Não foi possível carregar os dados financeiros. Tente novamente.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarDados();
    setRefreshing(false);
    Vibration.vibrate(50);
  };

  const abrirDialogPagamento = (locacao: any) => {
    Vibration.vibrate(30);
    setLocacaoSelecionada(locacao);
    setValorRecebido(locacao.valor_total.toFixed(2));
    setDialogVisible(true);
  };

  const confirmarPagamento = async () => {
    if (!locacaoSelecionada) return;

    const valorNum = parseFloat(valorRecebido.replace(',', '.'));
    if (isNaN(valorNum) || valorNum <= 0) {
      Alert.alert('⚠️ Atenção', 'Por favor, digite um valor válido maior que zero.');
      return;
    }

    try {
      await registrarPagamento(locacaoSelecionada.id, formaPagamento, valorNum);
      Vibration.vibrate(200);
      Alert.alert(
        '✅ Pagamento Confirmado',
        `Pagamento de R$ ${valorNum.toFixed(2)} foi registrado com sucesso!\n\nCliente: ${
          locacaoSelecionada.cliente
        }\nForma: ${getFormaPagamentoLabel(formaPagamento)}`,
        [{ text: 'Ok, Entendi', style: 'default' }]
      );
      setDialogVisible(false);
      setLocacaoSelecionada(null);
      setValorRecebido('');
      await carregarDados();
    } catch (error: any) {
      Alert.alert('❌ Erro', `Não foi possível confirmar o pagamento:\n\n${error.message}`);
    }
  };

  const enviarCobrancaWhatsApp = (locacao: any) => {
    if (!locacao.numero_cliente) {
      Alert.alert(
        '⚠️ Número Não Cadastrado',
        `${locacao.cliente} não possui número de telefone cadastrado. Não é possível enviar cobrança pelo WhatsApp.`,
        [{ text: 'Entendi', style: 'default' }]
      );
      return;
    }

    Vibration.vibrate(50);
    Alert.alert(
      '💬 Enviar Cobrança WhatsApp',
      `Deseja enviar lembrete de pagamento para ${locacao.cliente}?\n\nValor: R$ ${locacao.valor_total.toFixed(
        2
      )}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim, Enviar Agora',
          style: 'default',
          onPress: () => {
            const mensagem = `Olá ${locacao.cliente}! 👋

Lembrete de pagamento da locação:

🚗 *Veículo:* ${locacao.carro} - ${locacao.placa}

📅 *Período:* ${new Date(locacao.data_inicio).toLocaleDateString('pt-BR')} até ${new Date(
              locacao.data_fim
            ).toLocaleDateString('pt-BR')}

📊 *Dias:* ${locacao.quantidade_dias}

💰 *Valor total:* R$ ${locacao.valor_total.toFixed(2)}

Aguardamos seu pagamento via *PIX* ou *Dinheiro*.

Obrigado! 🙏`;

            const numeroLimpo = locacao.numero_cliente.replace(/\D/g, '');
            const url = `https://wa.me/55${numeroLimpo}?text=${encodeURIComponent(mensagem)}`;

            Linking.openURL(url).catch(() => {
              Alert.alert('❌ Erro', 'Não foi possível abrir o WhatsApp. Verifique se está instalado.');
            });
          },
        },
      ]
    );
  };

  const getFormaPagamentoLabel = (forma: string) => {
    switch (forma) {
      case 'pix':
        return 'PIX';
      case 'dinheiro':
        return 'Dinheiro';
      default:
        return 'Não informado';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6200ee']}
            title="Puxe para atualizar"
          />
        }>
        {/* Cards de Estatísticas Financeiras */}
        <Surface style={styles.estatisticasContainer} elevation={4}>
          <Text style={styles.tituloSecao}>📊 Resumo Financeiro</Text>
          <Divider style={styles.dividerTitulo} />

          {/* Receita Total */}
          <Card style={styles.cardEstatistica}>
            <Card.Content>
              <Text style={styles.labelEstatistica}>💰 Total Recebido</Text>
              <Text style={styles.valorGrande}>R$ {estatisticas.receitaTotal.toFixed(2)}</Text>
              <Text style={styles.descricaoEstatistica}>Soma de todos os pagamentos recebidos</Text>
            </Card.Content>
          </Card>

          {/* Row com dois cards menores */}
          <View style={styles.rowCards}>
            {/* Receita do Mês */}
            <Card style={styles.cardPequeno}>
              <Card.Content>
                <Text style={styles.labelEstatistica}>📅 Este Mês</Text>
                <Text style={styles.valorMedio}>R$ {estatisticas.receitaMesAtual.toFixed(2)}</Text>
              </Card.Content>
            </Card>

            {/* Pendente */}
            <Card style={styles.cardPendente}>
              <Card.Content>
                <Text style={styles.labelEstatistica}>⏳ A Receber</Text>
                <Text style={styles.valorPendente}>R$ {estatisticas.receitaPendente.toFixed(2)}</Text>
              </Card.Content>
            </Card>
          </View>
        </Surface>

        {/* Seção de Pagamentos Pendentes */}
        <Surface style={styles.sectionCard} elevation={3}>
          <View style={styles.sectionHeader}>
            <Text style={styles.tituloSecao}>
              ⏳ Pagamentos Pendentes
            </Text>
            <Chip mode="flat" style={styles.chipContador} textStyle={styles.chipContadorText}>
              {locacoesPendentes.length}
            </Chip>
          </View>
          <Divider style={styles.dividerSecao} />

          {locacoesPendentes.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text style={styles.emptyText}>✅ Nenhum pagamento pendente!</Text>
                <Text style={styles.emptySubtext}>Todos os clientes estão em dia.</Text>
              </Card.Content>
            </Card>
          ) : (
            locacoesPendentes.map((locacao: any) => (
              <Card key={locacao.id} style={styles.locacaoCard}>
                <Card.Content>
                  {/* Header da locação */}
                  <View style={styles.locacaoHeader}>
                    <View style={styles.locacaoInfo}>
                      <Text style={styles.carroNome}>🚗 {locacao.carro}</Text>
                      <Text style={styles.placaTexto}>Placa: {locacao.placa}</Text>
                    </View>
                    <View style={styles.locacaoValores}>
                      <Text style={styles.diasTexto}>{locacao.quantidade_dias} dia(s)</Text>
                      <Text style={styles.valorDestaque}>
                        R$ {locacao.valor_total.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  <Divider style={styles.dividerInterno} />

                  <Text style={styles.clienteLabel}>👤 Cliente:</Text>
                  <Text style={styles.clienteNome}>{locacao.cliente}</Text>

                  <Text style={styles.periodoLabel}>📅 Período da Locação:</Text>
                  <Text style={styles.periodoTexto}>
                    {new Date(locacao.data_inicio).toLocaleDateString('pt-BR')} até{' '}
                    {new Date(locacao.data_fim).toLocaleDateString('pt-BR')}
                  </Text>

                  <Divider style={styles.dividerAcoes} />

                  {/* Botões de ação */}
                  <View style={styles.acoesContainer}>
                    <Button
                      mode="contained"
                      icon="check-circle"
                      onPress={() => abrirDialogPagamento(locacao)}
                      style={styles.botaoPagamento}
                      labelStyle={styles.botaoTextoGrande}
                      contentStyle={styles.botaoConteudoGrande}>
                      Confirmar Pagamento
                    </Button>

                    {locacao.numero_cliente && (
                      <Button
                        mode="outlined"
                        icon="whatsapp"
                        onPress={() => enviarCobrancaWhatsApp(locacao)}
                        style={styles.botaoWhatsApp}
                        labelStyle={styles.botaoWhatsAppTexto}
                        contentStyle={styles.botaoConteudoGrande}>
                        Enviar Cobrança WhatsApp
                      </Button>
                    )}
                  </View>
                </Card.Content>
              </Card>
            ))
          )}
        </Surface>

        {/* Últimos Pagamentos Recebidos */}
        <Surface style={styles.sectionCard} elevation={3}>
          <Text style={styles.tituloSecao}>✅ Últimos Pagamentos Recebidos</Text>
          <Divider style={styles.dividerSecao} />

          {locacoes
            .filter((l: any) => l.status_pagamento === 'pago')
            .slice(0, 5)
            .map((locacao: any, index: number) => (
              <Card key={`pago-${locacao.id}-${index}`} style={styles.pagamentoCard}>
                <Card.Content>
                  <View style={styles.pagamentoRow}>
                    <View style={styles.pagamentoInfo}>
                      <Text style={styles.pagamentoCliente}>
                        👤 {locacao.cliente}
                      </Text>
                      <Text style={styles.pagamentoCarro}>🚗 {locacao.carro}</Text>
                      <Text style={styles.pagamentoData}>
                        📅 {new Date(locacao.data_pagamento).toLocaleDateString('pt-BR')}
                      </Text>
                      <Chip
                        mode="flat"
                        style={styles.chipPagamento}
                        textStyle={styles.chipPagamentoTexto}
                        icon="cash">
                        {getFormaPagamentoLabel(locacao.forma_pagamento)}
                      </Chip>
                    </View>
                    <View style={styles.pagamentoValorContainer}>
                      <Text style={styles.pagamentoValor}>
                        R$ {(locacao.valor_recebido || locacao.valor_total).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))}

          {locacoes.filter((l: any) => l.status_pagamento === 'pago').length === 0 && (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text style={styles.emptyText}>Nenhum pagamento registrado ainda</Text>
              </Card.Content>
            </Card>
          )}
        </Surface>
      </ScrollView>

      {/* Dialog de Confirmação de Pagamento */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)} style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitulo}>💰 Confirmar Pagamento</Dialog.Title>
          <Divider />
          <Dialog.Content>
            {locacaoSelecionada && (
              <>
                <Surface style={styles.dialogInfoCard} elevation={1}>
                  <Text style={styles.dialogLabel}>👤 Cliente:</Text>
                  <Text style={styles.dialogInfo}>{locacaoSelecionada.cliente}</Text>

                  <Text style={styles.dialogLabel}>🚗 Veículo:</Text>
                  <Text style={styles.dialogInfo}>{locacaoSelecionada.carro}</Text>

                  <Text style={styles.dialogLabel}>💵 Valor da Locação:</Text>
                  <Text style={styles.dialogValorOriginal}>
                    R$ {locacaoSelecionada.valor_total.toFixed(2)}
                  </Text>
                </Surface>

                <Divider style={styles.dividerDialog} />

                <TextInput
                  label="Valor Recebido (R$)"
                  value={valorRecebido}
                  onChangeText={setValorRecebido}
                  keyboardType="decimal-pad"
                  mode="outlined"
                  style={styles.inputValor}
                  placeholder="Ex: 150.00"
                  left={<TextInput.Icon icon="currency-brl" />}
                />

                <Text style={styles.formaPagamentoTitulo}>💳 Forma de Pagamento:</Text>
                <RadioButton.Group onValueChange={setFormaPagamento} value={formaPagamento}>
                  <View style={styles.radioContainer}>
                    <RadioButton.Item
                      label="PIX"
                      value="pix"
                      mode="android"
                      style={styles.radioItem}
                      labelStyle={styles.radioLabel}
                    />
                    <RadioButton.Item
                      label="Dinheiro"
                      value="dinheiro"
                      mode="android"
                      style={styles.radioItem}
                      labelStyle={styles.radioLabel}
                    />
                  </View>
                </RadioButton.Group>
              </>
            )}
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button
              onPress={() => {
                Vibration.vibrate(30);
                setDialogVisible(false);
              }}
              labelStyle={styles.botaoCancelarTexto}
              contentStyle={styles.botaoDialogConteudo}>
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={confirmarPagamento}
              labelStyle={styles.botaoConfirmarTexto}
              contentStyle={styles.botaoDialogConteudo}>
              Confirmar Pagamento
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  estatisticasContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  tituloSecao: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  dividerTitulo: {
    marginBottom: 16,
    height: 2,
  },
  cardEstatistica: {
    marginBottom: 16,
    backgroundColor: '#e3f2fd',
    elevation: 2,
  },
  labelEstatistica: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  valorGrande: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  descricaoEstatistica: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  rowCards: {
    flexDirection: 'row',
    gap: 16,
  },
  cardPequeno: {
    flex: 1,
    backgroundColor: '#e8f5e9',
    elevation: 2,
  },
  cardPendente: {
    flex: 1,
    backgroundColor: '#fff3e0',
    elevation: 2,
  },
  valorMedio: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#388e3c',
    marginTop: 4,
  },
  valorPendente: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f57c00',
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chipContador: {
    backgroundColor: '#6200ee',
    height: 32,
  },
  chipContadorText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerSecao: {
    marginBottom: 16,
    height: 2,
  },
  emptyCard: {
    backgroundColor: '#f5f5f5',
    elevation: 0,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 20,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtext: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  locacaoCard: {
    marginBottom: 16,
    backgroundColor: '#fff8e1',
    elevation: 3,
  },
  locacaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  locacaoInfo: {
    flex: 1,
    marginRight: 12,
  },
  carroNome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  placaTexto: {
    fontSize: 16,
    color: '#666',
  },
  locacaoValores: {
    alignItems: 'flex-end',
  },
  diasTexto: {
    fontSize: 15,
    color: '#666',
    marginBottom: 4,
  },
  valorDestaque: {
    fontSize: 26,
    color: '#ff6f00',
    fontWeight: 'bold',
  },
  dividerInterno: {
    marginVertical: 12,
  },
  clienteLabel: {
    fontSize: 15,
    color: '#666',
    marginBottom: 4,
  },
  clienteNome: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  periodoLabel: {
    fontSize: 15,
    color: '#666',
    marginBottom: 4,
  },
  periodoTexto: {
    fontSize: 18,
    color: '#444',
    fontWeight: '500',
  },
  dividerAcoes: {
    marginVertical: 16,
  },
  acoesContainer: {
    gap: 12,
  },
  botaoPagamento: {
    backgroundColor: '#4CAF50',
  },
  botaoTextoGrande: {
    fontSize: 17,
    fontWeight: '600',
  },
  botaoConteudoGrande: {
    paddingVertical: 8,
  },
  botaoWhatsApp: {
    borderColor: '#25D366',
    borderWidth: 2,
  },
  botaoWhatsAppTexto: {
    fontSize: 17,
    fontWeight: '600',
    color: '#25D366',
  },
  pagamentoCard: {
    marginBottom: 12,
    backgroundColor: '#e8f5e9',
    elevation: 2,
  },
  pagamentoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pagamentoInfo: {
    flex: 1,
    marginRight: 12,
  },
  pagamentoCliente: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  pagamentoCarro: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  pagamentoData: {
    fontSize: 15,
    color: '#999',
    marginBottom: 8,
  },
  chipPagamento: {
    backgroundColor: '#1976d2',
    alignSelf: 'flex-start',
    height: 28,
  },
  chipPagamentoTexto: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
  pagamentoValorContainer: {
    alignItems: 'flex-end',
  },
  pagamentoValor: {
    fontSize: 24,
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  dialog: {
    maxHeight: '90%',
  },
  dialogTitulo: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  dialogInfoCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  dialogLabel: {
    fontSize: 15,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  dialogInfo: {
    fontSize: 19,
    fontWeight: '600',
    color: '#333',
  },
  dialogValorOriginal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  dividerDialog: {
    marginVertical: 16,
  },
  inputValor: {
    marginBottom: 20,
    fontSize: 18,
  },
  formaPagamentoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  radioContainer: {
    gap: 8,
  },
  radioItem: {
    paddingVertical: 4,
  },
  radioLabel: {
    fontSize: 18,
  },
  dialogActions: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  botaoCancelarTexto: {
    fontSize: 16,
  },
  botaoConfirmarTexto: {
    fontSize: 16,
    fontWeight: '600',
  },
  botaoDialogConteudo: {
    paddingHorizontal: 8,
  },
});
