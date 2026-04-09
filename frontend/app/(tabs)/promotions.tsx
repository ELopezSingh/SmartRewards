import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Platform,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { obtenerPromociones, Promocion } from '@/api/promociones';

// ─── Subcomponentes ───────────────────────────────────────────────────────────

/** Tarjeta individual de promoción */
function PromoCard({ item }: { item: Promocion }) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Formatear fecha de vencimiento si existe
  const fechaFin = item.fechaFin
    ? new Date(item.fechaFin).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => {
        // TODO: router.push(`/promociones/${item.id}`)
      }}
    >
      {/* ── Imagen con badge de descuento ────────────────── */}
      <View style={styles.imageContainer}>
        {!imageError ? (
          <Image
            source={{ uri: item.imagenUrl }}
            style={styles.image}
            resizeMode="cover"
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => { setImageLoading(false); setImageError(true); }}
          />
        ) : (
          <View style={styles.imageFallback}>
            <Ionicons name="image-outline" size={40} color={Colors.mutedForeground} />
          </View>
        )}

        {imageLoading && !imageError && (
          <View style={styles.imageLoader}>
            <ActivityIndicator size="small" color={Colors.yellow} />
          </View>
        )}

        {/* Badge de descuento */}
        <View style={styles.discountBadge}>
          <Text style={styles.discountBadgeText}>{item.descuentoLabel}</Text>
        </View>
      </View>

      {/* ── Contenido ────────────────────────────────────── */}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.titulo}</Text>
        <Text style={styles.cardDescription}>{item.descripcion}</Text>

        {/* Fecha de vencimiento si existe */}
        {fechaFin && (
          <View style={styles.fechaRow}>
            <Ionicons name="time-outline" size={14} color={Colors.mutedForeground} />
            <Text style={styles.fechaText}>Válido hasta el {fechaFin}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

/** Header de la lista */
function ListHeader() {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Ofertas Exclusivas</Text>
      <Text style={styles.headerSubtitle}>Ahorra más con SmartRewards</Text>
    </View>
  );
}

/** Estado vacío cuando no hay promociones */
function EmptyState({ error }: { error: string | null }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons
        name={error ? 'wifi-outline' : 'pricetag-outline'}
        size={48}
        color={Colors.navyOpacity20}
      />
      <Text style={styles.emptyStateTitle}>
        {error ? 'Sin conexión' : 'Sin promociones'}
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        {error ?? 'No hay ofertas disponibles en este momento'}
      </Text>
    </View>
  );
}

/** Skeleton de carga — muestra 3 tarjetas placeholder */
function LoadingSkeleton() {
  return (
    <View style={styles.listContent}>
      {[1, 2, 3].map(i => (
        <View key={i} style={[styles.card, styles.skeletonCard]}>
          <View style={[styles.imageContainer, styles.skeletonBox]} />
          <View style={styles.cardContent}>
            <View style={[styles.skeletonBox, { height: 20, width: '75%', borderRadius: Radius.sm, marginBottom: Spacing.sm }]} />
            <View style={[styles.skeletonBox, { height: 14, width: '100%', borderRadius: Radius.sm, marginBottom: 6 }]} />
            <View style={[styles.skeletonBox, { height: 14, width: '60%', borderRadius: Radius.sm }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────
export default function PromotionsScreen() {
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos cada vez que el tab recibe el foco
  useFocusEffect(
    useCallback(() => {
      cargarPromociones();
    }, [])
  );

  const cargarPromociones = async (esRefresh = false) => {
    if (esRefresh) setRefreshing(true);
    else setLoading(true);

    setError(null);

    const { promociones: datos, error: apiError } = await obtenerPromociones();

    if (apiError) setError(apiError);
    else setPromociones(datos);

    if (esRefresh) setRefreshing(false);
    else setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.navy} />

      {loading ? (
        // Skeleton durante la carga inicial
        <>
          <ListHeader />
          <LoadingSkeleton />
        </>
      ) : (
        <FlatList
          data={promociones}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => <PromoCard item={item} />}
          ListHeaderComponent={<ListHeader />}
          ListEmptyComponent={<EmptyState error={error} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => cargarPromociones(true)}
              tintColor={Colors.yellow}
              colors={[Colors.yellow]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const IMAGE_HEIGHT = 200;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.navy },

  // ── Header ──────────────────────────────────────────────
  header: {
    backgroundColor: Colors.navy,
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Platform.OS === 'android' ? Spacing['3xl'] : Spacing.xl,
    paddingBottom: Spacing['2xl'],
  },
  headerTitle:    { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.white },
  headerSubtitle: { fontSize: FontSize.sm, color: Colors.white, opacity: 0.8, marginTop: Spacing.xs },

  // ── Lista ────────────────────────────────────────────────
  listContent: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing['5xl'],
    flexGrow: 1,
  },
  separator: { height: Spacing.lg },

  // ── Tarjeta ──────────────────────────────────────────────
  card: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.navyOpacity10,
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  // ── Imagen ───────────────────────────────────────────────
  imageContainer: { height: IMAGE_HEIGHT, width: '100%', backgroundColor: Colors.muted, position: 'relative' },
  image:          { width: '100%', height: '100%' },
  imageFallback:  { width: '100%', height: '100%', backgroundColor: Colors.inputBackground, alignItems: 'center', justifyContent: 'center' },
  imageLoader:    { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.muted },

  // ── Badge de descuento ───────────────────────────────────
  discountBadge: {
    position: 'absolute', top: Spacing.lg, right: Spacing.lg,
    paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md,
    borderRadius: Radius.full, backgroundColor: Colors.yellow,
  },
  discountBadgeText: { color: Colors.navy, fontWeight: FontWeight.bold, fontSize: FontSize.sm },

  // ── Contenido de la tarjeta ──────────────────────────────
  cardContent:     { padding: Spacing.xl, gap: Spacing.sm },
  cardTitle:       { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.navy, lineHeight: 24 },
  cardDescription: { fontSize: FontSize.sm, color: Colors.navyOpacity70, lineHeight: 20 },

  // ── Fecha de vencimiento ─────────────────────────────────
  fechaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: Spacing.xs },
  fechaText: { fontSize: FontSize.xs, color: Colors.mutedForeground },

  // ── Estado vacío ─────────────────────────────────────────
  emptyState: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: Spacing['6xl'], gap: Spacing.md,
  },
  emptyStateTitle:    { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.navy },
  emptyStateSubtitle: { fontSize: FontSize.sm, color: Colors.navyOpacity70, textAlign: 'center', paddingHorizontal: Spacing['3xl'] },

  // ── Skeleton ─────────────────────────────────────────────
  skeletonCard: { marginBottom: Spacing.lg },
  skeletonBox:  { backgroundColor: Colors.muted },
});