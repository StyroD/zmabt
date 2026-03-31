import {View, StyleSheet} from "react-native"
import { useState } from "react"
import { useLocalSearchParams } from "expo-router"
import { Alert } from "react-native"
import { ScreenWrapper } from "@/components/ScreenWrapper"
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'

const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
    })
    if (!result.canceled) {
        setFile(result.assets[0])
        setError('')
    }
}

const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
    })
    if (!result.canceled) {
        setFile(result.assets[0])
        setError('')
    }
}

const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
    })
    if (!result.canceled) {
        setFile(result.assets[0])
        setError('')
    }
}

export function UploadCertificatev (){
    const [file, setFile] = useState<any>(null)        
    const [certName, setCertName] = useState('')        
    const [error, setError] = useState('')              
    const [uploading, setUploading] = useState(false)   
    const { category } = useLocalSearchParams()
    Alert.alert('Upload Certificate', 'Choose source', [
        { text: 'Take photo', onPress: () => takePhoto() },
        { text: 'Choose from gallery', onPress: () => pickImage() },
        { text: 'Choose PDF', onPress: () => pickDocument() },
        { text: 'Cancel', style: 'cancel' }
    ])
    return(
        <ScreenWrapper title="${category} Certificate">
                <View>
                    <map>

                    </map>
                </View>
        </ScreenWrapper>
    )
}