import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  TextInput as TextInputType,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { registro } from '@/api/auth';

export default function RegisterScreen() {
  const router = useRouter();

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<typeof form>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const apellidoRef = useRef<TextInputType>(null);
  const emailRef    = useRef<TextInputType>(null);
  const telefonoRef = useRef<TextInputType>(null);
  const passwordRef = useRef<TextInputType>(null);
  const confirmRef  = useRef<TextInputType>(null);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    if (apiError) setApiError(null);
  };

  const validate = (): boolean => {
    const errors: Partial<typeof form> = {};
    if (!form.nombre.trim())     errors.nombre = 'El nombre es requerido';
    if (!form.apellido.trim())   errors.apellido = 'El apellido es requerido';
    if (!form.email.trim())      errors.email = 'El correo es requerido';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Correo no válido';
    if (!form.telefono.trim())   errors.telefono = 'El teléfono es requerido';
    else if (form.telefono.replace(/\D/g, '').length < 10)
      errors.telefono = 'Ingresa un teléfono válido (10 dígitos)';
    if (!form.password)          errors.password = 'La contraseña es requerida';
    else if (form.password.length < 8) errors.password = 'Mínimo 8 caracteres';
    if (!form.confirmPassword)   errors.confirmPassword = 'Confirma tu contraseña';
    else if (form.password !== form.confirmPassword)
      errors.confirmPassword = 'Las contraseñas no coinciden';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    setApiError(null);

    const { usuario, error } = await registro({
      nombre:   form.nombre.trim(),
      apellido: form.apellido.trim(),
      email:    form.email.trim(),
      telefono: form.telefono.trim(),
      password: form.password,
    });

    setLoading(false);

    if (error) {
      setApiError(error);
      return;
    }

    // Registro exitoso → navegar al home
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Botón atrás */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={Colors.navy} />
          </TouchableOpacity>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoTitle}>SmartRewards</Text>
            <Text style={styles.logoSubtitle}>por Smartgas</Text>
          </View>

          <Text style={styles.sectionTitle}>Crear cuenta nueva</Text>

          <View style={styles.form}>

            {/* Banner de error de API */}
            {apiError && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle-outline" size={18} color={Colors.destructive} />
                <Text style={styles.errorBannerText}>{apiError}</Text>
              </View>
            )}

            {/* Nombre y Apellido */}
            <View style={styles.row}>
              <View style={[styles.fieldContainer, styles.halfField]}>
                <Text style={styles.label}>Nombre</Text>
                <TextInput
                  style={[styles.input, fieldErrors.nombre ? styles.inputError : null]}
                  value={form.nombre}
                  onChangeText={v => updateField('nombre', v)}
                  placeholder="Juan"
                  placeholderTextColor={Colors.mutedForeground}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={() => apellidoRef.current?.focus()}
                  editable={!loading}
                />
                {fieldErrors.nombre ? <Text style={styles.errorText}>{fieldErrors.nombre}</Text> : null}
              </View>
              <View style={[styles.fieldContainer, styles.halfField]}>
                <Text style={styles.label}>Apellido</Text>
                <TextInput
                  ref={apellidoRef}
                  style={[styles.input, fieldErrors.apellido ? styles.inputError : null]}
                  value={form.apellido}
                  onChangeText={v => updateField('apellido', v)}
                  placeholder="Pérez"
                  placeholderTextColor={Colors.mutedForeground}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                  editable={!loading}
                />
                {fieldErrors.apellido ? <Text style={styles.errorText}>{fieldErrors.apellido}</Text> : null}
              </View>
            </View>

            {/* Email */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <TextInput
                ref={emailRef}
                style={[styles.input, fieldErrors.email ? styles.inputError : null]}
                value={form.email}
                onChangeText={v => updateField('email', v)}
                placeholder="tu.correo@ejemplo.com"
                placeholderTextColor={Colors.mutedForeground}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => telefonoRef.current?.focus()}
                editable={!loading}
              />
              {fieldErrors.email ? <Text style={styles.errorText}>{fieldErrors.email}</Text> : null}
            </View>

            {/* Teléfono */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                ref={telefonoRef}
                style={[styles.input, fieldErrors.telefono ? styles.inputError : null]}
                value={form.telefono}
                onChangeText={v => updateField('telefono', v)}
                placeholder="6671234567"
                placeholderTextColor={Colors.mutedForeground}
                keyboardType="phone-pad"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                editable={!loading}
              />
              {fieldErrors.telefono ? <Text style={styles.errorText}>{fieldErrors.telefono}</Text> : null}
            </View>

            {/* Contraseña */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  ref={passwordRef}
                  style={[styles.input, styles.passwordInput, fieldErrors.password ? styles.inputError : null]}
                  value={form.password}
                  onChangeText={v => updateField('password', v)}
                  placeholder="Mínimo 8 caracteres"
                  placeholderTextColor={Colors.mutedForeground}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  returnKeyType="next"
                  onSubmitEditing={() => confirmRef.current?.focus()}
                  editable={!loading}
                />
                <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)} activeOpacity={0.6}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.navyOpacity70} />
                </TouchableOpacity>
              </View>
              {fieldErrors.password ? <Text style={styles.errorText}>{fieldErrors.password}</Text> : null}
            </View>

            {/* Confirmar Contraseña */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Confirmar Contraseña</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  ref={confirmRef}
                  style={[styles.input, styles.passwordInput, fieldErrors.confirmPassword ? styles.inputError : null]}
                  value={form.confirmPassword}
                  onChangeText={v => updateField('confirmPassword', v)}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.mutedForeground}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                  editable={!loading}
                />
                <TouchableOpacity style={styles.eyeButton} onPress={() => setShowConfirmPassword(!showConfirmPassword)} activeOpacity={0.6}>
                  <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.navyOpacity70} />
                </TouchableOpacity>
              </View>
              {fieldErrors.confirmPassword ? <Text style={styles.errorText}>{fieldErrors.confirmPassword}</Text> : null}
            </View>

            {/* Botón Crear Cuenta */}
            <TouchableOpacity
              style={[styles.registerButton, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={Colors.navy} />
              ) : (
                <Text style={styles.registerButtonText}>Crear Cuenta</Text>
              )}
            </TouchableOpacity>

            {/* Volver al login */}
            <TouchableOpacity style={styles.loginLinkButton} onPress={() => router.back()} activeOpacity={0.7} disabled={loading}>
              <Text style={styles.loginLinkText}>¿Ya tienes cuenta? Iniciar Sesión</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:     { flex: 1, backgroundColor: Colors.white },
  keyboardView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing['5xl'],
  },
  backButton: { alignSelf: 'flex-start', padding: Spacing.xs, marginBottom: Spacing.lg },
  logoContainer: { marginBottom: Spacing['2xl'], alignItems: 'center' },
  logoTitle: { fontSize: FontSize['4xl'], fontWeight: FontWeight.bold, color: Colors.navy, letterSpacing: -0.5 },
  logoSubtitle: { fontSize: FontSize.sm, color: Colors.navyOpacity70, marginTop: Spacing.xs },
  sectionTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.semibold, color: Colors.navy, marginBottom: Spacing.xl, textAlign: 'center' },
  form: { gap: Spacing.lg },
  row: { flexDirection: 'row', gap: Spacing.md },
  halfField: { flex: 1 },
  fieldContainer: { gap: Spacing.sm },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.navy },
  input: {
    width: '100%', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.navy,
    color: Colors.navy, fontSize: FontSize.base, fontWeight: FontWeight.normal, backgroundColor: Colors.white,
  },
  inputError: { borderColor: Colors.destructive },
  errorText: { fontSize: FontSize.xs, color: Colors.destructive, marginTop: -Spacing.xs },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.md, backgroundColor: '#FEE2E2' },
  errorBannerText: { flex: 1, fontSize: FontSize.sm, color: Colors.destructive, fontWeight: FontWeight.medium },
  passwordContainer: { position: 'relative' },
  passwordInput: { paddingRight: Spacing['5xl'] },
  eyeButton: { position: 'absolute', right: Spacing.md, top: 0, bottom: 0, justifyContent: 'center', paddingHorizontal: Spacing.xs },
  registerButton: { width: '100%', paddingVertical: Spacing.lg, borderRadius: Radius.md, backgroundColor: Colors.yellow, alignItems: 'center', marginTop: Spacing.sm, minHeight: 52, justifyContent: 'center' },
  buttonDisabled: { opacity: 0.7 },
  registerButtonText: { color: Colors.navy, fontSize: FontSize.base, fontWeight: FontWeight.semibold },
  loginLinkButton: { alignItems: 'center', marginTop: Spacing.sm },
  loginLinkText: { fontSize: FontSize.sm, color: Colors.navy, textDecorationLine: 'underline' },
});