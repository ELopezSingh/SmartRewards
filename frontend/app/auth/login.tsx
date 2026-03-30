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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
 
export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
 
  const handleLogin = () => {
    // TODO: conectar con el backend de autenticación
    router.replace('/(tabs)');
  };
 
  /*const handleCreateAccount = () => {
    // TODO: navegar a pantalla de registro
    router.push('/auth/register');
  };*/
 
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
 
            {/* Email */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="tu.correo@ejemplo.com"
                placeholderTextColor={Colors.mutedForeground}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>
 
            {/* Contraseña */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.mutedForeground}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
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
              style={styles.loginButton}
              onPress={handleLogin}
              activeOpacity={0.85}
            >
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            </TouchableOpacity>
 
            {/* Crear cuenta */}
            <TouchableOpacity
              style={styles.createAccountButton}
              //onPress={handleCreateAccount}
              activeOpacity={0.7}
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
 
  // ── Contraseña ────────────────────────────────────────
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: Spacing['5xl'],  // espacio para el ojo
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