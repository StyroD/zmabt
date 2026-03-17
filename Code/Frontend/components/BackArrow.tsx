import AntDesign from '@expo/vector-icons/AntDesign';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/color';

export function BackArrow(){
    return(
        <View style={styles.box}>
            <AntDesign name="arrow-left" size={24} color={Colors.surface} />
        </View>
    )
}

const styles = StyleSheet.create({
    box:{
        width: 70,
        backgroundColor: Colors.primary,
        borderColor: Colors.border,
        borderWidth: 0.5,
        borderRadius: 10,
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center'
    }
})