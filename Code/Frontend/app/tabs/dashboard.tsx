import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { Colors } from '../../constants/color'
import { ProfileBox } from '../../components/Dashboard/ProfileBox'
import { InfoBox } from '../../components/Dashboard/InfoBox'
import { getUsers } from '@/api/endpoints/users'
import { router } from 'expo-router'

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUsers()
      .then(res => {
        setCurrentUser(res.data[0])
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  if (!currentUser) {
    return (
      <View style={styles.center}>
        <Text style={{ color: Colors.textSecondary }}>No user found</Text>
      </View>
    )
  }

  const isManager = currentUser.role === 'manager'

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <View style={styles.divider} />
      </View>

      <View style={styles.screen}>
        <ProfileBox
          name={`${currentUser.first_name} ${currentUser.last_name}`}
          role={isManager}
          status="Online"
        />
      </View>

      {isManager ? (
        <InfoBox isManager={true} totaljobs={10} activejobs={3} pendingjobs={6} workers={20} onJobsDetail={() => router.push('/tabs/projects')} onWorkersDetail={() => router.push('/tabs/workers')}/>
      ) : (
        <InfoBox isManager={false} activejobs={2} certificates={4} onJobsDetail={() => router.push('/tabs/projects')} onCertificatesDetail={() => router.push('/tabs/certificates')}/>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  screen: {
    alignItems: 'center',
  },
  container: {
    backgroundColor: Colors.background,
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginTop: 8,
  }
})