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
        const [rows] = await connection.query(
          "SELECT id, nombre FROM Categorias ORDER BY nombre"
        );
        await connection.end();
        return res.status(200).json(rows);
      } catch (error) {
        console.error('Error al obtener categorías:', error);
        await connection.end();
        return res.status(500).json({ message: "Error al obtener las categorías" });
      }
    } 
    
    else if (req.method === "POST") {
      const { nombre } = req.body;
      
      if (!nombre || nombre.trim() === '') {
        await connection.end();
        return res.status(400).json({ message: "El nombre es requerido" });
      }

      try {
        const [result] = await connection.query(
          "INSERT INTO Categorias (nombre) VALUES (?)",
          [nombre.trim()]
        );
        await connection.end();
        return res.status(201).json({
          message: "Categoría creada correctamente",
          id: result.insertId
        });
      } catch (error: any) {
        console.error('Error al crear categoría:', error);
        await connection.end();
        if (error.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ message: "Ya existe una categoría con ese nombre" });
        }
        return res.status(500).json({ message: "Error al crear la categoría" });
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