import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { db } from '../../lib/db'; // Ajusta la ruta relativa según la ubicación de login.ts

const SECRET_KEY = process.env.JWT_SECRET || 'clave-secreta';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { correo, contraseña } = req.body;

    try {
      // Especificar el tipo de resultado que esperamos de la consulta
      const [rows]: [any[], any] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);

      // Accedemos al primer resultado (primer usuario)
      const usuario = rows[0];

      // Verificar si el usuario existe
      if (!usuario) {
        return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
      }

      // Comparar la contraseña ingresada con la almacenada (sin encriptación)
      if (usuario.contraseña !== contraseña) {
        return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
      }

      // Generar JWT si las credenciales son válidas
      const token = jwt.sign(
        {
          id: usuario.id_usuario,
          correo: usuario.correo,
          rol: usuario.rol,
        },
        SECRET_KEY,
        { expiresIn: '1h' }
      );

      res.status(200).json({ token, message: 'Inicio de sesión exitoso' });
    } catch (error) {
      res.status(500).json({ message: 'Error en el servidor' });
    }
  } else {
    res.status(405).json({ message: 'Método no permitido' });
  }
}
