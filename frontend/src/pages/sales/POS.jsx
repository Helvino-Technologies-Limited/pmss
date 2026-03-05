import { useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { searchProducts } from '../../api/products'
import { createSale } from '../../api/sales'
import toast from 'react-hot-toast'
import { Search, Plus, Minus, Trash2, ShoppingCart, Printer, X } from 'lucide-react'

const PAYMENT_METHODS = ['CASH', 'CARD', 'MOBILE_MONEY', 'INSURANCE', 'CREDIT']

export default function POS() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [cart, setCart] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [amountPaid, setAmountPaid] = useState('')
  const [discount, setDiscount] = useState(0)
  const [lastSale, setLastSale] = useState(null)
  const [searching, setSearching] = useState(false)
  const searchTimeout = useRef(null)
  const qc = useQueryClient()

  const subtotal = cart.reduce((sum, i) => sum + (i.sellingPrice * i.qty), 0)
  const vatTotal = cart.reduce((sum, i) => sum + (i.sellingPrice * i.qty * (i.vatPercent || 0) / 100), 0)
  const total = subtotal + vatTotal - discount
  const change = Math.max(0, parseFloat(amountPaid || 0) - total)
  const balanceDue = Math.max(0, total - parseFloat(amountPaid || 0))

  const handleSearch = (val) => {
    setQuery(val)
    clearTimeout(searchTimeout.current)
    if (!val.trim()) { setResults([]); return }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await searchProducts(val)
        setResults(res.data.data || [])
      } finally { setSearching(false) }
    }, 300)
  }

  const addToCart = (product) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id)
      if (ex) {
        if (ex.qty >= product.quantity) { toast.error('Insufficient stock'); return prev }
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      }
      if (product.quantity < 1) { toast.error('Out of stock'); return prev }
      return [...prev, { ...product, qty: 1 }]
    })
    setQuery(''); setResults([])
  }

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => {
      if (i.id !== id) return i
      const newQty = i.qty + delta
      if (newQty <= 0) return null
      if (newQty > i.quantity) { toast.error('Insufficient stock'); return i }
      return { ...i, qty: newQty }
    }).filter(Boolean))
  }

  const saleMut = useMutation({
    mutationFn: createSale,
    onSuccess: (res) => {
      setLastSale(res.data.data)
      setCart([]); setAmountPaid(''); setDiscount(0)
      qc.invalidateQueries(['sales', 'dashboard'])
      toast.success(`Sale #${res.data.data.invoiceNumber} completed!`)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Sale failed')
  })

  const completeSale = () => {
    if (!cart.length) return toast.error('Cart is empty')
    saleMut.mutate({
      items: cart.map(i => ({
        productId: i.id,
        quantity: i.qty,
        unitPrice: i.sellingPrice,
        discountPercent: 0
      })),
      paymentMethod,
      amountPaid: parseFloat(amountPaid || total),
      discountAmount: discount
    })
  }

  return (
    <div className="h-full">
      <h1 className="text-2xl font-bold text-gray-900 mb-5">Point of Sale</h1>

      <div className="grid lg:grid-cols-3 gap-5 h-full">
        {/* Left: Search & Cart */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <div className="card relative">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="input pl-9" placeholder="Search drug name, generic name or scan barcode..."
                value={query} onChange={e => handleSearch(e.target.value)} autoFocus />
            </div>
            {results.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-30 mt-1 max-h-64 overflow-y-auto">
                {results.map(p => (
                  <button key={p.id} onClick={() => addToCart(p)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-primary-50 transition-colors text-left border-b last:border-0">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{p.drugName}</p>
                      <p className="text-xs text-gray-500">{p.genericName} · {p.strength}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary-600 text-sm">KES {Number(p.sellingPrice).toLocaleString()}</p>
                      <p className="text-xs text-gray-400">Qty: {p.quantity}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cart */}
          <div className="card p-0 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
              <ShoppingCart size={18} className="text-primary-500" />
              <h2 className="font-semibold text-gray-900">Cart ({cart.length} items)</h2>
            </div>
            {cart.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <ShoppingCart size={36} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Search and add products to the cart</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{item.drugName}</p>
                      <p className="text-xs text-gray-500">KES {Number(item.sellingPrice).toLocaleString()} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.id, -1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center font-bold text-sm">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                        <Plus size={12} />
                      </button>
                    </div>
                    <div className="w-24 text-right">
                      <p className="font-bold text-gray-900 text-sm">
                        KES {(item.sellingPrice * item.qty).toLocaleString()}
                      </p>
                    </div>
                    <button onClick={() => setCart(c => c.filter(i => i.id !== item.id))}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Payment */}
        <div className="space-y-4">
          <div className="card space-y-4">
            <h2 className="font-semibold text-gray-900">Payment</h2>

            {/* Totals */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>KES {subtotal.toLocaleString('en', { minimumFractionDigits: 2 })}</span>
              </div>
              {vatTotal > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>VAT</span>
                  <span>KES {vatTotal.toLocaleString('en', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-KES {discount.toLocaleString('en', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg text-gray-900 border-t pt-2">
                <span>TOTAL</span>
                <span>KES {total.toLocaleString('en', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Discount */}
            <div>
              <label className="label">Discount (KES)</label>
              <input className="input" type="number" min="0" placeholder="0"
                value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} />
            </div>

            {/* Payment Method */}
            <div>
              <label className="label">Payment Method</label>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map(m => (
                  <button key={m} onClick={() => setPaymentMethod(m)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                      paymentMethod === m
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400'
                    }`}>
                    {m.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Paid */}
            <div>
              <label className="label">Amount Paid (KES)</label>
              <input className="input text-lg font-bold" type="number" step="0.01"
                placeholder={total.toFixed(2)}
                value={amountPaid} onChange={e => setAmountPaid(e.target.value)} />
            </div>

            {amountPaid && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-gray-500 text-xs">Change</p>
                  <p className="font-bold text-green-700">KES {change.toFixed(2)}</p>
                </div>
                <div className={`rounded-lg p-3 text-center ${balanceDue > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                  <p className="text-gray-500 text-xs">Balance Due</p>
                  <p className={`font-bold ${balanceDue > 0 ? 'text-red-700' : 'text-gray-600'}`}>
                    KES {balanceDue.toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            <button onClick={completeSale} disabled={saleMut.isPending || !cart.length}
              className="btn-primary w-full py-3.5 text-base font-bold">
              {saleMut.isPending ? 'Processing...' : `Complete Sale — KES ${total.toLocaleString('en', {minimumFractionDigits:2})}`}
            </button>
          </div>

          {/* Receipt Preview */}
          {lastSale && (
            <div className="card bg-green-50 border-green-200 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-green-800">✅ Sale Complete</p>
                <button onClick={() => setLastSale(null)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
              </div>
              <p className="text-gray-600">Invoice: <span className="font-mono font-bold">{lastSale.invoiceNumber}</span></p>
              <p className="text-gray-600">Total: <span className="font-bold">KES {Number(lastSale.totalAmount).toLocaleString()}</span></p>
              <button className="btn-secondary w-full flex items-center justify-center gap-2 text-xs py-2">
                <Printer size={14} /> Print Receipt
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
