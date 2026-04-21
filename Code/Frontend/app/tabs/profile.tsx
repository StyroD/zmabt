import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import { ScreenWrapper } from '@/components/ScreenWrapper'
import { ProfileField } from '@/components/Profile/ProfileField'
import { useEffect, useState } from 'react'
import { Colors } from '@/constants/color'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { CertificateRow } from '@/components/Profile/CertificateRow'
import { getUserById } from '@/api/endpoints/users'
import * as SecureStore from 'expo-secure-store'

// mode = 'project'  → from project detail: limited view (name, hourly rate, certs)
// mode = 'full'     → from workers list: full info (address, emergency, etc.)
// mode = 'own'      → own profile: edit button + logout

export default function Profile() {
    const { userId: paramUserId, projectId, mode } = useLocalSearchParams<{
        userId?: string
        projectId?: string
        mode?: 'project' | 'full' | 'own'
    }>()

    const [user, setUser] = useState<any>(null)
    const [role, setRole] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    const isOwn = mode === 'own' || !paramUserId
    const isFullView = mode === 'full'

    useEffect(() => {
        const load = async () => {
            try {
                const stored = await SecureStore.getItemAsync('user')
                const storedUser = stored ? JSON.parse(stored) : null
                setRole(storedUser?.role ?? null)

                const idToLoad = paramUserId ?? storedUser?.id
                if (idToLoad) {
                    const res = await getUserById(idToLoad)
                    setUser(res.data)
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [paramUserId])

    const handleLogout = async () => {
        await SecureStore.deleteItemAsync('token')
        await SecureStore.deleteItemAsync('userId')
        await SecureStore.deleteItemAsync('user')
        router.replace('/auth/login' as any)
    }

    const backRoute = projectId
        ? `/tabs/projectDetail_manager?id=${projectId}`
        : '/tabs/workers'

    const editButton = isOwn ? (
        <TouchableOpacity onPress={() => router.push('/edit-profile' as any)}>
            <Ionicons name="pencil-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
    ) : undefined

    if (loading) return <ActivityIndicator size="large" color={Colors.primary} style={{ flex: 1 }} />

    if (!user) {
        return (
            <ScreenWrapper title="Profile" backRoute={isOwn ? undefined : backRoute}>
                <Text style={{ color: Colors.textSecondary }}>No user found</Text>
            </ScreenWrapper>
        )
    }

    const certificates = user.certificates ?? []
    const isManager = role === 'manager'

    return (
        <ScreenWrapper title="Profile" backRoute={isOwn ? undefined : backRoute} rightElement={editButton}>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* Avatar */}
                <View style={styles.avatarSection}>
                    <Ionicons name="person-circle" size={90} color={Colors.border} />
                    <Text style={styles.fullName}>
                        {user.title ? `${user.title} ` : ''}{user.first_name} {user.last_name}
                    </Text>
                    <Text style={styles.roleLabel}>{isManager ? 'Manager' : 'Worker'}</Text>
                </View>

                {/* Basic info */}
                <Text style={styles.sectionLabel}>Basic info</Text>
                <View style={styles.fieldsSection}>
                    <ProfileField label="First name" value={user.first_name} />
                    <ProfileField label="Last name" value={user.last_name} />
                    {!isManager && (
                        <ProfileField label="Hourly rate" value={user.hourly_rate ? `${user.hourly_rate} ${user.currency ?? 'EUR'}/h` : '—'} />
                    )}
                </View>

                {/* Contact + Employment */}
                {(isFullView || isOwn) && (
                    <>
                        <View style={styles.sectionDivider} />
                        <Text style={styles.sectionLabel}>Contact</Text>
                        <View style={styles.fieldsSection}>
                            <ProfileField label="Phone" value={user.phone} />
                            <ProfileField label="Email" value={user.email} />
                            <ProfileField label="Address" value={user.address} />
                        </View>

                        {!isManager && (
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
                            </>
                        )}
                    </>
                )}

                {/* Certificates — workers only */}
                {!isManager && (
                    <>
                        <View style={styles.sectionDivider} />
                        <Text style={styles.sectionLabel}>Certificates</Text>
                        <View style={styles.certContainer}>
                            {certificates.length === 0 ? (
                                <Text style={styles.emptyText}>No certificates</Text>
                            ) : (
                                certificates.map((cert: any) => (
                                    <CertificateRow
                                        key={cert.id ?? cert.name}
                                        name={cert.category ?? cert.name}
                                        certified={cert.status === 'accepted' || cert.certified}
                                        onShow={() => router.push({
                                            pathname: '/tabs/certificate-list' as any,
                                            params: {
                                                categoryId: cert.category_id,
                                                categoryName: cert.category ?? cert.name,
                                                workerId: user.id,
                                            },
                                        })}
                                    />
                                ))
                            )}
                        </View>
                    </>
                )}

                {/* Logout — own profile only */}
                {isOwn && (
                    <>
                        <View style={styles.sectionDivider} />
                        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                            <Ionicons name="log-out-outline" size={18} color={Colors.danger} />
                            <Text style={styles.logoutText}>Log out</Text>
                        </TouchableOpacity>
                    </>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </ScreenWrapper>
    )
}

const styles = StyleSheet.create({
    avatarSection: {
        alignItems: 'center',
        paddingVertical: 20,
        gap: 6,
    },
    fullName: {
        fontSize: 18,
        fontWeight: '500',
        color: Colors.textPrimary,
    },
    roleLabel: {
        fontSize: 13,
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    fieldsSection: {
        gap: 12,
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
        minHeight: 48,
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 13,
        color: Colors.textSecondary,
        fontStyle: 'italic',
        paddingVertical: 12,
        textAlign: 'center',
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
