"use client";

import { useEffect, useState } from "react";

interface Product {
  id: number;
  descripcion: string;
  presentacion_id: number;
  categoria_id: number;
  subcategoria_id: number;
  precio_unidad: number | string | null;
  precio_costo: number | string | null;
}

interface SelectOptions {
  presentaciones: { id: number; nombre: string }[];
  categorias: { id: number; nombre: string }[];
  subcategorias: { id: number; nombre: string; categoria_id: number }[];
}

interface NewProduct {
  descripcion: string;
  presentacion_id: number;
  categoria_id: number;
  subcategoria_id: number;
  precio_costo: string;
  precio_unidad: string;
}

const formatPrice = (price: number | string | null | undefined): string => {
  if (!price) return "No disponible";
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  return `Q${numPrice.toFixed(2)}`;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectOptions, setSelectOptions] = useState<SelectOptions>({
    presentaciones: [],
    categorias: [],
    subcategorias: [],
  });

  // Nuevo estado para elementos
  const [newPresentacion, setNewPresentacion] = useState("");
  const [newCategoria, setNewCategoria] = useState("");
  const [newSubcategoria, setNewSubcategoria] = useState("");
  const [selectedCategoriaForSub, setSelectedCategoriaForSub] =
    useState<number>(0);

  // Estado para mostrar/ocultar formularios
  const [showNewPresentacion, setShowNewPresentacion] = useState(false);
  const [showNewCategoria, setShowNewCategoria] = useState(false);
  const [showNewSubcategoria, setShowNewSubcategoria] = useState(false);

  const [newProduct, setNewProduct] = useState<NewProduct>({
    descripcion: "",
    presentacion_id: 0,
    categoria_id: 0,
    subcategoria_id: 0,
    precio_costo: "",
    precio_unidad: "",
  });

  const [editProduct, setEditProduct] = useState<Product | null>(null);
  // Estados para mensajes
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  useEffect(() => {
    fetchProducts();
    fetchSelectOptions();
  }, []);

  const fetchProducts = async () => {
    const response = await fetch("/api/products");
    const data = await response.json();
    setProducts(data);
  };

  const fetchSelectOptions = async () => {
    const response = await fetch("/api/selectOptions");
    const data = await response.json();
    setSelectOptions(data);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: name.includes("id") ? Number(value) : value,
    }));
  };

  const handleAddPresentacion = async () => {
    if (!newPresentacion.trim()) {
      setError("El nombre de la presentación no puede estar vacío");
      return;
    }

    try {
      const response = await fetch("/api/presentaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: newPresentacion }),
      });

      if (response.ok) {
        setSuccess("Presentación agregada correctamente");
        setNewPresentacion("");
        setShowNewPresentacion(false);
        fetchSelectOptions();
      } else {
        setError("Error al agregar la presentación");
      }
    } catch (error) {
      setError("Error al agregar la presentación");
    }
  };

  const handleAddCategoria = async () => {
    if (!newCategoria.trim()) {
      setError("El nombre de la categoría no puede estar vacío");
      return;
    }

    try {
      const response = await fetch("/api/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: newCategoria }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || "Categoría agregada correctamente");
        setNewCategoria("");
        setShowNewCategoria(false);
        await fetchSelectOptions(); // Asegúrate de que esto sea una llamada await
      } else {
        setError(data.message || "Error al agregar la categoría");
      }
    } catch (error) {
      console.error("Error al agregar categoría:", error);
      setError("Error al agregar la categoría");
    }
  };

  const handleAddSubcategoria = async () => {
    if (!newSubcategoria.trim() || selectedCategoriaForSub === 0) {
      setError("Debe completar todos los campos de la subcategoría");
      return;
    }

    try {
      const response = await fetch("/api/subcategorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: newSubcategoria,
          categoria_id: selectedCategoriaForSub,
        }),
      });

      if (response.ok) {
        setSuccess("Subcategoría agregada correctamente");
        setNewSubcategoria("");
        setSelectedCategoriaForSub(0);
        setShowNewSubcategoria(false);
        fetchSelectOptions();
      } else {
        setError("Error al agregar la subcategoría");
      }
    } catch (error) {
      setError("Error al agregar la subcategoría");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Si estamos editando, validamos los precios del producto editado
    if (editProduct) {
      if (!editProduct.precio_costo || !editProduct.precio_unidad) {
        setError("Los precios son obligatorios");
        return;
      }
    } else {
      // Si estamos creando un nuevo producto, validamos los precios del nuevo producto
      if (!newProduct.precio_costo || !newProduct.precio_unidad) {
        setError("Los precios son obligatorios");
        return;
      }
    }

    try {
      // Preparar los datos para enviar
      const dataToSend = editProduct
        ? {
            ...editProduct,
            precio_costo:
              typeof editProduct.precio_costo === "string"
                ? parseFloat(editProduct.precio_costo)
                : editProduct.precio_costo,
            precio_unidad:
              typeof editProduct.precio_unidad === "string"
                ? parseFloat(editProduct.precio_unidad)
                : editProduct.precio_unidad,
          }
        : newProduct;

      const response = await fetch("/api/products", {
        method: editProduct ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        setSuccess(
          editProduct
            ? "Producto actualizado correctamente"
            : "Producto creado correctamente"
        );
        fetchProducts();
        setNewProduct({
          descripcion: "",
          presentacion_id: 0,
          categoria_id: 0,
          subcategoria_id: 0,
          precio_costo: "",
          precio_unidad: "",
        });
        setEditProduct(null);
      } else {
        const data = await response.json();
        setError(data.message || "Error al guardar el producto");
      }
    } catch (error) {
      console.error("Error al guardar el producto:", error);
      setError("Error al guardar el producto");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/products?id=${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(data.message);
        fetchProducts();
      } else {
        setError(data.message || "Error al borrar el producto");
      }
    } catch (error) {
      setError("Error al borrar el producto");
    }
  };

  const handleEdit = (product: Product) => {
    setEditProduct(product);
  };

  const getPresentacionNombre = (id: number) => {
    const presentacion = selectOptions.presentaciones.find((p) => p.id === id);
    return presentacion ? presentacion.nombre : "Sin presentación";
  };

  const getCategoriaNombre = (id: number) => {
    const categoria = selectOptions.categorias.find((c) => c.id === id);
    return categoria ? categoria.nombre : "Sin categoría";
  };

  const getSubcategoriaNombre = (id: number) => {
    const subcategoria = selectOptions.subcategorias.find((s) => s.id === id);
    return subcategoria ? subcategoria.nombre : "Sin subcategoría";
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Lista de Productos</h1>

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

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Presentación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subcategoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio Costo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio Unidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {product.descripcion}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getPresentacionNombre(product.presentacion_id)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getCategoriaNombre(product.categoria_id)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getSubcategoriaNombre(product.subcategoria_id)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatPrice(product.precio_costo)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatPrice(product.precio_unidad)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-white-600 bg-orange-500 hover:bg-orange-700 mr-4"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-white bg-red-500 hover:bg-red-700"
                  >
                    Borrar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
          {editProduct ? "Editar Producto" : "Agregar Nuevo Producto"}
        </h2>

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

        <div className="mb-6 space-y-4">
          {/* Formulario para nueva presentación */}
          <div>
            <button
              type="button"
              onClick={() => setShowNewPresentacion(!showNewPresentacion)}
              className="text-white-600 hover:text-indigo-900"
            >
              {showNewPresentacion
                ? "- Cancelar nueva presentación"
                : "+ Agregar nueva presentación"}
            </button>
            {showNewPresentacion && (
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={newPresentacion}
                  onChange={(e) => setNewPresentacion(e.target.value)}
                  placeholder="Nombre de la presentación"
                  className="flex-1 rounded-md border-gray-300"
                />
                <button
                  onClick={handleAddPresentacion}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Agregar
                </button>
              </div>
            )}
          </div>

          {/* Formulario para nueva categoría */}
          <div>
            <button
              type="button"
              onClick={() => setShowNewCategoria(!showNewCategoria)}
              className="text-white-600 hover:text-indigo-900"
            >
              {showNewCategoria
                ? "- Cancelar nueva categoría"
                : "+ Agregar nueva categoría"}
            </button>
            {showNewCategoria && (
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={newCategoria}
                  onChange={(e) => setNewCategoria(e.target.value)}
                  placeholder="Nombre de la categoría"
                  className="flex-1 rounded-md border-gray-300"
                />
                <button
                  onClick={handleAddCategoria}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Agregar
                </button>
              </div>
            )}
          </div>

          {/* Formulario para nueva subcategoría */}
          <div>
            <button
              type="button"
              onClick={() => setShowNewSubcategoria(!showNewSubcategoria)}
              className="text-white-600 hover:text-indigo-900"
            >
              {showNewSubcategoria
                ? "- Cancelar nueva subcategoría"
                : "+ Agregar nueva subcategoría"}
            </button>
            {showNewSubcategoria && (
              <div className="mt-2 space-y-2">
                <select
                  value={selectedCategoriaForSub}
                  onChange={(e) =>
                    setSelectedCategoriaForSub(Number(e.target.value))
                  }
                  className="w-full rounded-md border-gray-300"
                >
                  <option value={0}>Selecciona una categoría</option>
                  {selectOptions.categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubcategoria}
                    onChange={(e) => setNewSubcategoria(e.target.value)}
                    placeholder="Nombre de la subcategoría"
                    className="flex-1 rounded-md border-gray-300"
                  />
                  <button
                    onClick={handleAddSubcategoria}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="descripcion"
              value={
                editProduct ? editProduct.descripcion : newProduct.descripcion
              }
              onChange={(e) =>
                editProduct
                  ? setEditProduct({
                      ...editProduct,
                      descripcion: e.target.value,
                    })
                  : handleChange(e)
              }
              placeholder="Descripción"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              name="presentacion_id"
              value={
                editProduct
                  ? editProduct.presentacion_id
                  : newProduct.presentacion_id
              }
              onChange={(e) =>
                editProduct
                  ? setEditProduct({
                      ...editProduct,
                      presentacion_id: Number(e.target.value),
                    })
                  : handleChange(e)
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            >
              <option value={0} disabled>
                Selecciona una presentación
              </option>
              {selectOptions.presentaciones.map((presentacion) => (
                <option key={presentacion.id} value={presentacion.id}>
                  {presentacion.nombre}
                </option>
              ))}
            </select>

            <select
              name="categoria_id"
              value={
                editProduct ? editProduct.categoria_id : newProduct.categoria_id
              }
              onChange={(e) =>
                editProduct
                  ? setEditProduct({
                      ...editProduct,
                      categoria_id: Number(e.target.value),
                    })
                  : handleChange(e)
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            >
              <option value={0} disabled>
                Selecciona una categoría
              </option>
              {selectOptions.categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>

            <select
              name="subcategoria_id"
              value={
                editProduct
                  ? editProduct.subcategoria_id
                  : newProduct.subcategoria_id
              }
              onChange={(e) =>
                editProduct
                  ? setEditProduct({
                      ...editProduct,
                      subcategoria_id: Number(e.target.value),
                    })
                  : handleChange(e)
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            >
              <option value={0} disabled>
                Selecciona una subcategoría
              </option>
              {selectOptions.subcategorias
                .filter(
                  (subcategoria) =>
                    subcategoria.categoria_id ===
                    (editProduct
                      ? editProduct.categoria_id
                      : newProduct.categoria_id)
                )
                .map((subcategoria) => (
                  <option key={subcategoria.id} value={subcategoria.id}>
                    {subcategoria.nombre}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio Costo
              </label>
              <input
                type="number"
                name="precio_costo"
                step="0.01"
                min="0"
                value={
                  editProduct
                    ? editProduct.precio_costo || ""
                    : newProduct.precio_costo
                }
                onChange={(e) => {
                  if (editProduct) {
                    setEditProduct({
                      ...editProduct,
                      precio_costo: e.target.value,
                    });
                  } else {
                    handleChange(e);
                  }
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio Unidad
              </label>
              <input
                type="number"
                name="precio_unidad"
                step="0.01"
                min="0"
                value={
                  editProduct
                    ? editProduct.precio_unidad || ""
                    : newProduct.precio_unidad
                }
                onChange={(e) => {
                  if (editProduct) {
                    setEditProduct({
                      ...editProduct,
                      precio_unidad: e.target.value,
                    });
                  } else {
                    handleChange(e);
                  }
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {editProduct ? "Guardar Cambios" : "Agregar Producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
