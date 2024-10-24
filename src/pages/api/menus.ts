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
  
