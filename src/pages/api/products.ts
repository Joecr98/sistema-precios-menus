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
          p.*,
          pres.nombre as presentacion,
          cat.nombre as categoria,
          subcat.nombre as subcategoria,
          COALESCE(pr.precio_unidad, 0) as precio_unidad,
          COALESCE(pr.precio_costo, 0) as precio_costo
        FROM Productos p
        LEFT JOIN Presentaciones pres ON p.presentacion_id = pres.id
        LEFT JOIN Categorias cat ON p.categoria_id = cat.id
        LEFT JOIN Subcategorias subcat ON p.subcategoria_id = subcat.id
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
      await connection.end();
      return res.status(200).json(rows);
    }
    
    else if (req.method === "POST") {
      const { descripcion, presentacion_id, categoria_id, subcategoria_id, precio_costo, precio_unidad } = req.body;
      
      if (!descripcion || !presentacion_id || !categoria_id || !subcategoria_id) {
        await connection.end();
        return res.status(400).json({ message: "Todos los campos son requeridos" });
      }

      try {
        await connection.beginTransaction();

        // Insertar el producto
        const [result]: any = await connection.query(
          "INSERT INTO Productos (descripcion, presentacion_id, categoria_id, subcategoria_id) VALUES (?, ?, ?, ?)",
          [descripcion, presentacion_id, categoria_id, subcategoria_id]
        );

        // Insertar el precio
        await connection.query(
          "INSERT INTO Precios (producto_id, precio_costo, precio_unidad, id_usuario) VALUES (?, ?, ?, ?)",
          [result.insertId, precio_costo, precio_unidad, 1]
        );

        await connection.commit();
        await connection.end();
        return res.status(201).json({ 
          message: "Producto creado correctamente",
          id: result.insertId 
        });
      } catch (error) {
        await connection.rollback();
        await connection.end();
        console.error('Error al crear producto:', error);
        return res.status(500).json({ message: "Error al crear el producto" });
      }
    } 
    
    else if (req.method === "PUT") {
      const { id, descripcion, presentacion_id, categoria_id, subcategoria_id, precio_costo, precio_unidad } = req.body;
      
      if (!id || !descripcion || !presentacion_id || !categoria_id || !subcategoria_id) {
        await connection.end();
        return res.status(400).json({ message: "Todos los campos son requeridos" });
      }

      try {
        await connection.beginTransaction();

        // Actualizar el producto
        await connection.query(
          "UPDATE Productos SET descripcion = ?, presentacion_id = ?, categoria_id = ?, subcategoria_id = ? WHERE id = ?",
          [descripcion, presentacion_id, categoria_id, subcategoria_id, id]
        );

        // Insertar nuevo precio
        await connection.query(
          "INSERT INTO Precios (producto_id, precio_costo, precio_unidad, id_usuario) VALUES (?, ?, ?, ?)",
          [id, precio_costo, precio_unidad, 1]
        );

        await connection.commit();
        await connection.end();
        return res.status(200).json({ message: "Producto actualizado correctamente" });
      } catch (error) {
        await connection.rollback();
        await connection.end();
        console.error('Error al actualizar producto:', error);
        return res.status(500).json({ message: "Error al actualizar el producto" });
      }
    } 
    
    else if (req.method === 'DELETE') {
      const { id } = req.query;
      
      if (!id) {
        await connection.end();
        return res.status(400).json({ message: "ID es requerido" });
      }

      try {
        await connection.beginTransaction();
        
        // Primero verificar si el producto está siendo usado
        const [detallesMenu] = await connection.query(
          'SELECT COUNT(*) as count FROM DetallesMenu WHERE producto_id = ?',
          [id]
        );
        
        if (detallesMenu[0].count > 0) {
          await connection.rollback();
          await connection.end();
          return res.status(400).json({ 
            message: 'No se puede eliminar el producto porque está siendo usado en uno o más menús'
          });
        }

        const [detallesFactura] = await connection.query(
          'SELECT COUNT(*) as count FROM DetallesFactura WHERE producto_id = ?',
          [id]
        );

        if (detallesFactura[0].count > 0) {
          await connection.rollback();
          await connection.end();
          return res.status(400).json({ 
            message: 'No se puede eliminar el producto porque está siendo usado en una o más facturas'
          });
        }
        
        // Si no está siendo usado, procedemos a eliminar
        // Primero eliminamos los precios relacionados
        await connection.query(
          'DELETE FROM Precios WHERE producto_id = ?', 
          [id]
        );
        
        // Luego eliminamos el producto
        await connection.query(
          'DELETE FROM Productos WHERE id = ?', 
          [id]
        );
        
        await connection.commit();
        await connection.end();
        return res.status(200).json({ 
          message: 'Producto eliminado correctamente'
        });
      } catch (error) {
        await connection.rollback();
        await connection.end();
        console.error('Error al eliminar producto:', error);
        return res.status(500).json({ 
          message: 'Error al eliminar el producto'
        });
      }
    }

    
    else {
      await connection.end();
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).json({ message: `Método ${req.method} no permitido` });
    }

  } catch (error) {
    if (connection) {
      await connection.end();
    }
    console.error('Error de conexión:', error);
    return res.status(500).json({ 
      message: "Error de conexión con la base de datos" 
    });
  }
}