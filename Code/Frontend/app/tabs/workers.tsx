import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Keyboard, Share, Alert,
} from 'react-native'
import { useColors } from '@/contexts/ThemeContext'
import { ScreenWrapper } from '@/components/ScreenWrapper'
import { useCallback, useState, useMemo } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { router, useFocusEffect } from 'expo-router'
import { getAllWorkers } from '@/api/endpoints/workers'
import { generateInvite } from '@/api/endpoints/invite'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { cacheWorkers, getCachedWorkers } from '@/utils/db'
import * as SecureStore from 'expo-secure-store'
import { useNetwork } from '@/contexts/NetworkContext'

export default function Workers() {
  const Colors = useColors()
  const insets = useSafeAreaInsets()
  const [workers, setWorkers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isManager, setIsManager] = useState(false)
  const [inviting, setInviting] = useState(false)
  const { refreshCount } = useNetwork()

  useFocusEffect(useCallback(() => {
    const load = async () => {
      try {
        const userRaw = await SecureStore.getItemAsync('user')
        const user = userRaw ? JSON.parse(userRaw) : null
        if (user?.role === 'manager') setIsManager(true)
        const res = await getAllWorkers(user?.role === 'manager' ? user.id : undefined)
        setWorkers(res.data)
        setError(false)
        await cacheWorkers(res.data)
      } catch {
        const cached = await getCachedWorkers()
        if (cached.length > 0) {
          setWorkers(cached)
        } else {
          setError(true)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [refreshCount]))

  const getDisplayName = (w: any) =>
    w.first_name && w.last_name ? `${w.first_name} ${w.last_name}` : w.username

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return workers
    return workers.filter(w =>
      getDisplayName(w).toLowerCase().includes(q)
    )
  }, [workers, search])

  const showDropdown = isFocused && search.length > 0 && filtered.length > 0

  const styles = StyleSheet.create({
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors.background,
    },
    searchContainer: {
      zIndex: 1,
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
    },
    searchRowOpen: {
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      color: Colors.textPrimary,
    },
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
    errorText: {
      textAlign: 'center',
      color: Colors.textSecondary,
      marginTop: 40,
    },
    inviteBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: Colors.primary,
      borderRadius: 10,
      paddingVertical: 12,
      marginBottom: 12,
    },
    inviteBtnText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 15,
    },
  })

  const handleInvite = async () => {
    setInviting(true)
    try {
      const res = await generateInvite()
      const { token } = res.data
      await Share.share({
        message: `You've been invited to join the team. Use this code to register in the app:\n\n${token}`,
      })
    } catch {
      Alert.alert('Error', 'Could not generate invite link')
    } finally {
      setInviting(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  return (
    <ScreenWrapper title="Workers" backRoute="/tabs/dashboard">
      {isManager && (
        <TouchableOpacity style={[styles.inviteBtn, inviting && { opacity: 0.6 }]} onPress={handleInvite} disabled={inviting}>
          <Ionicons name="person-add-outline" size={18} color="#fff" />
          <Text style={styles.inviteBtnText}>{inviting ? 'Generating…' : 'Invite Worker'}</Text>
        </TouchableOpacity>
      )}
      <View style={styles.searchContainer}>
        <View style={[styles.searchRow, showDropdown && styles.searchRowOpen]}>
          <Ionicons name="search-outline" size={16} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name..."
            placeholderTextColor={Colors.textSecondary}
            value={search}
            onChangeText={setSearch}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onSubmitEditing={() => {
              setIsFocused(false)
              Keyboard.dismiss()
            }}
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

        {showDropdown ? (
          <View style={styles.autocompleteBox}>
            {filtered.slice(0, 4).map(worker => (
              <TouchableOpacity
                key={`suggestion-${worker.id}`}
                style={styles.suggestionItem}
                onPress={() => {
                  setSearch(getDisplayName(worker))
                  setIsFocused(false)
                  Keyboard.dismiss()
                }}
              >
                <Ionicons name="search-outline" size={14} color={Colors.textSecondary} />
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
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={() => setIsFocused(false)}
      >
        {error ? (
          <Text style={styles.errorText}>Could not load workers. Check your connection.</Text>
        ) : filtered.length === 0 ? (
          <Text style={styles.emptyText}>
            {search.length > 0 ? 'No workers match your search' : 'No workers found'}
          </Text>
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