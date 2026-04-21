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

type TipoNotificacion = 'transaccion' | 'promocion';

interface Notificacion {
  id: number;
  tipo: TipoNotificacion;
  titulo: string;
  descripcion: string;
  tiempo: string;
  esNueva: boolean;
}

// ─── Datos mock ───────────────────────────────────────────────────────────────
// TODO: conectar con backend cuando se implemente el módulo de notificaciones
const NOTIFICACIONES: Notificacion[] = [
  { id: 1, tipo: 'transaccion', titulo: 'Compra realizada',         descripcion: 'Transacción de $450 en Smartgas Centro',  tiempo: 'Hace 2 horas',  esNueva: true  },
  { id: 2, tipo: 'promocion',   titulo: '¡Nueva promoción!',        descripcion: '20% de descuento en diesel premium',       tiempo: 'Hace 5 horas',  esNueva: true  },
  { id: 3, tipo: 'transaccion', titulo: 'Compra realizada',         descripcion: 'Transacción de $380 en Smartgas Norte',   tiempo: 'Hace 1 día',    esNueva: false },
  { id: 4, tipo: 'promocion',   titulo: 'Puntos próximos a vencer', descripcion: '500 puntos vencen el 30 de abril',         tiempo: 'Hace 2 días',   esNueva: false },
  { id: 5, tipo: 'transaccion', titulo: 'Compra realizada',         descripcion: 'Transacción de $520 en Smartgas Sur',     tiempo: 'Hace 3 días',   esNueva: false },
];

// ─── Componente ───────────────────────────────────────────────────────────────
export default function NotificationsModal({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.sheet} activeOpacity={1} onPress={() => {}}>

          {/* ── Header ───────────────────────────────────── */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Notificaciones</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color={Colors.navy} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.content}>

              {NOTIFICACIONES.length > 0 ? (
                NOTIFICACIONES.map(notif => (
                  <View
                    key={notif.id}
                    style={[styles.notifCard, notif.esNueva && styles.notifCardNueva]}
                  >
                    <View style={styles.notifRow}>
                      {/* Ícono */}
                      <View style={[
                        styles.notifIconWrap,
                        notif.tipo === 'transaccion' ? styles.iconTransaccion : styles.iconPromocion,
                      ]}>
                        <Ionicons
                          name={notif.tipo === 'transaccion' ? 'receipt-outline' : 'pricetag-outline'}
                          size={20}
                          color={notif.tipo === 'transaccion' ? Colors.yellow : Colors.navy}
                        />
                      </View>

                      {/* Texto */}
                      <View style={styles.notifContent}>
                        <View style={styles.notifTitleRow}>
                          <Text style={styles.notifTitulo}>{notif.titulo}</Text>
                          {notif.esNueva && <View style={styles.dotNueva} />}
                        </View>
                        <Text style={styles.notifDescripcion}>{notif.descripcion}</Text>
                        <Text style={styles.notifTiempo}>{notif.tiempo}</Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                // Estado vacío
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconWrap}>
                    <Ionicons name="notifications-off-outline" size={32} color={Colors.navyOpacity20} />
                  </View>
                  <Text style={styles.emptyText}>No tienes notificaciones nuevas</Text>
                </View>
              )}

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

  notifCard:      { padding: Spacing.lg, borderRadius: Radius.xl, backgroundColor: Colors.inputBackground },
  notifCardNueva: { backgroundColor: 'rgba(255,213,0,0.1)' },
  notifRow:       { flexDirection: 'row', gap: Spacing.md },
  notifIconWrap:  { width: 40, height: 40, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  iconTransaccion:{ backgroundColor: Colors.navy },
  iconPromocion:  { backgroundColor: Colors.yellow },
  notifContent:   { flex: 1, gap: 4 },
  notifTitleRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  notifTitulo:    { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.navy, flex: 1 },
  dotNueva:       { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', marginLeft: Spacing.sm, flexShrink: 0 },
  notifDescripcion:{ fontSize: FontSize.sm, color: Colors.navyOpacity70 },
  notifTiempo:    { fontSize: FontSize.xs, color: Colors.mutedForeground },

  emptyState:   { alignItems: 'center', paddingVertical: Spacing['5xl'], gap: Spacing.md },
  emptyIconWrap:{ width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.inputBackground, alignItems: 'center', justifyContent: 'center' },
  emptyText:    { fontSize: FontSize.sm, color: Colors.navyOpacity70 },
});