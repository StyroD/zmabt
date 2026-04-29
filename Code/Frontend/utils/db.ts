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