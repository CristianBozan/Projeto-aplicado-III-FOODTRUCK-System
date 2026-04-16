# PLANO DE EXECUÇÃO — Food Truck System v3
> Gerado em 2026-04-10 | Baseado em audit completo do projeto

---

## ESTADO ATUAL (pós-audit)

| Item | Status |
|------|--------|
| Estrutura MVC básica | OK — controllers/models/routes/config existem |
| Dependências | OK — bcryptjs instalado, 0 vulnerabilidades |
| Error handling | OK — try/catch em todos os controllers |
| bcrypt no login | OK — authController usa bcrypt.compare() |
| Filtro de data nos relatórios | OK — implementado na última sessão |
| **Auth middleware nas rotas** | **CRÍTICO — 9/11 route groups sem proteção** |
| JWT / sessão server-side | AUSENTE |
| Exportação Excel/PDF | STUB — não funciona |
| Perfil do usuário | AUSENTE |
| Services layer | AUSENTE |
| PATCH /pedidos/:id/status | AUSENTE |
| Controle de acesso por role | AUSENTE |

---

## FASE 1 — Segurança: Auth Middleware + RBAC
**Prioridade: CRÍTICA — fazer antes de qualquer outra coisa**

### O que implementar

1. **`src/middleware/requireAuth.js`** — middleware que valida o token JWT do header `Authorization: Bearer <token>`
2. **`src/middleware/requireRole.js`** — middleware factory `requireRole('gerente')` que verifica `req.user.role`
3. **`src/controllers/authController.js`** — gerar JWT no login (usar `jsonwebtoken`), retornar `{ token, role, nome, userId }`
4. Aplicar `requireAuth` em todas as rotas protegidas (pedidos, vendas, produtos, mesas, atendentes, relatorios, sincronizacoes, auditoria)
5. Aplicar `requireRole('gerente')` nas rotas de admin, atendentes (CRUD), produtos (POST/PUT/DELETE)
6. **`public/app.js`** — enviar `Authorization: Bearer <token>` em todos os `fetch()` — token lido do localStorage
7. **`public/login.html`** — salvar token no localStorage após login

### Dependência nova
```
npm install jsonwebtoken
```

### Verificação
- `GET /pedidos` sem token → deve retornar 401
- `GET /pedidos` com token de atendente → deve retornar 200
- `DELETE /atendentes/1` com token de atendente → deve retornar 403
- Login com credenciais corretas → retorna token JWT válido

### Anti-padrões a evitar
- NÃO usar `req.session` (não há session middleware instalado)
- NÃO hardcodar `JWT_SECRET` no código — usar `process.env.JWT_SECRET`
- NÃO colocar `requireAuth` no `/auth/login` (rota pública)

---

## FASE 2 — Services Layer + PATCH de status
**Prioridade: ALTA**

### O que implementar

1. **`src/services/syncService.js`** — extrair lógica de backup/sincronização do `backupController` para um serviço reutilizável
   - `syncService.criarBackup()` — retorna path do arquivo gerado
   - `syncService.listarBackups()` — lista arquivos em `backups/`
   - `syncService.restaurar(id)` — restaura arquivo de backup
2. **`src/services/relatorioService.js`** — centralizar queries de relatório
   - `relatorioService.faturamentoPorPeriodo(start, end)` — query SQL agregada
   - `relatorioService.pedidosPorAtendente(start, end)` — breakdown por atendente
3. **`PATCH /pedidos/:id/status`** em `pedidoRoutes.js` e `pedidoController.js`
   - Aceita `{ status: 'cancelado' | 'finalizado' | 'pago' }` no body
   - Cancelar NÃO deleta — apenas muda status para `cancelado`
   - Finalizar cria Venda automaticamente se houver `forma_pagamento`
4. Remover lógica de backup de `app.js` e `backupController.js` — delegar para `syncService`

### Verificação
- `PATCH /pedidos/1/status` com `{ status: 'cancelado' }` → status atualizado, pedido não deletado
- Backup automático às 05:00 continua funcionando (usa syncService internamente)
- Botão "Sincronizar agora" no frontend chama POST correto

---

## FASE 3 — Fluxo de Pedidos + UX dos Modais
**Prioridade: ALTA**

### O que implementar

1. **Botões de ação nos pedidos** (`public/app.js`):
   - Substituir "Excluir" por "Cancelar" — chama `PATCH /pedidos/:id/status` com `cancelado`
   - Botão "Finalizar" — destaque visual maior, posicionado abaixo dos itens
   - Botão "Editar" — posicionado acima
   - Feedback visual: spinner enquanto aguarda resposta, badge de status atualizado após ação

2. **Modais** (`public/index.html` + `public/app.js`):
   - Impedir fechamento ao clicar fora do modal (`pointer-events` ou `stopPropagation`)
   - Todo modal deve ter botão "Salvar" e botão "Cancelar" explícitos
   - Ao cancelar modal de criação/edição: confirmar se houver dados não salvos

3. **Coluna de vendas redundante**:
   - Remover coluna ou seção de "Gerenciamento de Vendas" da tela principal
   - Status dos pedidos visível apenas na tabela de pedidos e na seção de relatórios

### Verificação
- Clicar fora do modal não fecha
- "Cancelar pedido" muda status para `cancelado` no banco, pedido permanece visível
- Finalizar pedido cria venda e libera mesa
- Nenhum botão de ação aparece sem resposta visual

---

## FASE 4 — Perfil do Usuário
**Prioridade: MÉDIA**

### O que implementar

1. **`public/index.html`** — clicar no nome do usuário no header abre modal de perfil
2. **Modal de perfil** com campos:
   - Nome (pré-preenchido com `localStorage.userName`)
   - Login (pré-preenchido com login atual)
   - Nova senha (opcional — só envia se preenchido)
   - Confirmar nova senha
3. **Backend** — `PUT /atendentes/:id` já existe; apenas garantir que funciona corretamente para auto-edição
   - Gerente edita via `PUT /admin/atendentes/:id` ou rota dedicada
4. Atualizar `localStorage.userName` após salvar com sucesso

### Verificação
- Clicar no nome no header abre modal
- Alterar apenas o nome: senha NÃO muda no banco
- Alterar senha: bcrypt re-hash funciona (hooks Sequelize)
- Salvar com senha diferente nas duas confirmações → erro de validação

---

## FASE 5 — Dashboard: Métricas por Atendente
**Prioridade: MÉDIA**

### O que implementar

1. **Se role = atendente**: dashboard mostra métricas APENAS dos pedidos do atendente logado
   - Filtrar `id_atendente = localStorage.userId` nos fetches do dashboard
2. **Se role = gerente/admin**: dashboard mostra métricas globais (comportamento atual)
3. Cards adicionais no dashboard de gerente:
   - "Ranking de atendentes" — top 3 por valor vendido no período
4. Filtro de período já funciona — garantir que se aplica corretamente ao filtrar por atendente

### Verificação
- Login como atendente → faturamento exibido é só do atendente
- Login como gerente → faturamento é total
- Filtro "Hoje / Semana / Mês" funciona em ambos os casos

---

## FASE 6 — Deploy em Nuvem
**Prioridade: MÉDIA (para apresentação)**

### Plataformas recomendadas (gratuitas)
- **Backend + BD:** Railway (MySQL incluso no plano gratuito)
- **Alternativa backend:** Render (free tier com sleep após 15min inativo)
- **Domínio gratuito:** Railway gera subdomínio automático

### O que preparar

1. **`railway.json`** ou **`Procfile`** na raiz:
```
web: node src/app.js
```

2. **Variáveis de ambiente** no painel Railway (NÃO no `.env`):
   - `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `DB_PORT`
   - `JWT_SECRET` (gerar string aleatória segura)
   - `BACKUP_TOKEN`, `GERENTE_LOGIN`, `GERENTE_SENHA`
   - `NODE_ENV=production`

3. **`src/config/database.js`** — adicionar `ssl: { rejectUnauthorized: false }` para Railway MySQL

4. **`public/app.js`** — `API_URL` já detecta automaticamente via `window.location.origin` ✓

5. Criar usuário gerente e atendentes de teste via seed script antes da apresentação

### Verificação
- `npm start` sem `.env` local → deve falhar graciosamente com mensagem clara
- Railway deploy → servidor online em `https://xxxx.railway.app`
- Login funciona com credenciais de produção
- Banco MySQL Railway conectado e tabelas criadas no primeiro `sequelize.sync()`

---

## ORDEM DE EXECUÇÃO RECOMENDADA

```
FASE 1 (Segurança)  →  FASE 2 (Services + PATCH)  →  FASE 3 (UX pedidos)
       ↓
FASE 4 (Perfil)  →  FASE 5 (Dashboard métricas)  →  FASE 6 (Deploy)
```

Fases 1 e 2 são pré-requisitos para as demais. Fase 6 pode ser feita em paralelo após Fase 1.

---

## ESTIMATIVA DE COMPLEXIDADE

| Fase | Arquivos principais tocados | Esforço estimado |
|------|----------------------------|-----------------|
| 1 — Auth/RBAC | 3 novos middleware + 11 route files + authController + app.js | Alto |
| 2 — Services | 2 novos services + pedidoController + pedidoRoutes | Médio |
| 3 — UX pedidos | app.js (frontend), index.html | Médio |
| 4 — Perfil | app.js + index.html | Baixo |
| 5 — Dashboard | app.js (frontend) | Baixo |
| 6 — Deploy | railway.json + database.js + env setup | Baixo |
