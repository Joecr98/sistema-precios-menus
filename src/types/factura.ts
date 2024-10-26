export interface DetalleFactura {
    day: string;
    menuName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }
  
  export interface FacturaSummary {
    facturaId: number;
    details: DetalleFactura[];
    total: number;
  }
  
  export interface GenerateFacturaRequest {
    clientId: string;
    startDate: string;
    endDate: string;
  }