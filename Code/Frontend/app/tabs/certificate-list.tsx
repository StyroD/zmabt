import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useEffect, useState } from 'react'
import * as SecureStore from 'expo-secure-store'
import { useColors } from '@/contexts/ThemeContext'
import { ScreenWrapper } from '@/components/ScreenWrapper'
import { getCertificatesByWorker } from '@/api/endpoints/uploads'

export default function CertificateList() {
  const Colors = useColors()
  const { workerId, categoryId, categoryName } = useLocalSearchParams<{
    workerId: string
    categoryId: string
    categoryName: string
  }>()

  const [certificates, setCertificates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const id = workerId ?? JSON.parse(await SecureStore.getItemAsync('user') ?? '{}')?.id
        const res = await getCertificatesByWorker(id)
        const filtered = categoryId
          ? res.data.filter((c: any) => c.category_id === categoryId)
          : res.data
        setCertificates(filtered)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [workerId, categoryId])

  const openFile = (cert: any) => {
    router.push({
      pathname: '/tabs/certificate-view' as any,
      params: { certId: cert.id, certName: cert.name, mimeType: cert.file_url },
    })
  }

  const styles = StyleSheet.create({
    list: {
      paddingTop: 16,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 18,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    },
    certName: {
      fontSize: 16,
      fontWeight: '700',
      color: Colors.textPrimary,
    },
    pdfLink: {
      fontSize: 14,
      color: Colors.textPrimary,
      textDecorationLine: 'underline',
    },
    empty: {
      color: Colors.textSecondary,
      textAlign: 'center',
      marginTop: 40,
    },
  })

  return (
    <ScreenWrapper title={categoryName ?? 'Certificates'} backRoute="..">
      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {certificates.length === 0 ? (
            <Text style={styles.empty}>No certificates found</Text>
          ) : (
            certificates.map((cert) => (
              <View key={cert.id} style={styles.row}>
                <Text style={styles.certName}>{cert.name}</Text>
                <TouchableOpacity onPress={() => openFile(cert)}>
                  <Text style={styles.pdfLink}>Show</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </ScreenWrapper>
  )
}
