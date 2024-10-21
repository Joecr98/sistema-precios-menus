import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/db'; // Ajusta la ruta relativa según la ubicación de login.ts
import { ResultSetHeader } from 'mysql2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Obtener todas las áreas
    try {
      const [areas] = await db.query('SELECT * FROM areas_final');
      res.status(200).json(areas);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener las áreas' });
    }
  } else if (req.method === 'POST') {
    // Crear una nueva área
    const { nombrearea } = req.body;

    if (!nombrearea) {
      return res.status(400).json({ message: 'El nombre del área es obligatorio' });
    }

    try {
      const [result] = await db.query<ResultSetHeader>('INSERT INTO areas_final (nombrearea) VALUES (?)', [nombrearea]);
      res.status(201).json({ id: result.insertId });
    } catch (error) {
      res.status(500).json({ message: 'Error al crear el área' });
    }
  } else if (req.method === 'DELETE') {
    // Eliminar un área específica por su `id`
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: 'ID no proporcionado' });
    }

    try {
      const [result] = await db.query<ResultSetHeader>('DELETE FROM areas_final WHERE id_area = ?', [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Área no encontrada' });
      }

      res.status(200).json({ message: 'Área eliminada correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar el área' });
    }
  } else {
    // Manejar otros métodos HTTP no permitidos
    res.status(405).json({ message: 'Método no permitido' });
  }
}
