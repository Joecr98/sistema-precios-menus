"use client";

import { useEffect, useState } from "react";

interface Product {
  id: number;
  descripcion: string;
  presentacion_id: number;
  categoria_id: number;
  subcategoria_id: number;
}

interface SelectOptions {
  presentaciones: { id: number; nombre: string }[];
  categorias: { id: number; nombre: string }[];
  subcategorias: { id: number; nombre: string; categoria_id: number }[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectOptions, setSelectOptions] = useState<SelectOptions>({
    presentaciones: [],
    categorias: [],
    subcategorias: [],
  });
  const [newProduct, setNewProduct] = useState<{ descripcion: string; presentacion_id: number; categoria_id: number; subcategoria_id: number }>({
    descripcion: "",
    presentacion_id: 0,
    categoria_id: 0,
    subcategoria_id: 0,
  });
  const [editProduct, setEditProduct] = useState<Product | null>(null);

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
    console.log("Opciones recibidas:", data); // Verificar el formato de las opciones
    setSelectOptions(data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: name.includes("id") ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await fetch("/api/products", {
      method: editProduct ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editProduct ? editProduct : newProduct),
    });
    if (response.ok) {
      fetchProducts();
      setNewProduct({ descripcion: "", presentacion_id: 0, categoria_id: 0, subcategoria_id: 0 });
      setEditProduct(null);
    } else {
      console.error("Error al crear o editar el producto");
    }
  };

  const handleDelete = async (id: number) => {
    const response = await fetch(`/api/products?id=${id}`, { // Pasar el id como query param
      method: "DELETE",
    });
    if (response.ok) {
      fetchProducts();
    } else {
      console.error("Error al borrar el producto");
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
    <div>
      <h1>Lista de Productos</h1>
      <div style={{ display: "table", width: "100%" }}>
        <div style={{ display: "table-header-group" }}>
          <div style={{ display: "table-row" }}>
            <div style={{ display: "table-cell", fontWeight: "bold", padding: "10px" }}>Descripción</div>
            <div style={{ display: "table-cell", fontWeight: "bold", padding: "10px" }}>Presentación</div>
            <div style={{ display: "table-cell", fontWeight: "bold", padding: "10px" }}>Categoría</div>
            <div style={{ display: "table-cell", fontWeight: "bold", padding: "10px" }}>Subcategoría</div>
            <div style={{ display: "table-cell", fontWeight: "bold", padding: "10px" }}>Acciones</div>
          </div>
        </div>
        <div style={{ display: "table-row-group" }}>
          {products.map((product) => (
            <div key={product.id} style={{ display: "table-row" }}>
              <div style={{ display: "table-cell" }}>{product.descripcion}</div>
              <div style={{ display: "table-cell" }}>{getPresentacionNombre(product.presentacion_id)}</div>
              <div style={{ display: "table-cell" }}>{getCategoriaNombre(product.categoria_id)}</div>
              <div style={{ display: "table-cell" }}>{getSubcategoriaNombre(product.subcategoria_id)}</div>
              <div style={{ display: "table-cell" }}>
                <button onClick={() => handleEdit(product)}>Editar</button>
                <button onClick={() => handleDelete(product.id)}>Borrar</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <h2 style={{ marginTop: "10px" }}>{editProduct ? "Editar Producto" : "Agregar Nuevo Producto"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="descripcion"
          value={editProduct ? editProduct.descripcion : newProduct.descripcion}
          onChange={(e) => (editProduct ? setEditProduct({ ...editProduct, descripcion: e.target.value }) : handleChange(e))}
          placeholder="Descripción"
          required
        />

        <select
          name="presentacion_id"
          value={editProduct ? editProduct.presentacion_id : newProduct.presentacion_id}
          onChange={(e) => (editProduct ? setEditProduct({ ...editProduct, presentacion_id: Number(e.target.value) }) : handleChange(e))}
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
          value={editProduct ? editProduct.categoria_id : newProduct.categoria_id}
          onChange={(e) => (editProduct ? setEditProduct({ ...editProduct, categoria_id: Number(e.target.value) }) : handleChange(e))}
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
          value={editProduct ? editProduct.subcategoria_id : newProduct.subcategoria_id}
          onChange={(e) => (editProduct ? setEditProduct({ ...editProduct, subcategoria_id: Number(e.target.value) }) : handleChange(e))}
          required
        >
          <option value={0} disabled>
            Selecciona una subcategoría
          </option>
          {selectOptions.subcategorias
            .filter((subcategoria) => subcategoria.categoria_id === (editProduct ? editProduct.categoria_id : newProduct.categoria_id))
            .map((subcategoria) => (
              <option key={subcategoria.id} value={subcategoria.id}>
                {subcategoria.nombre}
              </option>
            ))}
        </select>

        <button type="submit">{editProduct ? "Guardar Cambios" : "Agregar Producto"}</button>
      </form>
    </div>
  );
}
  
