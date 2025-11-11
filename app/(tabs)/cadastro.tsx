import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Vibration, View } from 'react-native';
import {
  Button,
  Card,
  Divider,
  HelperText,
  Surface,
  Text,
  TextInput,
} from 'react-native-paper';
import { useCarrosContext } from '../../src/context/CarrosContext';
import { inserirCarro } from '../../src/database/queries';

export default function CadastroScreen() {
  const [modelo, setModelo] = useState('');
  const [placa, setPlaca] = useState('');
  const [valorDiaria, setValorDiaria] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setRefreshCarros } = useCarrosContext();

  // Estados de validação
  const [modeloError, setModeloError] = useState(false);
  const [placaError, setPlacaError] = useState(false);
  const [valorError, setValorError] = useState(false);

  const validarFormulario = () => {
    let valido = true;

    if (!modelo.trim()) {
      setModeloError(true);
      valido = false;
    } else {
      setModeloError(false);
    }

    if (!placa.trim()) {
      setPlacaError(true);
      valido = false;
    } else {
      setPlacaError(false);
    }

    if (!valorDiaria.trim()) {
      setValorError(true);
      valido = false;
    } else {
      const valorNum = parseFloat(valorDiaria.replace(',', '.'));
      if (isNaN(valorNum) || valorNum <= 0) {
        setValorError(true);
        valido = false;
      } else {
        setValorError(false);
      }
    }

    return valido;
  };

  const formatarPlaca = (texto: string) => {
    // Remove caracteres não alfanuméricos e converte para maiúsculas
    return texto.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  };

  const handleCadastrar = async () => {
    if (!validarFormulario()) {
      Vibration.vibrate([0, 100, 50, 100]);
      Alert.alert(
        '⚠️ Preencha Todos os Campos',
        'Por favor, verifique:\n\n• Modelo do veículo\n• Placa do veículo\n• Valor da diária (maior que zero)',
        [{ text: 'Entendi', style: 'default' }]
      );
      return;
    }

    const valorDiariaNum = parseFloat(valorDiaria.replace(',', '.'));

    // Confirmação antes de cadastrar
    Alert.alert(
      '📋 Confirmar Cadastro',
      `Você está cadastrando:\n\n🚗 Modelo: ${modelo.trim()}\n📋 Placa: ${placa.toUpperCase().trim()}\n💰 Diária: R$ ${valorDiariaNum.toFixed(
        2
      )}\n\nDeseja confirmar?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim, Cadastrar',
          style: 'default',
          onPress: async () => {
            setLoading(true);
            try {
              await inserirCarro(modelo.trim(), placa.toUpperCase().trim(), valorDiariaNum);
              Vibration.vibrate(200);
              Alert.alert(
                '✅ Veículo Cadastrado!',
                `O veículo foi cadastrado com sucesso!\n\n🚗 ${modelo.trim()}\n📋 ${placa.toUpperCase().trim()}\n💰 R$ ${valorDiariaNum.toFixed(
                  2
                )}/dia\n\nAgora você pode criar locações com este veículo.`,
                [
                  {
                    text: 'Cadastrar Outro Veículo',
                    style: 'default',
                    onPress: () => {
                      setModelo('');
                      setPlaca('');
                      setValorDiaria('');
                    },
                  },
                  {
                    text: 'Ir Para Nova Locação',
                    style: 'default',
                    onPress: () => {
                      setModelo('');
                      setPlaca('');
                      setValorDiaria('');
                      setRefreshCarros(true);
                      router.push('/locacao');
                    },
                  },
                ]
              );
            } catch (error: any) {
              Vibration.vibrate([0, 100, 50, 100]);
              if (error.message.includes('UNIQUE constraint failed')) {
                Alert.alert(
                  '❌ Placa Já Cadastrada',
                  `A placa ${placa.toUpperCase().trim()} já está cadastrada no sistema.\n\nVerifique se o veículo já não foi cadastrado anteriormente.`,
                  [{ text: 'Entendi', style: 'default' }]
                );
              } else {
                Alert.alert(
                  '❌ Erro ao Cadastrar',
                  `Não foi possível cadastrar o veículo:\n\n${error.message}\n\nTente novamente.`,
                  [{ text: 'Entendi', style: 'default' }]
                );
              }
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Cabeçalho */}
      <Surface style={styles.headerCard} elevation={4}>
        <Text style={styles.titulo}>🚗 Cadastrar Novo Veículo</Text>
        <Text style={styles.subtitulo}>
          Preencha as informações do veículo para adicionar à sua frota
        </Text>
      </Surface>

      {/* Card do Formulário */}
      <Card style={styles.formCard}>
        <Card.Content>
          <Text style={styles.secaoTitulo}>📝 Informações do Veículo</Text>
          <Divider style={styles.dividerSecao} />

          {/* Campo Modelo */}
          <TextInput
            label="Modelo do Veículo (Obrigatório)"
            value={modelo}
            onChangeText={(text) => {
              setModelo(text);
              if (text.trim()) setModeloError(false);
            }}
            mode="outlined"
            error={modeloError}
            style={styles.input}
            placeholder="Ex: Fiat Uno, Civic, Corolla"
            left={<TextInput.Icon icon="car" />}
          />
          {modeloError && (
            <HelperText type="error" visible={modeloError} style={styles.helperText}>
              ⚠️ Digite o modelo do veículo
            </HelperText>
          )}

          {/* Campo Placa */}
          <TextInput
            label="Placa do Veículo (Obrigatório)"
            value={placa}
            onChangeText={(text) => {
              const placaFormatada = formatarPlaca(text);
              setPlaca(placaFormatada);
              if (placaFormatada.trim()) setPlacaError(false);
            }}
            mode="outlined"
            error={placaError}
            style={styles.input}
            placeholder="Ex: ABC1234 ou ABC1D23"
            maxLength={7}
            autoCapitalize="characters"
            left={<TextInput.Icon icon="card-text" />}
          />
          {placaError && (
            <HelperText type="error" visible={placaError} style={styles.helperText}>
              ⚠️ Digite a placa do veículo
            </HelperText>
          )}
          {placa.length > 0 && !placaError && (
            <HelperText type="info" visible style={styles.helperTextInfo}>
              ✓ Placa será salva como: {placa.toUpperCase()}
            </HelperText>
          )}

          {/* Campo Valor da Diária */}
          <TextInput
            label="Valor da Diária (Obrigatório)"
            value={valorDiaria}
            onChangeText={(text) => {
              setValorDiaria(text);
              if (text.trim()) {
                const valor = parseFloat(text.replace(',', '.'));
                if (!isNaN(valor) && valor > 0) {
                  setValorError(false);
                }
              }
            }}
            mode="outlined"
            error={valorError}
            style={styles.input}
            placeholder="Ex: 100.00 ou 100,50"
            keyboardType="decimal-pad"
            left={<TextInput.Icon icon="currency-brl" />}
          />
          {valorError && (
            <HelperText type="error" visible={valorError} style={styles.helperText}>
              ⚠️ Digite um valor válido maior que zero
            </HelperText>
          )}
          {valorDiaria.trim() && !valorError && (
            <HelperText type="info" visible style={styles.helperTextInfo}>
              ✓ Valor formatado: R$ {parseFloat(valorDiaria.replace(',', '.')).toFixed(2)}
            </HelperText>
          )}
        </Card.Content>
      </Card>

      {/* Preview do Cadastro */}
      {modelo.trim() && placa.trim() && valorDiaria.trim() && !valorError && (
        <Surface style={styles.previewCard} elevation={4}>
          <Text style={styles.previewTitulo}>👁️ Prévia do Cadastro</Text>
          <Divider style={styles.dividerPreview} />

          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>🚗 Modelo:</Text>
            <Text style={styles.previewValor}>{modelo.trim()}</Text>
          </View>

          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>📋 Placa:</Text>
            <Text style={styles.previewValor}>{placa.toUpperCase().trim()}</Text>
          </View>

          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>💰 Diária:</Text>
            <Text style={styles.previewValorDestaque}>
              R$ {parseFloat(valorDiaria.replace(',', '.')).toFixed(2)}
            </Text>
          </View>
        </Surface>
      )}

      {/* Botão de Cadastrar */}
      <Button
        mode="contained"
        icon="check-circle"
        loading={loading}
        disabled={loading}
        onPress={handleCadastrar}
        style={styles.botaoCadastrar}
        labelStyle={styles.botaoCadastrarLabel}
        contentStyle={styles.botaoCadastrarContent}>
        {loading ? 'Cadastrando...' : 'Cadastrar Veículo'}
      </Button>

      {/* Card de Dicas */}
      <Surface style={styles.infoCard} elevation={2}>
        <Text style={styles.infoTitulo}>💡 Dicas Importantes</Text>
        <Divider style={styles.dividerInfo} />
        <Text style={styles.infoTexto}>
          • Digite o modelo completo do veículo (marca e modelo){'\n\n'}
          • A placa será automaticamente convertida para maiúsculas{'\n\n'}
          • O valor da diária será usado para calcular o total das locações{'\n\n'}
          • Use ponto ou vírgula para separar os centavos (100.50 ou 100,50){'\n\n'}
          • Cada placa pode ser cadastrada apenas uma vez no sistema
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
    marginBottom: 20,
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
  formCard: {
    marginBottom: 20,
    elevation: 4,
  },
  secaoTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  dividerSecao: {
    marginBottom: 16,
    height: 2,
  },
  input: {
    marginBottom: 8,
    fontSize: 17,
  },
  helperText: {
    fontSize: 15,
    marginBottom: 12,
  },
  helperTextInfo: {
    fontSize: 15,
    marginBottom: 12,
    color: '#4CAF50',
  },
  previewCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  previewTitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  dividerPreview: {
    marginBottom: 16,
    height: 2,
    backgroundColor: '#64b5f6',
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewLabel: {
    fontSize: 18,
    color: '#0d47a1',
    fontWeight: '500',
  },
  previewValor: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1565c0',
  },
  previewValorDestaque: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  botaoCadastrar: {
    backgroundColor: '#4CAF50',
    marginBottom: 20,
  },
  botaoCadastrarLabel: {
    fontSize: 19,
    fontWeight: 'bold',
  },
  botaoCadastrarContent: {
    paddingVertical: 12,
  },
  infoCard: {
    backgroundColor: '#fff3e0',
    borderRadius: 12,
    padding: 20,
  },
  infoTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e65100',
    marginBottom: 8,
  },
  dividerInfo: {
    marginBottom: 16,
    height: 2,
    backgroundColor: '#ffb74d',
  },
  infoTexto: {
    fontSize: 16,
    color: '#e65100',
    lineHeight: 28,
  },
});
