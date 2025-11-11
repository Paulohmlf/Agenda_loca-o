import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Card, Divider, List, Text } from 'react-native-paper';

export default function MaisScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.titulo}>
            📋 Menu
          </Text>
          
          <Text variant="titleSmall" style={styles.secaoTitulo}>
            GESTÃO
          </Text>

          <List.Item
            title="Status da Frota"
            description="Ver todos os carros e seus status"
            left={props => <List.Icon {...props} icon="car-multiple" color="#6200ee" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push('/frota')}
            style={styles.listItem}
          />

          <List.Item
            title="Histórico de Locações"
            description="Ver todas as locações finalizadas"
            left={props => <List.Icon {...props} icon="history" color="#6200ee" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push('/historico')}
            style={styles.listItem}
          />

          {/* O item "Agenda Mensal" foi removido daqui */}

          <Divider style={styles.divider} />

          <Text variant="titleSmall" style={styles.secaoTitulo}>
            CONFIGURAÇÕES
          </Text>

          <List.Item
            title="Notificações e Lembretes"
            description="Configurar notificações diárias"
            left={props => <List.Icon {...props} icon="bell" color="#6200ee" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push('/configuracoes')}
            style={styles.listItem}
          />

          <Divider style={styles.divider} />

          <Text variant="bodySmall" style={styles.versao}>
            Versão 1.0.0
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    marginTop: 16,
    elevation: 4,
  },
  titulo: {
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  secaoTitulo: {
    fontWeight: 'bold',
    color: '#757575',
    marginTop: 8,
    marginBottom: 8,
    marginLeft: 16,
  },
  listItem: {
    borderRadius: 8,
    marginVertical: 4,
    backgroundColor: '#fff',
    elevation: 1,
  },
  divider: {
    marginVertical: 16,
  },
  versao: {
    textAlign: 'center',
    color: '#757575',
    marginTop: 16,
  },
});