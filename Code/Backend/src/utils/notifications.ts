import Expo, { ExpoPushMessage } from 'expo-server-sdk'
import pool from '../config/db'
import { v4 as uuidv4 } from 'uuid'
import { emitNotification } from '../socket'

const expo = new Expo()

type NotificationType = 'task_assigned' | 'task_done' | 'certificate_submitted' | 'certificate_reviewed'

export const sendNotification = async ({
  userId,
  type,
  title,
  body,
  referenceId,
  referenceType,
  extraData = {},
}: {
  userId: string
  type: NotificationType
  title: string
  body: string
  referenceId: string
  referenceType: string
  extraData?: Record<string, any>
}): Promise<void> => {
  await pool.query(
    `INSERT INTO notifications (id, user_id, type, title, body, reference_id, reference_type, read, sent_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, false, NOW())`,
    [uuidv4(), userId, type, title, body, referenceId, referenceType]
  )

  emitNotification(userId, { type, title, body, referenceId, referenceType, ...extraData })

  const tokenResult = await pool.query(
    'SELECT fcm_token FROM users WHERE id = $1',
    [userId]
  )
  const expoPushToken = tokenResult.rows[0]?.fcm_token

  if (!expoPushToken || !Expo.isExpoPushToken(expoPushToken)) return


  const message: ExpoPushMessage = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data: { referenceId, referenceType, type, ...extraData },
  }

  try {
    await expo.sendPushNotificationsAsync([message])
  } catch (err) {
    console.error('Expo push error:', err)
    // Don't throw — notification is already saved to DB
  }
}