import { NextApiRequest, NextApiResponse } from "next";
import mysql from "mysql2/promise";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
    });

    if (req.method === "GET") {
      const [rows] = await connection.query(`
        SELECT 
          p.id,
          p.descripcion,
          pres.nombre as presentacion,
          cat.nombre as categoria,
          subcat.nombre as subcategoria,
          pr.precio_unidad,
          pr.precio_costo
        FROM Productos p
        LEFT JOIN Presentaciones pres ON p.presentacion_id = pres.id
        LEFT JOIN Categorias cat ON p.categoria_id = cat.id
        LEFT JOIN Subcategorias subcat ON p.subcategoria_id = subcat.id
        LEFT JOIN (
          SELECT 
            producto_id,
            precio_unidad,
            precio_costo,
            fecha_actualizacion
          FROM Precios p1
          WHERE fecha_actualizacion = (
            SELECT MAX(fecha_actualizacion)
            FROM Precios p2
            WHERE p1.producto_id = p2.producto_id
          )
        ) pr ON p.id = pr.producto_id
        ORDER BY p.descripcion
      `);
      
      console.log('Productos obtenidos:', rows); // Para debugging
      return res.status(200).json(rows);
    }

    // ... resto de los métodos (POST, PUT, DELETE) permanecen igual ...

  } catch (error) {
    console.error("Error en el endpoint de productos:", error);
    return res.status(500).json({ 
      message: "Error al procesar la solicitud de productos",
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}