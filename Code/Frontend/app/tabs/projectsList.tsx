import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native'
import { useColors } from '@/contexts/ThemeContext'
import { router } from 'expo-router'
import { ProjectBox } from '@/components/Projects/ProjectBox'
import { Ionicons } from '@expo/vector-icons'
import { useCallback, useState } from 'react'
import { useNetwork } from '@/contexts/NetworkContext'
import { useFocusEffect } from '@react-navigation/native'
import { getProjectByManagerId, getProjectsByWorkerId } from '@/api/endpoints/projects'
import { ScreenWrapper } from '@/components/ScreenWrapper'
import * as SecureStore from 'expo-secure-store'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { cacheProjects, getCachedProjects } from '@/utils/db'
import { getQueue } from '@/utils/offlineQueue'

const FILTERS = ['All', 'in_progress', 'pending', 'finished', 'cancelled'] as const
const filterLabels: Record<string, string> = {
  All: 'All',
  in_progress: 'In Progress',
  pending: 'Pending',
  finished: 'Finished',
  cancelled: 'Cancelled',
}

export default function Projects() {
  const Colors = useColors()
  const insets = useSafeAreaInsets()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string>('All')
  const [isManager, setIsManager] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const { pendingCount, refreshCount, syncQueue } = useNetwork()

  const fetchProjects = useCallback(async (user: any) => {
    const manager = user.role === 'manager'
    const queue = await getQueue()
    const pending = queue
      .filter(op => op.type === 'PROJECT_CREATE')
      .map(op => ({ ...op.payload, id: op.id, _pending: true }))
    try {
      const res = manager
        ? await getProjectByManagerId(user.id)
        : await getProjectsByWorkerId(user.id)
      setProjects([...res.data, ...pending])
      await cacheProjects(res.data)
    } catch {
      const cached = await getCachedProjects()
      setProjects([...cached, ...pending])
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      let active = true
      const load = async () => {
        const raw = await SecureStore.getItemAsync('user') ?? '{}'
        const user = JSON.parse(raw)
        const manager = user.role === 'manager'
        if (active) {
          setIsManager(manager)
          setCurrentUser(user)
        }
        try {
          await fetchProjects(user)
        } finally {
          if (active) setLoading(false)
        }
      }
      load()
      return () => { active = false }
    }, [pendingCount, refreshCount, fetchProjects])
  )

  const onRefresh = useCallback(async () => {
    if (!currentUser) return
    setRefreshing(true)
    try {
      await syncQueue()
      await fetchProjects(currentUser)
    } finally {
      setRefreshing(false)
    }
  }, [currentUser, fetchProjects, syncQueue])

  const formatDate = (dateString: string) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('sk-SK', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    })
  }

  const filtered = activeFilter === 'All'
    ? projects
    : projects.filter(p => p.status === activeFilter)

  const addButton = (
    <TouchableOpacity onPress={() => router.push('/tabs/create-project')}>
      <Ionicons name="add" size={26} color={Colors.primary} />
    </TouchableOpacity>
  )

  const styles = StyleSheet.create({
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors.background,
    },
    filterBar: {
      marginBottom: 8,
      marginTop: 12,
      flexGrow: 0,
    },
    filterContent: {
      gap: 8,
      paddingRight: 8,
    },
    filterChip: {
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: 20,
      paddingVertical: 6,
      paddingHorizontal: 14,
      backgroundColor: Colors.surface,
    },
    filterChipActive: {
      borderColor: Colors.primary,
      backgroundColor: Colors.primaryLight,
    },
    filterText: {
      fontSize: 13,
      color: Colors.textSecondary,
    },
    filterTextActive: {
      color: Colors.textPrimary,
    },
    emptyText: {
      fontSize: 14,
      color: Colors.textSecondary,
      fontStyle: 'italic',
      textAlign: 'center',
      marginTop: 40,
    },
  })

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  return (
    <ScreenWrapper title='Projects' backRoute='/tabs/dashboard' rightElement={isManager ? addButton : undefined}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
              {filterLabels[f]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {filtered.length === 0 ? (
          <Text style={styles.emptyText}>No projects found</Text>
        ) : (
          filtered.map((project: any) => (
            <ProjectBox
              key={project.id}
              title={project.title}
              status={project.status}
              deadline={formatDate(project.deadline)}
              address={project.address}
              onProjectDetail={project._pending
                ? () => Alert.alert('Pending sync', 'This project will be available once it syncs to the server.')
                : () => router.push(isManager ? `/tabs/projectDetail_manager?id=${project.id}` : `/tabs/projectDetail_worker?id=${project.id}`)}
            />
          ))
        )}
        <View style={{ height: Math.max(insets.bottom, 16) + 16 }} />
      </ScrollView>
    </ScreenWrapper>
  )
}