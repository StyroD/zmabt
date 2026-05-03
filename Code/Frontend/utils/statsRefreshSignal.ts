type Listener = () => void
let listeners: Listener[] = []

export const statsRefreshSignal = {
  emit: () => { listeners.forEach(l => l()) },
  subscribe: (listener: Listener) => {
    listeners.push(listener)
    return () => { listeners = listeners.filter(l => l !== listener) }
  },
}
