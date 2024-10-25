import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'PUT') {
    try {
      const { id } = req.query;
      const { nombre, detalles } = req.body;

      if (!nombre || !nombre.trim()) {
        return res.status(400).json({ error: 'El nombre del menú es requerido' });
      }

      if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
        return res.status(400).json({ error: 'Se requiere al menos un producto en el menú' });
      }

      // Primero eliminamos todos los detalles existentes
      await prisma.detalleMenu.deleteMany({
        where: {
          menu_id: Number(id)
        }
      });

      // Actualizamos el menú y creamos los nuevos detalles
      const menuActualizado = await prisma.menu.update({
        where: {
          id: Number(id)
        },
        data: {
          nombre,
          detallesMenu: {
            create: detalles.map((detalle: any) => ({
              producto_id: Number(detalle.producto_id),
              cantidad: detalle.cantidad,
              es_extra: detalle.es_extra
            }))
          }
        },
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
      });

      // Transformar los datos
      const menuConPrecios = {
        ...menuActualizado,
        detallesMenu: menuActualizado.detallesMenu.map(detalle => ({
          ...detalle,
          producto: {
            ...detalle.producto,
            precio_unidad: detalle.producto.precios[0]?.precio_unidad || 0,
            precio_costo: detalle.producto.precios[0]?.precio_costo || 0
          }
        }))
      };

      return res.status(200).json(menuConPrecios);
    } catch (error) {
      console.error('Error al actualizar menú:', error);
      return res.status(500).json({ error: 'Error al actualizar el menú' });
    }
  }

  res.setHeader('Allow', ['PUT']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}