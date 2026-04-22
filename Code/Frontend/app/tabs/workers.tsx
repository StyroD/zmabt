import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native'
import { useColors } from '@/contexts/ThemeContext'
import { ScreenWrapper } from '@/components/ScreenWrapper'
import { useEffect, useState, useMemo } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { getAllWorkers } from '@/api/endpoints/workers'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function Workers() {
  const Colors = useColors()
  const insets = useSafeAreaInsets()
  const [workers, setWorkers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getAllWorkers()
      .then(res => setWorkers(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return workers
    return workers.filter(w =>
      `${w.first_name} ${w.last_name}`.toLowerCase().includes(q) ||
      w.username?.toLowerCase().includes(q)
    )
  }, [workers, search])

  const styles = StyleSheet.create({
    center: {
      flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background,
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 12,
      marginTop: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      color: Colors.textPrimary,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
      gap: 12,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: Colors.background,
      borderWidth: 1,
      borderColor: Colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    info: {
      flex: 1,
      gap: 4,
    },
    name: {
      fontSize: 16,
      fontWeight: '500',
      color: Colors.textPrimary,
    },
    sub: {
      fontSize: 13,
      color: Colors.textSecondary,
    },
    badges: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 4,
    },
    badge: {
      backgroundColor: Colors.successBg,
      borderWidth: 1,
      borderColor: Colors.successBorder,
      borderRadius: 12,
      paddingVertical: 2,
      paddingHorizontal: 8,
    },
    badgeText: {
      fontSize: 11,
      color: Colors.success,
    },
    moreBadges: {
      fontSize: 11,
      color: Colors.textSecondary,
      alignSelf: 'center',
    },
    emptyText: {
      textAlign: 'center',
      color: Colors.textSecondary,
      fontStyle: 'italic',
      marginTop: 40,
    },
  })

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  return (
    <ScreenWrapper title="Workers" backRoute="/tabs/dashboard">
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={16} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name..."
          placeholderTextColor={Colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <Text style={styles.emptyText}>No workers found</Text>
        ) : (
          filtered.map(worker => {
            const accepted = (worker.certificates ?? []).filter((c: any) => c.status === 'accepted')
            return (
              <TouchableOpacity
                key={worker.id}
                style={styles.card}
                onPress={() => router.push(`/tabs/profile?userId=${worker.id}&mode=full`)}
              >
                <View style={styles.avatar}>
                  <Ionicons name="person-outline" size={22} color={Colors.textSecondary} />
                </View>
                <View style={styles.info}>
                  <Text style={styles.name} numberOfLines={1}>
                    {worker.first_name && worker.last_name
                      ? `${worker.first_name} ${worker.last_name}`
                      : worker.username}
                  </Text>
                  {worker.phone ? (
                    <Text style={styles.sub}>{worker.phone}</Text>
                  ) : null}
                  {accepted.length > 0 && (
                    <View style={styles.badges}>
                      {accepted.slice(0, 3).map((c: any, i: number) => (
                        <View key={i} style={styles.badge}>
                          <Text style={styles.badgeText}>{c.name}</Text>
                        </View>
                      ))}
                      {accepted.length > 3 && (
                        <Text style={styles.moreBadges}>+{accepted.length - 3}</Text>
                      )}
                    </View>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            )
          })
        )}
        <View style={{ height: Math.max(insets.bottom, 16) + 16 }} />
      </ScrollView>
    </ScreenWrapper>
  )
}
