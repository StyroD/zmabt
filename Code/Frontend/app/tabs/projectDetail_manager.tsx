import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { Colors } from '../../constants/color'
import { Box } from '@/components/ProjectDetailManager/Box'
import { Ionicons } from '@expo/vector-icons'
import AntDesign from '@expo/vector-icons/AntDesign'
import { ScreenWrapper } from '@/components/ScreenWrapper'

export default function ProjectDetail() {

  const status = 'in_progress'

  const statusConfig = {
    in_progress: { label: 'In Progress', dot: Colors.online,  bg: Colors.successBg,  text: Colors.success, border: Colors.successBorder },
    pending:     { label: 'Pending',     dot: Colors.warning, bg: Colors.warningBg,  text: Colors.warning, border: Colors.warningBorder },
    cancelled:   { label: 'Cancelled',   dot: Colors.danger,  bg: Colors.dangerBg,   text: Colors.danger,  border: Colors.dangerBorder },
    finished:    { label: 'Finished',    dot: Colors.neutral, bg: Colors.neutralBg,  text: Colors.neutral, border: Colors.neutralBorder },
  }

  const s = statusConfig[status]

  const workers = [
    { id: '1', name: 'Jano', online: true },
    { id: '2', name: 'Peter', online: false },
    { id: '3', name: 'Tono', online: true },
  ]

  const photos = ['1', '2', '3', '4']

  return (
    <ScreenWrapper title='Project detail' backRoute='/tabs/projectsList'>
      <ScrollView showsVerticalScrollIndicator={false}>

        <Text style={styles.projectTitle}>Project Title</Text>
        <View style={[styles.statusBox, { backgroundColor: s.bg, borderColor: s.border }]}>
          <View style={[styles.dot, { backgroundColor: s.dot }]} />
          <Text style={[styles.statusText, { color: s.text }]}>{s.label}</Text>
        </View>

        <View style={styles.row}>
          <Box width='small' text="29.2.2026" placeholder='Deadline' />
          <Box width='small' text="Senkvice" placeholder='Location' />
        </View>
        <View style={styles.row}>
          <Box width='small' text="Jano" placeholder='Created by' />
          <Box width='small' text="29.2.2026" placeholder='Created at' />
        </View>

        <View style={styles.sectionDivider} />
        <Text style={styles.sectionLabel}>Client</Text>
        <Box width='big' text="Ing. Damian Styrak, PhD., MBA., kkt." placeholder='Name' />
        <View style={styles.row}>
          <Box width='small' text="+158" placeholder='Phone' />
          <Box width='small' text="martankovia@mars.ma" placeholder='Email' />
        </View>
        <Box width='big' text="Stare Grunty 53" placeholder='Construction site address' />

        <View style={styles.sectionDivider} />
        <Text style={styles.sectionLabel}>Progress</Text>
        <View style={styles.row}>
          <TouchableOpacity style={[styles.progressBox, { flex: 1, backgroundColor: Colors.primaryLight, borderColor: Colors.primary }]}>
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
          <TouchableOpacity key={worker.id} style={styles.workerBox}>
            <Ionicons name="person-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.workerName}>{worker.name}</Text>
            <View style={styles.workerRight}>
              <View style={[styles.onlineDot, { backgroundColor: worker.online ? Colors.online : Colors.offline }]} />
              <AntDesign name="right" size={14} color={Colors.textSecondary} />
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.sectionDivider} />
        <Text style={styles.sectionLabel}>Photo documentation</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
          {photos.map(p => (
            <View key={p} style={styles.photoBox}>
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
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: Colors.primaryLight, borderColor: Colors.primary }]}>
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
})