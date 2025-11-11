import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Vibration,
  View,
} from 'react-native';
import { Button, Card, Chip, Divider, Searchbar, Surface, Text } from 'react-native-paper';
import { getEstatisticasGerais, listarTodasLocacoes } from '../../src/database/queries';

export default function HistoricoScreen() {
  const [locacoes, setLocacoes] = useState([]);
  const [locacoesFiltradas, setLocacoesFiltradas] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [refreshing, setRefreshing] = useState(false);
  const [estatisticas, setEstatisticas] = useState<any>({});

  useFocusEffect(
    React.useCallback(() => {
      carregarDados();
    }, [])
  );

  useEffect(() => {
    aplicarFiltros();
  }, [searchQuery, filtroStatus, locacoes]);

  const carregarDados = async () => {
    try {
      const dados = await listarTodasLocacoes();
      const stats = await getEstatisticasGerais();
      setLocacoes(dados);
      setEstatisticas(stats);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarDados();
    setRefreshing(false);
    Vibration.vibrate(50);
  };

  const aplicarFiltros = () => {
    let resultado = [...locacoes];

    // Filtro por status
    if (filtroStatus !== 'todos') {
      resultado = resultado.filter((l: any) => l.status === filtroStatus);
    }

    // Filtro por busca (cliente, placa ou carro)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      resultado = resultado.filter(
        (l: any) =>
          l.cliente.toLowerCase().includes(query) ||
          l.placa.toLowerCase().includes(query) ||
          l.carro.toLowerCase().includes(query)
      );
    }

    setLocacoesFiltradas(resultado);
  };

  const limparFiltros = () => {
    Vibration.vibrate(30);
    setSearchQuery('');
    setFiltroStatus('todos');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa':
        return '#4CAF50';
      case 'finalizada':
        return '#2196F3';
      case 'cancelada':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ativa':
        return 'Em Andamento';
      case 'finalizada':
        return 'Finalizada';
      case 'cancelada':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ativa':
        return '🚗';
      case 'finalizada':
        return '✅';
      case 'cancelada':
        return '❌';
      default:
        return '❓';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
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
          <Text style={styles.titulo}>📜 Histórico de Locações</Text>
          <Text style={styles.subtitulo}>
            Consulte todas as locações realizadas e suas estatísticas
          </Text>
        </Surface>

        {/* Card de Estatísticas */}
        <Surface style={styles.statsCard} elevation={4}>
          <Text style={styles.statsTitulo}>📊 Estatísticas Gerais</Text>
          <Divider style={styles.dividerStats} />
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumero}>{estatisticas.total || 0}</Text>
              <Text style={styles.statLabel}>📋 Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumero, { color: '#4CAF50' }]}>
                {estatisticas.ativas || 0}
              </Text>
              <Text style={styles.statLabel}>🚗 Ativas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumero, { color: '#2196F3' }]}>
                {estatisticas.finalizadas || 0}
              </Text>
              <Text style={styles.statLabel}>✅ Finalizadas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumero, { color: '#f44336' }]}>
                {estatisticas.canceladas || 0}
              </Text>
              <Text style={styles.statLabel}>❌ Canceladas</Text>
            </View>
          </View>
        </Surface>

        {/* Barra de Busca */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Buscar por cliente, veículo ou placa..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor="#6200ee"
          />
          {searchQuery.trim() && (
            <Text style={styles.searchHint}>
              💡 Buscando por: "{searchQuery}"
            </Text>
          )}
        </View>

        {/* Filtros por Status */}
        <Surface style={styles.filterCard} elevation={3}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitulo}>🔍 Filtrar por Status:</Text>
            {(searchQuery || filtroStatus !== 'todos') && (
              <Button
                mode="text"
                onPress={limparFiltros}
                labelStyle={styles.limparButton}
                compact>
                Limpar Filtros
              </Button>
            )}
          </View>
          <View style={styles.filterRow}>
            <Chip
              selected={filtroStatus === 'todos'}
              onPress={() => {
                Vibration.vibrate(30);
                setFiltroStatus('todos');
              }}
              style={styles.chip}
              textStyle={styles.chipText}>
              Todos ({locacoes.length})
            </Chip>
            <Chip
              selected={filtroStatus === 'ativa'}
              onPress={() => {
                Vibration.vibrate(30);
                setFiltroStatus('ativa');
              }}
              style={styles.chip}
              textStyle={styles.chipText}
              icon="car">
              Em Andamento
            </Chip>
            <Chip
              selected={filtroStatus === 'finalizada'}
              onPress={() => {
                Vibration.vibrate(30);
                setFiltroStatus('finalizada');
              }}
              style={styles.chip}
              textStyle={styles.chipText}
              icon="check-circle">
              Finalizadas
            </Chip>
            <Chip
              selected={filtroStatus === 'cancelada'}
              onPress={() => {
                Vibration.vibrate(30);
                setFiltroStatus('cancelada');
              }}
              style={styles.chip}
              textStyle={styles.chipText}
              icon="close-circle">
              Canceladas
            </Chip>
          </View>
        </Surface>

        {/* Contador de Resultados */}
        <Surface style={styles.resultadoCard} elevation={2}>
          <Text style={styles.resultadoTexto}>
            📋 {locacoesFiltradas.length} locação(ões) encontrada(s)
          </Text>
        </Surface>

        {/* Lista de Locações */}
        <View style={styles.listaContainer}>
          {locacoesFiltradas.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text style={styles.emptyText}>
                  {searchQuery || filtroStatus !== 'todos'
                    ? '🔍 Nenhuma locação encontrada com esses filtros'
                    : '📋 Nenhuma locação cadastrada ainda'}
                </Text>
                <Text style={styles.emptySubtext}>
                  {searchQuery || filtroStatus !== 'todos'
                    ? 'Tente ajustar os filtros ou fazer outra busca'
                    : 'Cadastre locações na aba "Novo" para começar'}
                </Text>
              </Card.Content>
            </Card>
          ) : (
            locacoesFiltradas.map((locacao: any) => (
              <Card key={locacao.id} style={styles.locacaoCard}>
                <Card.Content>
                  {/* Header do Card */}
                  <View style={styles.cardHeader}>
                    <View style={styles.cardInfo}>
                      <Text style={styles.carroNome}>
                        {getStatusIcon(locacao.status)} {locacao.carro}
                      </Text>
                      <Text style={styles.placaTexto}>📋 Placa: {locacao.placa}</Text>
                    </View>
                    <Chip
                      mode="flat"
                      style={[
                        styles.statusChip,
                        { backgroundColor: getStatusColor(locacao.status) },
                      ]}
                      textStyle={styles.statusChipText}>
                      {getStatusLabel(locacao.status)}
                    </Chip>
                  </View>

                  <Divider style={styles.divider} />

                  {/* Informações do Cliente */}
                  <View style={styles.infoSection}>
                    <Text style={styles.sectionLabel}>👤 Cliente:</Text>
                    <Text style={styles.clienteNome}>{locacao.cliente}</Text>
                    {locacao.numero_cliente && (
                      <Text style={styles.telefoneTexto}>
                        📞 Telefone: {locacao.numero_cliente}
                      </Text>
                    )}
                  </View>

                  <Divider style={styles.divider} />

                  {/* Período */}
                  <View style={styles.infoSection}>
                    <Text style={styles.sectionLabel}>📅 Período da Locação:</Text>
                    <Text style={styles.dataTexto}>
                      ⏰ Início: {new Date(locacao.data_inicio).toLocaleDateString('pt-BR')} às{' '}
                      {locacao.hora_inicio}
                    </Text>
                    <Text style={styles.dataTexto}>
                      🏁 Fim: {new Date(locacao.data_fim).toLocaleDateString('pt-BR')} às{' '}
                      {locacao.hora_fim}
                    </Text>
                    <Text style={styles.diasTexto}>
                      ⏱️ Total: {locacao.quantidade_dias} dia(s)
                    </Text>
                  </View>

                  {/* Valores */}
                  {locacao.valor_total && (
                    <>
                      <Divider style={styles.divider} />
                      <View style={styles.valorSection}>
                        <View style={styles.valorRow}>
                          <Text style={styles.valorLabel}>💰 Valor Total:</Text>
                          <Text style={styles.valorTotal}>
                            R$ {locacao.valor_total.toFixed(2)}
                          </Text>
                        </View>
                        {locacao.status_pagamento && (
                          <Chip
                            mode="flat"
                            style={[
                              styles.pagamentoChip,
                              {
                                backgroundColor:
                                  locacao.status_pagamento === 'pago' ? '#4CAF50' : '#FF9800',
                              },
                            ]}
                            textStyle={styles.pagamentoChipText}>
                            {locacao.status_pagamento === 'pago' ? '✅ Pago' : '⏳ Pendente'}
                          </Chip>
                        )}
                      </View>
                    </>
                  )}
                </Card.Content>
              </Card>
            ))
          )}
        </View>
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
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    marginBottom: 16,
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
  statsCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statsTitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#1565c0',
  },
  dividerStats: {
    marginBottom: 16,
    height: 2,
    backgroundColor: '#64b5f6',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumero: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 15,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBar: {
    elevation: 3,
    borderRadius: 8,
  },
  searchInput: {
    fontSize: 17,
  },
  searchHint: {
    marginTop: 8,
    fontSize: 15,
    color: '#6200ee',
    fontStyle: 'italic',
  },
  filterCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  limparButton: {
    fontSize: 15,
    fontWeight: '600',
  },
  filterRow: {
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
  resultadoCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  resultadoTexto: {
    fontSize: 17,
    color: '#666',
    fontWeight: 'bold',
  },
  listaContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  locacaoCard: {
    marginBottom: 16,
    elevation: 4,
    backgroundColor: '#fff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardInfo: {
    flex: 1,
    marginRight: 12,
  },
  carroNome: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
  },
  placaTexto: {
    fontSize: 17,
    color: '#666',
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
  infoSection: {
    gap: 6,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  clienteNome: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  telefoneTexto: {
    fontSize: 17,
    color: '#1976d2',
    marginTop: 4,
  },
  dataTexto: {
    fontSize: 17,
    color: '#666',
    lineHeight: 24,
  },
  diasTexto: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6200ee',
    marginTop: 4,
  },
  valorSection: {
    gap: 12,
  },
  valorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valorLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  valorTotal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  pagamentoChip: {
    alignSelf: 'flex-start',
    height: 32,
  },
  pagamentoChipText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
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
