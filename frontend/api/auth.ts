import { api, guardarToken, eliminarToken } from './client';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  puntos: number;
  creadoEn: string;
}

interface AuthResponse {
  message: string;
  token: string;
  usuario: Usuario;
}

// ─── Funciones ────────────────────────────────────────────────────────────────

/**
 * Inicia sesión con email y contraseña.
 * Si es exitoso, guarda el token JWT en AsyncStorage automáticamente.
 */
export async function login(email: string, password: string) {
  const { data, error } = await api.post<AuthResponse>('/auth/login', {
    email,
    password,
  });

  if (error || !data) {
    return { usuario: null, error: error || 'Error al iniciar sesión' };
  }

  // Guardar token para futuras peticiones
  await guardarToken(data.token);

  return { usuario: data.usuario, error: null };
}

/**
 * Registra una cuenta nueva.
 * Si es exitoso, guarda el token JWT en AsyncStorage automáticamente.
 */
export async function registro(params: {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  password: string;
}) {
  const { data, error } = await api.post<AuthResponse>('/auth/register', params);

  if (error || !data) {
    return { usuario: null, error: error || 'Error al crear la cuenta' };
  }

  // Guardar token para futuras peticiones
  await guardarToken(data.token);

  return { usuario: data.usuario, error: null };
}

/**
 * Cierra la sesión del usuario.
 * Elimina el token JWT de AsyncStorage.
 */
export async function logout() {
  await eliminarToken();
}