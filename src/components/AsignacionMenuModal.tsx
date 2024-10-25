import { useState, useEffect } from 'react';
import { Menu, AsignacionMenu, DiaSemana, diasSemana } from '../types/menuTypes';
import Swal from 'sweetalert2';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clienteId: number;
  clienteNombre: string;
}

export default function AsignacionMenuModal({ isOpen, onClose, clienteId, clienteNombre }: Props) {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [asignaciones, setAsignaciones] = useState<AsignacionMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      cargarDatos();
    }
  }, [isOpen, clienteId]);

  // Función para cargar menús y asignaciones existentes
  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar menús disponibles
      const resMenus = await fetch('/api/menus');
      if (!resMenus.ok) throw new Error('Error al cargar menús');
      const menusData = await resMenus.json();
      setMenus(menusData);

      // Cargar asignaciones existentes del cliente
      const resAsignaciones = await fetch(`/api/asignacionMenus?clienteId=${clienteId}`);
      if (!resAsignaciones.ok) throw new Error('Error al cargar asignaciones');
      const asignacionesData = await resAsignaciones.json();
      setAsignaciones(asignacionesData);

    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los datos',
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para guardar las asignaciones
  const guardarAsignaciones = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/asignacionMenus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cliente_id: clienteId,
          configuraciones: asignaciones
        }),
      });

      if (!res.ok) throw new Error('Error al guardar');

      await Swal.fire({
        icon: 'success',
        title: 'Guardado',
        text: 'Las asignaciones se guardaron correctamente',
      });

      onClose();
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron guardar las asignaciones',
      });
    } finally {
      setSaving(false);
    }
  };

  // Función para actualizar una asignación
  const actualizarAsignacion = (dia: DiaSemana, menuId: string) => {
    const menuIdNum = parseInt(menuId);
    
    setAsignaciones(prev => {
      // Eliminar asignación existente para ese día
      const filtradas = prev.filter(a => a.dia_semana !== dia);
      
      // Si se seleccionó un menú válido, agregar nueva asignación
      if (menuIdNum > 0) {
        return [...filtradas, {
          cliente_id: clienteId,
          menu_id: menuIdNum,
          dia_semana: dia
        }];
      }
      
      return filtradas;
    });
  };

  // Si el modal no está abierto, no renderizamos nada
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-blue-600 bg-opacity-50 z-50 flex justify-center items-center h-[100%]">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            Asignar Menús - {clienteNombre}
          </h2>
          <button 
            onClick={onClose}
            className="text-white-500 bg-red-600 hover:bg-red-700"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">Cargando...</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {diasSemana.map((dia) => (
                <div key={dia} className="flex items-center gap-4">
                  <span className="w-28 font-medium">{dia}:</span>
                  <select
                    className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    value={asignaciones.find(a => a.dia_semana === dia)?.menu_id || ''}
                    onChange={(e) => actualizarAsignacion(dia, e.target.value)}
                  >
                    <option value="">Sin menú asignado</option>
                    {menus.map((menu) => (
                      <option key={menu.id} value={menu.id}>
                        {menu.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
              <button
                onClick={onClose}
                className="px-4 py-2 border rounded hover:bg-blue-700 transition duration-300"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                onClick={guardarAsignaciones}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300 disabled:bg-blue-300"
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar Asignaciones'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}