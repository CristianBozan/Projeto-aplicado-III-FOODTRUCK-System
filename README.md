# Food Truck System — v3.0

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
- [7. Como Executar o Projeto](#7-como-executar-o-projeto)
- [8. Considerações Finais](#8-considerações-finais)

---

## 1. Visão Geral do Sistema

O **Food Truck System v3.0** é uma solução web cliente/servidor voltada para o dia a dia do food truck do Sr. Elpídio, digitalindo o processo de atendimento que antes era realizado manualmente em papel.

**Problema resolvido:** registro manual de pedidos causava lentidão, erros de anotação, inconsistências nos valores e falta de controle de estoque e relatórios gerenciais.

**Atores do sistema:**
- **Atendente** — registra pedidos, cadastra mesas/clientes e seleciona produtos do cardápio.
- **Gerente (Proprietário)** — possui todas as ações do atendente e, adicionalmente, gerencia produtos, atendentes, estoque e relatórios de vendas.

**Principais capacidades:**
- Cadastro e manutenção de **produtos** (com foto, descrição, categoria e preço).
- Abertura de **pedidos** vinculados a mesas e atendentes, com envio para a cozinha.
- Registro de **vendas** com formas de pagamento (Pix, crédito, débito, dinheiro).
- Acompanhamento de **estoque** com auditoria de alterações.
- Emissão de **relatórios** gerenciais (por dia, por forma de pagamento, por atendente).
- **Backups** automáticos e manuais com exportação em JSON e Excel.
- **Autenticação** de usuários com controle de acesso por perfil.
- **Sincronização** de dados entre dispositivos dos atendentes e o computador administrador.

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
| **exceljs** | ^4.4.0 | Geração de planilhas Excel (.xlsx) para exportação |
| **node-cron** | ^4.2.1 | Agendamento de tarefas (backups automáticos diários) |
| **dotenv** | ^17.2.3 | Leitura de variáveis de ambiente a partir do arquivo `.env` |
| **nodemon** | ^3.1.10 | Recarregamento automático em desenvolvimento |

---

## 3. Requisitos Funcionais

| ID | Requisito | Descrição |
|----|-----------|-----------|
| RF01 | Cadastro de Mesa | O sistema deve permitir o cadastro da mesa no momento do pedido. |
| RF02 | Seleção de Produtos | Cardápio completo com produtos organizados por categoria para seleção. |
| RF03 | Finalização de Pedido | Pedido finalizado é identificado automaticamente como "pago". |
| RF04 | Emissão de Pedidos | Emissão de pedidos associando clientes/mesas e itens, enviando à cozinha. |
| RF05 | Vendas | Tela de vendas contabilizando pedidos completos em ordem crescente. |
| RF06 | Inclusão de Produto | Cadastro, edição e atualização de produtos com foto, descrição, observações e preço. |
| RF07 | Cadastro de Atendentes | Registro de atendentes com nome, CPF e telefone. |
| RF08 | Sincronização de Dados | Atualização de dados entre dispositivos dos atendentes e o administrador. |
| RF09 | Autenticação de Usuários | Login com fator autenticador para atendentes e gerentes. |

---

## 4. Principais Funcionalidades

### 4.1 Autenticação e Controle de Acesso

- Login com usuário e senha via tela dedicada (`login.html`).
- Perfis de acesso: **gerente** (acesso total) e **atendente** (operacional) (RF09).
- Credenciais padrão configuráveis via `.env`:
  - Gerente: `admin` / `admin123`
  - Atendente: `funcionario` / `func123`
- Proteção de rotas sensíveis via middleware de autenticação.
- Sidebar e funcionalidades adaptadas automaticamente conforme o perfil logado.

### 4.2 Painel Administrativo

- Gestão completa de usuários: criar, editar, remover e listar contas.
- Exibição de badges de permissão por perfil.
- Cards de estatísticas gerais no dashboard administrativo.

### 4.3 Gestão de Produtos

- Cadastro, edição, listagem e remoção de produtos (RF06).
- Campos: nome, descrição, preço, foto, categoria, quantidade em estoque e observações.
- Controle de estoque integrado com pedidos e vendas.

### 4.4 Gestão de Mesas e Atendentes

- Cadastro de **mesas** no momento do pedido (RF01).
- Cadastro de **atendentes** com nome, CPF e telefone (RF07).
- Associação de atendentes e mesas aos pedidos.

### 4.5 Pedidos e Atendimento

- Abertura de pedidos vinculados a mesa, atendente e lista de itens (RF04).
- Interface de atendimento com cardápio organizado por categoria (RF02), busca por nome e carrinho lateral com scroll.
- Carrinho com controle de quantidade por item, subtotal em tempo real e campo de **desconto** (valor fixo R$ ou percentual %).
- Envio de pedidos à cozinha.
- Finalização automática como "pago" ao encerrar atendimento (RF03).
- Decremento automático de estoque ao registrar itens.

### 4.6 Vendas

- Registro de vendas finalizadas com valor total e forma de pagamento: Pix, crédito, débito ou dinheiro (RF05).
- Tela de vendas exibindo pedidos em ordem crescente.
- Base para relatórios de faturamento por dia, por forma de pagamento e por atendente.

### 4.7 Relatórios

- Consolidação de vendas por dia, por forma de pagamento e por atendente (US09).
- Exportação em Excel (.xlsx) via exceljs.
- Exibidos em tabelas e cards de resumo no frontend.

### 4.8 Estoque e Auditoria

- Controle de quantidade em estoque dos produtos.
- Registro de alterações na tabela `EstoqueLog`, rastreando: produto afetado, quantidade anterior, quantidade nova, ação e data/hora.

### 4.9 Sincronização de Dados

- Atualização de dados entre dispositivos dos atendentes e o computador administrador (RF08).
- Rastreamento de sincronizações por atendente via tabela `Sincronizacao`.

### 4.10 Sistema de Backup e Restauração

- **Backup manual**: endpoint para criar snapshots sob demanda.
- **Backup automático**: tarefa agendada com `node-cron` diariamente às 05:00 (fuso `America/Sao_Paulo`).
- **Armazenamento**: tabela `backups` com campo JSON contendo snapshot de vendas, pedidos, itens, produtos e resumos.
- **Exportação**: em JSON ou Excel (.xlsx) com múltiplas planilhas.
- **Restauração**:
  - Modo `safe`: insere apenas registros inexistentes, preservando dados atuais.
  - Modo `force`: recria os dados a partir do snapshot, sobrescrevendo o estado atual.

---

## 5. Arquitetura da Aplicação

### 5.1 Backend (API REST)

- **Entrypoint**: `src/app.js`
  - Configuração de middlewares globais (`express.json`, arquivos estáticos).
  - Servindo a pasta `public/` na raiz e a pasta `Imagens/` no caminho `/imagens` (logo e fundo da tela de login).
  - Registro de todas as rotas.
  - Agendamento do backup automático via `node-cron`.
  - Sincronização do banco com `sequelize.sync()` antes de iniciar o servidor.

### 5.2 Banco de Dados

- **Sequelize** configura a conexão com MySQL em `src/config/database.js` via variáveis de ambiente.
- Nomes de colunas em **snake_case** (ex: `id_produto`, `id_pedido`).
- A maioria das tabelas desabilita timestamps automáticos (`timestamps: false`) para compatibilidade com o banco existente.

### 5.3 Controllers e Rotas

- **Controllers** em `src/controllers/`: contêm toda a lógica de negócio (validação, acesso às models, regras da aplicação).
- **Rotas** em `src/routes/`: mapeiam URLs e métodos HTTP para os métodos dos controllers.

Módulos disponíveis:

| Rota montada | Arquivo de rota | Controller |
|---|---|---|
| `/auth` | `authRoutes.js` | `authController.js` |
| `/admin` | `adminRoutes.js` | `adminController.js` |
| `/atendentes` | `atendenteRoutes.js` | `atendenteController.js` |
| `/produtos` | `produtoRoutes.js` | `produtoController.js` |
| `/mesas` | `mesaRoutes.js` | `mesaController.js` |
| `/pedidos` | `pedidoRoutes.js` | `pedidoController.js` |
| `/itens-pedido` | `itemPedidoRoutes.js` | `itempedidoController.js` |
| `/vendas` | `vendaRoutes.js` | `vendaController.js` |
| `/relatorios` | `relatorioRoutes.js` | `relatorioController.js` |
| `/backups` | `backupRoutes.js` | `backupController.js` |
| `/auditoria/estoque` | `auditoriaRoutes.js` | `auditoriaController.js` |
| `/sincronizacoes` | `sincronizacaoRoutes.js` | `sincronizacaoController.js` |

### 5.4 Middleware

- `src/middleware/requireBackupAuth.js`: protege endpoints de backup com token simples (`BACKUP_TOKEN`).
  - Aceita token via header `x-backup-token`, `Authorization: Bearer <token>` ou query string `?token=<token>`.

### 5.5 Frontend

- Pasta `public/`:
  - `login.html`: tela de login com layout dois painéis — esquerdo (imagem de fundo + logo + pills de funcionalidades) e direito (formulário).
  - `index.html`: interface principal — SPA com sidebar branca, header fixo com breadcrumb e avatar, e todas as seções do sistema (dashboard, atendimento, vendas, produtos, atendentes, mesas, estoque, relatórios, sincronização, backups).
  - `style.css`: estilos globais (paleta vermelho/dourado/branco, responsivo para desktop, tablet e mobile).
  - `app.js`: lógica principal do frontend — consumo da API via `fetch`, renderização dinâmica de cards e tabelas, modais, filtros, carrinho com desconto e interações do usuário.

- Pasta `Imagens/` (fora de `public/`, servida via `/imagens`):
  - `logo food truck system.png`: logotipo da empresa exibido no header e na tela de login.
  - `fundo solido para a tela de login.png`: imagem de fundo do painel esquerdo da tela de login.

---

## 6. Estrutura de Pastas

```text
foodtruck-system-v3/
├── README.md                   # Documentação principal do projeto
├── package.json                # Dependências e scripts npm
├── .env                        # Variáveis de ambiente (não versionar)
├── .env.example                # Exemplo de variáveis de ambiente
├── sql/
│   └── alter_pedidos.sql       # Scripts SQL auxiliares
├── scripts/                    # Scripts Node.js de apoio e testes
│   ├── check_estoque_logs.js
│   ├── sync_estoque_logs.js
│   ├── standard_test.js
│   ├── test_create_pedido.js
│   ├── test_pedido_venda.js
│   └── test_preserve_atendente.js
├── Imagens/                    # Imagens da empresa (servidas via /imagens)
│   ├── logo food truck system.png
│   └── fundo solido para a tela de login.png
├── public/                     # Frontend estático
│   ├── index.html              # Tela principal (SPA — todas as seções)
│   ├── login.html              # Tela de login
│   ├── style.css               # Estilos globais
│   └── app.js                  # Lógica principal do frontend
└── src/                        # Código-fonte do backend
    ├── app.js                  # Entrypoint do servidor
    ├── config/
    │   └── database.js         # Configuração do Sequelize (MySQL)
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
    ├── middleware/
    │   └── requireBackupAuth.js
    ├── models/
    │   ├── Atendente.js
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

## 7. Como Executar o Projeto

### 7.1 Pré-requisitos

- Node.js v20 ou superior
- npm
- MySQL ou MariaDB instalado e em execução

### 7.2 Configuração das Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e preencha com suas configurações:

```env
DB_NAME=foodtruck_db
DB_USER=root
DB_PASS=sua_senha_aqui
DB_HOST=localhost
DB_PORT=3306
DB_DIALECT=mysql

# Token opcional para proteger rotas de backup
BACKUP_TOKEN=uma_chave_secreta_opcional
```

### 7.3 Instalação de Dependências

```bash
npm install
```

### 7.4 Execução

**Desenvolvimento** (com recarregamento automático):
```bash
npm run dev
```

**Produção**:
```bash
npm start
```

O servidor iniciará na porta `3000`. Acesse em: `http://localhost:3000`

Credenciais padrão:
- Gerente: usuário `admin` / senha `admin123`
- Atendente: usuário `funcionario` / senha `func123`

---

## 8. Considerações Finais

O projeto demonstra:

- Organização em camadas (models, controllers, routes, middleware).
- Uso de ORM (Sequelize) com MySQL para abstrair o acesso ao banco.
- Boas práticas de configuração via `.env`.
- Separação clara entre **backend** (API REST) e **frontend** (páginas estáticas).
- Sistema de autenticação com controle de perfis de acesso.
- Funções avançadas para cenário real: backups automáticos, exportação Excel, auditoria de estoque.
- Interface responsiva (desktop, tablet e mobile) com layout sidebar + header fixo.

Este README foi estruturado para facilitar a explicação da arquitetura, das decisões técnicas e do fluxo principal de uso do sistema em ambiente acadêmico ou profissional.
