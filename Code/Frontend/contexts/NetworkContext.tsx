import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import NetInfo from '@react-native-community/netinfo'
import { getQueue, removeFromQueue, incrementRetries, QueuedOperation } from '@/utils/offlineQueue'
import { createTask, updateTaskStatus, deleteTask, assignWorkersToTask } from '@/api/endpoints/tasks'
import { createProject } from '@/api/endpoints/projects'
import { toastSignal } from '@/utils/toastSignal'

interface NetworkContextValue {
  isOnline: boolean
  pendingCount: number
  refreshCount: number
  syncQueue: () => Promise<void>
}



const NetworkContext = createContext<NetworkContextValue>({
  isOnline: true,
  pendingCount: 0,
  refreshCount: 0,
  syncQueue: async () => {},
})

export function useNetwork() {
  return useContext(NetworkContext)
}




async function executeOperation(op: QueuedOperation): Promise<void> {
  switch (op.type) {
    case 'TASK_CREATE': {
    const { workerIds, ...taskData } = op.payload
    const res = await createTask(taskData as { project_id: string; title: string; [key: string]: any })
    if (workerIds?.length > 0) {
        await assignWorkersToTask(res.data.id, workerIds)
    }
    break
    }
    case 'TASK_STATUS_UPDATE':
      await updateTaskStatus(op.payload.taskId, op.payload.status)
      break
    case 'TASK_DELETE':
      await deleteTask(op.payload.taskId)
      break
    case 'PROJECT_CREATE': {
        await createProject(op.payload as { manager_id: string; title: string; [key: string]: any })
        break
    }
  }
  
}

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)
  const [refreshCount, setRefreshCount] = useState(0)
  const isSyncing = useRef(false)

  const refreshPendingCount = useCallback(async () => {
    const queue = await getQueue()
    setPendingCount(queue.length)
  }, [])

  const syncQueue = useCallback(async () => {
    if (isSyncing.current) return
    isSyncing.current = true
    try {
      const queue = await getQueue()
      for (const op of queue) {
        if (op.retries >= 3) {
          await removeFromQueue(op.id)
          continue
        }
        try {
          await executeOperation(op)
          await removeFromQueue(op.id)
        } catch (err: any) {
          const status = err?.response?.status
          if (status === 404 || status === 409 || status === 400) {
            await removeFromQueue(op.id)
          } else {
            await incrementRetries(op.id)
          }
        }
      }
    } finally {
      isSyncing.current = false
      await refreshPendingCount()
    }
  }, [refreshPendingCount])

  useEffect(() => {
    refreshPendingCount()

    const unsubscribe = NetInfo.addEventListener(state => {
      const online = !!state.isConnected && state.isInternetReachable !== false

      setIsOnline(prev => {
        if (prev === online) return prev

        if (prev && !online) {
          toastSignal.show({
            title: 'No connection',
            body: 'Showing cached data',
            data: { type: 'connectivity' },
          })
        }

        if (!prev && online) {
          toastSignal.show({
            title: 'Back online',
            body: 'Reloading data...',
            data: { type: 'connectivity' },
          })
          setRefreshCount(c => c + 1)
        }

        return online
      })
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    if (!isOnline) return
    const run = async () => {
      await syncQueue()
      await refreshPendingCount()
    }
    run()
  }, [isOnline]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <NetworkContext.Provider value={{ isOnline, pendingCount, refreshCount, syncQueue }}>
      {children}
    </NetworkContext.Provider>
  )
}
