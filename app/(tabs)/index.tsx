import { useFocusEffect, useRouter } from 'expo-router'; // Importa useRouter
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  Linking,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Button, // Importa Button
  Card,
  Chip,
  Divider,
  IconButton,
  Text,
} from 'react-native-paper';
// Importa as queries novas
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

// O nome da função agora é AgendaScreen, como no seu arquivo original
export default function AgendaScreen() {
  const router = useRouter(); // Adicionado da sua tela original
  const [mesAtual, setMesAtual] = useState<number>(new Date().getMonth() + 1);
  const [anoAtual, setAnoAtual] = useState<number>(new Date().getFullYear());
  const [locacoes, setLocacoes] = useState<Locacao[]>([]);
  const [loading, setLoading] = useState(true);

  const mesesNomes = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  // Hook para carregar dados (com a limpeza automática)
  useFocusEffect(
    useCallback(() => {
      const carregarDadosDaTela = async () => {
        setLoading(true);
        try {
          await atualizarLocacoesVencidasAutomaticamente();
          const dados = await getLocacoesDoMes(anoAtual, mesAtual);
          setLocacoes(dados as Locacao[]);
        } catch (error) {
          console.error("Erro ao carregar locações:", error);
        } finally {
          setLoading(false);
        }
      };
      carregarDadosDaTela();
      return () => {
        setLocacoes([]);
      };
    }, [mesAtual, anoAtual])
  );

  // Funções de navegação
  const avancarMes = () => {
    if (mesAtual === 12) {
      setMesAtual(1);
      setAnoAtual(anoAtual + 1);
    } else {
      setMesAtual(mesAtual + 1);
    }
  };

  const voltarMes = () => {
    if (mesAtual === 1) {
      setMesAtual(12);
      setAnoAtual(anoAtual - 1);
    } else {
      setMesAtual(mesAtual - 1);
    }
  };

  // Funções de formatação
  const getCorStatus = (status: string): string => {
    switch (status) {
      case 'ativa':
        return '#4CAF50';
      case 'finalizada':
        return '#2196F3';
      case 'cancelada':
        return '#F44336';
      default:
        return '#FF9800';
    }
  };

  // --- Funções de Ação (copiadas do seu index.tsx original) ---
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
      const numeroLimpo = numero.replace(/\D/g, '');
      const url = `tel:${numeroLimpo}`;
      
      Linking.canOpenURL(url)
        .then((supported) => {
          if (supported) {
            Linking.openURL(url);
          } else {
            Alert.alert('❌ Erro', 'Não é possível realizar chamadas neste dispositivo');
          }
        })
        .catch(() => {
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
              // Recarrega os dados da tela
              setLoading(true);
              await atualizarLocacoesVencidasAutomaticamente();
              const dados = await getLocacoesDoMes(anoAtual, mesAtual);
              setLocacoes(dados as Locacao[]);
              setLoading(false);
            } catch (error: any) {
              Alert.alert('❌ Erro', 'Erro ao cancelar locação: ' + error.message);
            }
          },
        },
      ]
    );
  };
  // --- Fim das Funções de Ação ---


  // --- LÓGICA DE RENDERIZAÇÃO ---
  const renderizarDiasDoMes = () => {
    if (loading) {
      return <ActivityIndicator size="large" style={styles.loadingIndicator} />;
    }

    const ultimoDia = new Date(anoAtual, mesAtual, 0).getDate();
    const diasDoMes = Array.from({ length: ultimoDia }, (_, i) => i + 1);
    const mesStr = String(mesAtual).padStart(2, '0');

    return diasDoMes.map(dia => {
      const diaStr = String(dia).padStart(2, '0');
      const diaAtualFormatado = `${anoAtual}-${mesStr}-${diaStr}`;

      const locacoesDoDia = locacoes.filter(loc =>
        diaAtualFormatado >= loc.data_inicio &&
        diaAtualFormatado <= loc.data_fim &&
        loc.status !== 'cancelada'
      );

      const diaDaSemana = new Date(anoAtual, mesAtual - 1, dia).toLocaleDateString('pt-BR', { weekday: 'long' });

      return (
        <View key={dia} style={styles.diaContainer}>
          <Text variant="headlineSmall" style={styles.diaTitulo}>
            Dia {dia}
            <Text variant="titleMedium" style={styles.diaSemana}>
              {` (${diaDaSemana.charAt(0).toUpperCase() + diaDaSemana.slice(1)})`}
            </Text>
          </Text>
          <Divider style={styles.divider} />

          {locacoesDoDia.length === 0 ? (
            <Text style={styles.semLocacao}>Sem locação</Text>
          ) : (
            locacoesDoDia.map(loc => {
              let textoDoDia = 'Locação em andamento';
              if (diaAtualFormatado === loc.data_inicio) {
                textoDoDia = `▶️ Retirada: ${loc.hora_inicio}`;
              } else if (diaAtualFormatado === loc.data_fim) {
                textoDoDia = `🏁 Devolução: ${loc.hora_fim}`;
              }

              return (
                <Card key={loc.id} style={styles.cardLocacao}>
                  <Card.Content>
                    <View style={styles.headerCard}>
                      <Text style={styles.carro}>{loc.carro} - {loc.placa}</Text>
                      <Chip
                        style={[styles.chipPequeno, { backgroundColor: getCorStatus(loc.status) }]}
                        textStyle={styles.chipPequenoTexto}
                      >
                        {loc.status.toUpperCase()}
                      </Chip>
                    </View>
                    <Text style={styles.cliente}>Cliente: {loc.cliente}</Text>
                    <Text style={styles.detalheDia}>{textoDoDia}</Text>

                    {/* --- Botões de Ação (do index.tsx original) --- */}
                    <View style={styles.numeroContainer}>
                      <Text variant="bodyMedium" style={styles.numeroTexto}>
                        📞 {loc.numero_cliente || 'Não informado'}
                      </Text>
                      {loc.numero_cliente && (
                        <View style={styles.numeroActions}>
                          <IconButton
                            icon="phone"
                            size={20}
                            onPress={() => ligarParaCliente(loc.numero_cliente, loc.cliente)}
                            style={styles.botaoAcao}
                            iconColor="#4CAF50"
                          />
                          <IconButton
                            icon="content-copy"
                            size={20}
                            onPress={() => copiarNumero(loc.numero_cliente, loc.cliente)}
                            style={styles.botaoAcao}
                          />
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.actionsContainer}>
                      <Button
                        mode="outlined"
                        icon="pencil"
                        onPress={() => handleEditarLocacao(loc.id)}
                        style={styles.actionButton}
                      >
                        Editar
                      </Button>
                      <Button
                        mode="outlined"
                        icon="delete"
                        onPress={() => handleCancelarLocacao(loc.id, loc.carro, loc.cliente)}
                        style={styles.actionButton}
                        textColor="#d32f2f"
                      >
                        Cancelar
                      </Button>
                    </View>
                    {/* --- Fim dos Botões de Ação --- */}

                  </Card.Content>
                </Card>
              );
            })
          )}
        </View>
      );
    });
  };

  const nomeMesFormatado = mesesNomes[mesAtual - 1].charAt(0).toUpperCase() + mesesNomes[mesAtual - 1].slice(1);

  return (
    <ScrollView style={styles.container}>
      {/* Cabeçalho de Navegação (antigo seletor de data) */}
      <View style={styles.navegacao}>
        <IconButton icon="chevron-left" size={30} onPress={voltarMes} />
        <Text style={styles.tituloMes}>
          {nomeMesFormatado} {anoAtual}
        </Text>
        <IconButton icon="chevron-right" size={30} onPress={avancarMes} />
      </View>

      {/* Conteúdo */}
      {renderizarDiasDoMes()}

    </ScrollView>
  );
}

// Estilos (Combinação do index.tsx e agendaMensal.tsx)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  navegacao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tituloMes: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    color: '#6200ee',
  },
  loadingIndicator: {
    marginTop: 50,
  },
  diaContainer: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    elevation: 2,
  },
  diaTitulo: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
  diaSemana: {
    fontWeight: 'normal',
    color: '#555',
  },
  divider: {
    marginVertical: 8,
  },
  semLocacao: {
    fontSize: 14,
    color: '#777',
    paddingVertical: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  cardLocacao: {
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    elevation: 1,
  },
  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  carro: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  chipPequeno: {
    height: 24,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipPequenoTexto: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 16,
  },
  cliente: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detalheDia: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginTop: 4,
  },
  // Estilos dos botões (do index.tsx original)
  numeroContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  numeroTexto: {
    flex: 1,
    fontSize: 14,
  },
  numeroActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botaoAcao: {
    margin: 0,
    marginLeft: 4,
    height: 32,
    width: 32,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
});