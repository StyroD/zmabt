import * as SQLite from 'expo-sqlite'

let db: SQLite.SQLiteDatabase

export const initDb = async () => {
    db = await SQLite.openDatabaseAsync('zmabt.db')
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS workers (
            id TEXT PRIMARY KEY,
            first_name TEXT,
            last_name TEXT,
            username TEXT,
            phone TEXT,
            certificates TEXT,
            cached_at INTEGER
        );

        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            sender_id TEXT NOT NULL,
            receiver_id TEXT NOT NULL,
            content TEXT NOT NULL,
            sent_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            title TEXT,
            description TEXT,
            status TEXT,
            deadline TEXT,
            address TEXT,
            lat REAL,
            lng REAL,
            client_name TEXT,
            client_phone TEXT,
            client_email TEXT,
            cached_at INTEGER
        );

        CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            project_id TEXT,
            title TEXT,
            description TEXT,
            category_id TEXT,
            priority TEXT,
            status TEXT,
            deadline TEXT,
            lat REAL,
            lng REAL,
            cached_at INTEGER
        );

        CREATE TABLE IF NOT EXISTS categories (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL
);
    `)
}

export const cacheWorkers = async (workers: any[]) => {
    await db.withTransactionAsync(async () => {
        await db.runAsync('DELETE FROM workers')
        for (const w of workers) {
            await db.runAsync(
                `INSERT INTO workers (id, first_name, last_name, username, phone, certificates, cached_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [w.id, w.first_name, w.last_name, w.username, w.phone,
                 JSON.stringify(w.certificates ?? []), Date.now()]
            )
        }
    })
}

export const getCachedWorkers = async (): Promise<any[]> => {
    const rows = await db.getAllAsync('SELECT * FROM workers ORDER BY first_name')
    return rows.map((w: any) => ({
        ...w,
        certificates: JSON.parse(w.certificates ?? '[]'),
    }))
}

export const cacheMessages = async (userId1: string, userId2: string, messages: any[]) => {
    await db.withTransactionAsync(async () => {
        await db.runAsync(
            `DELETE FROM messages WHERE
             (sender_id = ? AND receiver_id = ?) OR
             (sender_id = ? AND receiver_id = ?)`,
            [userId1, userId2, userId2, userId1]
        )
        const last40 = messages.slice(-40)
        for (const m of last40) {
            await db.runAsync(
                `INSERT OR REPLACE INTO messages (id, sender_id, receiver_id, content, sent_at)
                 VALUES (?, ?, ?, ?, ?)`,
                [m.id, m.sender_id, m.receiver_id, m.content, m.sent_at]
            )
        }
    })
}

export const getCachedMessages = async (userId1: string, userId2: string): Promise<any[]> => {
    return db.getAllAsync(
        `SELECT * FROM messages
         WHERE (sender_id = ? AND receiver_id = ?)
            OR (sender_id = ? AND receiver_id = ?)
         ORDER BY sent_at ASC
         LIMIT 40`,
        [userId1, userId2, userId2, userId1]
    )
}

export const appendMessage = async (message: any) => {
    await db.runAsync(
        `INSERT OR REPLACE INTO messages (id, sender_id, receiver_id, content, sent_at)
         VALUES (?, ?, ?, ?, ?)`,
        [message.id, message.sender_id, message.receiver_id, message.content, message.sent_at]
    )
}

export const cacheProjects = async (projects: any[]) => {
    await db.withTransactionAsync(async () => {
        await db.runAsync('DELETE FROM projects')
        for (const p of projects) {
            await db.runAsync(
                `INSERT INTO projects (id, title, description, status, deadline, address, lat, lng, client_name, client_phone, client_email, cached_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [p.id, p.title, p.description, p.status, p.deadline, p.address,
                 p.lat, p.lng, p.client_name, p.client_phone, p.client_email, Date.now()]
            )
        }
    })
}

export const getCachedProjects = async (): Promise<any[]> => {
    return db.getAllAsync('SELECT * FROM projects ORDER BY title')
}

export const cacheTasks = async (projectId: string, tasks: any[]) => {
    await db.withTransactionAsync(async () => {
        await db.runAsync('DELETE FROM tasks WHERE project_id = ?', [projectId])
        for (const t of tasks) {
            await db.runAsync(
                `INSERT INTO tasks (id, project_id, title, description, category_id, priority, status, deadline, lat, lng, cached_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [t.id, t.project_id, t.title, t.description, t.category_id,
                 t.priority, t.status, t.deadline, t.lat, t.lng, Date.now()]
            )
        }
    })
}

export const getCachedTasks = async (projectId: string): Promise<any[]> => {
    return db.getAllAsync(
        'SELECT * FROM tasks WHERE project_id = ? ORDER BY deadline',
        [projectId]
    )
}

export const updateCachedTaskStatus = async (taskId: string, status: string) => {
    await db.runAsync('UPDATE tasks SET status = ? WHERE id = ?', [status, taskId])
}

export const cacheCategories = async (categories: any[]) => {
    await db.withTransactionAsync(async () => {
        await db.runAsync('DELETE FROM categories')
        for (const c of categories) {
            await db.runAsync(
                'INSERT INTO categories (id, name) VALUES (?, ?)',
                [c.id, c.name]
            )
        }
    })
}

export const getCachedCategories = async (): Promise<any[]> => {
    return db.getAllAsync('SELECT * FROM categories ORDER BY name')
}