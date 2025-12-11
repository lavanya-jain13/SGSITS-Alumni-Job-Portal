// Migration to add missing columns to companies table

exports.up = function (knex) {
  return knex.schema.alterTable("companies", (table) => {
    table.text("company_culture");
    table.string("office_location", 255);
    table.string("twitter", 255);
    table.string("linkedin", 255);
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("companies", (table) => {
    table.dropColumn("company_culture");
    table.dropColumn("office_location");
    table.dropColumn("twitter");
    table.dropColumn("linkedin");
  });
};
