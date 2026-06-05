/**
 * Adiciona +50 unidades ao estoque de cada produto
 * e garante que as fotos estejam preenchidas.
 * Execute com:  npm run restock
 */

require("dotenv").config();
const sequelize = require("../src/config/database");
const Produto   = require("../src/models/Produto");

const FOTOS = {
  // Lanches
  "X-Burguer Clássico":          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
  "X-Burguer":                   "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
  "X-Bacon":                     "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80",
  "X-Salada":                    "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80",
  "X-Frango":                    "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&q=80",
  "X-Tudo":                      "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&q=80",
  "Hot-Dog Tradicional":         "https://images.unsplash.com/photo-1619740455993-9d622aad2d58?w=400&q=80",
  "Hot-Dog Especial":            "https://images.unsplash.com/photo-1612392061787-2b8e9a0c7b6f?w=400&q=80",
  "Hot Dog Simples":             "https://images.unsplash.com/photo-1619740455993-9d622aad2d58?w=400&q=80",
  "Misto Quente":                "https://images.unsplash.com/photo-1528736235302-52922df5c122?w=400&q=80",
  "Bauru":                       "https://images.unsplash.com/photo-1481070414801-51fd732d7184?w=400&q=80",
  // Bebidas
  "Coca-Cola Lata":              "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&q=80",
  "Guaraná Antarctica":          "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80",
  "Suco de Laranja Natural":     "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80",
  "Suco de Laranja":             "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80",
  "Suco de Maracujá":            "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80",
  "Água Mineral":                "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80",
  "Água com Gás":                "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&q=80",
  "Café Expresso":               "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&q=80",
  "Milk-shake Chocolate":        "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80",
  "Milkshake":                   "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80",
  // Sobremesas
  "Brownie de Chocolate":        "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80",
  "Pudim de Leite":              "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=80",
  "Sorvete 2 Bolas":             "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&q=80",
  "Churros com Doce de Leite":   "https://images.unsplash.com/photo-1624371414361-e670edf6e3e8?w=400&q=80",
  // Porções
  "Batata Frita P":              "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80",
  "Batata Frita M":              "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80",
  "Batata Frita G":              "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400&q=80",
  "Onion Rings":                 "https://images.unsplash.com/photo-1639024471283-3a2b65c6de44?w=400&q=80",
};

async function restock() {
  await sequelize.authenticate();
  await sequelize.sync();
  console.log("✔  Banco conectado\n");
  console.log("── Reabastecimento (+50 unidades) ───────────────────");

  const produtos = await Produto.findAll();

  for (const p of produtos) {
    const novoEstoque = p.quantidade_estoque + 50;
    const foto = FOTOS[p.nome] || p.foto || null;

    await p.update({ quantidade_estoque: novoEstoque, foto, status: "ativo" });

    console.log(
      `  ✔ ${p.nome.padEnd(18)}  ${String(p.quantidade_estoque - 50).padStart(3)} → ${String(novoEstoque).padStart(3)} unidades` +
      (foto ? "  📷" : "")
    );
  }

  console.log("\n  Reabastecimento concluído!\n");
  await sequelize.close();
}

restock().catch(err => {
  console.error("\n❌ Erro:", err.message);
  process.exit(1);
});
