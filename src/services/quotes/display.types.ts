import type { Quote } from "../../store/quote/quote.store";

// types/display.ts
export type DisplaySource = 'VERSION' | 'QUOTE';

export type QuoteVersionArtifacts = {
  id: string;
  type: 'PDF' | 'HTML' | string;
  fileKey: string;
  mimeType: string | null;
  checksum: string | null;
  createdAt: string;
  presignedUrl?: string;
  expiresIn?: number;
}

export type QuoteVersionItems = {
  id: string;
  description: string;
  ean: string | null;
  codigo: string | null;
  um: string | null;
  quantity: string;
  price: string | null;
  lineTotal: string;
}

export type Capabilities = {
  hasVersion: boolean;
  hasPdf: boolean;
  canGeneratePdf: boolean;
  canSendWhatsApp: boolean;
}


export type QuoteVersion = {
  id: string;
  versionNumber: number;
  status: 'DRAFT' | 'FINAL';
  currency: string;
  taxRate: string;
  subtotal: string;
  taxTotal: string;
  grandTotal: string;
  validUntil: string | null;
  seller: { id: string; name: string } | null;
  items?: Array<QuoteVersionItems>;
  artifacts?: Array<QuoteVersionArtifacts>;

}

export type DisplayResult = {
  source: DisplaySource;
  resolution: { reason: 'FINAL_FOUND' | 'DRAFT_FALLBACK' | 'NO_VERSION'; usedVersionId: string | null };
  quote: Quote;
  version: QuoteVersion
  capabilities: Capabilities;
};

export type DisplayResponse = { ok: boolean; data: DisplayResult };