import { api } from './client';
import { Usuario } from './auth';
import { logout } from './auth';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface UsuarioResponse {
  usuario: Usuario;
}

interface ActualizarPerfilParams {
  nombre?: string;
  apellido?: string;
  telefono?: string;
}

interface CambiarPasswordParams {
  passwordActual: string;
  passwordNueva: string;
}

// ─── Funciones ────────────────────────────────────────────────────────────────

/** Obtiene el perfil completo del usuario autenticado */
export async function obtenerPerfil() {
  const { data, error } = await api.get<UsuarioResponse>('/usuarios/me');
  if (error || !data) return { usuario: null, error: error || 'Error al obtener perfil' };
  return { usuario: data.usuario, error: null };
}

/** Actualiza nombre, apellido y/o teléfono */
export async function actualizarPerfil(params: ActualizarPerfilParams) {
  const { data, error } = await api.put<UsuarioResponse>('/usuarios/me', params);
  if (error || !data) return { usuario: null, error: error || 'Error al actualizar perfil' };
  return { usuario: data.usuario, error: null };
}

/** Cambia la contraseña del usuario */
export async function cambiarPassword(params: CambiarPasswordParams) {
  const { data, error } = await api.put<{ message: string }>('/usuarios/me/password', params);
  if (error || !data) return { ok: false, error: error || 'Error al cambiar contraseña' };
  return { ok: true, error: null };
}

/** Cierra la sesión eliminando el token */
export { logout };