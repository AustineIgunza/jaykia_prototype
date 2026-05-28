export type PayStackInitializor = {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
};

export type Customer = {
  status: boolean;
  message: string;
  data: {
    email: string;
    integration: number;
    domain: string;
    customer_code: string;
    id: string;
    identified: boolean;
    identifications: null;
    createdAt: string;
    updatedAt: string;
  };
};

export type Invoice = {
  status: boolean;
  message: string;
  data: {
    id: string;
    integration: number;
    domain: string;
    amount: number;
    currency: string;
    due_date: string;
    has_invoice: false;
    invoice_number: string;
    description: string;
    line_items: string[];
    tax: string[] | number[] | any[];
    request_code: string;
    status: string;
    paid: boolean;
    metadata: string;
    notifications: string[] | any[];
    offline_reference: string;
    customer: number;
    created_at: string;
    discount: any;
    split_code: any;
  };
};

export interface PayStackService {
  initializeTransaction: (
    email: string,
    amount: number,
  ) => Promise<PayStackInitializor>;
  initializeInvoice: (
    customerEmail: string,
    amount: number,
  ) => Promise<Invoice>;
  webHookHandler: (reference: string, event: string) => Promise<any>;
}
