import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { Colors } from '../../constants/color'
import { Box } from '@/components/ProjectDetailManager/Box'
import { Ionicons } from '@expo/vector-icons'
import AntDesign from '@expo/vector-icons/AntDesign'
import { ScreenWrapper } from '@/components/ScreenWrapper'
import { useEffect, useState } from 'react'
import { getProjectById } from '@/api/endpoints/projects'
import { ActivityIndicator } from 'react-native'
import { getProjectWorkers } from '@/api/endpoints/workers'
import { useLocalSearchParams } from 'expo-router'
import { router } from 'expo-router'
import { useRef } from 'react'


export default function ProjectDetail() {

  const { id } = useLocalSearchParams()

  const [currentProject, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [workers, setWorkers] = useState<any[]>([])
  const scrollRef = useRef<ScrollView>(null)


  //Projects
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

  //Project workers
  useEffect(() => {
    if (!currentProject) return
    getProjectWorkers(currentProject.id)
      .then(res => {
        setWorkers(res.data)
      })
      .catch(err => console.error(err))
  }, [currentProject])

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
    const date = new Date(dateString)
    return date.toLocaleDateString('sk-SK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const status = 'in_progress'

  const statusConfig = {
    in_progress: { label: 'In Progress', dot: Colors.online, bg: Colors.successBg, text: Colors.success, border: Colors.successBorder },
    pending: { label: 'Pending', dot: Colors.warning, bg: Colors.warningBg, text: Colors.warning, border: Colors.warningBorder },
    cancelled: { label: 'Cancelled', dot: Colors.danger, bg: Colors.dangerBg, text: Colors.danger, border: Colors.dangerBorder },
    finished: { label: 'Finished', dot: Colors.neutral, bg: Colors.neutralBg, text: Colors.neutral, border: Colors.neutralBorder },
  }

  const s = statusConfig[status]



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
          <Box width='small' text={formatDate(currentProject.deadline) ?? '—'} placeholder='Deadline' />
          <Box width='small' text={currentProject.address ?? '—'} placeholder='Location' />
        </View>
        <View style={styles.row}>
          <Box width='small' text={currentProject.created_by ?? '-'} placeholder='Created by' />
          <Box width='small' text={formatDate(currentProject.created_at) ?? '-'} placeholder='Created at' />
        </View>

        {/* Coordinates */}
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
        {/*<Box width='big' text="Stare Grunty 53" placeholder='Construction site address' />*/}

        <View style={styles.sectionDivider} />
        <Text style={styles.sectionLabel}>Progress</Text>
        <View style={styles.row}>
          <TouchableOpacity style={[styles.progressBox, { flex: 1, backgroundColor: Colors.primaryLight, borderColor: Colors.primary }]} onPress={() => router.push(`/tabs/task-list?projectId=${id}&projectTitle=${currentProject.title}`)}>
            <Text style={[styles.progressValue, { color: Colors.textPrimary }]}>3/7</Text>
            <View style={styles.progressRow}>
              <Text style={[styles.progressLabel, { color: Colors.textPrimary }]}>Tasks done</Text>
              <AntDesign name="arrow-right" size={14} color={Colors.textPrimary} />
            </View>
          </TouchableOpacity>
          <View style={[styles.progressBox, { flex: 1 }]}>
            <Text style={styles.progressValue}>4</Text>
            <Text style={styles.progressLabel}>Workers assigned</Text>
          </View>
        </View>

        <View style={styles.sectionDivider} />
        <Text style={styles.sectionLabel}>Assigned workers</Text>


        {workers.map(worker => (
          <TouchableOpacity key={worker.id} style={styles.workerBox} onPress={() => router.push(`/tabs/profile?userId=${worker.id}&projectId=${currentProject.id}`)}>
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


          {photos.map((p, index) => (
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
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: Colors.dangerBg, borderColor: Colors.dangerBorder }]}>
            <AntDesign name="delete" size={16} color={Colors.textPrimary} />
            <Text style={styles.actionText}>Delete project</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: Colors.successBg, borderColor: Colors.successBorder }]}>
            <Ionicons name="person-add-outline" size={16} color={Colors.textPrimary} />
            <Text style={styles.actionText}>Assign worker</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: Colors.primaryLight, borderColor: Colors.primary }]} onPress={()=> router.push(`/tabs/create-task?projectId${currentProject.id}&projectTitle=${currentProject.title}`)}>
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
    </ScreenWrapper>
  )
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
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 4,
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
})