import dotenv from 'dotenv'
import { Pool } from 'pg'

dotenv.config()

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
})

async function migrate(): Promise<void> {
  try {
    await pool.query(`
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
    `)
    console.log('🗑️  Schema dropped and recreated')

    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        username varchar UNIQUE NOT NULL,
        title varchar,
        first_name varchar,
        last_name varchar,
        email varchar UNIQUE,
        password_hash varchar,
        google_id varchar,
        role varchar,
        avatar_url varchar,
        avatar bytea,
        avatar_mime_type varchar,
        fcm_token varchar,
        hourly_rate decimal,
        monthly_salary decimal,
        currency varchar DEFAULT 'EUR',
        employment_type varchar,
        hired_at date,
        phone varchar,
        address varchar,
        date_of_birth date,
        iban varchar,
        emergency_contact_name varchar,
        emergency_contact_phone varchar,
        notes text,
        created_at timestamp DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS invite_links (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        manager_id uuid REFERENCES users(id),
        token varchar UNIQUE NOT NULL,
        used boolean DEFAULT false,
        expires_at timestamp,
        created_at timestamp DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS projects (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        manager_id uuid REFERENCES users(id),
        title varchar UNIQUE NOT NULL,
        description text,
        status varchar,
        deadline date,
        address varchar,
        lat float,
        lng float,
        client_name varchar,
        client_phone varchar,
        client_email varchar,
        created_at timestamp DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS project_workers (
        project_id uuid REFERENCES projects(id),
        worker_id uuid REFERENCES users(id),
        joined_at timestamp DEFAULT NOW(),
        PRIMARY KEY (project_id, worker_id)
      );

      CREATE TABLE IF NOT EXISTS project_photos (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_id uuid REFERENCES projects(id),
        uploaded_by uuid REFERENCES users(id),
        file_url varchar,
        uploaded_at timestamp DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS skill_categories (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        name varchar UNIQUE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS certificates (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        worker_id uuid REFERENCES users(id),
        category_id uuid REFERENCES skill_categories(id),
        name varchar NOT NULL,
        file_url varchar,
        status varchar,
        reviewed_by uuid REFERENCES users(id),
        reviewed_at timestamp,
        submitted_at timestamp DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_id uuid REFERENCES projects(id),
        title varchar NOT NULL,
        description text,
        category_id uuid REFERENCES skill_categories(id),
        priority varchar,
        status varchar,
        deadline date,
        lat float,
        lng float,
        created_at timestamp DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS task_assignments (
        task_id uuid REFERENCES tasks(id),
        worker_id uuid REFERENCES users(id),
        assigned_at timestamp DEFAULT NOW(),
        PRIMARY KEY (task_id, worker_id)
      );

      CREATE TABLE IF NOT EXISTS task_photos (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        task_id uuid REFERENCES tasks(id),
        uploaded_by uuid REFERENCES users(id),
        file_url varchar,
        uploaded_at timestamp DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS task_status_sync (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        task_id uuid REFERENCES tasks(id),
        worker_id uuid REFERENCES users(id),
        new_status varchar,
        synced boolean DEFAULT false,
        created_at timestamp DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS worker_locations (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        worker_id uuid REFERENCES users(id),
        project_id uuid REFERENCES projects(id),
        lat float,
        lng float,
        is_online boolean DEFAULT false,
        recorded_at timestamp DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS messages (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        sender_id uuid REFERENCES users(id),
        receiver_id uuid REFERENCES users(id),
        content text,
        delivered boolean DEFAULT false,
        sent_at timestamp DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id uuid REFERENCES users(id),
        type varchar,
        title varchar,
        body text,
        reference_id uuid,
        reference_type varchar,
        read boolean DEFAULT false,
        sent_at timestamp DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        actor_id uuid REFERENCES users(id),
        action varchar,
        target_type varchar,
        target_id uuid,
        old_value text,
        new_value text,
        created_at timestamp DEFAULT NOW()
      );
    `)

    await pool.query(`
      ALTER TABLE project_photos ADD COLUMN IF NOT EXISTS task_id uuid REFERENCES tasks(id);
    `)

    await pool.query(`
      ALTER TABLE certificates ADD COLUMN IF NOT EXISTS file_data bytea;
    `)

    await pool.query(`
      ALTER TABLE worker_locations DROP CONSTRAINT IF EXISTS worker_project_unique;
      ALTER TABLE worker_locations ADD CONSTRAINT worker_project_unique UNIQUE (worker_id, project_id);
    `)

    console.log('✅ Migration completed!')
    process.exit(0)
  } catch (err) {
    console.error('❌ Migration error:', err)
    process.exit(1)
  }
}

migrate()
