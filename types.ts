export interface PlantAnalysisResult {
  diseaseName: string;
  isHealthy: boolean;
  confidence: number;
  description: string;
  symptoms: string[];
  solutions: string[];
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}
