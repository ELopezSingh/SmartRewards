import { Stack } from 'expo-router';
 
/**
 * Root layout de SmartRewards.
 *
 * Grupos de rutas:
 *   /auth/login    → pantalla de login (sin tab bar)
 *   /auth/register → pantalla de registro (sin tab bar)
 *   /(tabs)        → app principal con bottom navigation
 *   /modal         → pantalla QR (modal sobre tabs)
 *
 * TODO: Cuando tengas el backend listo, agrega aquí la lógica
 * de <Redirect> según el estado de sesión del usuario.
 */
export default function RootLayout() {
  return (
    <Stack>
      {/* Grupo de autenticación — sin header */}
      <Stack.Screen name="auth" options={{ headerShown: false }} />
 
      {/* App principal — sin header (el header va dentro de cada tab) */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
 
      {/* Modal QR — presentación como modal */}
      <Stack.Screen
        name="modal"
        options={{
          presentation: 'modal',
          title: 'Mi QR',
          headerShown: true,
        }}
      />
      <Stack.Screen name="index" redirect />
    </Stack>
  );
}