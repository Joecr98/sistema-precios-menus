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
      const [rows] = await connection.query(`
        SELECT 
          p.*,
          pr.precio_unidad,
          pr.precio_costo
        FROM productos p
        LEFT JOIN (
          SELECT 
            producto_id,
            precio_unidad,
            precio_costo
          FROM Precios p1
          WHERE fecha_actualizacion = (
            SELECT MAX(fecha_actualizacion)
            FROM Precios p2
            WHERE p1.producto_id = p2.producto_id
          )
        ) pr ON p.id = pr.producto_id
      `);
      res.status(200).json(rows);
    } catch (error) {
      console.error("Error al obtener productos:", error);
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
    const { id } = req.query;
    try {
      await connection.query('DELETE FROM productos WHERE id = ?', [id]);
      res.status(200).json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar el producto' });
    }
  }

  connection.end();
}