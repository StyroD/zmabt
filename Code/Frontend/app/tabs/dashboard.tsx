import { useCallback, useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useColors } from '@/contexts/ThemeContext'
import { Ionicons } from '@expo/vector-icons'
import { getManagerDashboard, getWorkerDashboard } from '@/api/endpoints/dashboard'
import { getNotifications, markNotificationAsRead } from '@/api/endpoints/notifications'
import { router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { getSocket } from '@/api/socket'
import { logScreenView } from '@/utils/firebase'
import { useFocusEffect } from 'expo-router'

import { statsRefreshSignal } from '@/utils/statsRefreshSignal'

export default function Dashboard() {
  const Colors = useColors()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const currentUserRef = useRef<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useFocusEffect(
  useCallback(() => {
    const load = async () => {
      setLoading(true)
      try {
        const user = JSON.parse(await SecureStore.getItemAsync('user') ?? '{}')
        currentUserRef.current = user
        setCurrentUser(user)

        const dashFn = user.role === 'manager' ? getManagerDashboard : getWorkerDashboard
        const [dashRes, notifRes] = await Promise.all([
          dashFn(user.id),
          getNotifications(user.id),
        ])

        setStats(dashRes.data)
        setNotifications(notifRes.data.slice(0, 5))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])
)

  useEffect(() => {
    if (!currentUser?.id) return
    let mounted = true
    const dashFn = currentUser.role === 'manager' ? getManagerDashboard : getWorkerDashboard
    let socketRef: any = null
    let handler: any = null

    getSocket().then(socket => {
      if (!mounted) return
      socketRef = socket
      handler = (payload: any) => {
        if (!mounted) return
        dashFn(currentUser.id)
          .then(res => { if (mounted) setStats(res.data) })
          .catch(() => {})
        if (payload.type !== 'message') {
          getNotifications(currentUser.id)
            .then(res => { if (mounted) setNotifications(res.data.slice(0, 5)) })
            .catch(() => {})
        }
      }
      socket.on('notification', handler)
    })

    return () => {
      mounted = false
      if (socketRef && handler) socketRef.off('notification', handler)
    }
  }, [currentUser?.id, currentUser?.role])

  useEffect(() => {
    return statsRefreshSignal.subscribe(() => {
      const u = currentUserRef.current
      if (!u?.id) return
      const dashFn = u.role === 'manager' ? getManagerDashboard : getWorkerDashboard
      dashFn(u.id)
        .then(res => setStats(res.data))
        .catch(() => {})
    })
  }, [])

  const handleMarkRead = (id: string) => {
    markNotificationAsRead(id).catch(err => console.error(err))
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const insets = useSafeAreaInsets()

  const styles = StyleSheet.create({
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: Colors.background,
      padding: 16,
      paddingTop: Math.max(insets.top, 16) + 8,
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
      marginBottom: 20,
    },
    profileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: 14,
      padding: 16,
      gap: 14,
      marginBottom: 24,
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: 18,
      fontWeight: '500',
      color: Colors.textPrimary,
    },
    profileRole: {
      fontSize: 13,
      color: Colors.textSecondary,
      marginTop: 2,
    },
    onlineBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: Colors.successBg,
      borderWidth: 1,
      borderColor: Colors.successBorder,
      borderRadius: 20,
      paddingVertical: 4,
      paddingHorizontal: 10,
    },
    onlineDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: Colors.online,
    },
    onlineText: {
      fontSize: 12,
      color: Colors.success,
    },
    sectionLabel: {
      fontSize: 13,
      color: Colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 10,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 24,
    },
    statTile: {
      width: '47.5%',
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: 12,
      padding: 16,
      gap: 6,
    },
    statValue: {
      fontSize: 28,
      fontWeight: '500',
      color: Colors.textPrimary,
    },
    statLabel: {
      fontSize: 12,
      color: Colors.textSecondary,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 24,
    },
    actionBtn: {
      flex: 1,
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: 12,
      padding: 14,
      alignItems: 'center',
      gap: 8,
    },
    actionText: {
      fontSize: 12,
      color: Colors.textPrimary,
    },
    notifList: {
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: 12,
      overflow: 'hidden',
    },
    notifItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    },
    notifRead: {
      opacity: 0.5,
    },
    notifLeft: {
      width: 24,
      alignItems: 'center',
    },
    notifContent: {
      flex: 1,
    },
    notifMessage: {
      fontSize: 14,
      color: Colors.textPrimary,
      fontWeight: '500',
    },
    notifMessageRead: {
      fontWeight: '400',
    },
    notifTime: {
      fontSize: 12,
      color: Colors.textSecondary,
      marginTop: 2,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: Colors.primary,
    },
    emptyText: {
      fontSize: 13,
      color: Colors.textSecondary,
      fontStyle: 'italic',
      padding: 16,
      textAlign: 'center',
    },
  })

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} accessibilityLabel="Loading" />
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

  const managerStats = [
    { label: 'Projects', value: stats?.projects_count ?? '—', icon: 'briefcase-outline' as const },
    { label: 'Workers', value: stats?.workers_count ?? '—', icon: 'people-outline' as const },
    { label: 'Pending tasks', value: stats?.pending_tasks ?? '—', icon: 'time-outline' as const },
    { label: 'Done tasks', value: stats?.completed_tasks ?? '—', icon: 'checkmark-circle-outline' as const },
  ]

  const workerStats = [
    { label: 'Projects', value: stats?.projects_count ?? '—', icon: 'briefcase-outline' as const },
    { label: 'In progress', value: stats?.in_progress_tasks ?? '—', icon: 'reload-outline' as const },
    { label: 'Done today', value: stats?.completed_today ?? '—', icon: 'today-outline' as const },
    { label: 'Done total', value: stats?.completed_tasks ?? '—', icon: 'checkmark-circle-outline' as const },
  ]

  const statTiles = isManager ? managerStats : workerStats

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Dashboard</Text>
      <View style={styles.divider} />

      <View style={styles.profileCard}>
        <Ionicons name="person-circle" size={54} color={Colors.primary} />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{currentUser.first_name} {currentUser.last_name}</Text>
          <Text style={styles.profileRole}>{isManager ? 'Manager' : 'Worker'}</Text>
        </View>
        <View style={styles.onlineBadge}>
          <View style={styles.onlineDot} accessible={false} />
          <Text style={styles.onlineText}>Online</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>Overview</Text>
      <View style={styles.statsGrid}>
        {statTiles.map(tile => (
          <View key={tile.label} style={styles.statTile} accessible={true} accessibilityLabel={`${tile.label}: ${tile.value}`}>
            <Ionicons name={tile.icon} size={20} color={Colors.primary} accessible={false} />
            <Text style={styles.statValue} accessible={false}>{tile.value}</Text>
            <Text style={styles.statLabel} accessible={false}>{tile.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Quick actions</Text>
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/tabs/projectsList')} accessibilityRole="button" accessibilityLabel="Go to projects">
          <Ionicons name="briefcase-outline" size={20} color={Colors.primary} accessible={false} />
          <Text style={styles.actionText}>Projects</Text>
        </TouchableOpacity>
        {isManager ? (
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/tabs/workers' as any)} accessibilityRole="button" accessibilityLabel="Go to workers">
            <Ionicons name="people-outline" size={20} color={Colors.primary} accessible={false} />
            <Text style={styles.actionText}>Workers</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/tabs/profile?mode=own' as any)} accessibilityRole="button" accessibilityLabel="Go to certificates">
            <Ionicons name="ribbon-outline" size={20} color={Colors.primary} accessible={false} />
            <Text style={styles.actionText}>Certificates</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/tabs/map' as any)} accessibilityRole="button" accessibilityLabel="Go to map">
          <Ionicons name="map-outline" size={20} color={Colors.primary} accessible={false} />
          <Text style={styles.actionText}>Map</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionLabel}>Recent notifications</Text>
      <View style={styles.notifList}>
        {notifications.length === 0 ? (
          <Text style={styles.emptyText}>No notifications</Text>
        ) : (
          notifications.map(n => (
            <TouchableOpacity
              key={n.id}
              style={[styles.notifItem, n.read && styles.notifRead]}
              onPress={() => handleMarkRead(n.id)}
              accessibilityRole="button"
              accessibilityLabel={`${n.title ?? n.body}. ${n.read ? 'Read' : 'Unread'}. ${new Date(n.sent_at).toLocaleDateString('sk-SK')}`}
              accessibilityHint={n.read ? undefined : 'Double tap to mark as read'}
            >
              <View style={styles.notifLeft} accessible={false}>
                <Ionicons
                  name={n.read ? 'notifications-outline' : 'notifications'}
                  size={18}
                  color={n.read ? Colors.textSecondary : Colors.primary}
                  accessible={false}
                />
              </View>
              <View style={styles.notifContent} accessible={false}>
                <Text style={[styles.notifMessage, n.read && styles.notifMessageRead]} numberOfLines={2} accessible={false}>{n.title ?? n.body}</Text>
                <Text style={styles.notifTime} accessible={false}>{new Date(n.sent_at).toLocaleDateString('sk-SK')}</Text>
              </View>
              {!n.read && <View style={styles.unreadDot} accessible={false} />}
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={{ height: Math.max(insets.bottom, 16) + 16 }} />
    </ScrollView>
  )
}
