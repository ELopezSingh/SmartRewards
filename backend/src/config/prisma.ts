import { PrismaClient } from '@prisma/client';

// Singleton: reutiliza la misma instancia en todo el proyecto
// evita abrir demasiadas conexiones a la BD
const prisma = new PrismaClient();

export default prisma;