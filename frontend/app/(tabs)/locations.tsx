import { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  StatusBar,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { obtenerSucursales, Sucursal } from '@/api/sucursales';

// ─── Tipos ────────────────────────────────────────────────────────────────────
type ViewMode = 'list' | 'map';

const INITIAL_REGION = {
  latitude: 24.808739402719453,
  longitude: -107.39272867549276,
  latitudeDelta: 0.18,
  longitudeDelta: 0.18,
};

// ─── Subcomponentes estables (definidos FUERA de la pantalla principal) ────────
// IMPORTANTE: definirlos fuera evita que React los re-cree en cada render,
// que es la causa raíz del cierre del teclado.

function ServiceChip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

function LocationCard({ location }: { location: Sucursal }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <View style={styles.cardIconWrap}>
        <Ionicons name="location" size={20} color={Colors.navy} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardName}>{location.nombre}</Text>
        <Text style={styles.cardAddress}>{location.direccion}</Text>
        <View style={styles.chipsRow}>
          {location.servicios.map(s => <ServiceChip key={s} label={s} />)}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function EmptyState({ error, loading }: { error: string | null; loading: boolean }) {
  if (loading) return null;
  return (
    <View style={styles.emptyState}>
      <Ionicons
        name={error ? 'wifi-outline' : 'location-outline'}
        size={44}
        color={Colors.navyOpacity20}
      />
      <Text style={styles.emptyStateTitle}>
        {error ? 'Sin conexión' : 'Sin resultados'}
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        {error ?? 'No se encontraron sucursales con ese término'}
      </Text>
    </View>
  );
}

function LoadingSkeleton() {
  return (
    <View style={{ gap: Spacing.md, paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg }}>
      {[1, 2, 3].map(i => (
        <View key={i} style={[styles.card, { opacity: 0.5 }]}>
          <View style={[styles.cardIconWrap, styles.skeletonBox]} />
          <View style={{ flex: 1, gap: Spacing.sm }}>
            <View style={[styles.skeletonBox, { height: 18, width: '60%', borderRadius: Radius.sm }]} />
            <View style={[styles.skeletonBox, { height: 14, width: '90%', borderRadius: Radius.sm }]} />
            <View style={[styles.skeletonBox, { height: 24, width: '70%', borderRadius: Radius.full }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────
export default function LocationsScreen() {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedLocation, setSelectedLocation] = useState<Sucursal | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFirstRender = useRef(true);

  useFocusEffect(
    useCallback(() => {
      cargarSucursales();
    }, [])
  );

  // Debounce correcto — el cleanup cancela el timer anterior en cada keystroke
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      cargarSucursales(searchQuery || undefined);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const cargarSucursales = async (query?: string, esRefresh = false) => {
    if (esRefresh) setRefreshing(true);
    else if (query !== undefined) setSearching(true);
    else setLoading(true);

    setError(null);

    const { sucursales: datos, error: apiError } = await obtenerSucursales(query);
    if (apiError) setError(apiError);
    else setSucursales(datos);

    setLoading(false);
    setSearching(false);
    setRefreshing(false);
  };

  const toggleViewMode = () => {
    setViewMode(prev => (prev === 'list' ? 'map' : 'list'));
    setSelectedLocation(null);
  };

  // ── La barra de búsqueda y el header están FUERA del FlatList ────────────
  // Esto evita que se re-monten en cada render y cierren el teclado.
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.navy} />

      {/* Header navy — siempre visible */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ubicaciones Cercanas</Text>
        <Text style={styles.headerSubtitle}>Encuentra tu estación Smartgas más cercana</Text>
      </View>

      {/* Barra de búsqueda — siempre visible y FUERA de FlatList/MapView */}
      <View style={styles.searchRow}>
        <View style={styles.searchInputWrap}>
          {searching
            ? <ActivityIndicator size="small" color={Colors.mutedForeground} />
            : <Ionicons name="search-outline" size={20} color={Colors.mutedForeground} />
          }
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Ciudad y/o palabra clave"
            placeholderTextColor={Colors.mutedForeground}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
        <TouchableOpacity style={styles.toggleButton} onPress={toggleViewMode} activeOpacity={0.85}>
          <Ionicons
            name={viewMode === 'list' ? 'map-outline' : 'list-outline'}
            size={24}
            color={Colors.white}
          />
        </TouchableOpacity>
      </View>

      {/* ── Vista Lista ──────────────────────────────────── */}
      {viewMode === 'list' && (
        loading ? (
          <LoadingSkeleton />
        ) : (
          <FlatList
            data={sucursales}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) => <LocationCard location={item} />}
            ListEmptyComponent={<EmptyState error={error} loading={loading} />}
            ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => cargarSucursales(searchQuery || undefined, true)}
                tintColor={Colors.yellow}
                colors={[Colors.yellow]}
              />
            }
          />
        )
      )}

      {/* ── Vista Mapa ───────────────────────────────────── */}
      {viewMode === 'map' && (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={INITIAL_REGION}
            showsUserLocation
            showsMyLocationButton
          >
            {sucursales.map(loc => (
              <Marker
                key={loc.id}
                coordinate={{ latitude: loc.lat, longitude: loc.lng }}
                onPress={() => setSelectedLocation(loc)}
                pinColor={selectedLocation?.id === loc.id ? Colors.yellow : Colors.navy}
              >
                <Callout tooltip={false}>
                  <View style={styles.callout}>
                    <Text style={styles.calloutName}>{loc.nombre}</Text>
                    <Text style={styles.calloutAddress}>{loc.direccion}</Text>
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>

          {selectedLocation && (
            <View style={styles.mapDetailCard}>
              <View style={styles.mapDetailCardInner}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.mapDetailName}>{selectedLocation.nombre}</Text>
                  <Text style={styles.mapDetailAddress}>{selectedLocation.direccion}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedLocation(null)} style={styles.mapDetailClose}>
                  <Ionicons name="close" size={20} color={Colors.navyOpacity70} />
                </TouchableOpacity>
              </View>
              <View style={styles.chipsRow}>
                {selectedLocation.servicios.map(s => <ServiceChip key={s} label={s} />)}
              </View>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.navy },

  header: {
    backgroundColor: Colors.navy,
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Platform.OS === 'android' ? Spacing['3xl'] : Spacing.xl,
    paddingBottom: Spacing['2xl'],
  },
  headerTitle:    { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.white },
  headerSubtitle: { fontSize: FontSize.sm, color: Colors.white, opacity: 0.8, marginTop: Spacing.xs },

  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingHorizontal: Spacing['2xl'], paddingVertical: Spacing.lg,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  searchInputWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderRadius: Radius.full, backgroundColor: Colors.inputBackground,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  searchInput: {
    flex: 1, fontSize: FontSize.base, color: Colors.navy,
    fontWeight: FontWeight.normal, padding: 0,
  },
  toggleButton: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.navy, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.navy, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4, elevation: 3,
  },

  listContent: {
    backgroundColor: Colors.white, flexGrow: 1,
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing['5xl'],
  },

  card: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md,
    padding: Spacing.xl, borderRadius: Radius.xl,
    backgroundColor: Colors.inputBackground, borderWidth: 1.5, borderColor: Colors.navyOpacity10,
  },
  cardIconWrap: {
    width: 38, height: 38, borderRadius: Radius.md,
    backgroundColor: Colors.yellow, alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  cardContent: { flex: 1, gap: Spacing.sm },
  cardName:    { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.navy },
  cardAddress: { fontSize: FontSize.sm, color: Colors.navyOpacity70, lineHeight: 18 },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  chip:     { paddingVertical: 3, paddingHorizontal: Spacing.sm, borderRadius: Radius.full, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.navy },
  chipText: { fontSize: FontSize.xs, color: Colors.navy, fontWeight: FontWeight.medium },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing['6xl'], gap: Spacing.md },
  emptyStateTitle:    { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.navy },
  emptyStateSubtitle: { fontSize: FontSize.sm, color: Colors.navyOpacity70, textAlign: 'center', paddingHorizontal: Spacing['3xl'] },

  skeletonBox: { backgroundColor: Colors.muted },

  mapContainer: { flex: 1 },
  map: { flex: 1 },

  callout:        { width: 200, padding: Spacing.md, gap: 4 },
  calloutName:    { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.navy },
  calloutAddress: { fontSize: FontSize.xs, color: Colors.navyOpacity70, lineHeight: 16 },

  mapDetailCard: {
    position: 'absolute', bottom: Platform.OS === 'ios' ? 32 : 16,
    left: Spacing.lg, right: Spacing.lg,
    backgroundColor: Colors.white, borderRadius: Radius.xl,
    padding: Spacing.xl, gap: Spacing.md,
    shadowColor: Colors.navy, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
    borderWidth: 2, borderColor: Colors.yellow,
  },
  mapDetailCardInner: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  mapDetailName:    { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.navy },
  mapDetailAddress: { fontSize: FontSize.sm, color: Colors.navyOpacity70, marginTop: 2 },
  mapDetailClose:   { padding: Spacing.xs },
});