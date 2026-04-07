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
} from 'react-native';
import { useState } from 'react';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Promotion {
  id: number;
  title: string;
  description: string;
  image: string;
  discount: string;
}

// ─── Datos mock (reemplazar con llamada al backend) ────────────────────────────
const PROMOTIONS: Promotion[] = [
  {
    id: 1,
    title: '20% de Descuento en Combustible Premium',
    description:
      'Obtén 20% de descuento en tu próxima compra de combustible premium. Válido hasta el 31 de marzo.',
    image:
      'https://images.unsplash.com/photo-1554322159-40b4de41870b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    discount: '20% DESC',
  },
  {
    id: 2,
    title: 'Lavado de Auto Gratis',
    description:
      'Lavado de auto gratuito con cualquier compra de combustible mayor a $500. Disponible en ubicaciones participantes.',
    image:
      'https://images.unsplash.com/photo-1760827797819-4361cd5cd353?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    discount: 'GRATIS',
  },
  {
    id: 3,
    title: 'Paquete Café + Combustible',
    description:
      'Compra un café de cualquier tamaño y recibe 50 centavos de descuento por litro en tu compra de combustible.',
    image:
      'https://images.unsplash.com/photo-1707500315925-910ab09b92b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    discount: '50¢/L',
  },
  {
    id: 4,
    title: 'Especial Cambio de Aceite',
    description:
      'Ahorra $150 en tu próximo cambio de aceite completo en cualquier centro de servicio Smartgas.',
    image:
      'https://images.unsplash.com/photo-1771340012378-3c86cb649193?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    discount: '$150 DESC',
  },
];

// ─── Subcomponentes ───────────────────────────────────────────────────────────

/** Tarjeta individual de promoción */
function PromoCard({ item }: { item: Promotion }) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => {
        // TODO: router.push(`/promotions/${item.id}`) — detalle de promoción
      }}
    >
      {/* ── Imagen con badge de descuento ────────────────── */}
      <View style={styles.imageContainer}>
        {!imageError ? (
          <Image
            source={{ uri: item.image }}
            style={styles.image}
            resizeMode="cover"
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
            }}
          />
        ) : (
          // Fallback si la imagen falla
          <View style={styles.imageFallback}>
            <Text style={styles.imageFallbackText}>📷</Text>
          </View>
        )}

        {/* Spinner mientras carga */}
        {imageLoading && !imageError && (
          <View style={styles.imageLoader}>
            <ActivityIndicator size="small" color={Colors.yellow} />
          </View>
        )}

        {/* Badge de descuento */}
        <View style={styles.discountBadge}>
          <Text style={styles.discountBadgeText}>{item.discount}</Text>
        </View>
      </View>

      {/* ── Contenido ────────────────────────────────────── */}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDescription}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );
}

/** Header de la lista (dentro del FlatList para que haga scroll junto al contenido) */
function ListHeader() {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Ofertas Exclusivas</Text>
      <Text style={styles.headerSubtitle}>Ahorra más con SmartRewards</Text>
    </View>
  );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────
export default function PromotionsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.navy} />
      <FlatList
        data={PROMOTIONS}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => <PromoCard item={item} />}
        ListHeaderComponent={<ListHeader />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const IMAGE_HEIGHT = 200;

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

  // ── Lista ────────────────────────────────────────────────
  listContent: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing['5xl'],
  },
  separator: {
    height: Spacing.lg,
  },

  // ── Tarjeta ──────────────────────────────────────────────
  card: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.navyOpacity10,
    // Sombra iOS
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // Sombra Android
    elevation: 3,
  },

  // ── Imagen ───────────────────────────────────────────────
  imageContainer: {
    height: IMAGE_HEIGHT,
    width: '100%',
    backgroundColor: Colors.muted,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.inputBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageFallbackText: {
    fontSize: 40,
  },
  imageLoader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.muted,
  },

  // ── Badge de descuento ───────────────────────────────────
  discountBadge: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    backgroundColor: Colors.yellow,
  },
  discountBadgeText: {
    color: Colors.navy,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.sm,
  },

  // ── Contenido de la tarjeta ──────────────────────────────
  cardContent: {
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.navy,
    lineHeight: 24,
  },
  cardDescription: {
    fontSize: FontSize.sm,
    color: Colors.navyOpacity70,
    lineHeight: 20,
  },
});