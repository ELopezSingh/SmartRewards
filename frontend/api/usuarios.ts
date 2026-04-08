import { api } from './client';
import { Usuario } from './auth';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface Transaccion {
  id: number;
  codigoQr: string;
  puntosGanados: number;
  tipo: 'ACUMULACION' | 'CANJE';
  creadoEn: string;
}

interface PuntosResponse {
  puntos: number;
  transacciones: Transaccion[];
}

interface UsuarioResponse {
  usuario: Usuario;
}

interface CanjearResponse {
  message: string;
  puntosGanados: number;
  nuevoSaldo: number;
  transaccion: Transaccion;
}

// ─── Funciones ────────────────────────────────────────────────────────────────

/** Obtiene el perfil completo del usuario autenticado */
export async function obtenerPerfil() {
  const { data, error } = await api.get<UsuarioResponse>('/usuarios/me');
  if (error || !data) return { usuario: null, error: error || 'Error al obtener perfil' };
  return { usuario: data.usuario, error: null };
}

/** Obtiene el saldo de puntos y el historial de transacciones */
export async function obtenerPuntos() {
  const { data, error } = await api.get<PuntosResponse>('/usuarios/me/puntos');
  if (error || !data) return { puntos: 0, transacciones: [], error: error || 'Error al obtener puntos' };
  return { puntos: data.puntos, transacciones: data.transacciones, error: null };
}

/** Canjea un código QR y retorna los puntos ganados y el nuevo saldo */
export async function canjearCodigo(codigoQr: string) {
  const { data, error } = await api.post<CanjearResponse>('/transacciones/canjear', { codigoQr });
  if (error || !data) return { resultado: null, error: error || 'Error al canjear código' };
  return { resultado: data, error: null };
}