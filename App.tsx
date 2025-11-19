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
    } catch (err: any) {
      console.error(err);
      if (err.message === "API_KEY_MISSING") {
        setError("Configuration Error: API Key is missing. Please add 'API_KEY' to your Vercel Environment Variables and redeploy.");
      } else {
        setError("Failed to analyze the image. Please check your internet connection or try a different image.");
      }
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-5xl">
        
        {/* Header Intro */}
        {appState === AppState.IDLE && (
          <div className="text-center mb-12 animate-fade-in-down">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Is your plant sick?
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Upload a photo or use your camera to scan your plant. Our AI will instantly diagnose diseases and suggest treatments.
            </p>
          </div>
        )}

        <div className="space-y-8">
          
          {/* Camera Modal Overlay */}
          {showCamera && (
            <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200">
              <WebcamCapture 
                onCapture={handleCameraCapture} 
                onClose={() => setShowCamera(false)} 
              />
            </div>
          )}

          {/* Upload / Selection Area */}
          {appState === AppState.IDLE && !showCamera && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Upload Card */}
              <label className="relative group cursor-pointer">
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageSelect} 
                />
                <div className="h-64 rounded-2xl border-2 border-dashed border-green-300 bg-white flex flex-col items-center justify-center p-6 transition-all duration-300 group-hover:border-green-500 group-hover:shadow-lg group-hover:bg-green-50/50">
                  <div className="bg-green-100 p-4 rounded-full mb-4 group-hover:bg-green-200 transition-colors">
                    <Upload className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Upload Photo</h3>
                  <p className="text-sm text-gray-500 text-center">Select an image from your device</p>
                </div>
              </label>

              {/* Camera Card */}
              <button 
                onClick={() => setShowCamera(true)}
                className="relative group h-64 rounded-2xl border-2 border-dashed border-blue-300 bg-white flex flex-col items-center justify-center p-6 transition-all duration-300 hover:border-blue-500 hover:shadow-lg hover:bg-blue-50/50 cursor-pointer"
              >
                <div className="bg-blue-100 p-4 rounded-full mb-4 group-hover:bg-blue-200 transition-colors">
                  <Camera className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Take Photo</h3>
                <p className="text-sm text-gray-500 text-center">Use your webcam or camera</p>
              </button>
            </div>
          )}

          {/* Processing State */}
          {appState === AppState.ANALYZING && (
            <div className="flex flex-col items-center justify-center py-12 animate-pulse">
              <div className="relative">
                {selectedImage && (
                  <img 
                    src={selectedImage} 
                    alt="Analyzing" 
                    className="w-48 h-48 object-cover rounded-2xl shadow-lg opacity-50"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
                </div>
              </div>
              <h3 className="mt-6 text-xl font-medium text-gray-900">Analyzing Plant Health...</h3>
              <p className="mt-2 text-gray-500">Identifying potential diseases and remedies</p>
            </div>
          )}

          {/* Results State */}
          {appState === AppState.SUCCESS && result && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Image */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-200">
                  {selectedImage && (
                    <img 
                      src={selectedImage} 
                      alt="Analyzed plant" 
                      className="w-full h-auto rounded-xl object-cover shadow-inner" 
                    />
                  )}
                  <div className="mt-3 flex items-center justify-center text-sm text-gray-500">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    <span>Original Capture</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Results */}
              <div className="lg:col-span-2">
                <AnalysisResults result={result} onRetake={resetApp} />
              </div>
            </div>
          )}

          {/* Error State */}
          {appState === AppState.ERROR && (
            <div className="max-w-lg mx-auto bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-red-900 mb-2">Analysis Failed</h3>
              <p className="text-red-700 mb-6">{error}</p>
              <button 
                onClick={resetApp}
                className="px-6 py-2 bg-white text-red-700 border border-red-300 font-medium rounded-lg hover:bg-red-50 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
          
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} FloraGuard AI. Powered by Google Gemini.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;