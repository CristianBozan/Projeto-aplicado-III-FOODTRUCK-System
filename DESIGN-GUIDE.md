# 🎨 Guia Visual - Food Truck System

## Paleta de Cores

### Cores Principais
- **Vermelho Principal:** `#C41E3A` - Usado em headers, botões primários
- **Dourado Principal:** `#DAA520` - Usado em destaques, botões secundários
- **Branco:** `#FFFFFF` - Backgrounds, textos em fundos escuros

### Cores Complementares
- **Vermelho Escuro:** `#8B1228` - Gradientes, hover states
- **Dourado Escuro:** `#B8860B` - Hover states
- **Dourado Claro:** `#FFD700` - Destaques visuais
- **Cinza Claro:** `#F5F5F5` - Backgrounds secundários
- **Cinza Escuro:** `#333333` - Textos principais

## Componentes da Interface

### 1. Header (Cabeçalho)
- Fundo: Gradiente vermelho (#C41E3A → #8B1228)
- Texto: Branco com destaque dourado no nome "Food Truck"
- Efeito: Box shadow para profundidade

### 2. Menu de Navegação
- Fundo: Branco
- Borda inferior: 3px dourado
- Hover: Fundo vermelho com texto branco
- Ativo: Fundo dourado com texto branco

### 3. Botões

#### Botão Primário (Vermelho)
- Fundo: Gradiente vermelho
- Efeito hover: Elevação (translateY -2px)
- Uso: Ações principais (Salvar, Criar)

#### Botão Secundário (Dourado)
- Fundo: Gradiente dourado
- Efeito hover: Elevação (translateY -2px)
- Uso: Ações secundárias (Atualizar, Cancelar)

### 4. Cards
- Fundo: Branco
- Borda superior: 4px dourado
- Box shadow: Sombra suave
- Border radius: 12px

### 5. Tabelas
- Header: Gradiente vermelho com texto branco
- Hover nas linhas: Fundo dourado 5% de opacidade
- Bordas: Cinza claro

### 6. Modais
- Overlay: Preto 60% de transparência
- Conteúdo: Branco com borda dourada no topo
- Animação: Slide up + fade in

### 7. Badges de Status
- **Ativo/Livre/Aberto:** Verde claro
- **Inativo/Ocupada/Finalizado:** Amarelo claro
- **Pago:** Azul claro

### 8. Alertas
- **Sucesso:** Verde com borda esquerda
- **Erro:** Vermelho com borda esquerda
- **Info:** Azul com borda esquerda

## Hierarquia Visual

### Títulos
- H1: 2rem, Bold, Vermelho
- H2: 1.8rem, Bold, Vermelho
- H3: 1.5rem, Bold, Vermelho

### Textos
- Corpo: 1rem, Cinza escuro
- Labels: 0.95rem, Bold, Cinza escuro
- Small: 0.85rem

## Espaçamentos

### Padding
- Cards: 2rem
- Botões: 0.8rem × 1.8rem
- Inputs: 0.8rem
- Modais: 2rem

### Margins
- Entre seções: 2rem
- Entre elementos: 1.5rem
- Entre cards: 2rem

## Responsividade

### Breakpoints
- Desktop: > 768px
- Mobile: ≤ 768px

### Mobile
- Menu: Vertical
- Grid forms: 1 coluna
- Tabelas: Fonte reduzida
- Botões: Width 100%

## Animações

### Transições
- Duração padrão: 0.3s
- Easing: ease
- Elementos: background, color, transform, box-shadow

### Efeitos
- **Fade In:** Opacity 0 → 1
- **Slide Up:** TranslateY(50px) → 0
- **Slide Down:** TranslateY(-20px) → 0
- **Hover:** TranslateY(-2px) + shadow

## Ícones e Emojis

- 🚚 Food Truck
- 📊 Dashboard
- 👥 Atendentes
- 🍔 Produtos
- 🪑 Mesas
- 📝 Pedidos
- 💰 Vendas
- ✏️ Editar
- 🗑️ Excluir
- ➕ Adicionar
- 🔄 Atualizar
- 💾 Salvar
- ❌ Cancelar

## Princípios de Design

1. **Consistência:** Mesmos padrões em toda interface
2. **Hierarquia:** Elementos importantes em destaque (dourado/vermelho)
3. **Feedback:** Alertas e animações para ações do usuário
4. **Clareza:** Textos objetivos e ícones intuitivos
5. **Acessibilidade:** Contraste adequado, fontes legíveis
6. **Responsividade:** Adaptação para diferentes dispositivos

## Exemplos de Uso

### Ação de Sucesso
- Cor: Verde
- Mensagem: "Item criado com sucesso!"
- Duração: 3 segundos

### Ação de Erro
- Cor: Vermelho
- Mensagem: "Erro ao salvar item"
- Duração: 3 segundos

### Confirmação de Exclusão
- Modal nativo do browser
- Pergunta: "Tem certeza que deseja excluir?"
- Ações: Confirmar ou Cancelar
