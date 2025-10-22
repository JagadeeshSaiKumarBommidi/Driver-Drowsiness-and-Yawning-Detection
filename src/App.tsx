import { useState, useEffect } from 'react';
import { Shield, Eye, Settings, BarChart3, Play, Square } from 'lucide-react';
import { useMediaPipe } from './hooks/useMediaPipe';
import { CameraView } from './components/CameraView';
import { ControlPanel } from './components/ControlPanel';
import { Statistics } from './components/Statistics';
import { AlertConfig } from './types/detection';

function Dashboard() {
  const [activeTab, setActiveTab] = useState<'camera' | 'settings' | 'stats'>('camera');
  const [isDetectionEnabled, setIsDetectionEnabled] = useState(true); // Start with detection ON
  const [showToggleNotification, setShowToggleNotification] = useState(false);
  
  console.log(`📊 Dashboard render - isDetectionEnabled: ${isDetectionEnabled}`);
  
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    earThreshold: 0.25,        // Change from 0.30
    mouthThreshold: 0.080,     // Change from 0.035
    consecutiveFrames: 5,      // Change from 8
    soundEnabled: true
  });

  const { 
    videoRef, 
    canvasRef, 
    isInitialized, 
    currentResult, 
    detectionResults, 
    alertHistory 
  } = useMediaPipe(alertConfig, isDetectionEnabled);

  const handleToggleDetection = () => {
    const newState = !isDetectionEnabled;
    console.log(`🎛️ App.tsx: Toggle clicked - ${isDetectionEnabled} → ${newState}`);
    setIsDetectionEnabled(newState);
    
    // Show notification
    setShowToggleNotification(true);
    setTimeout(() => setShowToggleNotification(false), 2000);
    
    // Provide console feedback
    if (newState) {
      console.log('🟢 App.tsx: Detection STARTED - Monitoring for drowsiness and yawning');
    } else {
      console.log('🔴 App.tsx: Detection STOPPED - AI monitoring paused');
    }
  };

  // Add keyboard shortcut for toggling detection (Space bar)
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !event.ctrlKey && !event.altKey && !event.shiftKey) {
        // Only trigger if not typing in an input field
        const activeElement = document.activeElement;
        if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
          event.preventDefault();
          handleToggleDetection();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleToggleDetection]); // Fixed dependency

  const tabs = [
    { id: 'camera', label: 'Live Feed', icon: Eye },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'stats', label: 'Statistics', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Toggle Notification */}
      {showToggleNotification && (
        <div className="fixed top-4 right-4 z-50 animate-notification-fade">
          <div className={`px-4 py-2 rounded-lg shadow-lg text-white font-medium ${
            isDetectionEnabled ? 'bg-green-600' : 'bg-red-600'
          }`}>
            {isDetectionEnabled ? '🟢 Detection Started' : '🔴 Detection Stopped'}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Driver Safety Monitor
                </h1>
                <p className="text-sm text-gray-500">
                  AI-Powered Drowsiness Detection System
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Press Spacebar or use the toggle button to control detection
                </p>
              </div>
            </div>

            {/* Detection Status and Toggle */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    !isInitialized ? 'bg-yellow-500 animate-pulse' : 
                    !isDetectionEnabled ? 'bg-gray-500' : 'bg-green-500 animate-pulse'
                }`}></div>
                <span className="text-sm font-medium text-gray-700">
                    {!isInitialized ? 'Initializing...' : 
                     !isDetectionEnabled ? 'Detection Paused' : 'System Active'}
                </span>
                {isDetectionEnabled && isInitialized && (
                  <div className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                    LIVE
                  </div>
                )}
              </div>
              
              {/* Dedicated Detection Toggle Button */}
              <button
                onClick={handleToggleDetection}
                className={`px-4 py-2 rounded-lg font-semibold shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2 ${
                  isDetectionEnabled 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isDetectionEnabled ? (
                  <>
                    <Square className="w-4 h-4" />
                    Stop Detection
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Start Detection
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Primary Content */}
          <div className="lg:col-span-2">
            {activeTab === 'camera' && (
              <CameraView
                videoRef={videoRef}
                canvasRef={canvasRef}
                currentResult={currentResult}
                isInitialized={isInitialized}
                isDetectionEnabled={isDetectionEnabled}
              />
            )}
            
            {activeTab === 'settings' && (
              <div className="bg-gray-50 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">System Configuration</h2>
                <ControlPanel
                  alertConfig={alertConfig}
                  onConfigChange={setAlertConfig}
                  alertHistory={alertHistory}
                />
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="bg-gray-50 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics Dashboard</h2>
                <Statistics
                  detectionResults={detectionResults}
                  alertHistory={alertHistory}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {activeTab === 'camera' && (
              <>
                <Statistics
                  detectionResults={detectionResults}
                  alertHistory={alertHistory}
                />
              </>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Tips</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="font-medium text-blue-800">EAR Threshold (Currently: {alertConfig.earThreshold})</div>
                    <div>Lower values = more sensitive to drowsiness detection</div>
                    <div className="text-xs mt-1">Range: 0.15-0.30 (Recommended: 0.25)</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="font-medium text-purple-800">Mouth Threshold (Currently: {alertConfig.mouthThreshold})</div>
                    <div>Higher values = more sensitive to yawning detection</div>
                    <div className="text-xs mt-1">Range: 0.04-0.08 (Recommended: 0.055)</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="font-medium text-green-800">Frame Count (Currently: {alertConfig.consecutiveFrames})</div>
                    <div>Higher values = fewer false alarms but slower detection</div>
                    <div className="text-xs mt-1">Range: 3-15 frames (Recommended: 6)</div>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="font-medium text-yellow-800">Toggle Detection</div>
                    <div>Press Spacebar or use the Start/Stop button</div>
                    <div className="text-xs mt-1">Check browser console for real-time threshold values</div>
                  </div>
                </div>
              </div>
            )}

            {/* For settings and stats show a compact camera preview */}
            {(activeTab === 'settings' || activeTab === 'stats') && (
              <div>
                <CameraView
                  videoRef={videoRef}
                  canvasRef={canvasRef}
                  currentResult={currentResult}
                  isInitialized={isInitialized}
                  isDetectionEnabled={isDetectionEnabled}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-500">
            <p>Driver Safety Monitor - Powered by MediaPipe & AI</p>
            <p className="mt-1">⚠️ This system is a safety aid and should not replace attentive driving</p>
            <p className="mt-1 text-xs">💡 Use Spacebar or the dedicated toggle button to control detection</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return <Dashboard />;
}

export default App;
