/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Quote, QuoteLine } from "../../store/quote/quote.store";
import { dateFormat } from "../../utils/dateFormat";


export const quoteMapper = (quote: { [key: string]: any; }): Quote => ({
  id: quote.id,
  createdAt: quote.createdAt ? dateFormat(quote.createdAt) : 'Sin fecha',
  quoteNumber: quote.quoteNumber,
  customer: quote.customer,
  items: quote.items.map((i: { [key: string]: any; }) => quoteItemMapper(i)),
  summary: quote.summary,
  fileKey: quote.fileKey,
  chatThreadId: quote.chatThreadId,
  currency: quote['currency'] ?? "MXN",
  taxRate: 0.16,
  updatedAt: "",
  status: quote.status ?? 'Pendiente',
  version: "",
  statusVersion: ""
})


export const quoteItemMapper = (json:{ [key: string]: any; }):QuoteLine => ({
  id: json['id'],
  description: json['description'],
  ean: json['ean'],
  // codigo:json['codigo'],
  qty: json['quantity'],
  um: json['um'],
  price: json['price'] ?? 0,
  cost: json['cost'] ?? 0,
  currency:  json['currency'] ?? "MXN",
  margin: null
})