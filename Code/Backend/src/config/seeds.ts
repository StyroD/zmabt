import dotenv from 'dotenv'
import { Pool } from 'pg'
import bcrypt from 'bcrypt'

dotenv.config()

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
})

async function seed(): Promise<void> {
  const hash = await bcrypt.hash('password123', 10)

  try {
    // Users
    await pool.query(`
    INSERT INTO users (id, username, first_name, last_name, email, password_hash, role, phone, created_at) VALUES
    ('a1b2c3d4-0000-0000-0000-000000000001', 'peter.novak', 'Peter', 'Novak', 'peter@workflow.com', '${hash}', 'manager', '+421900111222', NOW()),
    ('a1b2c3d4-0000-0000-0000-000000000002', 'jozef.novak', 'Jozef', 'Novak', 'jozef@workflow.com', '${hash}', 'worker', '+421900333444', NOW()),
    ('a1b2c3d4-0000-0000-0000-000000000003', 'maria.kovac', 'Maria', 'Kovac', 'maria@workflow.com', '${hash}', 'worker', '+421900555666', NOW()),
    ('a1b2c3d4-0000-0000-0000-000000000004', 'jan.hornak', 'Jan', 'Hornak', 'jan@workflow.com', '${hash}', 'worker', '+421900777888', NOW())
    ON CONFLICT DO NOTHING;
  `)
    console.log('✅ Users seeded')

    // Skill categories
    await pool.query(`
      INSERT INTO skill_categories (id, name) VALUES
      ('b1000000-0000-0000-0000-000000000001', 'Elektrika'),
      ('b1000000-0000-0000-0000-000000000002', 'Voda'),
      ('b1000000-0000-0000-0000-000000000003', 'Kurenie'),
      ('b1000000-0000-0000-0000-000000000004', 'Plyn'),
      ('b1000000-0000-0000-0000-000000000005', 'Vodicsky preukaz typu B')
      ON CONFLICT DO NOTHING;
    `)
    console.log('✅ Skill categories seeded')

    // Projects
    await pool.query(`
      INSERT INTO projects (id, manager_id, title, description, status, deadline, address, lat, lng, client_name, client_phone, client_email, created_at) VALUES
      ('c1000000-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'Bytovy dom Bratislava', 'Rekonstrukcia bytoveho domu na Obchodnej ulici', 'in_progress', '2026-08-01', 'Obchodna 15, Bratislava', 48.1486, 17.1077, 'Slovak Reality s.r.o.', '+421911000001', 'reality@example.com', NOW()),
      ('c1000000-0000-0000-0000-000000000002', 'a1b2c3d4-0000-0000-0000-000000000001', 'Rodinny dom Zilina', 'Novostavba rodinneho domu', 'in_progress', '2026-10-15', 'Kuzmanyho 8, Zilina', 49.2231, 18.7394, 'Jan Klinovský', '+421911000002', 'klinovsky@example.com', NOW())
      ON CONFLICT DO NOTHING;
    `)
    console.log('✅ Projects seeded')

    // Project workers
    await pool.query(`
      INSERT INTO project_workers (project_id, worker_id, joined_at) VALUES
      ('c1000000-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000002', NOW()),
      ('c1000000-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000003', NOW()),
      ('c1000000-0000-0000-0000-000000000002', 'a1b2c3d4-0000-0000-0000-000000000004', NOW())
      ON CONFLICT DO NOTHING;
    `)
    console.log('✅ Project workers seeded')

    // Tasks
    await pool.query(`
      INSERT INTO tasks (id, project_id, title, description, category_id, priority, status, deadline, lat, lng, created_at) VALUES
      ('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Vymena elektrickych rozvodov', 'Vymenit stare rozvody na 2. poschodi', 'b1000000-0000-0000-0000-000000000001', 'high', 'in_progress', '2026-06-01', 48.1486, 17.1077, NOW()),
      ('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'Oprava vodovodneho potrubia', 'Vymenit potrubie v kuchyni', 'b1000000-0000-0000-0000-000000000002', 'medium', 'pending', '2026-06-15', 48.1486, 17.1077, NOW()),
      ('d1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', 'Inštalacia kurenia', 'Nainštalovat nove radiatory', 'b1000000-0000-0000-0000-000000000003', 'medium', 'done', '2026-05-01', 48.1486, 17.1077, NOW()),
      ('d1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000002', 'Plynovod', 'Položit plynovod do domu', 'b1000000-0000-0000-0000-000000000004', 'high', 'pending', '2026-07-01', 49.2231, 18.7394, NOW())
      ON CONFLICT DO NOTHING;
    `)
    console.log('✅ Tasks seeded')

    // Task assignments
    await pool.query(`
      INSERT INTO task_assignments (task_id, worker_id, assigned_at) VALUES
      ('d1000000-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000002', NOW()),
      ('d1000000-0000-0000-0000-000000000002', 'a1b2c3d4-0000-0000-0000-000000000003', NOW()),
      ('d1000000-0000-0000-0000-000000000003', 'a1b2c3d4-0000-0000-0000-000000000002', NOW()),
      ('d1000000-0000-0000-0000-000000000004', 'a1b2c3d4-0000-0000-0000-000000000004', NOW())
      ON CONFLICT DO NOTHING;
    `)
    console.log('✅ Task assignments seeded')

    // Certificates
    await pool.query(`
      INSERT INTO certificates (id, worker_id, category_id, name, status, submitted_at) VALUES
      ('e1000000-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'Elektrikar - osvedcenie', 'accepted', NOW()),
      ('e1000000-0000-0000-0000-000000000002', 'a1b2c3d4-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002', 'Instalater - osvedcenie', 'accepted', NOW()),
      ('e1000000-0000-0000-0000-000000000003', 'a1b2c3d4-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000004', 'Plynar - osvedcenie', 'pending', NOW())
      ON CONFLICT DO NOTHING;
    `)
    console.log('✅ Certificates seeded')

    // Messages
    await pool.query(`
      INSERT INTO messages (id, sender_id, receiver_id, content, delivered, sent_at) VALUES
      ('f1000000-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000002', 'Ahoj Jozef, ako sa dari s elektrikou?', true, NOW()),
      ('f1000000-0000-0000-0000-000000000002', 'a1b2c3d4-0000-0000-0000-000000000002', 'a1b2c3d4-0000-0000-0000-000000000001', 'Dobre, skoro hotovo!', true, NOW()),
      ('f1000000-0000-0000-0000-000000000003', 'a1b2c3d4-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000003', 'Maria, potrebujem aby si skontrolovala potrubie', true, NOW())
      ON CONFLICT DO NOTHING;
    `)
    console.log('✅ Messages seeded')

    // Worker locations
    await pool.query(`
        INSERT INTO worker_locations (id, worker_id, project_id, lat, lng, is_online, recorded_at) VALUES
        ('e2000000-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 48.1490, 17.1080, true, NOW()),
        ('e2000000-0000-0000-0000-000000000002', 'a1b2c3d4-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', 48.1480, 17.1070, true, NOW()),
        ('e2000000-0000-0000-0000-000000000003', 'a1b2c3d4-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000002', 49.2235, 18.7400, false, NOW())
        ON CONFLICT DO NOTHING;
        `)
    console.log('✅ Worker locations seeded')

    console.log('🎉 All seeds completed!!')
    process.exit(0)
  } catch (err) {
    console.error('❌ Seed error:', err)
    process.exit(1)
  }
}

seed()
