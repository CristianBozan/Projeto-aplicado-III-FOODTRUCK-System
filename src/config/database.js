const { Sequelize } = require("sequelize");
require("dotenv").config();

const isProd = process.env.NODE_ENV === "production";

let sequelize;

if (process.env.DATABASE_URL) {
  // Railway / PlanetScale fornecem uma URL única de conexão
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "mysql",
    logging: false,
    dialectOptions: isProd ? { ssl: { rejectUnauthorized: false } } : {}
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT || "mysql",
      port: process.env.DB_PORT || 3306,
      logging: false,
      dialectOptions: isProd ? { ssl: { rejectUnauthorized: false } } : {}
    }
  );
}

module.exports = sequelize;
