import { useEffect } from "react";
import { useConcluideQuote } from "../../queries/quotes/use-concluide-quote";
import { useQuoteDisplay } from "../../queries/quotes/use-quote-display";
import { useSaveQuote } from "../../queries/quotes/use-save-quote";
import { useQuoteStore } from "../../store/quote/quote.store";


type useQuoteOptions = {
  quoteId?: string;
  prefer?: 'final' | 'draft';
  include?: Array<'items' | 'artifacts' | 'messages'>;
  presignSeconds?: number;
  enabled?: boolean;
  optimisticSave?: boolean;
}


export const useQuote = (opts: useQuoteOptions) => {

  const createQuote = useQuoteStore(state => state.createQuote)
  const setActive = useQuoteStore(state => state.setActive)

  const {
    quoteId,
    prefer = 'final',
    include = ['artifacts', 'items'],
    presignSeconds = 1600,
    enabled = !!quoteId,
    optimisticSave,
  } = opts
  const display = useQuoteDisplay({
    id: quoteId,
    prefer,
    include,
    enabled,
    presignSeconds
  })

  const quote = display.data



  useEffect(() => {

    if (opts.quoteId) setActive(opts.quoteId)

  }, [opts.quoteId, setActive])

  useEffect(() => {

    if (quote) {
      createQuote(quote)
    }

  }, [createQuote, quote])

  const finalize = useConcluideQuote()

  const save = useSaveQuote({ optimistic: !!optimisticSave })



  return {
    quote,
    display,
    finalize,
    save
  }
}