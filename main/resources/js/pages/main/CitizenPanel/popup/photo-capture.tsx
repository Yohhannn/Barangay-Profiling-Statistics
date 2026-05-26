import { X, Camera, CheckCircle, RefreshCcw } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';

interface PhotoCaptureProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (file: File, previewUrl: string) => void;
}

type Status = 'idle' | 'camera' | 'captured' | 'error';

export default function PhotoCapture({ isOpen, onClose, onCapture }: PhotoCaptureProps) {
    const [status, setStatus] = useState<Status>('idle');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const capturedBlobRef = useRef<Blob | null>(null);

    const stopCamera = useCallback(() => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
    }, []);

    useEffect(() => {
        if (!isOpen) {
            stopCamera();
            setStatus('idle');
            setErrorMsg(null);
            if (capturedUrl) URL.revokeObjectURL(capturedUrl);
            setCapturedUrl(null);
            capturedBlobRef.current = null;
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

    const capture = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')!.drawImage(video, 0, 0);
        stopCamera();
        canvas.toBlob((blob) => {
            if (!blob) { setErrorMsg('Failed to capture image.'); setStatus('error'); return; }
            capturedBlobRef.current = blob;
            const url = URL.createObjectURL(blob);
            setCapturedUrl(url);
            setStatus('captured');
        }, 'image/jpeg', 0.92);
    };

    const handleConfirm = () => {
        if (!capturedBlobRef.current || !capturedUrl) return;
        const file = new File([capturedBlobRef.current], 'photo.jpg', { type: 'image/jpeg' });
        onCapture(file, capturedUrl);
        onClose();
    };

    const handleRetake = () => {
        if (capturedUrl) URL.revokeObjectURL(capturedUrl);
        setCapturedUrl(null);
        capturedBlobRef.current = null;
        setStatus('idle');
    };

    const handleClose = () => { stopCamera(); onClose(); };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#0f172a] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-white/10">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0f172a]">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900 dark:text-white flex items-center gap-2">
                        <Camera className="size-4 text-indigo-500" /> Take Profile Photo
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

                    {(status === 'idle' || status === 'error') && (
                        <div className="flex flex-col items-center gap-2 opacity-40">
                            <Camera className="size-12 text-neutral-400" />
                            <span className="text-neutral-400 text-[10px] uppercase tracking-widest font-mono">Camera Feed</span>
                        </div>
                    )}

                    {status === 'captured' && capturedUrl && (
                        <img src={capturedUrl} alt="Captured" className="absolute inset-0 w-full h-full object-cover" />
                    )}

                    {/* Bottom bar */}
                    <div className="absolute bottom-4 left-0 w-full text-center z-20 pointer-events-none">
                        {status === 'camera' && (
                            <p className="text-white/80 text-[10px] font-mono bg-black/50 inline-block px-4 py-1.5 rounded-full border border-white/10">
                                Position yourself · Look at the camera
                            </p>
                        )}
                        {status === 'captured' && (
                            <p className="text-white/80 text-[10px] font-mono bg-black/50 inline-block px-4 py-1.5 rounded-full border border-white/10">
                                Looks good? Confirm or retake.
                            </p>
                        )}
                        {errorMsg && (
                            <div className="mx-3 text-red-300 text-[10px] font-mono bg-black/85 px-3 py-2 rounded-xl border border-red-500/40 text-center leading-relaxed">
                                {errorMsg}
                            </div>
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div className="p-4 bg-neutral-50 dark:bg-[#1e293b] border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
                    <button type="button" onClick={handleClose} className="px-4 py-2 text-xs font-bold uppercase text-neutral-500 hover:text-neutral-700 dark:text-neutral-400">
                        Cancel
                    </button>

                    {(status === 'idle' || status === 'error') && (
                        <button type="button" onClick={startCamera} className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg active:scale-95 transition-all">
                            <Camera className="size-3.5" /> Start Camera
                        </button>
                    )}
                    {status === 'camera' && (
                        <button type="button" onClick={capture} className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg active:scale-95 transition-all">
                            <Camera className="size-3.5" /> Capture
                        </button>
                    )}
                    {status === 'captured' && (
                        <div className="flex gap-2">
                            <button type="button" onClick={handleRetake} className="flex items-center gap-2 px-4 py-2 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 rounded-lg text-xs font-bold uppercase tracking-wider transition-all">
                                <RefreshCcw className="size-3.5" /> Retake
                            </button>
                            <button type="button" onClick={handleConfirm} className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg active:scale-95 transition-all">
                                <CheckCircle className="size-3.5" /> Use Photo
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
