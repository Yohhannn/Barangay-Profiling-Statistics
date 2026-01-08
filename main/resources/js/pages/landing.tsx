import React from 'react';
import { Head, Link } from '@inertiajs/react'; // Added Link for Inertia navigation
import { dashboard, login, register } from '@/routes';
import ScrollToTop from "@/components/ScrollToTop";
import {
  Database,
  Users,
  ShieldCheck,
  BarChart3,
  FileText,
  Clock,
  AlertCircle,
  ArrowRight,
  Server,
  LayoutDashboard
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <Head title="MaPro - Marigondon Records and Statistics" />

      {/* --- Navigation --- */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg shadow-blue-200 shadow-lg">
              <Database className="text-white w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold block leading-none tracking-tight">MaPro</span>
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Barangay Marigondon</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#problem" className="hover:text-blue-600 transition">Challenges</a>
            <a href="#features" className="hover:text-blue-600 transition">System</a>
            {/* Changed to Login Link */}
            <Link
              href={login()}
              className="bg-slate-900 text-white px-6 py-2.5 rounded-lg hover:bg-slate-800 transition shadow-sm"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <header className="relative pt-16 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-xs font-bold tracking-wider text-blue-700 uppercase bg-blue-100 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              V1.0.0
            </div>
            <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] mb-6 text-slate-900">
              Modernizing <span className="text-blue-600">Local Governance.</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-xl">
              MaPro is an offline-first database system designed to eliminate manual bottlenecks and secure the future of Barangay Marigondon's resident data.
            </p>
            <div className="flex flex-wrap gap-4">
              {/* Main CTA now also points to login */}
              <Link
                href="/login"
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition flex items-center gap-2"
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </Link>
              {/* Technical Overview Button Removed */}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-[2rem] -z-10 transform rotate-3"></div>
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 overflow-hidden">
                {/* Mock UI Header */}
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                </div>
                <div className="h-4 w-32 bg-slate-100 rounded"></div>
              </div>
              {/* Mock UI Content */}
              <div className="space-y-3">
                <div className="h-10 bg-blue-50 rounded-lg w-full flex items-center px-4">
                    <div className="h-2 w-24 bg-blue-200 rounded"></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <div className="h-24 bg-slate-50 rounded-lg border border-slate-100 flex flex-col items-center justify-center gap-2">
                        <Users className="w-5 h-5 text-blue-400" />
                        <div className="h-2 w-12 bg-slate-200 rounded"></div>
                    </div>
                    <div className="h-24 bg-slate-50 rounded-lg border border-slate-100 flex flex-col items-center justify-center gap-2">
                        <FileText className="w-5 h-5 text-emerald-400" />
                        <div className="h-2 w-12 bg-slate-200 rounded"></div>
                    </div>
                    <div className="h-24 bg-slate-50 rounded-lg border border-slate-100 flex flex-col items-center justify-center gap-2">
                        <BarChart3 className="w-5 h-5 text-purple-400" />
                        <div className="h-2 w-12 bg-slate-200 rounded"></div>
                    </div>
                </div>
                <div className="h-32 bg-slate-50 rounded-lg border border-slate-100 p-4 space-y-2">
                    <div className="h-2 bg-slate-200 rounded w-full"></div>
                    <div className="h-2 bg-slate-200 rounded w-5/6"></div>
                    <div className="h-2 bg-slate-200 rounded w-4/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- Problem Section --- */}
      <section id="problem" className="py-24 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold mb-4">The Status Quo Challenge</h2>
            <p className="text-slate-500 text-lg mb-12">
              Relying on physical documents and handwritten entries leads to systemic inefficiencies that impede public service.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: <Clock className="w-10 h-10 text-orange-500" />, title: "Time Loss", desc: "Laborious manual data entry and slow physical information retrieval during peak periods." },
              { icon: <AlertCircle className="w-10 h-10 text-red-500" />, title: "Data Vulnerability", desc: "Critical resident records are susceptible to physical damage, misplacement, or degradation." },
              { icon: <LayoutDashboard className="w-10 h-10 text-blue-500" />, title: "Administrative Gap", desc: "Limited capacity for officials to generate real-time statistics for informed decision-making." }
            ].map((item, idx) => (
              <div key={idx} className="group">
                <div className="mb-6">{item.icon}</div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Features --- */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-6">Localized Excellence</h2>
            <p className="text-slate-600">MaPro utilizes a robust technical stack to provide a secure, offline environment for barangay operations.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <ShieldCheck />, title: "Secure Storage", desc: "PostgreSQL-backed data management with zero risk of physical loss." },
              { icon: <Users />, title: "Smart Profiling", desc: "Intuitive resident data entry with advanced searching and filtering." },
              { icon: <BarChart3 />, title: "Auto-Reporting", desc: "Generate actionable statistical reports with a single click." },
            ].map((feat, i) => (
              <div key={i} className="p-8 bg-white border border-slate-200 rounded-2xl hover:border-blue-300 hover:shadow-lg transition group">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {feat.icon}
                </div>
                <h4 className="font-bold text-lg mb-2">{feat.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Database className="text-blue-600 w-5 h-5" />
            <span className="font-bold">MaPro 2025</span>
          </div>
          <p className="text-slate-500 text-sm">
            Developed for Barangay Marigondon. Optimized for Local Governance.
          </p>
          <div className="flex gap-6 text-sm font-medium text-slate-400">
            <span>PostgreSQL</span>
            <span>Python</span>
            <span>PyQt6</span>
          </div>
        </div>
      </footer>
        <ScrollToTop />
    </div>
  );
};

export default LandingPage;
