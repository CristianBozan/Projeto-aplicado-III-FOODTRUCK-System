const express = require("express");
const router = express.Router();
const itemPedidoController = require("../controllers/itemPedidoController");
const requireAuth = require("../middleware/requireAuth");

router.get("/",    requireAuth, itemPedidoController.listar);
router.get("/:id", requireAuth, itemPedidoController.buscarPorId);
router.post("/",   requireAuth, itemPedidoController.criar);
router.put("/:id", requireAuth, itemPedidoController.atualizar);
router.delete("/:id", requireAuth, itemPedidoController.deletar);

module.exports = router;
