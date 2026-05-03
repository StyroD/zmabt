import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native'
import { Colors } from '../../constants/color'
import { Modal, TextInput, Alert, ActivityIndicator } from 'react-native'
import { useColors } from '@/contexts/ThemeContext'
import { Box } from '@/components/ProjectDetailManager/Box'
import { Ionicons } from '@expo/vector-icons'
import AntDesign from '@expo/vector-icons/AntDesign'
import { ScreenWrapper } from '@/components/ScreenWrapper'
import { useEffect, useState, useRef } from 'react'
import { getProjectById, deleteProject, assignWorkerToProject, removeWorkerFromProject } from '@/api/endpoints/projects'
import { getProjectWorkers, getAllWorkers } from '@/api/endpoints/workers'
import { getProjectPhotos, uploadProjectPhoto } from '@/api/endpoints/uploads'
import { getTasksByProjectId } from '@/api/endpoints/tasks'

import * as SecureStore from 'expo-secure-store'
import client from '@/api/client'
import { useLocalSearchParams, router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { useFocusEffect } from 'expo-router'
import { useCallback } from 'react'
import { statsRefreshSignal } from '@/utils/statsRefreshSignal'


const API_BASE = (client.defaults.baseURL ?? '').replace(/\/$/, '')

export default function ProjectDetail() {
  const Colors = useColors()
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams()

  const [currentProject, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [workers, setWorkers] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [photos, setPhotos] = useState<any[]>([])
  const [allWorkers, setAllWorkers] = useState<any[]>([])
  const [assignModalVisible, setAssignModalVisible] = useState(false)
  const [assignSearch, setAssignSearch] = useState('')
  const [selectedWorkers, setSelectedWorkers] = useState<Set<string>>(new Set())
  const [certFilter, setCertFilter] = useState<string | null>(null)
  const [assigning, setAssigning] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const scrollRef = useRef<ScrollView>(null)

 const handleDeleteProject = () => {
  Alert.alert('Delete project', 'Are you sure you want to delete this project?', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteProject(currentProject.id)
          router.replace('/tabs/projectsList')
        } catch (err: any) {
          console.error('Delete error:', JSON.stringify(err?.response?.data ?? err?.message ?? err))
          Alert.alert('Error', 'Could not delete project')
        }
      }
    }
  ])
}

  const handleRemoveWorker = (workerId: string, workerName: string) => {
    Alert.alert('Remove worker', `Remove ${workerName} from this project?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          try {
            await removeWorkerFromProject(currentProject.id, workerId)
            setWorkers(prev => prev.filter(w => w.id !== workerId))
            statsRefreshSignal.emit()
          } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.error ?? 'Could not remove worker')
          }
        }
      }
    ])
  }

  const handleOpenAssign = async () => {
    if (allWorkers.length === 0) {
      try {
        const res = await getAllWorkers(currentProject.manager_id)
        setAllWorkers(res.data)
      } catch (err: any) {
        Alert.alert('Error', err?.response?.data?.error ?? 'Could not load workers')
        return
      }
    }
    setAssignSearch('')
    setSelectedWorkers(new Set())
    setCertFilter(null)
    setAssignModalVisible(true)
  }

  const toggleWorker = (workerId: string) => {
    setSelectedWorkers(prev => {
      const next = new Set(prev)
      if (next.has(workerId)) { next.delete(workerId) } else { next.add(workerId) }
      return next
    })
  }

  const handleAssignSelected = async () => {
    if (selectedWorkers.size === 0) return
    setAssigning(true)
    try {
      await Promise.all(
        [...selectedWorkers].map(wId => assignWorkerToProject(currentProject.id, wId))
      )
      const res = await getProjectWorkers(currentProject.id)
      setWorkers(res.data)
      setAssignModalVisible(false)
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error ?? 'Could not assign workers')
    } finally {
      setAssigning(false)
    }
  }

const handleAddPhoto = () => {
  Alert.alert('Add photo', 'Choose source', [
    {
      text: 'Camera', onPress: async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync()
        if (!permission.granted) { Alert.alert('Permission denied', 'Camera access is required'); return }
        const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 })
        if (!result.canceled) await handleUploadPhoto(result.assets[0])
      }
    },
    {
      text: 'Library', onPress: async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (!permission.granted) { Alert.alert('Permission denied', 'Photo library access is required'); return }
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 })
        if (!result.canceled) await handleUploadPhoto(result.assets[0])
      }
    },
    { text: 'Cancel', style: 'cancel' }
  ])
}

const handleUploadPhoto = async (asset: ImagePicker.ImagePickerAsset) => {
  setUploadingPhoto(true)
  try {
    await uploadProjectPhoto(
      currentProject.id,
      asset.uri,
      asset.mimeType ?? 'image/jpeg',
      asset.fileName ?? `photo_${Date.now()}.jpg`,
    )
    const res = await getProjectPhotos(currentProject.id)
    setPhotos(res.data)
  } catch (err: any) {
    console.error('Upload error:', JSON.stringify(err?.response?.data ?? err?.message ?? err))
    Alert.alert('Error', err?.response?.data?.error ?? 'Could not upload photo')
  } finally {
    setUploadingPhoto(false)
  }
}

  useFocusEffect(
  useCallback(() => {
    setLoading(true)
    getProjectById(id as string)
      .then(res => {
        setProject(res.data)
        setLoading(false)
        // fetch photos here using the freshly loaded project id
        getProjectPhotos(res.data.id)
          .then(r => setPhotos(r.data))
          .catch(err => console.error(err))
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [id])
)

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
    getProjectPhotos(currentProject.id)
      .catch(err => console.error(err))
  }, [currentProject])

  const statusConfig = {
    in_progress: { label: 'In Progress', dot: Colors.online,  bg: Colors.successBg, text: Colors.success, border: Colors.successBorder },
    pending:     { label: 'Pending',     dot: Colors.warning, bg: Colors.warningBg, text: Colors.warning, border: Colors.warningBorder },
    cancelled:   { label: 'Cancelled',   dot: Colors.danger,  bg: Colors.dangerBg,  text: Colors.danger,  border: Colors.dangerBorder },
    finished:    { label: 'Finished',    dot: Colors.neutral, bg: Colors.neutralBg, text: Colors.neutral, border: Colors.neutralBorder },
  }

  const certCategories: { name: string }[] = []
  const seenCats = new Set<string>()
  allWorkers.forEach(w => {
    (w.certificates ?? []).forEach((c: any) => {
      if (c.status === 'accepted' && c.name && !seenCats.has(c.name)) {
        seenCats.add(c.name)
        certCategories.push({ name: c.name })
      }
    })
  })

  const visibleWorkers = allWorkers.filter(w => {
    const q = assignSearch.toLowerCase()
    const nameMatch = !q || `${w.first_name} ${w.last_name}`.toLowerCase().includes(q)
    const certMatch = !certFilter || (w.certificates ?? []).some(
      (c: any) => c.status === 'accepted' && c.name === certFilter
    )
    return nameMatch && certMatch
  })

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
      overflow: 'hidden',
    },
    addPhotoBox: {
      borderStyle: 'dashed',
      borderColor: Colors.primary,
      backgroundColor: Colors.primaryLight,
      gap: 6,
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
      paddingBottom: Math.max(insets.bottom, 16) + 8,
      maxHeight: '85%',
      flex: 0,
    },
    modalWorkerList: {
      flexGrow: 0,
      maxHeight: 320,
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
      marginBottom: 10,
    },
    modalSearchInput: {
      flex: 1,
      fontSize: 15,
      color: Colors.textPrimary,
    },
    filterRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 12,
    },
    filterChip: {
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: 20,
      paddingVertical: 4,
      paddingHorizontal: 12,
      backgroundColor: Colors.surface,
    },
    filterChipActive: {
      borderColor: Colors.primary,
      backgroundColor: Colors.primaryLight,
    },
    filterChipText: {
      fontSize: 12,
      color: Colors.textSecondary,
    },
    filterChipTextActive: {
      color: Colors.primary,
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
      opacity: 0.4,
    },
    modalWorkerName: {
      flex: 1,
      fontSize: 15,
      color: Colors.textPrimary,
    },
    assignBtn: {
      backgroundColor: Colors.primary,
      borderRadius: 10,
      padding: 14,
      alignItems: 'center',
      marginTop: 12,
    },
    assignBtnText: {
      color: Colors.textPrimary,
      fontSize: 15,
      fontWeight: '600',
    },
  })

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} accessibilityLabel="Loading" />
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

  return (
    <ScreenWrapper title='Project detail' backRoute='/tabs/projectsList'>
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>

        <Text style={styles.projectTitle}>{currentProject.title}</Text>
        <View style={[styles.statusBox, { backgroundColor: s.bg, borderColor: s.border }]} accessible={true} accessibilityLabel={`Status: ${s.label}`}>
          <View style={[styles.dot, { backgroundColor: s.dot }]} accessible={false} />
          <Text style={[styles.statusText, { color: s.text }]} accessible={false}>{s.label}</Text>
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
          <TouchableOpacity style={[styles.progressBox, { flex: 1, backgroundColor: Colors.primaryLight, borderColor: Colors.primary }]} onPress={() => router.push(`/tabs/task-list?projectId=${id}&projectTitle=${currentProject.title}`)} accessibilityRole="button" accessibilityLabel={`${tasks.filter(t => t.status === 'done').length} out of ${tasks.length} tasks done. Navigate to task list`}>
            <Text style={[styles.progressValue, { color: Colors.textPrimary }]} accessible={false}>{tasks.filter(t => t.status === 'done').length}/{tasks.length}</Text>
            <View style={styles.progressRow} accessible={false}>
              <Text style={[styles.progressLabel, { color: Colors.textPrimary }]}>Tasks done</Text>
              <AntDesign name="arrow-right" size={14} color={Colors.textPrimary} accessible={false} />
            </View>
          </TouchableOpacity>
          <View style={[styles.progressBox, { flex: 1 }]}>
            <Text style={styles.progressValue}>{workers.length}</Text>
            <Text style={styles.progressLabel}>Workers assigned</Text>
          </View>
        </View>

        <View style={styles.sectionDivider} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 0 }}>
          <Text style={styles.sectionLabel}>Assigned workers</Text>
          <TouchableOpacity
            onPress={handleOpenAssign}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 2, paddingHorizontal: 6 }}
            accessibilityRole="button"
            accessibilityLabel="Assign workers"
          >
            <Ionicons name="person-add-outline" size={16} color={Colors.primary} accessible={false} />
            <Text style={{ fontSize: 13, color: Colors.primary }}>Assign</Text>
          </TouchableOpacity>
        </View>
        {workers.map(worker => (
          <View key={worker.id} style={styles.workerBox}>
            <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }} onPress={() => router.push(`/tabs/profile?userId=${worker.id}&projectId=${currentProject.id}&mode=project`)} accessibilityRole="button" accessibilityLabel={`${worker.first_name} ${worker.last_name}. View profile`}>
              <Ionicons name="person-outline" size={20} color={Colors.textSecondary} accessible={false} />
              <Text style={styles.workerName} accessible={false}>
                {worker.first_name} {worker.last_name}
              </Text>
            </TouchableOpacity>
            <View style={styles.workerRight} accessible={false}>
              <View style={[styles.onlineDot, { backgroundColor: Colors.offline }]} accessible={false} />
              <TouchableOpacity onPress={() => handleRemoveWorker(worker.id, `${worker.first_name} ${worker.last_name}`)} accessibilityRole="button" accessibilityLabel={`Remove ${worker.first_name} ${worker.last_name} from project`}>
                <Ionicons name="person-remove-outline" size={18} color={Colors.danger} accessible={false} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={styles.sectionDivider} />
        <Text style={styles.sectionLabel}>Photo documentation</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
          {photos.map(photo => (
            <View key={photo.id} style={styles.photoBox}>
              {photo.file_data ? (
                <Image
                  source={{ uri: `data:${photo.mime_type ?? 'image/jpeg'};base64,${photo.file_data}` }}
                  style={{ width: 100, height: 100 }}
                  resizeMode="cover"
                  accessibilityLabel="Project photo"
                />
              ) : (
                <Ionicons name="image-outline" size={28} color={Colors.textSecondary} accessible={false} />
              )}
            </View>
          ))}
          <TouchableOpacity
            style={[styles.photoBox, styles.addPhotoBox, uploadingPhoto && { opacity: 0.5 }]}
            onPress={handleAddPhoto}
            disabled={uploadingPhoto}
            accessibilityRole="button"
            accessibilityLabel={uploadingPhoto ? 'Uploading photo' : 'Add project photo'}
          >
            {uploadingPhoto
              ? <ActivityIndicator size="small" color={Colors.primary} accessibilityLabel="Uploading photo" />
              : <AntDesign name="plus" size={24} color={Colors.primary} accessible={false} />
            }
            <Text style={[styles.photoText, { color: Colors.primary }]} accessible={false}>
              {uploadingPhoto ? 'Uploading...' : 'Add'}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.sectionDivider} />
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/tabs/create-project?projectId=${currentProject.id}`)}
            accessibilityRole="button"
            accessibilityLabel="Edit project"
          >
            <AntDesign name="edit" size={16} color={Colors.textPrimary} accessible={false} />
            <Text style={styles.actionText}>Edit project</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: Colors.dangerBg, borderColor: Colors.dangerBorder }]} onPress={handleDeleteProject} accessibilityRole="button" accessibilityLabel="Delete project" accessibilityHint="Double tap to permanently delete this project">
            <AntDesign name="delete" size={16} color={Colors.textPrimary} accessible={false} />
            <Text style={styles.actionText}>Delete project</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: Colors.successBg, borderColor: Colors.successBorder }]} onPress={handleOpenAssign} accessibilityRole="button" accessibilityLabel="Assign workers">
            <Ionicons name="person-add-outline" size={16} color={Colors.textPrimary} accessible={false} />
            <Text style={styles.actionText}>Assign workers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: Colors.primaryLight, borderColor: Colors.primary }]} onPress={() => router.push(`/tabs/create-task?projectId=${currentProject.id}&projectTitle=${currentProject.title}`)} accessibilityRole="button" accessibilityLabel="Add task">
            <AntDesign name="plus" size={16} color={Colors.textPrimary} accessible={false} />
            <Text style={styles.actionText}>Add task</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.mapButton, (!currentProject.lat || !currentProject.lng) && { opacity: 0.5 }]}
          onPress={() => {
            if (!currentProject.lat || !currentProject.lng) {
              Alert.alert('No location', 'This project has no coordinates set')
              return
            }
            router.push(`/tabs/map?lat=${currentProject.lat}&lng=${currentProject.lng}&title=${encodeURIComponent(currentProject.title)}`)
          }}
          accessibilityRole="button"
          accessibilityLabel={(!currentProject.lat || !currentProject.lng) ? 'View map, no location set' : 'View project on map'}
        >
          <Ionicons name="map-outline" size={18} color={Colors.textPrimary} accessible={false} />
          <Text style={styles.mapText}>View map</Text>
        </TouchableOpacity>

        <View style={{ height: Math.max(insets.bottom, 16) + 16 }} />
      </ScrollView>

      <Modal visible={assignModalVisible} animationType="slide" transparent onRequestClose={() => setAssignModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet} accessibilityViewIsModal={true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Assign workers</Text>
              <TouchableOpacity onPress={() => setAssignModalVisible(false)} accessibilityRole="button" accessibilityLabel="Close assign workers modal">
                <AntDesign name="close" size={20} color={Colors.textSecondary} accessible={false} />
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

            {certCategories.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
                <TouchableOpacity
                  style={[styles.filterChip, !certFilter && styles.filterChipActive]}
                  onPress={() => setCertFilter(null)}
                  accessibilityRole="button"
                  accessibilityLabel={`All certificates${!certFilter ? ', currently selected' : ''}`}
                >
                  <Text style={[styles.filterChipText, !certFilter && styles.filterChipTextActive]}>All</Text>
                </TouchableOpacity>
                {certCategories.map(cat => (
                  <TouchableOpacity
                    key={cat.name}
                    style={[styles.filterChip, certFilter === cat.name && styles.filterChipActive]}
                    onPress={() => setCertFilter(certFilter === cat.name ? null : cat.name)}
                    accessibilityRole="button"
                    accessibilityLabel={`Filter by ${cat.name}${certFilter === cat.name ? ', currently selected' : ''}`}
                  >
                    <Text style={[styles.filterChipText, certFilter === cat.name && styles.filterChipTextActive]}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalWorkerList}>
              {visibleWorkers.map(w => {
                const alreadyAssigned = workers.some(pw => pw.id === w.id)
                const selected = selectedWorkers.has(w.id)
                return (
                  <TouchableOpacity
                    key={w.id}
                    style={[styles.modalWorkerRow, alreadyAssigned && styles.modalWorkerAssigned]}
                    onPress={() => !alreadyAssigned && toggleWorker(w.id)}
                    disabled={alreadyAssigned || assigning}
                    accessibilityRole="button"
                    accessibilityLabel={`${w.first_name && w.last_name ? `${w.first_name} ${w.last_name}` : w.username}, ${alreadyAssigned ? 'already assigned' : selected ? 'selected' : 'not selected'}`}
                    accessibilityHint={alreadyAssigned ? undefined : 'Double tap to select'}
                  >
                    <Ionicons name="person-outline" size={18} color={Colors.textSecondary} accessible={false} />
                    <Text style={styles.modalWorkerName} accessible={false}>
                      {w.first_name && w.last_name ? `${w.first_name} ${w.last_name}` : w.username}
                    </Text>
                    {alreadyAssigned
                      ? <AntDesign name="check-circle" size={18} color={Colors.success} accessible={false} />
                      : <AntDesign name="check-circle" size={18} color={selected ? Colors.primary : Colors.border} accessible={false} />
                    }
                  </TouchableOpacity>
                )
              })}
              <View style={{ height: 8 }} />
            </ScrollView>

            <TouchableOpacity
              style={[styles.assignBtn, (selectedWorkers.size === 0 || assigning) && { opacity: 0.5 }]}
              onPress={handleAssignSelected}
              disabled={selectedWorkers.size === 0 || assigning}
              accessibilityRole="button"
              accessibilityLabel={assigning ? 'Assigning workers' : selectedWorkers.size > 0 ? `Assign ${selectedWorkers.size} worker${selectedWorkers.size > 1 ? 's' : ''}` : 'Assign workers'}
            >
              <Text style={styles.assignBtnText}>
                {assigning ? 'Assigning...' : `Assign ${selectedWorkers.size > 0 ? `(${selectedWorkers.size})` : ''}`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  )
}