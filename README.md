# FoodTruck System

Resumo e documentação do backend Node/Express + Sequelize usado no projeto.

## Visão Geral

- Backend: Node.js + Express (entrypoint: `src/app.js`).
- ORM: Sequelize com MySQL (`src/config/database.js`).
- Frontend estático: `public/` (HTML/CSS/JS).

O projeto oferece endpoints REST para `produtos`, `pedidos`, `vendas`, `mesas`, `atendentes` e um sistema de backup/restore com exportação Excel/JSON.

## Stack

- Node.js
- Express
- Sequelize (MySQL)
- exceljs (exportar .xlsx)
- node-cron (agendamento de backups)

## Instalação e execução (desenvolvimento)

1. Instale dependências:

```cmd
npm install
```

2. Crie um arquivo `.env` com variáveis de ambiente mínimas (exemplo):

```text
DB_NAME=seu_banco
DB_USER=usuario
DB_PASS=senha
DB_HOST=localhost
DB_PORT=3306
DB_DIALECT=mysql
BACKUP_TOKEN=<token-secreto-para-backups>
```

3. Inicie em modo dev (nodemon):

```cmd
npm run dev
```

Observação: o projeto usa `sequelize.sync()` no startup para sincronizar tabelas — em produção prefira migrações.

## Convenções importantes

- Módulos CommonJS (`require`, `module.exports`).
- Campos PK em models usam snake_case (ex.: `id_produto`, `id_pedido`).
- Controllers seguem padrão de métodos async: `listar`, `buscarPorId`, `criar`, `atualizar`, `deletar`.
- Error handling simples: controllers retornam 500 com `err.message`.

## Estrutura relevante

- `src/app.js` — entrypoint do servidor e registro de rotas.
- `src/config/database.js` — configuração do Sequelize.
- `src/models/` — models Sequelize (ex.: `Produto.js`, `Pedido.js`, `Venda.js`, `EstoqueLog.js`, `Backup.js`).
- `src/controllers/` — controllers por recurso (ex.: `backupController.js`).
- `src/routes/` — rotas por recurso.
- `public/` — frontend estático e scripts de UI.


## Banco de dados / Models importantes

- `produtos` (model `Produto`) — campos: `id_produto`, `nome`, `preco`, `quantidade_estoque`, etc.
- `pedidos` / `itens_pedido` (models `Pedido` / `ItemPedido`) — pedidos com seus itens.
- `vendas` (model `Venda`) — registra pagamentos.
- `backups` (model `Backup`) — armazena `conteudo_json` com snapshot.
- `estoque_logs` (model `EstoqueLog`) — auditoria de mudanças de estoque: `id_estoque_log`, `id_produto`, `acao`, `quantidade_anterior`, `quantidade_nova`, `nota`, `data_hora`.

## Sistema de Backup

Funcionalidades:

- Backup automático diário agendado com `node-cron` (configurado para rodar às `05:00` — fuso/ajuste no `src/app.js`).
- Backup manual via endpoint `POST /backups`.
- Backups são armazenados na tabela `backups` como JSON (`conteudo_json`) e contêm: `vendas`, `pedidos` (com `itens`), `produtos` (snapshot) e `vendasPorDia`.
- Download JSON: `GET /backups/:id/download`.
- Exportar Excel: `GET /backups/:id/excel` (contém abas `Vendas`, `Pedidos`, `Itens`, `VendasPorDia`, `Produtos`).
- Restauração: `POST /backups/:id/restore` com body `{ "mode": "safe" | "force" }`.

Políticas de restauração:

- `safe` (não-destrutivo): insere apenas registros ausentes; para estoques, atualiza o campo `quantidade_estoque` somente se o produto existir e o estoque atual for `0`.
- `force` (destrutivo): remove pedidos/itens/vendas atuais e recria tudo a partir do snapshot; também recria/atualiza produtos para refletir o snapshot (sobrescreve `quantidade_estoque`).

Auditoria de estoque:

- Durante o processo de restauração o sistema grava entradas em `estoque_logs` para cada criação/atualização de produto com os campos `quantidade_anterior`, `quantidade_nova`, `acao` (`create`/`update`) e `nota` (ex.: `restore safe` / `restore force - created`).
- A tabela é `estoque_logs`; você pode inspecionar com SQL:

```sql
SELECT * FROM estoque_logs ORDER BY data_hora DESC LIMIT 100;
```

Proteção dos endpoints de backup:

- As rotas de backup/restauração estão protegidas por um middleware simples que exige o `BACKUP_TOKEN` (via header `x-backup-token`, `Authorization: Bearer <token>` ou query param `?token=`). Configure `BACKUP_TOKEN` em `.env`.

Exemplos de uso (curl — Windows `cmd`):

```cmd
REM criar backup manual
curl -X POST http://localhost:3000/backups -H "Content-Type: application/json" -H "x-backup-token: <TOKEN>" -d "{\"nome\":\"BKP_TESTE\"}"

REM baixar json
curl -H "x-backup-token: <TOKEN>" http://localhost:3000/backups/1/download --output backup_1.json

REM baixar excel
curl -H "x-backup-token: <TOKEN>" http://localhost:3000/backups/1/excel --output backup_1.xlsx

REM restaurar (safe)
curl -X POST -H "Content-Type: application/json" -H "x-backup-token: <TOKEN>" -d "{\"mode\":\"safe\"}" http://localhost:3000/backups/1/restore

REM restaurar (force)
curl -X POST -H "Content-Type: application/json" -H "x-backup-token: <TOKEN>" -d "{\"mode\":\"force\"}" http://localhost:3000/backups/1/restore
```

## Endpoints Principais (resumo)

- `GET /produtos` — listar produtos
- `GET /produtos/:id` — buscar produto
- `POST /produtos` — criar produto
- `PUT /produtos/:id` — atualizar produto
- `DELETE /produtos/:id` — deletar produto

- `GET /pedidos` — listar pedidos
- `GET /pedidos/:id` — buscar pedido (com itens)
- `POST /pedidos` — criar pedido (aceita campo `itens` com array)

- `GET /vendas` e `POST /vendas`

- Backup:
  - `POST /backups` — criar backup manual
  - `GET /backups` — listar backups
  - `GET /backups/:id` — ver backup
  - `GET /backups/:id/download` — baixar JSON
  - `GET /backups/:id/excel` — baixar Excel (.xlsx)
  - `POST /backups/:id/restore` — restaurar backup (body: `{ mode: 'safe'|'force' }`)

Obs.: Ver arquivos em `src/routes/` para rotas completas e `src/controllers/` para implementação das regras.

## Testes e validações rápidas

- Sanity checklist sugerida após alterações:
  1. Reiniciar servidor: `npm run dev`.
  2. Criar backup manual: `POST /backups`.
  3. Baixar e inspecionar JSON: `GET /backups/:id/download`.
  4. Gerar Excel: `GET /backups/:id/excel`.
  5. Restaurar em `safe` e `force` e checar `estoque_logs`.

## Observações e próximos passos recomendados

- Em produção, substitua o middleware de token por um sistema de autenticação real (JWT + roles).
- Considere usar migrações (`sequelize-cli`) em vez de `sequelize.sync()` no startup.
- Adicionar endpoint para consultar `estoque_logs` via API (`/auditoria/estoque`) pode ser útil para acompanhamento operacional. Existe um TODO no projeto para isso.

## Pontos de contato no código

- Backup controller: `src/controllers/backupController.js`
- Middleware token: `src/middleware/requireBackupAuth.js`
- Models: `src/models/Backup.js`, `src/models/EstoqueLog.js`, `src/models/Produto.js`
- Frontend: `public/app.js`, `public/index.html` (UI de backup)

---

Se quiser, eu posso:

- (A) criar um branch e commitar todas as alterações agora,
- (B) executar os testes locais automatizados / sanity checks (requer seu OK para usar o token do `.env`),
- (C) adicionar o endpoint `/auditoria/estoque` para consultar logs via API.

Escolha uma opção ou peça as próximas ações que preferir.
# 🚚 Food Truck System - Sistema de Gestão Completo

Sistema completo de gerenciamento para Food Truck com interface web moderna e funcionalidades CRUD completas.

## 🎨 Identidade Visual
- **Cores principais:** Branco, Vermelho (#C41E3A) e Dourado (#DAA520)
- Interface moderna e responsiva
- Design intuitivo e profissional

## 🚀 Como Executar

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Banco de Dados
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
DB_NAME=foodtruck_db
DB_USER=seu_usuario
DB_PASS=sua_senha
DB_HOST=localhost
DB_PORT=3306
DB_DIALECT=mysql
```

### 3. Iniciar o Servidor

# 🚚 Food Truck System — Documentação (Atualizada)

Aplicação web para gestão de um Food Truck: cadastro de produtos, gerenciamento de mesas, criação e acompanhamento de pedidos, registro de vendas, gerenciamento de atendentes e geração de relatórios. Inclui sistema de backup automático e manual, geração de planilhas Excel e restauração com políticas configuráveis.

## Linguagem e por que foi escolhida

- Linguagem principal: JavaScript (Node.js no backend; JavaScript no frontend).
- Razões para usar Node.js/JavaScript:
	- Mesma linguagem na API e no frontend, reduzindo a curva de aprendizado e o número de tecnologias a manter.
	- Grande ecossistema (npm) com bibliotecas maduras — Sequelize (ORM), exceljs (geração de planilhas), node-cron (agendamento), etc.
	- Modelo não-bloqueante (event-driven) ideal para APIs I/O-bound e aplicações que fazem muitas consultas/leituras em banco e integração com arquivos.
	- Rápida prototipagem e grande comunidade de suporte.

## Principais funcionalidades

- CRUD completo para: Atendentes, Produtos, Mesas, Pedidos, Vendas.
- Dashboard com gráficos (faturamento por dia, vendas por forma de pagamento, por atendente).
- Criação atômica de pedidos com itens e ajuste de estoque dentro de transações.
- Sistema de Backup:
	- Backup automático diário às 05:00 (timezone America/Sao_Paulo) registrado na tabela `backups`.
	- Backup manual via botão `Gerar Backup` (cabeçalho esquerdo) que solicita um nome e grava snapshot.
	- Modal `Backups` (cabeçalho direito) lista backups e permite: baixar JSON, gerar/baixar Excel, visualizar e restaurar.

## Backup — detalhes técnicos

- Model: `src/models/Backup.js` com campos: `id_backup`, `nome`, `conteudo_json`, `data_hora`.
- Controller: `src/controllers/backupController.js` com métodos:
	- `createBackup(nome)` — monta snapshot (vendas, pedidos com itens, vendasPorDia) e grava JSON.
	- `criar` (POST /backups) — cria backup manual.
	- `listar` (GET /backups) — lista backups.
	- `buscarPorId` (GET /backups/:id) — visualiza backup.
	- `download` (GET /backups/:id/download) — baixa JSON.
	- `excel` (GET /backups/:id/excel) — gera `.xlsx` (sheets: Vendas, Pedidos, Itens, VendasPorDia).
	- `restore` (POST /backups/:id/restore) — restaura backup em modo `safe` ou `force`.

## Políticas de restauração

- SAFE (padrão): insere somente registros do backup que não existam (checagem por PK). Não altera nem remove dados existentes.
- FORCE (destrutivo): apaga `itens_pedido`, `vendas` e `pedidos` atuais e recria exatamente o conteúdo do backup.

_Observação_: a restauração atual não altera automaticamente o estoque dos produtos; se necessário podemos adicionar uma política para recalcular ou sobrescrever os valores de estoque.

## API (resumo)

- Atendentes: `/atendentes` (GET, POST, PUT, DELETE)
- Produtos: `/produtos` (GET, POST, PUT, DELETE)
- Mesas: `/mesas` (GET, POST, PUT, DELETE)
- Pedidos: `/pedidos` (GET, POST, PUT, DELETE)
- Vendas: `/vendas` (GET, POST, DELETE)
- Relatórios: `/relatorios/*` (ex.: `/relatorios/vendas-por-dia`)
- Backups:
	- `POST /backups` — criar backup manual (body: `{ nome?: string }`).
	- `GET /backups` — listar backups.
	- `GET /backups/:id` — visualizar backup JSON.
	- `GET /backups/:id/download` — baixar backup em JSON.
	- `GET /backups/:id/excel` — baixar relatório em Excel (.xlsx).
	- `POST /backups/:id/restore` — restaurar backup; body: `{ mode: 'safe'|'force' }`.

## Como executar (rápido)

1. Instalar dependências:
```bash
npm install
```
2. Criar `.env` com credenciais MySQL:
```env
DB_NAME=foodtruck_db
DB_USER=seu_usuario
DB_PASS=sua_senha
DB_HOST=localhost
DB_PORT=3306
DB_DIALECT=mysql
```
3. Rodar em desenvolvimento:
```bash
npm run dev
```
Abrir http://localhost:3000

## Dependências relevantes adicionadas

- `sequelize` + `mysql2` — ORM e driver MySQL
- `node-cron` — agendamento do backup diário
- `exceljs` — geração de planilhas `.xlsx`

## Notas de segurança e recomendações

- Proteja as rotas de backup/restore com autenticação (middleware). No momento essas rotas estão acessíveis sem autenticação no código — atenção em produção.
- Armazenamento de senhas: adotar hash (bcrypt) em vez de texto plano.
- Backups contêm dados sensíveis; considere criptografia/armazenamento seguro (S3 com criptografia ou disco protegido).

### Protegendo rotas de backup (opcional, recomendado)

Para ativar a proteção simples por token configure a variável de ambiente `BACKUP_TOKEN` no arquivo `.env` (por exemplo `BACKUP_TOKEN=uma-chave-secreta`). Quando `BACKUP_TOKEN` estiver definida, todas as rotas sob `/backups` exigirão esse token e retornarão 401 caso não seja informado.

O frontend pede o token ao usuário na primeira vez que executar uma operação de backup na sessão e o envia automaticamente nas requisições usando o header `x-backup-token`. Para downloads (arquivos .json/.xlsx) o frontend acrescenta `?token=<token>` à URL (já que anchors não suportam headers).

Exemplo `.env`:
```env
DB_NAME=foodtruck_db
DB_USER=seu_usuario
DB_PASS=sua_senha
DB_HOST=localhost
DB_PORT=3306
DB_DIALECT=mysql
BACKUP_TOKEN=uma-chave-secreta
```

## Testes e scripts úteis

- `scripts/test_preserve_atendente.js` — valida que o `id_atendente` é preservado ao finalizar pedido.
- Recomendo criar scripts adicionais para testes E2E cobrindo: criação de pedido com itens, verificação de decremento de estoque, criação/baixar/restore de backups.

## Possíveis melhorias futuras

- Adicionar autenticação/autorizações (JWT + roles).
- Registrar logs/auditoria para operações de backup/restore (quem, quando).
- Implementar restore do estoque e ajuste de sequências/autoincrement quando necessário.
- Adicionar paginação e filtros na listagem de backups no frontend.

## Licença

ISC

---

Se quiser, eu faço agora:
- Proteger as rotas de backup com um middleware simples (autenticação baseada em sessão/localStorage).
- Implementar restauração de estoque.
- Comitar estas alterações com mensagens claras.
>>>>>>> feature/backup-audit
