# 🧪 Guia de Testes - Food Truck System

Este guia ajudará você a testar todas as funcionalidades do sistema.

## 🚀 Pré-requisitos

1. **MySQL rodando** na porta 3306
2. **Banco de dados criado** (ver script abaixo)
3. **Arquivo .env configurado**
4. **Servidor iniciado** com `npm run dev`

## 📦 Script de Criação do Banco

Execute no MySQL:

```sql
-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS foodtruck_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar o banco
USE foodtruck_db;

-- O Sequelize criará as tabelas automaticamente ao iniciar o servidor
```

## ✅ Checklist de Testes

### 1. Dashboard (📊)
- [ ] Acesse http://localhost:3000
- [ ] Verifique se os cards de estatísticas aparecem
- [ ] Observe os gráficos (podem estar vazios inicialmente)
- [ ] Cards devem mostrar: Quantidade de Vendas, Faturamento Total, Ticket Médio

### 2. Atendentes (👥)

#### Criar Atendente
- [ ] Clique na aba "Atendentes"
- [ ] Clique em "➕ Novo Atendente"
- [ ] Preencha os dados:
  - Nome: João Silva
  - CPF: 12345678901
  - Telefone: 11999999999
  - Login: joao.silva
  - Senha: 123456
  - Tipo: Atendente
- [ ] Clique em "💾 Salvar"
- [ ] Verifique se aparece mensagem de sucesso
- [ ] Confirme se o atendente aparece na tabela

#### Editar Atendente
- [ ] Clique em "✏️ Editar" no atendente criado
- [ ] Altere o telefone
- [ ] Clique em "💾 Salvar"
- [ ] Verifique se as alterações foram salvas

#### Excluir Atendente
- [ ] Clique em "🗑️ Excluir"
- [ ] Confirme a exclusão
- [ ] Verifique se o atendente foi removido

**Repita o processo de criação para ter atendentes para os próximos testes**

### 3. Produtos (🍔)

#### Criar Produto
- [ ] Clique na aba "Produtos"
- [ ] Clique em "➕ Novo Produto"
- [ ] Preencha os dados:
  - Nome: X-Burger Especial
  - Categoria: Hambúrguer
  - Preço: 25.90
  - Estoque: 50
  - Status: Ativo
  - Descrição: Hambúrguer com queijo, bacon e molho especial
- [ ] Clique em "💾 Salvar"
- [ ] Verifique na tabela

#### Produtos Sugeridos para Testar
Crie mais alguns produtos:
1. Batata Frita Grande (Acompanhamento) - R$ 12.00
2. Refrigerante Lata (Bebida) - R$ 5.00
3. Hot Dog Completo (Cachorro-Quente) - R$ 15.00
4. Milkshake Chocolate (Sobremesa) - R$ 18.00

#### Editar e Excluir
- [ ] Teste editar um produto
- [ ] Teste alterar status para "Inativo"
- [ ] Teste excluir um produto

### 4. Mesas (🪑)

#### Criar Mesas
- [ ] Clique na aba "Mesas"
- [ ] Crie 5 mesas numeradas de 1 a 5
- [ ] Todas com status "Livre"
- [ ] Verifique na tabela

#### Alterar Status
- [ ] Edite a Mesa 1
- [ ] Altere status para "Ocupada"
- [ ] Salve e verifique

### 5. Pedidos (📝)

#### Criar Pedido
- [ ] Clique na aba "Pedidos"
- [ ] Clique em "➕ Novo Pedido"
- [ ] Selecione uma Mesa
- [ ] Selecione um Atendente
- [ ] Status: Aberto
- [ ] Total: 50.90
- [ ] Observações: Cliente pediu sem cebola
- [ ] Salve e verifique

#### Criar Mais Pedidos
Crie pelo menos 3 pedidos diferentes com:
- Diferentes mesas
- Diferentes atendentes
- Diferentes valores
- Status variados (Aberto, Finalizado)

#### Editar Pedido
- [ ] Altere status de um pedido para "Finalizado"
- [ ] Adicione forma de pagamento
- [ ] Salve e verifique

### 6. Vendas (💰)

#### Registrar Venda
- [ ] Clique na aba "Vendas"
- [ ] Clique em "➕ Nova Venda"
- [ ] Selecione um Pedido "Finalizado"
- [ ] Escolha forma de pagamento (PIX, Crédito, etc.)
- [ ] Informe o valor total
- [ ] Salve e verifique

**Nota:** Ao criar uma venda, o pedido automaticamente vai para status "Pago"

#### Criar Várias Vendas
- [ ] Registre pelo menos 5 vendas
- [ ] Use diferentes formas de pagamento
- [ ] Use valores variados

### 7. Verificar Dashboard Atualizado

Após criar vendas:
- [ ] Volte à aba "Dashboard"
- [ ] Clique em "🔄 Atualizar" se necessário
- [ ] Verifique se:
  - Quantidade de Vendas está correta
  - Faturamento Total está correto
  - Ticket Médio foi calculado
  - Gráfico de Faturamento por Dia mostra dados
  - Gráfico de Vendas por Pagamento mostra distribuição

## 🧪 Testes de Validação

### Campos Obrigatórios
- [ ] Tente salvar um atendente sem nome (deve dar erro)
- [ ] Tente salvar um produto sem preço (deve dar erro)
- [ ] Tente salvar um pedido sem mesa (deve dar erro)

### Exclusão com Dependências
- [ ] Tente excluir um atendente que tem pedidos
- [ ] Tente excluir uma mesa que tem pedidos
- [ ] Observe se há tratamento de erro

### Atualização em Tempo Real
- [ ] Crie um novo item
- [ ] Verifique se aparece na tabela sem precisar recarregar
- [ ] Edite um item
- [ ] Verifique a atualização imediata

## 🎨 Testes de Interface

### Responsividade
- [ ] Redimensione a janela do browser
- [ ] Teste no tamanho mobile (< 768px)
- [ ] Verifique se menu fica vertical
- [ ] Verifique se tabelas são scrolláveis

### Navegação
- [ ] Teste todas as abas do menu
- [ ] Verifique se a aba ativa tem destaque dourado
- [ ] Confirme transições suaves

### Modais
- [ ] Abra um modal
- [ ] Clique fora do modal (deve fechar)
- [ ] Clique no X (deve fechar)
- [ ] Clique em Cancelar (deve fechar)

### Alertas
- [ ] Crie um item (deve aparecer alerta verde de sucesso)
- [ ] Tente criar item inválido (deve aparecer alerta vermelho)
- [ ] Verifique se alerta desaparece após 3 segundos

## 📊 Testes de Relatórios

### Vendas por Dia
- [ ] Crie vendas em dias diferentes
- [ ] Verifique se o gráfico agrupa por dia
- [ ] Confirme valores corretos

### Vendas por Pagamento
- [ ] Crie vendas com PIX, Crédito, Débito, Dinheiro
- [ ] Verifique distribuição no gráfico de pizza
- [ ] Confirme percentuais

### Resumo Geral
- [ ] Calcule manualmente:
  - Total de vendas criadas
  - Soma dos valores
  - Média (soma / quantidade)
- [ ] Compare com os valores mostrados
- [ ] Verifique formatação R$

## 🐛 Testes de Erro

### Servidor Desligado
- [ ] Desligue o servidor
- [ ] Tente criar um item
- [ ] Verifique mensagem de erro

### Dados Inválidos
- [ ] Tente inserir texto em campo numérico
- [ ] Tente CPF com letras
- [ ] Verifique validações

## ✨ Cenário Completo de Teste

Execute este fluxo do início ao fim:

1. **Preparação**
   - Crie 2 atendentes (João e Maria)
   - Crie 5 produtos diferentes
   - Crie 3 mesas (1, 2, 3)

2. **Operação 1**
   - Mesa 1 está ocupada
   - João atende
   - Pedido: X-Burger + Batata + Refrigerante = R$ 42,90
   - Status: Aberto

3. **Operação 2**
   - Mesa 2 está ocupada
   - Maria atende
   - Pedido: Hot Dog + Milkshake = R$ 33,00
   - Status: Aberto

4. **Finalização**
   - Altere pedido da Mesa 1 para "Finalizado"
   - Registre venda: PIX, R$ 42,90
   - Altere pedido da Mesa 2 para "Finalizado"
   - Registre venda: Crédito, R$ 33,00

5. **Verificação**
   - Dashboard deve mostrar:
     - 2 vendas
     - R$ 75,90 de faturamento
     - R$ 37,95 de ticket médio
   - Gráficos devem refletir os dados

## 📝 Resultado Esperado

Ao final dos testes, você deve ter:
- ✅ 2+ Atendentes cadastrados
- ✅ 5+ Produtos cadastrados
- ✅ 3+ Mesas cadastradas
- ✅ 3+ Pedidos criados
- ✅ 2+ Vendas registradas
- ✅ Dashboard com dados reais
- ✅ Gráficos funcionando
- ✅ Todas as operações CRUD testadas

## 🆘 Problemas Comuns

### "Erro ao carregar dados"
- Verifique se o servidor está rodando
- Confirme conexão com MySQL
- Verifique console do browser (F12)

### Tabelas não aparecem
- Verifique se o Sequelize sincronizou o banco
- Olhe logs do servidor
- Confirme credenciais no .env

### Gráficos não carregam
- Certifique-se de ter vendas cadastradas
- Verifique console do browser
- Recarregue a página

### Modal não fecha
- Clique no X ou fora do modal
- Pressione ESC
- Recarregue a página se necessário

---

**Boa sorte nos testes! 🚀**
