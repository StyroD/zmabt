import AsyncStorage from '@react-native-async-storage/async-storage'


const QUEUE_KEY = 'offline_task_queue'

export type OperationType = 'TASK_CREATE' | 'TASK_STATUS_UPDATE' | 'TASK_DELETE' | 'PROJECT_CREATE'

export interface QueuedOperation {
  id: string
  type: OperationType
  payload: Record<string, any>
  timestamp: number
  retries: number
}


const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

export async function getQueue(): Promise<QueuedOperation[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export async function addToQueue(type: OperationType, payload: Record<string, any>): Promise<QueuedOperation> {
  const op: QueuedOperation = { id: generateId(), type, payload, timestamp: Date.now(), retries: 0 }
  const queue = await getQueue()
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify([...queue, op]))
  return op
}

export async function removeFromQueue(id: string): Promise<void> {
  const queue = await getQueue()
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue.filter(op => op.id !== id)))
}

export async function incrementRetries(id: string): Promise<void> {
  const queue = await getQueue()
  await AsyncStorage.setItem(
    QUEUE_KEY,
    JSON.stringify(queue.map(op => (op.id === id ? { ...op, retries: op.retries + 1 } : op)))
  )
}

export async function clearQueue(): Promise<void> {
  await AsyncStorage.removeItem(QUEUE_KEY)
}
