import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';

/**
 * Pantalla modal de escáner QR.
 * Usa expo-camera (CameraView + useCameraPermissions).
 *
 * Instalación requerida (si no está ya en tu proyecto):
 *   npx expo install expo-camera
 */

export default function QRModal() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  // Solicitar permisos al montar
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    // TODO: enviar `data` al backend para validar y canjear
    // Por ahora regresamos con el código como parámetro
    router.replace({ pathname: '/(tabs)', params: { scannedCode: data } });
  };

  const handleClose = () => router.back();

  // ── Sin permisos aún ──────────────────────────────────────
  if (!permission) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <Text style={styles.permissionText}>Verificando permisos de cámara...</Text>
      </SafeAreaView>
    );
  }

  // ── Permiso denegado ──────────────────────────────────────
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <View style={styles.permissionBox}>
          <Ionicons name="camera-outline" size={52} color={Colors.navy} style={{ marginBottom: Spacing.lg }} />
          <Text style={styles.permissionTitle}>Permiso de Cámara</Text>
          <Text style={styles.permissionSubtitle}>
            SmartRewards necesita acceso a la cámara para escanear códigos QR de tus recibos.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission} activeOpacity={0.85}>
            <Text style={styles.permissionButtonText}>Permitir Acceso</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose} activeOpacity={0.7}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Cámara activa ─────────────────────────────────────────
  return (
    <View style={styles.cameraContainer}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />

      {/* Overlay oscuro con recorte central */}
      <View style={styles.overlay}>

        {/* Fila superior — botón cerrar */}
        <View style={styles.overlayTop}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose} activeOpacity={0.8}>
            <Ionicons name="close" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Marco del QR */}
        <View style={styles.scanArea}>
          {/* Esquinas del marco amarillo */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>

        {/* Instrucción inferior */}
        <View style={styles.overlayBottom}>
          <Text style={styles.scanInstruction}>
            {scanned ? '✓ Código detectado' : 'Centra el código QR en el recuadro'}
          </Text>
          {scanned && (
            <TouchableOpacity
              style={styles.rescanButton}
              onPress={() => setScanned(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.rescanButtonText}>Escanear otro</Text>
            </TouchableOpacity>
          )}
        </View>

      </View>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const SCAN_SIZE = 260;
const CORNER_SIZE = 28;
const CORNER_THICKNESS = 4;

const styles = StyleSheet.create({
  // ── Permisos ─────────────────────────────────────────────
  centeredContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['2xl'],
  },
  permissionBox: {
    alignItems: 'center',
    width: '100%',
  },
  permissionText: {
    color: Colors.mutedForeground,
    fontSize: FontSize.base,
  },
  permissionTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.navy,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  permissionSubtitle: {
    fontSize: FontSize.base,
    color: Colors.navyOpacity70,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing['2xl'],
  },
  permissionButton: {
    width: '100%',
    paddingVertical: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: Colors.yellow,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  permissionButtonText: {
    color: Colors.navy,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.base,
  },
  cancelButton: {
    width: '100%',
    paddingVertical: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.navy,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.navy,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.base,
  },

  // ── Cámara ───────────────────────────────────────────────
  cameraContainer: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  overlayTop: {
    width: '100%',
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingHorizontal: Spacing['2xl'],
    alignItems: 'flex-end',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Marco QR ─────────────────────────────────────────────
  scanArea: {
    width: SCAN_SIZE,
    height: SCAN_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: Colors.yellow,
  },
  cornerTL: {
    top: 0, left: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    top: 0, right: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    bottom: 0, left: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    bottom: 0, right: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderBottomRightRadius: 4,
  },

  // ── Instrucciones ─────────────────────────────────────────
  overlayBottom: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 60 : 40,
    gap: Spacing.lg,
  },
  scanInstruction: {
    color: Colors.white,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
    paddingHorizontal: Spacing['2xl'],
    opacity: 0.9,
  },
  rescanButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing['2xl'],
    borderRadius: Radius.full,
    backgroundColor: Colors.yellow,
  },
  rescanButtonText: {
    color: Colors.navy,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.sm,
  },
});
