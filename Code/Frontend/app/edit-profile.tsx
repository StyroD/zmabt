import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image, Switch } from 'react-native'
import { ScreenWrapper } from '@/components/ScreenWrapper'
import { useEffect, useState } from 'react'
import { useColors, useTheme } from '@/contexts/ThemeContext'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { updateProfileWithAvatar, updateProfile, getUserById } from '@/api/endpoints/users'
import { getCategories } from '@/api/endpoints/categories'
import * as SecureStore from 'expo-secure-store'
import { saveUser } from '@/utils/secureUser'
import * as ImagePicker from 'expo-image-picker'


export default function EditProfile() {
    const Colors = useColors()
    const { theme, toggleTheme } = useTheme()

    const [userId, setUserId] = useState<string | null>(null)
    const [role, setRole] = useState<string | null>(null)
    const [avatarUri, setAvatarUri] = useState<string | null>(null)
    const [categories, setCategories] = useState<any[]>([])
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Basic
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [hourlyRate, setHourlyRate] = useState('')

    // Contact
    const [phone, setPhone] = useState('')
    const [address, setAddress] = useState('')

    // Emergency
    const [emergencyName, setEmergencyName] = useState('')
    const [emergencyPhone, setEmergencyPhone] = useState('')
    const [iban, setIban] = useState('')
    const [notes, setNotes] = useState('')

    useEffect(() => {
        const load = async () => {
            try {
                const stored = await SecureStore.getItemAsync('user')
                const storedUser = stored ? JSON.parse(stored) : null
                const id = storedUser?.id
                if (!id) return

                setUserId(id)
                setRole(storedUser.role ?? null)
                console.log('edit-profile: id=', id, 'role=', storedUser.role)

                const [userRes, catRes] = await Promise.all([
                    getUserById(id),
                    getCategories(),
                ])
                const user = userRes.data
                setFirstName(user.first_name ?? '')
                setLastName(user.last_name ?? '')
                setHourlyRate(user.hourly_rate?.toString() ?? '')
                setPhone(user.phone ?? '')
                setAddress(user.address ?? '')
                setEmergencyName(user.emergency_contact_name ?? '')
                setEmergencyPhone(user.emergency_contact_phone ?? '')
                setIban(user.iban ?? '')
                setNotes(user.notes ?? '')
                setCategories(catRes.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const isManager = role === 'manager'

    const validate = () => {
        const newErrors: Record<string, string> = {}
        if (!firstName.trim()) newErrors.firstName = 'First name is required'
        if (!lastName.trim()) newErrors.lastName = 'Last name is required'
        if (hourlyRate && isNaN(Number(hourlyRate))) newErrors.hourlyRate = 'Must be a number'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handlePickAvatar = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== 'granted') {
            Alert.alert('Permission required', 'Please allow access to your photo library.')
            return
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        })
        if (!result.canceled) setAvatarUri(result.assets[0].uri)
    }

    const handleSave = async () => {
    if (!validate()) return
    if (!userId) { Alert.alert('Error', 'User ID not found'); return }
    setSaving(true)
    try {
        const data = {
            first_name: firstName.trim() || null,
            last_name: lastName.trim() || null,
            phone: phone.trim() || null,
            address: address.trim() || null,
            hourly_rate: hourlyRate ? Number(hourlyRate) : null,
            emergency_contact_name: emergencyName.trim() || null,
            emergency_contact_phone: emergencyPhone.trim() || null,
            iban: iban.trim() || null,
            notes: notes.trim() || null,
        }

        if (avatarUri) {
            await updateProfileWithAvatar(userId, data, avatarUri)
        } else {
            await updateProfile(userId, data)
        }

        const freshRes = await getUserById(userId)
        console.log('fresh user has_avatar=', freshRes.data.has_avatar)
        const stored = await SecureStore.getItemAsync('user')
        const localUser = stored ? JSON.parse(stored) : {}
        await saveUser({ ...localUser, ...freshRes.data })
        router.back()
    } catch (e: any) {
        Alert.alert('Error', e?.response?.data?.error ?? e?.message ?? 'Could not save profile')
    } finally {
        setSaving(false)
    }
}

    const handleLogout = async () => {
        await SecureStore.deleteItemAsync('token')
        await SecureStore.deleteItemAsync('userId')
        await SecureStore.deleteItemAsync('user')
        router.replace('/auth/login' as any)
    }

    const saveButton = (
        <TouchableOpacity onPress={handleSave} disabled={saving}>
            <Ionicons name="save-outline" size={22} color={saving ? Colors.textSecondary : Colors.primary} />
        </TouchableOpacity>
    )

    const styles = makeStyles(Colors)

    if (loading) return <ActivityIndicator size="large" color={Colors.primary} style={{ flex: 1 }} />

    return (
        <ScreenWrapper title="Edit profile" backRoute=".." rightElement={saveButton}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                {/* Avatar */}
                <View style={styles.avatarSection}>
                    {avatarUri
                        ? <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                        : <Ionicons name="person-circle" size={90} color={Colors.border} />
                    }
                    <TouchableOpacity style={styles.changePhotoBtn} onPress={handlePickAvatar}>
                        <Ionicons name="camera-outline" size={14} color={Colors.primary} />
                        <Text style={styles.changePhotoText}>Change photo</Text>
                    </TouchableOpacity>
                </View>

                {/* Basic info */}
                <Text style={styles.sectionLabel}>Basic info</Text>
                <Field label="First name" value={firstName} onChangeText={t => { setFirstName(t); setErrors(e => ({ ...e, firstName: '' })) }} error={errors.firstName} colors={Colors} />
                <Field label="Last name" value={lastName} onChangeText={t => { setLastName(t); setErrors(e => ({ ...e, lastName: '' })) }} error={errors.lastName} colors={Colors} />
                {!isManager && (
                    <Field label="Hourly rate (EUR/h)" value={hourlyRate} onChangeText={t => { setHourlyRate(t); setErrors(e => ({ ...e, hourlyRate: '' })) }} error={errors.hourlyRate} keyboardType="numeric" colors={Colors} />
                )}

                {/* Contact */}
                <View style={styles.sectionDivider} />
                <Text style={styles.sectionLabel}>Contact</Text>
                <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" colors={Colors} />
                <Field label="Address" value={address} onChangeText={setAddress} colors={Colors} />

                    <>
                        <View style={styles.sectionDivider} />
                        <Text style={styles.sectionLabel}>Emergency contact</Text>
                        <Field label="Name" value={emergencyName} onChangeText={setEmergencyName} colors={Colors} />
                        <Field label="Phone" value={emergencyPhone} onChangeText={setEmergencyPhone} keyboardType="phone-pad" colors={Colors} />

                        <View style={styles.sectionDivider} />
                        <Text style={styles.sectionLabel}>Employment</Text>
                        <Field label="IBAN" value={iban} onChangeText={setIban} colors={Colors} />
                        <Field label="Notes" value={notes} onChangeText={setNotes} multiline colors={Colors} />
                    </>

                {/* Certificates — workers only */}
                {!isManager && (
                    <>
                        <View style={styles.sectionDivider} />
                        <Text style={styles.sectionLabel}>Certificates</Text>
                        <View style={styles.certContainer}>
                            {categories.map((cat, index) => (
                                <View key={cat.id} style={[styles.certRow, index === categories.length - 1 && styles.certRowLast]}>
                                    <Text style={styles.certName}>{cat.name}</Text>
                                    <TouchableOpacity
                                        style={styles.uploadBtn}
                                        onPress={() => router.push({
                                            pathname: '/uploadCertficate' as any,
                                            params: { categoryId: cat.id, categoryName: cat.name },
                                        })}
                                    >
                                        <Ionicons name="cloud-upload-outline" size={14} color={Colors.primary} />
                                        <Text style={styles.uploadText}>Upload</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </>
                )}
                {/* Appearance */}
                <View style={styles.sectionDivider} />
                <Text style={styles.sectionLabel}>Appearance</Text>
                <View style={styles.themeRow}>
                    <View style={styles.themeLabel}>
                        <Ionicons name={theme === 'dark' ? 'moon-outline' : 'sunny-outline'} size={20} color={Colors.textPrimary} />
                        <Text style={styles.themeLabelText}>{theme === 'dark' ? 'Dark mode' : 'Light mode'}</Text>
                    </View>
                    <Switch value={theme === 'dark'} onValueChange={toggleTheme} trackColor={{ false: Colors.border, true: Colors.primary }} thumbColor={Colors.surface} />
                </View>

                {/* Logout */}
                <View style={styles.sectionDivider} />
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={18} color={Colors.danger} />
                    <Text style={styles.logoutText}>Log out</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </ScreenWrapper>
    )
}

function Field({ label, value, onChangeText, error, keyboardType, multiline = false, colors }: {
    label: string
    value: string
    onChangeText: (t: string) => void
    error?: string
    keyboardType?: any
    multiline?: boolean
    colors: any
}) {
    return (
        <>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 6, marginTop: 12 }}>{label}</Text>
            <TextInput
                style={[{ backgroundColor: colors.surface, borderWidth: 1, borderColor: error ? colors.danger : colors.border, borderRadius: 10, padding: 12, fontSize: 15, color: colors.textPrimary }, multiline && { minHeight: 80, textAlignVertical: 'top' }]}
                placeholder={label}
                placeholderTextColor={colors.textSecondary}
                multiline={multiline}
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
            />
            {error ? <Text style={{ fontSize: 12, color: colors.danger, marginTop: 4 }}>{error}</Text> : null}
        </>
    )
}

function makeStyles(Colors: any) {
    return StyleSheet.create({
        avatarSection: { alignItems: 'center', paddingVertical: 20, gap: 10 },
        avatarImage: { width: 90, height: 90, borderRadius: 45 },
        changePhotoBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.border, borderRadius: 20, paddingVertical: 5, paddingHorizontal: 12, backgroundColor: Colors.surface },
        changePhotoText: { color: Colors.primary, fontSize: 13 },
        sectionDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 20 },
        sectionLabel: { fontSize: 13, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
        certContainer: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 16 },
        certRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
        certRowLast: { borderBottomWidth: 0 },
        certName: { flex: 1, color: Colors.textSecondary, fontSize: 16 },
        uploadBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
        uploadText: { color: Colors.primary, textDecorationLine: 'underline', fontSize: 14 },
        themeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 16 },
        themeLabel: { flexDirection: 'row', alignItems: 'center', gap: 10 },
        themeLabelText: { fontSize: 15, color: Colors.textPrimary },
        logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: Colors.dangerBorder, backgroundColor: Colors.dangerBg, borderRadius: 12, padding: 14 },
        logoutText: { color: Colors.danger, fontSize: 16, fontWeight: '500' },
    })
}
