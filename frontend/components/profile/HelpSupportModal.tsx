import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Props {
  visible: boolean;
  onClose: () => void;
}

type IoniconsName = keyof typeof Ionicons.glyphMap;

interface OpcionSoporte {
  id: number;
  icono: IoniconsName;
  titulo: string;
  descripcion: string;
  accion: () => void;
}

// ─── Componente ───────────────────────────────────────────────────────────────
export default function HelpSupportModal({ visible, onClose }: Props) {

  const opciones: OpcionSoporte[] = [
    {
      id: 1,
      icono: 'chatbubble-ellipses-outline',
      titulo: 'Chat en Vivo',
      descripcion: 'Habla con un asesor en tiempo real',
      accion: () => {}, // TODO: abrir chat en vivo
    },
    {
      id: 2,
      icono: 'call-outline',
      titulo: 'Llamar al Centro de Ayuda',
      descripcion: '800-SMARTGAS (762-7842)',
      accion: () => Linking.openURL('tel:800762-7842'),
    },
    {
      id: 3,
      icono: 'mail-outline',
      titulo: 'Enviar Correo',
      descripcion: 'soporte@smartgas.com.mx',
      accion: () => Linking.openURL('mailto:soporte@smartgas.com.mx'),
    },
    {
      id: 4,
      icono: 'document-text-outline',
      titulo: 'Preguntas Frecuentes',
      descripcion: 'Encuentra respuestas rápidas',
      accion: () => {}, // TODO: abrir pantalla de FAQ
    },
  ];

  const temasPopulares = [
    'Cómo usar mi código QR',
    'Administrar puntos de lealtad',
    'Actualizar información de cuenta',
    'Reportar un problema',
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.sheet} activeOpacity={1} onPress={() => {}}>

          {/* ── Header ───────────────────────────────────── */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Ayuda y Soporte</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color={Colors.navy} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.content}>

              {/* ── Opciones de contacto ──────────────────── */}
              <Text style={styles.sectionLabel}>CONTÁCTANOS</Text>
              {opciones.map(opcion => (
                <TouchableOpacity
                  key={opcion.id}
                  style={styles.opcionCard}
                  onPress={opcion.accion}
                  activeOpacity={0.8}
                >
                  <View style={styles.opcionIconWrap}>
                    <Ionicons name={opcion.icono} size={24} color={Colors.navy} />
                  </View>
                  <View style={styles.opcionTexto}>
                    <Text style={styles.opcionTitulo}>{opcion.titulo}</Text>
                    <Text style={styles.opcionDescripcion}>{opcion.descripcion}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.navyOpacity20} />
                </TouchableOpacity>
              ))}

              {/* ── Temas populares ───────────────────────── */}
              <Text style={[styles.sectionLabel, { marginTop: Spacing.sm }]}>TEMAS POPULARES</Text>
              {temasPopulares.map((tema, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.temaCard}
                  activeOpacity={0.8}
                  onPress={() => {}} // TODO: abrir detalle de FAQ
                >
                  <Text style={styles.temaTitulo}>{tema}</Text>
                  <Ionicons name="chevron-forward" size={18} color={Colors.navyOpacity20} />
                </TouchableOpacity>
              ))}

              {/* ── Horario de atención ───────────────────── */}
              <View style={styles.horarioBox}>
                <Text style={styles.horarioTitulo}>Horario de atención: Lunes a Domingo</Text>
                <Text style={styles.horarioSubtitulo}>6:00 AM - 10:00 PM (Hora del Centro)</Text>
              </View>

            </View>
          </ScrollView>

        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet:       { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing['2xl'], paddingVertical: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.navy },
  closeButton: { padding: Spacing.sm, borderRadius: Radius.full, backgroundColor: Colors.inputBackground },
  content:     { padding: Spacing['2xl'], gap: Spacing.md },

  sectionLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.navyOpacity70, letterSpacing: 0.5 },

  opcionCard:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg, borderRadius: Radius.xl, backgroundColor: Colors.inputBackground },
  opcionIconWrap: { width: 48, height: 48, borderRadius: Radius.xl, backgroundColor: Colors.yellow, alignItems: 'center', justifyContent: 'center' },
  opcionTexto:    { flex: 1 },
  opcionTitulo:   { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.navy, marginBottom: 2 },
  opcionDescripcion: { fontSize: FontSize.xs, color: Colors.navyOpacity70 },

  temaCard:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, borderRadius: Radius.xl, backgroundColor: Colors.inputBackground },
  temaTitulo:  { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.navy },

  horarioBox:      { padding: Spacing.lg, borderRadius: Radius.xl, backgroundColor: 'rgba(255,213,0,0.1)', alignItems: 'center', marginTop: Spacing.sm },
  horarioTitulo:   { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.navy, textAlign: 'center' },
  horarioSubtitulo:{ fontSize: FontSize.sm, color: Colors.navyOpacity70, textAlign: 'center', marginTop: 4 },
});