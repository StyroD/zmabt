export type ToastPayload = { title: string; body: string; data: Record<string, any> };
type Listener = (payload: ToastPayload) => void;

let listeners: Listener[] = [];

export const toastSignal = {
  show: (payload: ToastPayload) => {
    listeners.forEach(l => l(payload));
  },
  subscribe: (listener: Listener) => {
    listeners.push(listener);
    return () => { listeners = listeners.filter(l => l !== listener); };
  },
};
