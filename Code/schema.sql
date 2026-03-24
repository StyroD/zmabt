-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR UNIQUE NOT NULL,
    first_name VARCHAR,
    last_name VARCHAR,
    email VARCHAR UNIQUE,
    password_hash VARCHAR,
    google_id VARCHAR,
    role VARCHAR CHECK (role IN ('manager', 'worker')),
    avatar_url VARCHAR,
    fcm_token VARCHAR,
    -- compensation
    hourly_rate DECIMAL,
    monthly_salary DECIMAL,
    currency VARCHAR DEFAULT 'EUR',
    employment_type VARCHAR CHECK (employment_type IN ('full_time', 'part_time', 'contractor')),
    hired_at DATE,
    -- personal info
    phone VARCHAR,
    address VARCHAR,
    date_of_birth DATE,
    iban VARCHAR,
    -- emergency contact
    emergency_contact_name VARCHAR,
    emergency_contact_phone VARCHAR,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Invite Links
CREATE TABLE invite_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manager_id UUID REFERENCES users(id),
    token VARCHAR UNIQUE NOT NULL,
    used BOOLEAN DEFAULT false,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manager_id UUID REFERENCES users(id),
    title VARCHAR UNIQUE NOT NULL,
    description TEXT,
    status VARCHAR CHECK (status IN ('in_progress', 'completed', 'paused')),
    deadline DATE,
    address VARCHAR,
    lat FLOAT,
    lng FLOAT,
    client_name VARCHAR,
    client_phone VARCHAR,
    client_email VARCHAR,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Project Workers
CREATE TABLE project_workers (
    project_id UUID REFERENCES projects(id),
    worker_id UUID REFERENCES users(id),
    joined_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (project_id, worker_id)
);

-- Project Photos
CREATE TABLE project_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id),
    uploaded_by UUID REFERENCES users(id),
    file_url VARCHAR,
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Skill Categories
CREATE TABLE skill_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR UNIQUE NOT NULL
);

-- Certificates
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id UUID REFERENCES users(id),
    category_id UUID REFERENCES skill_categories(id),
    name VARCHAR NOT NULL,
    file_url VARCHAR,
    status VARCHAR CHECK (status IN ('pending', 'accepted', 'rejected')),
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    submitted_at TIMESTAMP DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id),
    title VARCHAR NOT NULL,
    description TEXT,
    category_id UUID REFERENCES skill_categories(id),
    priority VARCHAR CHECK (priority IN ('low', 'medium', 'high')),
    status VARCHAR CHECK (status IN ('pending', 'in_progress', 'done')),
    deadline DATE,
    lat FLOAT,
    lng FLOAT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Task Assignments
CREATE TABLE task_assignments (
    task_id UUID REFERENCES tasks(id),
    worker_id UUID REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (task_id, worker_id)
);

-- Task Photos
CREATE TABLE task_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id),
    uploaded_by UUID REFERENCES users(id),
    file_url VARCHAR,
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Task Status Sync
CREATE TABLE task_status_sync (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id),
    worker_id UUID REFERENCES users(id),
    new_status VARCHAR CHECK (new_status IN ('in_progress', 'done')),
    synced BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Worker Locations
CREATE TABLE worker_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id UUID REFERENCES users(id),
    project_id UUID REFERENCES projects(id),
    lat FLOAT,
    lng FLOAT,
    is_online BOOLEAN DEFAULT false,
    recorded_at TIMESTAMP DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES users(id),
    receiver_id UUID REFERENCES users(id),
    content TEXT,
    delivered BOOLEAN DEFAULT false,
    sent_at TIMESTAMP DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    type VARCHAR CHECK (type IN ('task_assigned', 'task_done', 'certificate_submitted', 'certificate_reviewed')),
    title VARCHAR,
    body TEXT,
    reference_id UUID,
    reference_type VARCHAR,
    read BOOLEAN DEFAULT false,
    sent_at TIMESTAMP DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES users(id),
    action VARCHAR,
    target_type VARCHAR CHECK (target_type IN ('task', 'project', 'certificate', 'worker')),
    target_id UUID,
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
