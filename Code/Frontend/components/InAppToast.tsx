import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { toastSignal, type ToastPayload } from '@/utils/toastSignal';
import { useColors } from '@/contexts/ThemeContext';

function getRouteFromData(data: Record<string, any>): string {
    const { type, projectId, senderId, senderName } = data ?? {};
    switch (type) {
        case 'task_assigned':
        case 'task_done':
            return projectId ? `/tabs/task-list?projectId=${projectId}&projectTitle=Tasks` : '/tabs/projectsList';
        case 'certificate_submitted':
            return '/tabs/workers';
        case 'certificate_reviewed':
            return '/tabs/certificate-list';
        case 'worker_assigned':
            return projectId ? `/tabs/projectDetail_worker?id=${projectId}` : '/tabs/projectsList';
        case 'worker_removed':
            return '/tabs/projectsList';
        case 'message':
            return senderId ? `/chatDetail?userId=${senderId}&name=${encodeURIComponent(senderName ?? '')}` : '/tabs/chat';
        default:
            return '/tabs/dashboard';
    }
}

const SLIDE_DURATION = 250;
const VISIBLE_DURATION = 3500;

export function InAppToast() {
    const Colors = useColors();
    const insets = useSafeAreaInsets();
    const [toast, setToast] = useState<ToastPayload | null>(null);
    const translateY = useRef(new Animated.Value(-120)).current;
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const dismiss = (toastRef: Animated.Value) => {
        Animated.timing(toastRef, {
            toValue: -120,
            duration: SLIDE_DURATION,
            useNativeDriver: true,
        }).start(() => setToast(null));
    };

    useEffect(() => {
        return toastSignal.subscribe(payload => {
            if (timerRef.current) clearTimeout(timerRef.current);
            translateY.setValue(-120);
            setToast(payload);

            Animated.timing(translateY, {
                toValue: 0,
                duration: SLIDE_DURATION,
                useNativeDriver: true,
            }).start(() => {
                timerRef.current = setTimeout(() => dismiss(translateY), VISIBLE_DURATION);
            });
        });
    }, []);

    if (!toast) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                { top: insets.top + 8, transform: [{ translateY }] },
                { backgroundColor: Colors.surface, borderColor: Colors.border },
            ]}
        >
            <Pressable
                style={styles.inner}
                onPress={() => {
                    if (timerRef.current) clearTimeout(timerRef.current);
                    dismiss(translateY);
                    if (toast.data?.type !== 'connectivity') {
                        router.push(getRouteFromData(toast.data) as any);
                    }
                }}
            >
                <View style={[styles.accent, { backgroundColor: Colors.primary }]} />
                <View style={styles.textBlock}>
                    <Text style={[styles.title, { color: Colors.textPrimary }]} numberOfLines={1}>
                        {toast.title}
                    </Text>
                    <Text style={[styles.body, { color: Colors.textSecondary }]} numberOfLines={2}>
                        {toast.body}
                    </Text>
                </View>
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 12,
        right: 12,
        borderRadius: 12,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 9999,
        overflow: 'hidden',
    },
    inner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 14,
        gap: 10,
    },
    accent: {
        width: 3,
        alignSelf: 'stretch',
        borderRadius: 2,
    },
    textBlock: {
        flex: 1,
        gap: 2,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
    },
    body: {
        fontSize: 13,
    },
});
