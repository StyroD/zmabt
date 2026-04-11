import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { ScreenWrapper } from '@/components/ScreenWrapper'
import { ProfileField } from '@/components/Profile/ProfileField'
import { useEffect, useState } from 'react'
import { Colors } from '@/constants/color'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { CertificateRow } from '@/components/Profile/CertificateRow'
import { getUserById, getUsers } from '@/api/endpoints/users'
import { logout } from '@/api/auth'
import * as SecureStore from 'expo-secure-store'    
import { useLocalSearchParams } from 'expo-router'
import { ActivityIndicator } from 'react-native'

// mode = 'project'  → from project detail: limited view (name, hourly rate, certs)
// mode = 'full'     → from workers list: full info (address, emergency, etc.)
// mode = 'own'      → own profile: edit button in top right + logout

export default function WorkerProfile() {
    const { userId: paramUserId, projectId, mode } = useLocalSearchParams<{
        userId?: string
        projectId?: string
        mode?: 'project' | 'full' | 'own'
    }>()

    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const isOwn = mode === 'own' || !paramUserId
    const isFullView = mode === 'full'

    useEffect(() => {
        const load = async () => {
            if (paramUserId) {
                getUserById(paramUserId)
                    .then(res => { setUser(res.data); setLoading(false) })
                    .catch(err => { console.error(err); setLoading(false) })
            } else {
                getUsers()
                    .then(res => { setUser(res.data[0]); setLoading(false) })
                    .catch(err => { console.error(err); setLoading(false) })
            }
        }
        load()
    }, [paramUserId])


    const backRoute = projectId
        ? `/tabs/projectDetail_manager?id=${projectId}`
        : '/tabs/workers'

    if (loading) return <ActivityIndicator size="large" color={Colors.primary} style={{ flex: 1 }} />

    if (!user) {
        return (
            <ScreenWrapper title="Profile" backRoute={backRoute}>
                <Text style={{ color: Colors.textSecondary }}>No user found</Text>
            </ScreenWrapper>
        )
    }

    const certificates = user.certificates ?? []

    const editButton = isOwn ? (
        <TouchableOpacity onPress={() => router.push('/edit-profile' as any)}>
            <Ionicons name="pencil-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
    ) : undefined

    return (
        <ScreenWrapper title="Profile" backRoute={backRoute} rightElement={editButton}>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* Avatar */}
                <View style={styles.avatarSection}>
                    <Ionicons name="person-circle" size={90} color={Colors.border} />
                    <Text style={styles.fullName}>{user.title ? `${user.title} ` : ''}{user.first_name} {user.last_name}</Text>
                </View>

                {/* Basic info — always shown */}
                <Text style={styles.sectionLabel}>Basic info</Text>
                <View style={styles.fieldsSection}>
                    <ProfileField label="First name" value={user.first_name} />
                    <ProfileField label="Last name" value={user.last_name} />
                    <ProfileField label="Hourly rate" value={user.hourly_rate ? `${user.hourly_rate} ${user.currency ?? 'EUR'}/h` : '—'} />
                </View>

                {/* Full info — shown from workers list or own profile */}
                {(isFullView || isOwn) && (
                    <>
                        <View style={styles.sectionDivider} />
                        <Text style={styles.sectionLabel}>Contact</Text>
                        <View style={styles.fieldsSection}>
                            <ProfileField label="Phone" value={user.phone} />
                            <ProfileField label="Email" value={user.email} />
                            <ProfileField label="Address" value={user.address} />
                        </View>

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

                {/* Certificates — always shown */}
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
                                onShow={() => router.push('/tabs/certificates')}
                            />
                        ))
                    )}
                </View>

                {/* Logout — own profile only */}
                {isOwn && (
                    <>
                        <View style={styles.sectionDivider} />
                        <TouchableOpacity style={styles.logoutBtn} /*</>onPress={{handleLogout}}*/>
                            <Ionicons name="log-out-outline" size={18} color={Colors.danger} />
                            <Text style={styles.logoutText}>Log out</Text>
                        </TouchableOpacity>
                    </>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </ScreenWrapper>
    )
    
    const handleLogout = async () => {
        await SecureStore.deleteItemAsync('token')
        await SecureStore.deleteItemAsync('userId')
        router.push('/auth/login')
    }
    return (
    <ScreenWrapper title="Profile">
        <ScrollView showsVerticalScrollIndicator={false}>
            

            {/* Certificates */}
            <View style={styles.sectionDivider} />
            <Text style={styles.sectionLabel}>Certificates</Text>
            <View style={styles.certContainer}>
               {/* {certificates.map((cert) => (
                    <CertificateRow
                        key={cert.name}
                        name={cert.name}
                        certified={cert.certified}
                        onShow={() => router.push('/tabs/certificates')}
                    />
                ))}*/}
            </View>

            {/* Logout */}
            <View style={styles.sectionDivider} />
            <TouchableOpacity style={styles.logoutBtn}>
                <Ionicons name="log-out-outline" size={18} color={Colors.danger} onPress={handleLogout} />
                <Text style={styles.logoutText}>Log out</Text>
            </TouchableOpacity>

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
