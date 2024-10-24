"use client";

import { useState, useEffect } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';

interface Producto {
  id: number;
  descripcion: string;
  precio_unidad: number;
}

interface DetalleMenu {
  producto_id: string | number;
  cantidad: number;
  es_extra: boolean;
}

interface Menu {
  nombre: string;
  detalles: DetalleMenu[];
}

const CreacionMenu = () => {
  const [menu, setMenu] = useState<Menu>({
    nombre: '',
    detalles: []
  });
  
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [costoTotal, setCostoTotal] = useState(0);

  useEffect(() => {
    fetchProductos();
  }, []);

  useEffect(() => {
    calcularCostoTotal();
  }, [menu.detalles]);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/productos');
      if (!response.ok) {
        throw new Error('Error al obtener productos');
      }
      const data = await response.json();
      setProductos(data);
    } catch (err) {
      setError('Error al cargar los productos');
      console.error('Error fetching productos:', err);
    } finally {
      setLoading(false);
    }
  };

  const calcularCostoTotal = () => {
    const total = menu.detalles.reduce((sum, detalle) => {
      const producto = productos.find(p => p.id === parseInt(detalle.producto_id as string));
      return sum + (producto?.precio_unidad || 0) * detalle.cantidad;
    }, 0);
    setCostoTotal(total);
  };

  const agregarProducto = () => {
    setMenu(prev => ({
      ...prev,
      detalles: [...prev.detalles, {
        producto_id: '',
        cantidad: 1,
        es_extra: false
      }]
    }));
  };

  const eliminarProducto = (index: number) => {
    setMenu(prev => ({
      ...prev,
      detalles: prev.detalles.filter((_, i) => i !== index)
    }));
  };

  const actualizarDetalle = (index: number, campo: keyof DetalleMenu, valor: any) => {
    if (campo === 'cantidad') {
      // Convertir a entero y asegurarse de que no sea negativo
      valor = Math.max(1, parseInt(valor) || 1);
    }
    
    setMenu(prev => {
      const nuevosDetalles = [...prev.detalles];
      nuevosDetalles[index] = {
        ...nuevosDetalles[index],
        [campo]: valor
      };
      return {
        ...prev,
        detalles: nuevosDetalles
      };
    });
  };

  const limpiarFormulario = () => {
    setMenu({
      nombre: '',
      detalles: []
    });
    setCostoTotal(0);
    setError('');
  };

  const validarFormulario = (): boolean => {
    if (!menu.nombre.trim()) {
      setError('El nombre del menú es requerido');
      return false;
    }

    if (menu.detalles.length === 0) {
      setError('Debe agregar al menos un producto al menú');
      return false;
    }

    for (const detalle of menu.detalles) {
      if (!detalle.producto_id) {
        setError('Todos los productos deben ser seleccionados');
        return false;
      }
      if (detalle.cantidad < 1 || !Number.isInteger(detalle.cantidad)) {
        setError('La cantidad debe ser un número entero mayor a 0');
        return false;
      }
    }

    return true;
  };

  const guardarMenu = async () => {
    setError('');
    setSuccess('');

    if (!validarFormulario()) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/menus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(menu)
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al guardar el menú');
      }
      
      setSuccess('Menú creado exitosamente');
      limpiarFormulario();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el menú');
      console.error('Error saving menu:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && productos.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Crear Nuevo Menú</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Menú
          </label>
          <input
            type="text"
            value={menu.nombre}
            onChange={(e) => setMenu(prev => ({ ...prev, nombre: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ingrese el nombre del menú"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Productos</h3>
            <button
              onClick={agregarProducto}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agregar Producto
            </button>
          </div>

          <div className="space-y-4">
            {menu.detalles.map((detalle, index) => (
              <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 rounded-md">
                <div className="flex-1">
                  <select
                    value={detalle.producto_id}
                    onChange={(e) => actualizarDetalle(index, 'producto_id', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccione un producto</option>
                    {productos.map(producto => (
                      <option key={producto.id} value={producto.id}>
                        {producto.descripcion}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-32">
                  <input
                    type="number"
                    value={detalle.cantidad}
                    onChange={(e) => actualizarDetalle(index, 'cantidad', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    step="1" // Asegura que solo se puedan ingresar números enteros
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={detalle.es_extra}
                    onChange={(e) => actualizarDetalle(index, 'es_extra', e.target.checked)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="text-sm text-gray-600">Extra</label>
                </div>

                <button
                  onClick={() => eliminarProducto(index)}
                  className="p-2 text-red-500 hover:text-red-700 transition-colors"
                  title="Eliminar producto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="text-lg font-semibold text-gray-700">
            Costo Total: ${costoTotal.toFixed(2)}
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={limpiarFormulario}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={guardarMenu}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Guardando...' : 'Guardar Menú'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreacionMenu;