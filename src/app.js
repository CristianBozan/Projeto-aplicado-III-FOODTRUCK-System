const express = require("express");
const app = express();
const sequelize = require("./config/database");
const path = require("path");
const cron = require("node-cron");
require("dotenv").config();

// Rotas
const authRoutes            = require("./routes/authRoutes");
const adminRoutes           = require("./routes/adminRoutes");
const atendenteRoutes       = require("./routes/atendenteRoutes");
const produtoRoutes         = require("./routes/produtoRoutes");
const mesaRoutes            = require("./routes/mesaRoutes");
const pedidoRoutes          = require("./routes/pedidoRoutes");
const itemPedidoRoutes      = require("./routes/itemPedidoRoutes");
const vendaRoutes           = require("./routes/vendaRoutes");
const relatorioRoutes       = require("./routes/relatorioRoutes");
const backupRoutes          = require("./routes/backupRoutes");
const auditoriaRoutes       = require("./routes/auditoriaRoutes");
const sincronizacaoRoutes   = require("./routes/sincronizacaoRoutes");
const syncService           = require("./services/syncService");

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
app.use('/imagens', express.static(path.join(__dirname, '../../Imagens')));

// Registro de rotas
app.use("/auth",              authRoutes);
app.use("/admin",             adminRoutes);
app.use("/atendentes",        atendenteRoutes);
app.use("/produtos",          produtoRoutes);
app.use("/mesas",             mesaRoutes);
app.use("/pedidos",           pedidoRoutes);
app.use("/itens-pedido",      itemPedidoRoutes);
app.use("/vendas",            vendaRoutes);
app.use("/relatorios",        relatorioRoutes);
app.use("/backups",           backupRoutes);
app.use("/auditoria/estoque", auditoriaRoutes);
app.use("/sincronizacoes",    sincronizacaoRoutes);

// Inicia servidor
const PORT = process.env.PORT || 3000;

sequelize.sync().then(() => {
  console.log("Banco sincronizado!");

  app.listen(PORT, () => {
    console.log(`Food Truck System v3.0 rodando em http://localhost:${PORT}`);
  });

  // Backup automático diário às 05:00 via syncService
  cron.schedule("0 5 * * *", () => syncService.backupAutomatico(), { timezone: "America/Sao_Paulo" });
});
