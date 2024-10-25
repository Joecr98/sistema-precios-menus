"use client";

import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";

interface Cliente {
  id: number;
  nombre: string;
}

interface DiaSemana {
  valor: string;
  etiqueta: string;
}

const DIAS_SEMANA: DiaSemana[] = [
  { valor: "Lunes", etiqueta: "Lunes" },
  { valor: "Martes", etiqueta: "Martes" },
  { valor: "Miércoles", etiqueta: "Miércoles" },
  { valor: "Jueves", etiqueta: "Jueves" },
  { valor: "Viernes", etiqueta: "Viernes" },
  { valor: "Sábado", etiqueta: "Sábado" },
  { valor: "Domingo", etiqueta: "Domingo" },
];

interface DetalleProducto {
  producto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface Detalle {
  dia: string;
  nombreMenu: string;
  detalles: DetalleProducto[];
  subtotal: number;
}

interface ResumenFactura {
  facturaId: number;
  cliente: {
    id: number;
    nombre: string;
  };
  fechaGeneracion: string;
  detalles: Detalle[];
  total: number;
}

const formatearMoneda = (valor: number): string => {
  return valor.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const ComponenteFacturacion = () => {
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string | null>(null);
  const [diasSeleccionados, setDiasSeleccionados] = useState<string[]>([]);
  const [resumenFactura, setResumenFactura] = useState<ResumenFactura | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  useEffect(() => {
    const obtenerClientes = async () => {
      try {
        const respuesta = await fetch("/api/clientes");
        const datos = await respuesta.json();
        setClientes(datos);
      } catch (error) {
        console.error("Error al obtener clientes:", error);
      }
    };
    obtenerClientes();
  }, []);

  const manejarSeleccionDia = (dia: string) => {
    setDiasSeleccionados((prev) => {
      if (prev.includes(dia)) {
        return prev.filter((d) => d !== dia);
      } else {
        return [...prev, dia];
      }
    });
  };

  const generarFactura = async () => {
    if (!clienteSeleccionado || diasSeleccionados.length === 0) return;

    setCargando(true);
    setError(null);

    try {
      const respuesta = await fetch("/api/facturas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: clienteSeleccionado,
          dias: diasSeleccionados,
        }),
      });

      if (!respuesta.ok) {
        const datosError = await respuesta.json();
        throw new Error(datosError.message || "Error al generar la factura");
      }

      const datos = await respuesta.json();
      setResumenFactura(datos);
    } catch (error) {
      console.error("Error:", error);
      setError(
        error instanceof Error ? error.message : "Error al generar la factura"
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Facturación por Días
        </h1>
        <p className="text-gray-600">
          Genere facturas seleccionando los días específicos de los menús
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Selector de Cliente */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Seleccionar Cliente</h2>
          </div>
          <div>
            <select
              className="w-full p-2 border rounded-md"
              onChange={(e) => setClienteSeleccionado(e.target.value)}
            >
              <option value="">Seleccione un cliente...</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selector de Días */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Días de la Semana
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DIAS_SEMANA.map((dia) => (
              <label
                key={dia.valor}
                className={`flex items-center p-3 rounded-md border cursor-pointer transition-colors
                  ${
                    diasSeleccionados.includes(dia.valor)
                      ? "bg-blue-50 border-blue-500 text-blue-700"
                      : "hover:bg-gray-50"
                  }`}
              >
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={diasSeleccionados.includes(dia.valor)}
                  onChange={() => manejarSeleccionDia(dia.valor)}
                />
                {dia.etiqueta}
              </label>
            ))}
          </div>
        </div>

        {/* Acciones */}
        <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
          <button
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            disabled={!clienteSeleccionado || diasSeleccionados.length === 0 || cargando}
            onClick={generarFactura}
          >
            {cargando ? "Generando..." : "Generar Factura"}
          </button>
        </div>
      </div>

      {/* Resumen de Facturación */}
      {resumenFactura && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Resumen de Facturación</h2>
            <div className="text-gray-600">
              <p>Cliente: {resumenFactura.cliente.nombre}</p>
              <p>
                Fecha:{" "}
                {new Date(resumenFactura.fechaGeneracion).toLocaleDateString()}
              </p>
              <p>Factura #: {resumenFactura.facturaId}</p>
            </div>
          </div>

          <div className="space-y-6">
            {resumenFactura.detalles.map((detalle, indice) => (
              <div key={indice} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    {detalle.dia} - {detalle.nombreMenu}
                  </h3>
                  <div className="text-right">
                    <div className="text-gray-600">
                      Base: Q{formatearMoneda(Number(detalle.subtotal))}
                    </div>
                    {detalle.subtotalExtras > 0 && (
                      <div className="text-orange-600">
                        Extras: Q{formatearMoneda(Number(detalle.subtotalExtras))}
                      </div>
                    )}
                    <div className="text-blue-600 font-semibold">
                      Total: Q{formatearMoneda(Number(detalle.total))}
                    </div>
                  </div>
                </div>

                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Producto</th>
                      <th className="px-4 py-2 text-right">Cantidad</th>
                      <th className="px-4 py-2 text-right">Precio Unit.</th>
                      <th className="px-4 py-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Productos Base */}
                    {detalle.detalles
                      .filter((item) => !item.esExtra)
                      .map((item, itemIndice) => (
                        <tr key={`base-${itemIndice}`} className="border-t">
                          <td className="px-4 py-2">{item.producto}</td>
                          <td className="px-4 py-2 text-right">
                            {item.cantidad}
                          </td>
                          <td className="px-4 py-2 text-right">
                            Q{formatearMoneda(Number(item.precioUnitario))}
                          </td>
                          <td className="px-4 py-2 text-right">
                            Q{formatearMoneda(Number(item.subtotal))}
                          </td>
                        </tr>
                      ))}

                    {/* Productos Extra */}
                    {detalle.detalles.some((item) => item.esExtra) && (
                      <>
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-2 bg-orange-50 text-orange-700 font-semibold"
                          >
                            Productos Extra
                          </td>
                        </tr>
                        {detalle.detalles
                          .filter((item) => item.esExtra)
                          .map((item, itemIndice) => (
                            <tr
                              key={`extra-${itemIndice}`}
                              className="border-t bg-orange-50"
                            >
                              <td className="px-4 py-2">{item.producto}</td>
                              <td className="px-4 py-2 text-right">
                                {item.cantidad}
                              </td>
                              <td className="px-4 py-2 text-right">
                                Q{formatearMoneda(Number(item.precioUnitario))}
                              </td>
                              <td className="px-4 py-2 text-right">
                                Q{formatearMoneda(Number(item.subtotal))}
                              </td>
                            </tr>
                          ))}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            ))}

            <div className="mt-6 border-t pt-4">
              <div className="text-right text-2xl font-bold">
                Total Final: Q{formatearMoneda(Number(resumenFactura.total))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <button
              className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
              onClick={() => setResumenFactura(null)}
            >
              Nueva Factura
            </button>
            <button
              className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              onClick={() => window.print()}
            >
              Imprimir Factura
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComponenteFacturacion;