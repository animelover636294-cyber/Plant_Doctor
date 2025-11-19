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

  const headerClass = result.isHealthy ? 'results-header healthy' : 'results-header unhealthy';
  const iconColor = result.isHealthy ? 'var(--primary-green-dark)' : 'var(--red-600)';

  return (
    <div className="results-card">
      {/* Header Section */}
      <div className={headerClass}>
        <div className="header-row">
          <div>
            <div className="diagnosis-title-row">
              {result.isHealthy ? (
                <CheckCircle className="w-6 h-6" style={{color: iconColor}} />
              ) : (
                <AlertTriangle className="w-6 h-6" style={{color: iconColor}} />
              )}
              <h2 className="diagnosis-title">
                {result.diseaseName}
              </h2>
            </div>
            <div style={{display: 'flex', alignItems: 'center'}}>
              <span className="confidence-badge">
                Confidence: {result.confidence}%
              </span>
            </div>
          </div>
          
          <button
            onClick={speaking ? stopSpeaking : speakResults}
            className={`read-btn ${speaking ? 'active' : 'inactive'}`}
            title={speaking ? "Stop reading" : "Read aloud"}
          >
            {speaking ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>
        </div>
        
        <p className="description-text">
          {result.description}
        </p>
      </div>

      {/* Details Grid */}
      <div className="results-body">
        {/* Symptoms */}
        {!result.isHealthy && (
          <div className="symptoms-list">
            <h3 className="section-title">
              <ThermometerSun className="w-5 h-5" style={{color: 'var(--orange-500)'}} />
              Symptoms
            </h3>
            <ul style={{padding: 0, margin: 0, listStyle: 'none'}}>
              {result.symptoms.map((symptom, idx) => (
                <li key={idx} className="list-item">
                  <span className="bullet">•</span>
                  {symptom}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Solutions */}
        <div className={`solutions-list ${result.isHealthy ? 'col-span-2' : ''}`} style={result.isHealthy ? {gridColumn: 'span 2'} : {}}>
          <h3 className="section-title">
            <Droplets className="w-5 h-5" style={{color: 'var(--blue-500)'}} />
            {result.isHealthy ? "Care Tips" : "Treatment & Solutions"}
          </h3>
          <ul style={{padding: 0, margin: 0, listStyle: 'none'}}>
            {result.solutions.map((solution, idx) => (
              <li key={idx} className="list-item">
                <span className="bullet">✓</span>
                {solution}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="results-footer">
        <button
          onClick={onRetake}
          className="btn-retake"
        >
          Analyze Another Plant
        </button>
      </div>
    </div>
  );
};