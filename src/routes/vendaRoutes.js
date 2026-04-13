const express = require("express");
const router = express.Router();
const vendaController = require("../controllers/vendaController");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

router.get("/",    requireAuth, vendaController.listar);
router.get("/:id", requireAuth, vendaController.buscarPorId);
router.post("/",   requireAuth, vendaController.criar);
router.delete("/:id", requireAuth, requireRole('gerente', 'admin'), vendaController.deletar);

module.exports = router;
