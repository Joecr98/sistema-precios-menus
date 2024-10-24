import { NextApiRequest, NextApiResponse } from 'next';
import mysql from 'mysql2/promise';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
      });
      

    // Consultas a las tablas de la base de datos
    const [presentaciones] = await connection.query('SELECT id, nombre FROM presentaciones');
    const [categorias] = await connection.query('SELECT id, nombre FROM categorias');
    const [subcategorias] = await connection.query('SELECT id, nombre, categoria_id FROM subcategorias');

    // Devolver los resultados
    res.status(200).json({
      presentaciones,
      categorias,
      subcategorias,
    });

    await connection.end();
  } catch (error) {
    console.error('Error al obtener los datos:', error);
    res.status(500).json({ message: 'Error al obtener las opciones de selección' });
  }
}

