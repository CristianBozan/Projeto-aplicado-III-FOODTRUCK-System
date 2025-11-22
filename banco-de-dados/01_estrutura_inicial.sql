-- Seleciona o banco
USE sistema_pedidos;

-- =========================
-- Tabela Atendentes
-- =========================
CREATE TABLE IF NOT EXISTS atendentes (
  id_atendente INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  cpf CHAR(11) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  login VARCHAR(50) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  tipo_usuario ENUM('gerente','atendente') DEFAULT 'atendente',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- Tabela Mesas
-- =========================
CREATE TABLE IF NOT EXISTS mesas (
  id_mesa INT AUTO_INCREMENT PRIMARY KEY,
  numero_mesa INT NOT NULL,
  status ENUM('livre','ocupada') DEFAULT 'livre',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- Tabela Produtos
-- =========================
CREATE TABLE IF NOT EXISTS produtos (
  id_produto INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL,
  foto VARCHAR(255),
  categoria VARCHAR(50),
  quantidade_estoque INT DEFAULT 0,
  status ENUM('ativo','inativo') DEFAULT 'ativo',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- Tabela Pedidos
-- =========================
CREATE TABLE IF NOT EXISTS pedidos (
  id_pedido INT AUTO_INCREMENT PRIMARY KEY,
  data_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
  forma_pagamento ENUM('pix','credito','debito','dinheiro','mix'),
  status ENUM('aberto','finalizado','pago') DEFAULT 'aberto',
  observacoes TEXT,
  total DECIMAL(10,2) DEFAULT 0,
  id_mesa INT,
  id_atendente INT,
  FOREIGN KEY (id_mesa) REFERENCES mesas(id_mesa),
  FOREIGN KEY (id_atendente) REFERENCES atendentes(id_atendente),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- Tabela Itens do Pedido
-- =========================
CREATE TABLE IF NOT EXISTS itens_pedido (
  id_item INT AUTO_INCREMENT PRIMARY KEY,
  quantidade INT NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  id_pedido INT,
  id_produto INT,
  FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido),
  FOREIGN KEY (id_produto) REFERENCES produtos(id_produto),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- Tabela Sincronizações
-- =========================
CREATE TABLE IF NOT EXISTS sincronizacoes (
  id_sync INT AUTO_INCREMENT PRIMARY KEY,
  data_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20),
  id_atendente INT,
  id_pedido INT,
  FOREIGN KEY (id_atendente) REFERENCES atendentes(id_atendente),
  FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- Tabela Vendas
-- =========================
CREATE TABLE IF NOT EXISTS vendas (
  id_venda INT AUTO_INCREMENT PRIMARY KEY,
  id_pedido INT UNIQUE,
  id_atendente INT,
  id_sync INT,
  data_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
  forma_pagamento ENUM('pix','credito','debito','dinheiro','mix'),
  valor_total DECIMAL(10,2),
  valor_pago DECIMAL(10,2),
  troco DECIMAL(10,2),
  status ENUM('confirmada','pendente','estornada') DEFAULT 'pendente',
  comprovante VARCHAR(255),
  observacoes TEXT,
  FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido),
  FOREIGN KEY (id_atendente) REFERENCES atendentes(id_atendente),
  FOREIGN KEY (id_sync) REFERENCES sincronizacoes(id_sync),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
