import { X, ScanFace, Camera, CheckCircle, RefreshCcw, UserX, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';

interface SearchResult {
    id: number;
    name: string;
    citizenId: string;
    sitio: string;
    sex: string;
    age: number | null;
    photoUrl: string | null;
    confidence: number;
}

interface FaceSearchProps {
    isOpen: boolean;
    onClose: () => void;
    onFound: (citizenId: number, citizenUuid: string) => void;
}

type Status = 'idle' | 'camera' | 'searching' | 'found' | 'not_found' | 'error';

export default function FaceSearch({ isOpen, onClose, onFound }: FaceSearchProps) {
    const [status, setStatus] = useState<Status>('idle');
    const [countdown, setCountdown] = useState<number | null>(null);
    const [result, setResult] = useState<SearchResult | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const stopCamera = useCallback(() => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
    }, []);

    useEffect(() => {
        if (!isOpen) {
            stopCamera();
            setStatus('idle');
            setResult(null);
            setErrorMsg(null);
            setCountdown(null);
        }
    }, [isOpen, stopCamera]);

    useEffect(() => () => stopCamera(), [stopCamera]);

    const startCamera = async () => {
        setErrorMsg(null);
        setResult(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            setStatus('camera');
        } catch {
            setErrorMsg('Camera access denied. Allow camera permission and retry.');
            setStatus('error');
        }
    };

    const captureAndSearch = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')!.drawImage(video, 0, 0);
        stopCamera();
        setStatus('searching');

        canvas.toBlob(async (blob) => {
            if (!blob) { setStatus('error'); setErrorMsg('Failed to capture image.'); return; }

            const fd = new FormData();
            fd.append('face_image', blob, 'face.jpg');

            const xsrfRaw = document.cookie.split('; ')
                .find(c => c.startsWith('XSRF-TOKEN='))
                ?.split('=').slice(1).join('=') ?? '';
            const xsrfToken = decodeURIComponent(xsrfRaw);

            try {
                const res = await fetch('/citizens/search-face', {
                    method: 'POST',
                    headers: { 'X-XSRF-TOKEN': xsrfToken, 'Accept': 'application/json' },
                    body: fd,
                });

                let json: any = null;
                try { json = await res.json(); } catch { /* non-JSON */ }

                if (!res.ok || json?.error) {
                    setErrorMsg(json?.error ?? `Server error (${res.status}).`);
                    setStatus('error');
                    return;
                }

                if (json?.found) {
                    setResult(json.citizen ? { ...json.citizen, confidence: json.confidence } : null);
                    setStatus('found');
                } else {
                    setStatus('not_found');
                }
            } catch {
                setErrorMsg('Network error. Please try again.');
                setStatus('error');
            }
        }, 'image/jpeg', 0.92);
    }, [stopCamera]);

    // Auto-capture: 3-second countdown once camera is live
    useEffect(() => {
        if (status !== 'camera') return;

        let count = 3;
        setCountdown(count);

        const interval = setInterval(() => {
            count--;
            if (count <= 0) {
                clearInterval(interval);
                setCountdown(null);
                captureAndSearch();
            } else {
                setCountdown(count);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [status, captureAndSearch]);

    const handleRetry = () => {
        setStatus('idle');
        setResult(null);
        setErrorMsg(null);
        setCountdown(null);
    };

    const handleViewProfile = () => {
        if (result) {
            onFound(result.id, result.citizenId);
            onClose();
        }
    };

    const handleClose = () => { stopCamera(); onClose(); };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#0f172a] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-white/10">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0f172a]">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900 dark:text-white flex items-center gap-2">
                        <ScanFace className="size-4 text-blue-500" /> Face Search
                    </h3>
                    <button onClick={handleClose} className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                        <X className="size-5 text-neutral-500" />
                    </button>
                </div>

                {/* Viewfinder */}
                <div className="relative aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
                    <video
                        ref={videoRef}
                        className={`absolute inset-0 w-full h-full object-cover ${status === 'camera' ? '' : 'hidden'}`}
                        muted
                        playsInline
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Idle placeholder */}
                    {status === 'idle' && (
                        <div className="flex flex-col items-center gap-2 opacity-40">
                            <Camera className="size-12 text-neutral-400" />
                            <span className="text-neutral-400 text-[10px] uppercase tracking-widest font-mono">Camera Feed</span>
                        </div>
                    )}

                    {/* Face frame overlay + countdown */}
                    {status === 'camera' && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-44 h-60 border-2 border-blue-400/80 rounded-3xl shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
                            {countdown !== null && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 flex items-center justify-center rounded-full bg-blue-500/80 border-2 border-white/60 shadow-xl">
                                    <span className="text-white text-2xl font-black font-mono">{countdown}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Searching */}
                    {status === 'searching' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 gap-3">
                            <div className="w-10 h-10 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                            <p className="text-white text-[11px] font-mono uppercase tracking-widest">Searching collection…</p>
                        </div>
                    )}

                    {/* Found */}
                    {status === 'found' && result && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 gap-4 p-6 animate-in zoom-in duration-300">
                            <div className="flex flex-col items-center gap-3 w-full">
                                {/* Confidence badge */}
                                <span className="text-[10px] font-black uppercase tracking-widest bg-green-500/20 text-green-400 border border-green-500/40 px-3 py-1 rounded-full font-mono">
                                    {result.confidence}% Match
                                </span>

                                {/* Photo / Avatar */}
                                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-green-400/60 bg-neutral-800 flex items-center justify-center shadow-xl">
                                    {result.photoUrl ? (
                                        <img src={result.photoUrl} alt={result.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <CheckCircle className="size-8 text-green-400" />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="text-center space-y-1">
                                    <h4 className="text-white font-black text-base leading-tight">{result.name}</h4>
                                    <p className="text-blue-400 font-mono text-[11px]">{result.citizenId}</p>
                                    <div className="flex items-center justify-center gap-2 mt-1">
                                        <span className="text-[10px] bg-white/10 text-neutral-300 px-2 py-0.5 rounded font-mono">{result.sitio}</span>
                                        <span className="text-[10px] bg-white/10 text-neutral-300 px-2 py-0.5 rounded font-mono">{result.sex}</span>
                                        {result.age !== null && (
                                            <span className="text-[10px] bg-white/10 text-neutral-300 px-2 py-0.5 rounded font-mono">{result.age} yrs</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Not found */}
                    {status === 'not_found' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3 animate-in zoom-in duration-300">
                            <UserX className="size-14 text-neutral-500" />
                            <p className="text-neutral-300 text-xs font-mono font-bold uppercase tracking-widest">No Match Found</p>
                            <p className="text-neutral-500 text-[10px] font-mono text-center px-6">This face is not registered in the system.</p>
                        </div>
                    )}

                    {/* Error */}
                    {status === 'error' && errorMsg && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3 p-4">
                            <div className="mx-3 text-red-300 text-[10px] font-mono bg-black/85 px-3 py-2 rounded-xl border border-red-500/40 text-center leading-relaxed break-words whitespace-pre-wrap">
                                {errorMsg}
                            </div>
                        </div>
                    )}

                    {/* Bottom status bar */}
                    {status === 'camera' && (
                        <div className="absolute bottom-4 left-0 w-full text-center z-20 pointer-events-none">
                            <p className="text-white/80 text-[10px] font-mono bg-black/50 inline-block px-4 py-1.5 rounded-full border border-white/10">
                                Center your face · Auto-scanning in {countdown ?? '…'}s
                            </p>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="p-4 bg-neutral-50 dark:bg-[#1e293b] border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
                    <button onClick={handleClose} className="px-4 py-2 text-xs font-bold uppercase text-neutral-500 hover:text-neutral-700 dark:text-neutral-400">
                        {status === 'found' ? 'Close' : 'Cancel'}
                    </button>

                    {status === 'idle' && (
                        <button onClick={startCamera} className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg active:scale-95 transition-all">
                            <Camera className="size-3.5" /> Start Camera
                        </button>
                    )}

                    {status === 'camera' && (
                        <button onClick={() => { setCountdown(null); captureAndSearch(); }} className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg active:scale-95 transition-all">
                            <ScanFace className="size-3.5" /> Search Now
                        </button>
                    )}

                    {status === 'searching' && (
                        <button disabled className="flex items-center gap-2 px-5 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-400 rounded-lg text-xs font-bold uppercase tracking-wider">
                            <Loader2 className="size-3.5 animate-spin" /> Searching…
                        </button>
                    )}

                    {status === 'found' && (
                        <div className="flex items-center gap-2">
                            <button onClick={handleRetry} className="flex items-center gap-1.5 px-4 py-2 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 rounded-lg text-xs font-bold uppercase tracking-wider transition-all">
                                <RefreshCcw className="size-3.5" /> Retry
                            </button>
                            <button onClick={handleViewProfile} className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg active:scale-95 transition-all">
                                <CheckCircle className="size-3.5" /> View Profile
                            </button>
                        </div>
                    )}

                    {(status === 'not_found' || status === 'error') && (
                        <button onClick={handleRetry} className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg active:scale-95 transition-all">
                            <RefreshCcw className="size-3.5" /> Try Again
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
