import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Vibration, View } from 'react-native';
import { Card, Surface, Text } from 'react-native-paper';

export default function NovoScreen() {
  const router = useRouter();

  const handleNavigation = (route: string) => {
    Vibration.vibrate(50);
    router.push(route as any);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Cabeçalho */}
      <Surface style={styles.headerCard} elevation={4}>
        <Text style={styles.titulo}>➕ Novo Cadastro</Text>
        <Text style={styles.subtitulo}>
          Escolha abaixo o que você deseja cadastrar no sistema
        </Text>
      </Surface>

      {/* Card de Nova Locação */}
      <Card style={styles.actionCard} onPress={() => handleNavigation('/locacao')}>
        <Card.Content>
          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconEmoji}>📝</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitulo}>Nova Locação</Text>
              <Text style={styles.cardDescricao}>
                Cadastrar uma nova locação de veículo para um cliente
              </Text>
              <Text style={styles.cardDetalhe}>
                • Selecionar veículo{'\n'}
                • Informar dados do cliente{'\n'}
                • Definir período e valor
              </Text>
            </View>
            <View style={styles.arrowContainer}>
              <Text style={styles.arrow}>›</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Card de Novo Veículo */}
      <Card style={styles.actionCard} onPress={() => handleNavigation('/cadastro')}>
        <Card.Content>
          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconEmoji}>🚗</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitulo}>Novo Veículo</Text>
              <Text style={styles.cardDescricao}>
                Adicionar um novo veículo à frota disponível para locação
              </Text>
              <Text style={styles.cardDetalhe}>
                • Modelo do veículo{'\n'}
                • Placa{'\n'}
                • Valor da diária
              </Text>
            </View>
            <View style={styles.arrowContainer}>
              <Text style={styles.arrow}>›</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Alternativa: Botões Grandes (Comentado - Remova os Cards acima e descomente isso se preferir) */}
      {/* 
      <Button
        mode="contained"
        icon="file-document-edit"
        onPress={() => handleNavigation('/locacao')}
        style={styles.largeButton}
        labelStyle={styles.buttonLabel}
        contentStyle={styles.buttonContent}>
        📝 Nova Locação
      </Button>

      <Button
        mode="contained"
        icon="car-plus"
        onPress={() => handleNavigation('/cadastro')}
        style={styles.largeButton}
        labelStyle={styles.buttonLabel}
        contentStyle={styles.buttonContent}>
        🚗 Novo Veículo
      </Button>
      */}

      {/* Card Informativo */}
      <Surface style={styles.infoCard} elevation={2}>
        <Text style={styles.infoTitulo}>💡 Dica</Text>
        <Text style={styles.infoTexto}>
          Antes de cadastrar uma nova locação, certifique-se de que o veículo já está cadastrado
          na frota.
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
    marginBottom: 12,
    textAlign: 'center',
    color: '#333',
  },
  subtitulo: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    lineHeight: 26,
  },
  actionCard: {
    marginBottom: 20,
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
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconEmoji: {
    fontSize: 36,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  cardTitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cardDescricao: {
    fontSize: 17,
    color: '#666',
    marginBottom: 12,
    lineHeight: 24,
  },
  cardDetalhe: {
    fontSize: 15,
    color: '#999',
    lineHeight: 22,
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 32,
  },
  arrow: {
    fontSize: 48,
    color: '#6200ee',
    fontWeight: '300',
  },
  infoCard: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  infoTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 8,
  },
  infoTexto: {
    fontSize: 17,
    color: '#1b5e20',
    lineHeight: 24,
  },
  // Estilos alternativos para botões grandes (caso prefira)
  largeButton: {
    marginBottom: 20,
    backgroundColor: '#6200ee',
    borderRadius: 12,
    elevation: 4,
  },
  buttonLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  buttonContent: {
    paddingVertical: 20,
  },
});
