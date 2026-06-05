/**
 * Corrige fotos quebradas em produtos específicos.
 * Execute com:  node scripts/fix-fotos.js
 */

require("dotenv").config();
const sequelize = require("../src/config/database");
const Produto   = require("../src/models/Produto");

const CORRECOES = {
  "Hot-Dog Tradicional":       "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=400&q=80",
  "Hot-Dog Especial":          "https://images.unsplash.com/photo-1583835746434-cf1534674b41?w=400&q=80",
  "Hot Dog Simples":           "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=400&q=80",
  "Churros com Doce de Leite": "https://images.unsplash.com/photo-1617197829765-67afc12e1264?w=400&q=80",
  "Onion Rings":               "https://images.unsplash.com/photo-1630585843736-c48e7e9399a5?w=400&q=80",
};

async function fixFotos() {
  await sequelize.authenticate();
  await sequelize.sync();
  console.log("✔  Banco conectado\n");
  console.log("── Corrigindo fotos ─────────────────────────────────");

  for (const [nome, foto] of Object.entries(CORRECOES)) {
    const produto = await Produto.findOne({ where: { nome } });
    if (!produto) {
      console.log(`  ✗ Não encontrado: ${nome}`);
      continue;
    }
    await produto.update({ foto });
    console.log(`  ✔ ${nome}`);
    console.log(`    ${foto}\n`);
  }

  console.log("  Fotos corrigidas!\n");
  await sequelize.close();
}

fixFotos().catch(err => {
  console.error("\n❌ Erro:", err.message);
  process.exit(1);
});
