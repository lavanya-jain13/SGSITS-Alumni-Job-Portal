// Migration to add missing columns to jobs table

exports.up = function (knex) {
  return knex.schema.alterTable("jobs", (table) => {
    table.text("allowed_branches");
    table.text("nice_to_have_skills");
    table.string("work_mode", 100); // remote / hybrid / onsite
    table.integer("number_of_openings");
    table.text("custom_questions");
    table.boolean("nda_required").defaultTo(false);
    table.string("ctc_type", 50); // fixed / range / negotiable
    table.integer("min_ctc");
    table.integer("max_ctc");
    table.text("key_responsibilities");
    table.text("requirements");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("jobs", (table) => {
    table.dropColumn("allowed_branches");
    table.dropColumn("nice_to_have_skills");
    table.dropColumn("work_mode");
    table.dropColumn("number_of_openings");
    table.dropColumn("custom_questions");
    table.dropColumn("nda_required");
    table.dropColumn("ctc_type");
    table.dropColumn("min_ctc");
    table.dropColumn("max_ctc");
    table.dropColumn("key_responsibilities");
    table.dropColumn("requirements");
  });
};
