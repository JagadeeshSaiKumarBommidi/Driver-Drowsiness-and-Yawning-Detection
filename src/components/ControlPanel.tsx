import { Settings, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { AlertConfig, AlertHistory } from '../types/detection';

interface ControlPanelProps {
  alertConfig: AlertConfig;
  onConfigChange: (config: AlertConfig) => void;
  alertHistory: AlertHistory[];
}

export function ControlPanel({ alertConfig, onConfigChange, alertHistory }: ControlPanelProps) {

  const recentAlerts = alertHistory.slice(-5).reverse();

  return (
    <div className="space-y-6">
      {/* Current Settings */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">Detection Settings</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Eye Aspect Ratio Threshold
            </label>
            <input
              type="range"
              min="0.15"
              max="0.35"
              step="0.01"
              value={alertConfig.earThreshold}
              onChange={(e) => onConfigChange({
                ...alertConfig,
                earThreshold: parseFloat(e.target.value)
              })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-sm text-gray-500 mt-1">
              Current: {alertConfig.earThreshold.toFixed(2)} (Lower = more sensitive)
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mouth Opening Threshold
            </label>
            <input
              type="range"
              min="0.03"
              max="0.08"
              step="0.005"
              value={alertConfig.mouthThreshold}
              onChange={(e) => onConfigChange({
                ...alertConfig,
                mouthThreshold: parseFloat(e.target.value)
              })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-sm text-gray-500 mt-1">
              Current: {alertConfig.mouthThreshold.toFixed(3)} (Higher = more sensitive)
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Consecutive Frames Required
            </label>
            <input
              type="range"
              min="3"
              max="15"
              step="1"
              value={alertConfig.consecutiveFrames}
              onChange={(e) => onConfigChange({
                ...alertConfig,
                consecutiveFrames: parseInt(e.target.value)
              })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-sm text-gray-500 mt-1">
              Current: {alertConfig.consecutiveFrames} frames (~{(alertConfig.consecutiveFrames * 0.033).toFixed(1)}s)
            </div>
          </div>
        </div>
      </div>

      {/* Alert Options */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">Alert Options</h3>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={alertConfig.soundEnabled}
              onChange={(e) => onConfigChange({
                ...alertConfig,
                soundEnabled: e.target.checked
              })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div className="flex items-center gap-2">
              {alertConfig.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="text-sm font-medium text-gray-700">Sound Alerts</span>
            </div>
          </label>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
        {recentAlerts.length > 0 ? (
          <div className="space-y-2">
            {recentAlerts.map((alert, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    alert.type === 'drowsiness' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></div>
                  <span className="text-sm font-medium capitalize">{alert.type}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No alerts yet</p>
        )}
      </div>
    </div>
  );
}