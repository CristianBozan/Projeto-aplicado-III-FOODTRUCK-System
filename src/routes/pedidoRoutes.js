const express = require("express");
const router = express.Router();
const pedidoController = require("../controllers/pedidoController");
const requireAuth = require("../middleware/requireAuth");

router.get("/",             requireAuth, pedidoController.listar);
router.get("/:id",          requireAuth, pedidoController.buscarPorId);
router.post("/",            requireAuth, pedidoController.criar);
router.put("/:id",          requireAuth, pedidoController.atualizar);
router.patch("/:id/status", requireAuth, pedidoController.atualizarStatus);
router.delete("/:id",       requireAuth, pedidoController.deletar);

module.exports = router;
