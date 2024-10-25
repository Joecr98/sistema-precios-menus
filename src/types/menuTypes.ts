// Tipos para la gestión de menús y sus asignaciones

export type Menu = {
  id: number;
  nombre: string;
  fecha_creacion: string;
  detallesMenu: DetalleMenu[];
};

export type DetalleMenu = {
  id: number;
  menu_id: number;
  producto: Producto;
  cantidad: number;
  es_extra: boolean;
};

export type Producto = {
  id: number;
  descripcion: string;
  precios: Precio[];
};

export type Precio = {
  precio_unidad: number;
  precio_costo: number;
};

export type AsignacionMenu = {
  id?: number;
  cliente_id: number;
  menu_id: number;
  dia_semana: DiaSemana;
  menu?: Menu;
};

export type DiaSemana = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';

export const diasSemana: DiaSemana[] = [
  'Lunes', 
  'Martes', 
  'Miércoles', 
  'Jueves', 
  'Viernes', 
  'Sábado', 
  'Domingo'
];