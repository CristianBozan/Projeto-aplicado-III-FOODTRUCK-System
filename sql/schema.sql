-- ============================================================
-- Food Truck System v3.1 — Schema completo do banco de dados
-- Equipe 10 · Projeto Aplicado III · SENAI SC
--
-- Como usar no Railway:
--   1. Acesse o MySQL do Railway via "Connect" no painel do banco
--   2. Cole este script no Query Editor ou importe via CLI:
--      mysql -h HOST -P PORT -u USER -p DATABASE < schema.sql
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';

-- ------------------------------------------------------------
-- 1. atendentes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `atendentes` (
  `id_atendente` INT          NOT NULL AUTO_INCREMENT,
  `nome`         VARCHAR(255) NOT NULL,
  `cpf`          VARCHAR(11)  NOT NULL,
  `telefone`     VARCHAR(255) DEFAULT NULL,
  `login`        VARCHAR(255) NOT NULL,
  `senha`        VARCHAR(255) NOT NULL,
  `tipo_usuario` ENUM('gerente','atendente') NOT NULL DEFAULT 'atendente',
  PRIMARY KEY (`id_atendente`),
  UNIQUE KEY `uq_atendentes_cpf`   (`cpf`),
  UNIQUE KEY `uq_atendentes_login` (`login`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. mesas
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `mesas` (
  `id_mesa`     INT NOT NULL AUTO_INCREMENT,
  `numero_mesa` INT NOT NULL,
  `status`      ENUM('livre','ocupada') NOT NULL DEFAULT 'livre',
  PRIMARY KEY (`id_mesa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3. produtos
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `produtos` (
  `id_produto`         INT            NOT NULL AUTO_INCREMENT,
  `nome`               VARCHAR(255)   NOT NULL,
  `descricao`          TEXT           DEFAULT NULL,
  `preco`              DECIMAL(10,2)  NOT NULL,
  `foto`               VARCHAR(255)   DEFAULT NULL,
  `categoria`          VARCHAR(255)   DEFAULT NULL,
  `quantidade_estoque` INT            NOT NULL DEFAULT 0,
  `status`             ENUM('ativo','inativo') NOT NULL DEFAULT 'ativo',
  PRIMARY KEY (`id_produto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 4. pedidos
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pedidos` (
  `id_pedido`       INT           NOT NULL AUTO_INCREMENT,
  `data_hora`       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `id_atendente`    INT           DEFAULT NULL,
  `id_mesa`         INT           DEFAULT NULL,
  `forma_pagamento` ENUM('pix','credito','debito','dinheiro','mix') DEFAULT NULL,
  `status`          ENUM('aberto','finalizado','cancelado','pago') NOT NULL DEFAULT 'aberto',
  `observacoes`     TEXT          DEFAULT NULL,
  `total`           DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id_pedido`),
  KEY `fk_pedidos_atendente` (`id_atendente`),
  KEY `fk_pedidos_mesa`      (`id_mesa`),
  CONSTRAINT `fk_pedidos_atendente` FOREIGN KEY (`id_atendente`) REFERENCES `atendentes` (`id_atendente`) ON DELETE SET NULL,
  CONSTRAINT `fk_pedidos_mesa`      FOREIGN KEY (`id_mesa`)      REFERENCES `mesas`      (`id_mesa`)      ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 5. itens_pedido
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `itens_pedido` (
  `id_item`        INT           NOT NULL AUTO_INCREMENT,
  `id_pedido`      INT           NOT NULL,
  `id_produto`     INT           NOT NULL,
  `quantidade`     INT           NOT NULL,
  `preco_unitario` DECIMAL(10,2) NOT NULL,
  `subtotal`       DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`id_item`),
  KEY `fk_itens_pedido`   (`id_pedido`),
  KEY `fk_itens_produto`  (`id_produto`),
  CONSTRAINT `fk_itens_pedido`  FOREIGN KEY (`id_pedido`)  REFERENCES `pedidos`  (`id_pedido`) ON DELETE CASCADE,
  CONSTRAINT `fk_itens_produto` FOREIGN KEY (`id_produto`) REFERENCES `produtos` (`id_produto`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 6. vendas
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `vendas` (
  `id_venda`        INT           NOT NULL AUTO_INCREMENT,
  `id_pedido`       INT           NOT NULL,
  `data_hora`       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `valor_total`     DECIMAL(10,2) NOT NULL,
  `forma_pagamento` ENUM('pix','credito','debito','dinheiro','mix') NOT NULL,
  PRIMARY KEY (`id_venda`),
  KEY `fk_vendas_pedido` (`id_pedido`),
  CONSTRAINT `fk_vendas_pedido` FOREIGN KEY (`id_pedido`) REFERENCES `pedidos` (`id_pedido`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 7. estoque_logs
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `estoque_logs` (
  `id_estoque_log`    INT      NOT NULL AUTO_INCREMENT,
  `id_produto`        INT      NOT NULL,
  `acao`              ENUM('create','update','delete') NOT NULL,
  `quantidade_anterior` INT    DEFAULT NULL,
  `quantidade_nova`   INT      DEFAULT NULL,
  `nota`              TEXT     DEFAULT NULL,
  `data_hora`         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_estoque_log`),
  KEY `fk_estoqueLog_produto` (`id_produto`),
  CONSTRAINT `fk_estoqueLog_produto` FOREIGN KEY (`id_produto`) REFERENCES `produtos` (`id_produto`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 8. sincronizacoes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sincronizacoes` (
  `id_sync`      INT         NOT NULL AUTO_INCREMENT,
  `data_hora`    DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status`       VARCHAR(20) DEFAULT NULL,
  `id_atendente` INT         NOT NULL,
  `id_pedido`    INT         DEFAULT NULL,
  PRIMARY KEY (`id_sync`),
  KEY `fk_sync_atendente` (`id_atendente`),
  KEY `fk_sync_pedido`    (`id_pedido`),
  CONSTRAINT `fk_sync_atendente` FOREIGN KEY (`id_atendente`) REFERENCES `atendentes` (`id_atendente`) ON DELETE CASCADE,
  CONSTRAINT `fk_sync_pedido`    FOREIGN KEY (`id_pedido`)    REFERENCES `pedidos`    (`id_pedido`)    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 9. backups
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `backups` (
  `id_backup`    INT          NOT NULL AUTO_INCREMENT,
  `nome`         VARCHAR(255) NOT NULL,
  `conteudo_json` LONGTEXT    NOT NULL,
  `data_hora`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_backup`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- Dados iniciais — mesas de exemplo
-- (opcional: apague se preferir cadastrar pelo sistema)
-- ============================================================
INSERT IGNORE INTO `mesas` (`numero_mesa`, `status`) VALUES
  (1, 'livre'),
  (2, 'livre'),
  (3, 'livre'),
  (4, 'livre'),
  (5, 'livre');

-- ============================================================
-- FIM DO SCHEMA
-- ============================================================
