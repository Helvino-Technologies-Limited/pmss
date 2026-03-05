import { useAuth } from '../context/AuthContext'
import { X, Printer, MessageCircle } from 'lucide-react'
import { format } from 'date-fns'

export default function ReceiptModal({ sale, items = [], customerPhone = '', customerName = '', onClose }) {
  const { user } = useAuth()
  const pharmacyName = user?.tenantName || user?.businessName || user?.email?.split('@')[0] || 'Pharmacy'

  const total = Number(sale.totalAmount)
  const paid = Number(sale.amountPaid)
  const vat = Number(sale.vatAmount) || 0
  const discount = Number(sale.discountAmount) || 0
  const change = Number(sale.changeGiven) || Math.max(0, paid - total)
  const balance = Number(sale.balanceDue) || Math.max(0, total - paid)
  const date = sale.saleDate
    ? format(new Date(sale.saleDate), 'dd MMM yyyy, HH:mm')
    : format(new Date(), 'dd MMM yyyy, HH:mm')

  const itemRows = items.map(i => ({
    name: i.drugName || i.name || 'Item',
    qty: i.qty || i.quantity || 1,
    price: Number(i.sellingPrice || i.unitPrice || 0),
    instructions: i.instructions || '',
  }))

  const printReceipt = () => {
    const w = window.open('', '_blank', 'width=420,height=650')
    w.document.write(`
      <!DOCTYPE html><html><head><title>Receipt ${sale.invoiceNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Courier New', monospace; font-size: 13px; padding: 24px 20px; max-width: 360px; margin: auto; }
        h1 { text-align: center; font-size: 17px; font-weight: bold; letter-spacing: 1px; }
        .sub { text-align: center; font-size: 11px; color: #555; margin-top: 4px; }
        .dash { border: none; border-top: 1px dashed #999; margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 3px 0; vertical-align: top; }
        td.r { text-align: right; }
        .item-name { font-weight: bold; }
        .item-sub { font-size: 11px; color: #555; }
        .total-row td { font-weight: bold; font-size: 14px; padding-top: 6px; }
        .footer { text-align: center; font-size: 11px; color: #555; margin-top: 12px; }
        @media print { body { padding: 8px; } }
      </style></head><body>
      <h1>${pharmacyName.toUpperCase()}</h1>
      <p class="sub">Invoice: <strong>${sale.invoiceNumber}</strong></p>
      <p class="sub">${date}</p>
      ${customerName ? `<p class="sub">Patient: <strong>${customerName}</strong></p>` : ''}
      <hr class="dash">
      <table>
        ${itemRows.map(i => `
          <tr>
            <td><span class="item-name">${i.name}</span><br><span class="item-sub">${i.qty} × KES ${i.price.toLocaleString()}</span>${i.instructions ? `<br><span class="item-sub" style="font-style:italic;color:#7c3aed">📋 ${i.instructions}</span>` : ''}</td>
            <td class="r">KES ${(i.price * i.qty).toLocaleString()}</td>
          </tr>`).join('')}
      </table>
      <hr class="dash">
      <table>
        ${discount > 0 ? `<tr><td>Discount</td><td class="r" style="color:#16a34a">-KES ${discount.toLocaleString()}</td></tr>` : ''}
        ${vat > 0 ? `<tr><td>VAT</td><td class="r">KES ${vat.toLocaleString()}</td></tr>` : ''}
        <tr class="total-row"><td>TOTAL</td><td class="r">KES ${total.toLocaleString()}</td></tr>
        <tr><td>Paid (${(sale.paymentMethod || 'CASH').replace('_', ' ')})</td><td class="r">KES ${paid.toLocaleString()}</td></tr>
        ${change > 0 ? `<tr><td>Change</td><td class="r">KES ${change.toLocaleString()}</td></tr>` : ''}
        ${balance > 0 ? `<tr><td style="color:#dc2626">Balance Due</td><td class="r" style="color:#dc2626;font-weight:bold">KES ${balance.toLocaleString()}</td></tr>` : ''}
      </table>
      <hr class="dash">
      <p class="footer">Thank you for your purchase!<br>Keep receipt for returns &amp; exchanges.</p>
      </body></html>
    `)
    w.document.close()
    w.focus()
    setTimeout(() => { w.print(); w.close() }, 300)
  }

  const sendWhatsApp = () => {
    const lines = [
      `*${pharmacyName.toUpperCase()}*`,
      `Invoice: ${sale.invoiceNumber}`,
      `Date: ${date}`,
      ...(customerName ? [`Patient: ${customerName}`] : []),
      '',
      '*Items & Dosage Instructions:*',
      ...itemRows.flatMap(i => [
        `${i.name} ×${i.qty} — KES ${(i.price * i.qty).toLocaleString()}`,
        ...(i.instructions ? [`  _${i.instructions}_`] : []),
      ]),
      '',
      ...(discount > 0 ? [`Discount: -KES ${discount.toLocaleString()}`] : []),
      ...(vat > 0 ? [`VAT: KES ${vat.toLocaleString()}`] : []),
      `*Total: KES ${total.toLocaleString()}*`,
      `Paid (${(sale.paymentMethod || 'CASH').replace('_', ' ')}): KES ${paid.toLocaleString()}`,
      ...(change > 0 ? [`Change: KES ${change.toLocaleString()}`] : []),
      ...(balance > 0 ? [`Balance Due: KES ${balance.toLocaleString()}`] : []),
      '',
      'Thank you for choosing us!',
    ]
    const text = encodeURIComponent(lines.join('\n'))
    const phone = (customerPhone || '').replace(/[^0-9+]/g, '')
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank')
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col">

        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="font-bold text-gray-900">Receipt</h2>
            <p className="text-xs text-primary-600 font-mono mt-0.5">{sale.invoiceNumber}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4">
          <p className="text-center font-bold text-base text-gray-900 tracking-wide">{pharmacyName.toUpperCase()}</p>
          <p className="text-center text-xs text-gray-400 mt-1 font-mono">{date}</p>
          {customerName && <p className="text-center text-xs text-gray-600 mt-0.5 mb-4">Patient: <strong>{customerName}</strong></p>}
          {!customerName && <div className="mb-4" />}

          <div className="border-t border-dashed border-gray-300 mb-3" />

          <div className="space-y-2.5 font-mono">
            {itemRows.map((item, i) => (
              <div key={i} className="space-y-0.5">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.qty} × KES {item.price.toLocaleString()}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 whitespace-nowrap">
                    KES {(item.price * item.qty).toLocaleString()}
                  </p>
                </div>
                {item.instructions && (
                  <p className="text-xs text-violet-700 italic pl-1">📋 {item.instructions}</p>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-gray-300 my-3" />

          <div className="space-y-1.5 text-sm font-mono">
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span><span>-KES {discount.toLocaleString()}</span>
              </div>
            )}
            {vat > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>VAT</span><span>KES {vat.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base text-gray-900 pt-1">
              <span>TOTAL</span><span>KES {total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Paid ({(sale.paymentMethod || 'CASH').replace('_', ' ')})</span>
              <span>KES {paid.toLocaleString()}</span>
            </div>
            {change > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Change</span><span>KES {change.toLocaleString()}</span>
              </div>
            )}
            {balance > 0 && (
              <div className="flex justify-between text-red-600 font-bold">
                <span>Balance Due</span><span>KES {balance.toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="border-t border-dashed border-gray-300 my-3" />
          <p className="text-center text-xs text-gray-400 font-mono">Thank you for your purchase!</p>
        </div>

        <div className="p-5 border-t border-gray-100 flex gap-3 flex-shrink-0">
          <button
            onClick={sendWhatsApp}
            className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
          >
            <MessageCircle size={16} /> WhatsApp
          </button>
          <button
            onClick={printReceipt}
            className="flex-1 flex items-center justify-center gap-2 btn-secondary py-2.5 text-sm"
          >
            <Printer size={16} /> Print
          </button>
        </div>
      </div>
    </div>
  )
}
