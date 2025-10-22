import React from 'react';
import { BarChart3, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { DetectionResult, AlertHistory } from '../types/detection';

interface StatisticsProps {
  detectionResults: DetectionResult[];
  alertHistory: AlertHistory[];
}

export function Statistics({ detectionResults, alertHistory }: StatisticsProps) {
  const recentResults = detectionResults.slice(-60); // Last 2 seconds at 30fps
  
  const stats = {
    avgEAR: recentResults.length > 0 
      ? recentResults.reduce((sum, r) => sum + r.avgEAR, 0) / recentResults.length 
      : 0,
    avgMouth: recentResults.length > 0 
      ? recentResults.reduce((sum, r) => sum + r.mouthRatio, 0) / recentResults.length 
      : 0,
    drowsyEvents: alertHistory.filter(a => a.type === 'drowsiness').length,
    yawnEvents: alertHistory.filter(a => a.type === 'yawning').length,
  };

  const getAlertLevel = () => {
    if (stats.avgEAR < 0.2) return { level: 'High Risk', color: 'text-red-600 bg-red-50' };
    if (stats.avgEAR < 0.25) return { level: 'Moderate Risk', color: 'text-yellow-600 bg-yellow-50' };
    return { level: 'Low Risk', color: 'text-green-600 bg-green-50' };
  };

  const alertLevel = getAlertLevel();

  return (
    <div className="space-y-6">
      {/* Real-time Stats */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">Real-time Statistics</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.avgEAR.toFixed(3)}</div>
            <div className="text-sm text-blue-800">Avg Eye Aspect Ratio</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.avgMouth.toFixed(3)}</div>
            <div className="text-sm text-purple-800">Avg Mouth Opening</div>
          </div>
        </div>
      </div>

      {/* Alert Summary */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">Session Summary</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="font-medium">Drowsiness Events</span>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-red-600">{stats.drowsyEvents}</span>
              <div className="text-xs text-gray-500">
                High: {alertHistory.filter(a => a.type === 'drowsiness' && a.riskLevel === 'high').length} | 
                Moderate: {alertHistory.filter(a => a.type === 'drowsiness' && a.riskLevel === 'moderate').length}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="font-medium">Yawning Events</span>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-yellow-600">{stats.yawnEvents}</span>
              <div className="text-xs text-gray-500">
                High: {alertHistory.filter(a => a.type === 'yawning' && a.riskLevel === 'high').length} | 
                Moderate: {alertHistory.filter(a => a.type === 'yawning' && a.riskLevel === 'moderate').length}
              </div>
            </div>
          </div>

          {/* Recent Alerts with Risk Levels */}
          {alertHistory.length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Recent Alerts:</div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {alertHistory.slice(-5).reverse().map((alert, index) => (
                  <div key={index} className="text-xs p-2 bg-gray-50 rounded flex justify-between items-center">
                    <span className={`font-medium ${alert.type === 'drowsiness' ? 'text-red-600' : 'text-yellow-600'}`}>
                      {alert.type === 'drowsiness' ? '😴' : '🥱'} {alert.type}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        alert.riskLevel === 'high' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {alert.riskLevel?.toUpperCase() || 'MODERATE'} RISK
                      </span>
                      <span className="text-gray-500">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">Risk Assessment</h3>
        </div>

        <div className={`p-4 rounded-lg ${alertLevel.color}`}>
          <div className="text-center">
            <div className="text-lg font-semibold">{alertLevel.level}</div>
            <div className="text-sm mt-1">
              Based on recent eye aspect ratio: {stats.avgEAR.toFixed(3)}
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4" />
            <span>Session Duration: {Math.floor(detectionResults.length / 30)} seconds</span>
          </div>
          <div className="text-xs text-gray-500">
            * Risk assessment based on average EAR over last 2 seconds
          </div>
        </div>
      </div>

      {/* EAR Trend Visualization */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">EAR Trend (Last 30 readings)</h3>
        <div className="h-24 flex items-end gap-1">
          {recentResults.slice(-30).map((result, index) => {
            const height = Math.max((result.avgEAR / 0.4) * 100, 5);
            const color = result.avgEAR < 0.2 ? 'bg-red-500' : 
                         result.avgEAR < 0.25 ? 'bg-yellow-500' : 'bg-green-500';
            
            return (
              <div
                key={index}
                className={`flex-1 ${color} transition-all duration-200`}
                style={{ height: `${height}%` }}
                title={`EAR: ${result.avgEAR.toFixed(3)}`}
              ></div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Older</span>
          <span>Newer</span>
        </div>
      </div>
    </div>
  );
}