const express = require("express");
const router = express.Router();
const mesaController = require("../controllers/mesaController");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

router.get("/",    requireAuth, mesaController.listar);
router.get("/:id", requireAuth, mesaController.buscarPorId);
router.post("/",   requireAuth, requireRole('gerente', 'admin'), mesaController.criar);
router.put("/:id", requireAuth, mesaController.atualizar);
router.delete("/:id", requireAuth, requireRole('gerente', 'admin'), mesaController.deletar);

module.exports = router;
