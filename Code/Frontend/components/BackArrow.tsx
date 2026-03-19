import AntDesign from '@expo/vector-icons/AntDesign';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/color';

type Props = {
    onBackButton: () => void;
}

export function BackArrow({ onBackButton }: Props) {
    return (
        <TouchableOpacity onPress={onBackButton} style={styles.box} activeOpacity={0.7}>
            <AntDesign name="arrow-left" size={20} color={Colors.primary} />
        </TouchableOpacity>
    )
}

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
    }
})