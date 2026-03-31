import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native'
import { ScreenWrapper } from '@/components/ScreenWrapper'
import { useState } from 'react'
import { Colors } from '@/constants/color'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { updateProfile } from '@/api/endpoints/users'
import * as SecureStore from 'expo-secure-store'

const CERTIFICATES = ['Water', 'Heating', 'Electricity', 'Gas']

export default function EditProfile() {
    const [firstName, setFirstName] = useState('Peter')
    const [lastName, setLastName] = useState('Novak')
    const [hourlyRate, setHourlyRate] = useState('25')
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [saving, setSaving] = useState(false)

    const validate = () => {
        const newErrors: Record<string, string> = {}
        if (!firstName.trim()) newErrors.firstName = 'First name is required'
        if (!lastName.trim()) newErrors.lastName = 'Last name is required'
        if (!hourlyRate.trim() || isNaN(Number(hourlyRate))) newErrors.hourlyRate = 'Valid hourly rate is required'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSave = async () => {
        if (!validate()) return
        setSaving(true)
        try {
            // TODO: replace 'userId' with actual userId from SecureStore
            // await updateProfile(userId, { first_name: firstName, last_name: lastName, hourly_rate: hourlyRate })
            router.push('/tabs/profile')
        } catch (e) {
            Alert.alert('Error', 'Could not save profile. Please try again.')
        } finally {
            setSaving(false)
        }
    }
    const handleLogout = async () => {
        await SecureStore.deleteItemAsync('token')
        await SecureStore.deleteItemAsync('userId')
        router.push('/auth/login')
    }

    const saveButton = (
        <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveBtn}>
            <Ionicons name="save-outline" size={18} color={saving ? Colors.textSecondary : Colors.primary} />
            <Text style={[styles.saveText, saving && { color: Colors.textSecondary }]}>Save</Text>
        </TouchableOpacity>
    )

    return (
        <ScreenWrapper title="Edit profile" backRoute="/tabs/profile" rightElement={saveButton}>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* Avatar */}
                <View style={styles.avatarSection}>
                    <Ionicons name="person-circle" size={90} color={Colors.border} />
                    <TouchableOpacity style={styles.changePhotoBtn}>
                        <Ionicons name="camera-outline" size={14} color={Colors.primary} />
                        <Text style={styles.changePhotoText}>Change photo</Text>
                    </TouchableOpacity>
                </View>

                {/* Fields */}
                <Text style={styles.fieldLabel}>First name</Text>
                <TextInput
                    style={[styles.input, errors.firstName && styles.inputError]}
                    placeholder="First name"
                    placeholderTextColor={Colors.textSecondary}
                    value={firstName}
                    onChangeText={t => { setFirstName(t); setErrors(e => ({ ...e, firstName: '' })) }}
                />
                {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}

                <Text style={styles.fieldLabel}>Last name</Text>
                <TextInput
                    style={[styles.input, errors.lastName && styles.inputError]}
                    placeholder="Last name"
                    placeholderTextColor={Colors.textSecondary}
                    value={lastName}
                    onChangeText={t => { setLastName(t); setErrors(e => ({ ...e, lastName: '' })) }}
                />
                {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}

                <Text style={styles.fieldLabel}>Hourly rate</Text>
                <TextInput
                    style={[styles.input, errors.hourlyRate && styles.inputError]}
                    placeholder="25"
                    placeholderTextColor={Colors.textSecondary}
                    value={hourlyRate}
                    onChangeText={t => { setHourlyRate(t); setErrors(e => ({ ...e, hourlyRate: '' })) }}
                    keyboardType="numeric"
                />
                {errors.hourlyRate && <Text style={styles.errorText}>{errors.hourlyRate}</Text>}

                {/* Certificates */}
                <View style={styles.sectionDivider} />
                <Text style={styles.sectionLabel}>Certificates</Text>
                <View style={styles.certContainer}>
                    {CERTIFICATES.map((cert, index) => (
                        <View key={cert} style={[styles.certRow, index === CERTIFICATES.length - 1 && styles.certRowLast]}>
                            <Text style={styles.certName}>{cert}</Text>
                            <TouchableOpacity 
                                style={styles.uploadBtn}
                                onPress={() => router.push(`/uploadCertificate?category=${cert}`)}
                            >
                                <Ionicons name="cloud-upload-outline" size={14} color={Colors.primary} />
                                <Text style={styles.uploadText}>Upload</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* Logout */}
                <View style={styles.sectionDivider} />
                <TouchableOpacity style={styles.logoutBtn}>
                    <Ionicons name="log-out-outline" size={18} color={Colors.danger} onPress={handleLogout}/>
                    <Text style={styles.logoutText}>Log out</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </ScreenWrapper>
    )
}

const styles = StyleSheet.create({
    saveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    saveText: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: '500',
    },
    avatarSection: {
        alignItems: 'center',
        paddingVertical: 20,
        gap: 10,
    },
    changePhotoBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 20,
        paddingVertical: 5,
        paddingHorizontal: 12,
        backgroundColor: Colors.surface,
    },
    changePhotoText: {
        color: Colors.primary,
        fontSize: 13,
    },
    fieldLabel: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginBottom: 6,
        marginTop: 12,
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
    sectionDivider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: 20,
    },
    sectionLabel: {
        fontSize: 13,
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    certContainer: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    certRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    certRowLast: {
        borderBottomWidth: 0,
    },
    certName: {
        flex: 1,
        color: Colors.textSecondary,
        fontSize: 16,
    },
    uploadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    uploadText: {
        color: Colors.textSecondary,
        textDecorationLine: 'underline',
        fontSize: 14,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: Colors.dangerBorder,
        backgroundColor: Colors.dangerBg,
        borderRadius: 12,
        padding: 14,
    },
    logoutText: {
        color: Colors.danger,
        fontSize: 16,
        fontWeight: '500',
    },
})
