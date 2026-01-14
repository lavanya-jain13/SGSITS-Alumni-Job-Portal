// Migration to add missing 'status' column to alumni_profiles table

exports.up = function (knex) {
  return knex.schema.alterTable("alumni_profiles", (table) => {
    table.string("status", 20).defaultTo("pending");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("alumni_profiles", (table) => {
    table.dropColumn("status");
  });
};
