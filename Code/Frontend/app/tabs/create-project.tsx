import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native'
import { Colors } from '../../constants/color'
import { ScreenWrapper } from '@/components/ScreenWrapper'
import { useState } from 'react'
import DateTimePicker from '@react-native-community/datetimepicker'
import MapView, { Marker } from 'react-native-maps'
import { router } from 'expo-router'
import AntDesign from '@expo/vector-icons/AntDesign'
import { Ionicons } from '@expo/vector-icons'

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

    const statuses = ['in_progress', 'pending', 'finished', 'cancelled']
    const statusLabels: Record<string, string> = {
        in_progress: 'In progress',
        pending: 'Pending',
        finished: 'Finished',
        cancelled: 'Cancelled',
    }

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }

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

    const handleSubmit = () => {
        if (!validate()) {
            Alert.alert('Missing fields', 'Please fill in all required fields.')
            return
        }
        // TODO: call createProject API
        console.log({ title, description, deadline, status, address, lat, lng, clientName, clientPhone, clientEmail })
        router.push('/tabs/projectsList')
    }

    return (
        <ScreenWrapper title='New project' backRoute='/tabs/projectList'>
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
                {/* Deadline */}
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
                                if (Platform.OS === 'android') {
                                    setShowDatePicker(false)
                                }
                                if (date) {
                                    setDeadline(date)
                                    setErrors(e => ({ ...e, deadline: '' }))
                                }
                            }}
                        />
                        {Platform.OS === 'ios' && (
                            <TouchableOpacity
                                style={styles.dateConfirm}
                                onPress={() => setShowDatePicker(false)}
                            >
                                <Text style={styles.dateConfirmText}>Confirm</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* Status */}
                <Text style={styles.fieldLabel}>Status</Text>
                <View style={styles.statusRow}>
                    {statuses.map(s => (
                        <TouchableOpacity key={s} style={styles.statusOption} onPress={() => setStatus(s)}>
                            <View style={[styles.radio, status === s && styles.radioSelected]} />
                            <Text style={styles.statusLabel}>{statusLabels[s]}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.sectionDivider} />

                {/* Location */}
                <Text style={styles.sectionLabel}>Location</Text>

                <Text style={styles.fieldLabel}>Construction site address <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={[styles.input, errors.address && styles.inputError]}
                    placeholder="Hlavna 12, Senkvice"
                    placeholderTextColor={Colors.textSecondary}
                    value={address}
                    onChangeText={t => { setAddress(t); setErrors(e => ({ ...e, address: '' })) }}
                />
                {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}

                <Text style={styles.fieldLabel}>GPS coordinates</Text>
                <TouchableOpacity style={styles.mapToggle} onPress={() => setShowMap(!showMap)}>
                    <Ionicons name="map-outline" size={16} color={Colors.primary} />
                    <Text style={styles.mapToggleText}>
                        {lat && lng ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : 'Tap to pick location on map'}
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

                <View style={styles.row}>
                    <View style={styles.half}>
                        <Text style={styles.fieldLabel}>GPS Lat</Text>
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
                        <Text style={styles.fieldLabel}>GPS Lon</Text>
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

                {/* Client info */}
                <Text style={styles.sectionLabel}>Client info</Text>

                <Text style={styles.fieldLabel}>Client name <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={[styles.input, errors.clientName && styles.inputError]}
                    placeholder="Ing. Damian Styrak, PhD., MBA., kkt."
                    placeholderTextColor={Colors.textSecondary}
                    value={clientName}
                    onChangeText={t => { setClientName(t); setErrors(e => ({ ...e, clientName: '' })) }}
                />
                {errors.clientName && <Text style={styles.errorText}>{errors.clientName}</Text>}

                <View style={styles.row}>
                    <View style={styles.half}>
                        <Text style={styles.fieldLabel}>Phone</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="+158"
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
                            placeholder="styrak@gmail.com"
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

                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitText}>Create project</Text>
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
    required: {
        color: Colors.danger,
    },
    input: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 10,
        padding: 12,
        fontSize: 15,
        color: Colors.textPrimary,
    },
    inputError: {
        borderColor: Colors.danger,
    },
    errorText: {
        fontSize: 12,
        color: Colors.danger,
        marginTop: 4,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dateText: {
        fontSize: 15,
        color: Colors.textPrimary,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    half: {
        flex: 1,
    },
    sectionDivider: {
        height: 1,
        backgroundColor: Colors.border,
        marginTop: 20,
    },
    statusPicker: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 10,
        padding: 10,
        gap: 8,
        marginTop: 12,
    },
    statusOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        width: '45%',
    },
    radio: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 1.5,
        borderColor: Colors.textSecondary,
    },
    radioSelected: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primary,
    },
    statusLabel: {
        fontSize: 13,
        color: Colors.textPrimary,
    },
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
    mapToggleText: {
        flex: 1,
        fontSize: 14,
        color: Colors.primary,
    },
    map: {
        height: 200,
        borderRadius: 10,
        marginTop: 10,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
    },
    submitButton: {
        backgroundColor: Colors.primary,
        borderRadius: 10,
        padding: 14,
        alignItems: 'center',
        marginTop: 24,
    },
    submitText: {
        color: Colors.textPrimary,
        fontSize: 16,
        fontWeight: '500',
    },
    statusRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 10,
        padding: 12,
    },
    dateConfirm: {
        backgroundColor: Colors.primary,
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        marginTop: 8,
    },
    dateConfirmText: {
        color: Colors.textPrimary,
        fontSize: 15,
        fontWeight: '500',
    },

})