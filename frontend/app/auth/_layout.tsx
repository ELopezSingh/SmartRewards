import { Stack } from 'expo-router';
 
/**
 * Layout para el grupo de autenticación.
 * Las pantallas aquí NO muestran el header de navegación.
 */
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
 