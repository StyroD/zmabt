import { useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { Image, StyleSheet, ActivityIndicator, Text, View } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import * as WebBrowser from 'expo-web-browser'
import * as FileSystem from 'expo-file-system/legacy'
import { ScreenWrapper } from '@/components/ScreenWrapper'
import { Colors } from '../../constants/color'
import client from '@/api/client'

export default function CertificateView() {
  const { certId, certName, mimeType } = useLocalSearchParams<{
    certId: string
    certName: string
    mimeType: string
  }>()

  const [imageUri, setImageUri] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isImage = mimeType?.startsWith('image/')
  const fileUrl = `${(client.defaults.baseURL ?? '').replace(/\/$/, '')}/uploads/certificate/${certId}`

  useEffect(() => {
    const load = async () => {
      try {
        const token = await SecureStore.getItemAsync('token')

        if (isImage) {
          const cacheDir = FileSystem.cacheDirectory ?? 'file:///tmp/'
          const dest = `${cacheDir}cert_${certId}`
          const result = await FileSystem.downloadAsync(fileUrl, dest, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (result.status !== 200) {
            setError(`Download failed: HTTP ${result.status}`)
            return
          }
          setImageUri(result.uri)
        } else {
          await WebBrowser.openBrowserAsync(`${fileUrl}?token=${token}`)
        }
      } catch (e: any) {
        setError(e?.message ?? 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [certId])

  return (
    <ScreenWrapper title={certName ?? 'Certificate'} backRoute="..">
      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : isImage && imageUri ? (
        <View style={{ flex: 1 }}>
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
        </View>
      ) : (
        <Text style={styles.info}>Opened in browser</Text>
      )}
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  image: {
    flex: 1,
    width: '100%',
  },
  info: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  error: {
    color: Colors.danger,
    textAlign: 'center',
    marginTop: 40,
    paddingHorizontal: 16,
  },
})
