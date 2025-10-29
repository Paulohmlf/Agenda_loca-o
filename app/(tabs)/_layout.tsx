import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colorScheme === 'dark' ? '#BB86FC' : '#6200ee',
        headerShown: true,
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#121212' : '#6200ee',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#1E1E1E' : '#fff',
        },
      }}>
      
      {/* ABA 1 - AGENDA */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Agenda',
          headerTitle: 'Agenda de Hoje',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="event" size={size} color={color} />
          ),
        }}
      />

      {/* ABA 2 - FINANCEIRO */}
      <Tabs.Screen
        name="financeiro"
        options={{
          title: 'Financeiro',
          headerTitle: 'Controle Financeiro',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="attach-money" size={size} color={color} />
          ),
        }}
      />

      {/* ABA 3 - NOVO (Menu de Ações) */}
      <Tabs.Screen
        name="novo"
        options={{
          title: 'Novo',
          headerTitle: 'Cadastrar',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="add-circle" size={size + 8} color={color} />
          ),
        }}
      />

      {/* ABA 4 - MAIS (Submenu) */}
      <Tabs.Screen
        name="mais"
        options={{
          title: 'Mais',
          headerTitle: 'Menu',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="more-horiz" size={size} color={color} />
          ),
        }}
      />

      {/* TELAS ESCONDIDAS (não aparecem na barra) */}
      <Tabs.Screen
        name="locacao"
        options={{
          href: null, // Esconde da barra
        }}
      />
      <Tabs.Screen
        name="cadastro"
        options={{
          href: null, // Esconde da barra
        }}
      />
      <Tabs.Screen
        name="frota"
        options={{
          href: null, // Esconde da barra
        }}
      />
      <Tabs.Screen
        name="historico"
        options={{
          href: null, // Esconde da barra
        }}
      />
      <Tabs.Screen
        name="configuracoes"
        options={{
          href: null, // Esconde da barra
        }}
      />
    </Tabs>
  );
}
