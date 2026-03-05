import { Link } from 'react-router-dom'
import { Pill, Shield, BarChart2, Users, Clock, CheckCircle, Star, Phone, Mail, Package, TrendingUp, ArrowRight } from 'lucide-react'

const features = [
  { icon: Package, title: 'Smart Inventory', desc: 'Track stock, batches, expiry dates and get automated reorder alerts in real time.', color: 'bg-blue-500' },
  { icon: BarChart2, title: 'Fast POS', desc: 'Point-of-sale with multiple payment methods, VAT handling, and instant receipts.', color: 'bg-emerald-500' },
  { icon: Shield, title: 'Prescriptions', desc: 'Handle prescriptions, controlled drugs, and compliance logs effortlessly.', color: 'bg-violet-500' },
  { icon: Users, title: 'Customer CRM', desc: 'Patient profiles, chronic conditions, allergy notes and loyalty point tracking.', color: 'bg-orange-500' },
  { icon: Clock, title: 'Expiry Alerts', desc: 'FEFO system with 90/60/30-day expiry alerts to eliminate drug waste.', color: 'bg-pink-500' },
  { icon: TrendingUp, title: 'Reports & Analytics', desc: 'Profit & loss, VAT reports, stock movement, and sales analytics.', color: 'bg-amber-500' },
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
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center shadow-sm">
              <Pill size={18} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900 text-lg">PMSS</span>
              <span className="text-xs text-gray-400 ml-2 hidden sm:inline">by Helvino Technologies</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary text-sm">
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1C2B4B] via-primary-800 to-[#1C2B4B] text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 20% 80%, #1877F2 0%, transparent 50%), radial-gradient(circle at 80% 20%, #60a5fa 0%, transparent 50%)'}} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-blue-200 mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Kenya's #1 Pharmacy Management Platform
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
            Run Your Pharmacy<br />
            <span className="text-primary-300">Smarter & Faster</span>
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
            Complete pharmacy management with inventory, POS, prescriptions, accounting, and analytics — built for Kenyan pharmacies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-primary-500 hover:bg-primary-400 text-white font-bold px-8 py-4 rounded-2xl text-base transition-all duration-200 shadow-lg hover:shadow-primary-500/30 flex items-center justify-center gap-2">
              Start 5-Day Free Trial <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-4 rounded-2xl text-base transition-all duration-200 flex items-center justify-center gap-2">
              Sign In to Dashboard
            </Link>
          </div>
          <p className="text-blue-300 text-sm mt-6">No credit card required &bull; Full access during trial</p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-primary-500 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[['500+', 'Pharmacies Served'], ['99.9%', 'Uptime SLA'], ['KES 15K', 'Per Year'], ['5 Days', 'Free Trial']].map(([val, label]) => (
            <div key={label}>
              <p className="text-3xl font-extrabold">{val}</p>
              <p className="text-primary-100 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 bg-[#F0F2F5]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Everything Your Pharmacy Needs</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-base">A comprehensive suite of tools designed specifically for pharmacy management in Kenya.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                <div className={`w-11 h-11 ${color} rounded-2xl flex items-center justify-center mb-4 shadow-sm`}>
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-500 mb-12 text-base">Start free, pay only when you're ready to continue.</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-2 border-gray-200 rounded-2xl p-8 text-left hover:border-gray-300 transition-colors">
              <p className="text-gray-500 font-semibold text-sm mb-2 uppercase tracking-wide">Setup Fee</p>
              <p className="text-4xl font-extrabold text-gray-900 mb-1">KES 20,000</p>
              <p className="text-gray-400 text-sm mb-6">One-time setup & license fee</p>
              <ul className="space-y-3 text-sm">
                {['Full system setup', 'Staff training support', 'Data migration help', 'Priority onboarding'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-gray-700">
                    <CheckCircle size={15} className="text-green-500 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-2 border-primary-500 rounded-2xl p-8 bg-primary-50 text-left relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full">POPULAR</div>
              <p className="text-primary-600 font-semibold text-sm mb-2 uppercase tracking-wide">Annual Plan</p>
              <p className="text-4xl font-extrabold text-gray-900 mb-1">KES 15,000</p>
              <p className="text-gray-400 text-sm mb-6">Per year — unlimited users</p>
              <ul className="space-y-3 text-sm">
                {['All modules included', 'Cloud backups daily', 'Email & phone support', 'Free updates forever'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-gray-700">
                    <CheckCircle size={15} className="text-primary-500 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-2xl inline-flex items-center gap-2">
            <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
            <p className="text-green-800 font-semibold text-sm">Start with a FREE 5-day trial — no payment required!</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 bg-[#F0F2F5]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-14">Trusted by Pharmacy Professionals</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {testimonials.map(({ name, role, text, stars }) => (
              <div key={name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                <div className="flex gap-1 mb-4">
                  {Array(stars).fill(0).map((_, i) => (
                    <Star key={i} size={15} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-sm">
                    {name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{name}</p>
                    <p className="text-gray-400 text-xs">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-500 text-white py-16 px-4 sm:px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Ready to Modernize Your Pharmacy?</h2>
        <p className="text-primary-100 mb-8 max-w-xl mx-auto">Join hundreds of pharmacies already using PMSS to eliminate waste and boost profits.</p>
        <Link to="/register" className="bg-white text-primary-600 hover:bg-primary-50 font-extrabold px-10 py-4 rounded-2xl text-base inline-flex items-center gap-2 transition-colors shadow-lg">
          Start Your Free Trial Today <ArrowRight size={18} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-[#1C1E21] text-gray-400 py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center">
                  <Pill size={18} className="text-white" />
                </div>
                <span className="font-bold text-white text-lg">PMSS</span>
              </div>
              <p className="text-sm max-w-xs leading-relaxed">Pharmacy Management & Sales System by Helvino Technologies Limited.</p>
            </div>
            <div className="space-y-2.5 text-sm">
              <p className="text-white font-semibold mb-3">Contact Us</p>
              <a href="mailto:helvinotech@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail size={14} /> helvinotech@gmail.com
              </a>
              <a href="tel:+254700000000" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone size={14} /> +254 700 000 000
              </a>
              <a href="https://helvino.org" className="flex items-center gap-2 hover:text-white transition-colors">
                🌐 helvino.org
              </a>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-xs">
            © {new Date().getFullYear()} Helvino Technologies Limited. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
