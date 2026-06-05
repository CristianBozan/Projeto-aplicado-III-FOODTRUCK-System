const sequelize = require("../src/config/database");

// Conecta ao banco antes de todos os testes
beforeAll(async () => {
  await sequelize.authenticate();
  await sequelize.sync();
});

// Fecha a conexão após todos os testes
afterAll(async () => {
  await sequelize.close();
});
