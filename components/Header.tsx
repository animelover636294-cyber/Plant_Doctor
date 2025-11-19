import React from 'react';
import { Leaf, Activity } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 p-2 rounded-lg">
              <Leaf className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <h1 className="text-xl font-bold text-gray-900">FloraGuard AI</h1>
              <p className="text-xs text-gray-500">Instant Plant Disease Diagnosis</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
             <div className="flex items-center text-green-700 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
                <Activity className="w-4 h-4 mr-2" />
                <span>Gemini 2.5 Flash Powered</span>
             </div>
          </div>
        </div>
      </div>
    </header>
  );
};
