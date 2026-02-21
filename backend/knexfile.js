const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, '.env') }); // ← path to backend/.env

// dotenv loads .env into process.env; knex will use environment variables below

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: "postgresql",
    connection: process.env.DATABASE_URL
      ? process.env.DATABASE_URL
      : {
          host: process.env.DB_HOST || "localhost",
          port: Number(process.env.DB_PORT || 5432),
          database: process.env.DB_NAME || "alumniPortal",
          user: process.env.DB_USER || "postgres",
          password: process.env.DB_PASSWORD || "postgres",
        },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
      directory: "src/migrations",
    },
    seeds: {
      directory: "src/seeds",
    },
  },

  production: {
    client: "postgresql",
    connection: process.env.DATABASE_URL || {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },

    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
      directory: "src/migrations",
    },
    seeds: {
      directory: "src/seeds",
    },
  },
};
