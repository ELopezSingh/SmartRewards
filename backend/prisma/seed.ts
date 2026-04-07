import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // ── Sucursales ─────────────────────────────────────────────────────────────
  // Limpia las sucursales existentes para evitar duplicados al re-correr el seed
  await prisma.sucursal.deleteMany();

  const sucursales = await prisma.sucursal.createMany({
    data: [
      {
        nombre:    'Smartgas Centro',
        direccion: 'Av. Reforma 123, Centro Histórico',
        lat:       19.4326,
        lng:       -99.1332,
        servicios: ['Combustible Premium', 'Lavado de Auto', 'Tienda'],
        activa:    true,
      },
      {
        nombre:    'Smartgas Periférico Norte',
        direccion: 'Periférico Norte 4567, Colonia Lindavista',
        lat:       19.4969,
        lng:       -99.1332,
        servicios: ['Combustible Premium', 'Cambio de Aceite', 'Servicio de Llantas'],
        activa:    true,
      },
      {
        nombre:    'Smartgas Polanco',
        direccion: 'Av. Presidente Masaryk 890, Polanco',
        lat:       19.4336,
        lng:       -99.1956,
        servicios: ['Combustible Premium', 'Lavado de Auto', 'Cafetería'],
        activa:    true,
      },
      {
        nombre:    'Smartgas Roma Norte',
        direccion: 'Av. Insurgentes Sur 234, Roma Norte',
        lat:       19.4178,
        lng:       -99.1622,
        servicios: ['Combustible Premium', 'Tienda', 'Estacionamiento'],
        activa:    true,
      },
      {
        nombre:    'Smartgas Santa Fe',
        direccion: 'Av. Santa Fe 567, Santa Fe',
        lat:       19.3590,
        lng:       -99.2620,
        servicios: ['Combustible Premium', 'Lavado de Auto', 'Cambio de Aceite'],
        activa:    true,
      },
    ],
  });

  // ── Promociones ────────────────────────────────────────────────────────────
  await prisma.promocion.deleteMany();

  const promociones = await prisma.promocion.createMany({
    data: [
      {
        titulo:         '20% de Descuento en Combustible Premium',
        descripcion:    'Obtén 20% de descuento en tu próxima compra de combustible premium. Válido hasta el 31 de marzo.',
        imagenUrl:      'https://images.unsplash.com/photo-1554322159-40b4de41870b?w=800',
        descuentoLabel: '20% DESC',
        activa:         true,
        fechaFin:       new Date('2025-03-31'),
      },
      {
        titulo:         'Lavado de Auto Gratis',
        descripcion:    'Lavado de auto gratuito con cualquier compra de combustible mayor a $500. Disponible en ubicaciones participantes.',
        imagenUrl:      'https://images.unsplash.com/photo-1760827797819-4361cd5cd353?w=800',
        descuentoLabel: 'GRATIS',
        activa:         true,
        fechaFin:       null,
      },
      {
        titulo:         'Paquete Café + Combustible',
        descripcion:    'Compra un café de cualquier tamaño y recibe 50 centavos de descuento por litro en tu compra de combustible.',
        imagenUrl:      'https://images.unsplash.com/photo-1707500315925-910ab09b92b7?w=800',
        descuentoLabel: '50¢/L',
        activa:         true,
        fechaFin:       null,
      },
      {
        titulo:         'Especial Cambio de Aceite',
        descripcion:    'Ahorra $150 en tu próximo cambio de aceite completo en cualquier centro de servicio Smartgas.',
        imagenUrl:      'https://images.unsplash.com/photo-1771340012378-3c86cb649193?w=800',
        descuentoLabel: '$150 DESC',
        activa:         true,
        fechaFin:       null,
      },
    ],
  });

  console.log(`✅ ${sucursales.count} sucursales creadas`);
  console.log(`✅ ${promociones.count} promociones creadas`);
  console.log('🎉 Seed completado exitosamente');
}

main()
  .catch(e => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });