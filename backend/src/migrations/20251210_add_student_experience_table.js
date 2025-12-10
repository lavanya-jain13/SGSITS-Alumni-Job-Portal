// Migration to add missing student_experience table

exports.up = function (knex) {
  return knex.schema.createTable("student_experience", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));

    // FK → student_profiles
    table
      .uuid("student_id")
      .notNullable()
      .references("id")
      .inTable("student_profiles")
      .onDelete("CASCADE");

    table.string("position", 255).notNullable();
    table.string("company", 255).notNullable();
    table.string("duration", 100); // e.g., "3 months", "Jan–Jun 2024"
    table.text("description");

    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("student_experience");
};
