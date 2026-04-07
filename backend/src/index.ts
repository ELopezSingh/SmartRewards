import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Rutas (las iremos creando una a una)
import authRoutes from './routes/auth';
import usuariosRoutes from './routes/usuarios'
import transaccionesRoutes from './routes/transacciones'
import promocionesRoutes from './routes/promociones'
import sucursalesRoutes from './routes/sucursales'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middlewares globales ───────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Rutas ─────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/transacciones', transaccionesRoutes);
app.use('/api/promociones', promocionesRoutes);
app.use('/api/sucursales', sucursalesRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', app: 'SmartRewards API', version: '1.0.0' });
});

// ── 404 global ────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// ── Arrancar servidor ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 SmartRewards API corriendo en http://localhost:${PORT}`);
});

export default app;