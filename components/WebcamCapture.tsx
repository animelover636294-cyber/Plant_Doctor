import React, { useRef, useState, useCallback } from 'react';
import { Camera, X, RefreshCw } from 'lucide-react';

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void;
  onClose: () => void;
}

export const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
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
    <div className="webcam-container">
      {error ? (
        <div className="error-overlay">
          <p style={{ marginBottom: '1rem' }}>{error}</p>
          <button 
            onClick={onClose}
            className="control-btn"
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
            className="webcam-video"
          />
          
          {/* Hidden Canvas for processing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Controls Overlay */}
          <div className="webcam-controls">
            <button 
              onClick={onClose}
              className="control-btn"
              title="Cancel"
            >
              <X className="w-6 h-6" />
            </button>
            
            <button 
              onClick={capture}
              className="capture-btn-outer"
            >
              <div className="capture-btn-inner">
                <Camera className="w-8 h-8" style={{color: 'var(--primary-green)'}} />
              </div>
            </button>

             <button 
              onClick={startCamera}
              className="control-btn"
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