

export interface CreateStockDTO {
    productId: string,
    locationName: string,
    locationCode: string,
    locationType: "WAREHOUSE" | "STORE" | "OTHER",
    initialQuantity: number,
    minimumQuantity: number,
    maximumQuantity?: number,
    tenantId: string
}

export interface AddStockDTO {
    stockId: string;
    productId: string;
    quantity: number;
    userId: string;
    tenantId: string;
}

export interface RemoveStockDTO {
    stockId: string;
    productId: string;
    quantity: number;
    reason: string;
    userId: string;
    tenantId: string;
}

export interface StockOutputDTO {
    id: string;
    productId: string;
    locationName: string;
    locationCode: string;
    quantity: number;
    availableQuantity: number;
    reservedQuantity: number;
    minimumQuantity: number;
    maximumQuantity?: number;
    isLowLevel: boolean;
}