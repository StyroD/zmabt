import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import MapView, { Marker, Callout, Region } from 'react-native-maps'
import { useColors } from '@/contexts/ThemeContext'
import { useEffect, useRef, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import * as SecureStore from 'expo-secure-store'
import * as Location from 'expo-location'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { getProjectByManagerId, getProjectsByWorkerId } from '@/api/endpoints/projects'
import { getProjectWorkerLocations, updateWorkerLocation } from '@/api/endpoints/locations'

const BRATISLAVA: Region = {
  latitude: 48.1486,
  longitude: 17.1077,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
}

export default function MapScreen() {
  const Colors = useColors()
  const insets = useSafeAreaInsets()
  const [user, setUser] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [workerLocations, setWorkerLocations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingIn, setCheckingIn] = useState(false)
  const [locationPermission, setLocationPermission] = useState(false)
  const userCoordsRef = useRef<{ lat: number; lng: number } | null>(null)
  const mapRef = useRef<MapView>(null)
  const refreshRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        setLocationPermission(status === 'granted')

        const stored = await SecureStore.getItemAsync('user')
        const u = stored ? JSON.parse(stored) : null
        setUser(u)
        const res = u?.role === 'manager'
          ? await getProjectByManagerId(u.id)
          : await getProjectsByWorkerId(u.id)
        setProjects(res.data)
        if (res.data.length > 0) setSelected(res.data[0])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!selected || !user) return

    if (refreshRef.current) clearInterval(refreshRef.current)

    if (user.role === 'manager') {
      const fetch = async () => {
        try {
          const res = await getProjectWorkerLocations(selected.id)
          setWorkerLocations(res.data)
        } catch { /* ignore */ }
      }
      fetch()
      refreshRef.current = setInterval(fetch, 30000)
    } else {
      setWorkerLocations([])
    }

    if (selected.lat && selected.lng) {
      mapRef.current?.animateToRegion({
        latitude: selected.lat,
        longitude: selected.lng,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 600)
    }

    return () => {
      if (refreshRef.current) clearInterval(refreshRef.current)
    }
  }, [selected, user])

  const handleCheckIn = async () => {
    if (!locationPermission) {
      Alert.alert('Location permission required', 'Please grant location access in device settings to check in.')
      return
    }
    if (!userCoordsRef.current) {
      Alert.alert('Location unavailable', 'Wait a moment for GPS to lock and try again.')
      return
    }
    if (!selected) {
      Alert.alert('No project', 'Select a project first.')
      return
    }
    setCheckingIn(true)
    try {
      await updateWorkerLocation({
        worker_id: user.id,
        project_id: selected.id,
        lat: userCoordsRef.current.lat,
        lng: userCoordsRef.current.lng,
        is_online: true,
      })
      Alert.alert('Checked in', 'Your location has been shared with the project manager.')
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error ?? 'Could not check in')
    } finally {
      setCheckingIn(false)
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.background,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors.background,
    },
    selectorBar: {
      backgroundColor: Colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
      paddingTop: Math.max(insets.top, 16) + 8,
    },
    selectorContent: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 8,
    },
    chip: {
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: 20,
      paddingVertical: 6,
      paddingHorizontal: 14,
      backgroundColor: Colors.background,
      maxWidth: 180,
    },
    chipActive: {
      borderColor: Colors.primary,
      backgroundColor: Colors.primaryLight,
    },
    chipText: {
      fontSize: 13,
      color: Colors.textSecondary,
    },
    chipTextActive: {
      color: Colors.textPrimary,
    },
    noProjects: {
      fontSize: 13,
      color: Colors.textSecondary,
      fontStyle: 'italic',
      paddingVertical: 6,
    },
    map: {
      flex: 1,
    },
    workerPin: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: '#fff',
    },
    callout: {
      padding: 8,
      minWidth: 140,
    },
    calloutTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: '#0f172a',
    },
    calloutSub: {
      fontSize: 12,
      color: '#475569',
      marginTop: 2,
    },
    calloutTime: {
      fontSize: 11,
      color: '#94a3b8',
      marginTop: 2,
    },
    badge: {
      position: 'absolute',
      bottom: Math.max(insets.bottom, 8) + 16,
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: 20,
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    badgeDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    badgeText: {
      fontSize: 13,
      color: Colors.textPrimary,
    },
    checkInBtn: {
      position: 'absolute',
      bottom: Math.max(insets.bottom, 8) + 16,
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: Colors.primary,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 24,
    },
    checkInText: {
      fontSize: 15,
      fontWeight: '500',
      color: '#fff',
    },
  })

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  const isManager = user?.role === 'manager'

  return (
    <View style={styles.container}>
      <View style={styles.selectorBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorContent}>
          {projects.length === 0 ? (
            <Text style={styles.noProjects}>No projects</Text>
          ) : (
            projects.map(p => (
              <TouchableOpacity
                key={p.id}
                style={[styles.chip, selected?.id === p.id && styles.chipActive]}
                onPress={() => setSelected(p)}
              >
                <Text style={[styles.chipText, selected?.id === p.id && styles.chipTextActive]} numberOfLines={1}>
                  {p.title}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={BRATISLAVA}
        showsUserLocation={!isManager && locationPermission}
        showsMyLocationButton={!isManager && locationPermission}
        onUserLocationChange={e => {
          const coords = e.nativeEvent.coordinate
          if (coords) {
            userCoordsRef.current = { lat: coords.latitude, lng: coords.longitude }
          }
        }}
      >
        {selected?.lat && selected?.lng && (
          <Marker
            coordinate={{ latitude: selected.lat, longitude: selected.lng }}
            pinColor={Colors.primary}
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{selected.title}</Text>
                <Text style={styles.calloutSub}>{selected.address ?? 'Project site'}</Text>
              </View>
            </Callout>
          </Marker>
        )}

        {isManager && workerLocations.map(wl => (
          <Marker
            key={wl.id}
            coordinate={{ latitude: wl.lat, longitude: wl.lng }}
          >
            <View style={[styles.workerPin, { backgroundColor: wl.is_online ? Colors.online : Colors.offline }]}>
              <Ionicons name="person" size={14} color="#fff" />
            </View>
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{wl.first_name} {wl.last_name}</Text>
                <Text style={[styles.calloutSub, { color: wl.is_online ? Colors.online : Colors.offline }]}>
                  {wl.is_online ? 'Online' : 'Offline'}
                </Text>
                <Text style={styles.calloutTime}>
                  Last seen: {new Date(wl.recorded_at).toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {isManager && selected && (
        <View style={styles.badge}>
          <View style={[styles.badgeDot, { backgroundColor: Colors.online }]} />
          <Text style={styles.badgeText}>
            {workerLocations.filter(w => w.is_online).length} online · {workerLocations.length} total
          </Text>
        </View>
      )}

      {!isManager && selected && (
        <TouchableOpacity
          style={[styles.checkInBtn, checkingIn && { opacity: 0.6 }]}
          onPress={handleCheckIn}
          disabled={checkingIn}
        >
          <Ionicons name="location" size={18} color="#fff" />
          <Text style={styles.checkInText}>{checkingIn ? 'Checking in…' : 'Check in to project'}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}
