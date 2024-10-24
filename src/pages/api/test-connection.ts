import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Intenta realizar una consulta simple
    const testQuery = await prisma.rolesFinal.findMany({
      take: 1
    })
    
    res.status(200).json({ 
      success: true, 
      message: 'Conexión exitosa a la base de datos',
      data: testQuery
    })
  } catch (error) {
    console.error('Error de conexión:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Error al conectar con la base de datos',
      error: error instanceof Error ? error.message : 'Error desconocido'
    })
  }
}