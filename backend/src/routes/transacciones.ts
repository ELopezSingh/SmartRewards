import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';

const router = Router();

// Todas las rutas de transacciones requieren autenticación
router.use(authMiddleware);

// ─── POST /api/transacciones/canjear ─────────────────────────────────────────
// Valida un código QR y acumula puntos al usuario
router.post('/canjear', async (req: AuthRequest, res: Response): Promise<void> => {
  const { codigoQr } = req.body;

  if (!codigoQr || typeof codigoQr !== 'string' || !codigoQr.trim()) {
    res.status(400).json({ error: 'El código QR es requerido' });
    return;
  }

  const codigo = codigoQr.trim().toUpperCase();

  try {
    // ── Verificar que el código no haya sido canjeado antes ────
    const transaccionExistente = await prisma.transaccion.findFirst({
      where: { codigoQr: codigo },
    });

    if (transaccionExistente) {
      res.status(409).json({ error: 'Este código ya fue canjeado anteriormente' });
      return;
    }

    // ── Calcular puntos según el código ───────────────────────
    // TODO: cuando tengas la lógica real del backend (validación
    // del código contra recibos de la gasolinera), reemplaza esta
    // función por la llamada a tu sistema de recibos.
    const puntosGanados = calcularPuntos(codigo);

    if (puntosGanados <= 0) {
      res.status(422).json({ error: 'Código inválido o no reconocido' });
      return;
    }

    // ── Crear transacción y actualizar puntos en una sola operación atómica ──
    // Usamos $transaction de Prisma para garantizar que ambas
    // operaciones ocurran juntas o ninguna (evita inconsistencias)
    const [transaccion, usuarioActualizado] = await prisma.$transaction([
      prisma.transaccion.create({
        data: {
          usuarioId:    req.usuarioId!,
          codigoQr:     codigo,
          puntosGanados,
          tipo:         'ACUMULACION',
        },
        select: {
          id: true,
          codigoQr: true,
          puntosGanados: true,
          tipo: true,
          creadoEn: true,
        },
      }),
      prisma.usuario.update({
        where: { id: req.usuarioId },
        data:  { puntos: { increment: puntosGanados } },
        select: { id: true, puntos: true },
      }),
    ]);

    res.status(201).json({
      message:       '¡Código canjeado exitosamente!',
      puntosGanados,
      nuevoSaldo:    usuarioActualizado.puntos,
      transaccion,
    });
  } catch (error) {
    console.error('[POST /transacciones/canjear]', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── GET /api/transacciones/historial ────────────────────────────────────────
// Retorna el historial paginado de transacciones del usuario autenticado
router.get('/historial', async (req: AuthRequest, res: Response): Promise<void> => {
  // Paginación: ?page=1&limit=10
  const page  = Math.max(1, parseInt(req.query.page  as string) || 1);
  const limit = Math.min(50, parseInt(req.query.limit as string) || 10);
  const skip  = (page - 1) * limit;

  try {
    // Traer total y registros en paralelo para mejor rendimiento
    const [total, transacciones] = await Promise.all([
      prisma.transaccion.count({
        where: { usuarioId: req.usuarioId },
      }),
      prisma.transaccion.findMany({
        where:   { usuarioId: req.usuarioId },
        orderBy: { creadoEn: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          codigoQr: true,
          puntosGanados: true,
          tipo: true,
          creadoEn: true,
        },
      }),
    ]);

    res.json({
      transacciones,
      paginacion: {
        total,
        page,
        limit,
        totalPaginas: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[GET /transacciones/historial]', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── GET /api/transacciones/historial/:id ────────────────────────────────────
// Retorna el detalle de una transacción específica del usuario
router.get('/historial/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const id = parseInt(req.params.id as string);

  if (isNaN(id)) {
    res.status(400).json({ error: 'ID de transacción inválido' });
    return;
  }

  try {
    const transaccion = await prisma.transaccion.findFirst({
      where: {
        id,
        usuarioId: req.usuarioId, // asegura que solo vea sus propias transacciones
      },
      select: {
        id: true,
        codigoQr: true,
        puntosGanados: true,
        tipo: true,
        creadoEn: true,
      },
    });

    if (!transaccion) {
      res.status(404).json({ error: 'Transacción no encontrada' });
      return;
    }

    res.json({ transaccion });
  } catch (error) {
    console.error('[GET /transacciones/historial/:id]', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Calcula los puntos a otorgar según el código QR.
 *
 * Por ahora usa una lógica de demostración basada en el prefijo del código.
 * Cuando integres tu sistema real de recibos, reemplaza esta función por
 * una llamada a tu base de datos de recibos o a tu sistema POS.
 *
 * Formato esperado del código: SGMX + dígitos (ej: SGMX123456789)
 */
function calcularPuntos(codigo: string): number {
  if (!codigo.startsWith('SGMX')) return 0;

  // Extrae los dígitos numéricos del código
  const digitos = codigo.replace(/\D/g, '');
  if (!digitos) return 0;

  // Lógica demo: los últimos 3 dígitos determinan los puntos (50–500)
  // TODO: reemplazar con lógica real basada en monto de compra
  const base = parseInt(digitos.slice(-3)) || 100;
  return Math.min(500, Math.max(50, base));
}

export default router;