import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native'
import { Colors } from '../../constants/color'
import { ScreenWrapper } from '@/components/ScreenWrapper'
import { useState } from 'react'
import DateTimePicker from '@react-native-community/datetimepicker'
import MapView, { Marker } from 'react-native-maps'
import { router } from 'expo-router'
import AntDesign from '@expo/vector-icons/AntDesign'
import { Ionicons } from '@expo/vector-icons'
import { getUsers } from '@/api/endpoints/users'
import { createProject } from '@/api/endpoints/projects'

const STATUSES = ['in_progress', 'pending', 'finished', 'cancelled']
const statusLabels: Record<string, string> = {
    in_progress: 'In Progress',
    pending: 'Pending',
    finished: 'Finished',
    cancelled: 'Cancelled',
}
const statusColors: Record<string, { bg: string; border: string; text: string }> = {
    in_progress: { bg: Colors.successBg, border: Colors.successBorder, text: Colors.success },
    pending:     { bg: Colors.warningBg, border: Colors.warningBorder, text: Colors.warning },
    finished:    { bg: Colors.neutralBg, border: Colors.neutralBorder, text: Colors.neutral },
    cancelled:   { bg: Colors.dangerBg,  border: Colors.dangerBorder,  text: Colors.danger  },
}

export default function CreateProject() {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [deadline, setDeadline] = useState<Date | null>(null)
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [status, setStatus] = useState('in_progress')
    const [address, setAddress] = useState('')
    const [lat, setLat] = useState<number | null>(null)
    const [lng, setLng] = useState<number | null>(null)
    const [showMap, setShowMap] = useState(false)
    const [clientName, setClientName] = useState('')
    const [clientPhone, setClientPhone] = useState('')
    const [clientEmail, setClientEmail] = useState('')
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [submitting, setSubmitting] = useState(false)

    const formatDate = (date: Date) =>
        date.toLocaleDateString('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric' })

    const validate = () => {
        const newErrors: Record<string, string> = {}
        if (!title.trim()) newErrors.title = 'Title is required'
        if (!deadline) newErrors.deadline = 'Deadline is required'
        if (!address.trim()) newErrors.address = 'Address is required'
        if (!clientName.trim()) newErrors.clientName = 'Client name is required'
        if (clientEmail && !/\S+@\S+\.\S+/.test(clientEmail)) newErrors.clientEmail = 'Invalid email'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (!validate()) return
        setSubmitting(true)
        try {
            const usersRes = await getUsers()
            const managerId = usersRes.data[0]?.id
            if (!managerId) { Alert.alert('Error', 'Could not determine manager'); return }
            await createProject({
                manager_id: managerId,
                title,
                description,
                status,
                deadline: deadline!.toISOString().split('T')[0],
                address,
                lat: lat ?? undefined,
                lng: lng ?? undefined,
                client_name: clientName,
                client_phone: clientPhone,
                client_email: clientEmail,
            })
            router.push('/tabs/projectsList')
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.error ?? 'Failed to create project')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <ScreenWrapper title='New project' backRoute='/tabs/projectsList'>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* Project info */}
                <Text style={styles.sectionLabel}>Project info</Text>

                <Text style={styles.fieldLabel}>Title <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={[styles.input, errors.title && styles.inputError]}
                    placeholder="Office building renovation"
                    placeholderTextColor={Colors.textSecondary}
                    value={title}
                    onChangeText={t => { setTitle(t); setErrors(e => ({ ...e, title: '' })) }}
                />
                {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

                <Text style={styles.fieldLabel}>Description</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Brief description of the project..."
                    placeholderTextColor={Colors.textSecondary}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                />

                <Text style={styles.fieldLabel}>Deadline <Text style={styles.required}>*</Text></Text>
                <TouchableOpacity
                    style={[styles.input, styles.row, errors.deadline && styles.inputError]}
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

                <Text style={styles.fieldLabel}>Status</Text>
                <View style={styles.statusRow}>
                    {STATUSES.map(s => {
                        const sc = statusColors[s]
                        const active = status === s
                        return (
                            <TouchableOpacity
                                key={s}
                                style={[styles.statusChip, active && { backgroundColor: sc.bg, borderColor: sc.border }]}
                                onPress={() => setStatus(s)}
                            >
                                <Text style={[styles.statusChipText, active && { color: sc.text }]}>{statusLabels[s]}</Text>
                            </TouchableOpacity>
                        )
                    })}
                </View>

                <View style={styles.sectionDivider} />

                {/* Location */}
                <Text style={styles.sectionLabel}>Location</Text>

                <Text style={styles.fieldLabel}>Address <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={[styles.input, errors.address && styles.inputError]}
                    placeholder="Hlavna 12, Bratislava"
                    placeholderTextColor={Colors.textSecondary}
                    value={address}
                    onChangeText={t => { setAddress(t); setErrors(e => ({ ...e, address: '' })) }}
                />
                {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}

                <TouchableOpacity style={styles.mapToggle} onPress={() => setShowMap(!showMap)}>
                    <Ionicons name="map-outline" size={16} color={Colors.primary} />
                    <Text style={styles.mapToggleText}>
                        {lat && lng ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : 'Pick location on map'}
                    </Text>
                    <AntDesign name={showMap ? 'up' : 'down'} size={12} color={Colors.textSecondary} />
                </TouchableOpacity>

                {showMap && (
                    <MapView
                        style={styles.map}
                        initialRegion={{ latitude: 48.1486, longitude: 17.1077, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
                        onPress={e => {
                            setLat(e.nativeEvent.coordinate.latitude)
                            setLng(e.nativeEvent.coordinate.longitude)
                        }}
                    >
                        {lat && lng && <Marker coordinate={{ latitude: lat, longitude: lng }} />}
                    </MapView>
                )}

                <View style={styles.coordRow}>
                    <View style={styles.half}>
                        <Text style={styles.fieldLabel}>Latitude</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="48.1482"
                            placeholderTextColor={Colors.textSecondary}
                            value={lat?.toString() ?? ''}
                            onChangeText={t => setLat(parseFloat(t) || null)}
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={styles.half}>
                        <Text style={styles.fieldLabel}>Longitude</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="17.1067"
                            placeholderTextColor={Colors.textSecondary}
                            value={lng?.toString() ?? ''}
                            onChangeText={t => setLng(parseFloat(t) || null)}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                <View style={styles.sectionDivider} />

                {/* Client */}
                <Text style={styles.sectionLabel}>Client</Text>

                <Text style={styles.fieldLabel}>Name <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={[styles.input, errors.clientName && styles.inputError]}
                    placeholder="Client name"
                    placeholderTextColor={Colors.textSecondary}
                    value={clientName}
                    onChangeText={t => { setClientName(t); setErrors(e => ({ ...e, clientName: '' })) }}
                />
                {errors.clientName && <Text style={styles.errorText}>{errors.clientName}</Text>}

                <View style={styles.coordRow}>
                    <View style={styles.half}>
                        <Text style={styles.fieldLabel}>Phone</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="+421..."
                            placeholderTextColor={Colors.textSecondary}
                            value={clientPhone}
                            onChangeText={setClientPhone}
                            keyboardType="phone-pad"
                        />
                    </View>
                    <View style={styles.half}>
                        <Text style={styles.fieldLabel}>Email</Text>
                        <TextInput
                            style={[styles.input, errors.clientEmail && styles.inputError]}
                            placeholder="client@email.com"
                            placeholderTextColor={Colors.textSecondary}
                            value={clientEmail}
                            onChangeText={t => { setClientEmail(t); setErrors(e => ({ ...e, clientEmail: '' })) }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        {errors.clientEmail && <Text style={styles.errorText}>{errors.clientEmail}</Text>}
                    </View>
                </View>

                <View style={styles.sectionDivider} />

                <TouchableOpacity
                    style={[styles.submitButton, submitting && { opacity: 0.6 }]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    <Text style={styles.submitText}>{submitting ? 'Creating...' : 'Create project'}</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </ScreenWrapper>
    )
}

const styles = StyleSheet.create({
    sectionLabel: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginTop: 16,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    fieldLabel: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginBottom: 6,
        marginTop: 12,
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
    textArea: { height: 100, textAlignVertical: 'top' },
    row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    dateText: { fontSize: 15, color: Colors.textPrimary },
    coordRow: { flexDirection: 'row', gap: 12, marginTop: 0 },
    half: { flex: 1 },
    sectionDivider: { height: 1, backgroundColor: Colors.border, marginTop: 20 },
    statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
    statusChip: {
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 14,
        backgroundColor: Colors.surface,
    },
    statusChipText: { fontSize: 13, color: Colors.textSecondary },
    mapToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.primary,
        borderRadius: 10,
        padding: 12,
        marginTop: 8,
    },
    mapToggleText: { flex: 1, fontSize: 14, color: Colors.primary },
    map: {
        height: 200,
        borderRadius: 10,
        marginTop: 10,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
    },
    confirmBtn: {
        backgroundColor: Colors.primary,
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        marginTop: 8,
    },
    confirmText: { color: Colors.textPrimary, fontSize: 15, fontWeight: '500' },
    submitButton: {
        backgroundColor: Colors.primary,
        borderRadius: 10,
        padding: 14,
        alignItems: 'center',
        marginTop: 24,
    },
    submitText: { color: Colors.textPrimary, fontSize: 16, fontWeight: '500' },
})
