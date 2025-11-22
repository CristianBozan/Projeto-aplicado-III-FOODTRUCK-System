## Diretrizes rápidas para agentes de código (projeto: foodtruck-system)

Objetivo: ser imediatamente produtivo neste repositório Node/Express + Sequelize.

- Arquitetura geral
  - Backend Node.js + Express (arquivo de entrada: `src/app.js`).
  - ORM: Sequelize com MySQL (`src/config/database.js`). As models usam `sequelize.define` e frequentemente declaram `tableName` e `timestamps: false` (ex.: `src/models/Produto.js`).
  - Rotas REST por recurso em `src/routes/*` (plural, ex.: `/produtos`, `/pedidos`) e controllers em `src/controllers/*` que exportam métodos async: `listar`, `buscarPorId`, `criar`, `atualizar`, `deletar`.
  - Frontend estático servido em `public/` (HTML/CSS/JS) — o server usa `express.static(...)` para servir essa pasta.

- Convenções de código importantes
  - Módulos CommonJS: `require(...)` e `module.exports` (não usar import/ESM sem projeto migrado).
  - Campos PK nas models usam snake_case (`id_produto`, `id_pedido`) — ao escrever queries/updates, respeite os nomes de coluna usados pela model (ex.: `where: { id_produto: id }`).
  - Error handling simples: controllers retornam 500 com `err.message` — mantenha esse padrão quando adicionar handlers.

- Fluxos e integrações a conhecer
  - A aplicação sincroniza o banco em `src/app.js` com `sequelize.sync()` antes de iniciar o servidor (porta 3000). Evite remover essa chamada sem considerar migrações.
  - Variáveis de ambiente: `.env` com `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_HOST`, `DB_PORT`, `DB_DIALECT`.
  - Scripts NPM úteis (em `package.json`):
    - `npm run dev` → `nodemon src/app.js` (desenvolvimento)
    - `npm start` → `node src/app.js` (produção)

- Padrões de rota/controller
  - Exemplo: `src/routes/pedidoRoutes.js` importa `pedidoController` e conecta:
    - `router.get('/', pedidoController.listar)`
    - `router.get('/:id', pedidoController.buscarPorId)`
    - `router.post('/', pedidoController.criar)`
  - Ao adicionar endpoints, siga o mesmo padrão de nomes e respostas JSON.

- Boas práticas específicas do projeto
  - Ao modificar models, atualize explicitamente `tableName` e verifique `timestamps` para manter compatibilidade com o banco existente.
  - Ao alterar contratos da API (campos obrigatórios, nomes de colunas), atualize tanto `controllers` quanto `public/app.js` se o front-end depender do formato da resposta.

- O que não está presente / limitações detectadas
  - Não há testes automatizados no repositório — não execute alterações de grande risco sem validação manual.
  - Autenticação/Hash de senha não implementados (README recomenda adicionar bcrypt/JWT) — se adicionar, faça em camadas (middleware, controller, model) e documente alterações.

- Onde olhar para exemplos concretos
  - Entrypoint e rotas: `src/app.js`
  - Conexão DB: `src/config/database.js`
  - Model exemplo: `src/models/Produto.js` (naming conventions, types)
  - Controller exemplo: `src/controllers/pedidoController.js` (padrão de handlers async)

Se algo estiver ambíguo ou você quiser que eu adapte o tom/nível de detalhe, diga o que mudar — eu ajusto e mesclo o conteúdo existente conforme necessário.
