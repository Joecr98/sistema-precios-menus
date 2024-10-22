import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/db'; // Ajusta la ruta si es necesario
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Obtener todos los productos
    try {
      const [products] = await db.query<RowDataPacket[]>(
        'SELECT * FROM productos'
      );
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener los productos' });
    }
  } else if (req.method === 'POST') {
    // Crear un nuevo producto
    const { descripcion, presentacion_id, categoria_id, subcategoria_id } = req.body;

    // Validación básica
    if (!descripcion || !presentacion_id || !categoria_id || !subcategoria_id) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    try {
      // Insertar nuevo producto
      const [result] = await db.query<ResultSetHeader>(
        'INSERT INTO productos (descripcion, presentacion_id, categoria_id, subcategoria_id) VALUES (?, ?, ?, ?)',
        [descripcion, presentacion_id, categoria_id, subcategoria_id]
      );
      res.status(201).json({ id: result.insertId });
    } catch (error) {
      res.status(500).json({ message: 'Error al crear el producto' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}