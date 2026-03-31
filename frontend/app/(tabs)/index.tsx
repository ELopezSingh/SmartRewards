import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';

// ─── Tipos ────────────────────────────────────────────────────────────────────
type ScanMode = 'camera' | 'manual' | null;
type FeedbackType = 'success' | 'error' | null;

// ─── Datos mock (reemplazar con llamadas al backend) ──────────────────────────
const MOCK_USER = {
  nombre: 'Emiliano',
  balance: 3_450,
  visitasMes: 12,
  puntosMes: 850,
};

// ─── Subcomponentes ───────────────────────────────────────────────────────────

/** Tarjeta de feedback: éxito o error al canjear */
function FeedbackBanner({ type }: { type: FeedbackType }) {
  if (!type) return null;

  const isSuccess = type === 'success';
  return (
    <View style={[styles.feedbackBanner, isSuccess ? styles.feedbackSuccess : styles.feedbackError]}>
      <Ionicons
        name={isSuccess ? 'checkmark-circle' : 'close-circle'}
        size={24}
        color={Colors.white}
      />
      <View style={styles.feedbackTextContainer}>
        <Text style={styles.feedbackTitle}>
          {isSuccess ? '¡Código Canjeado!' : 'Código Inválido'}
        </Text>
        <Text style={styles.feedbackSubtitle}>
          {isSuccess ? 'Puntos agregados a tu saldo' : 'Verifica el código e intenta de nuevo'}
        </Text>
      </View>
    </View>
  );
}

/** Botón de opción de canjeo (amarillo o borde navy) */
function ScanOptionButton({
  icon,
  title,
  subtitle,
  variant = 'primary',
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  variant?: 'primary' | 'secondary';
  onPress: () => void;
}) {
  const isPrimary = variant === 'primary';
  return (
    <TouchableOpacity
      style={[styles.scanOptionButton, isPrimary ? styles.scanOptionPrimary : styles.scanOptionSecondary]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.scanOptionLeft}>
        <View style={styles.scanOptionIconWrap}>
          <Ionicons name={icon} size={24} color={Colors.yellow} />
        </View>
        <View>
          <Text style={[styles.scanOptionTitle, !isPrimary && styles.scanOptionTitleSecondary]}>
            {title}
          </Text>
          <Text style={[styles.scanOptionSubtitle, !isPrimary && styles.scanOptionSubtitleSecondary]}>
            {subtitle}
          </Text>
        </View>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={isPrimary ? Colors.navy : Colors.navyOpacity70}
      />
    </TouchableOpacity>
  );
}

/** Tarjeta de estadística */
function StatCard({ label, value, valueColor = Colors.navy }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const [scanMode, setScanMode] = useState<ScanMode>(null);
  const [manualCode, setManualCode] = useState('');
  const [feedback, setFeedback] = useState<FeedbackType>(null);

  /** Simula validación del código — reemplazar con llamada al backend */
  const processCode = (code: string) => {
    setScanMode(null);
    setManualCode('');
    const isValid = code.trim().length > 0;
    setFeedback(isValid ? 'success' : 'error');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleOpenCamera = () => {
    // Navega al modal de QR (app/modal.tsx) que usa expo-camera
    router.push('/modal');
  };

  const handleManualSubmit = () => {
    if (manualCode.trim()) processCode(manualCode);
  };

  const handleCancel = () => {
    setScanMode(null);
    setManualCode('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.navy} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header navy ──────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.headerGreeting}>Hola, {MOCK_USER.nombre}</Text>
          <View style={styles.headerBalanceRow}>
            <Text style={styles.headerBalance}>
              {MOCK_USER.balance.toLocaleString('es-MX')}
            </Text>
            <Text style={styles.headerBalanceLabel}>puntos</Text>
          </View>
          <Text style={styles.headerSubtitle}>Saldo Disponible</Text>
        </View>

        {/* ── Cuerpo ────────────────────────────────────────────── */}
        <View style={styles.body}>

          {/* Feedback banner */}
          <FeedbackBanner type={feedback} />

          {/* ── Estado: opciones principales ─────────────────────── */}
          {!scanMode && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Canjear Puntos</Text>
                <Text style={styles.sectionSubtitle}>
                  Escanea el código QR de tu recibo
                </Text>
              </View>

              <View style={styles.scanOptions}>
                <ScanOptionButton
                  icon="qr-code-outline"
                  title="Escanear QR"
                  subtitle="Usar la cámara"
                  variant="primary"
                  onPress={handleOpenCamera}
                />
                <ScanOptionButton
                  icon="keypad-outline"
                  title="Ingresar Código"
                  subtitle="Escribir manualmente"
                  variant="secondary"
                  onPress={() => setScanMode('manual')}
                />
              </View>
            </>
          )}

          {/* ── Estado: ingreso manual ───────────────────────────── */}
          {scanMode === 'manual' && (
            <View style={styles.manualContainer}>
              <Text style={styles.label}>Código del Recibo</Text>
              <TextInput
                style={styles.manualInput}
                value={manualCode}
                onChangeText={v => setManualCode(v.toUpperCase())}
                placeholder="Ej: SGMX123456789"
                placeholderTextColor={Colors.mutedForeground}
                autoCapitalize="characters"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleManualSubmit}
              />
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  manualCode.trim() ? styles.actionButtonActive : styles.actionButtonDisabled,
                ]}
                onPress={handleManualSubmit}
                disabled={!manualCode.trim()}
                activeOpacity={0.85}
              >
                <Text style={styles.actionButtonText}>Canjear Código</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} activeOpacity={0.7}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Tarjetas de estadísticas ─────────────────────────── */}
          <View style={styles.statsContainer}>
            <StatCard
              label="Visitas Este Mes"
              value={String(MOCK_USER.visitasMes)}
            />
            <StatCard
              label="Puntos Ganados Este Mes"
              value={`+${MOCK_USER.puntosMes.toLocaleString('es-MX')}`}
              valueColor={Colors.yellow}
            />
          </View>

        </View>
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
    paddingTop: Platform.OS === 'android' ? Spacing['3xl'] : Spacing.xl,
    paddingBottom: Spacing['3xl'],
  },
  headerGreeting: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.normal,
    color: Colors.yellow,
    marginBottom: Spacing.xs,
  },
  headerBalanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
  },
  headerBalance: {
    fontSize: 52,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    letterSpacing: -1,
  },
  headerBalanceLabel: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.medium,
    color: Colors.yellow,
  },
  headerSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.white,
    opacity: 0.8,
    marginTop: Spacing.xs,
  },

  // ── Cuerpo ──────────────────────────────────────────────
  body: {
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['3xl'],
    gap: Spacing['2xl'],
  },

  // ── Feedback banner ─────────────────────────────────────
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.md,
    gap: Spacing.md,
  },
  feedbackSuccess: { backgroundColor: '#10B981' },
  feedbackError:   { backgroundColor: '#EF4444' },
  feedbackTextContainer: { flex: 1 },
  feedbackTitle: {
    color: Colors.white,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.base,
  },
  feedbackSubtitle: {
    color: Colors.white,
    fontSize: FontSize.sm,
    opacity: 0.9,
    marginTop: 2,
  },

  // ── Sección canjear ─────────────────────────────────────
  sectionHeader: { alignItems: 'center', gap: Spacing.xs },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.navy,
  },
  sectionSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.navyOpacity70,
  },

  // ── Botones de opción ───────────────────────────────────
  scanOptions: { gap: Spacing.md },
  scanOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.xl,
    borderRadius: Radius.xl,
  },
  scanOptionPrimary: {
    backgroundColor: Colors.yellow,
    shadowColor: Colors.yellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  scanOptionSecondary: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.navy,
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  scanOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  scanOptionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanOptionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.navy,
  },
  scanOptionTitleSecondary: { color: Colors.navy },
  scanOptionSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.navyOpacity70,
    marginTop: 2,
  },
  scanOptionSubtitleSecondary: { color: Colors.navyOpacity70 },

  // ── Ingreso manual ──────────────────────────────────────
  manualContainer: { gap: Spacing.md },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.navy,
  },
  manualInput: {
    width: '100%',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.navy,
    color: Colors.navy,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    backgroundColor: Colors.white,
    letterSpacing: 1,
  },
  actionButton: {
    paddingVertical: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  actionButtonActive:   { backgroundColor: Colors.yellow },
  actionButtonDisabled: { backgroundColor: Colors.muted },
  actionButtonText: {
    color: Colors.navy,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.base,
  },
  cancelButton: {
    paddingVertical: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.navy,
    backgroundColor: Colors.white,
  },
  cancelButtonText: {
    color: Colors.navy,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.base,
  },

  // ── Estadísticas ────────────────────────────────────────
  statsContainer: { gap: Spacing.md },
  statCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: Colors.inputBackground,
  },
  statLabel: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.navy,
    flex: 1,
  },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
});