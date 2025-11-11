import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Vibration, View } from 'react-native';
import { Card, Divider, Surface, Text } from 'react-native-paper';

export default function MaisScreen() {
  const router = useRouter();

  const handleNavigation = (route: string) => {
    Vibration.vibrate(50);
    router.push(route as any);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Cabeçalho */}
      <Surface style={styles.headerCard} elevation={4}>
        <Text style={styles.titulo}>📋 Menu</Text>
        <Text style={styles.subtitulo}>Acesse as funcionalidades adicionais do aplicativo</Text>
      </Surface>

      {/* Seção Gestão */}
      <View style={styles.section}>
        <Text style={styles.secaoTitulo}>GESTÃO</Text>
        <Divider style={styles.dividerSecao} />

        {/* Card Frota */}
        <Card style={styles.menuCard} onPress={() => handleNavigation('/frota')}>
          <Card.Content>
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <Text style={styles.iconEmoji}>🚗</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.cardTitulo}>Frota de Veículos</Text>
                <Text style={styles.cardDescricao}>
                  Visualize todos os veículos cadastrados, seu status atual e histórico de
                  locações
                </Text>
              </View>
              <View style={styles.arrowContainer}>
                <Text style={styles.arrow}>›</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Card Histórico */}
        <Card style={styles.menuCard} onPress={() => handleNavigation('/historico')}>
          <Card.Content>
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <Text style={styles.iconEmoji}>📜</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.cardTitulo}>Histórico de Locações</Text>
                <Text style={styles.cardDescricao}>
                  Consulte todas as locações realizadas, filtradas por status, data e cliente
                </Text>
              </View>
              <View style={styles.arrowContainer}>
                <Text style={styles.arrow}>›</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Seção Configurações */}
      <View style={styles.section}>
        <Text style={styles.secaoTitulo}>CONFIGURAÇÕES</Text>
        <Divider style={styles.dividerSecao} />

        {/* Card Configurações */}
        <Card style={styles.menuCard} onPress={() => handleNavigation('/configuracoes')}>
          <Card.Content>
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <Text style={styles.iconEmoji}>⚙️</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.cardTitulo}>Configurações do App</Text>
                <Text style={styles.cardDescricao}>
                  Ajuste preferências, visualize informações do aplicativo e gerencie dados
                </Text>
              </View>
              <View style={styles.arrowContainer}>
                <Text style={styles.arrow}>›</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Card de Informações */}
      <Surface style={styles.infoCard} elevation={3}>
        <View style={styles.infoHeader}>
          <Text style={styles.infoIcone}>ℹ️</Text>
          <Text style={styles.infoTitulo}>Sobre o Aplicativo</Text>
        </View>
        <Divider style={styles.dividerInfo} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📱 Nome:</Text>
          <Text style={styles.infoValor}>Agenda de Locação</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>🔢 Versão:</Text>
          <Text style={styles.infoValor}>1.0.0</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>💾 Armazenamento:</Text>
          <Text style={styles.infoValor}>Local (SQLite)</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>🔒 Segurança:</Text>
          <Text style={styles.infoValor}>Dados no dispositivo</Text>
        </View>
      </Surface>

      {/* Card de Ajuda */}
      <Surface style={styles.helpCard} elevation={2}>
        <Text style={styles.helpTitulo}>💡 Precisa de Ajuda?</Text>
        <Divider style={styles.dividerHelp} />
        <Text style={styles.helpTexto}>
          Este aplicativo foi desenvolvido para facilitar o gerenciamento de locações de
          veículos.
          {'\n\n'}
          <Text style={styles.helpDestaque}>Navegue pelas abas:</Text>
          {'\n'}• <Text style={styles.helpDestaque}>Agenda:</Text> Veja as locações do mês
          {'\n'}• <Text style={styles.helpDestaque}>Financeiro:</Text> Controle pagamentos
          {'\n'}• <Text style={styles.helpDestaque}>Novo:</Text> Cadastre veículos e locações
          {'\n'}• <Text style={styles.helpDestaque}>Mais:</Text> Acesse outras funcionalidades
        </Text>
      </Surface>
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
    marginBottom: 24,
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
  section: {
    marginBottom: 24,
  },
  secaoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  dividerSecao: {
    marginBottom: 16,
    height: 2,
    backgroundColor: '#e0e0e0',
  },
  menuCard: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
    elevation: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconEmoji: {
    fontSize: 32,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  cardTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  cardDescricao: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 32,
  },
  arrow: {
    fontSize: 40,
    color: '#6200ee',
    fontWeight: '300',
  },
  infoCard: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcone: {
    fontSize: 24,
    marginRight: 8,
  },
  infoTitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  dividerInfo: {
    marginBottom: 16,
    height: 2,
    backgroundColor: '#81c784',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 17,
    color: '#1b5e20',
    fontWeight: '500',
  },
  infoValor: {
    fontSize: 17,
    color: '#2e7d32',
    fontWeight: '600',
  },
  helpCard: {
    backgroundColor: '#fff3e0',
    borderRadius: 12,
    padding: 20,
  },
  helpTitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#e65100',
    marginBottom: 8,
  },
  dividerHelp: {
    marginBottom: 16,
    height: 2,
    backgroundColor: '#ffb74d',
  },
  helpTexto: {
    fontSize: 17,
    color: '#e65100',
    lineHeight: 28,
  },
  helpDestaque: {
    fontWeight: 'bold',
    color: '#bf360c',
  },
});
