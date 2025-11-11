import { getDatabase } from './database';

// Atualizar função de inserir carro para incluir valor da diária
export const inserirCarro = async (modelo, placa, valorDiaria) => {
  const db = getDatabase();
  const result = await db.runAsync(
    'INSERT INTO carros (modelo, placa, valor_diaria) VALUES (?, ?, ?)',
    [modelo, placa, valorDiaria]
  );
  return result;
};

// Listar apenas carros disponíveis (não em manutenção)
export const listarCarros = async () => {
  const db = getDatabase();
  const carros = await db.getAllAsync(
    'SELECT * FROM carros WHERE status != "manutencao" ORDER BY modelo'
  );
  return carros;
};

// Calcular quantidade de dias entre duas datas
const calcularDias = (dataInicio, dataFim) => {
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);
  const diffTime = Math.abs(fim - inicio);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 0 ? 1 : diffDays; // Mínimo 1 dia
};

// Atualizar função de inserir locação com valores financeiros
export const inserirLocacao = async (carroId, cliente, numeroCliente, dataInicio, horaInicio, dataFim, horaFim) => {
  const db = getDatabase();
  
  // Buscar valor da diária do carro
  const carro = await db.getFirstAsync(
    'SELECT valor_diaria FROM carros WHERE id = ?',
    [carroId]
  );
  
  const valorDiaria = carro.valor_diaria || 0;
  const quantidadeDias = calcularDias(dataInicio, dataFim);
  const valorTotal = valorDiaria * quantidadeDias;
  
  const result = await db.runAsync(
    'INSERT INTO locacoes (carro_id, cliente, numero_cliente, data_inicio, hora_inicio, data_fim, hora_fim, valor_diaria, quantidade_dias, valor_total, status_pagamento) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [carroId, cliente, numeroCliente, dataInicio, horaInicio, dataFim, horaFim, valorDiaria, quantidadeDias, valorTotal, 'pendente']
  );
  
  await db.runAsync('UPDATE carros SET status = ? WHERE id = ?', ['alugado', carroId]);
  
  return result;
};

export const getAgendaDoDia = async (data) => {
  const db = getDatabase();
  const query = `
    SELECT 
      l.id,
      l.cliente,
      l.numero_cliente,
      l.data_inicio,
      l.hora_inicio,
      l.data_fim,
      l.hora_fim,
      l.status,
      l.valor_total,
      l.quantidade_dias,
      l.status_pagamento,
      l.forma_pagamento,
      c.modelo as carro,
      c.placa,
      CASE
        WHEN l.data_inicio = ? THEN 'Retirada'
        WHEN l.data_fim = ? THEN 'Devolução'
        ELSE 'Ativa'
      END as tipo_agendamento
    FROM locacoes l
    INNER JOIN carros c ON l.carro_id = c.id
    WHERE (l.data_inicio = ? OR l.data_fim = ?) AND l.status = 'ativa'
    ORDER BY l.hora_inicio
  `;
  const agenda = await db.getAllAsync(query, [data, data, data, data]);
  return agenda;
};

// NOVA FUNÇÃO: Buscar locações de um mês específico
export const getLocacoesDoMes = async (ano, mes) => {
  const db = getDatabase();
  
  // Formatar mês com zero à esquerda se necessário
  const mesFormatado = mes.toString().padStart(2, '0');
  const anoMesInicio = `${ano}-${mesFormatado}-01`;
  
  // Calcular último dia do mês
  const ultimoDia = new Date(ano, mes, 0).getDate();
  const anoMesFim = `${ano}-${mesFormatado}-${ultimoDia}`;
  
  const query = `
    SELECT 
      l.id,
      l.cliente,
      l.numero_cliente,
      l.data_inicio,
      l.hora_inicio,
      l.data_fim,
      l.hora_fim,
      l.status,
      l.valor_total,
      l.valor_recebido,
      l.quantidade_dias,
      l.status_pagamento,
      l.forma_pagamento,
      c.modelo as carro,
      c.placa
    FROM locacoes l
    INNER JOIN carros c ON l.carro_id = c.id
    WHERE (
      (l.data_inicio >= ? AND l.data_inicio <= ?) OR
      (l.data_fim >= ? AND l.data_fim <= ?) OR
      (l.data_inicio <= ? AND l.data_fim >= ?)
    )
    ORDER BY l.data_inicio, l.hora_inicio
  `;
  
  const locacoes = await db.getAllAsync(query, [
    anoMesInicio, anoMesFim,
    anoMesInicio, anoMesFim,
    anoMesInicio, anoMesFim
  ]);
  
  return locacoes;
};

export const getCarrosDisponiveis = async (data) => {
  const db = getDatabase();
  const query = `
    SELECT * FROM carros
    WHERE id NOT IN (
      SELECT carro_id FROM locacoes
      WHERE ? BETWEEN data_inicio AND data_fim
      AND status = 'ativa'
    )
    ORDER BY modelo
  `;
  const disponiveis = await db.getAllAsync(query, [data]);
  return disponiveis;
};

export const finalizarLocacao = async (locacaoId) => {
  const db = getDatabase();
  const locacao = await db.getFirstAsync(
    'SELECT carro_id FROM locacoes WHERE id = ?',
    [locacaoId]
  );
  await db.runAsync('UPDATE locacoes SET status = ? WHERE id = ?', ['finalizada', locacaoId]);
  
  // Verifica se o carro ainda tem OUTRAS locações ativas
  const outrasLocacoesAtivas = await db.getFirstAsync(
    'SELECT COUNT(*) as total FROM locacoes WHERE carro_id = ? AND status = "ativa"',
    [locacao.carro_id]
  );
  
  // Se não tiver nenhuma outra locação ativa, libera o carro
  if (outrasLocacoesAtivas.total === 0) {
    await db.runAsync('UPDATE carros SET status = ? WHERE id = ?', ['disponivel', locacao.carro_id]);
  }
};

// ===== FUNÇÕES PARA EDITAR E CANCELAR =====

// Atualizar locação existente
export const atualizarLocacao = async (locacaoId, cliente, numeroCliente, dataInicio, horaInicio, dataFim, horaFim) => {
  const db = getDatabase();
  
  // Buscar o carro da locação para recalcular valores
  const locacao = await db.getFirstAsync(
    'SELECT carro_id, valor_diaria FROM locacoes WHERE id = ?',
    [locacaoId]
  );
  
  const quantidadeDias = calcularDias(dataInicio, dataFim);
  const valorTotal = locacao.valor_diaria * quantidadeDias;
  
  const result = await db.runAsync(
    'UPDATE locacoes SET cliente = ?, numero_cliente = ?, data_inicio = ?, hora_inicio = ?, data_fim = ?, hora_fim = ?, quantidade_dias = ?, valor_total = ? WHERE id = ?',
    [cliente, numeroCliente, dataInicio, horaInicio, dataFim, horaFim, quantidadeDias, valorTotal, locacaoId]
  );
  
  return result;
};

// Cancelar locação (muda status para cancelada e libera o carro)
export const cancelarLocacao = async (locacaoId) => {
  const db = getDatabase();
  
  // Buscar o carro da locação
  const locacao = await db.getFirstAsync(
    'SELECT carro_id FROM locacoes WHERE id = ?',
    [locacaoId]
  );
  
  // Atualizar status da locação para 'cancelada'
  await db.runAsync('UPDATE locacoes SET status = ? WHERE id = ?', ['cancelada', locacaoId]);
  
  // Liberar o carro (se não houver outras locações ativas)
  const outrasLocacoesAtivas = await db.getFirstAsync(
    'SELECT COUNT(*) as total FROM locacoes WHERE carro_id = ? AND status = "ativa" AND id != ?',
    [locacao.carro_id, locacaoId]
  );
  
  if (outrasLocacoesAtivas.total === 0) {
    await db.runAsync('UPDATE carros SET status = ? WHERE id = ?', ['disponivel', locacao.carro_id]);
  }
};

// Buscar detalhes completos de uma locação
export const getLocacaoPorId = async (locacaoId) => {
  const db = getDatabase();
  const query = `
    SELECT 
      l.*,
      c.modelo as carro_modelo,
      c.placa as carro_placa
    FROM locacoes l
    INNER JOIN carros c ON l.carro_id = c.id
    WHERE l.id = ?
  `;
  const locacao = await db.getFirstAsync(query, [locacaoId]);
  return locacao;
};

// ===== FUNÇÕES PARA GERENCIAR STATUS DA FROTA =====

// Lista carros e JOIN com locações ativas
export const listarCarrosComStatus = async () => {
  const db = getDatabase();
  const query = `
    SELECT 
      c.id,
      c.modelo,
      c.placa,
      c.status,
      c.valor_diaria,
      l.id as locacao_id,
      l.cliente,
      l.data_fim,
      l.hora_fim
    FROM carros c
    LEFT JOIN locacoes l ON c.id = l.carro_id AND l.status = 'ativa'
    GROUP BY c.id
    ORDER BY c.modelo
  `;
  const carros = await db.getAllAsync(query);
  return carros;
};

// Atualizar status do carro manualmente (para manutenção, etc)
export const atualizarStatusCarro = async (carroId, novoStatus) => {
  const db = getDatabase();
  const result = await db.runAsync(
    'UPDATE carros SET status = ? WHERE id = ?',
    [novoStatus, carroId]
  );
  return result;
};

// *** NOVA FUNÇÃO ADICIONADA AQUI ***
// Função de "limpeza" para finalizar locações vencidas e pagas
export const atualizarLocacoesVencidasAutomaticamente = async () => {
  const db = getDatabase();
  const dataHoraAtualISO = new Date().toISOString();
  // Formato do banco é 'YYYY-MM-DD HH:MM'
  const dataHoraAtual = dataHoraAtualISO.replace('T', ' ').substring(0, 16);

  // 1. Encontra todas as locações que deveriam ser finalizadas
  //    (status 'ativa', pagamento 'pago' E data/hora de devolução já passou)
  const locacoesParaFinalizar = await db.getAllAsync(`
    SELECT id, carro_id 
    FROM locacoes 
    WHERE status = 'ativa' 
    AND status_pagamento = 'pago' 
    AND (data_fim || ' ' || hora_fim) < ?
  `, [dataHoraAtual]);

  if (locacoesParaFinalizar.length === 0) {
    // Nenhuma locação para atualizar
    return;
  }

  console.log(`Finalizando ${locacoesParaFinalizar.length} locações vencidas automaticamente...`);

  // 2. Faz um loop por cada locação encontrada
  for (const locacao of locacoesParaFinalizar) {
    
    // 3. Finaliza a locação (muda status para 'finalizada')
    await db.runAsync('UPDATE locacoes SET status = ? WHERE id = ?', ['finalizada', locacao.id]);

    // 4. Verifica se o carro desta locação ainda tem OUTRAS locações ativas
    const outrasLocacoesAtivas = await db.getFirstAsync(
      'SELECT COUNT(*) as total FROM locacoes WHERE carro_id = ? AND status = "ativa"',
      [locacao.carro_id]
    );

    // 5. Se não tiver nenhuma outra locação ativa, libera o carro (muda status para 'disponivel')
    if (outrasLocacoesAtivas.total === 0) {
      await db.runAsync('UPDATE carros SET status = ? WHERE id = ?', ['disponivel', locacao.carro_id]);
    }
  }
};


// ===== FUNÇÕES PARA HISTÓRICO DE LOCAÇÕES =====

// Buscar todas as locações (ativas, finalizadas e canceladas)
export const listarTodasLocacoes = async () => {
  const db = getDatabase();
  const query = `
    SELECT 
      l.id,
      l.cliente,
      l.numero_cliente,
      l.data_inicio,
      l.hora_inicio,
      l.data_fim,
      l.hora_fim,
      l.status,
      l.valor_total,
      l.valor_recebido,
      l.quantidade_dias,
      l.status_pagamento,
      l.forma_pagamento,
      l.data_pagamento,
      c.modelo as carro,
      c.placa
    FROM locacoes l
    INNER JOIN carros c ON l.carro_id = c.id
    ORDER BY l.data_inicio DESC, l.hora_inicio DESC
  `;
  const locacoes = await db.getAllAsync(query);
  return locacoes;
};

// Buscar locações por status
export const listarLocacoesPorStatus = async (status) => {
  const db = getDatabase();
  const query = `
    SELECT 
      l.id,
      l.cliente,
      l.numero_cliente,
      l.data_inicio,
      l.hora_inicio,
      l.data_fim,
      l.hora_fim,
      l.status,
      l.valor_total,
      l.valor_recebido,
      l.quantidade_dias,
      l.status_pagamento,
      c.modelo as carro,
      c.placa
    FROM locacoes l
    INNER JOIN carros c ON l.carro_id = c.id
    WHERE l.status = ?
    ORDER BY l.data_inicio DESC, l.hora_inicio DESC
  `;
  const locacoes = await db.getAllAsync(query, [status]);
  return locacoes;
};

// Buscar locações por período
export const listarLocacoesPorPeriodo = async (dataInicio, dataFim) => {
  const db = getDatabase();
  const query = `
    SELECT 
      l.id,
      l.cliente,
      l.numero_cliente,
      l.data_inicio,
      l.hora_inicio,
      l.data_fim,
      l.hora_fim,
      l.status,
      l.valor_total,
      l.valor_recebido,
      l.quantidade_dias,
      l.status_pagamento,
      c.modelo as carro,
      c.placa
    FROM locacoes l
    INNER JOIN carros c ON l.carro_id = c.id
    WHERE l.data_inicio >= ? AND l.data_fim <= ?
    ORDER BY l.data_inicio DESC, l.hora_inicio DESC
  `;
  const locacoes = await db.getAllAsync(query, [dataInicio, dataFim]);
  return locacoes;
};

// Buscar estatísticas gerais
export const getEstatisticasGerais = async () => {
  const db = getDatabase();
  
  const totalLocacoes = await db.getFirstAsync(
    'SELECT COUNT(*) as total FROM locacoes'
  );
  
  const locacoesAtivas = await db.getFirstAsync(
    'SELECT COUNT(*) as total FROM locacoes WHERE status = "ativa"'
  );
  
  const locacoesFinalizadas = await db.getFirstAsync(
    'SELECT COUNT(*) as total FROM locacoes WHERE status = "finalizada"'
  );
  
  const locacoesCanceladas = await db.getFirstAsync(
    'SELECT COUNT(*) as total FROM locacoes WHERE status = "cancelada"'
  );
  
  return {
    total: totalLocacoes.total,
    ativas: locacoesAtivas.total,
    finalizadas: locacoesFinalizadas.total,
    canceladas: locacoesCanceladas.total,
  };
};

// ===== FUNÇÕES FINANCEIRAS =====

// Registrar pagamento com valor recebido (pode ser diferente do valor total)
export const registrarPagamento = async (locacaoId, formaPagamento, valorRecebido) => {
  const db = getDatabase();
  const dataHoje = new Date().toISOString().split('T')[0];
  const result = await db.runAsync(
    'UPDATE locacoes SET status_pagamento = ?, forma_pagamento = ?, data_pagamento = ?, valor_recebido = ? WHERE id = ?',
    ['pago', formaPagamento, dataHoje, valorRecebido, locacaoId]
  );
  return result;
};

// Buscar estatísticas financeiras
export const getEstatisticasFinanceiras = async () => {
  const db = getDatabase();
  
  // Receita total (todas as locações pagas) - USAR VALOR RECEBIDO
  const receitaTotal = await db.getFirstAsync(
    'SELECT COALESCE(SUM(COALESCE(valor_recebido, valor_total)), 0) as total FROM locacoes WHERE status_pagamento = "pago"'
  );
  
  // Receita pendente - continua usando valor_total pois ainda não recebeu
  const receitaPendente = await db.getFirstAsync(
    'SELECT COALESCE(SUM(valor_total), 0) as total FROM locacoes WHERE status_pagamento = "pendente" AND status = "ativa"'
  );
  
  // Receita do mês atual - USAR VALOR RECEBIDO
  const mesAtual = new Date().toISOString().substring(0, 7); // YYYY-MM
  const receitaMesAtual = await db.getFirstAsync(
    'SELECT COALESCE(SUM(COALESCE(valor_recebido, valor_total)), 0) as total FROM locacoes WHERE status_pagamento = "pago" AND data_pagamento LIKE ?',
    [`${mesAtual}%`]
  );
  
  return {
    receitaTotal: receitaTotal.total,
    receitaPendente: receitaPendente.total,
    receitaMesAtual: receitaMesAtual.total,
  };
};