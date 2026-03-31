import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, Alert } from 'react-native'
import { Colors } from '../../constants/color'
import { ScreenWrapper } from '@/components/ScreenWrapper'
import { use, useEffect, useState } from 'react'
import DateTimePicker from '@react-native-community/datetimepicker'
import { router } from 'expo-router'
import AntDesign from '@expo/vector-icons/AntDesign'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams } from 'expo-router'
import { getProjectWorkers } from '@/api/endpoints/workers'


const CATEGORIES = ['Elektrika', 'Voda', 'Kurenie', 'Plyn']
const PRIORITIES = ['low', 'medium', 'high']
const priorityLabels: Record<string, string> = { low: 'Low', medium: 'Medium', high: 'High' }
const priorityColors: Record<string, string> = {
    low: Colors.neutral,
    medium: Colors.warning,
    high: Colors.danger,
}



export default function CreateTask() {
    const { projectId, projectTitle } = useLocalSearchParams()
    const [workers, setWorkers] = useState<any[]>([])
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('')
    const [showCategoryPicker, setShowCategoryPicker] = useState(false)
    const [deadline, setDeadline] = useState<Date | null>(null)
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [priority, setPriority] = useState('medium')
    const [assignedWorkers, setAssignedWorkers] = useState<string[]>([])
    const [errors, setErrors] = useState<Record<string, string>>({})

    const formatDate = (date: Date) =>
        date.toLocaleDateString('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric' })

    const validate = () => {
        const newErrors: Record<string, string> = {}
        if (!title.trim()) newErrors.title = 'Title is required'
        if (!category) newErrors.category = 'Category is required'
        if (!deadline) newErrors.deadline = 'Deadline is required'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) {
            Alert.alert('Missing fields', 'Please fill in all required fields.')
            return
        }
        // TODO: call createTask API
        console.log({ title, description, category, deadline, priority, assignedWorkers })
        router.back()
    }

    const toggleWorker = (id: string) => {
        setAssignedWorkers(prev =>
            prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
        )
    }
    const availableWorkers = workers.filter(worker =>
        !assignedWorkers.includes(worker.id) &&
        (category === '' || (worker.certificates ?? []).includes(category))
    )


    useEffect(() => {
        if (!projectId) return
        getProjectWorkers(projectId as string)
            .then(res => {
                console.log('Workers:', JSON.stringify(res.data[0]))
                setWorkers(res.data)
            })
            .catch(err => console.error(err))
    }, [projectId])

    return (
        <ScreenWrapper title='New task' backRoute={`/tabs/projectDetail_manager?id=${projectId}`}>
            <View style={styles.projectContext}>
                <Ionicons name="folder-outline" size={12} color={Colors.textSecondary} />
                <Text style={styles.projectContextText}>{projectTitle ?? 'Unknown project'}</Text>
                <View style={styles.contextChevron}>
                    <Ionicons name="chevron-forward" size={10} color={Colors.textSecondary} />
                </View>
                <Text style={styles.contextCurrent}>New task</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>

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
                    numberOfLines={5}
                />

                <Text style={styles.fieldLabel}>Category <Text style={styles.required}>*</Text></Text>
                <TouchableOpacity
                    style={[styles.input, styles.pickerButton, errors.category && styles.inputError]}
                    onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                >
                    <Text style={[styles.pickerText, !category && { color: Colors.textSecondary }]}>
                        {category || 'Select'}
                    </Text>
                    <AntDesign name={showCategoryPicker ? 'up' : 'down'} size={12} color={Colors.textSecondary} />
                </TouchableOpacity>
                {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
                {showCategoryPicker && (
                    <View style={styles.dropdown}>
                        {CATEGORIES.map(c => (
                            <TouchableOpacity
                                key={c}
                                style={styles.dropdownItem}
                                onPress={() => { setCategory(c); setShowCategoryPicker(false); setErrors(e => ({ ...e, category: '' })) }}
                            >
                                <Text style={[styles.dropdownText, category === c && { color: Colors.primary }]}>{c}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <Text style={styles.fieldLabel}>Deadline <Text style={styles.required}>*</Text></Text>
                <TouchableOpacity
                    style={[styles.input, styles.dateButton, errors.deadline && styles.inputError]}
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
                            <TouchableOpacity style={styles.dateConfirm} onPress={() => setShowDatePicker(false)}>
                                <Text style={styles.dateConfirmText}>Confirm</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                <Text style={styles.fieldLabel}>Priority</Text>
                <View style={styles.priorityRow}>
                    {PRIORITIES.map(p => (
                        <TouchableOpacity
                            key={p}
                            style={[styles.priorityBtn, priority === p && { backgroundColor: priorityColors[p], borderColor: priorityColors[p] }]}
                            onPress={() => setPriority(p)}
                        >
                            <Text style={[styles.priorityText, priority === p && { color: Colors.textPrimary }]}>
                                {priorityLabels[p]}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                {/* Assigned workers */}
                <Text style={styles.fieldLabel}>Assigned workers</Text>
                <View style={styles.divider} />
                {assignedWorkers.length === 0 ? (
                    <Text style={styles.emptyText}>No workers assigned yet</Text>
                ) : (
                    workers.filter(w => assignedWorkers.includes(w.id)).map(worker => (
                        <TouchableOpacity
                            key={worker.id}
                            style={[styles.workerBox, styles.workerSelected]}
                            onPress={() => toggleWorker(worker.id)}
                        >
                            <Ionicons name="person-outline" size={20} color={Colors.textSecondary} />
                            <View style={styles.workerInfo}>
                                <Text style={styles.workerName}>{worker.first_name} {worker.last_name}</Text>
                                <View style={styles.certRow}>
                                    {(worker.certificates ?? []).map((cert: string) => (
                                        <Text key={cert} style={styles.cert}>✓ {cert}</Text>
                                    ))}
                                </View>
                            </View>
                            <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
                        </TouchableOpacity>
                    ))
                )}

                {/* Available workers */}
                <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Tap to assign worker</Text>
                <View style={styles.divider} />
                {availableWorkers.map(worker => (
                    <TouchableOpacity
                        key={worker.id}
                        style={styles.workerBox}
                        onPress={() => toggleWorker(worker.id)}
                    >
                        <Ionicons name="person-outline" size={20} color={Colors.textSecondary} />
                        <View style={styles.workerInfo}>
                            <Text style={styles.workerName}>{worker.first_name} {worker.last_name}</Text>
                            <View style={styles.certRow}>
                                {(worker.certificates ?? []).map((cert: string) => (
                                    <Text key={cert} style={styles.cert}>✓ {cert}</Text>
                                ))}
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}

                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitText}>Save Task</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </ScreenWrapper>
    )
}

const styles = StyleSheet.create({
    projectContext: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        marginTop: 10
    },
    projectContextText: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    contextChevron: {
        marginHorizontal: 2,
    },
    contextCurrent: {
        fontSize: 12,
        color: Colors.textPrimary,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: 16,
    },
    fieldLabel: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginBottom: 6,
        marginTop: 14,
    },
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
    textArea: { height: 120, textAlignVertical: 'top' },
    row: { flexDirection: 'row', gap: 12 },
    half: { flex: 1 },
    pickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
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
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    dropdownText: { fontSize: 14, color: Colors.textPrimary },
    dateConfirm: {
        backgroundColor: Colors.primary,
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        marginTop: 8,
    },
    dateConfirmText: { color: Colors.textPrimary, fontSize: 15, fontWeight: '500' },
    priorityRow: {
        flexDirection: 'row',
        gap: 10,
    },
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
    workerBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 12,
        padding: 14,
        marginTop: 10,
    },
    workerSelected: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primaryLight,
    },
    workerInfo: { flex: 1 },
    workerName: {
        fontSize: 15,
        fontWeight: '500',
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    certRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    cert: { fontSize: 12, color: Colors.textPrimary },
    submitButton: {
        backgroundColor: Colors.primary,
        borderRadius: 10,
        padding: 14,
        alignItems: 'center',
        marginTop: 24,
    },
    submitText: { color: Colors.textPrimary, fontSize: 16, fontWeight: '500' },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dateText: {
        fontSize: 15,
        color: Colors.textPrimary,
    },
    emptyText: {
        fontSize: 13,
        color: Colors.textSecondary,
        fontStyle: 'italic',
        paddingVertical: 8,
    },
})