import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { DotScreenShader } from "@/components/ui/dot-shader-background";
import {
  ArrowLeft,
  Scan,
  ShieldCheck,
  Camera,
  RefreshCcw,
  AlertCircle
} from 'lucide-react';

const ScanPage = () => {
  const [isScanning, setIsScanning] = useState(true);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('scanning');

  // Simulate a scanning process for demonstration
  useEffect(() => {
    if (scanStatus === 'scanning') {
      const timer = setTimeout(() => {
        setScanStatus('success');
        setIsScanning(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [scanStatus]);

  const resetScan = () => {
    setScanStatus('scanning');
    setIsScanning(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white flex flex-col relative overflow-hidden">
      <Head title="Face Recognition - MaPro" />

      {/* Shader Background (Dimmed) */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <DotScreenShader />
      </div>

      {/* --- Header --- */}
      <header className="relative z-10 p-6 flex items-center justify-between bg-slate-900/50 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 hover:bg-white/10 rounded-full transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <h1 className="text-lg font-bold leading-none">Facial Recognition</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">Verification System V1.0</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">System Online</span>
        </div>
      </header>

      {/* --- Main Scanner View --- */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="max-w-md w-full">

          {/* Scanner Container */}
          <div className="relative aspect-square md:aspect-[4/3] bg-slate-900 rounded-3xl border-2 border-white/10 shadow-2xl overflow-hidden group">

            {/* Placeholder for Camera Feed */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900">
              {scanStatus === 'scanning' ? (
                <Camera className="w-16 h-16 text-slate-700 animate-pulse" />
              ) : scanStatus === 'success' ? (
                <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/50">
                        <ShieldCheck className="w-10 h-10 text-emerald-500" />
                    </div>
                    <p className="text-emerald-400 font-bold tracking-wide">Identity Verified</p>
                </div>
              ) : (
                <AlertCircle className="w-16 h-16 text-red-500/50" />
              )}
            </div>

            {/* Scanning Overlay Grids */}
            {isScanning && (
              <>
                <div className="absolute inset-0 border-[20px] border-slate-900/50 pointer-events-none"></div>
                {/* Horizontal Scanning Line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-scan-move"></div>

                {/* Corner Accents */}
                <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-blue-500"></div>
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-blue-500"></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-blue-500"></div>
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-blue-500"></div>

                {/* Face Target Guide */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-64 border border-white/20 rounded-[100px] border-dashed animate-pulse"></div>
                </div>
              </>
            )}
          </div>

          {/* Status Panel */}
          <div className="mt-8 text-center space-y-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">
                    {scanStatus === 'scanning' ? "Position your face" : "Verification Complete"}
                </h2>
                <p className="text-slate-400 text-sm">
                    {scanStatus === 'scanning'
                        ? "Ensure your face is clearly visible within the frame for automatic detection."
                        : "Your biometric data matches the records for Resident ID: #10293"}
                </p>
            </div>

            <div className="flex gap-3 justify-center">
                {scanStatus !== 'scanning' ? (
                    <>
                        <button
                            onClick={resetScan}
                            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-all border border-white/10"
                        >
                            <RefreshCcw className="w-4 h-4" />
                            Scan Again
                        </button>
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20"
                        >
                            Proceed to Portal
                        </Link>
                    </>
                ) : (
                    <div className="flex items-center gap-3 px-6 py-3 bg-slate-900 border border-white/5 rounded-xl text-slate-400 text-sm italic">
                        <Scan className="w-4 h-4 animate-spin" />
                        Analyzing biometric markers...
                    </div>
                )}
            </div>
          </div>

        </div>
      </main>

      <footer className="relative z-10 p-8 text-center border-t border-white/5 bg-slate-950">
        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-[0.2em]">
            Powered by RavenLabs Security Protocol
        </p>
      </footer>

      {/* Injecting the scan-move animation keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan-move {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-move {
          animation: scan-move 3s ease-in-out infinite;
        }
      `}} />
    </div>
  );
};

export default ScanPage;
