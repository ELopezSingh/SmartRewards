import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import prisma from '../config/prisma';

const router = Router();

// Todas las rutas de sucursales requieren autenticación
router.use(authMiddleware);

// ─── GET /api/sucursales ──────────────────────────────────────────────────────
// Retorna todas las sucursales activas, con búsqueda opcional por nombre/dirección/servicios
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { q } = req.query;

  try {
    // Traemos todas las sucursales activas de la BD
    const todasLasSucursales = await prisma.sucursal.findMany({
      where: { activa: true },
      orderBy: { nombre: 'asc' },
      select: {
        id:        true,
        nombre:    true,
        direccion: true,
        lat:       true,
        lng:       true,
        servicios: true,
      },
    });

    // Convertimos Decimal → number en todas las sucursales
    const sucursalesFormateadas = todasLasSucursales.map(formatearSucursal);

    // Si no hay término de búsqueda, devolvemos todo
    if (!q || typeof q !== 'string' || !q.trim()) {
      res.json({
        sucursales: sucursalesFormateadas,
        total: sucursalesFormateadas.length,
      });
      return;
    }

    // Filtrado en memoria — case-insensitive para nombre, dirección y servicios
    // Usamos JSON.stringify(servicios) para convertir el array JSON a texto
    // y poder buscar dentro de él sin importar mayúsculas/minúsculas
    const termino = q.trim().toLowerCase();

    const sucursalesFiltradas = sucursalesFormateadas.filter(s => {
      const serviciosTexto = JSON.stringify(s.servicios).toLowerCase();
      return (
        s.nombre.toLowerCase().includes(termino)    ||
        s.direccion.toLowerCase().includes(termino) ||
        serviciosTexto.includes(termino)
      );
    });

    res.json({
      sucursales: sucursalesFiltradas,
      total: sucursalesFiltradas.length,
    });
  } catch (error) {
    console.error('[GET /sucursales]', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── GET /api/sucursales/:id ──────────────────────────────────────────────────
// Retorna el detalle de una sucursal específica
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id as string);

  if (isNaN(id)) {
    res.status(400).json({ error: 'ID de sucursal inválido' });
    return;
  }

  try {
    const sucursal = await prisma.sucursal.findFirst({
      where: { id, activa: true },
      select: {
        id:        true,
        nombre:    true,
        direccion: true,
        lat:       true,
        lng:       true,
        servicios: true,
        creadoEn:  true,
      },
    });

    if (!sucursal) {
      res.status(404).json({ error: 'Sucursal no encontrada' });
      return;
    }

    res.json({ sucursal: formatearSucursal(sucursal) });
  } catch (error) {
    console.error('[GET /sucursales/:id]', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Convierte los campos Decimal de Prisma (lat, lng) a number nativo de JS.
 * Prisma devuelve Decimal objects para columnas DECIMAL de MySQL —
 * si no los convertimos, el JSON quedaría como { "lat": { "d": [...] } }
 * en lugar de { "lat": 19.4326 }
 */
function formatearSucursal(sucursal: {
  id:        number;
  nombre:    string;
  direccion: string;
  lat:       { toNumber: () => number } | number;
  lng:       { toNumber: () => number } | number;
  servicios: unknown;
  creadoEn?: Date;
}) {
  return {
    ...sucursal,
    lat: typeof sucursal.lat === 'object'
      ? (sucursal.lat as { toNumber: () => number }).toNumber()
      : sucursal.lat,
    lng: typeof sucursal.lng === 'object'
      ? (sucursal.lng as { toNumber: () => number }).toNumber()
      : sucursal.lng,
  };
}

export default router;