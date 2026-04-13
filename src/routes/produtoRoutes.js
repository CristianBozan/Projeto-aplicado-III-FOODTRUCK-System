const express = require("express");
const router = express.Router();
const produtoController = require("../controllers/produtoController");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

router.get("/",    requireAuth, produtoController.listar);
router.get("/:id", requireAuth, produtoController.buscarPorId);
router.post("/",   requireAuth, requireRole('gerente', 'admin'), produtoController.criar);
router.put("/:id", requireAuth, requireRole('gerente', 'admin'), produtoController.atualizar);
router.delete("/:id", requireAuth, requireRole('gerente', 'admin'), produtoController.deletar);

module.exports = router;
