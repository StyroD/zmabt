let activeChatUserId = ''
let markReadCallback: ((userId: string) => void) | null = null

export const activeChatSignal = {
  get: () => activeChatUserId,
  set: (v: string) => {
    activeChatUserId = v
    if (v && markReadCallback) markReadCallback(v)
  },
  registerMarkRead: (cb: (userId: string) => void) => {
    markReadCallback = cb
    return () => { markReadCallback = null }
  },
}
