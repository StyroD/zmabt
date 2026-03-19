import { View, Text, StyleSheet } from 'react-native'
import { Colors } from '@/constants/color'
import { BackArrow } from '@/components/BackArrow'
import { router } from 'expo-router'

type Props = {
  title: string
  children: React.ReactNode
  backRoute?: string
  rightElement?: React.ReactNode
}

export function ScreenWrapper({ title, children, backRoute, rightElement }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {backRoute ? (
          <BackArrow onBackButton={() => router.push(backRoute as any)} />
        ) : (
          <View style={styles.placeholder} />
        )}
        <Text style={styles.title}>{title}</Text>
        <View style={styles.placeholder}>
          {rightElement}
        </View>
      </View>
      <View style={styles.divider} />
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.background,
        flex: 1,
        padding: 16,
        paddingTop: 56,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    placeholder: {
        width: 40,
    },
    title: {
        fontSize: 20,
        fontWeight: '500',
        color: Colors.textPrimary,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginTop: 8,
    },
})