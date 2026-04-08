import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Configuración ────────────────────────────────────────────────────────────

// Cambia esta URL cuando despliegues el backend en producción
// En desarrollo: usa tu IP local para que el dispositivo físico pueda conectarse
// Ejemplo con dispositivo físico: 'http://192.168.1.100:3000/api'
// Ejemplo con emulador Android:   'http://10.0.2.2:3000/api'
// Ejemplo con simulador iOS:      'http://localhost:3000/api'
const API_BASE_URL = 'http://192.168.1.72:3000/api';

const TOKEN_KEY = 'smartrewards_token';

// ─── Gestión del token JWT ────────────────────────────────────────────────────

export async function guardarToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function obtenerToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function eliminarToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

// ─── Cliente HTTP base ────────────────────────────────────────────────────────

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

/**
 * Función base para todas las llamadas a la API.
 * Agrega automáticamente el token JWT en el header Authorization.
 * Devuelve siempre { data, error } para manejo uniforme en las pantallas.
 */
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = await obtenerToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Agrega el token si existe
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const json = await response.json();

    // Si el servidor responde con error, lo propagamos limpiamente
    if (!response.ok) {
      return { data: null, error: json.error || 'Error desconocido' };
    }

    return { data: json, error: null };
  } catch (err) {
    // Error de red (sin conexión, servidor caído, etc.)
    console.error(`[API] Error en ${endpoint}:`, err);
    return {
      data: null,
      error: 'No se pudo conectar con el servidor. Verifica tu conexión.',
    };
  }
}

// ─── Métodos HTTP ─────────────────────────────────────────────────────────────

export const api = {
  get: <T>(endpoint: string) =>
    apiCall<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, body: unknown) =>
    apiCall<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body: unknown) =>
    apiCall<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string) =>
    apiCall<T>(endpoint, { method: 'DELETE' }),
};