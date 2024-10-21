import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/db';
import { ResultSetHeader } from 'mysql2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const [roles] = await db.query('SELECT * FROM roles_final');
      res.status(200).json(roles);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener los roles' });
    }
  } else if (req.method === 'POST') {
    const { nombre_rol } = req.body;

    try {
      const [result] = await db.query<ResultSetHeader>('INSERT INTO roles_final (nombre_rol) VALUES (?)', [nombre_rol]);
      res.status(201).json({ id: result.insertId });
    } catch (error) {
      res.status(500).json({ message: 'Error al crear el rol' });
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: 'ID no proporcionado' });
    }

    try {
      const [result] = await db.query<ResultSetHeader>('DELETE FROM roles_final WHERE id_rol = ?', [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Rol no encontrado' });
      }

      res.status(200).json({ message: 'Rol eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar el rol' });
    }
  } else {
    res.status(405).json({ message: 'Método no permitido' });
  }
}
