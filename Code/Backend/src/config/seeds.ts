import dotenv from "dotenv";
import { Pool } from "pg";
import bcrypt from "bcrypt";

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function seed(): Promise<void> {
  const hash = await bcrypt.hash("password123", 10);

  try {
    // Users
    await pool.query(`
  INSERT INTO users (id, username, title, first_name, last_name, email, password_hash, role, phone, address, date_of_birth, hourly_rate, monthly_salary, currency, employment_type, hired_at, iban, emergency_contact_name, emergency_contact_phone, notes, created_at) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'peter.novak', 'Ing', 'Peter', 'Novak', 'peter@workflow.com', '${hash}', 'manager', '+421900111001', 'Hlavna 1, Bratislava', '1985-03-15', 45.00, null, 'EUR', 'full_time', '2020-01-01', 'SK1234567890123456', 'Jana Novakova', '+421900999001', 'Senior manager', NOW()),
  ('a1000000-0000-0000-0000-000000000002', 'jana.kovacova', 'Mgr', 'Jana', 'Kovacova', 'jana@workflow.com', '${hash}', 'manager', '+421900111002', 'Namestie 5, Kosice', '1990-07-22', 42.00, null, 'EUR', 'full_time', '2021-03-01', 'SK2345678901234567', 'Peter Kovac', '+421900999002', null, NOW()),
  ('a1000000-0000-0000-0000-000000000003', 'martin.horvath', 'Bc', 'Martin', 'Horvath', 'martin@workflow.com', '${hash}', 'manager', '+421900111003', 'Sportova 3, Nitra', '1988-11-30', 40.00, null, 'EUR', 'full_time', '2019-06-01', 'SK3456789012345678', 'Eva Horvathova', '+421900999003', null, NOW()),
  ('a1000000-0000-0000-0000-000000000004', 'jozef.novak', 'Bc', 'Jozef', 'Novak', 'jozef@workflow.com', '${hash}', 'worker', '+421900222001', 'Robotnicka 12, Bratislava', '1992-05-10', 18.50, null, 'EUR', 'full_time', '2022-01-15', 'SK4567890123456789', 'Maria Novakova', '+421900999004', 'Elektrikar, Instalater', NOW()),
  ('a1000000-0000-0000-0000-000000000005', 'maria.kovac', 'Bc', 'Maria', 'Kovac', 'maria@workflow.com', '${hash}', 'worker', '+421900222002', 'Zelena 8, Zilina', '1995-09-18', 17.00, null, 'EUR', 'part_time', '2022-06-01', 'SK5678901234567890', 'Jan Kovac', '+421900999005', null, NOW()),
  ('a1000000-0000-0000-0000-000000000006', 'jan.hornak', 'Bc', 'Jan', 'Hornak', 'jan@workflow.com', '${hash}', 'worker', '+421900222003', 'Lesna 3, Trnava', '1988-02-25', 19.00, null, 'EUR', 'full_time', '2021-09-01', 'SK6789012345678901', 'Anna Hornakova', '+421900999006', 'Kurenie specialist', NOW()),
  ('a1000000-0000-0000-0000-000000000007', 'tomas.vlcek', 'Bc', 'Tomas', 'Vlcek', 'tomas@workflow.com', '${hash}', 'worker', '+421900222004', 'Polna 7, Trencin', '1993-12-03', 20.00, null, 'EUR', 'full_time', '2022-03-15', 'SK7890123456789012', 'Petra Vlckova', '+421900999007', 'Plynar', NOW()),
  ('a1000000-0000-0000-0000-000000000008', 'lukas.maly','Bc', 'Lukas', 'Maly', 'lukas@workflow.com', '${hash}', 'worker', '+421900222005', 'Vysoka 2, Presov', '1997-06-14', 16.50, null, 'EUR', 'contractor', '2023-01-01', 'SK8901234567890123', 'Eva Mala', '+421900999008', null, NOW()),
  ('a1000000-0000-0000-0000-000000000009', 'peter.velky', 'Bc', 'Peter', 'Velky', 'peterv@workflow.com', '${hash}', 'worker', '+421900222006', 'Dlha 15, Banska Bystrica', '1991-08-20', 18.00, null, 'EUR', 'full_time', '2021-11-01', 'SK9012345678901234', 'Zuzana Velkova', '+421900999009', null, NOW()),
  ('a1000000-0000-0000-0000-000000000010', 'anna.svoboda', 'Bc', 'Anna', 'Svoboda', 'anna@workflow.com', '${hash}', 'worker', '+421900222007', 'Kratka 4, Poprad', '1994-04-07', 17.50, null, 'EUR', 'part_time', '2022-08-15', 'SK0123456789012345', 'Pavel Svoboda', '+421900999010', 'Instalater, Plynar', NOW())
  ON CONFLICT DO NOTHING;
`);
    console.log("✅ Users seeded");

    // Assign workers to managers
    await pool.query(`
      UPDATE users SET manager_id = 'a1000000-0000-0000-0000-000000000001'
      WHERE id IN (
        'a1000000-0000-0000-0000-000000000004',
        'a1000000-0000-0000-0000-000000000005',
        'a1000000-0000-0000-0000-000000000006'
      );
      UPDATE users SET manager_id = 'a1000000-0000-0000-0000-000000000002'
      WHERE id IN (
        'a1000000-0000-0000-0000-000000000007',
        'a1000000-0000-0000-0000-000000000008'
      );
      UPDATE users SET manager_id = 'a1000000-0000-0000-0000-000000000003'
      WHERE id IN (
        'a1000000-0000-0000-0000-000000000009',
        'a1000000-0000-0000-0000-000000000010'
      );
    `);
    console.log("✅ Worker manager assignments seeded");

    // Skill categories
    await pool.query(`
      INSERT INTO skill_categories (id, name) VALUES
      ('b1000000-0000-0000-0000-000000000001', 'Elektrika'),
      ('b1000000-0000-0000-0000-000000000002', 'Voda'),
      ('b1000000-0000-0000-0000-000000000003', 'Kurenie'),
      ('b1000000-0000-0000-0000-000000000004', 'Plyn'),
      ('b1000000-0000-0000-0000-000000000005', 'Vodicsky preukaz typu B')
      ON CONFLICT DO NOTHING;
    `);
    console.log("✅ Skill categories seeded");

    // Projects
    await pool.query(`
    INSERT INTO projects (id, manager_id, title, description, status, deadline, address, lat, lng, client_name, client_phone, client_email, created_at) VALUES
    ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Bytovy dom Bratislava', 'Rekonstrukcia bytoveho domu na Obchodnej ulici', 'in_progress', '2026-08-01', 'Obchodna 15, Bratislava', 48.1486, 17.1077, 'Slovak Reality s.r.o.', '+421911000001', 'reality@example.com', NOW()),
    ('c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Rodinny dom Zilina', 'Novostavba rodinneho domu', 'in_progress', '2026-10-15', 'Kuzmanyho 8, Zilina', 49.2231, 18.7394, 'Jan Klinovsky', '+421911000002', 'klinovsky@example.com', NOW()),
    ('c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 'Kancelaria Kosice', 'Rekonstrukcia kancelarii v centre', 'in_progress', '2026-09-01', 'Hlavna 10, Kosice', 48.7164, 21.2611, 'Kosice Invest s.r.o.', '+421911000003', 'invest@example.com', NOW()),
    ('c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'Sportovy areal Nitra', 'Vystavba sportoveho arealu', 'pending', '2026-12-01', 'Sportova 5, Nitra', 48.3069, 18.0844, 'Nitra Sport s.r.o.', '+421911000004', 'sport@example.com', NOW()),
    ('c1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000003', 'Hotel Trnava', 'Rekonstrukcia hotelovych izieb', 'in_progress', '2026-11-01', 'Trojicne namestie 1, Trnava', 48.3774, 17.5878, 'Hotel Group s.r.o.', '+421911000005', 'hotel@example.com', NOW()),
    ('c1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000003', 'Nemocnica Trencin', 'Modernizacia nemocnice', 'pending', '2027-03-01', 'Nemocnicna 2, Trencin', 48.8944, 18.0446, 'Zdravotnictvo s.r.o.', '+421911000006', 'zdravie@example.com', NOW())
    ON CONFLICT DO NOTHING;
  `);
    console.log("✅ Projects seeded");

    // Project workers
    await pool.query(`
    INSERT INTO project_workers (project_id, worker_id, joined_at) VALUES
    ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004', NOW()),
    ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000005', NOW()),
    ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000006', NOW()),
    ('c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000007', NOW()),
    ('c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000008', NOW()),
    ('c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000004', NOW()),
    ('c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000009', NOW()),
    ('c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000005', NOW()),
    ('c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000010', NOW()),
    ('c1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000006', NOW()),
    ('c1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000007', NOW()),
    ('c1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000008', NOW()),
    ('c1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000009', NOW())
    ON CONFLICT DO NOTHING;
  `);
    console.log("✅ Project workers seeded");

    // Tasks
    await pool.query(`
    INSERT INTO tasks (id, project_id, title, description, category_id, priority, status, deadline, lat, lng, created_at) VALUES
    ('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Vymena elektrickych rozvodov', 'Vymenit stare rozvody na 2. poschodi', 'b1000000-0000-0000-0000-000000000001', 'high', 'in_progress', '2026-06-01', 48.1486, 17.1077, NOW()),
    ('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'Oprava vodovodneho potrubia', 'Vymenit potrubie v kuchyni', 'b1000000-0000-0000-0000-000000000002', 'medium', 'pending', '2026-06-15', 48.1486, 17.1077, NOW()),
    ('d1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', 'Instalacia kurenia', 'Nainštalovat nove radiatory', 'b1000000-0000-0000-0000-000000000003', 'medium', 'done', '2026-05-01', 48.1486, 17.1077, NOW()),
    ('d1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000002', 'Plynovod', 'Polozit plynovod do domu', 'b1000000-0000-0000-0000-000000000004', 'high', 'pending', '2026-07-01', 49.2231, 18.7394, NOW()),
    ('d1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000002', 'Elektroinštalacia', 'Nainštalovat elektricke rozvody', 'b1000000-0000-0000-0000-000000000001', 'high', 'in_progress', '2026-07-15', 49.2231, 18.7394, NOW()),
    ('d1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000003', 'Vymena okien', 'Vymenit stare okna za nove', 'b1000000-0000-0000-0000-000000000002', 'low', 'pending', '2026-08-15', 48.7164, 21.2611, NOW()),
    ('d1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000003', 'Kurenie kancelarii', 'Opravit kurenie v kancelariach', 'b1000000-0000-0000-0000-000000000003', 'medium', 'in_progress', '2026-08-01', 48.7164, 21.2611, NOW()),
    ('d1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000004', 'Plynovod arealu', 'Vybudovat plynovod pre areal', 'b1000000-0000-0000-0000-000000000004', 'high', 'pending', '2026-09-01', 48.3069, 18.0844, NOW()),
    ('d1000000-0000-0000-0000-000000000009', 'c1000000-0000-0000-0000-000000000005', 'Elektroinštalacia hotela', 'Kompletna elektroinštalacia', 'b1000000-0000-0000-0000-000000000001', 'high', 'in_progress', '2026-09-15', 48.3774, 17.5878, NOW()),
    ('d1000000-0000-0000-0000-000000000010', 'c1000000-0000-0000-0000-000000000005', 'Vodovod hotela', 'Oprava vodovodnych rozvodov', 'b1000000-0000-0000-0000-000000000002', 'medium', 'pending', '2026-10-01', 48.3774, 17.5878, NOW()),
    ('d1000000-0000-0000-0000-000000000011', 'c1000000-0000-0000-0000-000000000006', 'Kurenie nemocnice', 'Modernizacia kurenia', 'b1000000-0000-0000-0000-000000000003', 'high', 'pending', '2026-11-01', 48.8944, 18.0446, NOW()),
    ('d1000000-0000-0000-0000-000000000012', 'c1000000-0000-0000-0000-000000000006', 'Plyn nemocnice', 'Instalacia plynoveho zariadenia', 'b1000000-0000-0000-0000-000000000004', 'high', 'pending', '2026-11-15', 48.8944, 18.0446, NOW())
    ON CONFLICT DO NOTHING;
  `);
    console.log("✅ Tasks seeded");

    // Task assignments
    await pool.query(`
    INSERT INTO task_assignments (task_id, worker_id, assigned_at) VALUES
    ('d1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004', NOW()),
    ('d1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000005', NOW()),
    ('d1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000006', NOW()),
    ('d1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000007', NOW()),
    ('d1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000008', NOW()),
    ('d1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000009', NOW()),
    ('d1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000004', NOW()),
    ('d1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000010', NOW()),
    ('d1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000006', NOW()),
    ('d1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000005', NOW()),
    ('d1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000008', NOW()),
    ('d1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000009', NOW())
    ON CONFLICT DO NOTHING;
  `);
    console.log("✅ Task assignments seeded");

    // Certificates
    await pool.query(`
    INSERT INTO certificates (id, worker_id, category_id, name, status, submitted_at) VALUES
    ('e1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000001', 'Elektrikar - osvedcenie', 'accepted', NOW()),
    ('e1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000002', 'Instalater - osvedcenie', 'accepted', NOW()),
    ('e1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000002', 'Instalater - osvedcenie', 'accepted', NOW()),
    ('e1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000003', 'Kurenie - osvedcenie', 'accepted', NOW()),
    ('e1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000003', 'Kurenie - osvedcenie', 'accepted', NOW()),
    ('e1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000001', 'Elektrikar - osvedcenie', 'accepted', NOW()),
    ('e1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000004', 'Plynar - osvedcenie', 'accepted', NOW()),
    ('e1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000001', 'Elektrikar - osvedcenie', 'accepted', NOW()),
    ('e1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000003', 'Kurenie - osvedcenie', 'accepted', NOW()),
    ('e1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000004', 'Plynar - osvedcenie', 'pending', NOW()),
    ('e1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000001', 'Elektrikar - osvedcenie', 'accepted', NOW()),
    ('e1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000002', 'Instalater - osvedcenie', 'accepted', NOW()),
    ('e1000000-0000-0000-0000-000000000013', 'a1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000004', 'Plynar - osvedcenie', 'accepted', NOW())
    ON CONFLICT DO NOTHING;
  `);
    console.log("✅ Certificates seeded");

    // Messages
    await pool.query(`
  INSERT INTO messages (id, sender_id, receiver_id, content, delivered, sent_at) VALUES
  ('f1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004', 'Ahoj Jozef, ako sa dari s elektrikou?', true, NOW()),
  ('f1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'Dobre, skoro hotovo!', true, NOW()),
  ('f1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000005', 'Maria, skontroluj potrubie prosim', true, NOW()),
  ('f1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000007', 'Tomas, kedy budes na stavbe?', true, NOW()),
  ('f1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000002', 'Zajtra o 8:00', true, NOW())
  ON CONFLICT DO NOTHING;
`);
    console.log("✅ Messages seeded");

    // Worker locations
    await pool.query(`
  INSERT INTO worker_locations (id, worker_id, project_id, lat, lng, is_online, recorded_at) VALUES
  ('e2000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000001', 48.1490, 17.1080, true, NOW()),
  ('e2000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000001', 48.1480, 17.1070, true, NOW()),
  ('e2000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000002', 49.2235, 18.7400, false, NOW()),
  ('e2000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000009', 'c1000000-0000-0000-0000-000000000003', 48.7170, 21.2620, true, NOW()),
  ('e2000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000005', 48.3780, 17.5880, true, NOW())
  ON CONFLICT DO NOTHING;
`);
    console.log("✅ Worker locations seeded");

    console.log("🎉 All seeds completed!!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

seed();
