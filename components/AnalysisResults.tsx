import React, { useState, useEffect } from 'react';
import { PlantAnalysisResult } from '../types';
import { CheckCircle, AlertTriangle, ThermometerSun, Droplets, Volume2, VolumeX } from 'lucide-react';

interface AnalysisResultsProps {
  result: PlantAnalysisResult;
  onRetake: () => void;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result, onRetake }) => {
  const [speaking, setSpeaking] = useState(false);

  const speakResults = () => {
    if ('speechSynthesis' in window) {
      const text = `Diagnosis: ${result.diseaseName}. ${result.description}. Recommended solutions: ${result.solutions.join('. ')}`;
      
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  };
  
  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 animate-fade-in-up">
      {/* Header Section */}
      <div className={`p-6 ${result.isHealthy ? 'bg-green-50' : 'bg-red-50'} border-b border-gray-100`}>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {result.isHealthy ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-600" />
              )}
              <h2 className={`text-2xl font-bold ${result.isHealthy ? 'text-green-800' : 'text-red-800'}`}>
                {result.diseaseName}
              </h2>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="px-2 py-1 bg-white rounded-md shadow-sm border border-gray-200 font-medium">
                Confidence: {result.confidence}%
              </span>
            </div>
          </div>
          
          <button
            onClick={speaking ? stopSpeaking : speakResults}
            className={`p-2 rounded-full transition-colors ${
              speaking 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={speaking ? "Stop reading" : "Read aloud"}
          >
            {speaking ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>
        </div>
        
        <p className="mt-4 text-gray-700 leading-relaxed">
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
            <ul className="space-y-2">
              {result.symptoms.map((symptom, idx) => (
                <li key={idx} className="flex items-start text-gray-600 bg-orange-50 p-3 rounded-lg text-sm">
                  <span className="mr-2 text-orange-400">•</span>
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
          <ul className="space-y-2">
            {result.solutions.map((solution, idx) => (
              <li key={idx} className="flex items-start text-gray-600 bg-blue-50 p-3 rounded-lg text-sm">
                <span className="mr-2 text-blue-400">✓</span>
                {solution}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-center">
        <button
          onClick={onRetake}
          className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:text-green-600 hover:border-green-300 transition-all shadow-sm"
        >
          Analyze Another Plant
        </button>
      </div>
    </div>
  );
};
