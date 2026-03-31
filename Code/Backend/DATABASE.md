# Database Documentation

## Overview

This project uses PostgreSQL with UUID primary keys. The schema is organized around two core roles: **manager** and **worker**.

```
users
 ├── manages → projects
 ├── assigned to → project_workers
 ├── assigned to → task_assignments
 ├── uploads → project_photos / task_photos
 ├── owns → certificates
 ├── sends/receives → messages
 ├── receives → notifications
 └── tracked in → worker_locations
```

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                           USERS                                                  │
│  id (PK) · username · email · role (manager|worker) · first_name · last_name · phone · avatar   │
│  hourly_rate · monthly_salary · employment_type · hired_at · iban · emergency_contact           │
└───────────────────────────────┬─────────────────────────────────────────────────────────────────┘
                                │
          ┌─────────────────────┼──────────────────────────────────────────────┐
          │                     │                                              │
          ▼                     ▼                                              ▼
┌──────────────────┐   ┌─────────────────────┐                    ┌───────────────────────┐
│    INVITE_LINKS  │   │      PROJECTS        │                    │      CERTIFICATES     │
│  id (PK)         │   │  id (PK)             │                    │  id (PK)              │
│  manager_id (FK) │   │  manager_id (FK)     │                    │  worker_id (FK)       │
│  token           │   │  title               │                    │  category_id (FK)     │
│  used            │   │  description         │                    │  name                 │
│  expires_at      │   │  status              │                    │  file_url             │
└──────────────────┘   │  deadline            │                    │  status               │
                       │  address · lat · lng │                    │  reviewed_by (FK)     │
                       │  client_name/phone   │                    └───────────────────────┘
                       └──────────┬───────────┘                              ▲
                                  │                                          │
               ┌──────────────────┼──────────────────────┐       ┌──────────────────────┐
               │                  │                       │       │   SKILL_CATEGORIES   │
               ▼                  ▼                       ▼       │  id (PK)             │
┌─────────────────────┐  ┌──────────────────┐  ┌──────────────┐  │  name                │
│   PROJECT_WORKERS   │  │  PROJECT_PHOTOS  │  │    TASKS     │  └──────────────────────┘
│  project_id (FK)    │  │  id (PK)         │  │  id (PK)     │            ▲
│  worker_id (FK)     │  │  project_id (FK) │  │  project_id  │            │
│  joined_at          │  │  uploaded_by(FK) │  │  title       │            │
└─────────────────────┘  │  file_url        │  │  description │────────────┘
                         └──────────────────┘  │  category_id │  (category_id FK)
                                               │  priority    │
                                               │  status      │
                                               │  deadline    │
                                               │  lat · lng   │
                                               └──────┬───────┘
                                                      │
                          ┌───────────────────────────┼───────────────────────────┐
                          │                           │                           │
                          ▼                           ▼                           ▼
               ┌─────────────────────┐   ┌──────────────────┐   ┌─────────────────────────┐
               │   TASK_ASSIGNMENTS  │   │   TASK_PHOTOS    │   │    TASK_STATUS_SYNC     │
               │  task_id (FK)       │   │  id (PK)         │   │  id (PK)                │
               │  worker_id (FK)     │   │  task_id (FK)    │   │  task_id (FK)           │
               │  assigned_at        │   │  uploaded_by(FK) │   │  worker_id (FK)         │
               └─────────────────────┘   │  file_url        │   │  new_status             │
                                         └──────────────────┘   │  synced                 │
                                                                 └─────────────────────────┘

┌──────────────────────────┐   ┌──────────────────────────┐   ┌──────────────────────────┐
│     WORKER_LOCATIONS     │   │        MESSAGES          │   │      NOTIFICATIONS       │
│  id (PK)                 │   │  id (PK)                 │   │  id (PK)                 │
│  worker_id (FK)          │   │  sender_id (FK)          │   │  user_id (FK)            │
│  project_id (FK)         │   │  receiver_id (FK)        │   │  type                    │
│  lat · lng               │   │  content                 │   │  title · body            │
│  is_online               │   │  delivered               │   │  reference_id            │
│  recorded_at             │   │  sent_at                 │   │  read                    │
└──────────────────────────┘   └──────────────────────────┘   └──────────────────────────┘

┌──────────────────────────┐
│       AUDIT_LOGS         │
│  id (PK)                 │
│  actor_id (FK)           │
│  action                  │
│  target_type             │
│  target_id               │
│  old_value · new_value   │
│  created_at              │
└──────────────────────────┘
```

---

## Tables

### users
The central table. Both managers and workers are stored here, differentiated by the `role` column.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| username | varchar | Unique, required |
| title | varchar | e.g. Ing, PhD, Mgr, Bc |
| first_name | varchar | |
| last_name | varchar | |
| email | varchar | Unique |
| password_hash | varchar | Bcrypt hash |
| google_id | varchar | OAuth |
| role | varchar | `manager` or `worker` |
| avatar_url | varchar | |
| fcm_token | varchar | Push notifications |
| hourly_rate | decimal | |
| monthly_salary | decimal | |
| currency | varchar | Default: EUR |
| employment_type | varchar | `full_time \| part_time \| contractor` |
| hired_at | date | |
| phone | varchar | |
| address | varchar | |
| date_of_birth | date | |
| iban | varchar | |
| emergency_contact_name | varchar | |
| emergency_contact_phone | varchar | |
| notes | text | |
| created_at | timestamp | |

---

### projects
Created by a manager. Workers are linked via `project_workers`.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| manager_id | uuid | FK → users.id |
| title | varchar | Unique, required |
| description | text | |
| status | varchar | `in_progress \| completed \| paused` |
| deadline | date | |
| address | varchar | |
| lat | float | |
| lng | float | |
| client_name | varchar | |
| client_phone | varchar | |
| client_email | varchar | |
| created_at | timestamp | |

---

### project_workers
Junction table linking workers to projects.

| Column | Type | Notes |
|--------|------|-------|
| project_id | uuid | FK → projects.id |
| worker_id | uuid | FK → users.id |
| joined_at | timestamp | |

---

### tasks
Belong to a project. Can require a specific skill category.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| project_id | uuid | FK → projects.id |
| title | varchar | Required |
| description | text | |
| category_id | uuid | FK → skill_categories.id |
| priority | varchar | `low \| medium \| high` |
| status | varchar | `pending \| in_progress \| done` |
| deadline | date | |
| lat | float | |
| lng | float | |
| created_at | timestamp | |

---

### task_assignments
Junction table linking workers to tasks.

| Column | Type | Notes |
|--------|------|-------|
| task_id | uuid | FK → tasks.id |
| worker_id | uuid | FK → users.id |
| assigned_at | timestamp | |

---

### skill_categories
Lookup table for skill types (Elektrika, Voda, Kurenie, etc.).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| name | varchar | Unique, required |

---

### certificates
Workers upload certificates proving they have a skill. Managers review them.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| worker_id | uuid | FK → users.id |
| category_id | uuid | FK → skill_categories.id |
| name | varchar | Required |
| file_url | varchar | Image or PDF |
| status | varchar | `pending \| accepted \| rejected` |
| reviewed_by | uuid | FK → users.id |
| reviewed_at | timestamp | |
| submitted_at | timestamp | |

---

### worker_locations
Tracks real-time location and online status of workers per project.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| worker_id | uuid | FK → users.id |
| project_id | uuid | FK → projects.id |
| lat | float | |
| lng | float | |
| is_online | boolean | Default: false |
| recorded_at | timestamp | |

---

### messages
Direct messages between users (manager ↔ worker).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| sender_id | uuid | FK → users.id |
| receiver_id | uuid | FK → users.id |
| content | text | |
| delivered | boolean | Default: false |
| sent_at | timestamp | |

---

### notifications
In-app notifications sent to users.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| user_id | uuid | FK → users.id |
| type | varchar | `task_assigned \| task_done \| certificate_submitted \| certificate_reviewed` |
| title | varchar | |
| body | text | |
| reference_id | uuid | e.g. task_id or certificate_id |
| reference_type | varchar | |
| read | boolean | Default: false |
| sent_at | timestamp | |

---

### audit_logs
Tracks all significant changes in the system for accountability.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| actor_id | uuid | FK → users.id |
| action | varchar | e.g. `task_status_changed`, `certificate_accepted` |
| target_type | varchar | `task \| project \| certificate \| worker` |
| target_id | uuid | |
| old_value | text | |
| new_value | text | |
| created_at | timestamp | |

---

### invite_links
Managers generate invite links to onboard workers.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| manager_id | uuid | FK → users.id |
| token | varchar | Unique, required |
| used | boolean | Default: false |
| expires_at | timestamp | |
| created_at | timestamp | |

---

### project_photos / task_photos
Photo documentation for projects and tasks.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| project_id / task_id | uuid | FK |
| uploaded_by | uuid | FK → users.id |
| file_url | varchar | |
| uploaded_at | timestamp | |

---

### task_status_sync
Offline sync queue — stores status changes made offline to be synced when back online.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| task_id | uuid | FK → tasks.id |
| worker_id | uuid | FK → users.id |
| new_status | varchar | `in_progress \| done` |
| synced | boolean | Default: false |
| created_at | timestamp | |