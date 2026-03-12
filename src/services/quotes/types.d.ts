export interface Quote {
  id: string;
  createdAt: string;
  updatedAt: string
  quoteNumber: number;

  customer: Customer;
  items: QuoteItem[];
  fileKey?: string
  summary?: string
  chatThreadId?: string
  status: string

  id: string
  quoteNumber?: string
  branch?: string
  currency: Currency
  taxRate: number // ej. 0.16 para IVA 16%
  customer?: QuoteCustomer
  items: QuoteLine[]
  createdAt: string
  updatedAt: string


}

export interface QuoteItem {
  id: string;
  description: string;
  ean: string;
  codigo: string;
  qty: number;
  um: string;
  price: number;
  cost: number;
  quoteId: string;
}

export interface ChatThread {
  id: string
  clientPhoneNumber: string
  lastInteraction: string,
  messages: {
    id: string
    role: string
    content: string
    createdAt: string

  }

}

export interface Customer {
  id: string
  name: string
  lastname: string
  email: string
  phone: string
  location: string
  createdAt: string
  fullName: string
  company?:string

}

export interface Threads {
  id: string
  openAiThreadId: string,
  clientPhoneNumber: string,
  status: string,
  createdAt: string,
  lastInteraction: string | null,
  location: string | null,
  customerId: string | null
  messages: Message[]
  chatThreads: Threads[]
}

export interface Message {
  id: string
  role: string
  content: string
  createdAt: Date
  chatThread?: ChatThread

}

export interface PageResult<T> {
  items: T[]; total: number; page: number; pageSize: number
}