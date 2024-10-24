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
              producto: true
            }
          }
        }
      });
      return res.status(200).json(menus);
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
                producto: true
              }
            }
          }
        });
  
        return res.status(201).json(menu);
      } catch (error) {
        console.error('Error al crear menú:', error);
        return res.status(500).json({ error: 'Error al crear el menú' });
      }
    }
  
    // Método no permitido
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
