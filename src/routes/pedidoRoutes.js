const express = require("express");
const router = express.Router();
const pedidoController = require("../controllers/pedidoController");
const requireAuth = require("../middleware/requireAuth");

router.use(requireAuth);

router.get("/",          pedidoController.listar);
router.get("/:id",       pedidoController.buscarPorId);
router.post("/",         pedidoController.criar);
router.put("/:id",       pedidoController.atualizar);
router.patch("/:id/status", pedidoController.atualizarStatus);
router.delete("/:id",    pedidoController.deletar);

module.exports = router;
