import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { WebcamCapture } from './components/WebcamCapture';
import { AnalysisResults } from './components/AnalysisResults';
import { analyzePlantImage } from './services/geminiService';
import { PlantAnalysisResult, AppState } from './types';
import { Upload, Camera, Loader2, AlertCircle, Image as ImageIcon } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [result, setResult] = useState<PlantAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setSelectedImage(base64);
        processImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = useCallback((imageSrc: string) => {
    setSelectedImage(imageSrc);
    setShowCamera(false);
    processImage(imageSrc);
  }, []);

  const processImage = async (base64Image: string) => {
    setAppState(AppState.ANALYZING);
    setError(null);
    try {
      const data = await analyzePlantImage(base64Image);
      setResult(data);
      setAppState(AppState.SUCCESS);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze the image. Please check your internet connection or try a different image.");
      setAppState(AppState.ERROR);
    }
  };

  const resetApp = () => {
    setAppState(AppState.IDLE);
    setSelectedImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="app-layout">
      <Header />

      <main className="main-content">
        
        {/* Header Intro */}
        {appState === AppState.IDLE && (
          <div className="intro-section">
            <h2 className="intro-title">
              Is your plant sick?
            </h2>
            <p className="intro-subtitle">
              Upload a photo or use your camera to scan your plant. Our AI will instantly diagnose diseases and suggest treatments.
            </p>
          </div>
        )}

        <div style={{ width: '100%' }}>
          
          {/* Camera Modal Overlay */}
          {showCamera && (
            <div className="modal-overlay">
              <WebcamCapture 
                onCapture={handleCameraCapture} 
                onClose={() => setShowCamera(false)} 
              />
            </div>
          )}

          {/* Upload / Selection Area */}
          {appState === AppState.IDLE && !showCamera && (
            <div className="action-grid">
              {/* Upload Card */}
              <label className="action-card upload">
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageSelect} 
                />
                <div className="icon-circle">
                  <Upload className="w-8 h-8" />
                </div>
                <h3>Upload Photo</h3>
                <p>Select an image from your device</p>
              </label>

              {/* Camera Card */}
              <button 
                onClick={() => setShowCamera(true)}
                className="action-card camera"
              >
                <div className="icon-circle">
                  <Camera className="w-8 h-8" />
                </div>
                <h3>Take Photo</h3>
                <p>Use your webcam or camera</p>
              </button>
            </div>
          )}

          {/* Processing State */}
          {appState === AppState.ANALYZING && (
            <div className="processing-state">
              <div className="processing-image-container">
                {selectedImage && (
                  <img 
                    src={selectedImage} 
                    alt="Analyzing" 
                    className="processing-img"
                  />
                )}
                <div className="spinner-overlay">
                  <Loader2 className="spinner" />
                </div>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 500, color: 'var(--gray-900)' }}>Analyzing Plant Health...</h3>
              <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem' }}>Identifying potential diseases and remedies</p>
            </div>
          )}

          {/* Results State */}
          {appState === AppState.SUCCESS && result && (
            <div className="results-grid">
              {/* Left Column: Image */}
              <div style={{gridColumn: 'span 1'}}>
                <div className="preview-card">
                  {selectedImage && (
                    <img 
                      src={selectedImage} 
                      alt="Analyzed plant" 
                      className="preview-img" 
                    />
                  )}
                  <div className="preview-label">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    <span>Original Capture</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Results */}
              <div style={{gridColumn: 'span 1'}}>
                <AnalysisResults result={result} onRetake={resetApp} />
              </div>
            </div>
          )}

          {/* Error State */}
          {appState === AppState.ERROR && (
            <div className="error-state">
              <AlertCircle className="error-icon" style={{margin: '0 auto 1rem auto'}} />
              <h3 className="error-title">Analysis Failed</h3>
              <p className="error-msg">{error}</p>
              <button 
                onClick={resetApp}
                className="btn-retry"
              >
                Try Again
              </button>
            </div>
          )}
          
        </div>
      </main>

      <footer className="app-footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} FloraGuard AI. Powered by Google Gemini.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;