import * as SQLite from 'expo-sqlite';

let db = null;

export const initDatabase = async () => {
  db = await SQLite.openDatabaseAsync('locacoes.db');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS carros (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      modelo TEXT NOT NULL,
      placa TEXT NOT NULL UNIQUE,
      status TEXT DEFAULT 'disponivel',
      valor_diaria REAL DEFAULT 0
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS locacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      carro_id INTEGER NOT NULL,
      cliente TEXT NOT NULL,
      numero_cliente TEXT,
      data_inicio TEXT NOT NULL,
      hora_inicio TEXT NOT NULL,
      data_fim TEXT NOT NULL,
      hora_fim TEXT NOT NULL,
      status TEXT DEFAULT 'ativa',
      valor_diaria REAL DEFAULT 0,
      quantidade_dias INTEGER DEFAULT 1,
      valor_total REAL DEFAULT 0,
      forma_pagamento TEXT,
      status_pagamento TEXT DEFAULT 'pendente',
      data_pagamento TEXT,
      FOREIGN KEY (carro_id) REFERENCES carros (id)
    );
  `);

  // Tenta adicionar as novas colunas caso a tabela já exista
  try {
    await db.execAsync(`ALTER TABLE carros ADD COLUMN valor_diaria REAL DEFAULT 0;`);
    console.log('✅ Coluna valor_diaria adicionada em carros');
  } catch (error) {
    console.log('ℹ️ Coluna valor_diaria já existe em carros');
  }
  
  try {
    await db.execAsync(`ALTER TABLE locacoes ADD COLUMN valor_recebido REAL;`);
    console.log('✅ Coluna valor_recebido adicionada');
  } catch (error) {
    console.log('ℹ️ Coluna valor_recebido já existe');
  }

  try {
    await db.execAsync(`ALTER TABLE locacoes ADD COLUMN valor_diaria REAL DEFAULT 0;`);
    await db.execAsync(`ALTER TABLE locacoes ADD COLUMN quantidade_dias INTEGER DEFAULT 1;`);
    await db.execAsync(`ALTER TABLE locacoes ADD COLUMN valor_total REAL DEFAULT 0;`);
    await db.execAsync(`ALTER TABLE locacoes ADD COLUMN forma_pagamento TEXT;`);
    await db.execAsync(`ALTER TABLE locacoes ADD COLUMN status_pagamento TEXT DEFAULT 'pendente';`);
    await db.execAsync(`ALTER TABLE locacoes ADD COLUMN data_pagamento TEXT;`);
    console.log('✅ Colunas financeiras adicionadas em locacoes');
  } catch (error) {
    console.log('ℹ️ Colunas financeiras já existem em locacoes');
  }

  console.log('✅ Banco de dados inicializado!');
  return db;
};

export const getDatabase = () => db;
