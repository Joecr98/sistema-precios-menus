"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [mostrarContraseña, setMostrarContraseña] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contraseña }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        setSuccessMessage('Inicio de sesión exitoso');
        setErrorMessage('');
        setTimeout(() => {
          router.push('/menu'); // Redirigir al menú principal
        }, 1500);
      } else {
        setErrorMessage(data.message || 'Correo o contraseña incorrectos');
        setSuccessMessage('');
      }
    } catch (error) {
      setErrorMessage('Error en el servidor');
      setSuccessMessage('');
    }
  };

  return (
    <div className="container">
      <h1>Iniciar Sesión</h1>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Correo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          className="form-control mb-3"
          required
        />
        <div className="input-group mb-3">
          <input
            type={mostrarContraseña ? 'text' : 'password'}
            placeholder="Contraseña"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            className="form-control"
            required
          />
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => setMostrarContraseña(!mostrarContraseña)}
          >
            {mostrarContraseña ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>
        <button type="submit" className="btn btn-primary mb-3">Iniciar Sesión</button>
      </form>
      {errorMessage && <p className="text-danger">{errorMessage}</p>}
      {successMessage && <p className="text-success">{successMessage}</p>}
    </div>
  );
}
