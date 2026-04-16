# Food Truck System — v3.1

**Centro Universitário SENAI Santa Catarina**
Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas
Unidade Curricular: Projeto Aplicado III — Professor: Hugo Menezes Barra

**Equipe 10:**
Cristian Diego Bozan · Michel Ângelo da Silva Tuma · Rafael Claumann Bernardes · Guilherme Claumann

**Cliente:** Sr. Elpídio Castro Alvez dos Santos Sobrinho — Food Truck, Guaramirim/SC

---

Aplicação web cliente/servidor desenvolvida para digitalizar e otimizar a gestão de vendas, pedidos e estoque do food truck do Sr. Elpídio, substituindo o processo manual em papel por uma solução ágil, precisa e escalável. Desenvolvida como entrega do **Projeto Aplicado III** (Sprint 4 — MVP), seguindo boas práticas de desenvolvimento, metodologia ágil (Scrum) e os princípios da Indústria 4.0.

**Repositório:** https://github.com/CristianBozan/Projeto-aplicado-III-FOODTRUCK-System
**Quadro Trello:** https://trello.com/b/Dlf6QY99/projeto-aplicado-iii-sistema-food-truck
**SAGA SENAI:** https://plataforma.gpinovacao.senai.br/plataforma/demandas-da-industria/interna/10800

---

## Sumário

- [1. Visão Geral do Sistema](#1-visão-geral-do-sistema)
- [2. Tecnologias e Linguagens Utilizadas](#2-tecnologias-e-linguagens-utilizadas)
- [3. Requisitos Funcionais](#3-requisitos-funcionais)
- [4. Principais Funcionalidades](#4-principais-funcionalidades)
- [5. Arquitetura da Aplicação](#5-arquitetura-da-aplicação)
- [6. Estrutura de Pastas](#6-estrutura-de-pastas)
- [7. API REST — Endpoints](#7-api-rest--endpoints)
- [8. Como Executar o Projeto](#8-como-executar-o-projeto)
- [9. Considerações Finais](#9-considerações-finais)

---

## 1. Visão Geral do Sistema

O **Food Truck System v3.1** é uma solução web cliente/servidor voltada para o dia a dia do food truck do Sr. Elpídio, digitalizando o processo de atendimento que antes era realizado manualmente em papel.

**Problema resolvido:** registro manual de pedidos causava lentidão, erros de anotação, inconsistências nos valores e falta de controle de estoque e relatórios gerenciais.

**Níveis de acesso:**
- **Gerente (Proprietário)** — acesso gerencial completo: produtos, atendentes, relatórios, backups e operações.
- **Atendente** — acesso operacional: pedidos, mesas e consultas de produtos.

**Principais capacidades:**
- Cadastro e manutenção de **produtos** com controle de estoque integrado.
- Abertura, edição e **cancelamento** de **pedidos** vinculados a mesas e atendentes.
- Registro de **vendas** com formas de pagamento (Pix, crédito, débito, dinheiro).
- Acompanhamento de **estoque** com auditoria de alterações.
- Emissão de **relatórios** gerenciais com filtro de período (hoje, semana, mês, personalizado).
- **Backups** automáticos diários e manuais com exportação em JSON e Excel.
- **Autenticação JWT** com controle de acesso por papel (gerente, atendente).
- **Sincronização** de dados entre dispositivos dos atendentes e o computador administrador.
- **Sidebar recolhível** com estado persistido por usuário.
- **Perfil do usuário** editável: nome, login e senha diretamente no cabeçalho.

A aplicação utiliza uma API REST em Node.js (Express + Sequelize) e um frontend estático em HTML/CSS/JavaScript, todos rodando no mesmo servidor na porta `3000`.

---

## 2. Tecnologias e Linguagens Utilizadas

### 2.1 Linguagem Principal

- **JavaScript**
  - **Backend**: Node.js v20+
  - **Frontend**: JavaScript vanilla em páginas HTML estáticas

**Motivações da escolha:**
- Mesma linguagem no backend e no frontend, reduzindo a curva de aprendizado.
- Ecossistema rico de bibliotecas (npm) para banco de dados, ORM, agendamento, geração de planilhas etc.
- Modelo assíncrono e orientado a eventos do Node.js, adequado para aplicações web com muitas requisições I/O.

### 2.2 Frameworks e Bibliotecas

| Pacote | Versão | Uso |
|---|---|---|
| **express** | ^5.1.0 | Framework HTTP para API REST e servidor de arquivos estáticos |
| **sequelize** | ^6.37.7 | ORM para comunicação com MySQL |
| **mysql2** | ^3.15.3 | Driver MySQL utilizado pelo Sequelize |
| **jsonwebtoken** | ^9.0.3 | Geração e validação de tokens JWT para autenticação |
| **bcryptjs** | ^3.0.3 | Hash seguro de senhas dos atendentes |
| **exceljs** | ^4.4.0 | Geração de planilhas Excel (.xlsx) para exportação |
| **node-cron** | ^4.2.1 | Agendamento de tarefas (backups automáticos diários) |
| **dotenv** | ^17.2.3 | Leitura de variáveis de ambiente a partir do arquivo `.env` |
| **nodemon** | ^3.1.10 | Recarregamento automático em desenvolvimento |

---

## 3. Requisitos Funcionais

| ID | Requisito | Descrição |
|----|-----------|-----------|
| RF01 | Cadastro de Mesa | O sistema deve permitir o cadastro e gerenciamento de mesas. |
| RF02 | Seleção de Produtos | Cardápio completo com produtos organizados por categoria para seleção. |
| RF03 | Finalização de Pedido | Pedido finalizado é identificado automaticamente como "pago". |
| RF04 | Emissão de Pedidos | Emissão de pedidos associando clientes/mesas e itens, enviando à cozinha. |
| RF05 | Vendas | Tela de vendas contabilizando pedidos completos em ordem crescente. |
| RF06 | Inclusão de Produto | Cadastro, edição e atualização de produtos com foto, descrição, observações e preço. |
| RF07 | Cadastro de Atendentes | Registro de atendentes com nome, CPF e telefone. |
| RF08 | Sincronização de Dados | Atualização de dados entre dispositivos dos atendentes e o administrador. |
| RF09 | Autenticação de Usuários | Login com JWT para dois níveis de acesso: gerente e atendente. |
| RF10 | Cancelamento de Pedidos | Pedidos cancelados mantêm o histórico com status "cancelado" (sem exclusão). |
| RF11 | Edição de Perfil | Usuário pode alterar nome, login e senha diretamente no cabeçalho. |

---

## 4. Principais Funcionalidades

### 4.1 Autenticação e Controle de Acesso (JWT)

- Login com usuário e senha via tela dedicada (`login.html`).
- Token JWT gerado no login e armazenado no `localStorage`, enviado automaticamente em todas as requisições via header `Authorization: Bearer <token>`.
- Dois níveis de acesso:
  - **Gerente** — credenciais configuradas via variáveis de ambiente `GERENTE_LOGIN` e `GERENTE_SENHA` (padrão: `admin` / `foodtruck2026`).
  - **Atendente** — usuários criados pelo gerente via interface, com senhas armazenadas com hash bcryptjs no banco de dados.
- Logout limpa completamente o `localStorage` e `sessionStorage`, invalidando a sessão.
- Senhas dos atendentes armazenadas com **hash bcryptjs** (salt 10) — nunca salvas em texto plano.
- Campo `senha` nunca retornado nas respostas da API.

### 4.2 Gestão de Produtos

- Cadastro, edição, listagem e remoção de produtos (RF06).
- Campos: nome, descrição, preço, foto, categoria, quantidade em estoque e observações.
- Controle de estoque integrado: decremento automático ao criar pedidos com itens.

### 4.3 Gestão de Mesas e Atendentes

- Cadastro de **mesas** com liberação automática ao finalizar ou cancelar pedido (RF01).
- Cadastro de **atendentes** com nome, CPF, telefone e tipo de usuário (RF07).
- Senhas de atendentes hasheadas com bcryptjs ao criar ou atualizar.

### 4.4 Pedidos e Atendimento

- Abertura de pedidos vinculados a mesa, atendente e lista de itens (RF04).
- Interface de atendimento com cardápio por categoria, busca por nome e carrinho com scroll.
- Carrinho com controle de quantidade, subtotal em tempo real e campo de **desconto** (R$ fixo ou %).
- **Fluxo de status**: `aberto` → `finalizado` → `pago` / `cancelado`.
- **Cancelamento** via botão dedicado: status muda para `cancelado`, histórico preservado (RF10).
- **Finalização** com seleção de forma de pagamento: cria venda automaticamente e libera mesa.
- Endpoint **PATCH `/pedidos/:id/status`** para atualização dedicada de status.

### 4.5 Vendas

- Registro automático de vendas ao finalizar pedido com forma de pagamento (RF05).
- Tela de vendas exibindo pedidos em ordem crescente.
- Base para relatórios de faturamento.

### 4.6 Relatórios com Filtro de Período

- Consolidação de vendas por dia, por forma de pagamento e por atendente.
- Filtros de período: **hoje** (padrão), **semana**, **mês**, **personalizado**.
- Visualização com Chart.js e exportação em Excel (.xlsx).

### 4.7 Estoque e Auditoria

- Controle de quantidade em estoque dos produtos.
- Registro de alterações na tabela `EstoqueLog`: produto, quantidade anterior, nova, ação e data/hora.

### 4.8 Sincronização de Dados

- Atualização de dados entre dispositivos dos atendentes e o computador administrador (RF08).
- Rastreamento de sincronizações por atendente via tabela `Sincronizacao`.

### 4.9 Backup e Restauração

- **Backup manual**: endpoint sob demanda com nome personalizado.
- **Backup automático**: `syncService.backupAutomatico()` via `node-cron` diariamente às 05:00 (fuso `America/Sao_Paulo`).
- **Armazenamento**: tabela `backups` com snapshot JSON de vendas, pedidos, itens, produtos e resumos.
- **Exportação**: JSON bruto ou Excel (.xlsx) com múltiplas planilhas.
- **Restauração**:
  - Modo `safe`: insere apenas registros inexistentes, preservando dados atuais.
  - Modo `force`: recria os dados a partir do snapshot, sobrescrevendo o estado atual.

### 4.10 UX e Interface

- **Sidebar recolhível**: botão de colapso com estado persistido no `localStorage`.
- **Perfil do usuário**: clique no nome no cabeçalho abre modal para editar nome, login e senha (RF11).
- **Modais protegidos**: não fecham ao clicar fora da área — evita perda de dados não salvos.
- Interface responsiva (desktop, tablet e mobile) com layout sidebar + header fixo.

---

## 5. Arquitetura da Aplicação

### 5.1 Backend (API REST)

- **Entrypoint**: `src/app.js`
  - Configuração de middlewares globais (`express.json`, arquivos estáticos).
  - Registro de todas as rotas com proteção JWT via `requireAuth` e `requireRole`.
  - Backup automático diário delegado ao `syncService`.
  - Sincronização do banco com `sequelize.sync()` antes de iniciar o servidor.

### 5.2 Banco de Dados

- **Sequelize** configura a conexão com MySQL em `src/config/database.js` via variáveis de ambiente.
- Nomes de colunas em **snake_case** (ex: `id_produto`, `id_pedido`).
- Tabelas sem timestamps automáticos (`timestamps: false`) para compatibilidade com o banco existente.

### 5.3 Middlewares de Segurança

| Middleware | Função |
|---|---|
| `requireAuth.js` | Valida token JWT no header `Authorization: Bearer <token>`. Retorna 401 se ausente ou inválido. |
| `requireRole.js` | Restringe acesso por papel (`gerente`, `atendente`). Retorna 403 se não autorizado. |
| `requireBackupAuth.js` | Proteção adicional de backups via token estático (`BACKUP_TOKEN`). |

### 5.4 Services

| Service | Função |
|---|---|
| `syncService.js` | Encapsula a lógica de backup e sincronização. Chamado pelo cron e pelos endpoints manuais. |

### 5.5 Controllers e Rotas

| Rota montada | Arquivo de rota | Acesso mínimo |
|---|---|---|
| `/auth` | `authRoutes.js` | Público |
| `/admin` | `adminRoutes.js` | gerente |
| `/atendentes` | `atendenteRoutes.js` | GET: autenticado · POST/DELETE: gerente |
| `/produtos` | `produtoRoutes.js` | GET: autenticado · POST/PUT/DELETE: gerente |
| `/mesas` | `mesaRoutes.js` | GET/PUT: autenticado · POST/DELETE: gerente |
| `/pedidos` | `pedidoRoutes.js` | Autenticado |
| `/itens-pedido` | `itemPedidoRoutes.js` | Autenticado |
| `/vendas` | `vendaRoutes.js` | GET/POST: autenticado · DELETE: gerente |
| `/relatorios` | `relatorioRoutes.js` | gerente |
| `/backups` | `backupRoutes.js` | gerente |
| `/auditoria/estoque` | `auditoriaRoutes.js` | gerente |
| `/sincronizacoes` | `sincronizacaoRoutes.js` | Autenticado |

### 5.6 Frontend

- **`login.html`**: tela de login — armazena token JWT e dados do usuário no `localStorage` após autenticação.
- **`index.html`**: SPA principal com sidebar recolhível, header fixo com perfil do usuário e todas as seções.
- **`style.css`**: paleta vermelho/dourado/branco, responsivo para desktop, tablet e mobile.
- **`app.js`**: lógica principal — helper `authFetch` injeta header JWT em todas as requisições; renderização dinâmica de cards, tabelas, modais, filtros e carrinho.

---

## 6. Estrutura de Pastas

```text
projeto-aplicado-3/
├── README.md                   # Documentação principal do projeto
├── package.json                # Dependências e scripts npm
├── .env                        # Variáveis de ambiente (não versionar)
├── .env.example                # Modelo de variáveis de ambiente
├── sql/                        # Scripts SQL auxiliares
├── scripts/                    # Scripts Node.js de apoio e testes
│   └── seed-produtos.js        # Popula banco com cardápio e mesas
├── public/                     # Frontend estático
│   ├── index.html              # SPA principal (todas as seções)
│   ├── login.html              # Tela de login
│   ├── style.css               # Estilos globais
│   └── app.js                  # Lógica principal do frontend
└── src/                        # Código-fonte do backend
    ├── app.js                  # Entrypoint do servidor
    ├── config/
    │   └── database.js         # Configuração do Sequelize (MySQL)
    ├── middleware/
    │   ├── requireAuth.js      # Validação de token JWT
    │   ├── requireRole.js      # Controle de acesso por papel
    │   └── requireBackupAuth.js# Token de proteção de backups
    ├── services/
    │   └── syncService.js      # Lógica de backup e sincronização
    ├── controllers/
    │   ├── authController.js
    │   ├── adminController.js
    │   ├── atendenteController.js
    │   ├── produtoController.js
    │   ├── mesaController.js
    │   ├── pedidoController.js
    │   ├── itempedidoController.js
    │   ├── vendaController.js
    │   ├── relatorioController.js
    │   ├── backupController.js
    │   ├── auditoriaController.js
    │   └── sincronizacaoController.js
    ├── models/
    │   ├── Atendente.js        # Hash de senha via bcryptjs (hooks Sequelize)
    │   ├── Backup.js
    │   ├── EstoqueLog.js
    │   ├── ItemPedido.js
    │   ├── Mesa.js
    │   ├── Pedido.js
    │   ├── Produto.js
    │   ├── Sincronizacao.js
    │   └── Venda.js
    └── routes/
        ├── authRoutes.js
        ├── adminRoutes.js
        ├── atendenteRoutes.js
        ├── produtoRoutes.js
        ├── mesaRoutes.js
        ├── pedidoRoutes.js
        ├── itemPedidoRoutes.js
        ├── vendaRoutes.js
        ├── relatorioRoutes.js
        ├── backupRoutes.js
        ├── auditoriaRoutes.js
        └── sincronizacaoRoutes.js
```

---

## 7. API REST — Endpoints

### Autenticação (público)

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/login` | Autentica usuário e retorna token JWT |
| GET | `/auth/ping` | Health check da API |

### Produtos

| Método | Rota | Acesso |
|---|---|---|
| GET | `/produtos` | Autenticado |
| GET | `/produtos/:id` | Autenticado |
| POST | `/produtos` | gerente |
| PUT | `/produtos/:id` | gerente |
| DELETE | `/produtos/:id` | gerente |

### Pedidos

| Método | Rota | Acesso |
|---|---|---|
| GET | `/pedidos` | Autenticado |
| GET | `/pedidos/:id` | Autenticado |
| POST | `/pedidos` | Autenticado |
| PUT | `/pedidos/:id` | Autenticado |
| PATCH | `/pedidos/:id/status` | Autenticado |
| DELETE | `/pedidos/:id` | gerente |

### Itens de Pedido

| Método | Rota | Acesso |
|---|---|---|
| GET | `/itens-pedido` | Autenticado |
| POST | `/itens-pedido` | Autenticado |
| PUT | `/itens-pedido/:id` | Autenticado |
| DELETE | `/itens-pedido/:id` | Autenticado |

### Mesas

| Método | Rota | Acesso |
|---|---|---|
| GET | `/mesas` | Autenticado |
| POST | `/mesas` | gerente |
| PUT | `/mesas/:id` | Autenticado |
| DELETE | `/mesas/:id` | gerente |

### Atendentes

| Método | Rota | Acesso |
|---|---|---|
| GET | `/atendentes` | Autenticado |
| POST | `/atendentes` | gerente |
| PUT | `/atendentes/:id` | gerente / próprio atendente |
| DELETE | `/atendentes/:id` | gerente |

### Vendas / Relatórios / Backups

| Método | Rota | Acesso |
|---|---|---|
| GET | `/vendas` | Autenticado |
| GET | `/relatorios` | gerente |
| GET/POST | `/backups` | gerente |
| GET | `/auditoria/estoque` | gerente |
| GET | `/sincronizacoes` | Autenticado |

---

## 8. Como Executar o Projeto

### 8.1 Execução Local

**Pré-requisitos:** Node.js v20+, MySQL 8.0+

```bash
# 1. Clone o repositório
git clone https://github.com/CristianBozan/Projeto-aplicado-III-FOODTRUCK-System.git
cd Projeto-aplicado-III-FOODTRUCK-System

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais do MySQL

# 4. Inicie o servidor
npm start
# Ou em modo desenvolvimento (auto-reload):
npm run dev

# 5. Acesse em: http://localhost:3000
```

### 8.2 Variáveis de Ambiente (`.env`)

```env
# Banco de dados
DB_HOST=localhost
DB_PORT=3306
DB_NAME=foodtruck_db
DB_USER=root
DB_PASS=sua_senha

# Autenticação JWT
JWT_SECRET=sua_chave_secreta_jwt
GERENTE_LOGIN=admin
GERENTE_SENHA=foodtruck2026

# Backup
BACKUP_TOKEN=seu_token_backup
```

### 8.3 Deploy em Produção (Railway)

O projeto está hospedado no Railway com deploy automático a cada push na branch `main`.

- **URL pública:** https://projeto-aplicado-iii-foodtruck-system-production.up.railway.app
- **Banco:** MySQL fornecido pelo plugin Railway (variáveis `${{MySQL.*}}` injetadas automaticamente)
- **Deploy:** automático via GitHub — basta fazer `git push origin main`

### 8.4 Popular o Banco com Dados de Teste

Após o deploy ou localmente, execute o script de seed para criar o cardápio e as mesas:

```bash
# Para a Railway (produção):
node scripts/seed-produtos.js

# Para ambiente local:
BASE_URL=http://localhost:3000 node scripts/seed-produtos.js
```

O script cria automaticamente:
- 24 produtos organizados por categoria (Lanche, Bebida, Sobremesa, Porção)
- 10 mesas numeradas de 1 a 10

---

## 9. Considerações Finais

O **Food Truck System v3.1** representa a entrega do MVP do Projeto Aplicado III — Sprint 4. O sistema digitalizou completamente o processo de atendimento do food truck do Sr. Elpídio, substituindo o papel por uma interface web rápida e intuitiva.

**Destaques da v3.1:**
- Sidebar recolhível no desktop com estado persistido no `localStorage`
- Tela de login limpa, sem dicas de credenciais
- Script de seed para popular o banco com cardápio realista
- Deploy contínuo via Railway com MySQL integrado
- Estrutura de rotas robusta com controle de acesso granular por papel

**Próximos passos (backlog):**
- Impressão de comanda diretamente do sistema
- Dashboard com gráficos em tempo real
- Notificação sonora para novos pedidos
- PWA para uso offline pelos atendentes

---

*Projeto Aplicado III — Equipe 10 | Centro Universitário SENAI Santa Catarina | 2026*
