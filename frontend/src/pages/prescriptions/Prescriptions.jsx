import { useQuery } from '@tanstack/react-query'
import { Pill } from 'lucide-react'
import api from '../../api/axios'

const getPrescriptions = () => api.get('/prescriptions')

export default function Prescriptions() {
  const { data, isLoading } = useQuery({ queryKey: ['prescriptions'], queryFn: getPrescriptions })
  const prescriptions = data?.data?.data || []

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
        <p className="text-gray-500 text-sm">{prescriptions.length} prescriptions</p></div>
      <div className="card p-0 overflow-hidden">
        {isLoading ? <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>
        : !prescriptions.length ? (
          <div className="text-center py-16 text-gray-400"><Pill size={40} className="mx-auto mb-3 opacity-40" /><p>No prescriptions recorded</p></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>{['Rx #', 'Doctor', 'Hospital', 'Date', 'Status'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {prescriptions.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{p.prescriptionNumber || '-'}</td>
                  <td className="px-4 py-3 font-medium">{p.doctorName || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{p.hospitalName || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{p.prescriptionDate || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={p.status === 'DISPENSED' ? 'badge-green' : p.status === 'PENDING' ? 'badge-yellow' : 'badge-gray'}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
