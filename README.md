# FoodTruck System

Resumo e documentação do backend Node/Express + Sequelize usado no projeto.

## Visão Geral
# Food Truck System

Este repositório contém a aplicação "Food Truck System", uma solução web para gestão de operações de um food truck — cadastro de produtos, gerenciamento de mesas, criação e acompanhamento de pedidos, registro de vendas, administração de atendentes, relatórios e um sistema de backup/restauração com exportação em Excel/JSON.

O objetivo deste README é documentar a arquitetura, tecnologias utilizadas, instruções de instalação e operação, e pontos relevantes para manutenção e implantação.

------------------------------------------------------------------------------

## Sumário

- Visão geral
- Tecnologias principais
- Pré-requisitos
- Instalação e execução
- Variáveis de ambiente
- Estrutura do projeto
- Modelos e tabelas principais
- Endpoints principais (resumo)
- Sistema de backup e restauração
- Recomendações de segurança e produção
- Testes e scripts úteis
- Como contribuir
- Licença

------------------------------------------------------------------------------

## Visão geral

Backend em Node.js com Express e Sequelize (MySQL) fornecendo uma API REST consumida por um frontend estático em `public/` (HTML/CSS/JavaScript). O servidor também disponibiliza um sistema de backup que registra snapshots no banco de dados, exporta arquivos Excel e permite restauração em modos configuráveis.

## Tecnologias principais

- Linguagem: JavaScript (Node.js)
- Framework HTTP: Express
- ORM: Sequelize (MySQL)
- Banco de dados: MySQL / MariaDB
- Agendamento: node-cron
- Exportação de planilhas: exceljs
- Ferramenta de desenvolvimento: nodemon (script `npm run dev`)

## Pré-requisitos

- Node.js (versão 18+ recomendada)
- npm
- Banco MySQL acessível com credenciais para o projeto
- (Opcional) Cliente HTTP para testes (curl, Postman)

## Instalação e execução

1. Instalar dependências:

```bash
npm install
```

2. Criar arquivo de configuração de ambiente (`.env`) na raiz do projeto (ver seção abaixo).

3. Executar em modo desenvolvimento:

```bash
npm run dev
```

O servidor por padrão inicia na porta 3000 (ver `src/app.js`). O frontend estático é servido pela mesma aplicação (pasta `public/`).

## Variáveis de ambiente

Crie um arquivo `.env` com as seguintes variáveis mínimas:

```env
DB_NAME=nome_do_banco
DB_USER=usuario_do_banco
DB_PASS=senha_do_banco
DB_HOST=localhost
DB_PORT=3306
DB_DIALECT=mysql
BACKUP_TOKEN=uma_chave_opcional_para_backups
```

- `BACKUP_TOKEN`: opcional; quando configurado, protege as rotas de backup/restore por um token simples (header `x-backup-token`, `Authorization: Bearer <token>` ou query `?token=`).

## Estrutura do projeto

Principais arquivos e diretórios:

- `src/app.js` — ponto de entrada do servidor, registra rotas e agenda backups.
- `src/config/database.js` — configuração da conexão Sequelize.
- `src/models/` — definições de models Sequelize (Produtos, Pedidos, Vendas, Backups, EstoqueLog, etc.).
- `src/controllers/` — lógica de controle por recurso (controllers exportam métodos async: `listar`, `buscarPorId`, `criar`, `atualizar`, `deletar`).
- `src/routes/` — definição das rotas HTTP por recurso.
- `src/middleware/requireBackupAuth.js` — middleware simples para proteger rotas de backup.
- `public/` — frontend estático (HTML, CSS, JS) que consome a API.

## Modelos e tabelas principais

- `produtos` (model `Produto`): `id_produto`, `nome`, `descricao`, `preco`, `quantidade_estoque`, `status`.
- `pedidos` (model `Pedido`) / `itens_pedido` (model `ItemPedido`): estrutura de pedidos e itens vinculados.
- `vendas` (model `Venda`): registro de pagamentos vinculados a pedidos.
- `backups` (model `Backup`): armazena snapshots em JSON no campo `conteudo_json` e metadados (`id_backup`, `nome`, `data_hora`).
- `estoque_logs` (model `EstoqueLog`): auditoria de alterações de estoque (criação/atualização).

## Endpoints principais (resumo)

Consulte `src/routes/` para detalhes e listas completas. Resumo comum:

- Produtos: `GET /produtos`, `GET /produtos/:id`, `POST /produtos`, `PUT /produtos/:id`, `DELETE /produtos/:id`.
- Pedidos: `GET /pedidos`, `GET /pedidos/:id`, `POST /pedidos` (aceita `itens` no payload), `PUT /pedidos/:id`, `DELETE /pedidos/:id`.
- Vendas: `GET /vendas`, `POST /vendas`.
- Relatórios: rotas sob `/relatorios` (ex.: `/relatorios/vendas-por-dia`, `/relatorios/vendas-por-pagamento`).
- Backups:
  - `POST /backups` — criar backup manual (body `{ nome?: string }`).
  - `GET /backups` — listar backups.
  - `GET /backups/:id` — visualizar backup.
  - `GET /backups/:id/download` — baixar JSON do backup.
  - `GET /backups/:id/excel` — gerar e baixar arquivo `.xlsx` com folhas organizadas.
  - `POST /backups/:id/restore` — restaurar backup (body `{ mode: 'safe' | 'force' }`).

## Sistema de backup e restauração

- Backups são snapshots que incluem vendas, pedidos (com itens) e produtos; o snapshot é serializado em JSON e armazenado na tabela `backups`.
- Backup automático diário: agendado via `node-cron` em `src/app.js` (configurado para 05:00 na timezone America/Sao_Paulo).
- Restauração:
  - `safe`: insere registros ausentes sem remover ou sobrescrever dados existentes; atualiza estoque apenas quando política permite (atual comportamento: atualizar quando estoque atual for zero).
  - `force`: operação destrutiva que remove pedidos/itens/vendas atuais e recria os registros a partir do snapshot; atualiza/cria produtos conforme o snapshot.
- Exportação Excel: endpoint gera um `.xlsx` com folhas organizadas para facilitar auditoria e análise.
- Segurança: quando `BACKUP_TOKEN` está configurado, as rotas de backup exigem o token; caso contrário, as rotas ficam acessíveis (modo permissivo para desenvolvimento).

## Recomendações para produção

- Substituir o middleware de token simples por um mecanismo de autenticação robusto (JWT, OAuth ou sessão com roles e permissões).
- Não usar `sequelize.sync()` em produção; adotar migrações controladas (`sequelize-cli` ou outra ferramenta de migração).
- Proteger backups e dados sensíveis: criptografia em repouso, controle de acesso e armazenamento seguro (ex.: S3 com criptografia e políticas de acesso).
- Armazenar senhas com hashing seguro (bcrypt/argon2) e nunca em texto plano.

## Testes e scripts úteis

- Existem scripts de utilidade em `scripts/` para testes manuais e cenários de integração (ex.: `test_create_pedido.js`, `test_pedido_venda.js`).
- Recomenda-se criar uma suíte de testes automatizados (unit e E2E) cobrindo fluxos críticos: criação de pedido, decremento de estoque, criação e restauração de backup.

## Como contribuir

1. Crie uma branch a partir de `main` para a sua modificação: `git checkout -b feature/nome-da-feature`.
2. Faça commits pequenos e atômicos com mensagens claras.
3. Abra um pull request descrevendo o objetivo da mudança e qualquer instrução para testes.

## Pontos de contato no código

- Entrypoint e rotas: `src/app.js`.
- Conexão com BD: `src/config/database.js`.
- Controllers de negócio: `src/controllers/*`.
- Models: `src/models/*`.
- Frontend estático: `public/`.
