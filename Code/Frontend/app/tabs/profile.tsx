import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import {ScreenWrapper} from '@/components/ScreenWrapper'
import {ProfileField} from '@/components/Profile/ProfileField'
import {useState } from "react"
import {Colors} from '@/constants/color' 
import {Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { CertificateRow } from '@/components/Profile/CertificateRow'
import { ScrollView } from 'react-native'



export default function Profile(){
    //const [currentUser, setCurrentUser] = useState<any>(null)
    const [currentUser, setCurrentUser] = useState<any>({
        title: 'Mr',
    first_name: 'Peter',
    last_name: 'Novak',
    hourly_rate: '25',
    });
    const certificates = [
    { name: 'Water', certified: true },
    { name: 'Heating', certified: true },
    { name: 'Electricity', certified: true },
    { name: 'Gas', certified: false },
    ];
    if (!currentUser) {
    return (
        <ScreenWrapper title="Profile">
            <Text>No user found</Text>
        </ScreenWrapper>
    )
}
    return (
    <ScreenWrapper title="Profile">
        <ScrollView showsVerticalScrollIndicator={false}>
            
            {/* Avatar + edit */}
            <View style={styles.avatarSection}>
                <Ionicons name="person-circle" size={90} color={Colors.border} />
                <TouchableOpacity style={styles.editButton} onPress={() => router.push('/edit-profile' as any)}>
                    <Ionicons name="pencil" size={14} color={Colors.primary} />
                    <Text style={styles.editText}>Edit profile</Text>
                </TouchableOpacity>
            </View>

            {/* Fields */}
            <View style={styles.fieldsSection}>
                <ProfileField label="Title" value={currentUser.title} />
                <ProfileField label="First name" value={currentUser.first_name} />
                <ProfileField label="Last name" value={currentUser.last_name} />
                <ProfileField label="Hourly rate" value={`${currentUser.hourly_rate} €/h`} />
            </View>

            {/* Certificates */}
            <View style={styles.sectionDivider} />
            <Text style={styles.sectionLabel}>Certificates</Text>
            <View style={styles.certContainer}>
                {certificates.map((cert) => (
                    <CertificateRow
                        key={cert.name}
                        name={cert.name}
                        certified={cert.certified}
                        onShow={() => router.push('/tabs/certificates')}
                    />
                ))}
            </View>

            {/* Logout */}
            <View style={styles.sectionDivider} />
            <TouchableOpacity style={styles.logoutBtn}>
                <Ionicons name="log-out-outline" size={18} color={Colors.danger} />
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
        gap: 10,
    },
    editButton: {
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
    editText: {
        color: Colors.primary,
        fontSize: 13,
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

