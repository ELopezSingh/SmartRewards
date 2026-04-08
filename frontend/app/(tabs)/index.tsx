import { useState, useEffect } from 'react';
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
  Modal,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';

// ─── Tipos ────────────────────────────────────────────────────────────────────
type FeedbackType = 'success' | 'error' | null;

// ─── Datos mock (reemplazar con contexto de autenticación del backend) ─────────
const MOCK_USER = {
  nombre: 'Emiliano',
  balance: 3_450,
  visitasMes: 12,
  puntosMes: 850,
};

// ─── Subcomponentes ───────────────────────────────────────────────────────────

/** Banner de feedback al canjear */
function FeedbackBanner({ type }: { type: FeedbackType }) {
  if (!type) return null;
  const isSuccess = type === 'success';
  return (
    <View style={[styles.feedbackBanner, isSuccess ? styles.feedbackSuccess : styles.feedbackError]}>
      <Ionicons name={isSuccess ? 'checkmark-circle' : 'close-circle'} size={24} color={Colors.white} />
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

/** Tarjeta de estadística */
function StatCard({ label, value, valueColor = Colors.navy }: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────
export default function HomeScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackType>(null);
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualCode, setManualCode] = useState('');

  // Solicitar permisos al montar la pantalla
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, []);

  const processCode = (code: string) => {
    setScanned(true);
    const isValid = code.trim().length > 0;
    setFeedback(isValid ? 'success' : 'error');
    setTimeout(() => {
      setFeedback(null);
      setScanned(false); // Resetea para permitir otro escaneo
    }, 3000);
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    processCode(data);
  };

  const handleManualSubmit = () => {
    if (!manualCode.trim()) return;
    setShowManualModal(false);
    processCode(manualCode);
    setManualCode('');
  };

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

          {/* ── Sección cámara ───────────────────────────────────── */}
          <View style={styles.scanSection}>
            <Text style={styles.scanTitle}>Canjear Puntos</Text>
            <Text style={styles.scanSubtitle}>Apunta al código QR de tu recibo</Text>

            {/* Ventana de cámara */}
            <View style={styles.cameraWrapper}>
              {permission?.granted ? (
                <>
                  <CameraView
                    style={styles.camera}
                    facing="back"
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                  />

                  {/* Esquinas del marco QR */}
                  <View style={styles.cornerTL} />
                  <View style={styles.cornerTR} />
                  <View style={styles.cornerBL} />
                  <View style={styles.cornerBR} />

                  {/* Overlay de éxito al escanear */}
                  {scanned && (
                    <View style={styles.scannedOverlay}>
                      <Ionicons name="checkmark-circle" size={52} color={Colors.yellow} />
                      <Text style={styles.scannedOverlayText}>¡Escaneado!</Text>
                    </View>
                  )}
                </>
              ) : (
                // Sin permisos de cámara
                <View style={styles.noPermissionBox}>
                  <Ionicons name="camera-outline" size={40} color={Colors.mutedForeground} />
                  <Text style={styles.noPermissionText}>
                    Se necesita acceso a la cámara
                  </Text>
                  <TouchableOpacity
                    style={styles.permissionButton}
                    onPress={requestPermission}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.permissionButtonText}>Permitir acceso</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Botón ingreso manual */}
            <TouchableOpacity
              style={styles.manualButton}
              onPress={() => setShowManualModal(true)}
              activeOpacity={0.75}
            >
              <Ionicons name="keypad-outline" size={18} color={Colors.navy} />
              <Text style={styles.manualButtonText}>Ingresar código manualmente</Text>
            </TouchableOpacity>
          </View>

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

      {/* ── Modal de ingreso manual ───────────────────────────────── */}
      <Modal
        visible={showManualModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowManualModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>

            {/* Header del modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ingresar Código</Text>
              <TouchableOpacity onPress={() => setShowManualModal(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={24} color={Colors.navy} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Código del Recibo</Text>
            <TextInput
              style={styles.modalInput}
              value={manualCode}
              onChangeText={v => setManualCode(v.toUpperCase())}
              placeholder="Ej: SGMX123456789"
              placeholderTextColor={Colors.mutedForeground}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleManualSubmit}
              autoFocus
            />

            <TouchableOpacity
              style={[
                styles.modalButton,
                !manualCode.trim() && styles.modalButtonDisabled,
              ]}
              onPress={handleManualSubmit}
              disabled={!manualCode.trim()}
              activeOpacity={0.85}
            >
              <Text style={styles.modalButtonText}>Canjear Código</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const CORNER_SIZE = 24;
const CORNER_THICKNESS = 3;

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

  // ── Sección de escáner ──────────────────────────────────
  scanSection: {
    gap: Spacing.lg,
    alignItems: 'center',
  },
  scanTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.navy,
  },
  scanSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.navyOpacity70,
    marginTop: -Spacing.sm,
  },

  // ── Ventana de cámara ───────────────────────────────────
  cameraWrapper: {
    width: '100%',
    height: 260,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.muted,
    position: 'relative',
    // Borde amarillo
    borderWidth: 3,
    borderColor: Colors.yellow,
  },
  camera: {
    flex: 1,
  },

  // ── Esquinas del marco ──────────────────────────────────
  cornerTL: {
    position: 'absolute', top: 12, left: 12,
    width: CORNER_SIZE, height: CORNER_SIZE,
    borderTopWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS,
    borderColor: Colors.white, borderTopLeftRadius: 4,
  },
  cornerTR: {
    position: 'absolute', top: 12, right: 12,
    width: CORNER_SIZE, height: CORNER_SIZE,
    borderTopWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS,
    borderColor: Colors.white, borderTopRightRadius: 4,
  },
  cornerBL: {
    position: 'absolute', bottom: 12, left: 12,
    width: CORNER_SIZE, height: CORNER_SIZE,
    borderBottomWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS,
    borderColor: Colors.white, borderBottomLeftRadius: 4,
  },
  cornerBR: {
    position: 'absolute', bottom: 12, right: 12,
    width: CORNER_SIZE, height: CORNER_SIZE,
    borderBottomWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS,
    borderColor: Colors.white, borderBottomRightRadius: 4,
  },

  // ── Overlay al escanear ─────────────────────────────────
  scannedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  scannedOverlayText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },

  // ── Sin permisos ────────────────────────────────────────
  noPermissionBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing['2xl'],
  },
  noPermissionText: {
    fontSize: FontSize.sm,
    color: Colors.mutedForeground,
    textAlign: 'center',
  },
  permissionButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.full,
    backgroundColor: Colors.yellow,
  },
  permissionButtonText: {
    color: Colors.navy,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.sm,
  },

  // ── Botón ingreso manual ────────────────────────────────
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  manualButtonText: {
    fontSize: FontSize.sm,
    color: Colors.navy,
    textDecorationLine: 'underline',
    fontWeight: FontWeight.medium,
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

  // ── Modal ingreso manual ────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing['2xl'],
    paddingBottom: Platform.OS === 'ios' ? Spacing['5xl'] : Spacing['2xl'],
    gap: Spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.navy,
  },
  modalLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.navy,
  },
  modalInput: {
    width: '100%',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.navy,
    color: Colors.navy,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    letterSpacing: 1,
  },
  modalButton: {
    width: '100%',
    paddingVertical: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: Colors.yellow,
    alignItems: 'center',
  },
  modalButtonDisabled: {
    backgroundColor: Colors.muted,
  },
  modalButtonText: {
    color: Colors.navy,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.base,
  },
});
