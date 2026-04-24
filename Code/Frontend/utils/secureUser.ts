import * as SecureStore from 'expo-secure-store'

const LARGE_FIELDS = ['avatar', 'avatar_mime_type', 'password_hash', 'google_id']

export function stripUser(user: Record<string, any>) {
  const copy = { ...user }
  for (const f of LARGE_FIELDS) delete copy[f]
  return copy
}

export async function saveUser(user: Record<string, any>) {
  await SecureStore.setItemAsync('user', JSON.stringify(stripUser(user)))
}
