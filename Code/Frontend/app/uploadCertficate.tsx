import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, ActivityIndicator, Alert, TextInput } from 'react-native'
import { useState } from 'react'
import { useLocalSearchParams, router } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import * as SecureStore from 'expo-secure-store'
import { Ionicons } from '@expo/vector-icons'
import { ScreenWrapper } from '@/components/ScreenWrapper'
import { Colors } from '@/constants/color'
import client from '@/api/client'

export default function UploadCertificate() {
    const { categoryId, categoryName, workerId: paramWorkerId } = useLocalSearchParams<{
        categoryId: string
        categoryName: string
        workerId?: string
    }>()

    const [file, setFile] = useState<any>(null)
    const [certName, setCertName] = useState('')
    const [modalVisible, setModalVisible] = useState(false)
    const [uploading, setUploading] = useState(false)

    const pickFromGallery = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            quality: 0.8,
        })
        if (!result.canceled) setFile(result.assets[0])
    }

    const takePhoto = async () => {
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: 'images',
            quality: 0.8,
        })
        if (!result.canceled) setFile(result.assets[0])
    }

    const pickDocument = async () => {
        const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' })
        if (!result.canceled) setFile(result.assets[0])
    }

    const handlePickPress = () => {
        Alert.alert('Choose source', undefined, [
            { text: 'Take photo', onPress: takePhoto },
            { text: 'Gallery', onPress: pickFromGallery },
            { text: 'PDF document', onPress: pickDocument },
            { text: 'Cancel', style: 'cancel' },
        ])
    }

    const handleUpload = async () => {
        if (!file) {
            Alert.alert('No file selected')
            return
        }
        setModalVisible(true)
    }

    const confirmUpload = async () => {
        setModalVisible(false)
        setUploading(true)
        try {
            const stored = await SecureStore.getItemAsync('user')
            const storedUser = stored ? JSON.parse(stored) : null
            const workerId = paramWorkerId ?? storedUser?.id

            const form = new FormData()
            form.append('worker_id', workerId)
            form.append('category_id', categoryId)
            form.append('name', certName.trim() || `${categoryName} - osvedcenie`)
            const isPdf = file.mimeType === 'application/pdf' || file.name?.endsWith('.pdf')
            form.append('file', {
                uri: file.uri,
                name: file.name ?? `cert_${Date.now()}.${isPdf ? 'pdf' : 'jpg'}`,
                type: file.mimeType ?? (isPdf ? 'application/pdf' : 'image/jpeg'),
            } as any)

            await client.post('/uploads/certificate', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })

            Alert.alert('Success', 'Certificate submitted for review')
            router.back()
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.error ?? 'Upload failed')
        } finally {
            setUploading(false)
        }
    }

    const isPdf = file?.mimeType === 'application/pdf' || file?.name?.endsWith('.pdf')

    return (
        <ScreenWrapper title="Certificates" backRoute="..">
            <Text style={styles.infoText}>Upload your proof of skill for manager review.</Text>
            <Text style={styles.senderName}>{categoryName}</Text>

            <TextInput
                style={styles.nameInput}
                placeholder="Certificate name"
                placeholderTextColor={Colors.textSecondary}
                value={certName}
                onChangeText={setCertName}
            />

            {/* Upload area */}
            <TouchableOpacity style={styles.uploadArea} onPress={handlePickPress}>
                {file ? (
                    isPdf ? (
                        <View style={styles.pdfPreview}>
                            <Ionicons name="document-text" size={48} color={Colors.primary} />
                            <Text style={styles.pdfName} numberOfLines={2}>{file.name}</Text>
                        </View>
                    ) : (
                        <Image source={{ uri: file.uri }} style={styles.previewImage} resizeMode="contain" />
                    )
                ) : (
                    <Ionicons name="add" size={48} color={Colors.textSecondary} />
                )}
            </TouchableOpacity>

            {/* Submit button */}
            <TouchableOpacity
                style={[styles.submitBtn, !file && styles.submitBtnDisabled]}
                onPress={handleUpload}
                disabled={!file || uploading}
            >
                {uploading ? (
                    <ActivityIndicator color={Colors.textPrimary} />
                ) : (
                    <Text style={styles.submitText}>Submit</Text>
                )}
            </TouchableOpacity>

            {/* Confirmation modal */}
            <Modal visible={modalVisible} transparent animationType="fade">
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <Text style={styles.modalTitle}>Are you sure you want to proceed?</Text>
                        <Text style={styles.modalBody}>
                            Physical copy must be also submitted to the office no later than 30 days from approval
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.continueBtn} onPress={confirmUpload}>
                                <Ionicons name="checkmark" size={16} color={Colors.textPrimary} />
                                <Text style={styles.btnText}>Continue</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={16} color={Colors.textPrimary} />
                                <Text style={styles.btnText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScreenWrapper>
    )
}

const styles = StyleSheet.create({
    infoText: {
        color: Colors.textSecondary,
        fontSize: 13,
        marginBottom: 6,
    },
    senderName: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 12,
    },
    nameInput: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 10,
        padding: 12,
        fontSize: 15,
        color: Colors.textPrimary,
        marginBottom: 16,
    },
    uploadArea: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 280,
        marginBottom: 20,
    },
    previewImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    pdfPreview: {
        alignItems: 'center',
        gap: 12,
        padding: 20,
    },
    pdfName: {
        color: Colors.textPrimary,
        textAlign: 'center',
        fontSize: 14,
    },
    submitBtn: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    submitBtnDisabled: {
        opacity: 0.4,
    },
    submitText: {
        color: Colors.textPrimary,
        fontWeight: '600',
        fontSize: 16,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modal: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 24,
        width: '100%',
        gap: 16,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '600',
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    modalBody: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 4,
    },
    continueBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 10,
        padding: 12,
    },
    cancelBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 10,
        padding: 12,
    },
    btnText: {
        color: Colors.textPrimary,
        fontWeight: '500',
    },
})
