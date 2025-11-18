import type { FC } from "react";
import type { Quote } from "../../store/quote/quote.store";
import { dateFormat } from '../../utils/dateFormat';



interface Props {
  quote: Quote,
  subtotal: number
  tax: number
  total: number
}


export const LayoutQuote: FC<Props> = ({ quote, subtotal, total, tax }) => {


  const customer = quote.customer


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  return (
    <div className="w-screen mx-auto p-6 bg-white font-sans text-sm">
      {/* Header */}




      <div className="border-2 border-black mb-4">


        <div className="bg-gray-100 p-4 border-b border-black flex justify-between ">
          <img src="/img/logo-tuvansa.png" className="h-20 w-55" alt="" />

          <div className="">
            <p>Cda. San Buenaventura #12,</p>
            <p>Industrial San Buenaventura, </p>
            <p>54135 Tlalnepantla, Méx.</p>
            <p>Teléfono: (55) 50 39 07 30</p>
            <p className="text-blue-600">www.tuvansa.com.mx</p>
          </div>
          <div>
            <p>Fecha Cotización: </p>
            <p>{dateFormat(quote.createdAt)}</p>
            <p className="font-bold text-lg">COTIZACIÓN</p>
            <p className="font-bold">#{quote.quoteNumber}</p>

            {/* <p>Fecha: {dateFormat(quote.createdAt)}</p> */}
          </div>

        </div>

        {/* <div className="p-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>Direccion</strong></p>
              <p>R.F.C. TVN820506NT0</p>
              <p>CD. INDUSTRIAL BRUNO PAGLIAI VERACRUZ, VER.</p>
            </div>
            <div>
              <p>Fecha Cotización: {dateFormat(quote.createdAt)}</p>
              <p>Cliente: {quote.customer?.name} {quote.customer?.lastname}</p>
              <p>Tipo de Cambio: 18.72000000</p>
              <p>AGENTE: XXXXXXXX</p>
              <p>Vigencia de Cotización:{vigencia}</p>
            </div>
          </div>
        </div> */}
      </div>

      {/* Cliente Info */}
      <div className="border border-black mb-4 p-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>{quote.customer?.name} {quote.customer?.lastname}</strong></p>
            <p>{customer?.location}</p>
            {/* <p>DELEG. VERACRUZ, VERACRUZ, VERACRUZ</p> */}
            <p>TELS. {customer?.phone}</p>
            {/* <p>R.F.C: GAT960911GI5</p> */}
            <p>E-MAIL:{customer?.email} </p>
            {/* <p>CONTACTO: j.cesar.contreras@ho</p> */}
          </div>
          <div>
            <p><strong>PLAZO: 0 DIAS</strong></p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="border border-black mb-4 text-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 border-b border-black">
              <th className="border-r border-black p-2 text-left w-8">#</th>
              <th className="border-r border-black p-2 text-left w-16">CANT</th>
              <th className="border-r border-black p-2 text-left w-12">UM</th>
              <th className="border-r border-black p-2 text-left">DESCRIPCIÓN</th>
              <th className="border-r border-black p-2 text-right w-24">PRECIO UNI</th>
              {/* <th className="border-r border-black p-2 text-center w-16">DESCTO</th> */}
              <th className="p-2 text-right w-28">IMPORTE TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {quote.items.map((item, index) => {

              const total = (item.qty * (item.price ?? 0))

              return (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border-r border-gray-300 p-2 text-center">{index + 1}</td>
                  <td className="border-r border-gray-300 p-2 text-right">{formatNumber(item.qty)}</td>
                  <td className="border-r border-gray-300 p-2 text-center">{item.um}</td>
                  <td className="border-r border-gray-300 p-2">{item.description}</td>
                  <td className="border-r border-gray-300 p-2 text-right">{formatNumber(item.price ?? 0)}</td>
                  {/* <td className="border-r border-gray-300 p-2 text-center">{item}</td> */}
                  <td className="p-2 text-right">{formatNumber(total)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      {/* <div className="mb-4">
        <p><strong>Entregar en:</strong></p>
        <p>L.A.B. VERACRUZ CONTADO T.E. ES DE 3 DIAS HABILES MAT. SUJETO A VENTA</p>
      </div> */}

      {/* Totals */}
      <div className="border border-black">
        <div className="bg-gray-100 p-3">
          <div className="flex justify-end">
            <div className="w-80">
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div className="text-right font-bold">SUB-TOTAL</div>
                <div className="text-right">{formatCurrency(subtotal)}</div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div className="text-right font-bold">IVA 16%</div>
                <div className="text-right">{formatCurrency(tax)}</div>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t-2 border-black pt-2">
                <div className="text-right font-bold text-lg">TOTAL</div>
                <div className="text-right font-bold text-lg">{formatCurrency(total)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Signature */}
      <div className="mt-6 text-center">
        <p className="mb-4"><strong>ATENTAMENTE</strong></p>
        <div className="border-t border-black w-64 mx-auto mb-2"></div>
        <p><strong>TF-VT-01</strong></p>
        <p><strong>Nombre Agente</strong></p>
        <p className="mt-4 text-xs"><strong>PRECIOS SUJETOS A CAMBIO SIN PREVIO AVISO</strong></p>
      </div>
    </div>
  );
};
