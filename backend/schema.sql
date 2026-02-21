-- Schema generated from backend migration (knex)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE student_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    student_id VARCHAR(50) NOT NULL,
    branch VARCHAR(100) NOT NULL,
    grad_year INT NOT NULL,
    skills TEXT,
    resume_url TEXT,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE alumni_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    grad_year INT,
    current_title VARCHAR(255),
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE companies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    alumni_id uuid NOT NULL REFERENCES alumni_profiles(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(140),
    website TEXT,
    industry VARCHAR(100),
    company_size VARCHAR(50),
    about TEXT,
    document_url TEXT,
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    posted_by_alumni_id uuid NOT NULL REFERENCES alumni_profiles(id) ON DELETE SET NULL,
    job_title VARCHAR(255) NOT NULL,
    job_description TEXT,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE job_applications (
    job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_url TEXT,
    "No_of_applicants" INT DEFAULT 0,
    applied_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (job_id, user_id)
);

CREATE TABLE otp_verifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT false
);

CREATE TABLE password_reset_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(120) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);
