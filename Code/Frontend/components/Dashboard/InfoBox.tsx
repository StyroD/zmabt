import { View, StyleSheet, Text, TouchableOpacity } from "react-native"
import { Colors } from "@/constants/color"

type ManagerProps = {
    isManager: true;
    totaljobs: number;
    activejobs: number;
    pendingjobs: number;
    workers: number;
}

type WorkerProps = {
    isManager: false;
    activejobs: number;
    certificates: number;
}

type Props = ManagerProps | WorkerProps

export function InfoBox(props: Props) {
    return (
        <View style={styles.wrapper}>
            {props.isManager ? (
                <>
                    <View style={styles.container}>
                        <View style={styles.stat}>
                            <Text style={styles.label}>Active jobs</Text>
                            <Text style={styles.value}>{props.activejobs}/{props.totaljobs}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.stat}>
                            <Text style={styles.label}>Pending jobs</Text>
                            <Text style={styles.value}>{props.pendingjobs}/{props.totaljobs}</Text>
                        </View>
                        <TouchableOpacity style={styles.button}>
                            <Text style={styles.buttonText}>Detail</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.container}>
                        <View style={styles.stat}>
                            <Text style={styles.label}>Workers</Text>
                            <Text style={styles.value}>{props.workers}</Text>
                        </View>
                        <TouchableOpacity style={styles.button}>
                            <Text style={styles.buttonText}>Detail</Text>
                        </TouchableOpacity>
                    </View>
                </>
            ) : (
                <>
                    <View style={styles.container}>
                        <View style={styles.stat}>
                            <Text style={styles.label}>Active jobs</Text>
                            <Text style={styles.value}>{props.activejobs}</Text>
                        </View>
                        <TouchableOpacity style={styles.button}>
                            <Text style={styles.buttonText}>Detail</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.container}>
                        <View style={styles.stat}>
                            <Text style={styles.label}>Certificates</Text>
                            <Text style={styles.value}>{props.certificates}</Text>
                        </View>
                        <TouchableOpacity style={styles.button}>
                            <Text style={styles.buttonText}>Detail</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        gap: 12,
        marginTop: 12,
    },
    container: {
        backgroundColor: Colors.surface,
        marginHorizontal: 10,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 12,
        alignSelf: 'stretch',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        gap: 16,
    },
    stat: {
        flex: 1,
    },
    label: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginBottom: 4,
    },
    value: {
        fontSize: 28,
        fontWeight: '500',
        color: Colors.textPrimary,
    },
    divider: {
        width: 1,
        height: '100%',
        backgroundColor: Colors.border,
    },
    button: {
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 14,
    },
    buttonText: {
        fontSize: 13,
        color: Colors.textPrimary,
    }
})