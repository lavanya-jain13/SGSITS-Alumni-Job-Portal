// Migration to add missing columns to student_profiles table

exports.up = function (knex) {
  return knex.schema.alterTable("student_profiles", (table) => {
    // Basic info
    table.string("phone_number", 20);
    table.date("dob");
    table.string("current_year", 50); // 1st year, 2nd year...
    table.decimal("cgpa", 4, 2); // e.g., 7.85
    table.text("achievements");
    table.text("proficiency");
    table.integer("years_of_experience").defaultTo(0);

    // Location & preferences
    table.text("address");
    table.text("desired_roles");
    table.text("preferred_locations");
    table.string("work_mode", 50);

    // Consent flags
    table.boolean("consent_data_sharing").defaultTo(false);
    table.boolean("consent_marketing").defaultTo(false);
    table.boolean("consent_profile_visibility").defaultTo(false);
    table.boolean("consent_terms").defaultTo(false);
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("student_profiles", (table) => {
    table.dropColumn("phone_number");
    table.dropColumn("dob");
    table.dropColumn("current_year");
    table.dropColumn("cgpa");
    table.dropColumn("achievements");
    table.dropColumn("proficiency");
    table.dropColumn("years_of_experience");
    table.dropColumn("address");
    table.dropColumn("desired_roles");
    table.dropColumn("preferred_locations");
    table.dropColumn("work_mode");
    table.dropColumn("consent_data_sharing");
    table.dropColumn("consent_marketing");
    table.dropColumn("consent_profile_visibility");
    table.dropColumn("consent_terms");
  });
};
