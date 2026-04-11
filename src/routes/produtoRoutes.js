const express = require("express");
const router = express.Router();
const produtoController = require("../controllers/produtoController");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

router.use(requireAuth);

// Leitura: todos os usuários autenticados
router.get("/",    produtoController.listar);
router.get("/:id", produtoController.buscarPorId);

// Escrita: somente gerente
router.post("/",      requireRole('gerente'), produtoController.criar);
router.put("/:id",    requireRole('gerente'), produtoController.atualizar);
router.delete("/:id", requireRole('gerente'), produtoController.deletar);

module.exports = router;
