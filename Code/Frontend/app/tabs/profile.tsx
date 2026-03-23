import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import {ScreenWrapper} from '@/components/ScreenWrapper'
import {ProfileField} from '@/components/Profile/ProfileField'
import {useState } from "react"
import {Colors} from '@/constants/color' 
import {Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { CertificateRow } from '@/components/Profile/CertificateRow'



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
            <TouchableOpacity style = {styles.editProfile}>
                <Text style = {styles.editProfileText}> Edit profile</Text>
                <Ionicons name='pencil' style = {styles.editProfile}></Ionicons>
            </TouchableOpacity>
            <View style = {styles.photoContainer}>
                <Ionicons name="person-circle" size={100} color={Colors.border} />
            </View>
            <ProfileField label="title" value={currentUser.title}></ProfileField>
            <ProfileField label="First Name" value={currentUser.first_name}></ProfileField>
            <ProfileField label="Last Name" value={currentUser.last_name}></ProfileField>
            <ProfileField label="Hourly rate" value={currentUser.hourly_rate}></ProfileField>
            {certificates.map((cert) => (
                <CertificateRow 
                    key={cert.name}
                    name={cert.name}
                    certified={cert.certified}
                    onShow={() => router.push('/tabs/certificates')}
                />
            ))}
            <View style={styles.logout}>
                <TouchableOpacity style={styles.logoutTog}>
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
            </View>
        </ScreenWrapper>
    )
}

const styles = StyleSheet.create({
    photoContainer: {
    alignItems: 'center',
    marginBottom: 16,
    },
    editProfile: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    editProfileText: {
        color: Colors.textSecondary,
        textDecorationLine: 'underline',
    },
    certificats: {
        padding: 25,
    },
    logout: {
            color : Colors.textSecondary,
            alignItems: 'center',
            width: '100%',
            alignContent: 'center',
            padding: 50
        },
    logoutText: {
            color: Colors.textSecondary,
            alignContent: 'center',
            fontSize: 30
    },
    logoutTog:{
        backgroundColor: Colors.surface,
        borderWidth: 1,
        width : '50%',
        alignItems: 'center',
        shadowRadius: 4,
        borderRadius: 50,
    }
})

