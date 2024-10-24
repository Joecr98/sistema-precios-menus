import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/db'; // Ajusta según tu estructura
import { ResultSetHeader } from 'mysql2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Obtener todos los clientes
    try {
      const [clientes] = await db.query('SELECT * FROM Clientes');
      res.status(200).json(clientes);
    } catch (error) {
      console.error('Error al obtener los clientes:', error);
      res.status(500).json({ message: 'Error al obtener los clientes' });
    }
  } else if (req.method === 'POST') {
    // Crear un nuevo cliente
    const { nombre, direccion, telefono } = req.body;
    if (!nombre) {
      return res.status(400).json({ message: 'El nombre es obligatorio' });
    }
    try {
      const [result] = await db.query<ResultSetHeader>(
        'INSERT INTO Clientes (nombre, direccion, telefono) VALUES (?, ?, ?)', 
        [nombre, direccion, telefono]
      );

      // Aquí puedes acceder a result.insertId
      res.status(201).json({ id: result.insertId });
    } catch (error) {
      console.error('Error al crear el cliente:', error);
      res.status(500).json({ message: 'Error al crear el cliente' });
    }
  } else if (req.method === 'PUT') {
    // Actualizar cliente
    const { id, nombre, direccion, telefono } = req.body;
    if (!id || !nombre) {
      return res.status(400).json({ message: 'ID y nombre son obligatorios' });
    }
    try {
      await db.query('UPDATE Clientes SET nombre = ?, direccion = ?, telefono = ? WHERE id = ?', 
        [nombre, direccion, telefono, id]
      );
      res.status(200).json({ message: 'Cliente actualizado correctamente' });
    } catch (error) {
      console.error('Error al actualizar el cliente:', error);
      res.status(500).json({ message: 'Error al actualizar el cliente' });
    }
  } else if (req.method === 'DELETE') {
    // Eliminar cliente
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: 'ID es obligatorio' });
    }
    try {
      await db.query('DELETE FROM Clientes WHERE id = ?', [id]);
      res.status(200).json({ message: 'Cliente eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar el cliente:', error);
      res.status(500).json({ message: 'Error al eliminar el cliente' });
    }
  } else {
    res.status(405).json({ message: 'Método no permitido' });
  }
}
