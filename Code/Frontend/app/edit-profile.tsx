import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image, Switch } from 'react-native'
import { ScreenWrapper } from '@/components/ScreenWrapper'
import { useEffect, useState } from 'react'
import { useColors, useTheme } from '@/contexts/ThemeContext'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { updateProfileWithAvatar } from '@/api/endpoints/users'
import { getCategories } from '@/api/endpoints/categories'
import * as SecureStore from 'expo-secure-store'
import * as ImagePicker from 'expo-image-picker'

export default function EditProfile() {
    const Colors = useColors()
    const { theme, toggleTheme } = useTheme()
    const [userId, setUserId] = useState<string | null>(null)
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [hourlyRate, setHourlyRate] = useState('')
    const [avatarUri, setAvatarUri] = useState<string | null>(null)
    const [categories, setCategories] = useState<any[]>([])
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const load = async () => {
            try {
                const stored = await SecureStore.getItemAsync('user')
                const user = stored ? JSON.parse(stored) : null
                if (user) {
                    setUserId(user.id)
                    setFirstName(user.first_name ?? '')
                    setLastName(user.last_name ?? '')
                    setHourlyRate(user.hourly_rate?.toString() ?? '')
                }
                const catRes = await getCategories()
                setCategories(catRes.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

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
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        })
        if (!result.canceled) setAvatarUri(result.assets[0].uri)
    }

    const handleSave = async () => {
        if (!validate() || !userId) return
        setSaving(true)
        try {
            const res = await updateProfileWithAvatar(userId, {
                first_name: firstName,
                last_name: lastName,
                hourly_rate: hourlyRate ? Number(hourlyRate) : undefined,
            }, avatarUri ?? undefined)
            const stored = await SecureStore.getItemAsync('user')
            const user = stored ? JSON.parse(stored) : {}
            await SecureStore.setItemAsync('user', JSON.stringify({ ...user, ...res }))
            router.back()
        } catch {
            Alert.alert('Error', 'Could not save profile. Please try again.')
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

    const styles = StyleSheet.create({
        avatarSection: {
            alignItems: 'center',
            paddingVertical: 20,
            gap: 10,
        },
        avatarImage: {
            width: 90,
            height: 90,
            borderRadius: 45,
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
            color: Colors.primary,
            textDecorationLine: 'underline',
            fontSize: 14,
        },
        themeRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: Colors.surface,
            borderWidth: 1,
            borderColor: Colors.border,
            borderRadius: 12,
            padding: 16,
        },
        themeLabel: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
        },
        themeLabelText: {
            fontSize: 15,
            color: Colors.textPrimary,
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

    if (loading) return <ActivityIndicator size="large" color={Colors.primary} style={{ flex: 1 }} />

    return (
        <ScreenWrapper title="Edit profile" backRoute=".." rightElement={saveButton}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

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

                <Text style={styles.fieldLabel}>Hourly rate (EUR/h)</Text>
                <TextInput
                    style={[styles.input, errors.hourlyRate && styles.inputError]}
                    placeholder="e.g. 25"
                    placeholderTextColor={Colors.textSecondary}
                    value={hourlyRate}
                    onChangeText={t => { setHourlyRate(t); setErrors(e => ({ ...e, hourlyRate: '' })) }}
                    keyboardType="numeric"
                />
                {errors.hourlyRate && <Text style={styles.errorText}>{errors.hourlyRate}</Text>}

                <View style={styles.sectionDivider} />
                <Text style={styles.sectionLabel}>Appearance</Text>
                <View style={styles.themeRow}>
                    <View style={styles.themeLabel}>
                        <Ionicons
                            name={theme === 'dark' ? 'moon-outline' : 'sunny-outline'}
                            size={20}
                            color={Colors.textPrimary}
                        />
                        <Text style={styles.themeLabelText}>
                            {theme === 'dark' ? 'Dark mode' : 'Light mode'}
                        </Text>
                    </View>
                    <Switch
                        value={theme === 'dark'}
                        onValueChange={toggleTheme}
                        trackColor={{ false: Colors.border, true: Colors.primary }}
                        thumbColor={Colors.surface}
                    />
                </View>

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
