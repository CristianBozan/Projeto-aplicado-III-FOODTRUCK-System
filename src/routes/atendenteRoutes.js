const express = require("express");
const router = express.Router();
const atendenteController = require("../controllers/atendenteController");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

router.get("/",    requireAuth, atendenteController.listar);
router.get("/:id", requireAuth, atendenteController.buscarPorId);
router.post("/",   requireAuth, requireRole('gerente'), atendenteController.criar);
router.put("/:id", requireAuth, requireRole('gerente'), atendenteController.atualizar);
router.delete("/:id", requireAuth, requireRole('gerente'), atendenteController.deletar);

module.exports = router;
