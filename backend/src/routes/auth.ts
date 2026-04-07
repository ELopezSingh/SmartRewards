import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';

const router = Router();

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { nombre, apellido, email, telefono, password } = req.body;

  // ── Validación básica ──────────────────────────────────────
  if (!nombre || !apellido || !email || !telefono || !password) {
    res.status(400).json({ error: 'Todos los campos son requeridos' });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    return;
  }

  try {
    // ── Verificar que el email no exista ya ────────────────────
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      res.status(409).json({ error: 'Ya existe una cuenta con este correo' });
      return;
    }

    // ── Hashear contraseña ─────────────────────────────────────
    const passwordHash = await bcrypt.hash(password, 12);

    // ── Crear usuario ──────────────────────────────────────────
    const nuevoUsuario = await prisma.usuario.create({
      data: { nombre, apellido, email, telefono, password: passwordHash },
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

    // ── Generar token ──────────────────────────────────────────
    const token = jwt.sign(
      { usuarioId: nuevoUsuario.id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    res.status(201).json({
      message: 'Cuenta creada exitosamente',
      token,
      usuario: nuevoUsuario,
    });
  } catch (error) {
    console.error('[register]', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // ── Validación básica ──────────────────────────────────────
  if (!email || !password) {
    res.status(400).json({ error: 'Correo y contraseña son requeridos' });
    return;
  }

  try {
    // ── Buscar usuario ─────────────────────────────────────────
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    // Mismo mensaje para email inexistente y contraseña incorrecta
    // (evita enumerar usuarios registrados)
    if (!usuario) {
      res.status(401).json({ error: 'Correo o contraseña incorrectos' });
      return;
    }

    // ── Verificar contraseña ───────────────────────────────────
    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      res.status(401).json({ error: 'Correo o contraseña incorrectos' });
      return;
    }

    // ── Generar token ──────────────────────────────────────────
    const token = jwt.sign(
      { usuarioId: usuario.id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    // Respuesta sin exponer el hash de la contraseña
    res.json({
      message: 'Sesión iniciada correctamente',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        telefono: usuario.telefono,
        puntos: usuario.puntos,
        creadoEn: usuario.creadoEn,
      },
    });
  } catch (error) {
    console.error('[login]', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;