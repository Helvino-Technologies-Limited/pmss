import { Link } from 'react-router-dom'
import { Pill, Shield, BarChart2, Users, Clock, CheckCircle, Star, Phone, Mail } from 'lucide-react'

const features = [
  { icon: Pill, title: 'Inventory Control', desc: 'Track stock, batches, expiry dates and get automated reorder alerts.' },
  { icon: BarChart2, title: 'POS & Sales', desc: 'Fast point-of-sale with barcode scanning, multiple payment methods and receipts.' },
  { icon: Shield, title: 'Prescription Mgmt', desc: 'Handle prescriptions, controlled drugs, and compliance logs seamlessly.' },
  { icon: Users, title: 'Customer Records', desc: 'Patient profiles, chronic conditions, allergy notes and loyalty tracking.' },
  { icon: Clock, title: 'Expiry Tracking', desc: 'FEFO system with 90/60/30-day expiry alerts to eliminate drug waste.' },
  { icon: BarChart2, title: 'Reports & Analytics', desc: 'Profit & loss, VAT reports, stock movement, and sales analytics.' },
]

const testimonials = [
  { name: 'Dr. Jane Muthoni', role: 'Retail Pharmacy Owner', text: 'PMSS transformed how we manage our pharmacy. Expiry tracking alone saved us thousands!', stars: 5 },
  { name: 'Samuel Odhiambo', role: 'Hospital Pharmacist', text: 'The POS is fast and prescription handling is exactly what we needed for compliance.', stars: 5 },
  { name: 'Grace Wanjiku', role: 'Chain Pharmacy Manager', text: 'Multi-branch support and real-time reporting make running 3 pharmacies effortless.', stars: 5 },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
            <Pill size={20} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-gray-900">PMSS</span>
            <span className="text-xs text-gray-500 ml-2 hidden sm:inline">by Helvino Technologies</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2">Login</Link>
          <Link to="/register" className="btn-primary text-sm">Start Free Trial</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptNiA2djZoNnYtNmgtNnptLTEyIDB2Nmg2di02aC02em0tNi02djZoNnYtNmgtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
        <div className="relative max-w-6xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-primary-500/20 border border-primary-400/30 rounded-full px-4 py-1.5 text-sm text-primary-300 mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Multi-Tenant SaaS Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            The Smartest Way to<br />
            <span className="text-primary-400">Manage Your Pharmacy</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10">
            Complete pharmacy management system with inventory control, POS, prescriptions,
            accounting, and analytics — built for Kenyan pharmacies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-primary-500 hover:bg-primary-400 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors">
              Start 5-Day Free Trial →
            </Link>
            <Link to="/login" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors">
              Login to Dashboard
            </Link>
          </div>
          <p className="text-slate-400 text-sm mt-6">No credit card required • Full access during trial</p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary-600 text-white py-12">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[['500+', 'Pharmacies'], ['99.9%', 'Uptime'], ['KES 15K', 'Per Year'], ['5 Days', 'Free Trial']].map(([val, label]) => (
            <div key={label}>
              <p className="text-3xl font-bold">{val}</p>
              <p className="text-primary-200 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-gray-600 max-w-xl mx-auto">A comprehensive suite of tools designed specifically for pharmacy management in Kenya.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-11 h-11 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={22} className="text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-600 mb-12">Start free, pay only when you're ready to continue.</p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="border-2 border-gray-200 rounded-2xl p-8">
              <p className="text-gray-500 font-medium mb-2">Get Started</p>
              <p className="text-4xl font-bold text-gray-900 mb-1">KES 20,000</p>
              <p className="text-gray-500 text-sm mb-6">One-time setup & license fee</p>
              <ul className="space-y-3 text-sm text-left">
                {['Full system setup','Staff training support','Data migration help','Priority onboarding'].map(f => (
                  <li key={f} className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500 flex-shrink-0" />{f}</li>
                ))}
              </ul>
            </div>
            <div className="border-2 border-primary-500 rounded-2xl p-8 bg-primary-50">
              <div className="bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">ANNUAL SUBSCRIPTION</div>
              <p className="text-4xl font-bold text-gray-900 mb-1">KES 15,000</p>
              <p className="text-gray-500 text-sm mb-6">Per year — unlimited users</p>
              <ul className="space-y-3 text-sm text-left">
                {['All modules included','Cloud backups','Email/SMS support','Free updates & new features'].map(f => (
                  <li key={f} className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500 flex-shrink-0" />{f}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-8 p-5 bg-green-50 border border-green-200 rounded-xl inline-block">
            <p className="text-green-800 font-semibold">🎉 Start with a FREE 5-day trial — no payment required!</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-14">Trusted by Pharmacy Professionals</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, text, stars }) => (
              <div key={name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex gap-1 mb-4">
                  {Array(stars).fill(0).map((_, i) => <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-5">"{text}"</p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{name}</p>
                  <p className="text-gray-500 text-xs">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-700 text-white py-16 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Modernize Your Pharmacy?</h2>
        <p className="text-primary-200 mb-8 max-w-xl mx-auto">Join hundreds of pharmacies already using PMSS to eliminate waste and increase profits.</p>
        <Link to="/register" className="bg-white text-primary-700 hover:bg-primary-50 font-bold px-10 py-4 rounded-xl text-lg inline-block transition-colors">
          Start Your Free Trial Today
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <Pill size={16} className="text-white" />
                </div>
                <span className="font-bold text-white">PMSS</span>
              </div>
              <p className="text-sm max-w-xs">Pharmacy Management & Sales System by Helvino Technologies Limited.</p>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-white font-semibold mb-3">Contact Us</p>
              <p className="flex items-center gap-2"><Mail size={14} /> helvinotech@gmail.com</p>
              <p className="flex items-center gap-2"><Phone size={14} /> +254 700 000 000</p>
              <a href="https://helvino.org" className="flex items-center gap-2 hover:text-white">🌐 helvino.org</a>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 text-center text-xs">
            © {new Date().getFullYear()} Helvino Technologies Limited. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
