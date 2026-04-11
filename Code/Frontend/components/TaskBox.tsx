import { Colors } from "@/constants/color"
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { updateTaskStatus } from "@/api/endpoints/tasks"

const statusConfig: Record<string, { label: string; bg: string; border: string; text: string; dot: string }> = {
  pending:    { label: 'Pending',     bg: Colors.warningBg, border: Colors.warningBorder, text: Colors.warning, dot: Colors.warning },
  in_progress:{ label: 'In Progress', bg: Colors.successBg, border: Colors.successBorder, text: Colors.success, dot: Colors.online  },
  done:       { label: 'Done',        bg: Colors.neutralBg, border: Colors.neutralBorder, text: Colors.neutral, dot: Colors.neutral  },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  low:    { label: 'Low',    color: Colors.neutral },
  medium: { label: 'Medium', color: Colors.warning },
  high:   { label: 'High',   color: Colors.danger  },
}

const formatDate = (dateString: string) => {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function TaskBox({ task, onStatusChange }: { task: any; onStatusChange?: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const [status, setStatus] = useState<string>(task.status ?? 'pending')
  const [marking, setMarking] = useState(false)

  const s = statusConfig[status] ?? statusConfig['pending']
  const p = priorityConfig[task.priority] ?? priorityConfig['medium']
  const isDone = status === 'done'

  const handleMarkDone = async () => {
    if (isDone) return
    setMarking(true)
    try {
      await updateTaskStatus(task.id, 'done')
      setStatus('done')
      onStatusChange?.()
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error ?? 'Failed to update status')
    } finally {
      setMarking(false)
    }
  }

  return (
    <TouchableOpacity style={styles.box} onPress={() => setExpanded(!expanded)} activeOpacity={0.75}>

      {/* Header row */}
      <View style={styles.header}>
        <View style={[styles.statusBadge, { backgroundColor: s.bg, borderColor: s.border }]}>
          <View style={[styles.dot, { backgroundColor: s.dot }]} />
          <Text style={[styles.statusText, { color: s.text }]}>{s.label}</Text>
        </View>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.textSecondary} />
      </View>

      {/* Title */}
      <Text style={styles.title}>{task.title}</Text>

      {/* Meta row */}
      <View style={styles.metaRow}>
        <View style={styles.meta}>
          <Ionicons name="calendar-outline" size={13} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{formatDate(task.deadline)}</Text>
        </View>
        <View style={styles.meta}>
          <Ionicons name="alert-circle-outline" size={13} color={p.color} />
          <Text style={[styles.metaText, { color: p.color }]}>{p.label}</Text>
        </View>
      </View>

      {/* Expanded details */}
      {expanded && (
        <View style={styles.details}>
          <View style={styles.divider} />

          {task.description ? (
            <Text style={styles.description}>{task.description}</Text>
          ) : null}

          <View style={styles.detailGrid}>
            {task.category_id && (
              <View style={styles.detailItem}>
                <Ionicons name="pricetag-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.detailText}>{task.category_id}</Text>
              </View>
            )}
          </View>

          {!isDone ? (
            <TouchableOpacity
              style={[styles.doneBtn, marking && { opacity: 0.6 }]}
              onPress={handleMarkDone}
              disabled={marking}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color={Colors.success} />
              <Text style={styles.doneBtnText}>{marking ? 'Updating...' : 'Mark as done'}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.completedRow}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
              <Text style={styles.completedText}>Completed</Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  dot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 12 },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 14,
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
  details: {
    gap: 10,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  detailGrid: {
    gap: 6,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  doneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.successBg,
    borderWidth: 1,
    borderColor: Colors.successBorder,
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
  },
  doneBtnText: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: '500',
  },
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 10,
  },
  completedText: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: '500',
  },
})
