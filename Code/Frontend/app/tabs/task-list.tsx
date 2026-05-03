import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useColors } from '@/contexts/ThemeContext'
import { ScreenWrapper } from '@/components/ScreenWrapper'
import { useState, useMemo } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from 'expo-router'
import { useCallback } from 'react'
import AntDesign from '@expo/vector-icons/AntDesign'
import { getTasksByProjectId } from '@/api/endpoints/tasks'
import { TaskBox } from '@/components/TaskBox'
import { logScreenView } from '@/utils/firebase'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { cacheTasks, getCachedTasks } from '@/utils/db'


const STATUSES = ['all', 'pending', 'in_progress', 'done']
const PRIORITIES = ['all', 'low', 'medium', 'high']

const statusLabels: Record<string, string> = {
  all: 'All statuses',
  pending: 'Pending',
  in_progress: 'In Progress',
  done: 'Done',
}

const priorityLabels: Record<string, string> = {
  all: 'All priorities',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export default function TaskList() {
  const Colors = useColors()
  const insets = useSafeAreaInsets()
  const { projectId, projectTitle } = useLocalSearchParams()

  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [showStatusPicker, setShowStatusPicker] = useState(false)
  const [showPriorityPicker, setShowPriorityPicker] = useState(false)

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
      return matchesStatus && matchesPriority
    })
  }, [tasks, statusFilter, priorityFilter])

  const activeFilterCount = [statusFilter, priorityFilter].filter(f => f !== 'all').length

  useFocusEffect(
    useCallback(() => {
        logScreenView('TaskList').catch(() => {})
        setLoading(true)
        getTasksByProjectId(projectId as string)
            .then(async res => {
                setTasks(res.data)
                await cacheTasks(projectId as string, res.data)
            })
            .catch(async () => {
                const cached = await getCachedTasks(projectId as string)
                setTasks(cached)
            })
            .finally(() => setLoading(false))
    }, [projectId])
)

  const styles = StyleSheet.create({
    center: {
      flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background,
    },
    toolbar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
      marginBottom: 4,
    },
    filterBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: Colors.border,
      backgroundColor: Colors.surface,
    },
    filterActive: {
      borderColor: Colors.primary,
      backgroundColor: Colors.primaryLight,
    },
    filterText: {
      fontSize: 13,
      color: Colors.textSecondary,
    },
    filterTextActive: {
      color: Colors.primary,
    },
    clearBtn: {
      padding: 6,
    },
    dropdown: {
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: 10,
      marginBottom: 8,
      overflow: 'hidden',
    },
    dropdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    },
    dropdownText: {
      fontSize: 14,
      color: Colors.textPrimary,
    },
    dropdownTextActive: {
      color: Colors.primary,
      fontWeight: '500',
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
      gap: 12,
    },
    emptyText: {
      fontSize: 14,
      color: Colors.textSecondary,
    },
    clearFiltersText: {
      fontSize: 14,
      color: Colors.primary,
      textDecorationLine: 'underline',
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
    <ScreenWrapper
      title={projectTitle as string ?? 'Project'}
      backRoute='/tabs/projectsList'
      rightElement={
        <TouchableOpacity onPress={() => router.push(`/tabs/create-task?projectId=${projectId}&projectTitle=${projectTitle}`)}>
          <AntDesign name="plus" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      }
    >
      <View style={styles.toolbar}>
        <TouchableOpacity
          style={[styles.filterBtn, statusFilter !== 'all' && styles.filterActive]}
          onPress={() => { setShowStatusPicker(!showStatusPicker); setShowPriorityPicker(false) }}
        >
          <Ionicons name="flag-outline" size={16} color={statusFilter !== 'all' ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.filterText, statusFilter !== 'all' && styles.filterTextActive]}>
            {statusLabels[statusFilter]}
          </Text>
          <AntDesign name={showStatusPicker ? 'up' : 'down'} size={10} color={Colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, priorityFilter !== 'all' && styles.filterActive]}
          onPress={() => { setShowPriorityPicker(!showPriorityPicker); setShowStatusPicker(false) }}
        >
          <Ionicons name="alert-circle-outline" size={16} color={priorityFilter !== 'all' ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.filterText, priorityFilter !== 'all' && styles.filterTextActive]}>
            {priorityLabels[priorityFilter]}
          </Text>
          <AntDesign name={showPriorityPicker ? 'up' : 'down'} size={10} color={Colors.textSecondary} />
        </TouchableOpacity>

        {activeFilterCount > 0 && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => { setStatusFilter('all'); setPriorityFilter('all') }}
          >
            <AntDesign name="close" size={14} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {showStatusPicker && (
        <View style={styles.dropdown}>
          {STATUSES.map(s => (
            <TouchableOpacity
              key={s}
              style={styles.dropdownItem}
              onPress={() => { setStatusFilter(s); setShowStatusPicker(false) }}
            >
              <Text style={[styles.dropdownText, statusFilter === s && styles.dropdownTextActive]}>
                {statusLabels[s]}
              </Text>
              {statusFilter === s && <AntDesign name="check" size={14} color={Colors.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {showPriorityPicker && (
        <View style={styles.dropdown}>
          {PRIORITIES.map(p => (
            <TouchableOpacity
              key={p}
              style={styles.dropdownItem}
              onPress={() => { setPriorityFilter(p); setShowPriorityPicker(false) }}
            >
              <Text style={[styles.dropdownText, priorityFilter === p && styles.dropdownTextActive]}>
                {priorityLabels[p]}
              </Text>
              {priorityFilter === p && <AntDesign name="check" size={14} color={Colors.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={40} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>No tasks match your filters</Text>
            <TouchableOpacity onPress={() => { setStatusFilter('all'); setPriorityFilter('all') }}>
              <Text style={styles.clearFiltersText}>Clear filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredTasks.map(task => (
            <TaskBox
              key={task.id}
              task={task}
              onStatusChange={() => {
                setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'done' } : t))
              }}
              onDelete={(id) => {
                setTasks(prev => prev.filter(t => t.id !== id))
              }}
            />
          ))
        )}
        <View style={{ height: Math.max(insets.bottom, 16) + 16 }} />
      </ScrollView>
    </ScreenWrapper>
  )
}
