export interface CreateSaleDTO {
  customerId: string;
  userId: string;
  tenantId: string;
  notes?: string;
}

export interface AddSaleItemDTO {
  saleId: string;
  productId: string;
  quantity: number;
  discountPercentage?: number;
  discountFixed?: number;
  tenantId: string;
}

export interface ApplySaleDiscountDTO {
  saleId: string;
  discountPercentage?: number;
  discountFixed?: number;
  tenantId: string;
}

export interface ConfirmSaleDTO {
  saleId: string;
  tenantId: string;
}

export interface AddPaymentDTO {
  saleId: string;
  method: 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'BANK_SLIP' | 'CREDIT';
  amount: number;
  transactionId?: string;
  notes?: string;
  tenantId: string;
}

export interface SaleOutputDTO {
  id: string;
  customerId: string;
  customerName: string;
  status: string;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    total: number;
  }>;
  subtotal: number;
  discountAmount?: number;
  total: number;
  totalPaid: number;
  remainingAmount: number;
  createdAt: Date;
  updatedAt: Date;
}