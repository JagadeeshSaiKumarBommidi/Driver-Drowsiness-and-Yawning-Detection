import { AlertTriangle, Eye, Zap } from 'lucide-react';
import { DetectionResult } from '../types/detection';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  currentResult: DetectionResult | null;
  isInitialized: boolean;
  isDetectionEnabled: boolean;
}

export function CameraView({ 
  videoRef, 
  canvasRef, 
  currentResult, 
  isInitialized, 
  isDetectionEnabled
}: CameraViewProps) {
  const getStatusColor = () => {
    if (!currentResult || !isDetectionEnabled) return 'bg-gray-500';
    if (currentResult.isDrowsy) return 'bg-red-500';
    if (currentResult.isYawning) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (!isDetectionEnabled) return 'DETECTION DISABLED';
    if (!currentResult) return 'Initializing...';
    if (currentResult.isDrowsy) return 'DROWSINESS DETECTED';
    if (currentResult.isYawning) return 'YAWNING DETECTED';
    return 'ALERT & FOCUSED';
  };

  const getStatusIcon = () => {
    if (!isDetectionEnabled || !currentResult) return <Zap className="w-5 h-5" />;
    if (currentResult.isDrowsy) return <AlertTriangle className="w-5 h-5" />;
    if (currentResult.isYawning) return <Eye className="w-5 h-5" />;
    return <Eye className="w-5 h-5" />;
  };

  return (
    <div className="relative bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
      {/* Camera Feed */}
      <div className="relative aspect-video">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          playsInline
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Status Overlay */}
        <div className="absolute top-4 left-4 right-4">
          <div className="flex items-center gap-3">
            <div className={`${getStatusColor()} px-4 py-2 rounded-lg flex items-center gap-2 text-white font-semibold shadow-lg flex-1`}>
              {getStatusIcon()}
              <span>{getStatusText()}</span>
              {isDetectionEnabled && (currentResult?.isDrowsy || currentResult?.isYawning) && (
                <div className="animate-pulse ml-auto">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Real-time Metrics */}
        {currentResult && isDetectionEnabled && (
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="font-medium text-blue-300">Eye Aspect Ratio</div>
                <div className="text-lg font-mono">{currentResult.avgEAR.toFixed(3)}</div>
              </div>
              <div>
                <div className="font-medium text-purple-300">Mouth Opening</div>
                <div className="text-lg font-mono">{currentResult.mouthRatio.toFixed(3)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Initialization Overlay */}
        {!isInitialized && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
              <div className="text-lg font-medium">Initializing Camera & AI...</div>
              <div className="text-sm text-gray-300 mt-2">Please allow camera access</div>
            </div>
          </div>
        )}

        {/* Detection Disabled Overlay */}
        {isInitialized && !isDetectionEnabled && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center text-white">
              <Zap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <div className="text-lg font-medium">Detection Paused</div>
              <div className="text-sm text-gray-300 mt-2">Use the toggle button to resume monitoring</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
