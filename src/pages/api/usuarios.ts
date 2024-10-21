import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/db'; // Asegúrate de ajustar esta ruta según la estructura de tu proyecto
import { ResultSetHeader } from 'mysql2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Obtener todos los usuarios
    try {
      const [usuarios] = await db.query(`
        SELECT u.id_usuario, u.nombre_usuario, u.correo, a.nombrearea, r.nombre_rol 
        FROM usuarios u 
        JOIN areas_final a ON u.id_area = a.id_area 
        JOIN roles_final r ON u.id_rol = r.id_rol
      `);
      res.status(200).json(usuarios);
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
      res.status(500).json({ message: 'Error al obtener los usuarios' });
    }
  } else if (req.method === 'POST') {
    // Crear un nuevo usuario
    const { nombre_usuario, correo, contraseña, id_rol, id_area } = req.body;

    if (!nombre_usuario || !correo || !contraseña || !id_rol || !id_area) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    try {
      const [result] = await db.query<ResultSetHeader>(
        'INSERT INTO usuarios (nombre_usuario, correo, contraseña, id_rol, id_area) VALUES (?, ?, ?, ?, ?)', 
        [nombre_usuario, correo, contraseña, id_rol, id_area]
      );
      res.status(201).json({ id: result.insertId });
    } catch (error) {
      console.error('Error al crear el usuario:', error);
      res.status(500).json({ message: 'Error al crear el usuario' });
    }
  } else {
    res.status(405).json({ message: 'Método no permitido' });
  }
}
