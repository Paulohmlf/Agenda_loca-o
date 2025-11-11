import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6200ee',
        headerShown: false,
      }}>
      {/* ABA 1 - AGENDA */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons 
              name="event" 
              size={28} 
              color={color} 
            />
          ),
        }}
      />

      {/* ABA 2 - FINANCEIRO */}
      <Tabs.Screen
        name="financeiro"
        options={{
          title: 'Financeiro',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons 
              name="attach-money" 
              size={28} 
              color={color} 
            />
          ),
        }}
      />

      {/* ABA 3 - NOVO (Menu de Ações) */}
      <Tabs.Screen
        name="novo"
        options={{
          title: 'Novo',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons 
              name={focused ? 'add-circle' : 'add-circle-outline'} 
              size={28} 
              color={color} 
            />
          ),
        }}
      />

      {/* ABA 4 - MAIS (Submenu) */}
      <Tabs.Screen
        name="mais"
        options={{
          title: 'Mais',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons 
              name="menu" 
              size={28} 
              color={color} 
            />
          ),
        }}
      />

      {/* TELAS ESCONDIDAS (não aparecem na barra) */}
      <Tabs.Screen
        name="locacao"
        options={{
          href: null,
          title: 'Locações',
        }}
      />

      <Tabs.Screen
        name="frota"
        options={{
          href: null,
          title: 'Frota',
        }}
      />

      <Tabs.Screen
        name="historico"
        options={{
          href: null,
          title: 'Histórico',
        }}
      />

      <Tabs.Screen
        name="cadastro"
        options={{
          href: null,
          title: 'Cadastro',
        }}
      />

      <Tabs.Screen
        name="configuracoes"
        options={{
          href: null,
          title: 'Configurações',
        }}
      />

      {/* NOVA TELA - AGENDA MENSAL */}
      <Tabs.Screen
        name="agendaMensal"
        options={{
          href: null,
          title: 'Agenda Mensal',
        }}
      />
    </Tabs>
  );
}
