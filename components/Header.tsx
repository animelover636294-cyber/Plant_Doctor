import React from 'react';
import { Leaf, Activity } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="flex items-center">
          <div className="logo-box">
            <Leaf className="h-8 w-8 text-green-600" style={{color: 'var(--primary-green-dark)'}} />
          </div>
          <div className="logo-text">
            <h1>FloraGuard AI</h1>
            <p>Instant Plant Disease Diagnosis</p>
          </div>
        </div>
        <div className="flex items-center">
           <div className="badge">
              <Activity className="w-4 h-4" style={{marginRight: '0.5rem'}} />
              <span>Gemini 2.5 Flash Powered</span>
           </div>
        </div>
      </div>
    </header>
  );
};