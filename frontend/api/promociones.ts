import { api } from './client';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface Promocion {
  id: number;
  titulo: string;
  descripcion: string;
  imagenUrl: string;
  descuentoLabel: string;
  fechaFin: string | null;
  creadoEn: string;
}

interface PromocionesResponse {
  promociones: Promocion[];
  total: number;
}

interface PromocionResponse {
  promocion: Promocion;
}

// ─── Funciones ────────────────────────────────────────────────────────────────

/** Obtiene todas las promociones activas */
export async function obtenerPromociones(soloVigentes = false) {
  const query = soloVigentes ? '?vigentes=true' : '';
  const { data, error } = await api.get<PromocionesResponse>(`/promociones${query}`);
  if (error || !data) return { promociones: [], total: 0, error: error || 'Error al obtener promociones' };
  return { promociones: data.promociones, total: data.total, error: null };
}

/** Obtiene el detalle de una promoción por ID */
export async function obtenerPromocion(id: number) {
  const { data, error } = await api.get<PromocionResponse>(`/promociones/${id}`);
  if (error || !data) return { promocion: null, error: error || 'Promoción no encontrada' };
  return { promocion: data.promocion, error: null };
}