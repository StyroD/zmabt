import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { Colors } from '../../constants/color'
import { ScreenWrapper } from '@/components/ScreenWrapper'
import { useState, useEffect } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import AntDesign from '@expo/vector-icons/AntDesign'
import { ActivityIndicator } from 'react-native'
import { getTasksByProjectId } from '@/api/endpoints/tasks'
import { TaskBox } from '@/components/TaskBox'





export default function TaskList() {
  const { projectId, projectTitle } = useLocalSearchParams()

  
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    getTasksByProjectId(projectId as string)
      .then(res => {
        setTasks(res.data)
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