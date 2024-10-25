import { NextApiRequest, NextApiResponse } from "next";
import mysql from "mysql2/promise";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    const connection = await mysql.createConnection({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
    });

    try {
      // Obtener presentaciones
      const [presentaciones] = await connection.query(
        "SELECT id, nombre FROM Presentaciones ORDER BY nombre"
      );

      // Obtener categorías
      const [categorias] = await connection.query(
        "SELECT id, nombre FROM Categorias ORDER BY nombre"
      );

      // Obtener subcategorías
      const [subcategorias] = await connection.query(`
        SELECT id, nombre, categoria_id 
        FROM Subcategorias 
        ORDER BY nombre
      `);

      await connection.end();

      res.status(200).json({
        presentaciones,
        categorias,
        subcategorias,
      });
    } catch (error) {
      console.error("Error al obtener opciones:", error);
      await connection.end();
      res.status(500).json({ message: "Error al obtener las opciones" });
    }
  } catch (error) {
    console.error("Error de conexión:", error);
    res.status(500).json({ message: "Error de conexión con la base de datos" });
  }
}
