import * as FileSystem from 'expo-file-system/legacy'
import * as WebBrowser from 'expo-web-browser'
import * as SecureStore from 'expo-secure-store'
import client from '../client'

const API_BASE = (client.defaults.baseURL ?? 'http://localhost:3000/api').replace(/\/$/, '')

export const getCertificatesByWorker = (workerId: string) =>
  client.get(`/uploads/certificates/worker/${workerId}`)

export const getProjectPhotos = (projectId: string) =>
  client.get(`/uploads/photos/project/${projectId}`)

export const downloadCertificateFile = async (id: string): Promise<string> => {
  const token = await SecureStore.getItemAsync('token')
  const cacheDir = FileSystem.cacheDirectory ?? 'file:///tmp/'
  const dest = `${cacheDir}cert_${id}`
  const { uri } = await FileSystem.downloadAsync(
    `${API_BASE}/uploads/certificate/${id}`,
    dest,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return uri
}

export const openCertificateFile = async (id: string) => {
  const uri = await downloadCertificateFile(id)
  await WebBrowser.openBrowserAsync(uri)
}

