import { api } from './client';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface Sucursal {
  id: number;
  nombre: string;
  direccion: string;
  lat: number;
  lng: number;
  servicios: string[];
}

interface SucursalesResponse {
  sucursales: Sucursal[];
  total: number;
}

interface SucursalResponse {
  sucursal: Sucursal;
}

// ─── Funciones ────────────────────────────────────────────────────────────────

/** Obtiene todas las sucursales activas, con búsqueda opcional */
export async function obtenerSucursales(query?: string) {
  const params = query?.trim() ? `?q=${encodeURIComponent(query.trim())}` : '';
  const { data, error } = await api.get<SucursalesResponse>(`/sucursales${params}`);
  if (error || !data) return { sucursales: [], total: 0, error: error || 'Error al obtener sucursales' };
  return { sucursales: data.sucursales, total: data.total, error: null };
}

/** Obtiene el detalle de una sucursal por ID */
export async function obtenerSucursal(id: number) {
  const { data, error } = await api.get<SucursalResponse>(`/sucursales/${id}`);
  if (error || !data) return { sucursal: null, error: error || 'Sucursal no encontrada' };
  return { sucursal: data.sucursal, error: null };
}