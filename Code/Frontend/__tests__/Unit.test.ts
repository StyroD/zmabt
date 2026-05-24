// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
}))

jest.mock('expo-secure-store', () => ({
    setItemAsync: jest.fn(),
    deleteItemAsync: jest.fn(),
    getItemAsync: jest.fn(),
}))

jest.mock('../api/client', () => ({
    post: jest.fn(),
}))

// ─── Imports ─────────────────────────────────────────────────────────────────

import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'
import client from '../api/client'
import {
    getQueue,
    addToQueue,
    removeFromQueue,
    incrementRetries,
    clearQueue,
} from '../utils/offlineQueue'
import { login, logout } from '../api/auth'
import { stripUser, saveUser } from '../utils/secureUser'

// ─── Helpers mirrored from create-project.tsx ────────────────────────────────

const formatDate = (date: Date): string =>
    date.toLocaleDateString('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric' })

interface ValidationFields {
    title: string
    deadline: Date | null
    address: string
    clientName: string
    clientEmail: string
}

const validate = (fields: ValidationFields): Record<string, string> => {
    const errors: Record<string, string> = {}
    if (!fields.title.trim()) errors.title = 'Title is required'
    if (!fields.deadline) errors.deadline = 'Deadline is required'
    if (!fields.address.trim()) errors.address = 'Address is required'
    if (!fields.clientName.trim()) errors.clientName = 'Client name is required'
    if (fields.clientEmail && !/\S+@\S+\.\S+/.test(fields.clientEmail))
        errors.clientEmail = 'Invalid email'
    return errors
}

// ─── 1. Project Form Validation ───────────────────────────────────────────────

describe('Project form validation', () => {
    const validFields: ValidationFields = {
        title: 'Office renovation',
        deadline: new Date('2025-12-01'),
        address: 'Hlavna 12, Bratislava',
        clientName: 'Jan Novak',
        clientEmail: 'jan@novak.sk',
    }

    test('passes with all valid fields', () => {
        const errors = validate(validFields)
        expect(Object.keys(errors)).toHaveLength(0)
    })

    test('fails when title is empty', () => {
        const errors = validate({ ...validFields, title: '' })
        expect(errors.title).toBe('Title is required')
    })

    test('fails when deadline is null', () => {
        const errors = validate({ ...validFields, deadline: null })
        expect(errors.deadline).toBe('Deadline is required')
    })

    test('fails when address is empty', () => {
        const errors = validate({ ...validFields, address: '' })
        expect(errors.address).toBe('Address is required')
    })

    test('fails when client name is empty', () => {
        const errors = validate({ ...validFields, clientName: '' })
        expect(errors.clientName).toBe('Client name is required')
    })

    test('fails when client email is invalid', () => {
        const errors = validate({ ...validFields, clientEmail: 'not-an-email' })
        expect(errors.clientEmail).toBe('Invalid email')
    })

    test('allows empty client email without error', () => {
        const errors = validate({ ...validFields, clientEmail: '' })
        expect(errors.clientEmail).toBeUndefined()
    })

    test('fails with multiple missing fields at once', () => {
        const errors = validate({ title: '', deadline: null, address: '', clientName: '', clientEmail: '' })
        expect(Object.keys(errors)).toHaveLength(4)
    })
})

// ─── 2. Date Formatting ───────────────────────────────────────────────────────

describe('Date formatting', () => {
    test('formats date in sk-SK locale', () => {
        const date = new Date('2025-06-15')
        const formatted = formatDate(date)
        expect(formatted).toMatch(/15/)
        expect(formatted).toMatch(/06/)
        expect(formatted).toMatch(/2025/)
    })

    test('formats first day of year correctly', () => {
        const date = new Date('2025-01-01')
        const formatted = formatDate(date)
        expect(formatted).toMatch(/01/)
        expect(formatted).toMatch(/2025/)
    })
})

// ─── 3. Offline Queue ─────────────────────────────────────────────────────────

describe('Offline queue', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('getQueue returns empty array when storage is empty', async () => {
        ;(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null)
        const queue = await getQueue()
        expect(queue).toEqual([])
    })

    test('addToQueue adds an operation with correct shape', async () => {
        ;(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null)
        ;(AsyncStorage.setItem as jest.Mock).mockResolvedValueOnce(undefined)

        const op = await addToQueue('TASK_CREATE', { title: 'Fix pipes' })

        expect(op.type).toBe('TASK_CREATE')
        expect(op.payload).toEqual({ title: 'Fix pipes' })
        expect(op.retries).toBe(0)
        expect(op.id).toBeDefined()
        expect(op.timestamp).toBeDefined()
    })

    test('removeFromQueue removes the correct operation', async () => {
        const existing = [
            { id: 'abc', type: 'TASK_CREATE', payload: {}, timestamp: 1, retries: 0 },
            { id: 'def', type: 'TASK_DELETE', payload: {}, timestamp: 2, retries: 0 },
        ]
        ;(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(existing))
        ;(AsyncStorage.setItem as jest.Mock).mockResolvedValueOnce(undefined)

        await removeFromQueue('abc')

        const saved = JSON.parse((AsyncStorage.setItem as jest.Mock).mock.calls[0][1])
        expect(saved).toHaveLength(1)
        expect(saved[0].id).toBe('def')
    })

    test('incrementRetries increases retry count by 1', async () => {
        const existing = [
            { id: 'abc', type: 'TASK_CREATE', payload: {}, timestamp: 1, retries: 2 },
        ]
        ;(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(existing))
        ;(AsyncStorage.setItem as jest.Mock).mockResolvedValueOnce(undefined)

        await incrementRetries('abc')

        const saved = JSON.parse((AsyncStorage.setItem as jest.Mock).mock.calls[0][1])
        expect(saved[0].retries).toBe(3)
    })

    test('clearQueue removes all operations', async () => {
        ;(AsyncStorage.removeItem as jest.Mock).mockResolvedValueOnce(undefined)
        await clearQueue()
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('offline_task_queue')
    })
})

// ─── 4. Auth ──────────────────────────────────────────────────────────────────

describe('Auth', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('login stores token and userId in SecureStore', async () => {
        ;(client.post as jest.Mock).mockResolvedValueOnce({
            data: {
                token: 'test-token-123',
                user: { id: 'user-456', email: 'test@test.sk' },
            },
        })

        await login('test@test.sk', 'password123')

        expect(SecureStore.setItemAsync).toHaveBeenCalledWith('token', 'test-token-123')
        expect(SecureStore.setItemAsync).toHaveBeenCalledWith('userId', 'user-456')
    })

    test('login returns user data', async () => {
        const mockData = {
            token: 'test-token-123',
            user: { id: 'user-456', email: 'test@test.sk' },
        }
        ;(client.post as jest.Mock).mockResolvedValueOnce({ data: mockData })

        const result = await login('test@test.sk', 'password123')
        expect(result).toEqual(mockData)
    })

    test('logout deletes token and userId from SecureStore', async () => {
        await logout()
        expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('token')
        expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('userId')
    })
})

// ─── 5. SecureUser ────────────────────────────────────────────────────────────

describe('SecureUser', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('stripUser removes sensitive fields', () => {
        const user = {
            id: '1',
            name: 'Damian',
            email: 'damian@test.sk',
            avatar: 'base64longstring',
            avatar_mime_type: 'image/jpeg',
            password_hash: 'hashedpassword',
            google_id: 'google123',
        }
        const stripped = stripUser(user)
        expect(stripped.avatar).toBeUndefined()
        expect(stripped.avatar_mime_type).toBeUndefined()
        expect(stripped.password_hash).toBeUndefined()
        expect(stripped.google_id).toBeUndefined()
    })

    test('stripUser keeps non-sensitive fields', () => {
        const user = {
            id: '1',
            name: 'Damian',
            email: 'damian@test.sk',
            avatar: 'base64longstring',
        }
        const stripped = stripUser(user)
        expect(stripped.id).toBe('1')
        expect(stripped.name).toBe('Damian')
        expect(stripped.email).toBe('damian@test.sk')
    })

    test('saveUser calls SecureStore with stripped user JSON', async () => {
        ;(SecureStore.setItemAsync as jest.Mock).mockResolvedValueOnce(undefined)

        const user = {
            id: '1',
            name: 'Damian',
            password_hash: 'secret',
        }

        await saveUser(user)

        const saved = JSON.parse((SecureStore.setItemAsync as jest.Mock).mock.calls[0][1])
        expect(saved.password_hash).toBeUndefined()
        expect(saved.name).toBe('Damian')
    })
})