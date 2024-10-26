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

    // 2. Calcular los detalles y totales por menú
    let detallesFactura = [];
    let totalFactura = 0;
    const menuDetails = clientMenus.map(config => {
      let menuSubtotal = 0;
      let menuSubtotalExtras = 0;

      const detallesMenu = config.menu.detallesMenu.map(detalle => {
        const precioUnitario = detalle.producto.precios[0]?.precio_unidad || 0;
        const cantidad = detalle.cantidad;
        const subtotalProducto = Number(cantidad) * Number(precioUnitario);

        if (detalle.es_extra) {
          menuSubtotalExtras += subtotalProducto;
        } else {
          menuSubtotal += subtotalProducto;
        }

        // Agregar a los detalles de la factura
        detallesFactura.push({
          producto_id: detalle.producto_id,
          cantidad: cantidad,
          precio_unitario: precioUnitario,
          subtotal: subtotalProducto
        });

        return {
          producto: detalle.producto.descripcion,
          cantidad: cantidad,
          precioUnitario: precioUnitario,
          subtotal: subtotalProducto,
          esExtra: detalle.es_extra
        };
      });

      const totalMenuConExtras = menuSubtotal + menuSubtotalExtras;
      totalFactura += totalMenuConExtras;

      return {
        day: config.dia_semana,
        menuName: config.menu.nombre,
        menuId: config.menu_id,
        detalles: detallesMenu,
        subtotal: menuSubtotal,
        subtotalExtras: menuSubtotalExtras,
        total: totalMenuConExtras
      };
    });

    // 3. Crear la factura en la base de datos...
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

    // 4. Devolver el resumen de la factura
    return NextResponse.json({
      facturaId: factura.id,
      cliente: factura.cliente,
      fechaGeneracion: factura.fecha_inicio,
      details: menuDetails,
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