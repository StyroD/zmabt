import client from "../client"

export const getNotifications = (userId: string) => 
  client.get(`/notifications/user/${userId}`)

export const markNotificationAsRead = (id: string) => 
  client.patch(`/notifications/${id}/read`)