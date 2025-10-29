import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Card, List, Text } from 'react-native-paper';

export default function NovoScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.titulo}>
            ➕ O que deseja cadastrar?
          </Text>
          
          <List.Item
            title="Nova Locação"
            description="Cadastrar uma nova locação de veículo"
            left={props => <List.Icon {...props} icon="car-key" color="#6200ee" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push('/locacao')}
            style={styles.listItem}
          />

          <List.Item
            title="Cadastrar Carro"
            description="Adicionar um novo veículo à frota"
            left={props => <List.Icon {...props} icon="car-plus" color="#6200ee" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push('/cadastro')}
            style={styles.listItem}
          />
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
  listItem: {
    borderRadius: 8,
    marginVertical: 4,
    backgroundColor: '#fff',
    elevation: 1,
  },
});
