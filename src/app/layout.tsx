import './globals.css'; // Importa los estilos globales aquí
import { ReactNode } from 'react';

export const metadata = {
  title: 'Sistema Precios y Menús',
  description: 'Sistema para gestionar precios y menús',
};

// Define el tipo de las props que espera el layout (children)
interface LayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="es">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        {/* Este es el contenedor principal que envolverá todas las páginas */}
        {children}
      </body>
    </html>
  );
}
