import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Keyboard } from 'react-native'
import { useColors } from '@/contexts/ThemeContext'
import { ScreenWrapper } from '@/components/ScreenWrapper'
import { useEffect, useState, useMemo } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { getAllWorkers } from '@/api/endpoints/workers'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { cacheWorkers, getCachedWorkers } from '@/utils/db'
import * as SecureStore from 'expo-secure-store'

export default function Workers() {
  const Colors = useColors()
  const insets = useSafeAreaInsets()
  const [workers, setWorkers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  // NEW: Track if the user is currently typing to show/hide suggestions
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    const load = async () => {
        try {
            const res = await getAllWorkers()
            setWorkers(res.data)
            await cacheWorkers(res.data)
        } catch {
            const cached = await getCachedWorkers()
            setWorkers(cached)
        } finally {
            setLoading(false)
        }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return workers
    return workers.filter(w => {
      const fullName = w.first_name && w.last_name ? `${w.first_name} ${w.last_name}` : w.username || ''
      return fullName.toLowerCase().includes(q)
    })
  }, [workers, search])

  const styles = StyleSheet.create({
    center: {
      flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background,
    },
    searchContainer: {
      zIndex: 1, // Ensures the autocomplete dropdown sits above the scroll content if needed
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
      marginTop: 8,
      // Remove marginBottom here so it connects nicely to the dropdown
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      color: Colors.textPrimary,
    },
    // NEW: Autocomplete styles
    autocompleteBox: {
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      borderTopWidth: 0,
      borderBottomLeftRadius: 10,
      borderBottomRightRadius: 10,
      marginBottom: 12,
      overflow: 'hidden',
    },
    suggestionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: Colors.background,
      gap: 10,
    },
    suggestionText: {
      fontSize: 14,
      color: Colors.textPrimary,
    },
    // Spacer for when autocomplete is hidden
    spacer: {
      height: 12, 
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

  // Helper to determine the display name
  const getDisplayName = (w: any) => {
    return w.first_name && w.last_name ? `${w.first_name} ${w.last_name}` : w.username
  }

  return (
    <ScreenWrapper title="Workers" backRoute="/tabs/dashboard">
      <View style={styles.searchContainer}>
        <View style={[styles.searchRow, isFocused && search.length > 0 && { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }]}>
          <Ionicons name="search-outline" size={16} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name..."
            placeholderTextColor={Colors.textSecondary}
            value={search}
            onChangeText={setSearch}
            onFocus={() => setIsFocused(true)}
            // If they submit via keyboard return key, close the suggestions
            onSubmitEditing={() => setIsFocused(false)} 
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => {
              setSearch('')
              setIsFocused(true)
            }}>
              <Ionicons name="close-circle" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Autocomplete Dropdown */}
        {isFocused && search.length > 0 && filtered.length > 0 ? (
          <View style={styles.autocompleteBox}>
            {/* Show only top 4 suggestions to keep it compact */}
            {filtered.slice(0, 4).map(worker => (
              <TouchableOpacity
                key={`suggestion-${worker.id}`}
                style={styles.suggestionItem}
                onPress={() => {
                  setSearch(getDisplayName(worker)) // Fill the input
                  setIsFocused(false)               // Hide dropdown
                  Keyboard.dismiss()                // Drop the keyboard
                }}
              >
                <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.suggestionText}>{getDisplayName(worker)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.spacer} />
        )}
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        // IMPORTANT: This allows tapping suggestions without the first tap just closing the keyboard
        keyboardShouldPersistTaps="handled" 
        // Hide suggestions if the user starts scrolling the main list
        onScrollBeginDrag={() => setIsFocused(false)}
      >
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
                    {getDisplayName(worker)}
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