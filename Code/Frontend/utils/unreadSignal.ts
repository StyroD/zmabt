type Listener = (count: number) => void;
let unreadCount = 0;
let listeners: Listener[] = [];

export const unreadSignal = {
  set: (count: number) => {
    unreadCount = count;
    listeners.forEach(l => l(unreadCount));
  },
  get: () => unreadCount,
  subscribe: (listener: Listener) => {
    listeners.push(listener);
    return () => { listeners = listeners.filter(l => l !== listener); };
  }
};