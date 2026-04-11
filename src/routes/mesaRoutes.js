const express = require("express");
const router = express.Router();
const mesaController = require("../controllers/mesaController");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

router.use(requireAuth);

router.get("/",    mesaController.listar);
router.get("/:id", mesaController.buscarPorId);

// Criação e exclusão de mesas: somente gerente
router.post("/",      requireRole('gerente'), mesaController.criar);
router.put("/:id",    mesaController.atualizar); // atualizar status da mesa (ex: ocupada) qualquer autenticado
router.delete("/:id", requireRole('gerente'), mesaController.deletar);

module.exports = router;
