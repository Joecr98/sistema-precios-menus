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
    const [presentaciones]: any = await connection.query('SELECT id, nombre FROM presentaciones');
    const [categorias]: any = await connection.query('SELECT id, nombre FROM categorias');
    const [subcategorias]: any = await connection.query('SELECT id, nombre, categoria_id FROM subcategorias');

    // Formatear los datos para que sean consistentes con lo que espera el frontend
    res.status(200).json({
      presentaciones: presentaciones.map((p: any) => ({ id: p.id, nombre: p.nombre })),
      categorias: categorias.map((c: any) => ({ id: c.id, nombre: c.nombre })),
      subcategorias: subcategorias.map((s: any) => ({ id: s.id, nombre: s.nombre, categoria_id: s.categoria_id })),
    });

    await connection.end();
  } catch (error) {
    console.error('Error al obtener los datos:', error);
    res.status(500).json({ message: 'Error al obtener las opciones de selección' });
  }
}

