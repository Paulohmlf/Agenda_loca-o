import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Clipboard,
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
  Divider,
  FAB,
  Surface,
  Text,
} from 'react-native-paper';
import {
  atualizarLocacoesVencidasAutomaticamente,
  cancelarLocacao,
  getLocacoesDoMes,
} from '../../src/database/queries';

// Interface para tipar as locações
interface Locacao {
  id: number;
  cliente: string;
  numero_cliente: string;
  data_inicio: string;
  hora_inicio: string;
  data_fim: string;
  hora_fim: string;
  status: 'ativa' | 'finalizada' | 'cancelada';
  valor_total: number;
  valor_recebido?: number;
  quantidade_dias: number;
  status_pagamento: 'pago' | 'pendente';
  forma_pagamento?: string;
  carro: string;
  placa: string;
}

export default function AgendaScreen() {
  const router = useRouter();
  const [mesAtual, setMesAtual] = useState(new Date().getMonth() + 1);
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  const [locacoes, setLocacoes] = useState<Locacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exibirApenasComLocacao, setExibirApenasComLocacao] = useState(true);

  const mesesNomes = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  // Carregamento de dados com feedback háptico
  const carregarDados = useCallback(async () => {
    try {
      await atualizarLocacoesVencidasAutomaticamente();
      const dados = await getLocacoesDoMes(anoAtual, mesAtual);
      setLocacoes(dados as Locacao[]);
    } catch (error) {
      console.error('Erro ao carregar locações:', error);
      Alert.alert('❌ Erro', 'Não foi possível carregar as locações. Tente novamente.');
    }
  }, [anoAtual, mesAtual]);

  // Hook de foco
  useFocusEffect(
    useCallback(() => {
      const carregarDadosDaTela = async () => {
        setLoading(true);
        await carregarDados();
        setLoading(false);
      };
      carregarDadosDaTela();
      return () => {
        setLocacoes([]);
      };
    }, [carregarDados])
  );

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await carregarDados();
    setRefreshing(false);
    Vibration.vibrate(50);
  }, [carregarDados]);

  // Navegação de mês com feedback
  const avancarMes = () => {
    Vibration.vibrate(30);
    if (mesAtual === 12) {
      setMesAtual(1);
      setAnoAtual(anoAtual + 1);
    } else {
      setMesAtual(mesAtual + 1);
    }
  };

  const voltarMes = () => {
    Vibration.vibrate(30);
    if (mesAtual === 1) {
      setMesAtual(12);
      setAnoAtual(anoAtual - 1);
    } else {
      setMesAtual(mesAtual - 1);
    }
  };

  const irParaMesAtual = () => {
    Vibration.vibrate(50);
    setMesAtual(new Date().getMonth() + 1);
    setAnoAtual(new Date().getFullYear());
  };

  // Funções com mensagens mais claras
  const copiarNumero = (numero: string, cliente: string) => {
    if (numero && numero.trim()) {
      Clipboard.setString(numero); // ← MUDANÇA: API nativa
      Vibration.vibrate(100);
      Alert.alert(
        '✅ Número Copiado',
        `O número de ${cliente} foi copiado:\n\n${numero}\n\nCole no WhatsApp ou onde preferir.`,
        [{ text: 'Ok, Entendi', style: 'default' }]
      );
    } else {
      Alert.alert(
        '⚠️ Número Não Disponível',
        `${cliente} não tem número de telefone cadastrado.`,
        [{ text: 'Entendi', style: 'default' }]
      );
    }
  };

  const ligarParaCliente = (numero: string, cliente: string) => {
    if (numero && numero.trim()) {
      Alert.alert(
        '📞 Ligar para Cliente',
        `Deseja ligar para ${cliente}?\n\nNúmero: ${numero}`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Sim, Ligar Agora',
            style: 'default',
            onPress: async () => {
              const numeroLimpo = numero.replace(/\D/g, '');
              const url = `tel:${numeroLimpo}`;
              try {
                const canOpen = await Linking.canOpenURL(url);
                if (canOpen) {
                  Vibration.vibrate(50);
                  await Linking.openURL(url);
                } else {
                  Alert.alert('❌ Erro', 'Não é possível fazer chamadas neste aparelho.');
                }
              } catch {
                Alert.alert('❌ Erro', 'Ocorreu um problema ao tentar ligar.');
              }
            },
          },
        ]
      );
    } else {
      Alert.alert(
        '⚠️ Número Não Disponível',
        `${cliente} não tem número de telefone cadastrado.`
      );
    }
  };

  const handleEditarLocacao = (locacaoId: number) => {
    Vibration.vibrate(30);
    router.push(`/editarLocacao?id=${locacaoId}`);
  };

  const handleCancelarLocacao = (locacaoId: number, carro: string, cliente: string) => {
    Vibration.vibrate([0, 50, 100, 50]);
    Alert.alert(
      '⚠️ Cancelar Locação?',
      `Você está prestes a cancelar:\n\n🚗 Veículo: ${carro}\n👤 Cliente: ${cliente}\n\nEsta ação não pode ser desfeita. Deseja continuar?`,
      [
        { text: 'Não, Voltar', style: 'cancel' },
        {
          text: 'Sim, Cancelar Locação',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelarLocacao(locacaoId);
              Vibration.vibrate(200);
              Alert.alert(
                '✅ Locação Cancelada',
                'A locação foi cancelada com sucesso!',
                [{ text: 'Ok', style: 'default' }]
              );
              await carregarDados();
            } catch (error: any) {
              Alert.alert('❌ Erro', `Não foi possível cancelar:\n\n${error.message}`);
            }
          },
        },
      ]
    );
  };

  // Função de renderização otimizada
  const renderizarDiasDoMes = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>Carregando agenda...</Text>
        </View>
      );
    }

    const ultimoDia = new Date(anoAtual, mesAtual, 0).getDate();
    const diasDoMes = Array.from({ length: ultimoDia }, (_, i) => i + 1);
    const mesStr = String(mesAtual).padStart(2, '0');
    const hoje = new Date().toISOString().split('T')[0];

    // Filtrar dias
    const diasParaExibir = exibirApenasComLocacao
      ? diasDoMes.filter(dia => {
          const diaStr = String(dia).padStart(2, '0');
          const diaAtualFormatado = `${anoAtual}-${mesStr}-${diaStr}`;
          const locacoesDoDia = locacoes.filter(
            loc =>
              diaAtualFormatado >= loc.data_inicio &&
              diaAtualFormatado <= loc.data_fim &&
              loc.status !== 'cancelada'
          );
          return locacoesDoDia.length > 0;
        })
      : diasDoMes;

    if (diasParaExibir.length === 0) {
      return (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text style={styles.emptyTitle}>📅 Nenhuma Locação</Text>
            <Text style={styles.emptySubtitle}>
              Não há locações agendadas para {mesesNomes[mesAtual - 1]} de {anoAtual}.
            </Text>
            <Button
              mode="contained"
              icon="plus"
              onPress={() => router.push('/locacao')}
              style={styles.emptyButton}>
              Cadastrar Nova Locação
            </Button>
          </Card.Content>
        </Card>
      );
    }

    return diasParaExibir.map(dia => {
      const diaStr = String(dia).padStart(2, '0');
      const diaAtualFormatado = `${anoAtual}-${mesStr}-${diaStr}`;
      const ehHoje = diaAtualFormatado === hoje;
      
      const locacoesDoDia = locacoes.filter(
        loc =>
          diaAtualFormatado >= loc.data_inicio &&
          diaAtualFormatado <= loc.data_fim &&
          loc.status !== 'cancelada'
      );

      const diaDaSemana = new Date(anoAtual, mesAtual - 1, dia).toLocaleDateString('pt-BR', {
        weekday: 'long',
      });

      return (
        <Surface
          key={`dia-${dia}`}
          style={[styles.diaContainer, ehHoje && styles.diaHoje]}
          elevation={ehHoje ? 4 : 2}>
          {/* Cabeçalho do dia */}
          <View style={styles.diaHeader}>
            <Text style={styles.diaTitulo}>
              {ehHoje && '📍 '}Dia {dia}
            </Text>
            <Text style={styles.diaSemana}>
              {diaDaSemana.charAt(0).toUpperCase() + diaDaSemana.slice(1)}
            </Text>
            {ehHoje && (
              <Chip mode="flat" style={styles.chipHoje} textStyle={styles.chipHojeText}>
                HOJE
              </Chip>
            )}
          </View>

          <Divider style={styles.divider} />

          {/* Locações do dia */}
          {locacoesDoDia.map((loc, index) => {
            let textoDoDia = '🔄 Locação em andamento';
            if (diaAtualFormatado === loc.data_inicio) {
              textoDoDia = `▶️ Retirada às ${loc.hora_inicio}`;
            } else if (diaAtualFormatado === loc.data_fim) {
              textoDoDia = `🏁 Devolução às ${loc.hora_fim}`;
            }

            const corStatus = loc.status === 'ativa' ? '#4CAF50' : '#2196F3';

            return (
              <Card key={`loc-${loc.id}-${index}`} style={styles.cardLocacao}>
                <Card.Content>
                  {/* Informações do veículo */}
                  <View style={styles.headerCard}>
                    <View style={styles.veiculoInfo}>
                      <Text style={styles.carro}>🚗 {loc.carro}</Text>
                      <Text style={styles.placa}>Placa: {loc.placa}</Text>
                    </View>
                    <Chip
                      mode="flat"
                      style={[styles.chipStatus, { backgroundColor: corStatus }]}
                      textStyle={styles.chipStatusTexto}>
                      {loc.status.toUpperCase()}
                    </Chip>
                  </View>

                  <Divider style={styles.dividerCard} />

                  {/* Informações do cliente */}
                  <Text style={styles.clienteLabel}>👤 Cliente:</Text>
                  <Text style={styles.clienteNome}>{loc.cliente}</Text>

                  <Text style={styles.detalheDia}>{textoDoDia}</Text>

                  {/* Telefone */}
                  <View style={styles.telefoneContainer}>
                    <Text style={styles.telefoneLabel}>📞 Telefone:</Text>
                    <Text style={styles.telefoneNumero}>
                      {loc.numero_cliente || 'Não informado'}
                    </Text>
                  </View>

                  {/* Botões de ação grandes e claros */}
                  {loc.numero_cliente && (
                    <View style={styles.botoesContatoContainer}>
                      <Button
                        mode="contained-tonal"
                        icon="phone"
                        onPress={() => ligarParaCliente(loc.numero_cliente, loc.cliente)}
                        style={styles.botaoGrande}
                        labelStyle={styles.botaoTexto}
                        contentStyle={styles.botaoConteudo}>
                        Ligar
                      </Button>
                      <Button
                        mode="contained-tonal"
                        icon="content-copy"
                        onPress={() => copiarNumero(loc.numero_cliente, loc.cliente)}
                        style={styles.botaoGrande}
                        labelStyle={styles.botaoTexto}
                        contentStyle={styles.botaoConteudo}>
                        Copiar Número
                      </Button>
                    </View>
                  )}

                  <Divider style={styles.dividerAcoes} />

                  {/* Ações principais */}
                  <View style={styles.actionsContainer}>
                    <Button
                      mode="elevated"
                      icon="pencil"
                      onPress={() => handleEditarLocacao(loc.id)}
                      style={styles.actionButton}
                      labelStyle={styles.actionButtonText}
                      contentStyle={styles.botaoConteudo}>
                      Editar
                    </Button>
                    <Button
                      mode="elevated"
                      icon="close-circle"
                      onPress={() => handleCancelarLocacao(loc.id, loc.carro, loc.cliente)}
                      style={[styles.actionButton, styles.cancelButton]}
                      labelStyle={styles.cancelButtonText}
                      contentStyle={styles.botaoConteudo}>
                      Cancelar
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            );
          })}
        </Surface>
      );
    });
  };

  const nomeMesFormatado = mesesNomes[mesAtual - 1];
  const ehMesAtual = mesAtual === new Date().getMonth() + 1 && anoAtual === new Date().getFullYear();

  return (
    <View style={styles.container}>
      {/* Cabeçalho de navegação melhorado */}
      <Surface style={styles.navegacao} elevation={4}>
        <Button
          mode="text"
          icon="chevron-left"
          onPress={voltarMes}
          labelStyle={styles.navegacaoButtonText}
          contentStyle={styles.navegacaoButtonContent}>
          Anterior
        </Button>

        <View style={styles.mesContainer}>
          <Text style={styles.tituloMes}>{nomeMesFormatado}</Text>
          <Text style={styles.anoTexto}>{anoAtual}</Text>
          {!ehMesAtual && (
            <Button
              mode="text"
              compact
              onPress={irParaMesAtual}
              labelStyle={styles.voltarHojeText}>
              Ir para Hoje
            </Button>
          )}
        </View>

        <Button
          mode="text"
          icon="chevron-right"
          onPress={avancarMes}
          labelStyle={styles.navegacaoButtonText}
          contentStyle={styles.navegacaoButtonContent}>
          Próximo
        </Button>
      </Surface>

      {/* Filtro de visualização */}
      <Surface style={styles.filtroContainer} elevation={1}>
        <Button
          mode={exibirApenasComLocacao ? 'contained' : 'outlined'}
          onPress={() => {
            Vibration.vibrate(30);
            setExibirApenasComLocacao(!exibirApenasComLocacao);
          }}
          icon={exibirApenasComLocacao ? 'eye' : 'eye-off'}
          labelStyle={styles.filtroText}
          contentStyle={styles.filtroButtonContent}>
          {exibirApenasComLocacao ? 'Mostrando Apenas Dias Com Locação' : 'Mostrando Todos os Dias'}
        </Button>
      </Surface>

      {/* Conteúdo */}
      <ScrollView
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
        {renderizarDiasDoMes()}
      </ScrollView>

      {/* FAB para nova locação */}
      <FAB
        icon="plus"
        label="Nova Locação"
        style={styles.fab}
        onPress={() => {
          Vibration.vibrate(50);
          router.push('/locacao');
        }}
      />
    </View>
  );
}

// Estilos otimizados para acessibilidade (mantidos igual ao anterior)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  navegacao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  navegacaoButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  navegacaoButtonContent: {
    paddingHorizontal: 4,
  },
  mesContainer: {
    alignItems: 'center',
    flex: 1,
  },
  tituloMes: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  anoTexto: {
    fontSize: 16,
    color: '#666',
    marginTop: 2,
  },
  voltarHojeText: {
    fontSize: 13,
    marginTop: 4,
  },
  filtroContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
  },
  filtroText: {
    fontSize: 14,
  },
  filtroButtonContent: {
    paddingVertical: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#666',
  },
  emptyCard: {
    marginTop: 40,
    padding: 20,
    backgroundColor: 'white',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#333',
  },
  emptySubtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
    lineHeight: 26,
  },
  emptyButton: {
    marginTop: 8,
  },
  diaContainer: {
    marginBottom: 24,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  diaHoje: {
    borderWidth: 3,
    borderColor: '#6200ee',
  },
  diaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  diaTitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6200ee',
    marginRight: 12,
  },
  diaSemana: {
    fontSize: 18,
    color: '#555',
    flex: 1,
  },
  chipHoje: {
    backgroundColor: '#6200ee',
    height: 28,
  },
  chipHojeText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 12,
    height: 2,
  },
  cardLocacao: {
    marginBottom: 16,
    backgroundColor: '#fafafa',
    elevation: 2,
  },
  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  veiculoInfo: {
    flex: 1,
    marginRight: 12,
  },
  carro: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  placa: {
    fontSize: 16,
    color: '#666',
  },
  chipStatus: {
    height: 32,
    justifyContent: 'center',
  },
  chipStatusTexto: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
  dividerCard: {
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
    marginBottom: 8,
  },
  detalheDia: {
    fontSize: 17,
    color: '#444',
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 12,
  },
  telefoneContainer: {
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  telefoneLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  telefoneNumero: {
    fontSize: 19,
    fontWeight: '600',
    color: '#2e7d32',
  },
  botoesContatoContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  botaoGrande: {
    flex: 1,
  },
  botaoTexto: {
    fontSize: 16,
    fontWeight: '600',
  },
  botaoConteudo: {
    paddingVertical: 8,
  },
  dividerAcoes: {
    marginVertical: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6200ee',
  },
  cancelButton: {
    backgroundColor: '#ffebee',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#d32f2f',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#6200ee',
  },
});
