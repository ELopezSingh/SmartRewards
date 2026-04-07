import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';

// ─── Tipos ────────────────────────────────────────────────────────────────────
type IoniconsName = keyof typeof Ionicons.glyphMap;

interface MenuItem {
  icon: IoniconsName;
  label: string;
  route?: string;
  onPress?: () => void;
}

// ─── Datos mock (reemplazar con contexto de autenticación del backend) ─────────
const MOCK_USER = {
  nombre: 'Emiliano López',
  email: '3miliano.l0pez274@gmail.com',
  miembroDesde: 'Marzo 2024',
};

// ─── Subcomponentes ───────────────────────────────────────────────────────────

/** Ítem del menú de perfil */
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

// ─── Pantalla principal ───────────────────────────────────────────────────────
export default function ProfileScreen() {
  const router = useRouter();

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

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar tu sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: () => {
            // TODO: limpiar tokens / estado de sesión del backend
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  // Iniciales del nombre para el avatar
  const initials = MOCK_USER.nombre
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.navy} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header navy ──────────────────────────────────────── */}
        <View style={styles.header}>

          {/* Avatar + nombre + email */}
          <View style={styles.headerUser}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.headerUserInfo}>
              <Text style={styles.headerName}>{MOCK_USER.nombre}</Text>
              <Text style={styles.headerEmail}>{MOCK_USER.email}</Text>
            </View>
          </View>

          {/* Badge "Miembro desde" */}
          <View style={styles.memberBadge}>
            <Ionicons name="star" size={14} color={Colors.yellow} />
            <Text style={styles.memberBadgeText}>
              Miembro desde {MOCK_USER.miembroDesde}
            </Text>
          </View>

        </View>

        {/* ── Menú de opciones ──────────────────────────────────── */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <MenuItem key={index} {...item} />
          ))}
        </View>

        {/* ── Botón Cerrar Sesión ───────────────────────────────── */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <View style={styles.logoutIconWrap}>
            <Ionicons name="log-out-outline" size={20} color={Colors.yellow} />
          </View>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.navy,
  },
  scroll: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing['5xl'],
  },

  // ── Header ──────────────────────────────────────────────
  header: {
    backgroundColor: Colors.navy,
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing.xl,
    paddingBottom: Spacing['3xl'],
    gap: Spacing.xl,
  },
  headerUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.navy,
  },
  headerUserInfo: {
    flex: 1,
    gap: 4,
  },
  headerName: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  headerEmail: {
    fontSize: FontSize.sm,
    color: Colors.white,
    opacity: 0.8,
  },

  // ── Badge membresía ──────────────────────────────────────
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255, 213, 0, 0.1)',
    alignSelf: 'flex-start',
  },
  memberBadgeText: {
    fontSize: FontSize.sm,
    color: Colors.yellow,
    fontWeight: FontWeight.medium,
  },

  // ── Menú ─────────────────────────────────────────────────
  menuSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    backgroundColor: Colors.inputBackground,
    gap: Spacing.lg,
  },
  menuItemIconWrap: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: Colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemLabel: {
    flex: 1,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.navy,
  },

  // ── Cerrar sesión ────────────────────────────────────────
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing['2xl'],
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    backgroundColor: Colors.navy,
    gap: Spacing.lg,
  },
  logoutIconWrap: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255, 213, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    flex: 1,
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.white,
  },
});