const express = require("express");
const app = express();
const sequelize = require("./config/database");
const path = require("path");
const cron = require("node-cron");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Associações entre models (deve vir antes das rotas)
require("./models/associations");

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

// Segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:    ["'self'"],
      scriptSrc:     ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc:      ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc:        ["'self'", "data:", "blob:", "https:"],
      connectSrc:    ["'self'", "https://cdn.jsdelivr.net"],
      fontSrc:       ["'self'", "https://fonts.gstatic.com"],
      objectSrc:     ["'none'"],
      frameSrc:      ["'none'"],
      upgradeInsecureRequests: [],
    }
  }
}));

const allowedOrigins = process.env.ALLOWED_ORIGINS || '*';
app.use(cors({ origin: allowedOrigins }));

// Rate limiting — login mais restrito
const limiterGeral = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
const limiterLogin = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' } });
app.use('/auth/login', limiterLogin);
app.use(limiterGeral);

// Middlewares
app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, "../public")));

// Pasta de imagens local — opcional, não existe em produção na nuvem
const fs = require('fs');
const imagensPath = path.join(__dirname, '../../Imagens');
if (fs.existsSync(imagensPath)) {
  app.use('/imagens', express.static(imagensPath));
}

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

// Middleware de erro global — oculta detalhes internos em produção
app.use((err, req, res, _next) => {
  console.error('[ERROR]', err.message);
  const isProd = process.env.NODE_ENV === 'production';
  res.status(err.status || 500).json({
    error: isProd ? 'Erro interno no servidor.' : err.message
  });
});

// Inicia servidor (apenas quando executado diretamente, não em testes)
const PORT = process.env.PORT || 3000;

if (require.main === module) {
  sequelize.query(
    "ALTER TABLE estoque_logs MODIFY COLUMN acao ENUM('saida','entrada','ajuste') NOT NULL"
  ).catch(() => {}).then(() => sequelize.sync()).then(() => {
    console.log("Banco sincronizado!");

    app.listen(PORT, () => {
      console.log(`Food Truck System v3.0 rodando em http://localhost:${PORT}`);
    });

    // Backup automático diário às 05:00 via syncService
    cron.schedule("0 5 * * *", () => syncService.backupAutomatico(), { timezone: "America/Sao_Paulo" });
  });
}

module.exports = app;
