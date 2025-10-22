export interface EyeLandmarks {
  left: Array<{ x: number; y: number }>;
  right: Array<{ x: number; y: number }>;
}

export interface MouthLandmarks {
  points: Array<{ x: number; y: number }>;
}

export interface DetectionResult {
  leftEAR: number;
  rightEAR: number;
  avgEAR: number;
  mouthRatio: number;
  isDrowsy: boolean;
  isYawning: boolean;
  timestamp: number;
}

export interface AlertConfig {
  earThreshold: number;
  mouthThreshold: number;
  consecutiveFrames: number;
  soundEnabled: boolean;
}

export interface AlertHistory {
  type: 'drowsiness' | 'yawning';
  timestamp: number;
  riskLevel?: 'moderate' | 'high';
}