const express = require("express");
const router = express.Router();
const atendenteController = require("../controllers/atendenteController");

router.get("/", atendenteController.listar);
router.get("/:id", atendenteController.buscarPorId);
router.post("/", atendenteController.criar);
router.put("/:id", atendenteController.atualizar);
router.delete("/:id", atendenteController.deletar);

module.exports = router;
