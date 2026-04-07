import { useState, useMemo } from 'react';
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
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';

// ─── Tipos ────────────────────────────────────────────────────────────────────
type ViewMode = 'list' | 'map';

interface Location {
  id: number;
  name: string;
  address: string;
  distance: string;
  services: string[];
  lat: number;
  lng: number;
}

// ─── Datos mock (reemplazar con llamada al backend / geolocalización) ──────────
const LOCATIONS: Location[] = [
  {
    id: 1,
    name: 'Smartgas Centro',
    address: 'Av. Reforma 123, Centro Histórico',
    distance: '1.3 km',
    services: ['Combustible Premium', 'Lavado de Auto', 'Tienda'],
    lat: 19.4326,
    lng: -99.1332,
  },
  {
    id: 2,
    name: 'Smartgas Periférico Norte',
    address: 'Periférico Norte 4567, Colonia Lindavista',
    distance: '3.7 km',
    services: ['Combustible Premium', 'Cambio de Aceite', 'Servicio de Llantas'],
    lat: 19.4969,
    lng: -99.1332,
  },
  {
    id: 3,
    name: 'Smartgas Polanco',
    address: 'Av. Presidente Masaryk 890, Polanco',
    distance: '5.0 km',
    services: ['Combustible Premium', 'Lavado de Auto', 'Cafetería'],
    lat: 19.4336,
    lng: -99.1956,
  },
  {
    id: 4,
    name: 'Smartgas Roma Norte',
    address: 'Av. Insurgentes Sur 234, Roma Norte',
    distance: '2.1 km',
    services: ['Combustible Premium', 'Tienda', 'Estacionamiento'],
    lat: 19.4178,
    lng: -99.1622,
  },
  {
    id: 5,
    name: 'Smartgas Santa Fe',
    address: 'Av. Santa Fe 567, Santa Fe',
    distance: '8.3 km',
    services: ['Combustible Premium', 'Lavado de Auto', 'Cambio de Aceite'],
    lat: 19.359,
    lng: -99.262,
  },
];

// Región inicial del mapa centrada en CDMX
const INITIAL_REGION = {
  latitude: 19.4326,
  longitude: -99.1332,
  latitudeDelta: 0.18,
  longitudeDelta: 0.18,
};

// ─── Subcomponentes ───────────────────────────────────────────────────────────

/** Chip de servicio */
function ServiceChip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

/** Tarjeta de ubicación en vista lista */
function LocationCard({ location }: { location: Location }) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => {
        // TODO: router.push(`/locations/${location.id}`) — detalle / cómo llegar
      }}
    >
      {/* Ícono de pin */}
      <View style={styles.cardIconWrap}>
        <Ionicons name="location" size={20} color={Colors.navy} />
      </View>

      {/* Contenido */}
      <View style={styles.cardContent}>
        <Text style={styles.cardName}>{location.name}</Text>
        <Text style={styles.cardAddress}>{location.address}</Text>

        {/* Chips de servicios */}
        <View style={styles.chipsRow}>
          {location.services.map(service => (
            <ServiceChip key={service} label={service} />
          ))}
        </View>

        {/* Distancia */}
        <Text style={styles.cardDistance}>A {location.distance}</Text>
      </View>
    </TouchableOpacity>
  );
}

/** Estado vacío cuando la búsqueda no arroja resultados */
function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="location-outline" size={40} color={Colors.navyOpacity20} />
      <Text style={styles.emptyStateText}>No se encontraron ubicaciones</Text>
    </View>
  );
}

/** Header de la lista (dentro del FlatList para scroll conjunto) */
function ListHeader({
  searchQuery,
  setSearchQuery,
  viewMode,
  toggleViewMode,
}: {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  viewMode: ViewMode;
  toggleViewMode: () => void;
}) {
  return (
    <>
      {/* ── Header navy ──────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ubicaciones Cercanas</Text>
        <Text style={styles.headerSubtitle}>
          Encuentra tu estación Smartgas más cercana
        </Text>
      </View>

      {/* ── Barra de búsqueda + toggle ───────────────────── */}
      <View style={styles.searchRow}>
        <View style={styles.searchInputWrap}>
          <Ionicons name="search-outline" size={20} color={Colors.mutedForeground} />
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

        {/* Botón toggle lista/mapa */}
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={toggleViewMode}
          activeOpacity={0.85}
        >
          <Ionicons
            name={viewMode === 'list' ? 'map-outline' : 'list-outline'}
            size={24}
            color={Colors.white}
          />
        </TouchableOpacity>
      </View>
    </>
  );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────
export default function LocationsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return LOCATIONS;
    const q = searchQuery.toLowerCase();
    return LOCATIONS.filter(
      loc =>
        loc.name.toLowerCase().includes(q) ||
        loc.address.toLowerCase().includes(q) ||
        loc.services.some(s => s.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const toggleViewMode = () => {
    setViewMode(prev => (prev === 'list' ? 'map' : 'list'));
    setSelectedLocation(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.navy} />

      {/* ── Vista Lista ──────────────────────────────────────── */}
      {viewMode === 'list' && (
        <FlatList
          data={filteredLocations}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => <LocationCard location={item} />}
          ListHeaderComponent={
            <ListHeader
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              viewMode={viewMode}
              toggleViewMode={toggleViewMode}
            />
          }
          ListEmptyComponent={<EmptyState />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* ── Vista Mapa ───────────────────────────────────────── */}
      {viewMode === 'map' && (
        <View style={styles.mapContainer}>

          {/* Header y barra de búsqueda flotan encima del mapa */}
          <View style={styles.mapTopBar}>
            <ListHeader
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              viewMode={viewMode}
              toggleViewMode={toggleViewMode}
            />
          </View>

          {/* Mapa */}
          <MapView
            style={styles.map}
            initialRegion={INITIAL_REGION}
            showsUserLocation
            showsMyLocationButton
          >
            {filteredLocations.map(location => (
              <Marker
                key={location.id}
                coordinate={{ latitude: location.lat, longitude: location.lng }}
                onPress={() => setSelectedLocation(location)}
                pinColor={
                  selectedLocation?.id === location.id
                    ? Colors.yellow
                    : Colors.navy
                }
              >
                {/* Callout nativo al tocar el marcador */}
                <Callout tooltip={false}>
                  <View style={styles.callout}>
                    <Text style={styles.calloutName}>{location.name}</Text>
                    <Text style={styles.calloutAddress}>{location.address}</Text>
                    <Text style={styles.calloutDistance}>A {location.distance}</Text>
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>

          {/* Tarjeta de detalle al seleccionar un marcador */}
          {selectedLocation && (
            <View style={styles.mapDetailCard}>
              <View style={styles.mapDetailCardInner}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.mapDetailName}>{selectedLocation.name}</Text>
                  <Text style={styles.mapDetailAddress}>{selectedLocation.address}</Text>
                  <Text style={styles.mapDetailDistance}>A {selectedLocation.distance}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedLocation(null)}
                  style={styles.mapDetailClose}
                >
                  <Ionicons name="close" size={20} color={Colors.navyOpacity70} />
                </TouchableOpacity>
              </View>
              <View style={styles.chipsRow}>
                {selectedLocation.services.map(s => (
                  <ServiceChip key={s} label={s} />
                ))}
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
  safeArea: {
    flex: 1,
    backgroundColor: Colors.navy,
  },

  // ── Header ──────────────────────────────────────────────
  header: {
    backgroundColor: Colors.navy,
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Platform.OS === 'android' ? Spacing['3xl'] : Spacing.xl,
    paddingBottom: Spacing['2xl'],
  },
  headerTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.white,
    opacity: 0.8,
    marginTop: Spacing.xs,
  },

  // ── Barra de búsqueda ────────────────────────────────────
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    backgroundColor: Colors.inputBackground,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.navy,
    fontWeight: FontWeight.normal,
    padding: 0, // Reset padding en Android
  },
  toggleButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  // ── Lista ────────────────────────────────────────────────
  listContent: {
    backgroundColor: Colors.white,
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing['5xl'],
  },
  separator: {
    height: Spacing.md,
  },

  // ── Tarjeta ──────────────────────────────────────────────
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.xl,
    borderRadius: Radius.xl,
    backgroundColor: Colors.inputBackground,
    borderWidth: 1.5,
    borderColor: Colors.navyOpacity10,
  },
  cardIconWrap: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: Colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  cardContent: {
    flex: 1,
    gap: Spacing.sm,
  },
  cardName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.navy,
  },
  cardAddress: {
    fontSize: FontSize.sm,
    color: Colors.navyOpacity70,
    lineHeight: 18,
  },
  cardDistance: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.yellow,
    // El color yellow sobre fondo claro necesita un tono un poco más oscuro
    // si hay problemas de accesibilidad, cambiar a Colors.navy
  },

  // ── Chips de servicios ───────────────────────────────────
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    paddingVertical: 3,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.navy,
  },
  chipText: {
    fontSize: FontSize.xs,
    color: Colors.navy,
    fontWeight: FontWeight.medium,
  },

  // ── Estado vacío ─────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['6xl'],
    gap: Spacing.md,
  },
  emptyStateText: {
    fontSize: FontSize.base,
    color: Colors.navyOpacity70,
  },

  // ── Mapa ─────────────────────────────────────────────────
  mapContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  mapTopBar: {
    zIndex: 10,
    backgroundColor: Colors.white,
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  map: {
    flex: 1,
  },

  // ── Callout del marcador ─────────────────────────────────
  callout: {
    width: 200,
    padding: Spacing.md,
    gap: 4,
  },
  calloutName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.navy,
  },
  calloutAddress: {
    fontSize: FontSize.xs,
    color: Colors.navyOpacity70,
    lineHeight: 16,
  },
  calloutDistance: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.navy,
    marginTop: 2,
  },

  // ── Tarjeta de detalle en el mapa ────────────────────────
  mapDetailCard: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 32 : 16,
    left: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    gap: Spacing.md,
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: Colors.yellow,
  },
  mapDetailCardInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  mapDetailName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.navy,
  },
  mapDetailAddress: {
    fontSize: FontSize.sm,
    color: Colors.navyOpacity70,
    marginTop: 2,
  },
  mapDetailDistance: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.yellow,
    marginTop: 4,
  },
  mapDetailClose: {
    padding: Spacing.xs,
  },
});