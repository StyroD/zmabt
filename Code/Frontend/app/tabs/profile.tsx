import { View, Text, StyleSheet, Image } from 'react-native'
import {ScreenWrapper} from '@/components/ScreenWrapper'
import {ProfileField} from '@/components/Profile/ProfileField'
import {useState } from "react"
import {Colors} from '@/constants/color' 
import { Ionicons } from '@expo/vector-icons'



export default function Profile(){
    //const [currentUser, setCurrentUser] = useState<any>(null)
    const [currentUser, setCurrentUser] = useState<any>({
    first_name: 'Peter',
    last_name: 'Novak',
    hourly_rate: '25',
})
    if (!currentUser) {
    return (
        <ScreenWrapper title="Profile">
            <Text>No user found</Text>
        </ScreenWrapper>
    )
}
    return (
        <ScreenWrapper title="Profile">
            <View style={styles.photoContainer}>
                <Ionicons name="person-circle" size={100} color={Colors.border} />
            </View>
            <ProfileField label="title" value={currentUser.title}></ProfileField>
            <ProfileField label="First Name" value={currentUser.first_name}></ProfileField>
            <ProfileField label="Last Name" value={currentUser.last_name}></ProfileField>
            <ProfileField label="Hourly rate" value={currentUser.hourly_rate}></ProfileField>
            
        </ScreenWrapper>
    )
}

const styles = StyleSheet.create({
    photoContainer: {
    alignItems: 'center',
    marginBottom: 16,
}
})

