import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Divider, Searchbar, Text } from 'react-native-paper';
import { getEstatisticasGerais, listarTodasLocacoes } from '../../src/database/queries';

export default function HistoricoScreen() {
  const [locacoes, setLocacoes] = useState<any[]>([]);
  const [locacoesFiltradas, setLocacoesFiltradas] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [refreshing, setRefreshing] = useState(false);
  const [estatisticas, setEstatisticas] = useState<any>({});
  
  const [mostrarFiltroData, setMostrarFiltroData] = useState(false);
  const [dataInicio, setDataInicio] = useState(new Date());
  const [dataFim, setDataFim] = useState(new Date());
  const [showDatePickerInicio, setShowDatePickerInicio] = useState(false);
  const [showDatePickerFim, setShowDatePickerFim] = useState(false);

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
  };

  const aplicarFiltros = () => {
    let resultado = [...locacoes];

    // Filtro por status
    if (filtroStatus !== 'todos') {
      resultado = resultado.filter(l => l.status === filtroStatus);
    }

    // Filtro por busca (cliente, placa ou carro)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      resultado = resultado.filter(
        l =>
          l.cliente.toLowerCase().includes(query) ||
          l.placa.toLowerCase().includes(query) ||
          l.carro.toLowerCase().includes(query)
      );
    }

    setLocacoesFiltradas(resultado);
  };

  const limparFiltros = () => {
    setSearchQuery('');
    setFiltroStatus('todos');
    setMostrarFiltroData(false);
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
      {/* Card de Estatísticas */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.statsTitulo}>
            📊 Estatísticas Gerais
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumero}>{estatisticas.total || 0}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumero, { color: '#4CAF50' }]}>
                {estatisticas.ativas || 0}
              </Text>
              <Text style={styles.statLabel}>Ativas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumero, { color: '#2196F3' }]}>
                {estatisticas.finalizadas || 0}
              </Text>
              <Text style={styles.statLabel}>Finalizadas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumero, { color: '#f44336' }]}>
                {estatisticas.canceladas || 0}
              </Text>
              <Text style={styles.statLabel}>Canceladas</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Barra de Busca */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar por cliente, placa ou carro..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      {/* Filtros por Status */}
      <Card style={styles.filterCard}>
        <Card.Content>
          <View style={styles.filterHeader}>
            <Text variant="titleSmall" style={styles.filterTitulo}>
              Filtrar por Status:
            </Text>
            {(searchQuery || filtroStatus !== 'todos') && (
              <Button mode="text" onPress={limparFiltros} compact>
                Limpar
              </Button>
            )}
          </View>
          <View style={styles.filterRow}>
            <Chip
              selected={filtroStatus === 'todos'}
              onPress={() => setFiltroStatus('todos')}
              style={styles.chip}
            >
              Todos
            </Chip>
            <Chip
              selected={filtroStatus === 'ativa'}
              onPress={() => setFiltroStatus('ativa')}
              style={styles.chip}
            >
              Em Andamento
            </Chip>
            <Chip
              selected={filtroStatus === 'finalizada'}
              onPress={() => setFiltroStatus('finalizada')}
              style={styles.chip}
            >
              Finalizadas
            </Chip>
            <Chip
              selected={filtroStatus === 'cancelada'}
              onPress={() => setFiltroStatus('cancelada')}
              style={styles.chip}
            >
              Canceladas
            </Chip>
          </View>
        </Card.Content>
      </Card>

      {/* Contador de Resultados */}
      <View style={styles.resultadoContainer}>
        <Text variant="bodyMedium" style={styles.resultadoTexto}>
          📋 {locacoesFiltradas.length} locação(ões) encontrada(s)
        </Text>
      </View>

      {/* Lista de Locações */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {locacoesFiltradas.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>
                {searchQuery || filtroStatus !== 'todos'
                  ? '🔍 Nenhuma locação encontrada com esses filtros'
                  : '📋 Nenhuma locação cadastrada ainda'}
              </Text>
            </Card.Content>
          </Card>
        ) : (
          locacoesFiltradas.map((locacao) => (
            <Card key={locacao.id} style={styles.locacaoCard}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.cardInfo}>
                    <Text variant="titleLarge" style={styles.carroNome}>
                      {getStatusIcon(locacao.status)} {locacao.carro}
                    </Text>
                    <Text variant="bodyMedium">📋 Placa: {locacao.placa}</Text>
                  </View>
                  <Chip
                    style={[styles.statusChip, { backgroundColor: getStatusColor(locacao.status) }]}
                    textStyle={styles.statusChipText}
                  >
                    {getStatusLabel(locacao.status)}
                  </Chip>
                </View>

                <Divider style={styles.divider} />

                <View style={styles.infoContainer}>
                  <Text variant="bodyMedium">👤 Cliente: {locacao.cliente}</Text>
                  {locacao.numero_cliente && (
                    <Text variant="bodyMedium">
                      📞 Número: {locacao.numero_cliente}
                    </Text>
                  )}
                  <Text variant="bodySmall" style={styles.dataTexto}>
                    ⏰ Início: {new Date(locacao.data_inicio).toLocaleDateString('pt-BR')} às{' '}
                    {locacao.hora_inicio}
                  </Text>
                  <Text variant="bodySmall" style={styles.dataTexto}>
                    🏁 Fim: {new Date(locacao.data_fim).toLocaleDateString('pt-BR')} às{' '}
                    {locacao.hora_fim}
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
  statsCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 4,
  },
  statsTitulo: {
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumero: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  statLabel: {
    fontSize: 11,
    color: '#757575',
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchBar: {
    elevation: 2,
  },
  filterCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    elevation: 2,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterTitulo: {
    fontWeight: 'bold',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 4,
  },
  resultadoContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultadoTexto: {
    color: '#757575',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  locacaoCard: {
    marginBottom: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardInfo: {
    flex: 1,
  },
  carroNome: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusChip: {
    marginLeft: 8,
  },
  statusChipText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 11,
  },
  divider: {
    marginVertical: 12,
  },
  infoContainer: {
    gap: 4,
  },
  dataTexto: {
    color: '#757575',
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
