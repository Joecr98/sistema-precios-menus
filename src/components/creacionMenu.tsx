"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Save } from "lucide-react";

interface Producto {
  id: number;
  descripcion: string;
  presentacion: string;
  categoria: string;
  subcategoria: string;
  precio_unidad: number;
  precio_costo: number;
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
    nombre: "",
    detalles: [],
  });

  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [costoTotal, setCostoTotal] = useState(0);

  useEffect(() => {
    fetchProductos();
  }, []);

  useEffect(() => {
    calcularCostoTotal();
  }, [menu.detalles, productos]);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/products");

      if (!response.ok) {
        throw new Error(`Error al obtener productos: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Productos recibidos:", data); // Para debugging

      if (!Array.isArray(data)) {
        throw new Error("Los datos recibidos no tienen el formato esperado");
      }

      // Transformar y validar los datos recibidos
      const productosValidados = data.map((item) => ({
        id: item.id,
        descripcion: item.descripcion || "Sin descripción",
        presentacion: item.presentacion || "Sin presentación",
        categoria: item.categoria || "Sin categoría",
        subcategoria: item.subcategoria || "Sin subcategoría",
        precio_unidad: Number(item.precio_unidad) || 0,
        precio_costo: Number(item.precio_costo) || 0,
      }));

      setProductos(productosValidados);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al cargar los productos";
      setError(errorMessage);
      console.error("Error en fetchProductos:", err);
    } finally {
      setLoading(false);
    }
  };

  const calcularCostoTotal = () => {
    const total = menu.detalles.reduce((sum, detalle) => {
      const producto = productos.find(
        (p) => p.id === Number(detalle.producto_id)
      );
      return sum + (producto?.precio_unidad || 0) * detalle.cantidad;
    }, 0);
    setCostoTotal(total);
  };

  const agregarProducto = () => {
    setMenu((prev) => ({
      ...prev,
      detalles: [
        ...prev.detalles,
        {
          producto_id: "",
          cantidad: 1,
          es_extra: false,
        },
      ],
    }));
  };

  const eliminarProducto = (index: number) => {
    setMenu((prev) => ({
      ...prev,
      detalles: prev.detalles.filter((_, i) => i !== index),
    }));
  };

  const actualizarDetalle = (
    index: number,
    campo: keyof DetalleMenu,
    valor: any
  ) => {
    setMenu((prev) => {
      const nuevosDetalles = [...prev.detalles];
      nuevosDetalles[index] = {
        ...nuevosDetalles[index],
        [campo]:
          campo === "cantidad" ? Math.max(1, parseInt(valor) || 1) : valor,
      };
      return {
        ...prev,
        detalles: nuevosDetalles,
      };
    });
  };

  const limpiarFormulario = () => {
    setMenu({
      nombre: "",
      detalles: [],
    });
    setCostoTotal(0);
    setError("");
    setSuccess("");
  };

  const guardarMenu = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (!menu.nombre.trim()) {
        throw new Error("El nombre del menú es requerido");
      }

      if (menu.detalles.length === 0) {
        throw new Error("Debe agregar al menos un producto al menú");
      }

      const detallesInvalidos = menu.detalles.some(
        (detalle) => !detalle.producto_id || detalle.cantidad < 1
      );

      if (detallesInvalidos) {
        throw new Error(
          "Todos los productos deben tener una selección válida y cantidad mayor a 0"
        );
      }

      const response = await fetch("/api/menus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(menu),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al guardar el menú");
      }

      setSuccess("Menú guardado exitosamente");
      // Mostrar alerta
      alert("¡Menú guardado exitosamente!");

      limpiarFormulario();

    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el menú");
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
            onChange={(e) =>
              setMenu((prev) => ({ ...prev, nombre: e.target.value }))
            }
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
              <div
                key={index}
                className="flex gap-4 items-start p-4 bg-gray-50 rounded-md"
              >
                <div className="flex-1">
                  <select
                    value={detalle.producto_id}
                    onChange={(e) =>
                      actualizarDetalle(index, "producto_id", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccione un producto</option>
                    {productos.map((producto) => (
                      <option key={producto.id} value={producto.id}>
                        {`${producto.descripcion} - ${
                          producto.presentacion
                        } - Q${producto.precio_unidad.toFixed(2)}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-32">
                  <input
                    type="number"
                    value={detalle.cantidad}
                    onChange={(e) =>
                      actualizarDetalle(index, "cantidad", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    step="1"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={detalle.es_extra}
                    onChange={(e) =>
                      actualizarDetalle(index, "es_extra", e.target.checked)
                    }
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="text-sm text-gray-600">Extra</label>
                </div>

                <button
                  onClick={() => eliminarProducto(index)}
                  className="p-2 bg-white text-red-500 hover:text-red-700 rounded-full shadow-md hover:shadow-lg transition-all"
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
            Costo Total: Q{costoTotal.toFixed(2)}
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
              className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? "Guardando..." : "Guardar Menú"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreacionMenu;
