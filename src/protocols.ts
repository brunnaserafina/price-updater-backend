export interface NewPrice {
  product_code: string;
  new_price: string;
}

export interface ApplicationError {
  name: string;
  message: string;
}

export interface InterfaceProcessProduct {
  product_code: number;
  new_price: number;
  name: string;
  cost_price: number;
  sales_price: number;
  message_error?: string;
}

export interface InterfaceProductCsv {
  product_code?: number;
  new_price?: number;
}
