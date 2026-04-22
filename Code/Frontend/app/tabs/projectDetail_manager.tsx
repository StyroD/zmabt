import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator } from 'react-native'
import { useColors } from '@/contexts/ThemeContext'
import { Box } from '@/components/ProjectDetailManager/Box'
import { Ionicons } from '@expo/vector-icons'
import AntDesign from '@expo/vector-icons/AntDesign'
import { ScreenWrapper } from '@/components/ScreenWrapper'
import { useEffect, useState, useRef } from 'react'
import { getProjectById, deleteProject, assignWorkerToProject } from '@/api/endpoints/projects'
import { getProjectWorkers, getAllWorkers } from '@/api/endpoints/workers'
import { getTasksByProjectId } from '@/api/endpoints/tasks'
import { useLocalSearchParams, router } from 'expo-router'


export default function ProjectDetail() {
  const Colors = useColors()
  const { id } = useLocalSearchParams()

  const [currentProject, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [workers, setWorkers] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [allWorkers, setAllWorkers] = useState<any[]>([])
  const [assignModalVisible, setAssignModalVisible] = useState(false)
  const [assignSearch, setAssignSearch] = useState('')
  const [assigning, setAssigning] = useState(false)
  const scrollRef = useRef<ScrollView>(null)

  const handleDeleteProject = () => {
    Alert.alert('Delete project', 'Are you sure you want to delete this project?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await deleteProject(currentProject.id)
            router.replace('/tabs/projectsList')
          } catch {
            Alert.alert('Error', 'Could not delete project')
          }
        }
      }
    ])
  }

  const handleOpenAssign = async () => {
    if (allWorkers.length === 0) {
      try {
        const res = await getAllWorkers()
        setAllWorkers(res.data)
      } catch { /* ignore */ }
    }
    setAssignSearch('')
    setAssignModalVisible(true)
  }

  const handleAssignWorker = async (workerId: string) => {
    setAssigning(true)
    try {
      await assignWorkerToProject(currentProject.id, workerId)
      const res = await getProjectWorkers(currentProject.id)
      setWorkers(res.data)
      setAssignModalVisible(false)
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error ?? 'Could not assign worker')
    } finally {
      setAssigning(false)
    }
  }

  useEffect(() => {
    getProjectById(id as string)
      .then(res => {
        setProject(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [id])

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false })
  }, [id])

  useEffect(() => {
    if (!currentProject) return
    getProjectWorkers(currentProject.id)
      .then(res => setWorkers(res.data))
      .catch(err => console.error(err))
    getTasksByProjectId(currentProject.id)
      .then(res => setTasks(res.data))
      .catch(err => console.error(err))
  }, [currentProject])

  const statusConfig = {
    in_progress: { label: 'In Progress', dot: Colors.online,  bg: Colors.successBg, text: Colors.success, border: Colors.successBorder },
    pending:     { label: 'Pending',     dot: Colors.warning, bg: Colors.warningBg, text: Colors.warning, border: Colors.warningBorder },
    cancelled:   { label: 'Cancelled',   dot: Colors.danger,  bg: Colors.dangerBg,  text: Colors.danger,  border: Colors.dangerBorder },
    finished:    { label: 'Finished',    dot: Colors.neutral, bg: Colors.neutralBg, text: Colors.neutral, border: Colors.neutralBorder },
  }

  const styles = StyleSheet.create({
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors.background,
    },
    sectionDivider: {
      height: 1,
      backgroundColor: Colors.border,
      marginTop: 20,
      marginBottom: 10,
    },
    projectTitle: {
      paddingTop: 10,
      fontSize: 28,
      color: Colors.textPrimary,
      fontWeight: '400',
    },
    statusBox: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 6,
      borderWidth: 1,
      borderRadius: 20,
      paddingVertical: 4,
      paddingHorizontal: 10,
      marginTop: 6,
      marginBottom: 4,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    statusText: {
      fontSize: 13,
      fontWeight: '400',
    },
    row: {
      flexDirection: 'row',
      gap: 12,
    },
    sectionLabel: {
      fontSize: 14,
      color: Colors.textSecondary,
      marginBottom: 4,
    },
    progressBox: {
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: 10,
      padding: 12,
      marginTop: 10,
      gap: 4,
    },
    progressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    progressValue: {
      fontSize: 22,
      fontWeight: '500',
      color: Colors.textPrimary,
    },
    progressLabel: {
      fontSize: 12,
      color: Colors.textSecondary,
    },
    workerBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: 10,
      padding: 14,
      marginTop: 10,
      gap: 12,
    },
    workerName: {
      flex: 1,
      fontSize: 18,
      fontWeight: '400',
      color: Colors.textPrimary,
    },
    workerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    onlineDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      borderWidth: 2,
      borderColor: Colors.successBorder,
    },
    photoScroll: {
      marginTop: 10,
    },
    photoBox: {
      width: 100,
      height: 100,
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
      gap: 6,
    },
    addPhotoBox: {
      borderStyle: 'dashed',
      borderColor: Colors.primary,
      backgroundColor: Colors.primaryLight,
    },
    photoText: {
      color: Colors.textSecondary,
      fontSize: 12,
    },
    actionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginTop: 10,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      width: '48%',
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: 10,
      padding: 10,
      backgroundColor: Colors.surface,
    },
    actionText: {
      fontSize: 13,
      color: Colors.textPrimary,
    },
    mapButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderWidth: 1,
      borderColor: Colors.primary,
      borderRadius: 10,
      padding: 14,
      backgroundColor: Colors.primaryLight,
      marginTop: 10,
    },
    mapText: {
      fontSize: 16,
      color: Colors.textPrimary,
      fontWeight: '500',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalSheet: {
      backgroundColor: Colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      maxHeight: '75%',
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '500',
      color: Colors.textPrimary,
    },
    modalSearch: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 12,
    },
    modalSearchInput: {
      flex: 1,
      fontSize: 15,
      color: Colors.textPrimary,
    },
    modalWorkerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    },
    modalWorkerAssigned: {
      opacity: 0.5,
    },
    modalWorkerName: {
      flex: 1,
      fontSize: 15,
      color: Colors.textPrimary,
    },
  })

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  if (!currentProject) {
    return (
      <View style={styles.center}>
        <Text style={{ color: Colors.textSecondary }}>No project found</Text>
      </View>
    )
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('sk-SK', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    })
  }

  const s = statusConfig[currentProject.status as keyof typeof statusConfig] ?? statusConfig['pending']
  const photos = ['1', '2', '3', '4']

  return (
    <ScreenWrapper title='Project detail' backRoute='/tabs/projectsList'>
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>

        <Text style={styles.projectTitle}>{currentProject.title}</Text>
        <View style={[styles.statusBox, { backgroundColor: s.bg, borderColor: s.border }]}>
          <View style={[styles.dot, { backgroundColor: s.dot }]} />
          <Text style={[styles.statusText, { color: s.text }]}>{s.label}</Text>
        </View>

        <Box width='big' text={currentProject.description ?? '—'} placeholder='Description' />

        <View style={styles.row}>
          <Box width='small' text={formatDate(currentProject.deadline)} placeholder='Deadline' />
          <Box width='small' text={currentProject.address ?? '—'} placeholder='Location' />
        </View>
        <View style={styles.row}>
          <Box width='small' text={currentProject.created_by ?? '-'} placeholder='Created by' />
          <Box width='small' text={formatDate(currentProject.created_at)} placeholder='Created at' />
        </View>
        <View style={styles.row}>
          <Box width='small' text={currentProject.lat?.toString() ?? '—'} placeholder='Latitude' />
          <Box width='small' text={currentProject.lng?.toString() ?? '—'} placeholder='Longitude' />
        </View>

        <View style={styles.sectionDivider} />
        <Text style={styles.sectionLabel}>Client</Text>
        <Box width='big' text={currentProject.client_name ?? '-'} placeholder='Name' />
        <View style={styles.row}>
          <Box width='small' text={currentProject.client_phone ?? '-'} placeholder='Phone' />
          <Box width='small' text={currentProject.client_email ?? '-'} placeholder='Email' />
        </View>

        <View style={styles.sectionDivider} />
        <Text style={styles.sectionLabel}>Progress</Text>
        <View style={styles.row}>
          <TouchableOpacity style={[styles.progressBox, { flex: 1, backgroundColor: Colors.primaryLight, borderColor: Colors.primary }]} onPress={() => router.push(`/tabs/task-list?projectId=${id}&projectTitle=${currentProject.title}`)}>
            <Text style={[styles.progressValue, { color: Colors.textPrimary }]}>{tasks.filter(t => t.status === 'done').length}/{tasks.length}</Text>
            <View style={styles.progressRow}>
              <Text style={[styles.progressLabel, { color: Colors.textPrimary }]}>Tasks done</Text>
              <AntDesign name="arrow-right" size={14} color={Colors.textPrimary} />
            </View>
          </TouchableOpacity>
          <View style={[styles.progressBox, { flex: 1 }]}>
            <Text style={styles.progressValue}>{workers.length}</Text>
            <Text style={styles.progressLabel}>Workers assigned</Text>
          </View>
        </View>

        <View style={styles.sectionDivider} />
        <Text style={styles.sectionLabel}>Assigned workers</Text>
        {workers.map(worker => (
          <TouchableOpacity key={worker.id} style={styles.workerBox} onPress={() => router.push(`/tabs/profile?userId=${worker.id}&projectId=${currentProject.id}&mode=project`)}>
            <Ionicons name="person-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.workerName}>
              {worker.first_name} {worker.last_name}
            </Text>
            <View style={styles.workerRight}>
              <View style={[styles.onlineDot, { backgroundColor: Colors.offline }]} />
              <AntDesign name="right" size={14} color={Colors.textSecondary} />
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.sectionDivider} />
        <Text style={styles.sectionLabel}>Photo documentation</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
          {photos.map((_p, index) => (
            <View key={`photo-${index}`} style={styles.photoBox}>
              <Ionicons name="image-outline" size={28} color={Colors.textSecondary} />
              <Text style={styles.photoText}>Photo</Text>
            </View>
          ))}
          <TouchableOpacity style={[styles.photoBox, styles.addPhotoBox]}>
            <AntDesign name="plus" size={24} color={Colors.primary} />
            <Text style={[styles.photoText, { color: Colors.primary }]}>Add</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.sectionDivider} />
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionButton}>
            <AntDesign name="edit" size={16} color={Colors.textPrimary} />
            <Text style={styles.actionText}>Edit project</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: Colors.dangerBg, borderColor: Colors.dangerBorder }]} onPress={handleDeleteProject}>
            <AntDesign name="delete" size={16} color={Colors.textPrimary} />
            <Text style={styles.actionText}>Delete project</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: Colors.successBg, borderColor: Colors.successBorder }]} onPress={handleOpenAssign}>
            <Ionicons name="person-add-outline" size={16} color={Colors.textPrimary} />
            <Text style={styles.actionText}>Assign worker</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: Colors.primaryLight, borderColor: Colors.primary }]} onPress={() => router.push(`/tabs/create-task?projectId=${currentProject.id}&projectTitle=${currentProject.title}`)}>
            <AntDesign name="plus" size={16} color={Colors.textPrimary} />
            <Text style={styles.actionText}>Add task</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.mapButton}>
          <Ionicons name="map-outline" size={18} color={Colors.textPrimary} />
          <Text style={styles.mapText}>View map</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>

      <Modal visible={assignModalVisible} animationType="slide" transparent onRequestClose={() => setAssignModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Assign worker</Text>
              <TouchableOpacity onPress={() => setAssignModalVisible(false)}>
                <AntDesign name="close" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalSearch}>
              <Ionicons name="search-outline" size={15} color={Colors.textSecondary} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search workers..."
                placeholderTextColor={Colors.textSecondary}
                value={assignSearch}
                onChangeText={setAssignSearch}
              />
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {allWorkers
                .filter(w => {
                  const q = assignSearch.toLowerCase()
                  return !q || `${w.first_name} ${w.last_name}`.toLowerCase().includes(q) || w.username?.toLowerCase().includes(q)
                })
                .map(w => {
                  const alreadyAssigned = workers.some(pw => pw.id === w.id)
                  return (
                    <TouchableOpacity
                      key={w.id}
                      style={[styles.modalWorkerRow, alreadyAssigned && styles.modalWorkerAssigned]}
                      onPress={() => !alreadyAssigned && handleAssignWorker(w.id)}
                      disabled={alreadyAssigned || assigning}
                    >
                      <Ionicons name="person-outline" size={18} color={Colors.textSecondary} />
                      <Text style={styles.modalWorkerName}>
                        {w.first_name && w.last_name ? `${w.first_name} ${w.last_name}` : w.username}
                      </Text>
                      {alreadyAssigned
                        ? <AntDesign name="check-circle" size={16} color={Colors.success} />
                        : <AntDesign name="plus" size={16} color={Colors.primary} />
                      }
                    </TouchableOpacity>
                  )
                })}
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  )
}
