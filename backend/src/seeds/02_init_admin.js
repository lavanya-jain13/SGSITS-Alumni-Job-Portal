const bcrypt = require("bcrypt");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", "..", ".env") });

exports.seed = async function (knex) {
  const email = process.env.INIT_ADMIN_EMAIL;
  const password = process.env.INIT_ADMIN_PASSWORD;

  if (!email || !password) {
    return;
  }

  const existing = await knex("users").where({ email }).first();
  if (existing) {
    return;
  }

  const password_hash = await bcrypt.hash(password, 10);

  await knex("users").insert({
    email,
    password_hash,
    role: "admin",
    is_verified: true,
    status: "approved",
  });
  console.log("Initialized admin user: ${email}" + "MMMMMMMMMMMMMMMMMMMMMMMMM");
  return;
};
