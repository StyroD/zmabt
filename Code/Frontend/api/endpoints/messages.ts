import client from '../client'

export const getConversations = () => client.get('/messages/conversations')
export const getMessages = (otherUserId: string) => client.get(`/messages/${otherUserId}`)
export const postMessage = (receiverId: string, content: string) =>
  client.post('/messages', { receiverId, content })
