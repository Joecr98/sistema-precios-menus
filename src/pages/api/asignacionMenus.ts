import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // GET /api/menu-config?clienteId=X
  // Obtener configuración de menús para un cliente específico
  if (req.method === 'GET') {
    try {
      const { clienteId } = req.query;

      if (!clienteId) {
        return res.status(400).json({ error: 'ID del cliente es requerido' });
      }

      const configuraciones = await prisma.configuracionMenuCliente.findMany({
        where: {
          cliente_id: Number(clienteId)
        },
        include: {
          menu: {
            include: {
              detallesMenu: {
                include: {
                  producto: {
                    include: {
                      precios: {
                        orderBy: {
                          fecha_actualizacion: 'desc'
                        },
                        take: 1
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      return res.status(200).json(configuraciones);
    } catch (error) {
      console.error('Error al obtener configuración de menús:', error);
      return res.status(500).json({ error: 'Error al obtener la configuración de menús' });
    }
  }

  // POST /api/menu-config
  // Crear o actualizar configuración de menú para un cliente
  if (req.method === 'POST') {
    try {
      const { cliente_id, configuraciones } = req.body;

      if (!cliente_id || !configuraciones || !Array.isArray(configuraciones)) {
        return res.status(400).json({ 
          error: 'Se requiere ID del cliente y configuraciones de menús' 
        });
      }

      // Primero eliminamos las configuraciones existentes para este cliente
      await prisma.configuracionMenuCliente.deleteMany({
        where: {
          cliente_id: Number(cliente_id)
        }
      });

      // Luego creamos las nuevas configuraciones
      const nuevasConfiguraciones = await prisma.configuracionMenuCliente.createMany({
        data: configuraciones.map(config => ({
          cliente_id: Number(cliente_id),
          menu_id: Number(config.menu_id),
          dia_semana: config.dia_semana
        }))
      });

      // Obtenemos las configuraciones actualizadas con toda la información
      const configuracionesActualizadas = await prisma.configuracionMenuCliente.findMany({
        where: {
          cliente_id: Number(cliente_id)
        },
        include: {
          menu: {
            include: {
              detallesMenu: {
                include: {
                  producto: {
                    include: {
                      precios: {
                        orderBy: {
                          fecha_actualizacion: 'desc'
                        },
                        take: 1
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      return res.status(200).json(configuracionesActualizadas);
    } catch (error) {
      console.error('Error al actualizar configuración de menús:', error);
      return res.status(500).json({ error: 'Error al actualizar la configuración de menús' });
    }
  }

  // DELETE /api/menu-config?clienteId=X&menuId=Y&diaSemana=Z
  // Eliminar una configuración específica
  if (req.method === 'DELETE') {
    try {
      const { clienteId, menuId, diaSemana } = req.query;

      if (!clienteId || !menuId || !diaSemana) {
        return res.status(400).json({ 
          error: 'Se requieren ID del cliente, ID del menú y día de la semana' 
        });
      }

      await prisma.configuracionMenuCliente.deleteMany({
        where: {
          cliente_id: Number(clienteId),
          menu_id: Number(menuId),
          dia_semana: String(diaSemana)
        }
      });

      return res.status(200).json({ 
        message: 'Configuración eliminada correctamente' 
      });
    } catch (error) {
      console.error('Error al eliminar configuración:', error);
      return res.status(500).json({ error: 'Error al eliminar la configuración' });
    }
  }

  // Método no permitido
  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}