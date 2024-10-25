import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientId, dias } = body;

    if (!clientId || !dias || !Array.isArray(dias)) {
      return NextResponse.json(
        { message: 'Datos inválidos' },
        { status: 400 }
      );
    }

    // 1. Obtener los menús configurados para el cliente
    const clientMenus = await prisma.configuracionMenuCliente.findMany({
      where: {
        cliente_id: parseInt(clientId),
        dia_semana: {
          in: dias
        }
      },
      include: {
        menu: {
          include: {
            detallesMenu: {
              include: {
                producto: {
                  include: {
                    precios: {
                      orderBy: {
                        fecha_actualizacion: 'desc'
                      },
                      take: 1
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (clientMenus.length === 0) {
      return NextResponse.json(
        { message: 'No se encontraron menús configurados para los días seleccionados' },
        { status: 404 }
      );
    }

    // 2. Preparar los detalles para la factura
    let detallesFactura = [];
    let totalFactura = 0;

    for (const config of clientMenus) {
      for (const detalle of config.menu.detallesMenu) {
        const precio = detalle.producto.precios[0]?.precio_unidad || 0;
        const cantidad = detalle.cantidad;
        const subtotal = Number(cantidad) * Number(precio);

        detallesFactura.push({
          producto_id: detalle.producto_id,
          cantidad: cantidad,
          precio_unitario: precio,
          subtotal: subtotal
        });

        totalFactura += subtotal;
      }
    }

    // 3. Crear la factura
    const factura = await prisma.factura.create({
      data: {
        cliente_id: parseInt(clientId),
        fecha_inicio: new Date(),
        fecha_fin: new Date(),
        total: totalFactura,
        detalles: {
          create: detallesFactura
        }
      },
      include: {
        cliente: true,
        detalles: {
          include: {
            producto: true
          }
        }
      }
    });

    // 4. Preparar la respuesta
    return NextResponse.json({
      facturaId: factura.id,
      cliente: factura.cliente,
      fechaGeneracion: factura.fecha_inicio,
      details: clientMenus.map(config => ({
        day: config.dia_semana,
        menuName: config.menu.nombre,
        detalles: config.menu.detallesMenu.map(detalle => ({
          producto: detalle.producto.descripcion,
          cantidad: detalle.cantidad,
          precioUnitario: detalle.producto.precios[0]?.precio_unidad || 0,
          subtotal: Number(detalle.cantidad) * Number(detalle.producto.precios[0]?.precio_unidad || 0)
        }))
      })),
      total: totalFactura
    });

  } catch (error) {
    console.error('Error general:', error);
    return NextResponse.json(
      { message: 'Error al procesar la factura', error: error.message },
      { status: 500 }
    );
  }
}