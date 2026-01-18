import { X, Camera, ScanFace, CheckCircle, RefreshCcw } from 'lucide-react';
import { useState, useEffect } from 'react';

interface RegisterFaceProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function RegisterFace({ isOpen, onClose }: RegisterFaceProps) {
    const [scanning, setScanning] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setScanning(false);
            setProgress(0);
        }
    }, [isOpen]);

    const startScan = () => {
        setScanning(true);
        // Simulate scan
        let p = 0;
        const interval = setInterval(() => {
            p += 2;
            setProgress(p);
            if (p >= 100) clearInterval(interval);
        }, 50);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#0f172a] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-white/10 relative">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0f172a]">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900 dark:text-white flex items-center gap-2">
                        <ScanFace className="size-4 text-indigo-500" /> Face Biometrics
                    </h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                        <X className="size-5 text-neutral-500" />
                    </button>
                </div>

                {/* Viewfinder */}
                <div className="relative aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-50">
                        <Camera className="size-12 text-neutral-600" />
                        <span className="text-neutral-500 text-[10px] uppercase tracking-widest font-mono">Camera Feed</span>
                    </div>

                    {/* Face Frame */}
                    <div className={`relative w-48 h-64 border-2 ${progress === 100 ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.5)]' : 'border-white/30'} rounded-3xl z-10 overflow-hidden transition-all duration-500`}>
                        {/* Scan Line */}
                        {scanning && progress < 100 && (
                            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,1)] animate-scan-down" />
                        )}

                        {/* Success State */}
                        {progress === 100 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-green-500/10 backdrop-blur-[2px] animate-in zoom-in">
                                <CheckCircle className="size-16 text-green-500 drop-shadow-md" />
                            </div>
                        )}
                    </div>

                    {/* Status Text */}
                    <div className="absolute bottom-6 left-0 w-full text-center z-20">
                        <p className="text-white/90 text-xs font-mono font-medium bg-black/60 inline-block px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                            {scanning
                                ? (progress < 100 ? `SCANNING... ${progress}%` : "CAPTURE COMPLETE")
                                : "READY TO SCAN"}
                        </p>
                    </div>
                </div>

                {/* Controls */}
                <div className="p-4 bg-neutral-50 dark:bg-[#1e293b] border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
                    <button onClick={onClose} className="px-4 py-2 text-xs font-bold uppercase text-neutral-500 hover:text-neutral-700 dark:text-neutral-400">Cancel</button>

                    {!scanning || progress === 100 ? (
                        <button
                            onClick={startScan}
                            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg active:scale-95 transition-all"
                        >
                            {progress === 100 ? <><RefreshCcw className="size-3.5" /> Retake</> : <><Camera className="size-3.5" /> Start Scan</>}
                        </button>
                    ) : (
                        <button disabled className="px-5 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-400 rounded-lg text-xs font-bold uppercase tracking-wider">Processing...</button>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes scan-down {
                    0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; }
                }
                .animate-scan-down { animation: scan-down 1.5s linear infinite; }
            `}</style>
        </div>
    );
}
