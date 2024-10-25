import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // GET /api/menus - Obtener todos los menús
  if (req.method === 'GET') {
    try {
      const menus = await prisma.menu.findMany({
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
        },
        orderBy: {
          fecha_creacion: 'desc'
        }
      });

      const menusConPrecios = menus.map(menu => ({
        ...menu,
        detallesMenu: menu.detallesMenu.map(detalle => ({
          ...detalle,
          producto: {
            ...detalle.producto,
            precio_unidad: detalle.producto.precios[0]?.precio_unidad || 0,
            precio_costo: detalle.producto.precios[0]?.precio_costo || 0
          }
        }))
      }));

      return res.status(200).json(menusConPrecios);
    } catch (error) {
      console.error('Error al obtener menús:', error);
      return res.status(500).json({ error: 'Error al obtener los menús' });
    }
  }

  // POST /api/menus - Crear un nuevo menú
  if (req.method === 'POST') {
    try {
      const { nombre, detalles } = req.body;

      if (!nombre || !nombre.trim()) {
        return res.status(400).json({ error: 'El nombre del menú es requerido' });
      }

      if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
        return res.status(400).json({ error: 'Se requiere al menos un producto en el menú' });
      }

      const menu = await prisma.menu.create({
        data: {
          nombre,
          detallesMenu: {
            create: detalles.map((detalle: any) => ({
              producto_id: parseInt(detalle.producto_id as string),
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

      const menuConPrecios = {
        ...menu,
        detallesMenu: menu.detallesMenu.map(detalle => ({
          ...detalle,
          producto: {
            ...detalle.producto,
            precio_unidad: detalle.producto.precios[0]?.precio_unidad || 0,
            precio_costo: detalle.producto.precios[0]?.precio_costo || 0
          }
        }))
      };

      return res.status(201).json(menuConPrecios);
    } catch (error) {
      console.error('Error al crear menú:', error);
      return res.status(500).json({ error: 'Error al crear el menú' });
    }
  }

  // DELETE /api/menus - Eliminar un menú
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'ID del menú es requerido' });
      }

      // Verificar si el menú está siendo usado en configuraciones de cliente
      const configuracionesExistentes = await prisma.configuracionMenuCliente.findFirst({
        where: {
          menu_id: Number(id)
        }
      });

      if (configuracionesExistentes) {
        return res.status(400).json({ 
          error: 'No se puede eliminar el menú porque está siendo usado en configuraciones de cliente' 
        });
      }

      // Primero eliminamos los detalles del menú
      await prisma.detalleMenu.deleteMany({
        where: {
          menu_id: Number(id)
        }
      });

      // Luego eliminamos el menú
      await prisma.menu.delete({
        where: {
          id: Number(id)
        }
      });

      return res.status(200).json({ message: 'Menú eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar menú:', error);
      return res.status(500).json({ error: 'Error al eliminar el menú' });
    }
  }

  // Método no permitido
  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}