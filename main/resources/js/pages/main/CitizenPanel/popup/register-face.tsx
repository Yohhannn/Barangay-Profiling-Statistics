import { X, Camera, ScanFace, CheckCircle, RefreshCcw } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';

interface RegisterFaceProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture?: (faceId: string) => void;
    existingFaceId?: string;
}

type Status = 'idle' | 'camera' | 'uploading' | 'success' | 'error';

export default function RegisterFace({ isOpen, onClose, onCapture, existingFaceId }: RegisterFaceProps) {
    const [status, setStatus] = useState<Status>('idle');
    const [faceId, setFaceId] = useState<string | null>(null);
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
            setFaceId(null);
            setErrorMsg(null);
        }
    }, [isOpen, stopCamera]);

    useEffect(() => () => stopCamera(), [stopCamera]);

    const startCamera = async () => {
        setErrorMsg(null);
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

    const captureAndSend = async () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')!.drawImage(video, 0, 0);
        stopCamera();
        setStatus('uploading');

        canvas.toBlob(async (blob) => {
            if (!blob) { setStatus('error'); setErrorMsg('Failed to capture image.'); return; }

            const fd = new FormData();
            fd.append('face_image', blob, 'face.jpg');
            if (existingFaceId) fd.append('old_face_id', existingFaceId);

            // Read XSRF-TOKEN cookie — same mechanism Inertia/Axios use
            const xsrfRaw = document.cookie.split('; ')
                .find(c => c.startsWith('XSRF-TOKEN='))
                ?.split('=').slice(1).join('=') ?? '';
            const xsrfToken = decodeURIComponent(xsrfRaw);

            try {
                const res = await fetch('/citizens/register-face', {
                    method: 'POST',
                    headers: {
                        'X-XSRF-TOKEN': xsrfToken,
                        'Accept': 'application/json',
                    },
                    body: fd,
                });

                let json: any = null;
                try { json = await res.json(); } catch { /* non-JSON body */ }

                if (!res.ok || json?.error) {
                    setErrorMsg(json?.error ?? `Server error (${res.status}). Check that AWS credentials are set in .env.`);
                    setStatus('error');
                    return;
                }
                setFaceId(json.face_id);
                setStatus('success');
                onCapture?.(json.face_id);
            } catch {
                setErrorMsg('Network error. Please try again.');
                setStatus('error');
            }
        }, 'image/jpeg', 0.92);
    };

    const handleRetake = () => {
        setStatus('idle');
        setFaceId(null);
        setErrorMsg(null);
    };

    const handleClose = () => { stopCamera(); onClose(); };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#0f172a] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-white/10">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0f172a]">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900 dark:text-white flex items-center gap-2">
                        <ScanFace className="size-4 text-indigo-500" /> Face Biometrics
                    </h3>
                    <button type="button" onClick={handleClose} className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
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

                    {/* Idle / Error placeholder */}
                    {(status === 'idle' || status === 'error') && (
                        <div className="flex flex-col items-center gap-2 opacity-40">
                            <Camera className="size-12 text-neutral-400" />
                            <span className="text-neutral-400 text-[10px] uppercase tracking-widest font-mono">Camera Feed</span>
                        </div>
                    )}

                    {/* Face frame overlay when camera is live */}
                    {status === 'camera' && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-44 h-60 border-2 border-white/70 rounded-3xl shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
                        </div>
                    )}

                    {/* Uploading / analyzing */}
                    {status === 'uploading' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 gap-3">
                            <div className="w-10 h-10 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                            <p className="text-white text-[11px] font-mono uppercase tracking-widest">Analyzing face…</p>
                        </div>
                    )}

                    {/* Success */}
                    {status === 'success' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-green-500/10 animate-in zoom-in">
                            <CheckCircle className="size-16 text-green-400" />
                            <p className="text-white text-xs font-mono font-bold uppercase tracking-widest bg-black/60 px-4 py-1.5 rounded-full">
                                Face Registered
                            </p>
                            {faceId && (
                                <p className="text-green-400 text-[9px] font-mono bg-black/40 px-3 py-1 rounded">
                                    {faceId.substring(0, 16)}…
                                </p>
                            )}
                        </div>
                    )}

                    {/* Bottom status bar */}
                    <div className="absolute bottom-4 left-0 w-full text-center z-20 pointer-events-none">
                        {status === 'camera' && (
                            <p className="text-white/80 text-[10px] font-mono bg-black/50 inline-block px-4 py-1.5 rounded-full border border-white/10">
                                Center your face · Look straight ahead
                            </p>
                        )}
                        {errorMsg && status === 'error' && (
                            <div className="mx-3 text-red-300 text-[10px] font-mono bg-black/85 px-3 py-2 rounded-xl border border-red-500/40 text-center leading-relaxed break-words whitespace-pre-wrap">
                                {errorMsg}
                            </div>
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div className="p-4 bg-neutral-50 dark:bg-[#1e293b] border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
                    <button type="button" onClick={handleClose} className="px-4 py-2 text-xs font-bold uppercase text-neutral-500 hover:text-neutral-700 dark:text-neutral-400">
                        {status === 'success' ? 'Done' : 'Cancel'}
                    </button>

                    {(status === 'idle' || status === 'error') && (
                        <button type="button" onClick={startCamera} className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg active:scale-95 transition-all">
                            <Camera className="size-3.5" /> Start Camera
                        </button>
                    )}
                    {status === 'camera' && (
                        <button type="button" onClick={captureAndSend} className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg active:scale-95 transition-all">
                            <ScanFace className="size-3.5" /> Capture Face
                        </button>
                    )}
                    {status === 'uploading' && (
                        <button type="button" disabled className="px-5 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-400 rounded-lg text-xs font-bold uppercase tracking-wider">
                            Processing…
                        </button>
                    )}
                    {status === 'success' && (
                        <button type="button" onClick={handleRetake} className="flex items-center gap-2 px-5 py-2 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 rounded-lg text-xs font-bold uppercase tracking-wider transition-all">
                            <RefreshCcw className="size-3.5" /> Retake
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
