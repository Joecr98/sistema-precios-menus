"use client";

import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';

interface Cliente {
  id: number;
  nombre: string;
}

interface DiaSemana {
  value: string;
  label: string;
}

const DIAS_SEMANA: DiaSemana[] = [
  { value: 'Lunes', label: 'Lunes' },
  { value: 'Martes', label: 'Martes' },
  { value: 'Miércoles', label: 'Miércoles' },
  { value: 'Jueves', label: 'Jueves' },
  { value: 'Viernes', label: 'Viernes' },
  { value: 'Sábado', label: 'Sábado' },
  { value: 'Domingo', label: 'Domingo' }
];

interface DetailItem {
  producto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface Detail {
  day: string;
  menuName: string;
  detalles: DetailItem[];
  subtotal: number;
}

interface BillingSummary {
  facturaId: number;
  cliente: {
    id: number;
    nombre: string;
  };
  fechaGeneracion: string;
  details: Detail[];
  total: number;
}

const formatCurrency = (value: number): string => {
  return value.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const BillingComponent = () => {
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [billingSummary, setBillingSummary] = useState<BillingSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Cliente[]>([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch('/api/clientes');
        const data = await response.json();
        setClients(data);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };
    fetchClients();
  }, []);

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day);
      } else {
        return [...prev, day];
      }
    });
  };

  const generateBill = async () => {
    if (!selectedClient || selectedDays.length === 0) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/facturas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: selectedClient,
          dias: selectedDays,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al generar la factura');
      }
      
      const data = await response.json();
      setBillingSummary(data);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Error al generar la factura');
    } finally {
      setLoading(false);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Facturación por Días</h1>
        <p className="text-gray-600">Genere facturas seleccionando los días específicos de los menús</p>
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
              onChange={(e) => setSelectedClient(e.target.value)}
            >
              <option value="">Seleccione un cliente...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.nombre}
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
                key={dia.value}
                className={`flex items-center p-3 rounded-md border cursor-pointer transition-colors
                  ${selectedDays.includes(dia.value)
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'hover:bg-gray-50'
                  }`}
              >
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={selectedDays.includes(dia.value)}
                  onChange={() => handleDayToggle(dia.value)}
                />
                {dia.label}
              </label>
            ))}
          </div>
        </div>

        {/* Acciones */}
        <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
          <button
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            disabled={!selectedClient || selectedDays.length === 0 || loading}
            onClick={generateBill}
          >
            {loading ? 'Generando...' : 'Generar Factura'}
          </button>
        </div>
      </div>

      {/* Resumen de Facturación */}
      {billingSummary && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Resumen de Facturación</h2>
            <div className="text-gray-600">
              <p>Cliente: {billingSummary.cliente.nombre}</p>
              <p>Fecha: {new Date(billingSummary.fechaGeneracion).toLocaleDateString()}</p>
              <p>Factura #: {billingSummary.facturaId}</p>
            </div>
          </div>

          <div className="space-y-6">
            {billingSummary.details.map((detail, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">{detail.day} - {detail.menuName}</h3>
                  <span className="text-blue-600 font-semibold">
                    Total del menú: ${formatCurrency(Number(detail.subtotal))}
                  </span>
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
                    {detail.detalles.map((item, itemIndex) => (
                      <tr key={itemIndex} className="border-t">
                        <td className="px-4 py-2">{item.producto}</td>
                        <td className="px-4 py-2 text-right">{item.cantidad}</td>
                        <td className="px-4 py-2 text-right">
                          ${formatCurrency(Number(item.precioUnitario))}
                        </td>
                        <td className="px-4 py-2 text-right">
                          ${formatCurrency(Number(item.subtotal))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

            <div className="mt-6 border-t pt-4">
              <div className="text-right text-2xl font-bold">
                Total Final: ${formatCurrency(Number(billingSummary.total))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <button
              className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
              onClick={() => setBillingSummary(null)}
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

export default FacturacionMenu;