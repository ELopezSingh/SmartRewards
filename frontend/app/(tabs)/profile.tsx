import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { obtenerPerfil, logout } from '@/api/perfil';
import { Usuario } from '@/api/auth';

// ─── Tipos ────────────────────────────────────────────────────────────────────
type IoniconsName = keyof typeof Ionicons.glyphMap;

interface MenuItem {
  icon: IoniconsName;
  label: string;
  onPress: () => void;
}

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function MenuItem({ icon, label, onPress }: MenuItem) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.menuItemIconWrap}>
        <Ionicons name={icon} size={20} color={Colors.navy} />
      </View>
      <Text style={styles.menuItemLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={Colors.navyOpacity20} />
    </TouchableOpacity>
  );
}

/** Skeleton del header mientras carga el perfil */
function HeaderSkeleton() {
  return (
    <View style={styles.header}>
      <View style={styles.headerUser}>
        <View style={[styles.avatar, styles.skeletonBox]} />
        <View style={{ gap: Spacing.sm, flex: 1 }}>
          <View style={[styles.skeletonBox, { height: 22, width: '60%', borderRadius: Radius.sm }]} />
          <View style={[styles.skeletonBox, { height: 16, width: '80%', borderRadius: Radius.sm }]} />
        </View>
      </View>
      <View style={[styles.memberBadge, styles.skeletonBox, { width: 200 }]} />
    </View>
  );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────
export default function ProfileScreen() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Cargar perfil cada vez que el tab recibe el foco
  useFocusEffect(
    useCallback(() => {
      cargarPerfil();
    }, [])
  );

  const cargarPerfil = async (esRefresh = false) => {
    if (esRefresh) setRefreshing(true);
    else setLoading(true);

    const { usuario: datos, error } = await obtenerPerfil();

    if (!error && datos) setUsuario(datos);

    if (esRefresh) setRefreshing(false);
    else setLoading(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar tu sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            await logout();
            // Navegar al login sin posibilidad de regresar
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const menuItems: MenuItem[] = [
    {
      icon: 'person-outline',
      label: 'Información Personal',
      onPress: () => {}, // TODO: router.push('/profile/personal-info')
    },
    {
      icon: 'card-outline',
      label: 'Métodos de Pago',
      onPress: () => {}, // TODO: router.push('/profile/payment-methods')
    },
    {
      icon: 'notifications-outline',
      label: 'Notificaciones',
      onPress: () => {}, // TODO: router.push('/profile/notifications')
    },
    {
      icon: 'help-circle-outline',
      label: 'Ayuda y Soporte',
      onPress: () => {}, // TODO: router.push('/profile/help')
    },
  ];

  // Iniciales del nombre para el avatar
  const initials = usuario
    ? `${usuario.nombre[0]}${usuario.apellido[0]}`.toUpperCase()
    : '?';

  // Fecha de membresía formateada
  const miembroDesde = usuario
    ? new Date(usuario.creadoEn).toLocaleDateString('es-MX', {
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.navy} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => cargarPerfil(true)}
            tintColor={Colors.yellow}
            colors={[Colors.yellow]}
          />
        }
      >
        {/* ── Header navy ──────────────────────────────────────── */}
        {loading ? (
          <HeaderSkeleton />
        ) : (
          <View style={styles.header}>

            {/* Avatar + nombre + email */}
            <View style={styles.headerUser}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View style={styles.headerUserInfo}>
                <Text style={styles.headerName}>
                  {usuario ? `${usuario.nombre} ${usuario.apellido}` : '—'}
                </Text>
                <Text style={styles.headerEmail}>
                  {usuario?.email ?? '—'}
                </Text>
              </View>
            </View>

            {/* Badge de membresía */}
            <View style={styles.memberBadge}>
              <Ionicons name="star" size={14} color={Colors.yellow} />
              <Text style={styles.memberBadgeText}>
                Miembro desde {miembroDesde}
              </Text>
            </View>

          </View>
        )}

        {/* ── Puntos del usuario ────────────────────────────────── */}
        {!loading && usuario && (
          <View style={styles.puntosCard}>
            <View style={styles.puntosCardInner}>
              <Ionicons name="star-outline" size={22} color={Colors.yellow} />
              <View>
                <Text style={styles.puntosLabel}>Saldo de Puntos</Text>
                <Text style={styles.puntosValue}>
                  {usuario.puntos.toLocaleString('es-MX')} pts
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ── Menú de opciones ──────────────────────────────────── */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <MenuItem key={index} {...item} />
          ))}
        </View>

        {/* ── Botón Cerrar Sesión ───────────────────────────────── */}
        <TouchableOpacity
          style={[styles.logoutButton, loggingOut && styles.logoutButtonDisabled]}
          onPress={handleLogout}
          activeOpacity={0.85}
          disabled={loggingOut}
        >
          <View style={styles.logoutIconWrap}>
            {loggingOut
              ? <ActivityIndicator size="small" color={Colors.yellow} />
              : <Ionicons name="log-out-outline" size={20} color={Colors.yellow} />
            }
          </View>
          <Text style={styles.logoutText}>
            {loggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea:      { flex: 1, backgroundColor: Colors.navy },
  scroll:        { flex: 1, backgroundColor: Colors.white },
  scrollContent: { flexGrow: 1, paddingBottom: Spacing['5xl'] },

  // ── Header ──────────────────────────────────────────────
  header: {
    backgroundColor: Colors.navy,
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing.xl,
    paddingBottom: Spacing['3xl'],
    gap: Spacing.xl,
  },
  headerUser:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  headerUserInfo: { flex: 1, gap: 4 },
  headerName:     { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.white },
  headerEmail:    { fontSize: FontSize.sm, color: Colors.white, opacity: 0.8 },

  // ── Avatar ───────────────────────────────────────────────
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.yellow,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.navy },

  // ── Badge membresía ──────────────────────────────────────
  memberBadge: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md, backgroundColor: 'rgba(255, 213, 0, 0.1)',
    alignSelf: 'flex-start',
  },
  memberBadgeText: { fontSize: FontSize.sm, color: Colors.yellow, fontWeight: FontWeight.medium },

  // ── Skeleton ─────────────────────────────────────────────
  skeletonBox: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: Radius.md },

  // ── Tarjeta de puntos ────────────────────────────────────
  puntosCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    backgroundColor: Colors.navy,
  },
  puntosCardInner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  puntosLabel:     { fontSize: FontSize.sm, color: Colors.white, opacity: 0.8 },
  puntosValue:     { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.yellow },

  // ── Menú ─────────────────────────────────────────────────
  menuSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.sm,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    padding: Spacing.lg, borderRadius: Radius.xl,
    backgroundColor: Colors.inputBackground, gap: Spacing.lg,
  },
  menuItemIconWrap: {
    width: 38, height: 38, borderRadius: Radius.md,
    backgroundColor: Colors.yellow, alignItems: 'center', justifyContent: 'center',
  },
  menuItemLabel: { flex: 1, fontSize: FontSize.base, fontWeight: FontWeight.medium, color: Colors.navy },

  // ── Cerrar sesión ────────────────────────────────────────
  logoutButton: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: Spacing.lg, marginTop: Spacing['2xl'],
    padding: Spacing.lg, borderRadius: Radius.xl,
    backgroundColor: Colors.navy, gap: Spacing.lg,
  },
  logoutButtonDisabled: { opacity: 0.7 },
  logoutIconWrap: {
    width: 38, height: 38, borderRadius: Radius.md,
    backgroundColor: 'rgba(255, 213, 0, 0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  logoutText: { flex: 1, fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.white },
});