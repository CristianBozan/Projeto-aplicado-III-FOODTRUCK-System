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
- **Super Admin** — acesso irrestrito a todas as funcionalidades e configurações do sistema.
- **Gerente (Proprietário)** — acesso gerencial completo: produtos, atendentes, relatórios, backups e operações.
- **Atendente** — acesso operacional: pedidos, mesas e consultas de produtos.

**Principais capacidades:**
- Cadastro e manutenção de **produtos** com controle de estoque integrado.
- Abertura, edição e **cancelamento** de **pedidos** vinculados a mesas e atendentes.
- Registro de **vendas** com formas de pagamento (Pix, crédito, débito, dinheiro).
- Acompanhamento de **estoque** com auditoria de alterações.
- Emissão de **relatórios** gerenciais com filtro de período (hoje, semana, mês, personalizado).
- **Backups** automáticos diários e manuais com exportação em JSON e Excel.
- **Autenticação JWT** com controle de acesso por papel (admin, gerente, atendente).
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
| RF09 | Autenticação de Usuários | Login com JWT para três níveis de acesso: admin, gerente e atendente. |
| RF10 | Cancelamento de Pedidos | Pedidos cancelados mantêm o histórico com status "cancelado" (sem exclusão). |
| RF11 | Edição de Perfil | Usuário pode alterar nome, login e senha diretamente no cabeçalho. |

---

## 4. Principais Funcionalidades

### 4.1 Autenticação e Controle de Acesso (JWT)

- Login com usuário e senha via tela dedicada (`login.html`).
- Token JWT gerado no login e armazenado no `localStorage`, enviado automaticamente em todas as requisições via header `Authorization: Bearer <token>`.
- Três níveis de acesso configuráveis via `.env`:
  - **Super Admin** (`superadmin` / `super123`) — acesso irrestrito.
  - **Gerente** (`admin` / `admin123`) — acesso gerencial completo.
  - **Atendente** (`funcionario` / `func123`) — acesso operacional.
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
| `requireRole.js` | Restringe acesso por papel (`admin`, `gerente`, `atendente`). Retorna 403 se não autorizado. |
| `requireBackupAuth.js` | Proteção adicional de backups via token estático (`BACKUP_TOKEN`). |

### 5.4 Services

| Service | Função |
|---|---|
| `syncService.js` | Encapsula a lógica de backup e sincronização. Chamado pelo cron e pelos endpoints manuais. |

### 5.5 Controllers e Rotas

| Rota montada | Arquivo de rota | Acesso mínimo |
|---|---|---|
| `/auth` | `authRoutes.js` | Público |
| `/admin` | `adminRoutes.js` | gerente / admin |
| `/atendentes` | `atendenteRoutes.js` | GET: autenticado · POST/PUT/DELETE: gerente/admin |
| `/produtos` | `produtoRoutes.js` | GET: autenticado · POST/PUT/DELETE: gerente/admin |
| `/mesas` | `mesaRoutes.js` | GET/PUT: autenticado · POST/DELETE: gerente/admin |
| `/pedidos` | `pedidoRoutes.js` | Autenticado |
| `/itens-pedido` | `itemPedidoRoutes.js` | Autenticado |
| `/vendas` | `vendaRoutes.js` | GET/POST: autenticado · DELETE: gerente/admin |
| `/relatorios` | `relatorioRoutes.js` | gerente / admin |
| `/backups` | `backupRoutes.js` | gerente / admin |
| `/auditoria/estoque` | `auditoriaRoutes.js` | gerente / admin |
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

### Produtos

| Método | Rota | Acesso |
|---|---|---|
| GET | `/produtos` | Autenticado |
| GET | `/produtos/:id` | Autenticado |
| POST | `/produtos` | gerente / admin |
| PUT | `/produtos/:id` | gerente / admin |
| DELETE | `/produtos/:id` | gerente / admin |

### Pedidos

| Método | Rota | Acesso |
|---|---|---|
| GET | `/pedidos` | Autenticado |
| GET | `/pedidos/:id` | Autenticado |
| POST | `/pedidos` | Autenticado |
| PUT | `/pedidos/:id` | Autenticado |
| PATCH | `/pedidos/:id/status` | Autenticado |
| DELETE | `/pedidos/:id` | Autenticado |

### Atendentes

| Método | Rota | Acesso |
|---|---|---|
| GET | `/atendentes` | Autenticado |
| GET | `/atendentes/:id` | Autenticado |
| POST | `/atendentes` | gerente / admin |
| PUT | `/atendentes/:id` | gerente / admin |
| DELETE | `/atendentes/:id` | gerente / admin |

> Demais rotas seguem o mesmo padrão. Consulte `src/routes/` para a lista completa.

---

## 8. Como Executar o Projeto

### 8.1 Pré-requisitos

- Node.js v20 ou superior
- npm
- MySQL instalado e em execução

### 8.2 Configuração das Variáveis de Ambiente

Copie `.env.example` para `.env` e preencha com suas configurações:

```env
# Banco de Dados
DB_NAME=sistema_pedidos
DB_USER=root
DB_PASS=sua_senha
DB_HOST=localhost
DB_PORT=3306
DB_DIALECT=mysql

# Servidor
PORT=3000

# JWT
JWT_SECRET=troque_esta_chave_em_producao
JWT_EXPIRES=8h

# Credenciais — Super Admin (acesso irrestrito)
ADMIN_LOGIN=superadmin
ADMIN_SENHA=super123

# Credenciais — Gerente (acesso gerencial)
GERENTE_LOGIN=admin
GERENTE_SENHA=admin123

# Credenciais — Atendente (acesso operacional)
ATENDENTE_LOGIN=funcionario
ATENDENTE_SENHA=func123

# Token de proteção de backups (opcional)
BACKUP_TOKEN=foodtruck_backup_2026
```

### 8.3 Instalação de Dependências

```bash
npm install
```

### 8.4 Execução

**Desenvolvimento** (com recarregamento automático):
```bash
npm run dev
```

**Produção**:
```bash
npm start
```

O servidor iniciará na porta `3000`. Acesse: `http://localhost:3000`

### 8.5 Credenciais Padrão

| Papel | Usuário | Senha | Acesso |
|---|---|---|---|
| Super Admin | `superadmin` | `super123` | Irrestrito |
| Gerente | `admin` | `admin123` | Gerencial completo |
| Atendente | `funcionario` | `func123` | Operacional |

> **Importante:** Troque todas as credenciais e o `JWT_SECRET` antes de colocar em produção.

---

## 9. Considerações Finais

O projeto demonstra:

- Arquitetura em camadas (models, controllers, routes, middleware, services).
- Autenticação stateless com **JWT** e três níveis de acesso por papel.
- Segurança: senhas hasheadas com **bcryptjs**, campo `senha` nunca exposto nas respostas da API.
- ORM (Sequelize) com MySQL — hooks de modelo para hash automático de senhas.
- Configuração via `.env` com valores padrão para desenvolvimento.
- Separação clara entre **backend** (API REST) e **frontend** (páginas estáticas).
- Serviço desacoplado (`syncService`) para backup e sincronização.
- Funções avançadas para cenário real: backups automáticos, exportação Excel, auditoria de estoque.
- Interface responsiva (desktop, tablet e mobile) com sidebar recolhível e modais protegidos contra fechamento acidental.

Este README foi estruturado para facilitar a explicação da arquitetura, das decisões técnicas e do fluxo principal de uso do sistema em ambiente acadêmico e profissional.
