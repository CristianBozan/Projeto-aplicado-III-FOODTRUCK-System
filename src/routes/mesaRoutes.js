const express = require("express");
const router = express.Router();
const mesaController = require("../controllers/mesaController");

router.get("/", mesaController.listar);
router.get("/:id", mesaController.buscarPorId);
router.post("/", mesaController.criar);
router.put("/:id", mesaController.atualizar);
router.delete("/:id", mesaController.deletar);

module.exports = router;
