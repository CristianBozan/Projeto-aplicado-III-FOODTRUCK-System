-- 1) Permitir id_mesa NULL
ALTER TABLE `pedidos`
  MODIFY COLUMN `id_mesa` INT NULL;

-- 2) Ajustar forma_pagamento para permitir NULL e garantir enum consistente
ALTER TABLE `pedidos`
  MODIFY COLUMN `forma_pagamento` ENUM('pix','credito','debito','dinheiro') NULL;

-- 3) Ajustar status ENUM para incluir cancelado e pago (definir default 'aberto')
ALTER TABLE `pedidos`
  MODIFY COLUMN `status` ENUM('aberto','finalizado','cancelado','pago') NOT NULL DEFAULT 'aberto';

-- Observações:
-- - MySQL exige redeclaração completa do ENUM para alterar sua lista. Se houver valores
--   inválidos já armazenados na coluna, o MODIFY pode falhar; nesse caso, execute um
--   SELECT DISTINCT status FROM pedidos; e me envie os valores para eu ajustar a enum.
-- - Se você preferir, eu posso gerar um ALTER que preserve quaisquer valores atuais
--   (i.e., incluir a lista existente + novos valores) — para isso cole aqui a saída
--   de: SHOW CREATE TABLE pedidos\G
