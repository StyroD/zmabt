import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, Alert } from 'react-native'
import { useColors } from '@/contexts/ThemeContext'
import { ScreenWrapper } from '@/components/ScreenWrapper'
import { useEffect, useState, useCallback } from 'react'
import DateTimePicker from '@react-native-community/datetimepicker'
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router'
import AntDesign from '@expo/vector-icons/AntDesign'
import { Ionicons } from '@expo/vector-icons'
import { getProjectWorkers } from '@/api/endpoints/workers'
import { createTask, updateTask, getTaskById, assignWorkersToTask } from '@/api/endpoints/tasks'
import { getCategories } from '@/api/endpoints/categories'
import { useNetwork } from '@/contexts/NetworkContext'
import { addToQueue } from '@/utils/offlineQueue'
import { logTaskCreated } from '@/utils/firebase'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { cacheCategories, getCachedCategories } from '@/utils/db'

const PRIORITIES = ['low', 'medium', 'high']
const priorityLabels: Record<string, string> = { low: 'Low', medium: 'Medium', high: 'High' }

export default function CreateTask() {
    const Colors = useColors()
    const insets = useSafeAreaInsets()
    const { projectId, projectTitle, taskId } = useLocalSearchParams<{ projectId: string; projectTitle: string; taskId?: string }>()
    const isEdit = !!taskId
    const [workers, setWorkers] = useState<any[]>([])
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [categoryName, setCategoryName] = useState('')
    const [showCategoryPicker, setShowCategoryPicker] = useState(false)
    const [deadline, setDeadline] = useState<Date | null>(null)
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [priority, setPriority] = useState('medium')
    const [assignedWorkers, setAssignedWorkers] = useState<string[]>([])
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [submitting, setSubmitting] = useState(false)
    const { isOnline } = useNetwork()

    useFocusEffect(
        useCallback(() => {
            if (isEdit) return
            setTitle('')
            setDescription('')
            setCategoryId('')
            setCategoryName('')
            setShowCategoryPicker(false)
            setDeadline(null)
            setShowDatePicker(false)
            setPriority('medium')
            setAssignedWorkers([])
            setErrors({})
        }, [isEdit])
    )

    const priorityColors = {
        low: { bg: Colors.surfaceElevated, border: Colors.textSecondary, text: Colors.textPrimary },
        medium: { bg: Colors.warningBg, border: Colors.warningBorder, text: Colors.warning },
        high: { bg: Colors.dangerBg, border: Colors.dangerBorder, text: Colors.danger },
    }

    const formatDate = (date: Date) =>
        date.toLocaleDateString('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric' })

    const validate = () => {
        const newErrors: Record<string, string> = {}
        if (!title.trim()) newErrors.title = 'Title is required'
        if (!categoryId) newErrors.category = 'Category is required'
        if (!deadline) newErrors.deadline = 'Deadline is required'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (!validate()) return
        setSubmitting(true)
        const payload = {
            title,
            description,
            category_id: categoryId,
            priority,
            deadline: deadline!.toISOString().split('T')[0],
        }
        try {
            if (isEdit && taskId) {
                await updateTask(taskId, payload)
                router.replace(`/tabs/task-list?projectId=${projectId}&projectTitle=${projectTitle}` as any)
                return
            }

            if (!isOnline) {
                await addToQueue('TASK_CREATE', {
                    project_id: projectId,
                    ...payload,
                    workerIds: assignedWorkers,
                })
                logTaskCreated(projectId).catch(() => {})
                Alert.alert('Saved offline', 'Task will be created when you reconnect.')
                router.replace(`/tabs/task-list?projectId=${projectId}&projectTitle=${projectTitle}` as any)
                return
            }

            const task = await createTask({ project_id: projectId, ...payload })
            if (assignedWorkers.length > 0) {
                await assignWorkersToTask(task.data.id, assignedWorkers)
            }
            logTaskCreated(projectId).catch(() => {})
            router.replace(`/tabs/task-list?projectId=${projectId}&projectTitle=${projectTitle}` as any)
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.error ?? (isEdit ? 'Failed to update task' : 'Failed to create task'))
        } finally {
            setSubmitting(false)
        }
    }

    const toggleWorker = (id: string) => {
        setAssignedWorkers(prev =>
            prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
        )
    }

    const availableWorkers = workers.filter(worker =>
        !assignedWorkers.includes(worker.id) &&
        (categoryName === '' || (worker.certificates ?? []).includes(categoryName))
    )

    useEffect(() => {
        getCategories()
            .then(async res => {
                setCategories(res.data)
                await cacheCategories(res.data)
            })
            .catch(async () => {
                const cached = await getCachedCategories()
                setCategories(cached)
            })
    }, [])

    useEffect(() => {
        if (!projectId) return
        getProjectWorkers(projectId as string)
            .then(res => setWorkers(res.data))
            .catch(err => console.error(err))
    }, [projectId])

    useEffect(() => {
        if (!isEdit || !taskId) return
        getTaskById(taskId)
            .then(res => {
                const t = res.data
                setTitle(t.title ?? '')
                setDescription(t.description ?? '')
                setCategoryId(t.category_id ?? '')
                setPriority(t.priority ?? 'medium')
                if (t.deadline) setDeadline(new Date(t.deadline))
            })
            .catch(() => Alert.alert('Error', 'Could not load task'))
    }, [isEdit, taskId])

    const styles = StyleSheet.create({
        breadcrumb: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            marginBottom: 12,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: Colors.border,
        },
        breadcrumbText: { fontSize: 12, color: Colors.textSecondary },
        breadcrumbCurrent: { fontSize: 12, color: Colors.textPrimary, fontWeight: '500' },
        sectionLabel: {
            fontSize: 13,
            color: Colors.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginTop: 20,
            marginBottom: 8,
        },
        fieldLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 6, marginTop: 14 },
        required: { color: Colors.danger },
        input: {
            backgroundColor: Colors.surface,
            borderWidth: 1,
            borderColor: Colors.border,
            borderRadius: 10,
            padding: 12,
            fontSize: 15,
            color: Colors.textPrimary,
        },
        inputError: { borderColor: Colors.danger },
        errorText: { fontSize: 12, color: Colors.danger, marginTop: 4 },
        textArea: { height: 100, textAlignVertical: 'top' },
        pickerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
        pickerText: { fontSize: 15, color: Colors.textPrimary, flex: 1 },
        dropdown: {
            backgroundColor: Colors.surface,
            borderWidth: 1,
            borderColor: Colors.border,
            borderRadius: 10,
            marginTop: 4,
            overflow: 'hidden',
        },
        dropdownItem: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 12,
            borderBottomWidth: 1,
            borderBottomColor: Colors.border,
        },
        dropdownItemActive: { backgroundColor: Colors.primaryLight },
        dropdownText: { fontSize: 14, color: Colors.textPrimary },
        dateBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
        dateText: { fontSize: 15, color: Colors.textPrimary },
        confirmBtn: {
            backgroundColor: Colors.primary,
            borderRadius: 10,
            padding: 10,
            alignItems: 'center',
            marginTop: 8,
        },
        confirmText: { color: Colors.textPrimary, fontSize: 15, fontWeight: '500' },
        priorityRow: { flexDirection: 'row', gap: 10 },
        priorityBtn: {
            flex: 1,
            paddingVertical: 10,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: Colors.border,
            alignItems: 'center',
            backgroundColor: Colors.surface,
        },
        priorityText: { fontSize: 14, color: Colors.textSecondary },
        emptyText: { fontSize: 13, color: Colors.textSecondary, fontStyle: 'italic', paddingVertical: 8 },
        workerBox: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            backgroundColor: Colors.surface,
            borderWidth: 1,
            borderColor: Colors.border,
            borderRadius: 12,
            padding: 14,
            marginTop: 8,
        },
        workerSelected: {
            borderColor: Colors.primary,
            backgroundColor: Colors.primaryLight,
        },
        workerInfo: { flex: 1 },
        workerName: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
        workerCerts: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
        submitButton: {
            backgroundColor: Colors.primary,
            borderRadius: 10,
            padding: 14,
            alignItems: 'center',
            marginTop: 24,
        },
        submitText: { color: Colors.textPrimary, fontSize: 16, fontWeight: '500' },
    })

    return (
        <ScreenWrapper title={isEdit ? 'Edit task' : 'New task'} backRoute={`/tabs/task-list?projectId=${projectId}&projectTitle=${projectTitle}`}>

            <View style={styles.breadcrumb}>
                <Ionicons name="folder-outline" size={12} color={Colors.textSecondary} />
                <Text style={styles.breadcrumbText}>{projectTitle ?? 'Project'}</Text>
                <Ionicons name="chevron-forward" size={10} color={Colors.textSecondary} />
                <Text style={styles.breadcrumbCurrent}>{isEdit ? 'Edit task' : 'New task'}</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                <Text style={styles.fieldLabel}>Title <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={[styles.input, errors.title && styles.inputError]}
                    placeholder="Task title"
                    placeholderTextColor={Colors.textSecondary}
                    value={title}
                    onChangeText={t => { setTitle(t); setErrors(e => ({ ...e, title: '' })) }}
                />
                {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

                <Text style={styles.fieldLabel}>Description</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Task description..."
                    placeholderTextColor={Colors.textSecondary}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                />

                <Text style={styles.fieldLabel}>Category <Text style={styles.required}>*</Text></Text>
                <TouchableOpacity
                    style={[styles.input, styles.pickerBtn, errors.category && styles.inputError]}
                    onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                    accessibilityRole="button"
                    accessibilityLabel={categoryName ? `Category: ${categoryName}. Change category` : 'Select task category'}
                >
                    <Text style={[styles.pickerText, !categoryName && { color: Colors.textSecondary }]} accessible={false}>
                        {categoryName || 'Select category'}
                    </Text>
                    <AntDesign name={showCategoryPicker ? 'up' : 'down'} size={12} color={Colors.textSecondary} accessible={false} />
                </TouchableOpacity>
                {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
                {showCategoryPicker && (
                    <View style={styles.dropdown}>
                        {categories.map(c => (
                            <TouchableOpacity
                                key={c.id}
                                style={[styles.dropdownItem, categoryId === c.id && styles.dropdownItemActive]}
                                onPress={() => {
                                    setCategoryId(c.id)
                                    setCategoryName(c.name)
                                    setShowCategoryPicker(false)
                                    setErrors(e => ({ ...e, category: '' }))
                                }}
                                accessibilityRole="button"
                                accessibilityLabel={`${c.name}${categoryId === c.id ? ', currently selected' : ''}`}
                            >
                                <Text style={[styles.dropdownText, categoryId === c.id && { color: Colors.primary }]}>{c.name}</Text>
                                {categoryId === c.id && <Ionicons name="checkmark" size={16} color={Colors.primary} accessible={false} />}
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <Text style={styles.fieldLabel}>Deadline <Text style={styles.required}>*</Text></Text>
                <TouchableOpacity
                    style={[styles.input, styles.dateBtn, errors.deadline && styles.inputError]}
                    onPress={() => setShowDatePicker(true)}
                    accessibilityRole="button"
                    accessibilityLabel={deadline ? `Deadline: ${formatDate(deadline)}` : 'Select deadline date'}
                >
                    <AntDesign name="calendar" size={16} color={Colors.textSecondary} accessible={false} />
                    <Text style={[styles.dateText, !deadline && { color: Colors.textSecondary }]} accessible={false}>
                        {deadline ? formatDate(deadline) : 'Select date'}
                    </Text>
                </TouchableOpacity>
                {errors.deadline && <Text style={styles.errorText}>{errors.deadline}</Text>}
                {showDatePicker && (
                    <View>
                        <DateTimePicker
                            value={deadline ?? new Date()}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={(_, date) => {
                                if (Platform.OS === 'android') setShowDatePicker(false)
                                if (date) { setDeadline(date); setErrors(e => ({ ...e, deadline: '' })) }
                            }}
                        />
                        {Platform.OS === 'ios' && (
                            <TouchableOpacity style={styles.confirmBtn} onPress={() => setShowDatePicker(false)} accessibilityRole="button" accessibilityLabel="Confirm date">
                                <Text style={styles.confirmText}>Confirm</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                <Text style={styles.fieldLabel}>Priority</Text>
                <View style={styles.priorityRow}>
                    {PRIORITIES.map(p => {
                        const pc = priorityColors[p as keyof typeof priorityColors]
                        const active = priority === p
                        return (
                            <TouchableOpacity
                                key={p}
                                style={[styles.priorityBtn, active && { backgroundColor: pc.bg, borderColor: pc.border }]}
                                onPress={() => setPriority(p)}
                                accessibilityRole="button"
                                accessibilityLabel={`${priorityLabels[p]} priority${active ? ', currently selected' : ''}`}
                            >
                                <Text style={[styles.priorityText, active && { color: pc.text }]} accessible={false}>{priorityLabels[p]}</Text>
                            </TouchableOpacity>
                        )
                    })}
                </View>

                <Text style={styles.sectionLabel}>Assigned workers</Text>
                {assignedWorkers.length === 0 ? (
                    <Text style={styles.emptyText}>No workers assigned yet</Text>
                ) : (
                    workers.filter(w => assignedWorkers.includes(w.id)).map(worker => (
                        <TouchableOpacity key={worker.id} style={[styles.workerBox, styles.workerSelected]} onPress={() => toggleWorker(worker.id)} accessibilityRole="button" accessibilityLabel={`${worker.first_name} ${worker.last_name}, assigned`} accessibilityHint="Double tap to remove from task">
                            <Ionicons name="person-outline" size={18} color={Colors.primary} accessible={false} />
                            <View style={styles.workerInfo} accessible={false}>
                                <Text style={styles.workerName}>{worker.first_name} {worker.last_name}</Text>
                                {(worker.certificates ?? []).length > 0 && (
                                    <Text style={styles.workerCerts}>{worker.certificates.join(' · ')}</Text>
                                )}
                            </View>
                            <Ionicons name="checkmark-circle" size={20} color={Colors.primary} accessible={false} />
                        </TouchableOpacity>
                    ))
                )}

                {availableWorkers.length > 0 && (
                    <>
                        <Text style={[styles.fieldLabel, { marginTop: 16 }]}>
                            {categoryName ? `Workers certified in ${categoryName}` : 'Available workers'}
                        </Text>
                        {availableWorkers.map(worker => (
                            <TouchableOpacity key={worker.id} style={styles.workerBox} onPress={() => toggleWorker(worker.id)} accessibilityRole="button" accessibilityLabel={`${worker.first_name} ${worker.last_name}`} accessibilityHint="Double tap to assign to task">
                                <Ionicons name="person-outline" size={18} color={Colors.textSecondary} accessible={false} />
                                <View style={styles.workerInfo} accessible={false}>
                                    <Text style={styles.workerName}>{worker.first_name} {worker.last_name}</Text>
                                    {(worker.certificates ?? []).length > 0 && (
                                        <Text style={styles.workerCerts}>{worker.certificates.join(' · ')}</Text>
                                    )}
                                </View>
                                <Ionicons name="add-circle-outline" size={20} color={Colors.textSecondary} accessible={false} />
                            </TouchableOpacity>
                        ))}
                    </>
                )}

                <TouchableOpacity
                    style={[styles.submitButton, submitting && { opacity: 0.6 }]}
                    onPress={handleSubmit}
                    disabled={submitting}
                    accessibilityRole="button"
                    accessibilityLabel={submitting ? 'Saving task' : 'Save task'}
                >
                    <Text style={styles.submitText}>{submitting ? (isEdit ? 'Updating...' : 'Saving...') : (isEdit ? 'Update task' : 'Save task')}</Text>
                </TouchableOpacity>

                <View style={{ height: Math.max(insets.bottom, 16) + 16 }} />
            </ScrollView>
        </ScreenWrapper>
    )
}