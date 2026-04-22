import AntDesign from '@expo/vector-icons/AntDesign'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { useColors } from '@/contexts/ThemeContext'

type Props = {
    onBackButton: () => void
}

export function BackArrow({ onBackButton }: Props) {
    const Colors = useColors()
    const styles = StyleSheet.create({
        box: {
            width: 40,
            height: 40,
            backgroundColor: Colors.surface,
            borderColor: Colors.border,
            borderWidth: 1,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
        },
    })
    return (
        <TouchableOpacity onPress={onBackButton} style={styles.box} activeOpacity={0.7}>
            <AntDesign name="arrow-left" size={20} color={Colors.primary} />
        </TouchableOpacity>
    )
}
