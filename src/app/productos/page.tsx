"use client";

import { useEffect, useState } from 'react';

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
    descripcion: '',
    presentacion_id: 0,
    categoria_id: 0,
    subcategoria_id: 0,
  });

  useEffect(() => {
    fetchProducts();
    fetchSelectOptions();
  }, []);

  const fetchProducts = async () => {
    const response = await fetch('/api/products');
    const data = await response.json();
    setProducts(data);
  };

  const fetchSelectOptions = async () => {
    const response = await fetch('/api/selectOptions');
    const data = await response.json();
    setSelectOptions(data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: name.includes('id') ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newProduct),
    });
    if (response.ok) {
      fetchProducts();
      setNewProduct({ descripcion: '', presentacion_id: 0, categoria_id: 0, subcategoria_id: 0 });
    } else {
      console.error('Error al crear el producto');
    }
  };

  const getPresentacionNombre = (id: number) => {
    const presentacion = selectOptions.presentaciones.find((p) => p.id === id);
    return presentacion ? presentacion.nombre : 'Sin presentación';
  };

  const getCategoriaNombre = (id: number) => {
    const categoria = selectOptions.categorias.find((c) => c.id === id);
    return categoria ? categoria.nombre : 'Sin categoría';
  };

  const getSubcategoriaNombre = (id: number) => {
    const subcategoria = selectOptions.subcategorias.find((s) => s.id === id);
    return subcategoria ? subcategoria.nombre : 'Sin subcategoría';
  };

  return (
    <div>
      <h1>Lista de Productos</h1>
      <div style={{ display: 'table', width: '100%' }}>
        <div style={{ display: 'table-header-group' }}>
          <div style={{ display: 'table-row' }}>
            <div style={{ display: 'table-cell', fontWeight: 'bold', padding: '10px' }}>Descripción</div>
            <div style={{ display: 'table-cell', fontWeight: 'bold', padding: '10px' }}>Presentación</div>
            <div style={{ display: 'table-cell', fontWeight: 'bold', padding: '10px' }}>Categoría</div>
            <div style={{ display: 'table-cell', fontWeight: 'bold', padding: '10px' }}>Subcategoría</div>
          </div>
        </div>
        <div style={{ display: 'table-row-group' }}>
          {products.map((product) => (
            <div key={product.id} style={{ display: 'table-row' }}>
              <div style={{ display: 'table-cell' }}>{product.descripcion}</div>
              <div style={{ display: 'table-cell' }}>{getPresentacionNombre(product.presentacion_id)}</div>
              <div style={{ display: 'table-cell' }}>{getCategoriaNombre(product.categoria_id)}</div>
              <div style={{ display: 'table-cell' }}>{getSubcategoriaNombre(product.subcategoria_id)}</div>
            </div>
          ))}
        </div>
      </div>

      <h2 style={{ marginTop: '10px'}}>Agregar Nuevo Producto</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="descripcion"
          value={newProduct.descripcion}
          onChange={handleChange}
          placeholder="Descripción"
          required
        />
        <select name="presentacion_id" value={newProduct.presentacion_id} onChange={handleChange} required>
          <option value={0} disabled>
            Selecciona una presentación
          </option>
          {Array.isArray(selectOptions.presentaciones) && selectOptions.presentaciones.length > 0 ? (
            selectOptions.presentaciones.map((presentacion) => (
              <option key={presentacion.id} value={presentacion.id}>
                {presentacion.nombre}
              </option>
            ))
          ) : (
            <option value={0} disabled>
              No hay presentaciones disponibles
            </option>
          )}
        </select>
        <select name="categoria_id" value={newProduct.categoria_id} onChange={handleChange} required>
          <option value={0} disabled>
            Selecciona una categoría
          </option>
          {Array.isArray(selectOptions.categorias) && selectOptions.categorias.length > 0 ? (
            selectOptions.categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))
          ) : (
            <option value={0} disabled>
              No hay categorías disponibles
            </option>
          )}
        </select>
        <select name="subcategoria_id" value={newProduct.subcategoria_id} onChange={handleChange} required>
          <option value={0} disabled>
            Selecciona una subcategoría
          </option>
          {Array.isArray(selectOptions.subcategorias) && selectOptions.subcategorias.length > 0 ? (
            selectOptions.subcategorias.map((subcategoria) => (
              <option key={subcategoria.id} value={subcategoria.id}>
                {subcategoria.nombre}
              </option>
            ))
          ) : (
            <option value={0} disabled>
              No hay subcategorías disponibles
            </option>
          )}
        </select>
        <button type="submit">Agregar Producto</button>
      </form>
    </div>
  );
}
