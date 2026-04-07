import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';

const router = Router();

// Todas las rutas de usuarios requieren autenticación
router.use(authMiddleware);

// ─── GET /api/usuarios/me ─────────────────────────────────────────────────────
// Retorna el perfil completo del usuario autenticado
router.get('/me', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuarioId },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        puntos: true,
        creadoEn: true,
      },
    });

    if (!usuario) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.json({ usuario });
  } catch (error) {
    console.error('[GET /usuarios/me]', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── PUT /api/usuarios/me ─────────────────────────────────────────────────────
// Actualiza nombre, apellido y/o teléfono del usuario autenticado
router.put('/me', async (req: AuthRequest, res: Response): Promise<void> => {
  const { nombre, apellido, telefono } = req.body;

  // Al menos un campo debe venir en el body
  if (!nombre && !apellido && !telefono) {
    res.status(400).json({
      error: 'Debes enviar al menos un campo para actualizar (nombre, apellido, telefono)',
    });
    return;
  }

  try {
    const usuarioActualizado = await prisma.usuario.update({
      where: { id: req.usuarioId },
      data: {
        // Solo actualiza los campos que llegaron en el body
        ...(nombre    && { nombre }),
        ...(apellido  && { apellido }),
        ...(telefono  && { telefono }),
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        puntos: true,
        creadoEn: true,
      },
    });

    res.json({
      message: 'Perfil actualizado correctamente',
      usuario: usuarioActualizado,
    });
  } catch (error) {
    console.error('[PUT /usuarios/me]', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── PUT /api/usuarios/me/password ───────────────────────────────────────────
// Cambia la contraseña del usuario autenticado
router.put('/me/password', async (req: AuthRequest, res: Response): Promise<void> => {
  const { passwordActual, passwordNueva } = req.body;

  if (!passwordActual || !passwordNueva) {
    res.status(400).json({ error: 'La contraseña actual y la nueva son requeridas' });
    return;
  }

  if (passwordNueva.length < 8) {
    res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres' });
    return;
  }

  try {
    // Obtener el hash actual de la BD
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuarioId },
      select: { password: true },
    });

    if (!usuario) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    // Verificar que la contraseña actual sea correcta
    const passwordValida = await bcrypt.compare(passwordActual, usuario.password);
    if (!passwordValida) {
      res.status(401).json({ error: 'La contraseña actual es incorrecta' });
      return;
    }

    // Hashear y guardar la nueva contraseña
    const nuevoHash = await bcrypt.hash(passwordNueva, 12);
    await prisma.usuario.update({
      where: { id: req.usuarioId },
      data: { password: nuevoHash },
    });

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('[PUT /usuarios/me/password]', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── GET /api/usuarios/me/puntos ─────────────────────────────────────────────
// Retorna el saldo de puntos y el historial de transacciones del usuario
router.get('/me/puntos', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Traer puntos + últimas 20 transacciones en una sola query
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuarioId },
      select: {
        puntos: true,
        transacciones: {
          orderBy: { creadoEn: 'desc' },
          take: 20,
          select: {
            id: true,
            codigoQr: true,
            puntosGanados: true,
            tipo: true,
            creadoEn: true,
          },
        },
      },
    });

    if (!usuario) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.json({
      puntos: usuario.puntos,
      transacciones: usuario.transacciones,
    });
  } catch (error) {
    console.error('[GET /usuarios/me/puntos]', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;