const request = require("supertest");
const app     = require("../src/app");
const sequelize = require("../src/config/database");

// ─── Setup / Teardown ────────────────────────────────────────────────────────

let token;         // JWT do gerente
let idPedidoCriado; // ID do pedido criado nos testes

beforeAll(async () => {
  await sequelize.authenticate();
  await sequelize.sync();

  // Faz login com as credenciais de gerente do .env
  const res = await request(app)
    .post("/auth/login")
    .send({ username: process.env.GERENTE_LOGIN || "admin", password: process.env.GERENTE_SENHA || "admin123" });

  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  token = res.body.token;
});

afterAll(async () => {
  // Remove o pedido criado durante os testes para não sujar o banco
  if (idPedidoCriado) {
    await request(app)
      .delete(`/pedidos/${idPedidoCriado}`)
      .set("Authorization", `Bearer ${token}`);
  }
  await sequelize.close();
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function auth(req) {
  return req.set("Authorization", `Bearer ${token}`);
}

// ─── Testes de autenticação ───────────────────────────────────────────────────

describe("Auth", () => {
  test("login com credenciais válidas retorna token", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ username: process.env.GERENTE_LOGIN || "admin", password: process.env.GERENTE_SENHA || "admin123" });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, role: "gerente" });
    expect(res.body.token).toBeTruthy();
  });

  test("login com senha errada retorna 401", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ username: "admin", password: "senha_errada" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("acesso a rota protegida sem token retorna 401", async () => {
    const res = await request(app).get("/pedidos");
    expect(res.status).toBe(401);
  });
});

// ─── Testes de pedidos ────────────────────────────────────────────────────────

describe("Pedidos", () => {
  test("GET /pedidos retorna lista de pedidos", async () => {
    const res = await auth(request(app).get("/pedidos"));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("POST /pedidos cria um pedido simples (para viagem, sem mesa)", async () => {
    const res = await auth(
      request(app).post("/pedidos").send({
        status: "aberto",
        observacoes: "Pedido de teste automatizado",
        total: 0
      })
    );

    expect(res.status).toBe(201);
    expect(res.body.novo).toBeDefined();
    expect(res.body.novo.status).toBe("aberto");

    idPedidoCriado = res.body.novo.id_pedido;
  });

  test("GET /pedidos/:id retorna o pedido criado", async () => {
    expect(idPedidoCriado).toBeDefined();

    const res = await auth(request(app).get(`/pedidos/${idPedidoCriado}`));

    expect(res.status).toBe(200);
    expect(res.body.id_pedido).toBe(idPedidoCriado);
  });

  test("GET /pedidos/:id com ID inexistente retorna 404", async () => {
    const res = await auth(request(app).get("/pedidos/999999"));

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/não encontrado/i);
  });

  test("PATCH /pedidos/:id/status atualiza status para cancelado", async () => {
    expect(idPedidoCriado).toBeDefined();

    const res = await auth(
      request(app)
        .patch(`/pedidos/${idPedidoCriado}/status`)
        .send({ status: "cancelado" })
    );

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/atualizado/i);
  });

  test("PATCH /pedidos/:id/status com status inválido retorna 400", async () => {
    const res = await auth(
      request(app)
        .patch(`/pedidos/${idPedidoCriado}/status`)
        .send({ status: "invalido" })
    );

    expect(res.status).toBe(400);
  });
});

// ─── Teste de fluxo completo ──────────────────────────────────────────────────

describe("Fluxo completo: criar → finalizar → verificar venda", () => {
  let idPedidoFluxo;

  afterAll(async () => {
    if (idPedidoFluxo) {
      await auth(request(app).delete(`/pedidos/${idPedidoFluxo}`));
    }
  });

  test("1. Cria pedido com status aberto", async () => {
    const res = await auth(
      request(app).post("/pedidos").send({
        status: "aberto",
        total: 50.0,
        observacoes: "Teste fluxo completo"
      })
    );

    expect(res.status).toBe(201);
    idPedidoFluxo = res.body.novo.id_pedido;
  });

  test("2. Finaliza pedido com forma de pagamento pix", async () => {
    expect(idPedidoFluxo).toBeDefined();

    const res = await auth(
      request(app)
        .patch(`/pedidos/${idPedidoFluxo}/status`)
        .send({ status: "finalizado", forma_pagamento: "pix" })
    );

    expect(res.status).toBe(200);
    // Quando tem forma_pagamento, o status vira 'pago' automaticamente
    expect(res.body.result.vendaCriada).not.toBeNull();
  });

  test("3. Pedido aparece na lista de pedidos", async () => {
    const res = await auth(request(app).get("/pedidos"));

    expect(res.status).toBe(200);
    const encontrado = res.body.find(p => p.id_pedido === idPedidoFluxo);
    expect(encontrado).toBeDefined();
  });
});
