# Guia de Testes — Food Truck System

Este guia cobre os testes manuais de todas as funcionalidades do sistema, tanto localmente quanto na URL de produção (Railway).

---

## Pré-requisitos (ambiente local)

1. MySQL rodando na porta 3306 (XAMPP ou similar)
2. Banco de dados `sistema_pedidos` criado
3. Arquivo `.env` configurado (ver `.env.example`)
4. Servidor iniciado com `npm start` ou `npm run dev`
5. Acesse: http://localhost:3000

## Pré-requisitos (produção Railway)

- URL: https://projeto-aplicado-iii-foodtruck-system-production.up.railway.app
- Nenhuma instalação necessária — acesse direto pelo browser

---

## Credenciais de Teste

| Usuário | Login | Senha | Papel |
|---|---|---|---|
| Administrador | `admin` | `admin123` | gerente |
| Cristian | `cristian` | `at01` | atendente |
| Maria Silva | `maria` | _(definida no banco)_ | atendente |
| Ana Costa | `ana` | _(definida no banco)_ | gerente |

---

## 1. Login e Autenticação

- [ ] Acesse a tela de login
- [ ] Faça login com `admin` / `admin123` — deve entrar como Gerente
- [ ] Faça logout e entre com `cristian` / `at01` — deve entrar como Atendente
- [ ] Tente login com senha errada — deve exibir mensagem de erro
- [ ] Tente acessar http://localhost:3000 sem login — deve redirecionar para login

---

## 2. Produtos

### Criar produto
- [ ] Clique na aba "Produtos"
- [ ] Clique em "Novo Produto"
- [ ] Preencha: nome, preço, categoria, estoque, status
- [ ] Salve e confirme que aparece na listagem

### Editar produto
- [ ] Clique em editar em um produto existente
- [ ] Altere o preço e salve
- [ ] Confirme a atualização na tabela

### Inativar produto
- [ ] Edite um produto e altere status para "Inativo"
- [ ] Confirme que não aparece mais no cardápio de pedidos

### Excluir produto
- [ ] Exclua um produto sem pedidos vinculados
- [ ] Confirme remoção

---

## 3. Mesas

- [ ] Liste as mesas — devem aparecer 10 mesas (1 a 10) com status "livre"
- [ ] Edite uma mesa e altere status para "ocupada"
- [ ] Confirme que ao finalizar um pedido vinculado, a mesa volta para "livre"

---

## 4. Atendentes (acesso gerente)

### Criar atendente
- [ ] Clique em "Novo Atendente"
- [ ] Preencha nome, CPF, telefone, login, senha e tipo
- [ ] Salve e confirme na listagem

### Editar atendente
- [ ] Altere o telefone de um atendente existente
- [ ] Confirme atualização

### Excluir atendente
- [ ] Exclua um atendente sem pedidos vinculados
- [ ] Confirme remoção

---

## 5. Pedidos

### Abrir pedido
- [ ] Clique em "Novo Pedido"
- [ ] Selecione mesa e atendente
- [ ] Adicione produtos ao carrinho
- [ ] Confirme que o subtotal é calculado corretamente
- [ ] Salve — pedido deve aparecer com status "aberto"

### Cancelar pedido
- [ ] Clique em "Cancelar" em um pedido aberto
- [ ] Confirme que status muda para "cancelado" (pedido permanece no histórico)
- [ ] Confirme que a mesa volta para "livre"

### Finalizar pedido
- [ ] Clique em "Finalizar" em um pedido aberto
- [ ] Selecione a forma de pagamento (pix, crédito, débito, dinheiro, mix)
- [ ] Confirme que status muda para "pago"
- [ ] Confirme que a mesa volta para "livre"
- [ ] Confirme que uma venda foi gerada automaticamente

---

## 6. Vendas

- [ ] Acesse a aba "Vendas"
- [ ] Confirme que as vendas aparecem em ordem crescente
- [ ] Verifique que cada venda tem: data, valor, forma de pagamento

---

## 7. Relatórios (acesso gerente)

- [ ] Acesse a aba "Relatórios"
- [ ] Teste o filtro "Hoje" — deve mostrar vendas do dia atual
- [ ] Teste o filtro "Semana" — deve agregar os últimos 7 dias
- [ ] Teste o filtro "Mês"
- [ ] Verifique: vendas por dia, por forma de pagamento, por atendente e resumo geral
- [ ] Teste exportar relatório em Excel (.xlsx)

---

## 8. Backup (acesso gerente)

- [ ] Clique em "Criar Backup Manual"
- [ ] Confirme que o backup aparece na listagem
- [ ] Teste download do backup em JSON
- [ ] Teste exportação em Excel
- [ ] Confirme que backup automático está agendado (05:00 horário de Brasília)

---

## 9. Perfil do Usuário

- [ ] Clique no nome do usuário no cabeçalho
- [ ] Altere o nome e salve — confirme atualização
- [ ] Altere a senha — confirme que o novo login funciona
- [ ] Tente salvar com senhas diferentes nas duas confirmações — deve exibir erro

---

## 10. Interface

### Sidebar
- [ ] Clique no botão de colapso da sidebar
- [ ] Recarregue a página — estado deve ser preservado (localStorage)

### Modais
- [ ] Abra qualquer modal de criação/edição
- [ ] Clique fora da area do modal — **nao deve fechar** (comportamento intencional para evitar perda de dados)
- [ ] Clique no botão X ou Cancelar — deve fechar

### Controle de acesso por papel
- [ ] Logado como atendente: abas de Relatórios, Backup e Atendentes devem estar bloqueadas ou ocultas
- [ ] Logado como gerente: acesso completo a todas as abas

---

## 11. Testes de Borda

| Ação | Resultado esperado |
|---|---|
| Login sem senha | "Usuário e senha são obrigatórios." |
| Login com senha errada | "Usuário ou senha inválidos." |
| Acessar rota sem token | 401 — "Token de autenticação ausente." |
| Atendente acessar rota de gerente | 403 — acesso negado |
| Salvar produto sem nome | Erro de validação |
| Salvar produto sem preço | Erro de validação |

---

## 12. Problemas Comuns

**"Erro ao carregar dados"**
- Verifique se o servidor está rodando
- Confirme conexão com MySQL
- Abra o console do browser (F12) e verifique erros de rede

**Tabelas aparecem vazias**
- Confirme que o banco `sistema_pedidos` tem dados
- Verifique se o Sequelize sincronizou (log "Banco sincronizado!" no terminal)

**Gráficos de relatório vazios**
- Necessário ter vendas cadastradas no período filtrado
- Tente o filtro "Mês" para ampliar o intervalo

**Login do gerente não funciona no Railway**
- Verifique variáveis `GERENTE_LOGIN` e `GERENTE_SENHA` no serviço da aplicação
- Valores corretos: `admin` / `admin123`

---

*Food Truck System v3.1 — Projeto Aplicado III | SENAI SC | Equipe 10 | 2026*
