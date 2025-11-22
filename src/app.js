const express = require("express");
const app = express();
const sequelize = require("./config/database");
const path = require("path");
// importa as rotas
const atendenteRoutes = require("./routes/atendenteRoutes");
const produtoRoutes = require("./routes/produtoRoutes"); // 👈 aqui junto com os outros consts
const mesaRoutes = require("./routes/mesaRoutes");
const pedidoRoutes = require("./routes/pedidoRoutes");
const itemPedidoRoutes = require("./routes/itemPedidoRoutes");
const vendaRoutes = require("./routes/vendaRoutes");
const relatorioRoutes = require("./routes/relatorioRoutes");
const backupRoutes = require("./routes/backupRoutes");
const auditoriaRoutes = require("./routes/auditoriaRoutes");
const backupController = require("./controllers/backupController");
const cron = require('node-cron');
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");

// middlewares
app.use(express.json());

// servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, "../public")));

// usa as rotas
app.use("/atendentes", atendenteRoutes);
app.use("/produtos", produtoRoutes);
app.use("/mesas", mesaRoutes);
app.use("/pedidos", pedidoRoutes);
app.use("/itens-pedido", itemPedidoRoutes);
app.use("/vendas", vendaRoutes);
app.use("/relatorios", relatorioRoutes);
app.use('/backups', backupRoutes);
app.use('/auditoria/estoque', auditoriaRoutes);
app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);
console.log('Mounted authRoutes at /auth');

// quick inline test route to verify POST handling at /auth/test
app.post('/auth/test', (req, res) => {
  res.json({ ok: true, body: req.body || null });
});
// rota inicial
app.get("/", (req, res) => {
  res.send("API do Food Truck rodando 🚚🔥");
});

// rota de debug para listar rotas registradas (temporária)
app.get('/__routes', (req, res) => {
  try {
    const routes = [];
    app._router.stack.forEach(mw => {
      if (!mw.route) return; // middleware
      const path = mw.route.path;
      const methods = Object.keys(mw.route.methods).join(',');
      routes.push({ path, methods });
    });
    return res.json({ routes });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// sincroniza banco e inicia servidor
sequelize.sync().then(() => {
  console.log("Banco sincronizado!");
  app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
  // Agendar backup diário às 05:00
  try {
    cron.schedule('0 5 * * *', async () => {
      try {
        const nome = null; // createBackup gera nome padrão quando null
        await backupController.createBackup(nome);
        console.log('Backup automático criado às', new Date().toISOString());
      } catch (err) {
        console.error('Erro ao criar backup automático:', err);
      }
    }, { timezone: 'America/Sao_Paulo' });
    console.log('Agendador de backup diário ativado (05:00).');
  } catch (e) {
    console.error('Erro ao ativar cron de backup:', e);
  }
  // lista de rotas registradas (debug)
  try {
    const list = [];
    app._router.stack.forEach(mw => {
      if (!mw.route) return;
      list.push({ path: mw.route.path, methods: Object.keys(mw.route.methods) });
    });
    console.log('Registered routes (sample):', list.map(r => `${r.methods.join('|')} ${r.path}`).slice(0,50));
  } catch (e) {}
});
