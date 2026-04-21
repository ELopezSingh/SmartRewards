import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { Usuario } from '@/api/auth';
import { cambiarPassword } from '@/api/perfil';

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Props {
  visible: boolean;
  onClose: () => void;
  usuario: Usuario | null;
}

// ─── Componente ───────────────────────────────────────────────────────────────
export default function PersonalInfoModal({ visible, onClose, usuario }: Props) {
  const [cambiandoPassword, setCambiandoPassword] = useState(false);
  const [showActual, setShowActual] = useState(false);
  const [showNueva, setShowNueva] = useState(false);
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  const resetForm = () => {
    setCambiandoPassword(false);
    setPasswordActual('');
    setPasswordNueva('');
    setConfirmPassword('');
    setError(null);
    setExito(false);
    setShowActual(false);
    setShowNueva(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCambiarPassword = async () => {
    if (!passwordActual || !passwordNueva || !confirmPassword) {
      setError('Todos los campos son requeridos');
      return;
    }
    if (passwordNueva.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (passwordNueva !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    setError(null);

    const { ok, error: apiError } = await cambiarPassword({
      passwordActual,
      passwordNueva,
    });

    setLoading(false);

    if (!ok) {
      setError(apiError);
      return;
    }

    setExito(true);
    setTimeout(() => {
      resetForm();
    }, 2000);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleClose}>
        <TouchableOpacity style={styles.sheet} activeOpacity={1} onPress={() => {}}>

          {/* ── Header ───────────────────────────────────── */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Información Personal</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color={Colors.navy} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.content}>

              {!cambiandoPassword ? (
                <>
                  {/* ── Información del usuario ────────── */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Nombre Completo</Text>
                    <View style={styles.fieldValue}>
                      <Text style={styles.fieldValueText}>
                        {usuario ? `${usuario.nombre} ${usuario.apellido}` : '—'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Correo Electrónico</Text>
                    <View style={styles.fieldValue}>
                      <Text style={styles.fieldValueText}>{usuario?.email ?? '—'}</Text>
                    </View>
                  </View>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Teléfono</Text>
                    <View style={styles.fieldValue}>
                      <Text style={styles.fieldValueText}>{usuario?.telefono ?? '—'}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => setCambiandoPassword(true)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.primaryButtonText}>Cambiar Contraseña</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  {/* ── Formulario cambio de contraseña ── */}
                  {exito ? (
                    <View style={styles.exitoBox}>
                      <Ionicons name="checkmark-circle" size={48} color="#10B981" />
                      <Text style={styles.exitoText}>¡Contraseña actualizada exitosamente!</Text>
                    </View>
                  ) : (
                    <>
                      {error && (
                        <View style={styles.errorBanner}>
                          <Ionicons name="alert-circle-outline" size={16} color={Colors.destructive} />
                          <Text style={styles.errorText}>{error}</Text>
                        </View>
                      )}

                      {/* Contraseña actual */}
                      <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Contraseña Actual</Text>
                        <View style={styles.passwordWrap}>
                          <TextInput
                            style={styles.passwordInput}
                            value={passwordActual}
                            onChangeText={v => { setPasswordActual(v); setError(null); }}
                            placeholder="Ingresa tu contraseña actual"
                            placeholderTextColor={Colors.mutedForeground}
                            secureTextEntry={!showActual}
                            autoCapitalize="none"
                            editable={!loading}
                          />
                          <TouchableOpacity onPress={() => setShowActual(!showActual)} style={styles.eyeBtn}>
                            <Ionicons name={showActual ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.navyOpacity70} />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Nueva contraseña */}
                      <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Nueva Contraseña</Text>
                        <View style={styles.passwordWrap}>
                          <TextInput
                            style={styles.passwordInput}
                            value={passwordNueva}
                            onChangeText={v => { setPasswordNueva(v); setError(null); }}
                            placeholder="Mínimo 8 caracteres"
                            placeholderTextColor={Colors.mutedForeground}
                            secureTextEntry={!showNueva}
                            autoCapitalize="none"
                            editable={!loading}
                          />
                          <TouchableOpacity onPress={() => setShowNueva(!showNueva)} style={styles.eyeBtn}>
                            <Ionicons name={showNueva ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.navyOpacity70} />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Confirmar contraseña */}
                      <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Confirmar Nueva Contraseña</Text>
                        <TextInput
                          style={styles.input}
                          value={confirmPassword}
                          onChangeText={v => { setConfirmPassword(v); setError(null); }}
                          placeholder="Repite tu nueva contraseña"
                          placeholderTextColor={Colors.mutedForeground}
                          secureTextEntry
                          autoCapitalize="none"
                          editable={!loading}
                        />
                      </View>

                      {/* Botones */}
                      <View style={styles.row}>
                        <TouchableOpacity
                          style={styles.cancelButton}
                          onPress={resetForm}
                          activeOpacity={0.7}
                          disabled={loading}
                        >
                          <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.primaryButton, styles.flex1, loading && { opacity: 0.7 }]}
                          onPress={handleCambiarPassword}
                          activeOpacity={0.85}
                          disabled={loading}
                        >
                          {loading
                            ? <ActivityIndicator size="small" color={Colors.navy} />
                            : <Text style={styles.primaryButtonText}>Guardar</Text>
                          }
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </>
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
  content:     { padding: Spacing['2xl'], gap: Spacing.lg },
  fieldGroup:  { gap: Spacing.sm },
  fieldLabel:  { fontSize: FontSize.sm, color: Colors.navyOpacity70 },
  fieldValue:  { padding: Spacing.lg, borderRadius: Radius.xl, backgroundColor: Colors.inputBackground },
  fieldValueText: { fontSize: FontSize.base, fontWeight: FontWeight.medium, color: Colors.navy },
  input: {
    padding: Spacing.lg, borderRadius: Radius.xl,
    backgroundColor: Colors.inputBackground, borderWidth: 1, borderColor: Colors.border,
    fontSize: FontSize.base, color: Colors.navy,
  },
  passwordWrap:  { position: 'relative' },
  passwordInput: {
    padding: Spacing.lg, paddingRight: Spacing['5xl'], borderRadius: Radius.xl,
    backgroundColor: Colors.inputBackground, borderWidth: 1, borderColor: Colors.border,
    fontSize: FontSize.base, color: Colors.navy,
  },
  eyeBtn: { position: 'absolute', right: Spacing.md, top: 0, bottom: 0, justifyContent: 'center', paddingHorizontal: Spacing.xs },
  primaryButton: { backgroundColor: Colors.yellow, padding: Spacing.lg, borderRadius: Radius.xl, alignItems: 'center', minHeight: 52, justifyContent: 'center' },
  primaryButtonText: { color: Colors.navy, fontWeight: FontWeight.semibold, fontSize: FontSize.base },
  cancelButton:  { flex: 1, padding: Spacing.lg, borderRadius: Radius.xl, alignItems: 'center', backgroundColor: Colors.inputBackground },
  cancelButtonText: { color: Colors.navy, fontWeight: FontWeight.semibold, fontSize: FontSize.base },
  row:    { flexDirection: 'row', gap: Spacing.md },
  flex1:  { flex: 1 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: '#FEE2E2' },
  errorText:   { flex: 1, fontSize: FontSize.sm, color: Colors.destructive, fontWeight: FontWeight.medium },
  exitoBox:    { alignItems: 'center', gap: Spacing.lg, paddingVertical: Spacing['3xl'] },
  exitoText:   { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.navy, textAlign: 'center' },
});