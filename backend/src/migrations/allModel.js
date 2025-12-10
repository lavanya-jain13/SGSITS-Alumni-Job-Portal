// db/migrations/20250918060958_create_alumni_schema.js

exports.up = function (knex) {
  return (
    knex.schema
      // ---------------- USERS ----------------
      .createTable("users", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.string("email", 255).notNullable().unique();
        table.text("password_hash").notNullable();
        table.string("role", 20).notNullable(); // admin / alumni / student
        table.boolean("is_verified").defaultTo(false);
        table.string("status", 20); // optional: active, banned, etc.
        table.timestamp("created_at").defaultTo(knex.fn.now());
      })

      // ---------------- STUDENT PROFILES ----------------
      .createTable("student_profiles", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));

        table
          .uuid("user_id")
          .notNullable()
          .references("id")
          .inTable("users")
          .onDelete("CASCADE");

        table.string("name", 255).notNullable();
        table.string("student_id", 50).notNullable();
        table.string("branch", 100).notNullable();
        table.integer("grad_year").notNullable();

        // EXISTING FIELDS
        table.string("phone_number", 20);
        table.date("dob");
        table.string("current_year", 50); // 1st year, 2nd year...
        table.decimal("cgpa", 4, 2); // e.g., 7.85
        table.text("achievements");
        table.text("proficiency");
        table.integer("years_of_experience").defaultTo(0);

        // skills as array of text (Postgres)
        table.specificType("skills", "text[]");

        // NEWLY ADDED FIELDS
        table.text("address");
        table.text("desired_roles");
        table.text("preferred_locations");
        table.string("work_mode", 50);

        table.boolean("consent_data_sharing").defaultTo(false);
        table.boolean("consent_marketing").defaultTo(false);
        table.boolean("consent_profile_visibility").defaultTo(false);
        table.boolean("consent_terms").defaultTo(false);

        table.text("resume_url");
        table.timestamp("created_at").defaultTo(knex.fn.now());
      })

      // ---------------- STUDENT EXPERIENCE ----------------
      .createTable("student_experience", (table) => {
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
      })

      // ---------------- ALUMNI PROFILES ----------------
      .createTable("alumni_profiles", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));

        table
          .uuid("user_id")
          .notNullable()
          .references("id")
          .inTable("users")
          .onDelete("CASCADE");

        table.string("name", 255).notNullable();
        table.integer("grad_year");
        table.string("current_title", 255);
        table.string("status", 20).defaultTo("pending");
        table.timestamp("created_at").defaultTo(knex.fn.now());
      })

      // ---------------- COMPANIES ----------------
      // ---------------- COMPANIES ----------------
      .createTable("companies", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));

        table
          .uuid("alumni_id")
          .notNullable()
          .references("id")
          .inTable("alumni_profiles")
          .onDelete("CASCADE");

        table
          .uuid("user_id")
          .notNullable()
          .references("id")
          .inTable("users")
          .onDelete("CASCADE");

        table.string("name", 140);
        table.text("website");
        table.string("industry", 100);
        table.string("company_size", 50);
        table.text("about");
        table.text("document_url");
        table.string("status", 20);

        // 🔹 NEW FIELDS
        table.text("company_culture"); // describe work culture, values, etc.
        table.string("office_location", 255); // main office location
        table.string("twitter", 255); // twitter/X handle or URL
        table.string("linkedin", 255); // LinkedIn page URL

        table.timestamp("created_at").defaultTo(knex.fn.now());
      })

      // ---------------- JOB POSTS ----------------
      .createTable("jobs", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));

        table
          .uuid("company_id")
          .notNullable()
          .references("id")
          .inTable("companies")
          .onDelete("CASCADE");

        // who posted this job (alumni_profiles.id)
        table
          .uuid("alumni_id")
          .notNullable()
          .references("id")
          .inTable("alumni_profiles")
          .onDelete("CASCADE");

        table.string("job_title", 255).notNullable();
        table.text("job_description").notNullable();

        table.string("job_type", 100); // full-time / intern / etc.
        table.string("location", 255);
        table.string("salary_range", 100);
        table.string("experience_required", 255);
        table.text("skills_required");
        table.string("stipend", 100);
        table.date("application_deadline");

        // multi-step wizard support
        table.text("allowed_branches");
        table.text("nice_to_have_skills");
        table.string("work_mode", 100); // remote / hybrid / onsite
        table.integer("number_of_openings");
        table.text("custom_questions");
        table.boolean("nda_required").defaultTo(false);
        table.string("ctc_type", 50); // fixed / range / negotiable etc.
        table.integer("min_ctc");
        table.integer("max_ctc");
        table.text("key_responsibilities");
        table.text("requirements");

        table.integer("max_applicants_allowed").defaultTo(50);
        table.string("status", 20).defaultTo("active"); // active / paused / stopped

        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
      })

      // ---------------- JOB APPLICATIONS ----------------
      .createTable("job_applications", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));

        table
          .uuid("job_id")
          .notNullable()
          .references("id")
          .inTable("jobs")
          .onDelete("CASCADE");

        table
          .uuid("user_id")
          .notNullable()
          .references("id")
          .inTable("users")
          .onDelete("CASCADE");

        table.text("resume_url");

        table.string("status", 20).defaultTo("pending"); // pending / accepted / rejected / on_hold
        table.boolean("is_read").defaultTo(false);

        table.timestamp("applied_at").defaultTo(knex.fn.now());

        // prevent duplicate application by same user for same job
        table.unique(["job_id", "user_id"]);
      })

      // ---------------- PROJECT POSTS ----------------
      .createTable("project_posts", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));

        table
          .uuid("alumni_id")
          .notNullable()
          .references("id")
          .inTable("alumni_profiles")
          .onDelete("CASCADE");

        table.string("project_title", 255).notNullable();
        table.text("project_description").notNullable();
        table.string("stipend", 100);
        table.text("skills_required");
        table.string("duration", 100);

        table.integer("max_applicants_allowed").defaultTo(50);
        table.string("status", 20).defaultTo("active"); // active / paused / stopped

        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
      })

      // ---------------- PROJECT APPLICATIONS ----------------
      .createTable("project_applications", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));

        table
          .uuid("project_id")
          .notNullable()
          .references("id")
          .inTable("project_posts")
          .onDelete("CASCADE");

        table
          .uuid("user_id")
          .notNullable()
          .references("id")
          .inTable("users")
          .onDelete("CASCADE");

        table.text("resume_url");

        table.string("status", 20).defaultTo("pending");
        table.boolean("is_read").defaultTo(false);
        table.timestamp("applied_at").defaultTo(knex.fn.now());

        table.unique(["project_id", "user_id"]);
      })

      // ---------------- OTHER POSTS ----------------
      .createTable("other_posts", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));

        table
          .uuid("alumni_id")
          .notNullable()
          .references("id")
          .inTable("alumni_profiles")
          .onDelete("CASCADE");

        table.string("heading", 255).notNullable();
        table.text("description").notNullable();
        table.string("stipend", 100);
        table.string("duration", 100);

        table.integer("max_applicants_allowed").defaultTo(50);
        table.string("status", 20).defaultTo("active"); // active / paused / stopped

        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
      })

      // ---------------- OTHER POST APPLICATIONS ----------------
      .createTable("other_post_applications", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));

        table
          .uuid("other_post_id")
          .notNullable()
          .references("id")
          .inTable("other_posts")
          .onDelete("CASCADE");

        table
          .uuid("user_id")
          .notNullable()
          .references("id")
          .inTable("users")
          .onDelete("CASCADE");

        table.text("resume_url");

        table.string("status", 20).defaultTo("pending");
        table.boolean("is_read").defaultTo(false);
        table.timestamp("applied_at").defaultTo(knex.fn.now());

        table.unique(["other_post_id", "user_id"]);
      })

      // ---------------- OTP VERIFICATIONS ----------------
      .createTable("otp_verifications", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.string("email", 255).notNullable();
        table.string("otp", 6).notNullable();
        table.timestamp("expires_at").notNullable();
        table.boolean("is_used").defaultTo(false);
      })

      // ---------------- PASSWORD RESET TOKENS ----------------
      .createTable("password_reset_tokens", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));

        table
          .uuid("user_id")
          .notNullable()
          .references("id")
          .inTable("users")
          .onDelete("CASCADE");

        table.string("token_hash", 255).notNullable();
        table.timestamp("expires_at").notNullable();
        table.boolean("used").defaultTo(false);
        table.timestamp("created_at").defaultTo(knex.fn.now());
      })

      // ---------------- NOTIFICATIONS ----------------
      .createTable("notifications", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));

        table
          .uuid("user_id")
          .notNullable()
          .references("id")
          .inTable("users")
          .onDelete("CASCADE");

        table.string("title", 120).notNullable();
        table.text("message").notNullable();
        table.boolean("is_read").notNullable().defaultTo(false);
        table
          .timestamp("created_at", { useTz: true })
          .notNullable()
          .defaultTo(knex.fn.now());
        table
          .timestamp("updated_at", { useTz: true })
          .notNullable()
          .defaultTo(knex.fn.now());
      })
  );
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("other_post_applications")
    .dropTableIfExists("other_posts")
    .dropTableIfExists("project_applications")
    .dropTableIfExists("project_posts")
    .dropTableIfExists("job_applications")
    .dropTableIfExists("jobs")
    .dropTableIfExists("companies")
    .dropTableIfExists("notifications")
    .dropTableIfExists("password_reset_tokens")
    .dropTableIfExists("student_experience") // 🔹 drop child before parent
    .dropTableIfExists("alumni_profiles")
    .dropTableIfExists("student_profiles")
    .dropTableIfExists("otp_verifications")
    .dropTableIfExists("users");
};
