import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { Colors } from '../../constants/color'
import { ScreenWrapper } from '@/components/ScreenWrapper'
import { useState, useEffect } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import AntDesign from '@expo/vector-icons/AntDesign'
import { ActivityIndicator } from 'react-native'

const statusConfig = {
  pending:     { dot: Colors.warning },
  in_progress: { dot: Colors.online },
  done:        { dot: Colors.success },
}

function TaskBox({ task }: { task: any }) {
  const [expanded, setExpanded] = useState(false)
  const s = statusConfig[task.status as keyof typeof statusConfig] ?? { dot: Colors.offline }
  const photos = ['1', '2', '3']

  return (
    <TouchableOpacity style={styles.taskBox} onPress={() => setExpanded(!expanded)} activeOpacity={0.8}>
      <View style={styles.taskRow}>
        <Text style={styles.taskTitle}>{task.title}</Text>
        <View style={styles.taskRight}>
          <View style={[styles.statusDot, { backgroundColor: s.dot }]} />
          <AntDesign name={expanded ? 'up' : 'down'} size={14} color={Colors.textSecondary} />
        </View>
      </View>

      {expanded && (
        <View style={styles.taskDetail}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category</Text>
            <Text style={styles.detailValue}>{task.category ?? '—'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Description</Text>
            <Text style={styles.detailValue} numberOfLines={2}>{task.description ?? '—'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Assigned person</Text>
            <Text style={styles.detailValue}>{task.assigned ?? '—'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Deadline</Text>
            <Text style={styles.detailValue}>{task.deadline ?? '—'}</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
            {photos.map((p, i) => (
              <View key={i} style={styles.photoBox}>
                <Ionicons name="image-outline" size={22} color={Colors.textSecondary} />
                <Text style={styles.photoText}>Photo</Text>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.uploadBtn}>
            <Text style={styles.uploadText}>Upload more photos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.doneBtn}>
            <Text style={styles.doneBtnText}>Mark as done</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  )
}

export default function TaskList() {
  const { projectId, projectTitle } = useLocalSearchParams()
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: fetch tasks by projectId
    // Placeholder data
    setTasks([
      { id: '1', title: 'Task1', status: 'pending', category: 'Kurenie', description: 'Lorem ipsum...', assigned: 'Ivan', deadline: '29.2.2026' },
      { id: '2', title: 'Task2', status: 'in_progress', category: 'Elektrika', description: 'Lorem ipsum...', assigned: 'Peter', deadline: '29.2.2026' },
      { id: '3', title: 'Task3', status: 'done', category: 'Voda', description: 'Lorem ipsum...', assigned: 'Jano', deadline: '29.2.2026' },
      { id: '4', title: 'Task4', status: 'pending', category: 'Plyn', description: 'Lorem ipsum...', assigned: 'Tono', deadline: '29.2.2026' },
      { id: '5', title: 'Task5', status: 'in_progress', category: 'Kurenie', description: 'Lorem ipsum...', assigned: 'Ivan', deadline: '29.2.2026' },
    ])
    setLoading(false)
  }, [projectId])

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
        <TouchableOpacity onPress={() => router.push('/tabs/create-task')}>
          <AntDesign name="plus" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      }
    >
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="filter" size={18} color={Colors.textSecondary} />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {tasks.map(task => (
          <TaskBox key={task.id} task={task} />
        ))}
        <View style={{ height: 30 }} />
      </ScrollView>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 4,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  taskBox: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 12,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  taskRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  taskDetail: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    maxWidth: '55%',
    textAlign: 'right',
  },
  photoScroll: {
    marginTop: 8,
  },
  photoBox: {
    width: 80,
    height: 80,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    gap: 4,
  },
  photoText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  uploadBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  uploadText: {
    fontSize: 14,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  doneBtn: {
    backgroundColor: Colors.successBg,
    borderWidth: 1,
    borderColor: Colors.successBorder,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  doneBtnText: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: '500',
  },
})