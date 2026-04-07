import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extendemos el tipo de Request para incluir el usuario autenticado
export interface AuthRequest extends Request {
  usuarioId?: number;
}

interface JwtPayload {
  usuarioId: number;
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  // El header debe ser: "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token no proporcionado' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET!;
    const payload = jwt.verify(token, secret) as JwtPayload;
    req.usuarioId = payload.usuarioId;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}