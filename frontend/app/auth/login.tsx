import { useState } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { login } from '@/api/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Por favor ingresa tu correo y contraseña');
      return;
    }

    setLoading(true);
    setError(null);

    const { usuario, error: apiError } = await login(email.trim(), password);

    setLoading(false);

    if (apiError) {
      setError(apiError);
      return;
    }

    // Login exitoso → navegar al home sin poder regresar al login
    router.replace('/(tabs)');
  };

  const handleCreateAccount = () => {
    router.push('/auth/register');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>

          {/* ── Logo ─────────────────────────────────────────── */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoTitle}>SmartRewards</Text>
            <Text style={styles.logoSubtitle}>por Smartgas</Text>
          </View>

          {/* ── Formulario ───────────────────────────────────── */}
          <View style={styles.form}>

            {/* Banner de error de API */}
            {error && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle-outline" size={18} color={Colors.destructive} />
                <Text style={styles.errorBannerText}>{error}</Text>
              </View>
            )}

            {/* Email */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <TextInput
                style={[styles.input, error ? styles.inputError : null]}
                value={email}
                onChangeText={v => { setEmail(v); setError(null); }}
                placeholder="tu.correo@ejemplo.com"
                placeholderTextColor={Colors.mutedForeground}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                editable={!loading}
              />
            </View>

            {/* Contraseña */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput, error ? styles.inputError : null]}
                  value={password}
                  onChangeText={v => { setPassword(v); setError(null); }}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.mutedForeground}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.6}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={Colors.navyOpacity70}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Botón Iniciar Sesión */}
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={Colors.navy} />
              ) : (
                <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
              )}
            </TouchableOpacity>

            {/* Crear cuenta */}
            <TouchableOpacity
              style={styles.createAccountButton}
              onPress={handleCreateAccount}
              activeOpacity={0.7}
              disabled={loading}
            >
              <Text style={styles.createAccountText}>Crear Cuenta Nueva</Text>
            </TouchableOpacity>

          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['7xl'],
    alignItems: 'center',
  },

  // ── Logo ──────────────────────────────────────────────
  logoContainer: {
    marginBottom: Spacing['6xl'],
    alignItems: 'center',
  },
  logoTitle: {
    fontSize: FontSize['4xl'],
    fontWeight: FontWeight.bold,
    color: Colors.navy,
    letterSpacing: -0.5,
  },
  logoSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.navyOpacity70,
    marginTop: Spacing.xs,
  },

  // ── Formulario ────────────────────────────────────────
  form: {
    width: '100%',
    gap: Spacing.lg,
  },
  fieldContainer: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.navy,
  },
  input: {
    width: '100%',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.navy,
    color: Colors.navy,
    fontSize: FontSize.base,
    fontWeight: FontWeight.normal,
    backgroundColor: Colors.white,
  },
  inputError: {
    borderColor: Colors.destructive,
  },

  // ── Banner de error ───────────────────────────────────
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: '#FEE2E2',
  },
  errorBannerText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.destructive,
    fontWeight: FontWeight.medium,
  },

  // ── Contraseña ────────────────────────────────────────
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: Spacing['5xl'],
  },
  eyeButton: {
    position: 'absolute',
    right: Spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
  },

  // ── Botones ───────────────────────────────────────────
  loginButton: {
    width: '100%',
    paddingVertical: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: Colors.yellow,
    alignItems: 'center',
    marginTop: Spacing.sm,
    minHeight: 52,
    justifyContent: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: Colors.navy,
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
  },
  createAccountButton: {
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  createAccountText: {
    fontSize: FontSize.sm,
    color: Colors.navy,
    textDecorationLine: 'underline',
  },
});