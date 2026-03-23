import { View, StyleSheet, Text, TouchableOpacity } from 'react-native'
import { useState } from 'react'
import { Colors } from '@/constants/color'
import AntDesign from '@expo/vector-icons/AntDesign'

type Props = {
  title: string
  status: string
  deadline: string
  onProjectDetail: () => void
}

const statusConfig = {
  in_progress:   { label: 'In Progress',   dot: Colors.online,  bg: Colors.successBg, text: Colors.success, border: Colors.successBorder },
  pending:       { label: 'Pending',       dot: Colors.warning, bg: Colors.warningBg, text: Colors.warning, border: Colors.warningBorder },
  cancelled:     { label: 'Cancelled',     dot: Colors.danger,  bg: Colors.dangerBg,  text: Colors.danger,  border: Colors.dangerBorder },
  finished:      { label: 'Finished',      dot: Colors.neutral, bg: Colors.neutralBg, text: Colors.neutral, border: Colors.neutralBorder },
  not_available: { label: 'Not available', dot: Colors.offline, bg: Colors.neutralBg, text: Colors.neutral, border: Colors.neutralBorder },
}

export function ProjectBox({ title, status, deadline, onProjectDetail }: Props) {
  const [expanded, setExpanded] = useState(false)
  const s = statusConfig[status as keyof typeof statusConfig] ?? statusConfig['not_available']

  return (
    <TouchableOpacity style={styles.box} onPress={() => setExpanded(!expanded)} activeOpacity={0.8}>
      <View style={styles.row}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity onPress={(e) => { e.stopPropagation(); onProjectDetail() }}>
          {!expanded && <AntDesign name="arrow-right" size={16} color={Colors.textSecondary} />}
        </TouchableOpacity>
      </View>

      {expanded && (
        <View style={styles.details}>
          <View style={[styles.statusBadge, { backgroundColor: s.bg, borderColor: s.border }]}>
            <View style={[styles.dot, { backgroundColor: s.dot }]} />
            <Text style={[styles.statusText, { color: s.text }]}>{s.label}</Text>
          </View>
          <Text style={styles.detail}>Deadline: {deadline}</Text>
          <TouchableOpacity style={styles.button} onPress={(e) => { e.stopPropagation(); onProjectDetail() }}>
            <Text style={styles.buttonText}>Detail</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: Colors.surface,
    alignSelf: 'stretch',
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  details: {
    marginTop: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
  },
  detail: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  button: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  buttonText: {
    fontSize: 13,
    color: Colors.primary,
  }
})