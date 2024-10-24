import { NextApiRequest, NextApiResponse } from "next";
import mysql from "mysql2/promise";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  });

  if (req.method === "GET") {
    try {
      const [rows] = await connection.query("SELECT * FROM productos");
      res.status(200).json(rows);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener productos" });
    }
  } else if (req.method === "POST") {
    const { descripcion, presentacion_id, categoria_id, subcategoria_id } = req.body;
    try {
      await connection.query(
        "INSERT INTO productos (descripcion, presentacion_id, categoria_id, subcategoria_id) VALUES (?, ?, ?, ?)",
        [descripcion, presentacion_id, categoria_id, subcategoria_id]
      );
      res.status(201).json({ message: "Producto creado correctamente" });
    } catch (error) {
      res.status(500).json({ message: "Error al crear el producto" });
    }
  } else if (req.method === "PUT") {
    const { id, descripcion, presentacion_id, categoria_id, subcategoria_id } = req.body;
    try {
      await connection.query(
        "UPDATE productos SET descripcion = ?, presentacion_id = ?, categoria_id = ?, subcategoria_id = ? WHERE id = ?",
        [descripcion, presentacion_id, categoria_id, subcategoria_id, id]
      );
      res.status(200).json({ message: "Producto actualizado correctamente" });
    } catch (error) {
      res.status(500).json({ message: "Error al actualizar el producto" });
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.query;  // Obtener el id desde req.query
    try {
      await connection.query('DELETE FROM productos WHERE id = ?', [id]);
      res.status(200).json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar el producto' });
    }
  }
  

  connection.end();
}
