import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Divider, Text } from 'react-native-paper';

export default function ConfiguracoesScreen() {
  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.titulo}>
            ⚙️ Configurações do Aplicativo
          </Text>
          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.tituloSecao}>
              📱 Preferências Gerais
            </Text>
            <Text variant="bodySmall" style={styles.descricao}>
              Aqui serão mostradas informações gerais, preferências e funções auxiliares do app no futuro.
            </Text>
          </View>

          <Divider style={styles.dividerInterno} />

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.tituloSecao}>
              🗓️ Integração com Calendário
            </Text>
            <Text variant="bodySmall" style={styles.descricao}>
              A função de lembrete de calendário foi removida. Seu calendário Samsung continuará mostrando os eventos já existentes normalmente, mas nenhum novo lembrete será criado automaticamente.
            </Text>
          </View>

          <Divider style={styles.dividerInterno} />

          <Card style={styles.infoCard}>
            <Card.Content>
              <Text variant="titleSmall" style={styles.infoTitulo}>
                ℹ️ Sobre o aplicativo
              </Text>
              <Text variant="bodySmall">
                • Desenvolvido para controle de locações e agenda diária.{"\n"}
                • Dados armazenados localmente para máxima segurança.{"\n"}
                • Compatível com Android e integração futura via web.
              </Text>
            </Card.Content>
          </Card>
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
    marginBottom: 32,
  },
  titulo: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  divider: {
    marginBottom: 24,
  },
  dividerInterno: {
    marginVertical: 16,
  },
  section: {
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  tituloSecao: {
    marginBottom: 8,
  },
  descricao: {
    color: '#666',
  },
  infoCard: {
    marginTop: 24,
    backgroundColor: '#E3F2FD',
    elevation: 0,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  infoTitulo: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1E88E5',
  },
});
