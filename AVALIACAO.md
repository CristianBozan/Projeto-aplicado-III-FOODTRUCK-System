# Guia de Avaliação — Food Truck System v3.3

**Projeto Aplicado III — Equipe 10 | Centro Universitário SENAI Santa Catarina**

---

## Acesso ao Sistema

| Campo | Valor |
|---|---|
| **URL** | https://projeto-aplicado-iii-foodtruck-system-production.up.railway.app |
| **Login** | `avaliador` |
| **Senha** | `Senai@2026` |
| **Nível de acesso** | Gerente (acesso completo a todas as funcionalidades) |

> Essas credenciais são exclusivas para avaliação. O acesso de gerente do proprietário é separado e configurado fora do repositório.

---

## O que pode ser avaliado

### Gestão de Produtos
- Cadastrar novo produto com nome, categoria, preço, estoque e foto
- Editar produto existente
- Remover produto
- Buscar por nome ou filtrar por categoria

### Atendimento (Pedidos)
- Selecionar mesa (ou marcar como "Para Viagem")
- Adicionar itens ao carrinho pelo cardápio com filtro de categoria
- Aplicar desconto (R$ fixo ou %)
- Confirmar pedido → estoque decrementado automaticamente
- O carrinho persiste no navegador (sobrevive a recarregamentos)

### Painel da Cozinha (KDS)
- Visualizar pedidos em tempo real nas colunas: Novos / Em Preparo / Prontos
- Avançar status: Iniciar Preparo → Marcar Pronto → Entregar e Cobrar
- Som de notificação ao chegar novo pedido (auto-refresh a cada 15s)

### Pedidos
- Listar todos os pedidos com filtro de status e data
- Cancelar pedido → estoque restaurado automaticamente
- Paginação (100 por página com "Carregar mais")

### Vendas
- Visualizar histórico de vendas registradas automaticamente ao finalizar pedido

### Estoque
- Ver quantidade atual de cada produto
- Histórico de movimentações com tipo (saída / entrada / ajuste) e data/hora

### Relatórios
- Filtrar por período: hoje, semana, mês, personalizado
- Faturamento total, ticket médio, pedidos concluídos
- Gráfico de vendas por dia
- **Exportar para Excel (.xlsx)**

### Mesas
- Cadastrar, editar e remover mesas
- Visualizar status (livre / ocupada)

### Atendentes
- Cadastrar atendente com papel `atendente` ou `gerente`
- Editar nome, login e senha

### Backups
- Criar backup manual com nome personalizado
- Baixar backup em JSON ou Excel
- Restaurar backup (modo `safe` ou `force`)

### Perfil
- Editar nome, login e senha do usuário logado diretamente no cabeçalho

---

## Como restaurar os dados após a avaliação

Caso queira voltar ao estado inicial depois dos testes:

### Opção 1 — Restaurar pelo sistema (recomendado)

1. Logue como gerente (credenciais do proprietário, não as de avaliação)
2. Vá em **Backups**
3. Localize o backup `demo_avaliacao` criado antes da avaliação
4. Clique em **Restaurar → Modo Force**

### Opção 2 — Repopular produtos e mesas via script

```bash
# Repopula com o cardápio completo (24 produtos + 10 mesas)
GERENTE_LOGIN=<login> GERENTE_SENHA=<senha> node scripts/seed-produtos.js
```

### Opção 3 — Remover o usuário avaliador após a avaliação

Se quiser desabilitar o acesso de avaliação:

1. Logue como gerente
2. Vá em **Atendentes**
3. Localize "Avaliador Demo" e clique em **Remover**

---

## Como configurar o ambiente de avaliação (desenvolvedor)

Execute uma vez antes de compartilhar as credenciais:

```bash
# Produção (Railway)
GERENTE_LOGIN=<seu_login> GERENTE_SENHA=<sua_senha> BACKUP_TOKEN=<seu_token> node scripts/setup-avaliador.js

# Local
BASE_URL=http://localhost:3000 GERENTE_LOGIN=admin GERENTE_SENHA=<senha> BACKUP_TOKEN=<token> node scripts/setup-avaliador.js
```

O script:
- Cria o usuário `avaliador` com papel `gerente` (se ainda não existir)
- Faz um backup snapshot nomeado `demo_avaliacao` para restauração posterior
- Exibe as credenciais prontas para compartilhar

---

## Notas de segurança

- O avaliador **não tem acesso** ao Railway, ao banco de dados, às variáveis de ambiente nem às credenciais do proprietário
- O endpoint de backup exige um token separado (`BACKUP_TOKEN`) que **não está disponível** para o usuário avaliador — apenas para o desenvolvedor
- Todos os dados de teste são fictícios — nenhum dado pessoal real é utilizado no sistema de demonstração
