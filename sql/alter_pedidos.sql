-- ALTERS para tabela `pedidos`
-- Objetivo:
-- 1) Permitir que id_mesa aceite NULL (pedido para viagem)
-- 2) Garantir que forma_pagamento aceite NULL e contenha os valores esperados
-- 3) Garantir que status enum contenha: 'aberto','finalizado','cancelado','pago' e default 'aberto'

-- IMPORTANTE: sempre faça backup antes de alterar o schema.
-- BACKUP (Windows cmd):
-- mysqldump -u DB_USER -p -h DB_HOST -P DB_PORT DB_NAME > backup_db.sql

-- Verifique o esquema atual antes de aplicar (copie o resultado e revise):
-- SHOW CREATE TABLE pedidos\G

-- Se o SHOW CREATE TABLE mostrar valores adicionais no ENUM (valores não esperados),
-- ajuste a lista abaixo para incluir todos os valores existentes e os novos desejados.

-- ======================================================================
-- 1) Permitir id_mesa NULL
ALTER TABLE `pedidos`
  MODIFY COLUMN `id_mesa` INT NULL;

-- 2) Ajustar forma_pagamento para permitir NULL e garantir enum consistente
ALTER TABLE `pedidos`
  MODIFY COLUMN `forma_pagamento` ENUM('pix','credito','debito','dinheiro') NULL;

-- 3) Ajustar status ENUM para incluir cancelado e pago (definir default 'aberto')
ALTER TABLE `pedidos`
  MODIFY COLUMN `status` ENUM('aberto','finalizado','cancelado','pago') NOT NULL DEFAULT 'aberto';

-- ======================================================================
-- Como aplicar (Windows cmd):
-- 1) Faça backup (exemplo):
--    mysqldump -u DB_USER -p -h DB_HOST -P DB_PORT DB_NAME > backup_db.sql
-- 2) Salve este arquivo como alter_pedidos.sql
-- 3) Execute:
--    mysql -u DB_USER -p -h DB_HOST -P DB_PORT DB_NAME < alter_pedidos.sql

-- Substitua DB_USER, DB_HOST, DB_PORT, DB_NAME pelos valores do seu ambiente
-- ou use as credenciais contidas no seu .env (execute manualmente no terminal).

-- Observações:
-- - MySQL exige redeclaração completa do ENUM para alterar sua lista. Se houver valores
--   inválidos já armazenados na coluna, o MODIFY pode falhar; nesse caso, execute um
--   SELECT DISTINCT status FROM pedidos; e me envie os valores para eu ajustar a enum.
-- - Se você preferir, eu posso gerar um ALTER que preserve quaisquer valores atuais
--   (i.e., incluir a lista existente + novos valores) — para isso cole aqui a saída
--   de: SHOW CREATE TABLE pedidos\G
