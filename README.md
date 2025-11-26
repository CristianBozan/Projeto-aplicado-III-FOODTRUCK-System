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
# Food Truck System

Aplicação web desenvolvida para apoiar a gestão completa de um Food Truck, cobrindo desde o cadastro de produtos até o controle de pedidos, vendas, mesas, atendentes e geração de relatórios gerenciais.
O sistema foi construído como parte de um projeto acadêmico, mas segue boas práticas de desenvolvimento visando escalabilidade, organização e facilidade de manutenção.

---

## 1. Visão Geral do Sistema

O **Food Truck System** é uma solução de backoffice (administração interna) voltada para o dia a dia de um food truck, permitindo:

- Cadastro e manutenção de **produtos** e seus preços.
- Abertura de **pedidos** vinculados a mesas e atendentes.
- Registro de **vendas** e formas de pagamento.
- Acompanhamento de **estoque** e auditoria de alterações.
- Emissão de **relatórios** operacionais (por dia, por forma de pagamento, por atendente etc.).
- **Backups** automáticos e manuais, com possibilidade de restauração de dados e exportação em formatos amigáveis (JSON e Excel).

A aplicação utiliza uma API REST em Node.js (Express + Sequelize) e um frontend estático em HTML/CSS/JavaScript, todos rodando no mesmo servidor.

---

## 2. Tecnologias e Linguagens Utilizadas

### 2.1 Linguagem Principal

- **JavaScript**
  - **Backend**: Node.js
  - **Frontend**: JavaScript em páginas HTML estáticas

**Motivações da escolha:**

- Mesma linguagem no backend e no frontend, reduzindo a curva de aprendizado.
- Ecossistema rico de bibliotecas (npm) para banco de dados, ORM, agendamento, geração de planilhas etc.
- Modelo assíncrono e orientado a eventos do Node.js, adequado para aplicações web que lidam com muitas requisições I/O (banco de dados, arquivos).

### 2.2 Frameworks e Bibliotecas

- **Node.js**: runtime JavaScript no servidor.
- **Express**: framework HTTP minimalista para construção de APIs REST e servidor de arquivos estáticos.
- **Sequelize**: ORM para comunicação com banco de dados **MySQL/MariaDB**.
- **mysql2**: driver para o MySQL utilizado pelo Sequelize.
- **exceljs**: geração de planilhas Excel (.xlsx) para exportação de relatórios/backup.
- **node-cron**: agendamento de tarefas, utilizado para backups automáticos diários.
- **dotenv**: leitura de variáveis de ambiente a partir de um arquivo `.env`.
- **nodemon** (desenvolvimento): recarregamento automático do servidor ao alterar arquivos.

---

## 3. Principais Funcionalidades

### 3.1 Gestão de Produtos

- Cadastro, edição, listagem e remoção de produtos.
- Campos como nome, descrição, preço, quantidade em estoque e status (ativo/inativo).
- Controle de estoque integrado com pedidos e vendas.

### 3.2 Gestão de Mesas e Atendentes

- Cadastro de **mesas** (identificação, status, capacidade).
- Cadastro de **atendentes** (dados básicos de identificação).
- Associação de atendentes e mesas aos pedidos, permitindo relatórios por atendente/mesa.

### 3.3 Pedidos

- Abertura de pedidos vinculados a:
  - Mesa
  - Atendente
  - Lista de **itens de pedido** (produto + quantidade + valor unitário)
- Atualização e cancelamento de pedidos.
- Integração com estoque (decremento de estoque quando itens de pedido são criados, conforme a regra de negócio definida).

### 3.4 Vendas

- Registro de vendas finalizadas com:
  # Food Truck System

  Aplicação web desenvolvida para apoiar a gestão completa de um Food Truck, cobrindo desde o cadastro de produtos até o controle de pedidos, vendas, mesas, atendentes e geração de relatórios gerenciais.
  O sistema foi construído como parte de um projeto acadêmico, mas segue boas práticas de desenvolvimento visando escalabilidade, organização e facilidade de manutenção.

  ---

  ## 1. Visão Geral do Sistema

  O **Food Truck System** é uma solução de backoffice (administração interna) voltada para o dia a dia de um food truck, permitindo:

  - Cadastro e manutenção de **produtos** e seus preços.
  - Abertura de **pedidos** vinculados a mesas e atendentes.
  - Registro de **vendas** e formas de pagamento.
  - Acompanhamento de **estoque** e auditoria de alterações.
  - Emissão de **relatórios** operacionais (por dia, por forma de pagamento, por atendente etc.).
  - **Backups** automáticos e manuais, com possibilidade de restauração de dados e exportação em formatos amigáveis (JSON e Excel).

  A aplicação utiliza uma API REST em Node.js (Express + Sequelize) e um frontend estático em HTML/CSS/JavaScript, todos rodando no mesmo servidor.

  ---

  ## 2. Tecnologias e Linguagens Utilizadas

  ### 2.1 Linguagem Principal

  - **JavaScript**
    - **Backend**: Node.js
    - **Frontend**: JavaScript em páginas HTML estáticas

  **Motivações da escolha:**

  - Mesma linguagem no backend e no frontend, reduzindo a curva de aprendizado.
  - Ecossistema rico de bibliotecas (npm) para banco de dados, ORM, agendamento, geração de planilhas etc.
  - Modelo assíncrono e orientado a eventos do Node.js, adequado para aplicações web que lidam com muitas requisições I/O (banco de dados, arquivos).

  ### 2.2 Frameworks e Bibliotecas

  - **Node.js**: runtime JavaScript no servidor.
  - **Express**: framework HTTP minimalista para construção de APIs REST e servidor de arquivos estáticos.
  - **Sequelize**: ORM para comunicação com banco de dados **MySQL/MariaDB**.
  - **mysql2**: driver para o MySQL utilizado pelo Sequelize.
  - **exceljs**: geração de planilhas Excel (.xlsx) para exportação de relatórios/backup.
  - **node-cron**: agendamento de tarefas, utilizado para backups automáticos diários.
  - **dotenv**: leitura de variáveis de ambiente a partir de um arquivo `.env`.
  - **nodemon** (desenvolvimento): recarregamento automático do servidor ao alterar arquivos.

  ---

  ## 3. Principais Funcionalidades

  ### 3.1 Gestão de Produtos

  - Cadastro, edição, listagem e remoção de produtos.
  - Campos como nome, descrição, preço, quantidade em estoque e status (ativo/inativo).
  - Controle de estoque integrado com pedidos e vendas.

  ### 3.2 Gestão de Mesas e Atendentes

  - Cadastro de **mesas** (identificação, status, capacidade).
  - Cadastro de **atendentes** (dados básicos de identificação).
  - Associação de atendentes e mesas aos pedidos, permitindo relatórios por atendente/mesa.

  ### 3.3 Pedidos

  - Abertura de pedidos vinculados a:
    - Mesa
    - Atendente
    - Lista de **itens de pedido** (produto + quantidade + valor unitário)
  - Atualização e cancelamento de pedidos.
  - Integração com estoque (decremento de estoque quando itens de pedido são criados, conforme a regra de negócio definida).

  ### 3.4 Vendas

  - Registro de vendas finalizadas com:
    - Valor total
    - Forma de pagamento
    - Relacionamento com o pedido de origem
  - Base para relatórios de faturamento diário, por forma de pagamento, por atendente etc.

  ### 3.5 Relatórios

  - Endpoints de **relatórios** que consolidam:
    - Vendas por dia
    - Vendas por forma de pagamento
    - Vendas por atendente
  - Podem ser consumidos pelo frontend para exibição de dashboards (gráficos, tabelas).

  ### 3.6 Estoque e Auditoria

  - Controle de **quantidade em estoque** dos produtos.
  - Registro de alterações em tabela de **auditoria de estoque** (`EstoqueLog`), permitindo rastrear:
    - Produto afetado
    - Quantidade anterior
    - Quantidade nova
    - Ação (criação, atualização, restauração)
    - Data/hora da alteração

  ### 3.7 Sistema de Backup e Restauração

  - **Backup manual**:
    - Endpoint para criar snapshots sob demanda (por exemplo, antes de grandes alterações).
  - **Backup automático**:
    - Tarefa agendada com `node-cron` (por padrão, diariamente às 05:00) para gerar backups no banco.
  - **Armazenamento dos backups**:
    - Tabela `backups` com campo JSON (`conteudo_json`) contendo snapshot de:
      - Vendas
      - Pedidos e seus itens
      - Produtos
      - Resumos por dia
  - **Exportação**:
    - Exportar backup em **JSON**.
    - Exportar dados em **Excel (.xlsx)** com múltiplas planilhas (ex.: Vendas, Pedidos, Itens, Produtos, VendasPorDia).
  - **Restauração**:
    - Modo `safe` (não destrutivo): insere apenas registros inexistentes, preservando dados atuais tanto quanto possível.
    - Modo `force` (destrutivo): recria os dados a partir do snapshot, sobrescrevendo o estado atual.
    - Registra operações de restauração na auditoria de estoque.

  ---

  ## 4. Arquitetura da Aplicação

  A arquitetura é organizada em camadas bem definidas, seguindo um padrão comum em APIs Node.js:

  ### 4.1 Backend (API REST)

  - Entrypoint: `src/app.js`
    - Configurações iniciais (dotenv, banco).
    - Registro das rotas (import de `src/routes`).
    - Configuração de middlewares globais.
    - Exposição da pasta `public/` como estática.
    - Agendamento de backup automático com `node-cron`.

  ### 4.2 Banco de Dados

  - **Sequelize** configura a conexão com MySQL em `src/config/database.js`.
  - As models são definidas como arquivos separados em `src/models/`, espelhando a estrutura do banco:
    - `Atendente`, `Mesa`, `Produto`, `Pedido`, `ItemPedido`, `Venda`, `Backup`, `EstoqueLog` etc.
  - Convenções:
    - Nomes de colunas em **snake_case**, por exemplo: `id_produto`, `id_pedido`.
    - Muitas tabelas desabilitam timestamps automáticos (`timestamps: false`) para compatibilidade com o banco existente.

  ### 4.3 Controllers e Rotas

  - Controllers localizados em `src/controllers/`:
    - Contêm a lógica de negócio (validação, acesso às models, regras da aplicação).
    - Padrão de métodos:
      - `listar`
      - `buscarPorId`
      - `criar`
      - `atualizar`
      - `deletar`
  - Rotas em `src/routes/`:
    - Cada recurso possui seu arquivo de rotas, por exemplo:
      - `produtoRoutes.js`, `pedidoRoutes.js`, `vendaRoutes.js`, `mesaRoutes.js`, `atendenteRoutes.js`, `relatorioRoutes.js`, `backupRoutes.js` etc.
    - Mapeiam as URLs e métodos HTTP para os métodos dos controllers.

  ### 4.4 Middleware

  - `src/middleware/requireBackupAuth.js`
    - Middleware responsável por proteger endpoints de backup com um token simples (`BACKUP_TOKEN`).
    - Aceita token via:
      - Header `x-backup-token`.
      - Header `Authorization: Bearer <token>`.
      - Query string `?token=<token>` em downloads.

  ### 4.5 Frontend

  - Pasta `public/`:
    - `index.html`: interface principal, com navegação para dashboard, produtos, mesas, pedidos, vendas, atendentes, relatórios, backups etc.
    - `login.html`: tela de login com layout dedicado.
    - `style.css`: estilos visuais da aplicação (cores, fontes, layouts).
    - `app.js` / `script.js`: scripts de frontend que:
      - Consomem a API via `fetch`.
      - Atualizam a interface dinamicamente (cards, tabelas, modais).
      - Implementam interações do usuário (criar pedido, registrar venda, gerar backup, etc.).
    - Imagens:
      - `logo-foodtruck.png`: logotipo do sistema.
      - `login-bg.png`: imagem de background da tela de login.

  ---

  ## 5. Esqueleto de Pastas (Principais Diretórios)

  Abaixo, um resumo da estrutura de pastas mais relevante para entendimento do projeto:

  ```text
  Projeto-aplicado-2---FOOD-TRUCK-System/
  ├─ README.md                 # Documentação principal do projeto
  ├─ package.json              # Dependências e scripts npm
  ├─ .env                      # Variáveis de ambiente (não versionado no GitHub)
  ├─ .gitignore                # Arquivos/pastas ignorados pelo Git
  ├─ sql/                      # Scripts SQL auxiliares (estrutura/alterações)
  │  ├─ alter_pedidos.sql
  │  └─ ...
  ├─ scripts/                  # Scripts Node.js de apoio/teste
  │  ├─ test_create_pedido.js
  │  ├─ test_pedido_venda.js
  │  └─ ...
  ├─ public/                   # Frontend estático
  │  ├─ index.html             # Tela principal/admin
  │  ├─ login.html             # Tela de login
  │  ├─ style.css              # Estilos globais
  │  ├─ app.js / script.js     # Lógica de frontend (chamada da API)
  │  ├─ logo-foodtruck.png     # Logotipo do sistema
  │  └─ login-bg.png           # Background da tela de login
  └─ src/                      # Código-fonte do backend (Node.js + Express)
     ├─ app.js                 # Entrypoint do servidor
     ├─ config/
     │  └─ database.js         # Configuração do Sequelize (MySQL)
     ├─ controllers/           # Lógica de negócio por recurso
     │  ├─ produtoController.js
     │  ├─ pedidoController.js
     │  ├─ vendaController.js
     │  ├─ atendenteController.js
     │  ├─ mesaController.js
     │  ├─ relatorioController.js
     │  ├─ backupController.js
     │  └─ ...
     ├─ middleware/
     │  └─ requireBackupAuth.js # Proteção de rotas de backup
     ├─ models/                # Models Sequelize
     │  ├─ Produto.js
     │  ├─ Pedido.js
     │  ├─ ItemPedido.js
     │  ├─ Venda.js
     │  ├─ Atendente.js
     │  ├─ Mesa.js
     │  ├─ Backup.js
     │  └─ EstoqueLog.js
     └─ routes/                # Definições de rotas Express
        ├─ produtoRoutes.js
        ├─ pedidoRoutes.js
        ├─ vendaRoutes.js
        ├─ atendenteRoutes.js
        ├─ mesaRoutes.js
        ├─ relatorioRoutes.js
        ├─ backupRoutes.js
        └─ ...
  ```

  ---

  ## 6. Como Executar o Projeto

  ### 6.1 Pré-requisitos

  - Node.js (versão 18+ recomendada)
  - npm
  - Banco de dados MySQL ou MariaDB configurado

  ### 6.2 Configuração das Variáveis de Ambiente

  Crie um arquivo `.env` na raiz do projeto com pelo menos:

  ```env
  DB_NAME=nome_do_banco
  DB_USER=usuario
  DB_PASS=senha
  DB_HOST=localhost
  DB_PORT=3306
  DB_DIALECT=mysql

  # Token opcional para proteger rotas de backup
  BACKUP_TOKEN=uma_chave_secreta_opcional
  ```

  ### 6.3 Instalação de Dependências

  ```bash
  npm install
  ```

  ### 6.4 Execução em Ambiente de Desenvolvimento

  ```bash
  npm run dev
  ```

  - O servidor iniciará (por padrão) na porta `3000`.
  - A interface web poderá ser acessada em:  `http://localhost:3000`

  ---

  ## 7. Considerações Finais para Apresentação

  - O projeto demonstra:
    - Organização em camadas (models, controllers, routes, middleware).
    - Uso de ORM (Sequelize) para abstrair acesso ao banco.
    - Boas práticas de configuração via `.env` e `.gitignore`.
    - Separação clara entre **backend** (API) e **frontend** (páginas e assets).
    - Funções avançadas relevantes para um cenário real (backups automáticos, exportação Excel, auditoria de estoque).

  Este README foi estruturado para ajudar na apresentação do aplicativo em ambiente acadêmico ou profissional, facilitando a explicação da arquitetura, das decisões técnicas e do fluxo principal de uso do sistema.
