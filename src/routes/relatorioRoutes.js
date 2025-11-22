const express = require("express");
const router = express.Router();
const relatorioController = require("../controllers/relatorioController");

router.get("/vendas-por-dia", relatorioController.vendasPorDia);
router.get("/vendas-por-pagamento", relatorioController.vendasPorPagamento);
router.get("/vendas-por-atendente", relatorioController.vendasPorAtendente);
router.get("/resumo", relatorioController.resumo);

module.exports = router;
