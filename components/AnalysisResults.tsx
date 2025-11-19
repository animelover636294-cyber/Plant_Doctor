import React, { useState, useEffect } from 'react';
import { PlantAnalysisResult } from '../types';
import { CheckCircle, AlertTriangle, ThermometerSun, Droplets, Volume2, VolumeX, Loader2 } from 'lucide-react';

interface AnalysisResultsProps {
  result: PlantAnalysisResult;
  onRetake: () => void;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result, onRetake }) => {
  const [speaking, setSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('speechSynthesis' in window);
    
    // Cleanup speech on unmount
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakResults = () => {
    if (!isSupported) return;

    // Construct a natural sounding narrative
    const healthStatus = result.isHealthy ? "The plant appears to be healthy." : `The plant appears to have ${result.diseaseName}.`;
    const symptomsText = result.isHealthy ? "" : `The observed symptoms are: ${result.symptoms.join(', ')}.`;
    const solutionsText = `Recommended action: ${result.solutions.join('. ')}.`;
    
    const fullText = `${healthStatus} ${result.description} ${symptomsText} ${solutionsText}`;
    
    window.speechSynthesis.cancel(); // Stop any current speech

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = (e) => {
      console.error("Speech synthesis error:", e);
      setSpeaking(false);
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 animate-fade-in-up">
      {/* Header Section */}
      <div className={`p-6 ${result.isHealthy ? 'bg-green-50' : 'bg-red-50'} border-b border-gray-100`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {result.isHealthy ? (
                <CheckCircle className="w-7 h-7 text-green-600" />
              ) : (
                <AlertTriangle className="w-7 h-7 text-red-600" />
              )}
              <h2 className={`text-2xl font-bold ${result.isHealthy ? 'text-green-800' : 'text-red-800'}`}>
                {result.diseaseName}
              </h2>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className={`px-2 py-1 rounded-md shadow-sm border font-medium ${
                result.confidence > 80 ? 'bg-green-100 border-green-200 text-green-800' : 'bg-yellow-50 border-yellow-200 text-yellow-800'
              }`}>
                Confidence: {result.confidence}%
              </span>
            </div>
          </div>
          
          {isSupported && (
            <button
              onClick={speaking ? stopSpeaking : speakResults}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all shadow-sm font-medium ${
                speaking 
                  ? 'bg-green-600 text-white hover:bg-green-700 ring-2 ring-offset-2 ring-green-500' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:text-green-600 hover:border-green-300'
              }`}
              title={speaking ? "Stop reading" : "Read diagnosis aloud"}
            >
              {speaking ? (
                <>
                   <Loader2 className="w-4 h-4 animate-spin" />
                   <span>Reading...</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>Listen to Diagnosis</span>
                </>
              )}
            </button>
          )}
        </div>
        
        <p className="mt-4 text-gray-700 leading-relaxed border-t border-gray-200/50 pt-4">
          {result.description}
        </p>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        {/* Symptoms */}
        {!result.isHealthy && (
          <div className="space-y-3">
            <h3 className="flex items-center text-lg font-semibold text-gray-800">
              <ThermometerSun className="w-5 h-5 mr-2 text-orange-500" />
              Symptoms
            </h3>
            <ul className="space-y-2 bg-orange-50/50 p-4 rounded-xl border border-orange-100">
              {result.symptoms.map((symptom, idx) => (
                <li key={idx} className="flex items-start text-gray-700 text-sm">
                  <span className="mr-2 text-orange-400 font-bold">•</span>
                  {symptom}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Solutions */}
        <div className={result.isHealthy ? 'col-span-2' : 'space-y-3'}>
          <h3 className="flex items-center text-lg font-semibold text-gray-800">
            <Droplets className="w-5 h-5 mr-2 text-blue-500" />
            {result.isHealthy ? "Care Tips" : "Treatment & Solutions"}
          </h3>
          <ul className="space-y-2 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            {result.solutions.map((solution, idx) => (
              <li key={idx} className="flex items-start text-gray-700 text-sm">
                <span className="mr-2 text-blue-500 font-bold">✓</span>
                {solution}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-center">
        <button
          onClick={onRetake}
          className="w-full sm:w-auto px-8 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-all shadow-sm"
        >
          Analyze Another Plant
        </button>
      </div>
    </div>
  );
};