const bcrypt = require("bcrypt");

exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("notifications").del();
  await knex("password_reset_tokens").del();
  await knex("otp_verifications").del();
  await knex("job_applications").del();
  await knex("jobs").del();
  await knex("companies").del();
  await knex("alumni_profiles").del();
  await knex("student_profiles").del();
  await knex("users").del();

  // Hash password
  const hashedPassword = await bcrypt.hash("password123", 10);
  const adminHashed = await bcrypt.hash("admin123", 10);

  // Insert users
  const users = await knex("users")
    .insert([
      {
        email: "admin@sgsits.ac.in",
        password_hash: adminHashed,
        role: "admin",
        is_verified: true,
      },
      {
        email: "student@sgsits.ac.in",
        password_hash: hashedPassword,
        role: "student",
        is_verified: true,
      },
      {
        email: "alumni@company.com",
        password_hash: hashedPassword,
        role: "alumni",
        is_verified: true,
      },
      {
        email: "alumni2@company.com",
        password_hash: hashedPassword,
        role: "alumni",
        is_verified: true,
      },
    ])
    .returning("id");

  // Insert profiles
  await knex("student_profiles").insert({
    user_id: users[1].id,
    name: "John Doe",
    student_id: "CS2021001",
    branch: "computer science",
    grad_year: 2025,
    skills: ["React, Node.js, Python"],
  });

  const alumniProfiles = await knex("alumni_profiles")
    .insert([
      {
        user_id: users[2].id,
        name: "Jane Smith",
        grad_year: 2020,
        current_title: "Software Engineer",
      },
      {
        user_id: users[3].id,
        name: "Bob Johnson",
        grad_year: 2019,
        current_title: "Product Manager",
      },
    ])
    .returning("id");

  // Insert companies
  const companies = await knex("companies")
    .insert([
      {
        alumni_id: alumniProfiles[0].id,
        user_id: users[2].id,
        name: "TechCorp Solutions",
        website: "https://techcorp.com",
        industry: "Software Development",
        company_size: "50-100 employees",
        about: "Leading software development company",

        // ✅ columns that ACTUALLY exist
        linkedin: null,
        twitter: null,
        office_location: null,
        company_culture: null,

        // ✅ required for public fetch to work
        status: "approved",
      },
      {
        alumni_id: alumniProfiles[1].id,
        user_id: users[3].id,
        name: "Innovate Labs",
        website: "https://innovatelabs.com",
        industry: "Technology",
        company_size: "10-50 employees",
        about: "Innovative tech solutions",

        linkedin: null,
        twitter: null,
        office_location: null,
        company_culture: null,

        status: "approved",
      },
    ])
    .returning("id");

  // Insert jobs
  await knex("jobs").insert([
    {
      company_id: companies[0].id,
      alumni_id: alumniProfiles[0].id,
      job_title: "Frontend Developer",
      job_description: "Develop user interfaces using React and TypeScript",
    },
    {
      company_id: companies[0].id,
      alumni_id: alumniProfiles[0].id,
      job_title: "Backend Developer",
      job_description: "Build scalable backend services with Node.js",
    },
    {
      company_id: companies[1].id,
      alumni_id: alumniProfiles[1].id,
      job_title: "Data Scientist",
      job_description: "Analyze data and build ML models",
    },
  ]);
};
