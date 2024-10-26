"use client";

import { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';

// Definimos los tipos de datos
type Area = {
  id_area: number;
  nombrearea: string;
};

type Rol = {
  id_rol: number;
  nombre_rol: string;
};

type Usuario = {
  id_usuario: number;
  nombre_usuario: string;
  correo: string;
  id_rol: number;
  id_area: number;
};

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre_usuario: '',
    correo: '',
    contraseña: '',
    id_rol: '',
    id_area: ''
  });
  const [mensaje, setMensaje] = useState('');
  const [mostrarPDF, setMostrarPDF] = useState(false); // Para mostrar u ocultar la vista previa del PDF
  const [pdfUrl, setPdfUrl] = useState<string | null>(null); // Almacenar la URL del PDF para la vista previa

  const usuariosRef = useRef(null);

  // Obtener usuarios, áreas y roles al cargar el componente
  useEffect(() => {
    obtenerUsuarios();
    obtenerAreas();
    obtenerRoles();
  }, []);

  const obtenerUsuarios = async () => {
    try {
      const res = await fetch('/api/usuarios');
      const data = await res.json();
      setUsuarios(data);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
  };

  const obtenerAreas = async () => {
    try {
      const res = await fetch('/api/areas');
      const data = await res.json();
      setAreas(data);
    } catch (error) {
      console.error('Error al obtener áreas:', error);
    }
  };

  const obtenerRoles = async () => {
    try {
      const res = await fetch('/api/roles');
      const data = await res.json();
      setRoles(data);
    } catch (error) {
      console.error('Error al obtener roles:', error);
    }
  };

  // Función para crear un nuevo usuario
  const crearUsuario = async () => {
    try {
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoUsuario),
      });

      if (res.ok) {
        setMensaje('Usuario creado exitosamente');
        setNuevoUsuario({ nombre_usuario: '', correo: '', contraseña: '', id_rol: '', id_area: '' });
        obtenerUsuarios(); // Recargar la lista de usuarios
      } else {
        setMensaje('Error al crear el usuario');
      }
    } catch (error) {
      console.error('Error al crear el usuario:', error);
      setMensaje('Error en el servidor');
    }
  };

  // Función para eliminar un usuario
  const eliminarUsuario = async (id_usuario: number) => {
    try {
      const res = await fetch(`/api/usuarios/${id_usuario}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMensaje('Usuario eliminado exitosamente');
        obtenerUsuarios(); // Recargar la lista de usuarios
      } else {
        setMensaje('Error al eliminar el usuario');
      }
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      setMensaje('Error en el servidor');
    }
  };

  // Función para generar el PDF y mostrar la vista previa
  const generarPDF = () => {
    const doc = new jsPDF();
    doc.text('Lista de Usuarios', 10, 10);

    usuarios.forEach((usuario, index) => {
      doc.text(`${index + 1}. ${usuario.nombre_usuario} - ${usuario.correo}`, 10, 20 + index * 10);
    });

    const pdfBlob = doc.output('blob'); // Generar el PDF como Blob
    const pdfUrl = URL.createObjectURL(pdfBlob); // Crear una URL para mostrar la vista previa
    setPdfUrl(pdfUrl);
    setMostrarPDF(true); // Mostrar el iframe con la vista previa
  };

  return (
    <div className="container">
      <h1>Gestión de Usuarios</h1>

      <input
        type="text"
        placeholder="Nombre de usuario"
        value={nuevoUsuario.nombre_usuario}
        onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombre_usuario: e.target.value })}
        className="form-control mb-3"
      />

      <input
        type="email"
        placeholder="Correo"
        value={nuevoUsuario.correo}
        onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, correo: e.target.value })}
        className="form-control mb-3"
      />

      <input
        type="password"
        placeholder="Contraseña"
        value={nuevoUsuario.contraseña}
        onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, contraseña: e.target.value })}
        className="form-control mb-3"
      />

      <select
        value={nuevoUsuario.id_area}
        onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, id_area: e.target.value })}
        className="form-control mb-3"
      >
        <option value="">Seleccionar Área</option>
        {areas.map((area) => (
          <option key={area.id_area} value={area.id_area}>
            {area.nombrearea}
          </option>
        ))}
      </select>

      <select
        value={nuevoUsuario.id_rol}
        onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, id_rol: e.target.value })}
        className="form-control mb-3"
      >
        <option value="">Seleccionar Rol</option>
        {roles.map((rol) => (
          <option key={rol.id_rol} value={rol.id_rol}>
            {rol.nombre_rol}
          </option>
        ))}
      </select>

      <button className="btn btn-primary mb-3" onClick={crearUsuario}>
        Crear Usuario
      </button>

      {mensaje && <p className="text-success">{mensaje}</p>}

      <h2>Lista de Usuarios</h2>
      <ul className="list-group" ref={usuariosRef}>
        {usuarios.map((usuario, index) => (
          <li key={usuario.id_usuario} className="list-group-item d-flex justify-content-between">
            <span>
              {index + 1}. {usuario.nombre_usuario} - {usuario.correo}
            </span>
            <button className="btn btn-danger" onClick={() => eliminarUsuario(usuario.id_usuario)}>
              Eliminar
            </button>
          </li>
        ))}
      </ul>

      <button className="btn btn-secondary mt-3" onClick={generarPDF}>
        Imprimir PDF
      </button>

      {pdfUrl && (
        <>
          <button
            className="btn btn-info mt-3"
            onClick={() => setMostrarPDF(!mostrarPDF)}
          >
            {mostrarPDF ? 'Ocultar vista previa' : 'Mostrar vista previa'}
          </button>
          {mostrarPDF && (
            <iframe src={pdfUrl} style={{ width: '100%', height: '500px', marginTop: '20px' }}></iframe>
          )}
        </>
      )}
        <button className="btn btn-secondary mt-4" onClick={() => window.history.back()}>
        Regresar al Menú
      </button>
    </div>
  );
}
