import { useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, Linking, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Dialog, Divider, Portal, RadioButton, Text, TextInput } from 'react-native-paper';
import {
  getEstatisticasFinanceiras,
  listarTodasLocacoes,
  registrarPagamento,
} from '../../src/database/queries';

export default function FinanceiroScreen() {
  const [estatisticas, setEstatisticas] = useState<any>({
    receitaTotal: 0,
    receitaPendente: 0,
    receitaMesAtual: 0,
  });
  const [locacoes, setLocacoes] = useState<any[]>([]);
  const [locacoesPendentes, setLocacoesPendentes] = useState<any[]>([]);
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
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarDados();
    setRefreshing(false);
  };

  const abrirDialogPagamento = (locacao: any) => {
    setLocacaoSelecionada(locacao);
    setValorRecebido(locacao.valor_total.toFixed(2));
    setDialogVisible(true);
  };

  const confirmarPagamento = async () => {
    if (!locacaoSelecionada) return;

    const valorNum = parseFloat(valorRecebido.replace(',', '.'));
    if (isNaN(valorNum) || valorNum <= 0) {
      Alert.alert('⚠️ Atenção', 'Digite um valor válido');
      return;
    }

    try {
      await registrarPagamento(locacaoSelecionada.id, formaPagamento, valorNum);
      Alert.alert('✅ Sucesso', `Pagamento de R$ ${valorNum.toFixed(2)} confirmado!`);
      setDialogVisible(false);
      setLocacaoSelecionada(null);
      setValorRecebido('');
      await carregarDados();
    } catch (error: any) {
      Alert.alert('❌ Erro', 'Erro ao confirmar pagamento: ' + error.message);
    }
  };

  const enviarCobrancaWhatsApp = (locacao: any) => {
    if (!locacao.numero_cliente) {
      Alert.alert('⚠️ Aviso', 'Este cliente não possui número cadastrado');
      return;
    }

    const mensagem = `Olá ${locacao.cliente}! 

Lembrete de pagamento da locação:
🚗 Veículo: ${locacao.carro} - ${locacao.placa}
📅 Período: ${new Date(locacao.data_inicio).toLocaleDateString('pt-BR')} a ${new Date(locacao.data_fim).toLocaleDateString('pt-BR')}
📊 Dias: ${locacao.quantidade_dias}
💰 Valor total: R$ ${locacao.valor_total.toFixed(2)}

Aguardamos seu pagamento via PIX ou dinheiro.

Obrigado!`;

    const numeroLimpo = locacao.numero_cliente.replace(/\D/g, '');
    const url = `https://wa.me/55${numeroLimpo}?text=${encodeURIComponent(mensagem)}`;
    
    Linking.openURL(url).catch(() => {
      Alert.alert('❌ Erro', 'Não foi possível abrir o WhatsApp');
    });
  };

  const getFormaPagamentoLabel = (forma: string) => {
    switch (forma) {
      case 'pix':
        return 'PIX';
      case 'dinheiro':
        return 'Dinheiro';
      default:
        return '-';
    }
  };

  return (
    <View style={styles.container}>
      {/* Cards de Estatísticas Financeiras */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Receita Total */}
        <Card style={styles.cardGrande}>
          <Card.Content>
            <Text variant="titleSmall" style={styles.labelCard}>
              💰 Total Recebido
            </Text>
            <Text variant="displaySmall" style={[styles.valorGrande, { color: '#4CAF50' }]}>
              R$ {estatisticas.receitaTotal.toFixed(2)}
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.rowCards}>
          {/* Receita do Mês */}
          <Card style={styles.cardPequeno}>
            <Card.Content>
              <Text variant="bodySmall" style={styles.labelCardPequeno}>
                📊 Este Mês
              </Text>
              <Text variant="titleLarge" style={[styles.valorMedio, { color: '#2196F3' }]}>
                R$ {estatisticas.receitaMesAtual.toFixed(2)}
              </Text>
            </Card.Content>
          </Card>

          {/* Pendente */}
          <Card style={styles.cardPequeno}>
            <Card.Content>
              <Text variant="bodySmall" style={styles.labelCardPequeno}>
                ⏳ A Receber
              </Text>
              <Text variant="titleLarge" style={[styles.valorMedio, { color: '#FF9800' }]}>
                R$ {estatisticas.receitaPendente.toFixed(2)}
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Seção de Pagamentos Pendentes */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={styles.sectionTitulo}>
                ⏳ Pagamentos Pendentes ({locacoesPendentes.length})
              </Text>
            </View>

            {locacoesPendentes.length === 0 ? (
              <Text style={styles.emptyText}>
                ✅ Nenhum pagamento pendente no momento
              </Text>
            ) : (
              locacoesPendentes.map((locacao: any) => (
                <Card key={locacao.id} style={styles.locacaoCard}>
                  <Card.Content>
                    <View style={styles.locacaoHeader}>
                      <View style={styles.locacaoInfo}>
                        <Text variant="titleMedium" style={styles.carroNome}>
                          🚗 {locacao.carro}
                        </Text>
                        <Text variant="bodySmall">👤 {locacao.cliente}</Text>
                        <Text variant="bodySmall" style={styles.dataTexto}>
                          📅 {new Date(locacao.data_inicio).toLocaleDateString('pt-BR')} a{' '}
                          {new Date(locacao.data_fim).toLocaleDateString('pt-BR')}
                        </Text>
                      </View>
                      <View style={styles.locacaoValores}>
                        <Text variant="bodySmall" style={styles.diasTexto}>
                          {locacao.quantidade_dias} dia(s)
                        </Text>
                        <Text variant="titleLarge" style={styles.valorDestaque}>
                          R$ {locacao.valor_total.toFixed(2)}
                        </Text>
                      </View>
                    </View>

                    <Divider style={styles.dividerInterno} />

                    <View style={styles.acoesContainer}>
                      <Button
                        mode="contained"
                        icon="check-circle"
                        onPress={() => abrirDialogPagamento(locacao)}
                        style={styles.botaoAcao}
                      >
                        Confirmar Pagamento
                      </Button>
                      {locacao.numero_cliente && (
                        <Button
                          mode="outlined"
                          icon="whatsapp"
                          onPress={() => enviarCobrancaWhatsApp(locacao)}
                          style={styles.botaoWhatsApp}
                        >
                          Cobrar
                        </Button>
                      )}
                    </View>
                  </Card.Content>
                </Card>
              ))
            )}
          </Card.Content>
        </Card>

        {/* Últimos Pagamentos Recebidos */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitulo}>
              ✅ Últimos Pagamentos Recebidos
            </Text>

            {locacoes
              .filter((l: any) => l.status_pagamento === 'pago')
              .slice(0, 5)
              .map((locacao: any) => (
                <Card key={locacao.id} style={styles.pagamentoCard}>
                  <Card.Content>
                    <View style={styles.pagamentoRow}>
                      <View style={styles.pagamentoInfo}>
                        <Text variant="bodyMedium" style={styles.pagamentoCliente}>
                          {locacao.cliente} - {locacao.carro}
                        </Text>
                        <Text variant="bodySmall" style={styles.pagamentoData}>
                          {new Date(locacao.data_pagamento).toLocaleDateString('pt-BR')} •{' '}
                          {getFormaPagamentoLabel(locacao.forma_pagamento)}
                        </Text>
                      </View>
                      <Text variant="titleMedium" style={styles.pagamentoValor}>
                        R$ {(locacao.valor_recebido || locacao.valor_total).toFixed(2)}
                      </Text>
                    </View>
                  </Card.Content>
                </Card>
              ))}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Dialog de Confirmação de Pagamento */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>💰 Confirmar Pagamento</Dialog.Title>
          <Dialog.Content>
            {locacaoSelecionada && (
              <>
                <Text variant="bodyMedium">
                  Cliente: {locacaoSelecionada.cliente}
                </Text>
                <Text variant="bodyMedium">
                  Veículo: {locacaoSelecionada.carro}
                </Text>
                <Text variant="bodySmall" style={styles.valorOriginal}>
                  Valor original: R$ {locacaoSelecionada.valor_total.toFixed(2)}
                </Text>

                <Divider style={styles.dividerDialog} />

                <TextInput
                  label="Valor Recebido (R$)"
                  value={valorRecebido}
                  onChangeText={setValorRecebido}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.inputValor}
                  left={<TextInput.Icon icon="currency-usd" />}
                />

                <Text variant="titleSmall" style={styles.formaPagamentoTitulo}>
                  Forma de Pagamento:
                </Text>

                <RadioButton.Group
                  onValueChange={value => setFormaPagamento(value)}
                  value={formaPagamento}
                >
                  <View style={styles.radioItem}>
                    <RadioButton value="pix" />
                    <Text>PIX</Text>
                  </View>
                  <View style={styles.radioItem}>
                    <RadioButton value="dinheiro" />
                    <Text>Dinheiro</Text>
                  </View>
                </RadioButton.Group>
              </>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancelar</Button>
            <Button mode="contained" onPress={confirmarPagamento}>
              Confirmar
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
    padding: 16,
  },
  cardGrande: {
    marginBottom: 12,
    elevation: 4,
    backgroundColor: '#fff',
  },
  labelCard: {
    color: '#757575',
    marginBottom: 8,
  },
  valorGrande: {
    fontWeight: 'bold',
  },
  rowCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  cardPequeno: {
    flex: 1,
    elevation: 4,
    backgroundColor: '#fff',
  },
  labelCardPequeno: {
    color: '#757575',
    marginBottom: 4,
  },
  valorMedio: {
    fontWeight: 'bold',
  },
  sectionCard: {
    marginBottom: 12,
    elevation: 4,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitulo: {
    fontWeight: 'bold',
  },
  locacaoCard: {
    marginBottom: 12,
    backgroundColor: '#FFF8E1',
    elevation: 2,
  },
  locacaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locacaoInfo: {
    flex: 1,
  },
  carroNome: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dataTexto: {
    color: '#757575',
    marginTop: 4,
  },
  locacaoValores: {
    alignItems: 'flex-end',
  },
  diasTexto: {
    color: '#757575',
    marginBottom: 4,
  },
  valorDestaque: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  dividerInterno: {
    marginVertical: 12,
  },
  acoesContainer: {
    gap: 8,
  },
  botaoAcao: {
    marginBottom: 4,
  },
  botaoWhatsApp: {
    borderColor: '#25D366',
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: '#757575',
  },
  pagamentoCard: {
    marginTop: 8,
    backgroundColor: '#E8F5E9',
    elevation: 1,
  },
  pagamentoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pagamentoInfo: {
    flex: 1,
  },
  pagamentoCliente: {
    fontWeight: '500',
  },
  pagamentoData: {
    color: '#757575',
    marginTop: 2,
  },
  pagamentoValor: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  valorOriginal: {
    color: '#757575',
    marginTop: 4,
  },
  inputValor: {
    marginTop: 12,
    marginBottom: 12,
  },
  dividerDialog: {
    marginVertical: 16,
  },
  formaPagamentoTitulo: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
});
