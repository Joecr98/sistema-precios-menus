import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/db'; // Ajusta la ruta si es necesario
import { RowDataPacket } from 'mysql2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Obtener presentaciones
      const [presentaciones] = await db.query<RowDataPacket[]>('SELECT id, descripcion FROM presentaciones');
      // Obtener categorías
      const [categorias] = await db.query<RowDataPacket[]>('SELECT id, nombre FROM categorias');
      // Obtener subcategorías
      const [subcategorias] = await db.query<RowDataPacket[]>('SELECT id, nombre FROM subcategorias');

      res.status(200).json({
        presentaciones,
        categorias,
        subcategorias,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener los datos de selección' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
