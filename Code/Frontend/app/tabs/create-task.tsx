import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, Alert } from 'react-native'
import { useColors } from '@/contexts/ThemeContext'
import { ScreenWrapper } from '@/components/ScreenWrapper'
import { useEffect, useState } from 'react'
import DateTimePicker from '@react-native-community/datetimepicker'
import { router, useLocalSearchParams } from 'expo-router'
import AntDesign from '@expo/vector-icons/AntDesign'
import { Ionicons } from '@expo/vector-icons'
import { getProjectWorkers } from '@/api/endpoints/workers'
import { createTask, assignWorkersToTask } from '@/api/endpoints/tasks'
import { getCategories } from '@/api/endpoints/categories'
import { useNetwork } from '@/contexts/NetworkContext'
import { addToQueue } from '@/utils/offlineQueue'
import { logTaskCreated } from '@/utils/firebase'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const PRIORITIES = ['low', 'medium', 'high']
const priorityLabels: Record<string, string> = { low: 'Low', medium: 'Medium', high: 'High' }

export default function CreateTask() {
    const Colors = useColors()
    const insets = useSafeAreaInsets()
    const { projectId, projectTitle } = useLocalSearchParams()
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

    const priorityColors = {
        low:    { bg: Colors.neutralBg, border: Colors.neutralBorder, text: Colors.neutral },
        medium: { bg: Colors.warningBg, border: Colors.warningBorder, text: Colors.warning },
        high:   { bg: Colors.dangerBg,  border: Colors.dangerBorder,  text: Colors.danger  },
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
        try {
            if (!isOnline) {
                await addToQueue('TASK_CREATE', {
                    project_id: projectId as string,
                    title,
                    description,
                    category_id: categoryId,
                    priority,
                    deadline: deadline!.toISOString().split('T')[0],
                    workerIds: assignedWorkers,
                })
                logTaskCreated(projectId as string).catch(() => {})
                    const resetForm = () => {
                    setTitle('')
                    setDescription('')
                    setCategoryId('')
                    setCategoryName('')
                    setDeadline(null)
                    setPriority('medium')
                    setAssignedWorkers([])
                    setErrors({})
                }

                resetForm()
                Alert.alert('Saved offline', 'Task will be created when you reconnect.')
                router.back()
                return
            }
            const task = await createTask({
                project_id: projectId as string,
                title,
                description,
                category_id: categoryId,
                priority,
                deadline: deadline!.toISOString().split('T')[0],
            })
            if (assignedWorkers.length > 0) {
                await assignWorkersToTask(task.data.id, assignedWorkers)
            }
            logTaskCreated(projectId as string).catch(() => {})
            const resetForm = () => {
                setTitle('')
                setDescription('')
                setCategoryId('')
                setCategoryName('')
                setDeadline(null)
                setPriority('medium')
                setAssignedWorkers([])
                setErrors({})
            }

            resetForm()
            router.back()
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.error ?? 'Failed to create task')
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
            .then(res => setCategories(res.data))
            .catch(err => console.error(err))
    }, [])

    useEffect(() => {
        if (!projectId) return
        getProjectWorkers(projectId as string)
            .then(res => setWorkers(res.data))
            .catch(err => console.error(err))
    }, [projectId])

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
        <ScreenWrapper title='New task' backRoute={`/tabs/projectDetail_manager?id=${projectId}`}>

            <View style={styles.breadcrumb}>
                <Ionicons name="folder-outline" size={12} color={Colors.textSecondary} />
                <Text style={styles.breadcrumbText}>{projectTitle ?? 'Project'}</Text>
                <Ionicons name="chevron-forward" size={10} color={Colors.textSecondary} />
                <Text style={styles.breadcrumbCurrent}>New task</Text>
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
                >
                    <Text style={[styles.pickerText, !categoryName && { color: Colors.textSecondary }]}>
                        {categoryName || 'Select category'}
                    </Text>
                    <AntDesign name={showCategoryPicker ? 'up' : 'down'} size={12} color={Colors.textSecondary} />
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
                            >
                                <Text style={[styles.dropdownText, categoryId === c.id && { color: Colors.primary }]}>{c.name}</Text>
                                {categoryId === c.id && <Ionicons name="checkmark" size={16} color={Colors.primary} />}
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <Text style={styles.fieldLabel}>Deadline <Text style={styles.required}>*</Text></Text>
                <TouchableOpacity
                    style={[styles.input, styles.dateBtn, errors.deadline && styles.inputError]}
                    onPress={() => setShowDatePicker(true)}
                >
                    <AntDesign name="calendar" size={16} color={Colors.textSecondary} />
                    <Text style={[styles.dateText, !deadline && { color: Colors.textSecondary }]}>
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
                            <TouchableOpacity style={styles.confirmBtn} onPress={() => setShowDatePicker(false)}>
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
                            >
                                <Text style={[styles.priorityText, active && { color: pc.text }]}>{priorityLabels[p]}</Text>
                            </TouchableOpacity>
                        )
                    })}
                </View>

                <Text style={styles.sectionLabel}>Assigned workers</Text>
                {assignedWorkers.length === 0 ? (
                    <Text style={styles.emptyText}>No workers assigned yet</Text>
                ) : (
                    workers.filter(w => assignedWorkers.includes(w.id)).map(worker => (
                        <TouchableOpacity key={worker.id} style={[styles.workerBox, styles.workerSelected]} onPress={() => toggleWorker(worker.id)}>
                            <Ionicons name="person-outline" size={18} color={Colors.primary} />
                            <View style={styles.workerInfo}>
                                <Text style={styles.workerName}>{worker.first_name} {worker.last_name}</Text>
                                {(worker.certificates ?? []).length > 0 && (
                                    <Text style={styles.workerCerts}>{worker.certificates.join(' · ')}</Text>
                                )}
                            </View>
                            <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                        </TouchableOpacity>
                    ))
                )}

                {availableWorkers.length > 0 && (
                    <>
                        <Text style={[styles.fieldLabel, { marginTop: 16 }]}>
                            {categoryName ? `Workers certified in ${categoryName}` : 'Available workers'}
                        </Text>
                        {availableWorkers.map(worker => (
                            <TouchableOpacity key={worker.id} style={styles.workerBox} onPress={() => toggleWorker(worker.id)}>
                                <Ionicons name="person-outline" size={18} color={Colors.textSecondary} />
                                <View style={styles.workerInfo}>
                                    <Text style={styles.workerName}>{worker.first_name} {worker.last_name}</Text>
                                    {(worker.certificates ?? []).length > 0 && (
                                        <Text style={styles.workerCerts}>{worker.certificates.join(' · ')}</Text>
                                    )}
                                </View>
                                <Ionicons name="add-circle-outline" size={20} color={Colors.textSecondary} />
                            </TouchableOpacity>
                        ))}
                    </>
                )}

                <TouchableOpacity
                    style={[styles.submitButton, submitting && { opacity: 0.6 }]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    <Text style={styles.submitText}>{submitting ? 'Saving...' : 'Save task'}</Text>
                </TouchableOpacity>

                <View style={{ height: Math.max(insets.bottom, 16) + 16 }} />
            </ScrollView>
        </ScreenWrapper>
    )
}
