import { NextApiRequest, NextApiResponse } from "next";
import mysql from "mysql2/promise";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
    });

    if (req.method === "GET") {
      try {
        const [rows] = await connection.query(`
          SELECT s.id, s.nombre, s.categoria_id, c.nombre as categoria_nombre
          FROM Subcategorias s
          JOIN Categorias c ON s.categoria_id = c.id
          ORDER BY c.nombre, s.nombre
        `);
        await connection.end();
        return res.status(200).json(rows);
      } catch (error) {
        console.error('Error al obtener subcategorías:', error);
        await connection.end();
        return res.status(500).json({ message: "Error al obtener las subcategorías" });
      }
    } 
    
    else if (req.method === "POST") {
      const { nombre, categoria_id } = req.body;
      
      if (!nombre || nombre.trim() === '' || !categoria_id) {
        await connection.end();
        return res.status(400).json({ message: "El nombre y la categoría son requeridos" });
      }

      try {
        // Verificar que la categoría existe
        const [categorias] = await connection.query(
          "SELECT id FROM Categorias WHERE id = ?",
          [categoria_id]
        );

        if (Array.isArray(categorias) && categorias.length === 0) {
          await connection.end();
          return res.status(400).json({ message: "La categoría seleccionada no existe" });
        }

        const [result] = await connection.query(
          "INSERT INTO Subcategorias (nombre, categoria_id) VALUES (?, ?)",
          [nombre.trim(), categoria_id]
        );
        
        await connection.end();
        return res.status(201).json({
          message: "Subcategoría creada correctamente",
          id: result.insertId
        });
      } catch (error: any) {
        console.error('Error al crear subcategoría:', error);
        await connection.end();
        if (error.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ message: "Ya existe una subcategoría con ese nombre en la categoría seleccionada" });
        }
        return res.status(500).json({ message: "Error al crear la subcategoría" });
      }
    }

    else {
      await connection.end();
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ message: `Método ${req.method} no permitido` });
    }

  } catch (error) {
    console.error('Error de conexión:', error);
    return res.status(500).json({ message: "Error de conexión con la base de datos" });
  }
}