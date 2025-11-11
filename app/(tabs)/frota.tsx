import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Divider, Menu, Text } from 'react-native-paper';
// Importa a nova função de atualização automática
import {
  atualizarLocacoesVencidasAutomaticamente,
  atualizarStatusCarro,
  listarCarrosComStatus,
} from '../../src/database/queries';

export default function FrotaScreen() {
  const [carros, setCarros] = useState<any[]>([]);
  const [carrosFiltrados, setCarrosFiltrados] = useState<any[]>([]);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [refreshing, setRefreshing] = useState(false);
  const [menuAberto, setMenuAberto] = useState<number | null>(null);

  // Recarregar sempre que a tela ficar em foco
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
      // *** ATUALIZAÇÃO APLICADA AQUI ***
      // Primeiro, atualiza locações vencidas e pagas para "finalizada"
      await atualizarLocacoesVencidasAutomaticamente();
      
      // Depois, carrega a lista de carros com os status corretos
      const dados = await listarCarrosComStatus();
      setCarros(dados);
    } catch (error) {
      console.error('Erro ao carregar carros:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarCarros(); // Esta função agora também faz a atualização automática
    setRefreshing(false);
  };

  const aplicarFiltro = () => {
    if (filtroStatus === 'todos') {
      setCarrosFiltrados(carros);
    } else {
      setCarrosFiltrados(carros.filter(c => c.status === filtroStatus));
    }
  };

  const handleAlterarStatus = async (carroId: number, novoStatus: string, modelo: string) => {
    // Fecha o menu imediatamente
    setMenuAberto(null);
    
    Alert.alert(
      '🔧 Alterar Status',
      `Alterar status do ${modelo} para "${getStatusLabel(novoStatus)}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await atualizarStatusCarro(carroId, novoStatus);
              Alert.alert('✅ Sucesso', 'Status atualizado com sucesso!');
              await carregarCarros();
            } catch (error: any) {
              Alert.alert('❌ Erro', 'Erro ao atualizar status: ' + error.message);
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
    // Usamos um Set para contar apenas IDs únicos de carros
    const idsUnicos = new Set(carros.filter(c => c.status === status).map(c => c.id));
    return idsUnicos.size;
  };
  
  const calcularTotalFrota = () => {
    // Usamos um Set para contar o total de IDs únicos de carros
    const idsUnicos = new Set(carros.map(c => c.id));
    return idsUnicos.size;
  };

  return (
    <View style={styles.container}>
      {/* Card de Resumo */}
      <Card style={styles.resumoCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.resumoTitulo}>
            📊 Resumo da Frota
          </Text>
          <View style={styles.resumoRow}>
            <View style={styles.resumoItem}>
              <Text style={styles.resumoNumero}>{calcularTotalPorStatus('disponivel')}</Text>
              <Text style={styles.resumoLabel}>Disponíveis</Text>
            </View>
            <View style={styles.resumoItem}>
              <Text style={styles.resumoNumero}>{calcularTotalPorStatus('alugado')}</Text>
              <Text style={styles.resumoLabel}>Alugados</Text>
            </View>
            <View style={styles.resumoItem}>
              <Text style={styles.resumoNumero}>{calcularTotalPorStatus('manutencao')}</Text>
              <Text style={styles.resumoLabel}>Manutenção</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Filtros */}
      <Card style={styles.filtroCard}>
        <Card.Content>
          <Text variant="titleSmall" style={styles.filtroTitulo}>
            Filtrar por Status:
          </Text>
          <View style={styles.filtroRow}>
            <Chip
              selected={filtroStatus === 'todos'}
              onPress={() => setFiltroStatus('todos')}
              style={styles.chip}
            >
              Todos ({calcularTotalFrota()})
            </Chip>
            <Chip
              selected={filtroStatus === 'disponivel'}
              onPress={() => setFiltroStatus('disponivel')}
              style={styles.chip}
            >
              Disponíveis
            </Chip>
            <Chip
              selected={filtroStatus === 'alugado'}
              onPress={() => setFiltroStatus('alugado')}
              style={styles.chip}
            >
              Alugados
            </Chip>
            <Chip
              selected={filtroStatus === 'manutencao'}
              onPress={() => setFiltroStatus('manutencao')}
              style={styles.chip}
            >
              Manutenção
            </Chip>
          </View>
        </Card.Content>
      </Card>

      {/* Lista de Carros */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {carrosFiltrados.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>
                Nenhum carro encontrado com este filtro
              </Text>
            </Card.Content>
          </Card>
        ) : (
          carrosFiltrados.map((carro) => (
            <Card 
              key={`${carro.id}-${carro.locacao_id || 'disponivel'}`} 
              style={styles.carroCard}
            >
              <Card.Content>
                <View style={styles.carroHeader}>
                  <View style={styles.carroInfo}>
                    <Text variant="titleLarge" style={styles.carroModelo}>
                      {getStatusIcon(carro.status)} {carro.modelo}
                    </Text>
                    <Text variant="bodyMedium">📋 Placa: {carro.placa}</Text>
                  </View>
                  <Chip
                    style={[styles.statusChip, { backgroundColor: getStatusColor(carro.status) }]}
                    textStyle={styles.statusChipText}
                  >
                    {getStatusLabel(carro.status)}
                  </Chip>
                </View>

                <Divider style={styles.divider} />

                {/* Informações adicionais se estiver alugado */}
                {carro.status === 'alugado' && carro.cliente && (
                  <View style={styles.locacaoInfo}>
                    <Text variant="bodySmall" style={styles.locacaoLabel}>
                      👤 Cliente: {carro.cliente}
                    </Text>
                    <Text variant="bodySmall" style={styles.locacaoLabel}>
                      🏁 Devolução: {new Date(carro.data_fim).toLocaleDateString('pt-BR')} às {carro.hora_fim}
                    </Text>
                  </View>
                )}

                {/* Botão de alterar status */}
                <Menu
                  visible={menuAberto === carro.id}
                  onDismiss={() => setMenuAberto(null)}
                  anchor={
                    <Button
                      mode="outlined"
                      icon="cog"
                      onPress={() => setMenuAberto(carro.id)}
                      style={styles.botaoStatus}
                    >
                      Alterar Status
                    </Button>
                  }
                >
                  <Menu.Item
                    leadingIcon="check-circle"
                    onPress={() => handleAlterarStatus(carro.id, 'disponivel', carro.modelo)}
                    title="Disponível"
                    disabled={carro.status === 'disponivel'}
                  />
                  <Menu.Item
                    leadingIcon="wrench"
                    onPress={() => handleAlterarStatus(carro.id, 'manutencao', carro.modelo)}
                    title="Em Manutenção"
                    disabled={carro.status === 'manutencao'}
                  />
                </Menu>
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
  resumoCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 4,
  },
  resumoTitulo: {
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  resumoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  resumoItem: {
    alignItems: 'center',
  },
  resumoNumero: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  resumoLabel: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
  filtroCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    elevation: 2,
  },
  filtroTitulo: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  filtroRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 4,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  carroCard: {
    marginBottom: 12,
    elevation: 4,
  },
  carroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  carroInfo: {
    flex: 1,
  },
  carroModelo: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusChip: {
    marginLeft: 8,
  },
  statusChipText: {
    color: 'white',
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 12,
  },
  locacaoInfo: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  locacaoLabel: {
    marginBottom: 4,
  },
  botaoStatus: {
    marginTop: 8,
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