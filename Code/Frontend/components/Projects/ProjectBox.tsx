import { View, StyleSheet, Text, TouchableOpacity } from 'react-native'
import { useState } from 'react'
import { Colors } from '@/constants/color'
import AntDesign from '@expo/vector-icons/AntDesign'
import { router } from 'expo-router'


type Props = {
    onProjectDetail: () => void
}

export function ProjectBox(props: Props) {
    const [expanded, setExpanded] = useState(false)

    return (
        <TouchableOpacity style={styles.box} onPress={() => setExpanded(!expanded)}>
            <View style={styles.row}>
                <Text style={styles.title}>Project name</Text>
                {!expanded && (
                    <TouchableOpacity onPress={(e) => {
                        e.stopPropagation()
                        props.onProjectDetail()
                    }}>
                        <AntDesign name="arrow-right" size={16} color={Colors.textSecondary} />
                    </TouchableOpacity>
                )}

            </View>

            {expanded && (
                <View>
                    <View style={styles.details}>
                        <Text style={styles.detail}>Status: In Progress</Text>
                        <Text style={styles.detail}>Deadline: 2026-08-01</Text>
                        <Text style={styles.detail}>Client: Slovak Reality s.r.o.</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={(e) => {
                            e.stopPropagation()
                            props.onProjectDetail()
                        }}
                    >
                        <Text style={styles.buttonText}>Detail</Text>
                    </TouchableOpacity>
                </View>

            )}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    box: {
        backgroundColor: Colors.surface,
        alignSelf: 'stretch',
        marginTop: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: Colors.textPrimary,
    },
    details: {
        marginTop: 12,
        gap: 6,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        paddingTop: 12,
    },
    detail: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    button: {
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 14,
        alignSelf: 'flex-end',
        marginTop: 12
    },
    buttonText: {
        fontSize: 13,
        color: Colors.primary,
    }
})