import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import prisma from '../config/prisma';

const router = Router();

// Todas las rutas de promociones requieren autenticación
router.use(authMiddleware);

// ─── GET /api/promociones ─────────────────────────────────────────────────────
// Retorna todas las promociones activas, opcionalmente filtradas por vigencia
router.get('/', async (req: Request, res: Response): Promise<void> => {
  // ?vigentes=true → solo las que no han vencido (fechaFin null o futura)
  const soloVigentes = req.query.vigentes === 'true';

  try {
    const promociones = await prisma.promocion.findMany({
      where: {
        activa: true,
        // Si se pide solo vigentes, excluye las que tienen fechaFin en el pasado
        ...(soloVigentes
          ? {
              OR: [
                { fechaFin: null },
                { fechaFin: { gte: new Date() } },
              ],
            }
          : {}),
      },
      orderBy: { creadoEn: 'desc' },
      select: {
        id:             true,
        titulo:         true,
        descripcion:    true,
        imagenUrl:      true,
        descuentoLabel: true,
        fechaFin:       true,
        creadoEn:       true,
      },
    });

    res.json({
      promociones,
      total: promociones.length,
    });
  } catch (error) {
    console.error('[GET /promociones]', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── GET /api/promociones/:id ─────────────────────────────────────────────────
// Retorna el detalle de una promoción específica
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id as string);

  if (isNaN(id)) {
    res.status(400).json({ error: 'ID de promoción inválido' });
    return;
  }

  try {
    const promocion = await prisma.promocion.findFirst({
      where: { id, activa: true },
      select: {
        id:             true,
        titulo:         true,
        descripcion:    true,
        imagenUrl:      true,
        descuentoLabel: true,
        fechaFin:       true,
        creadoEn:       true,
      },
    });

    if (!promocion) {
      res.status(404).json({ error: 'Promoción no encontrada' });
      return;
    }

    res.json({ promocion });
  } catch (error) {
    console.error('[GET /promociones/:id]', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;