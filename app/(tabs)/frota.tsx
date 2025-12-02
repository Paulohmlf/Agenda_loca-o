import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Vibration,
  View,
} from 'react-native';
import { Button, Card, Chip, Divider, Surface, Text } from 'react-native-paper';
import {
  atualizarLocacoesVencidasAutomaticamente,
  atualizarStatusCarro,
  listarCarrosComStatus,
} from '../../src/database/queries';

export default function FrotaScreen() {
  const [carros, setCarros] = useState([]);
  const [carrosFiltrados, setCarrosFiltrados] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      carregarCarros();
    }, [])
  );

  useEffect(() => {
    aplicarFiltro();
  }, [filtroStatus, carros]);

  const carregarCarros = async () => {
    try {
      await atualizarLocacoesVencidasAutomaticamente();
      const dados = await listarCarrosComStatus();
      setCarros(dados);
    } catch (error) {
      console.error('Erro ao carregar carros:', error);
      Alert.alert('❌ Erro', 'Não foi possível carregar a frota. Tente novamente.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarCarros();
    setRefreshing(false);
    Vibration.vibrate(50);
  };

  const aplicarFiltro = () => {
    if (filtroStatus === 'todos') {
      setCarrosFiltrados(carros);
    } else {
      setCarrosFiltrados(carros.filter((c: any) => c.status === filtroStatus));
    }
  };

  const handleAlterarStatus = async (carroId: number, novoStatus: string, modelo: string) => {
    Vibration.vibrate(50);
    Alert.alert(
      '🔧 Alterar Status do Veículo',
      `Você está alterando o status de:\n\n🚗 ${modelo}\n\nNovo status: ${getStatusLabel(
        novoStatus
      )}\n\nDeseja confirmar?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim, Alterar',
          style: 'default',
          onPress: async () => {
            try {
              await atualizarStatusCarro(carroId, novoStatus);
              Vibration.vibrate(200);
              Alert.alert(
                '✅ Status Atualizado',
                `O status do veículo foi alterado com sucesso!\n\n🚗 ${modelo}\n📊 Novo status: ${getStatusLabel(
                  novoStatus
                )}`,
                [{ text: 'Ok, Entendi', style: 'default' }]
              );
              await carregarCarros();
            } catch (error: any) {
              Alert.alert(
                '❌ Erro ao Atualizar',
                `Não foi possível atualizar o status:\n\n${error.message}`,
                [{ text: 'Entendi', style: 'default' }]
              );
            }
          },
        },
      ]
    );
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'disponivel':
        return 'Disponível';
      case 'alugado':
        return 'Alugado';
      case 'manutencao':
        return 'Em Manutenção';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponivel':
        return '#4CAF50';
      case 'alugado':
        return '#FF9800';
      case 'manutencao':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'disponivel':
        return '✅';
      case 'alugado':
        return '🚗';
      case 'manutencao':
        return '🔧';
      default:
        return '❓';
    }
  };

  const calcularTotalPorStatus = (status: string) => {
    const idsUnicos = new Set(carros.filter((c: any) => c.status === status).map((c: any) => c.id));
    return idsUnicos.size;
  };

  const calcularTotalFrota = () => {
    const idsUnicos = new Set(carros.map((c: any) => c.id));
    return idsUnicos.size;
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
        {/* Cabeçalho */}
        <Surface style={styles.headerCard} elevation={4}>
          <Text style={styles.titulo}>🚗 Frota de Veículos</Text>
          <Text style={styles.subtitulo}>
            Gerencie todos os veículos cadastrados e seus status
          </Text>
        </Surface>

        {/* Card de Resumo */}
        <Surface style={styles.resumoCard} elevation={4}>
          <Text style={styles.resumoTitulo}>📊 Resumo da Frota</Text>
          <Divider style={styles.dividerResumo} />
          <View style={styles.resumoRow}>
            <View style={styles.resumoItem}>
              <Text style={[styles.resumoNumero, { color: '#4CAF50' }]}>
                {calcularTotalPorStatus('disponivel')}
              </Text>
              <Text style={styles.resumoLabel}>✅ Disponíveis</Text>
            </View>
            <View style={styles.resumoItem}>
              <Text style={[styles.resumoNumero, { color: '#FF9800' }]}>
                {calcularTotalPorStatus('alugado')}
              </Text>
              <Text style={styles.resumoLabel}>🚗 Alugados</Text>
            </View>
            <View style={styles.resumoItem}>
              <Text style={[styles.resumoNumero, { color: '#f44336' }]}>
                {calcularTotalPorStatus('manutencao')}
              </Text>
              <Text style={styles.resumoLabel}>🔧 Manutenção</Text>
            </View>
          </View>
        </Surface>

        {/* Filtros */}
        <Surface style={styles.filtroCard} elevation={3}>
          <Text style={styles.filtroTitulo}>🔍 Filtrar por Status:</Text>
          <View style={styles.filtroRow}>
            <Chip
              selected={filtroStatus === 'todos'}
              onPress={() => {
                Vibration.vibrate(30);
                setFiltroStatus('todos');
              }}
              style={styles.chip}
              textStyle={styles.chipText}>
              Todos ({calcularTotalFrota()})
            </Chip>
            <Chip
              selected={filtroStatus === 'disponivel'}
              onPress={() => {
                Vibration.vibrate(30);
                setFiltroStatus('disponivel');
              }}
              style={styles.chip}
              textStyle={styles.chipText}
              icon="check-circle">
              Disponíveis
            </Chip>
            <Chip
              selected={filtroStatus === 'alugado'}
              onPress={() => {
                Vibration.vibrate(30);
                setFiltroStatus('alugado');
              }}
              style={styles.chip}
              textStyle={styles.chipText}
              icon="car">
              Alugados
            </Chip>
            <Chip
              selected={filtroStatus === 'manutencao'}
              onPress={() => {
                Vibration.vibrate(30);
                setFiltroStatus('manutencao');
              }}
              style={styles.chip}
              textStyle={styles.chipText}
              icon="wrench">
              Manutenção
            </Chip>
          </View>
        </Surface>

        {/* Lista de Carros */}
        {carrosFiltrados.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>
                {filtroStatus === 'todos'
                  ? '📋 Nenhum veículo cadastrado'
                  : `📋 Nenhum veículo ${getStatusLabel(filtroStatus).toLowerCase()}`}
              </Text>
              <Text style={styles.emptySubtext}>
                {filtroStatus === 'todos'
                  ? 'Cadastre veículos na aba "Novo" para começar'
                  : 'Tente outro filtro ou altere o status dos veículos'}
              </Text>
            </Card.Content>
          </Card>
        ) : (
          carrosFiltrados.map((carro: any) => (
            <Card key={carro.id} style={styles.carroCard}>
              <Card.Content>
                {/* Header do Card */}
                <View style={styles.carroHeader}>
                  <View style={styles.carroInfo}>
                    <Text style={styles.carroModelo}>
                      {getStatusIcon(carro.status)} {carro.modelo}
                    </Text>
                    <Text style={styles.carroPlaca}>📋 Placa: {carro.placa}</Text>
                    <Text style={styles.carroDiaria}>
                      💰 R$ {carro.valor_diaria.toFixed(2)}/dia
                    </Text>
                  </View>
                  <Chip
                    mode="flat"
                    style={[styles.statusChip, { backgroundColor: getStatusColor(carro.status) }]}
                    textStyle={styles.statusChipText}>
                    {getStatusLabel(carro.status)}
                  </Chip>
                </View>

                {/* Informações de Locação se alugado */}
                {carro.status === 'alugado' && carro.cliente && (
                  <>
                    <Divider style={styles.divider} />
                    <Surface style={styles.locacaoInfo} elevation={1}>
                      <Text style={styles.locacaoTitulo}>📍 Locação Atual</Text>
                      <Text style={styles.locacaoLabel}>👤 Cliente: {carro.cliente}</Text>
                      <Text style={styles.locacaoLabel}>
                        📅 Início:{' '}
                        {new Date(carro.data_inicio).toLocaleDateString('pt-BR')} às{' '}
                        {carro.hora_inicio}
                      </Text>
                      <Text style={styles.locacaoLabel}>
                        🏁 Devolução:{' '}
                        {new Date(carro.data_fim).toLocaleDateString('pt-BR')} às {carro.hora_fim}
                      </Text>
                    </Surface>
                  </>
                )}

                <Divider style={styles.dividerAcoes} />

                {/* Botões de Ação */}
                <View style={styles.acoesContainer}>
                  <Text style={styles.acoesLabel}>Alterar Status Para:</Text>
                  <View style={styles.botoesRow}>
                    {carro.status !== 'disponivel' && (
                      <Button
                        mode="contained-tonal"
                        icon="check-circle"
                        onPress={() =>
                          handleAlterarStatus(carro.id, 'disponivel', carro.modelo)
                        }
                        style={[styles.botaoStatus, { backgroundColor: '#e8f5e9' }]}
                        labelStyle={[styles.botaoStatusLabel, { color: '#2e7d32' }]}
                        contentStyle={styles.botaoStatusContent}>
                        Disponível
                      </Button>
                    )}
                    {carro.status !== 'manutencao' && (
                      <Button
                        mode="contained-tonal"
                        icon="wrench"
                        onPress={() =>
                          handleAlterarStatus(carro.id, 'manutencao', carro.modelo)
                        }
                        style={[styles.botaoStatus, { backgroundColor: '#ffebee' }]}
                        labelStyle={[styles.botaoStatusLabel, { color: '#c62828' }]}
                        contentStyle={styles.botaoStatusContent}>
                        Manutenção
                      </Button>
                    )}
                  </View>
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
  scrollView: {
    flex: 1,
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
    alignItems: 'center',
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
  resumoCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  resumoTitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1565c0',
  },
  dividerResumo: {
    marginBottom: 16,
    height: 2,
    backgroundColor: '#64b5f6',
  },
  resumoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 10,
  },
  resumoItem: {
    alignItems: 'center',
  },
  resumoNumero: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resumoLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  filtroCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  filtroTitulo: {
    fontSize: 18,
    marginBottom: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  filtroRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 4,
    height: 40,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '600',
  },
  carroCard: {
    marginBottom: 16,
    elevation: 4,
    backgroundColor: '#fff',
  },
  carroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  carroInfo: {
    flex: 1,
    marginRight: 12,
  },
  carroModelo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
  },
  carroPlaca: {
    fontSize: 17,
    color: '#666',
    marginBottom: 4,
  },
  carroDiaria: {
    fontSize: 19,
    fontWeight: '600',
    color: '#1976d2',
  },
  statusChip: {
    height: 36,
    justifyContent: 'center',
  },
  statusChipText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  divider: {
    marginVertical: 12,
    height: 2,
  },
  locacaoInfo: {
    backgroundColor: '#fff3e0',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  locacaoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e65100',
    marginBottom: 8,
  },
  locacaoLabel: {
    fontSize: 17,
    marginBottom: 6,
    color: '#e65100',
    lineHeight: 24,
  },
  dividerAcoes: {
    marginVertical: 16,
    height: 2,
  },
  acoesContainer: {
    gap: 12,
  },
  acoesLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  botoesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  botaoStatus: {
    flex: 1,
  },
  botaoStatusLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  botaoStatusContent: {
    paddingVertical: 8,
  },
  emptyCard: {
    marginTop: 40,
    backgroundColor: '#fff',
    elevation: 2,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 20,
    color: '#666',
    fontWeight: '600',
    marginBottom: 12,
  },
  emptySubtext: {
    textAlign: 'center',
    fontSize: 17,
    color: '#999',
    lineHeight: 24,
  },
});
