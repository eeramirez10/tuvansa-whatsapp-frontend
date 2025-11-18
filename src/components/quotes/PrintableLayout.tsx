import React from "react";
import { LayoutQuote } from "./LayoutQuote";
import { useQuoteStore } from "../../store/quote/quote.store";



interface PrintableLayoutProps {
  printRef: React.RefObject<HTMLDivElement | null>;
}

export const PrintableLayout: React.FC<PrintableLayoutProps> = ({ printRef }) => {

  const getActive = useQuoteStore(state => state.getActive)
  const subtotal = useQuoteStore(state => state.subtotal)
  const total = useQuoteStore(state => state.total)
  const tax = useQuoteStore(state => state.tax)


  const quote = getActive();

  return (

    <>

      {
        quote &&
        (
          <div className=" 
          absolute 
            -top-full
            -z-50
          ">

            <div ref={printRef} className="layout-cotizacion-imprimir" >
              <LayoutQuote
                quote={quote}
                subtotal={subtotal(quote.id)}
                total={total(quote.id)}
                tax={tax(quote.id)}
              />
            </div>

          </div>
        )
      }
    </>


  )
};
