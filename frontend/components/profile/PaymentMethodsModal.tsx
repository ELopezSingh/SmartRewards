import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Props {
  visible: boolean;
  onClose: () => void;
}

interface MetodoPago {
  id: number;
  tipo: string;
  ultimos4: string;
  vencimiento: string;
  esPrincipal: boolean;
}

// ─── Datos mock ───────────────────────────────────────────────────────────────
// TODO: conectar con backend cuando se implemente el módulo de pagos
const METODOS_PAGO: MetodoPago[] = [
  { id: 1, tipo: 'Visa',       ultimos4: '4242', vencimiento: '12/26', esPrincipal: true  },
  { id: 2, tipo: 'Mastercard', ultimos4: '8888', vencimiento: '03/27', esPrincipal: false },
];

// ─── Componente ───────────────────────────────────────────────────────────────
export default function PaymentMethodsModal({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.sheet} activeOpacity={1} onPress={() => {}}>

          {/* ── Header ───────────────────────────────────── */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Métodos de Pago</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color={Colors.navy} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.content}>

              {/* ── Lista de tarjetas ─────────────────────── */}
              {METODOS_PAGO.map(metodo => (
                <View
                  key={metodo.id}
                  style={[styles.card, metodo.esPrincipal && styles.cardPrincipal]}
                >
                  <View style={styles.cardRow}>
                    <View style={styles.cardLeft}>
                      <View style={styles.cardIconWrap}>
                        <Ionicons name="card" size={20} color={Colors.navy} />
                      </View>
                      <View>
                        <Text style={styles.cardTipo}>
                          {metodo.tipo} •••• {metodo.ultimos4}
                        </Text>
                        <Text style={styles.cardVence}>Vence {metodo.vencimiento}</Text>
                      </View>
                    </View>
                    {metodo.esPrincipal && (
                      <View style={styles.badgePrincipal}>
                        <Text style={styles.badgePrincipalText}>Principal</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}

              {/* ── Agregar método ─────────────────────────── */}
              <TouchableOpacity
                style={styles.addButton}
                activeOpacity={0.85}
                onPress={() => {
                  // TODO: implementar agregar método de pago
                }}
              >
                <Ionicons name="add" size={20} color={Colors.navy} />
                <Text style={styles.addButtonText}>Agregar Método de Pago</Text>
              </TouchableOpacity>

              {/* ── Nota de seguridad ─────────────────────── */}
              <Text style={styles.securityNote}>
                Tus datos de pago están protegidos y encriptados
              </Text>

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

  card:          { padding: Spacing.lg, borderRadius: Radius.xl, backgroundColor: Colors.inputBackground, borderWidth: 1, borderColor: Colors.border },
  cardPrincipal: { backgroundColor: 'rgba(255,213,0,0.1)', borderColor: Colors.yellow },
  cardRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardLeft:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  cardIconWrap:  { width: 40, height: 40, borderRadius: Radius.md, backgroundColor: Colors.yellow, alignItems: 'center', justifyContent: 'center' },
  cardTipo:      { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.navy },
  cardVence:     { fontSize: FontSize.xs, color: Colors.navyOpacity70, marginTop: 2 },

  badgePrincipal:     { paddingVertical: 3, paddingHorizontal: Spacing.sm, borderRadius: Radius.full, backgroundColor: Colors.yellow },
  badgePrincipalText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.navy },

  addButton:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.lg, borderRadius: Radius.xl, backgroundColor: Colors.yellow, marginTop: Spacing.sm },
  addButtonText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.navy },

  securityNote: { fontSize: FontSize.xs, color: Colors.navyOpacity70, textAlign: 'center', marginTop: Spacing.sm },
});