import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createProduct } from '../../api/products'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'

export default function AddProduct() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const qc = useQueryClient()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      qc.invalidateQueries(['products'])
      toast.success('Product added to inventory!')
      navigate('/dashboard/products')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to add product')
  })

  const onSubmit = (data) => {
    const payload = {
      ...data,
      costPrice: parseFloat(data.costPrice),
      sellingPrice: parseFloat(data.sellingPrice),
      vatPercent: parseFloat(data.vatPercent || 0),
      quantity: parseInt(data.quantity || 0),
      reorderLevel: parseInt(data.reorderLevel || 10),
    }
    mutation.mutate(payload)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-500 text-sm">Fill in the drug details below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 border-b pb-3">Drug Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="label">Drug Name *</label>
              <input className="input" placeholder="e.g. Amoxicillin 500mg"
                {...register('drugName', { required: 'Drug name is required' })} />
              {errors.drugName && <p className="text-red-500 text-xs mt-1">{errors.drugName.message}</p>}
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="label">Generic Name</label>
              <input className="input" placeholder="Generic name" {...register('genericName')} />
            </div>
            <div>
              <label className="label">Brand Name</label>
              <input className="input" placeholder="Brand" {...register('brandName')} />
            </div>
            <div>
              <label className="label">Barcode</label>
              <input className="input" placeholder="Scan or enter barcode" {...register('barcode')} />
            </div>
            <div>
              <label className="label">Product Type</label>
              <select className="input" {...register('productType')}>
                <option value="OTC">OTC (Over the Counter)</option>
                <option value="PRESCRIPTION">Prescription</option>
                <option value="CONTROLLED">Controlled Drug</option>
              </select>
            </div>
            <div>
              <label className="label">Dosage Form</label>
              <select className="input" {...register('dosageForm')}>
                <option value="">Select...</option>
                <option>Tablet</option><option>Capsule</option><option>Syrup</option>
                <option>Injection</option><option>Cream</option><option>Drops</option>
                <option>Suppository</option><option>Inhaler</option><option>Patch</option>
              </select>
            </div>
            <div>
              <label className="label">Strength</label>
              <input className="input" placeholder="e.g. 500mg, 250ml" {...register('strength')} />
            </div>
            <div>
              <label className="label">Unit of Measure</label>
              <select className="input" {...register('unitOfMeasure')}>
                <option>Piece</option><option>Box</option><option>Bottle</option>
                <option>Strip</option><option>Tube</option><option>Vial</option><option>Sachet</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stock & Batch */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 border-b pb-3">Stock & Batch Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Batch Number</label>
              <input className="input" placeholder="Batch #" {...register('batchNumber')} />
            </div>
            <div>
              <label className="label">Expiry Date</label>
              <input className="input" type="date" {...register('expiryDate')} />
            </div>
            <div>
              <label className="label">Manufacture Date</label>
              <input className="input" type="date" {...register('manufactureDate')} />
            </div>
            <div>
              <label className="label">Storage Location</label>
              <input className="input" placeholder="e.g. Shelf A3" {...register('storageLocation')} />
            </div>
            <div>
              <label className="label">Opening Quantity *</label>
              <input className="input" type="number" min="0" placeholder="0"
                {...register('quantity', { required: 'Required', min: 0 })} />
            </div>
            <div>
              <label className="label">Reorder Level</label>
              <input className="input" type="number" min="0" placeholder="10" {...register('reorderLevel')} />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 border-b pb-3">Pricing</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Cost Price (KES) *</label>
              <input className="input" type="number" step="0.01" min="0" placeholder="0.00"
                {...register('costPrice', { required: 'Required' })} />
            </div>
            <div>
              <label className="label">Selling Price (KES) *</label>
              <input className="input" type="number" step="0.01" min="0" placeholder="0.00"
                {...register('sellingPrice', { required: 'Required' })} />
            </div>
            <div>
              <label className="label">VAT %</label>
              <input className="input" type="number" step="0.01" min="0" placeholder="0" {...register('vatPercent')} />
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={mutation.isPending} className="btn-primary px-8">
            {mutation.isPending ? 'Saving...' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  )
}
