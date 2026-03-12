import type { User } from "../../interfaces/user.interface";
import type { Quote, QuoteLine } from "../../store/quote/quote.store";
import type { Customer } from "./types";


type DisplayItem = {
  id: string;
  description: string;
  cost: string
  marginPct: string
  ean: string | null;
  codigo: string | null;
  um: string | null;
  quantity: string;     // decimal en string
  price: string | null; // decimal en string
  lineTotal?: string | null;
};

type DisplayArtifact = {
  id: string;
  type: "PDF" | "HTML" | string;
  fileKey: string;
  mimeType: string | null;
  checksum: string | null;
  createdAt: string;
  presignedUrl?: string;
};

type DisplayQuote = {
  id: string;
  quoteNumber: number | null;
  createdAt: string;
  fileKey: string,
  chatThreadId: string,
  summary: string,
  items?: DisplayItem[];
  customer: Customer
};

type DisplayVersion = {
  id: string;
  versionNumber: number;
  status: "DRAFT" | "FINAL";
  currency: string;
  taxRate: string;  // decimal string
  subtotal?: string;
  taxTotal?: string;
  grandTotal?: string;
  validUntil?: string | null;
  createdAt: string,
  updatedAt: string | null
  seller: User | null;
  items?: DisplayItem[];
  artifacts?: DisplayArtifact[];
};

export type DisplayResult = {
  source: "VERSION" | "QUOTE";
  resolution?: { reason?: string; usedVersionId?: string };
  quote: DisplayQuote;
  version: DisplayVersion | null;
  quoteMeta: {
    pdfSentAt: string | null
    quoteCreatedAt: string | null
    versionCreatedAt: string | null
    createdByUser: User
  },
  capabilities?: {
    hasVersion: boolean;
    hasPdf: boolean;
    canGeneratePdf: boolean;
    canSendWhatsApp: boolean;
  };
};




const toNumOrNull = (s: string | null | undefined) => (s == null ? null : Number(s));
const toNum = (s: string | null | undefined, fallback = 0) => (s == null ? fallback : Number(s));


export function displayToStoreQuote(display: DisplayResult): Quote {


  const { source, quote, version, capabilities } = display;



  // Decidir de dónde salen currency/taxRate/items
  // const currency =
  //   source === "VERSION" ? (version?.currency ?? "MXN") : "MXN";

  const taxRate =
    source === "VERSION" ? Number(version?.taxRate ?? 0.16) : 0.16;

  const baseItems: DisplayItem[] =
    source === "VERSION"
      ? (version?.items ?? [])
      : quote.items ?? []; // si en QUOTE quisieras caer a quote.items, aquí lo pones

  const items: QuoteLine[] = baseItems.map((it) => ({

    id: it.id, // importante para tus inputs/ediciones
    description: it.description,
    ean: it.ean ?? undefined,
    um: it.um ?? undefined,
    qty: toNum(it.quantity, 0),
    cost: toNum(it.cost, 0),                 // lo sigues llenando al elegir disponibilidad
    currency: 'MXN',  // tu tipo Currency
    price: toNumOrNull(it.price),
    margin: it.marginPct ? +it.marginPct : null,               // tu store lo calcula cuando cambias price/cost
    source: undefined,
  }));

  return {
    id: quote.id,
    quoteNumber: quote.quoteNumber?.toString(),
    status: (version?.status ?? "PENDING"), // PENDING para cuando no haya versión
    branch: undefined,
    currency: 'MXN',
    taxRate,

    customer: {
      id: quote.customer.id,
      name: quote.customer.name,
      lastname: quote.customer.lastname ?? undefined,
      phone: quote.customer.phone ?? undefined,
      email: quote.customer.email ?? undefined,
      location: quote.customer.location ?? undefined,
      company: quote.customer.company ?? undefined
    },
    items,
    createdAt: quote.createdAt,
    updatedAt: quote.createdAt,
    fileKey: quote.fileKey ?? undefined,
    summary: quote.summary ?? undefined,
    chatThreadId: quote.chatThreadId ?? undefined,
    // extras útiles (opcionales en tu store)
    seller: version?.seller,
    versionId: version?.id,
    versionNumber: version?.versionNumber,
    artifacts: version?.artifacts ?? [],
    capabilities: capabilities ?? undefined,
    source,
    version: "",
    statusVersion: version?.status ?? '',
    quoteMeta: {
      pdfSentAt: display.quoteMeta.pdfSentAt,
      quoteCreatedAt: display.quoteMeta.quoteCreatedAt,
      versionCreatedAt: display.quoteMeta.versionCreatedAt ,
      createdByUser: display.quoteMeta.createdByUser
    }
  };
}