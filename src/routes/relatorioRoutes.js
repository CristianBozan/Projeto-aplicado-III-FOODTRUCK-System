const express = require("express");
const router = express.Router();
const relatorioController = require("../controllers/relatorioController");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

router.get("/vendas-por-dia",      requireAuth, requireRole('gerente'), relatorioController.vendasPorDia);
router.get("/vendas-por-pagamento", requireAuth, requireRole('gerente'), relatorioController.vendasPorPagamento);
router.get("/vendas-por-atendente", requireAuth, requireRole('gerente'), relatorioController.vendasPorAtendente);
router.get("/resumo",              requireAuth, requireRole('gerente'), relatorioController.resumo);

module.exports = router;
