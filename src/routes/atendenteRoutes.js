const express = require("express");
const router = express.Router();
const atendenteController = require("../controllers/atendenteController");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

router.use(requireAuth);

// Leitura: todos autenticados (atendente precisa ver a lista para o carrinho)
router.get("/",    atendenteController.listar);
router.get("/:id", atendenteController.buscarPorId);

// Escrita e exclusão: somente gerente
router.post("/",      requireRole('gerente'), atendenteController.criar);
router.put("/:id",    requireRole(['gerente', 'atendente']), atendenteController.atualizar); // atendente edita próprio perfil
router.delete("/:id", requireRole('gerente'), atendenteController.deletar);

module.exports = router;
