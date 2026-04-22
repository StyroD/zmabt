import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useColors } from '@/contexts/ThemeContext'
import { router } from 'expo-router'
import { ProjectBox } from '@/components/Projects/ProjectBox'
import { Ionicons } from '@expo/vector-icons'
import { useEffect, useState } from 'react'
import { getProjectByManagerId, getProjectsByWorkerId } from '@/api/endpoints/projects'
import { ScreenWrapper } from '@/components/ScreenWrapper'
import * as SecureStore from 'expo-secure-store'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

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
  const [activeFilter, setActiveFilter] = useState<string>('All')
  const [isManager, setIsManager] = useState(true)

  useEffect(() => {
    const load = async () => {
      const user = JSON.parse(await SecureStore.getItemAsync('user') ?? '{}')
      const manager = user.role === 'manager'
      setIsManager(manager)
      try {
        const res = manager
          ? await getProjectByManagerId(user.id)
          : await getProjectsByWorkerId(user.id)
        setProjects(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

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

      <ScrollView showsVerticalScrollIndicator={false}>
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
              onProjectDetail={() => router.push(isManager ? `/tabs/projectDetail_manager?id=${project.id}` : `/tabs/projectDetail_worker?id=${project.id}`)}
            />
          ))
        )}
        <View style={{ height: Math.max(insets.bottom, 16) + 16 }} />
      </ScrollView>
    </ScreenWrapper>
  )
}
