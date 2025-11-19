import React, { useRef, useState, useCallback } from 'react';
import { Camera, X, RefreshCw } from 'lucide-react';

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void;
  onClose: () => void;
}

export const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreamActive(true);
        setError(null);
      }
    } catch (err) {
      setError("Unable to access camera. Please ensure permissions are granted.");
      console.error(err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreamActive(false);
    }
  }, []);

  const capture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageSrc = canvas.toDataURL('image/jpeg');
        stopCamera();
        onCapture(imageSrc);
      }
    }
  }, [onCapture, stopCamera]);

  // Start camera on mount
  React.useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  return (
    <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl w-full max-w-2xl mx-auto aspect-video">
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 text-center">
          <p className="mb-4">{error}</p>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
          >
            Close
          </button>
        </div>
      ) : (
        <>
          {/* Video Feed */}
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
          
          {/* Hidden Canvas for processing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-center items-center space-x-8">
            <button 
              onClick={onClose}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition"
              title="Cancel"
            >
              <X className="w-6 h-6" />
            </button>
            
            <button 
              onClick={capture}
              className="p-1 rounded-full border-4 border-white/50 hover:border-white hover:scale-105 transition duration-200"
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <Camera className="w-8 h-8 text-green-600" />
              </div>
            </button>

             <button 
              onClick={startCamera}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition"
              title="Restart Camera"
            >
              <RefreshCw className="w-6 h-6" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
