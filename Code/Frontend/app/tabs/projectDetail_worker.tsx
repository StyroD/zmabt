import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import { useColors } from '@/contexts/ThemeContext'
import { ScreenWrapper } from '@/components/ScreenWrapper'
import { useEffect, useState } from 'react'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import AntDesign from '@expo/vector-icons/AntDesign'
import { getProjectById } from '@/api/endpoints/projects'
import { getProjectWorkers } from '@/api/endpoints/workers'
import { getTasksByProjectId } from '@/api/endpoints/tasks'
import * as SecureStore from 'expo-secure-store'
import client from '@/api/client'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function ProjectDetailWorker() {
  const Colors = useColors()
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id: string }>()
  const [project, setProject] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [workers, setWorkers] = useState<any[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const statusConfig = {
    in_progress: { label: 'In Progress', dot: Colors.online,  bg: Colors.successBg, text: Colors.success, border: Colors.successBorder },
    pending:     { label: 'Pending',     dot: Colors.warning, bg: Colors.warningBg, text: Colors.warning, border: Colors.warningBorder },
    cancelled:   { label: 'Cancelled',   dot: Colors.danger,  bg: Colors.dangerBg,  text: Colors.danger,  border: Colors.dangerBorder },
    finished:    { label: 'Finished',    dot: Colors.neutral, bg: Colors.neutralBg, text: Colors.neutral, border: Colors.neutralBorder },
    done:        { label: 'Done',        dot: Colors.online,  bg: Colors.successBg, text: Colors.success, border: Colors.successBorder },
  }

  const priorityColors: Record<string, string> = {
    high: Colors.danger, medium: Colors.warning, low: Colors.success,
  }

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await SecureStore.getItemAsync('user')
        const user = stored ? JSON.parse(stored) : null
        setCurrentUserId(user?.id ?? null)

        const [projRes, tasksRes, workersRes] = await Promise.all([
          getProjectById(id as string),
          getTasksByProjectId(id as string),
          getProjectWorkers(id as string),
        ])
        setProject(projRes.data)
        setTasks(tasksRes.data)
        setWorkers(workersRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleMarkDone = async (taskId: string) => {
    try {
      await client.patch(`/tasks/${taskId}/status`, { status: 'done' })
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'done' } : t))
    } catch {
      Alert.alert('Error', 'Could not update task status')
    }
  }

  const formatDate = (d: string) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const styles = StyleSheet.create({
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
    projectTitle: { paddingTop: 10, fontSize: 28, color: Colors.textPrimary, fontWeight: '400' },
    statusBox: {
      flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
      gap: 6, borderWidth: 1, borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10,
      marginTop: 6, marginBottom: 10,
    },
    dot: { width: 8, height: 8, borderRadius: 4 },
    statusText: { fontSize: 13 },
    description: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20, marginBottom: 12 },
    infoRow: { flexDirection: 'row', gap: 12, marginBottom: 4 },
    infoBox: {
      flex: 1, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
      borderRadius: 10, padding: 12, gap: 4,
    },
    infoLabel: { fontSize: 11, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.4 },
    infoValue: { fontSize: 14, color: Colors.textPrimary, fontWeight: '500' },
    progressRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
    progressBox: {
      flex: 1, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
      borderRadius: 10, padding: 12, gap: 4,
    },
    progressValue: { fontSize: 22, fontWeight: '500', color: Colors.textPrimary },
    progressLabel: { fontSize: 12, color: Colors.textSecondary },
    sectionDivider: { height: 1, backgroundColor: Colors.border, marginTop: 20, marginBottom: 10 },
    sectionLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 8 },
    emptyText: { fontSize: 13, color: Colors.textSecondary, fontStyle: 'italic' },
    taskCard: {
      backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
      borderRadius: 10, padding: 14, marginBottom: 8, gap: 6,
    },
    taskCardDone: { opacity: 0.55 },
    taskHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    priorityDot: { width: 8, height: 8, borderRadius: 4 },
    taskTitle: { flex: 1, fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
    taskTitleDone: { textDecorationLine: 'line-through', fontWeight: '400' },
    taskDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
    taskFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
    taskDeadline: { fontSize: 12, color: Colors.textSecondary },
    doneBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      backgroundColor: Colors.successBg, borderWidth: 1, borderColor: Colors.successBorder,
      borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10,
    },
    doneBtnText: { fontSize: 13, color: Colors.success },
    workerRow: {
      flexDirection: 'row', alignItems: 'center', gap: 10,
      backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
      borderRadius: 10, padding: 14, marginBottom: 8,
    },
    workerName: { flex: 1, fontSize: 15, color: Colors.textPrimary },
  })

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  if (!project) {
    return (
      <View style={styles.center}>
        <Text style={{ color: Colors.textSecondary }}>Project not found</Text>
      </View>
    )
  }

  const statusCfg = statusConfig[project.status as keyof typeof statusConfig] ?? statusConfig['pending']
  const myTasks = tasks.filter(t => t.status !== 'done')
  const doneTasks = tasks.filter(t => t.status === 'done')

  return (
    <ScreenWrapper title="Project detail" backRoute="/tabs/projectsList">
      <ScrollView showsVerticalScrollIndicator={false}>

        <Text style={styles.projectTitle}>{project.title}</Text>
        <View style={[styles.statusBox, { backgroundColor: statusCfg.bg, borderColor: statusCfg.border }]}>
          <View style={[styles.dot, { backgroundColor: statusCfg.dot }]} />
          <Text style={[styles.statusText, { color: statusCfg.text }]}>{statusCfg.label}</Text>
        </View>

        {project.description ? (
          <Text style={styles.description}>{project.description}</Text>
        ) : null}

        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.infoLabel}>Deadline</Text>
            <Text style={styles.infoValue}>{formatDate(project.deadline)}</Text>
          </View>
          <View style={styles.infoBox}>
            <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.infoLabel}>Location</Text>
            <Text style={styles.infoValue} numberOfLines={2}>{project.address ?? '—'}</Text>
          </View>
        </View>

        <View style={styles.progressRow}>
          <View style={[styles.progressBox, { backgroundColor: Colors.primaryLight, borderColor: Colors.primary }]}>
            <Text style={styles.progressValue}>{tasks.filter(t => t.status === 'done').length}/{tasks.length}</Text>
            <Text style={styles.progressLabel}>Tasks done</Text>
          </View>
          <View style={styles.progressBox}>
            <Text style={styles.progressValue}>{workers.length}</Text>
            <Text style={styles.progressLabel}>Team members</Text>
          </View>
        </View>

        <View style={styles.sectionDivider} />
        <Text style={styles.sectionLabel}>Active tasks</Text>
        {myTasks.length === 0 ? (
          <Text style={styles.emptyText}>No active tasks</Text>
        ) : (
          myTasks.map(task => (
            <View key={task.id} style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <View style={[styles.priorityDot, { backgroundColor: priorityColors[task.priority] ?? Colors.textSecondary }]} />
                <Text style={styles.taskTitle}>{task.title}</Text>
              </View>
              {task.description ? <Text style={styles.taskDesc}>{task.description}</Text> : null}
              <View style={styles.taskFooter}>
                {task.deadline ? (
                  <Text style={styles.taskDeadline}>Due {formatDate(task.deadline)}</Text>
                ) : null}
                {task.status !== 'done' && (
                  <TouchableOpacity style={styles.doneBtn} onPress={() => handleMarkDone(task.id)}>
                    <AntDesign name="check" size={14} color={Colors.success} />
                    <Text style={styles.doneBtnText}>Mark done</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}

        {doneTasks.length > 0 && (
          <>
            <View style={styles.sectionDivider} />
            <Text style={styles.sectionLabel}>Completed ({doneTasks.length})</Text>
            {doneTasks.map(task => (
              <View key={task.id} style={[styles.taskCard, styles.taskCardDone]}>
                <View style={styles.taskHeader}>
                  <AntDesign name="check-circle" size={14} color={Colors.success} />
                  <Text style={[styles.taskTitle, styles.taskTitleDone]}>{task.title}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        <View style={styles.sectionDivider} />
        <Text style={styles.sectionLabel}>Team</Text>
        {workers.map(w => (
          <TouchableOpacity
            key={w.id}
            style={styles.workerRow}
            onPress={() => router.push(`/tabs/profile?userId=${w.id}&mode=project`)}
          >
            <Ionicons name="person-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.workerName}>
              {w.first_name && w.last_name ? `${w.first_name} ${w.last_name}` : w.username ?? w.id}
              {w.id === currentUserId ? ' (you)' : ''}
            </Text>
            <AntDesign name="right" size={12} color={Colors.textSecondary} />
          </TouchableOpacity>
        ))}

        <View style={{ height: Math.max(insets.bottom, 16) + 16 }} />
      </ScrollView>
    </ScreenWrapper>
  )
}
