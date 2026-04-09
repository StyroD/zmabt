import { View, StyleSheet, Text, TouchableOpacity } from 'react-native'
import { Colors } from '@/constants/color'
import { Ionicons } from '@expo/vector-icons'
import AntDesign from '@expo/vector-icons/AntDesign'

type Props = {
  title: string
  status: string
  deadline: string
  address?: string
  onProjectDetail: () => void
}

const statusConfig = {
  in_progress:   { label: 'In Progress',   dot: Colors.online,  bg: Colors.successBg, text: Colors.success, border: Colors.successBorder },
  pending:       { label: 'Pending',       dot: Colors.warning, bg: Colors.warningBg, text: Colors.warning, border: Colors.warningBorder },
  cancelled:     { label: 'Cancelled',     dot: Colors.danger,  bg: Colors.dangerBg,  text: Colors.danger,  border: Colors.dangerBorder },
  finished:      { label: 'Finished',      dot: Colors.neutral, bg: Colors.neutralBg, text: Colors.neutral, border: Colors.neutralBorder },
  not_available: { label: 'Not available', dot: Colors.offline, bg: Colors.neutralBg, text: Colors.neutral, border: Colors.neutralBorder },
}

export function ProjectBox({ title, status, deadline, address, onProjectDetail }: Props) {
  const s = statusConfig[status as keyof typeof statusConfig] ?? statusConfig['not_available']

  return (
    <TouchableOpacity style={styles.box} onPress={onProjectDetail} activeOpacity={0.75}>
      <View style={styles.top}>
        <View style={[styles.statusBadge, { backgroundColor: s.bg, borderColor: s.border }]}>
          <View style={[styles.dot, { backgroundColor: s.dot }]} />
          <Text style={[styles.statusText, { color: s.text }]}>{s.label}</Text>
        </View>
        <AntDesign name="right" size={14} color={Colors.textSecondary} />
      </View>

      <Text style={styles.title}>{title}</Text>

      <View style={styles.bottom}>
        {address ? (
          <View style={styles.meta}>
            <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.metaText} numberOfLines={1}>{address}</Text>
          </View>
        ) : null}
        <View style={styles.meta}>
          <Ionicons name="calendar-outline" size={13} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{deadline}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: Colors.surface,
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 17,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  bottom: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
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
})
