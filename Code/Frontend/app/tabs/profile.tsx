import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native'
import { ScreenWrapper } from '@/components/ScreenWrapper'
import { ProfileField } from '@/components/Profile/ProfileField'
import { useCallback, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { useColors } from '@/contexts/ThemeContext'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { CertificateRow } from '@/components/Profile/CertificateRow'
import { getUserById } from '@/api/endpoints/users'
import * as SecureStore from 'expo-secure-store'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { getAvatarUrl } from '@/api/endpoints/users'

export default function Profile() {
    const Colors = useColors()
    const insets = useSafeAreaInsets()
    const { userId: paramUserId, projectId, mode, source } = useLocalSearchParams<{
        userId?: string
        projectId?: string
        mode?: 'project' | 'full' | 'own'
        source?: 'worker_project' | 'manager_project' | 'workers'
    }>()

    
    const [user, setUser] = useState<any>(null)
    const [viewerRole, setViewerRole] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    const isOwn = mode === 'own' || !paramUserId
    const isFullView = mode === 'full'

    useFocusEffect(useCallback(() => {
        let active = true
        const load = async () => {
            try {
                const stored = await SecureStore.getItemAsync('user')
                const storedUser = stored ? JSON.parse(stored) : null
                if (!active) return
                setViewerRole(storedUser?.role ?? null)

                const idToLoad = paramUserId ?? storedUser?.id
                if (idToLoad) {
                    try {
                        const res = await getUserById(idToLoad)
                        if (!active) return
                        setUser(res.data)
                    } catch {
                        if (!active) return
                        if (storedUser) setUser(storedUser)
                    }
                }
            } catch (err) {
                console.error(err)
            } finally {
                if (active) setLoading(false)
            }
        }
        load()
        return () => { active = false }
    }, [paramUserId]))

    const handleLogout = async () => {
        await SecureStore.deleteItemAsync('token')
        await SecureStore.deleteItemAsync('userId')
        await SecureStore.deleteItemAsync('user')
        router.replace('/auth/login' as any)
    }

    const backRoute = source === 'worker_project' && projectId
        ? `/tabs/projectDetail_worker?id=${projectId}`
        : projectId
        ? `/tabs/projectDetail_manager?id=${projectId}`
        : '/tabs/workers'

    const editButton = isOwn ? (
        <TouchableOpacity onPress={() => router.push('/edit-profile' as any)}>
            <Ionicons name="pencil-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
    ) : undefined

    const styles = StyleSheet.create({
        avatarSection: { alignItems: 'center', paddingVertical: 20, gap: 6 },
        fullName: { fontSize: 18, fontWeight: '500', color: Colors.textPrimary },
        roleLabel: { fontSize: 13, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
        fieldsSection: { gap: 12 },
        sectionDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 20 },
        sectionLabel: { fontSize: 13, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
        certContainer: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 16, minHeight: 48, justifyContent: 'center' },
        emptyText: { fontSize: 13, color: Colors.textSecondary, fontStyle: 'italic', paddingVertical: 12, textAlign: 'center' },
        logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: Colors.dangerBorder, backgroundColor: Colors.dangerBg, borderRadius: 12, padding: 14 },
        logoutText: { color: Colors.danger, fontSize: 16, fontWeight: '500' },
    })

    if (loading) return <ActivityIndicator size="large" color={Colors.primary} style={{ flex: 1 }} />

    
    if (!user) {
        return (
            <ScreenWrapper title="Profile" backRoute={isOwn ? undefined : backRoute}>
                <Text style={{ color: Colors.textSecondary, marginBottom: 20 }}>
                    Could not load profile. You may be offline.
                </Text>
                {isOwn && (
                    <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={18} color={Colors.danger} />
                        <Text style={styles.logoutText}>Log out</Text>
                    </TouchableOpacity>
                )}
            </ScreenWrapper>
        )
    }

    const certificates = user.certificates ?? []
    const viewedUserIsManager = user.role === 'manager'
    const viewerIsManager = viewerRole === 'manager'
    const canSeeHourlyRate = isOwn || (!viewedUserIsManager && viewerIsManager)

    const groupedCerts = Object.values(
        certificates.reduce((acc: any, cert: any) => {
            const key = cert.category_id
            if (!acc[key]) {
                acc[key] = {
                    category_id: cert.category_id,
                    category: cert.category ?? cert.name,
                    certified: false,
                }
            }
            if (cert.status === 'accepted') {
                acc[key].certified = true
            }
            return acc
        }, {})
    )
    return (
        <ScreenWrapper title="Profile" backRoute={isOwn ? undefined : backRoute} rightElement={editButton}>
            <ScrollView showsVerticalScrollIndicator={false}>

                <View style={styles.avatarSection}>
                    {user.has_avatar
                        ? <Image
                            source={{ uri: getAvatarUrl(user.id) }}
                            style={{ width: 90, height: 90, borderRadius: 45 }}
                            onError={(e) => console.log('avatar error:', e.nativeEvent.error)}
                        />
                        : <Ionicons name="person-circle" size={90} color={Colors.border} />
                    }
                    <Text style={styles.fullName}>
                        {user.title ? `${user.title} ` : ''}{user.first_name} {user.last_name}
                    </Text>
                    <Text style={styles.roleLabel}>{viewedUserIsManager ? 'Manager' : 'Worker'}</Text>
                </View>

                <Text style={styles.sectionLabel}>Basic info</Text>
                <View style={styles.fieldsSection}>
                    {user.title ? <ProfileField label="Title" value={user.title} /> : null}
                    <ProfileField label="First name" value={user.first_name} />
                    <ProfileField label="Last name" value={user.last_name} />
                    {canSeeHourlyRate && (
                        <ProfileField label="Hourly rate" value={user.hourly_rate ? `${user.hourly_rate} ${user.currency ?? 'EUR'}/h` : '—'} />
                    )}
                </View>

                {(isFullView || isOwn) && (
                    <>
                        <View style={styles.sectionDivider} />
                        <Text style={styles.sectionLabel}>Contact</Text>
                        <View style={styles.fieldsSection}>
                            <ProfileField label="Phone" value={user.phone} />
                            <ProfileField label="Email" value={user.email} />
                            <ProfileField label="Address" value={user.address} />
                        </View>

                        {(isOwn || !viewedUserIsManager) && (
                            <>
                                <View style={styles.sectionDivider} />
                                <Text style={styles.sectionLabel}>Employment</Text>
                                <View style={styles.fieldsSection}>
                                    <ProfileField label="Employment type" value={user.employment_type} />
                                    <ProfileField label="Hired at" value={user.hired_at ? new Date(user.hired_at).toLocaleDateString('sk-SK') : '—'} />
                                    <ProfileField label="Monthly salary" value={user.monthly_salary ? `${user.monthly_salary} ${user.currency ?? 'EUR'}` : '—'} />
                                    <ProfileField label="IBAN" value={user.iban} />
                                </View>

                                <View style={styles.sectionDivider} />
                                <Text style={styles.sectionLabel}>Emergency contact</Text>
                                <View style={styles.fieldsSection}>
                                    <ProfileField label="Name" value={user.emergency_contact_name} />
                                    <ProfileField label="Phone" value={user.emergency_contact_phone} />
                                </View>

                                {user.notes ? (
                                    <>
                                        <View style={styles.sectionDivider} />
                                        <Text style={styles.sectionLabel}>Notes</Text>
                                        <View style={styles.fieldsSection}>
                                            <ProfileField label="Notes" value={user.notes} />
                                        </View>
                                    </>
                                ) : null}
                            </>
                        )}
                    </>
                )}

                {!viewedUserIsManager && (
                    <>
                        <View style={styles.sectionDivider} />
                        <Text style={styles.sectionLabel}>Certificates</Text>
                        <View style={styles.certContainer}>
                            {groupedCerts.length === 0 ? (
                                <Text style={styles.emptyText}>No certificates</Text>
                            ) : (
                                groupedCerts.map((cert: any) => (
                                    <CertificateRow
                                        key={cert.category_id}
                                        name={cert.category}
                                        certified={cert.certified}
                                        onShow={() => router.push({
                                            pathname: '/tabs/certificate-list' as any,
                                            params: {
                                                categoryId: cert.category_id,
                                                categoryName: cert.category,
                                                workerId: user.id,
                                            },
                                        })}
                                    />
                                ))
                            )}
                        </View>
                    </>
                )}

                {isOwn && (
                    <>
                        <View style={styles.sectionDivider} />
                        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                            <Ionicons name="log-out-outline" size={18} color={Colors.danger} />
                            <Text style={styles.logoutText}>Log out</Text>
                        </TouchableOpacity>
                    </>
                )}

                <View style={{ height: Math.max(insets.bottom, 16) + 16 }} />
            </ScrollView>
        </ScreenWrapper>
    )
}