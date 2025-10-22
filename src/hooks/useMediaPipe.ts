import { useEffect, useRef, useState } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import { DetectionResult, AlertConfig, AlertHistory } from '../types/detection';
import { extractEyeLandmarks, extractMouthLandmarks, calculateEAR, calculateMouthRatio } from '../utils/landmarks';
import { audioAlert } from '../utils/audio';

export function useMediaPipe(alertConfig: AlertConfig, isDetectionEnabled: boolean = true) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceMeshRef = useRef<FaceMesh | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [detectionResults, setDetectionResults] = useState<DetectionResult[]>([]);
  const [currentResult, setCurrentResult] = useState<DetectionResult | null>(null);
  const [alertHistory, setAlertHistory] = useState<AlertHistory[]>([]);
  
  const drowsyFrameCount = useRef(0);
  const yawnFrameCount = useRef(0);
  const lastYawnAlert = useRef(0); // Cooldown for yawn alerts
  const lastDrowsyAlert = useRef(0); // Cooldown for drowsy alerts
  const isDetectionEnabledRef = useRef(isDetectionEnabled);

  console.log(`🔍 useMediaPipe hook called with isDetectionEnabled: ${isDetectionEnabled}`);

  // Update detection enabled ref when prop changes
  useEffect(() => {
    const wasEnabled = isDetectionEnabledRef.current;
    isDetectionEnabledRef.current = isDetectionEnabled;
    
    console.log(`🔄 Detection state changed: ${wasEnabled} → ${isDetectionEnabled}`);
    
    // Reset frame counters when detection is toggled
    if (wasEnabled !== isDetectionEnabled) {
      drowsyFrameCount.current = 0;
      yawnFrameCount.current = 0;
      lastYawnAlert.current = 0; // Reset yawn cooldown
      console.log('🔢 Frame counters and cooldowns reset');
      
      // When re-enabling detection, don't clear the current result immediately
      // It will be updated naturally by the next frame processing
      if (!isDetectionEnabled) {
        console.log('⏸️ Detection stopped - clearing current result');
        setCurrentResult(null);
      } else {
        console.log('▶️ Detection started - ready to process frames');
      }
    }
  }, [isDetectionEnabled]);

  useEffect(() => {
    initializeMediaPipe();
    return () => {
      cleanup();
    };
  }, []);

  const initializeMediaPipe = async () => {
    try {
      console.log('🔄 Starting MediaPipe initialization...');
      if (!videoRef.current || !canvasRef.current) {
        console.log('❌ Video or canvas ref not available');
        return;
      }

      // Initialize audio system
      console.log('🔊 Initializing audio system...');
      await audioAlert.initialize();

      // Initialize MediaPipe Face Mesh
      console.log('🧠 Initializing MediaPipe Face Mesh...');
      const faceMesh = new FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      faceMesh.onResults(onResults);

      // Initialize camera
      console.log('📹 Initializing camera...');
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (faceMeshRef.current && videoRef.current) {
            await faceMeshRef.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480
      });

      faceMeshRef.current = faceMesh;
      cameraRef.current = camera;

      console.log('📹 Starting camera...');
      await camera.start();
      console.log('✅ MediaPipe initialization complete!');
      setIsInitialized(true);

    } catch (error) {
      console.error('❌ Failed to initialize MediaPipe:', error);
    }
  };

  const onResults = (results: any) => {
    if (!canvasRef.current) {
      console.log('❌ Canvas ref not available');
      return;
    }
    
    if (!results.multiFaceLandmarks) {
      console.log('👤 No face landmarks detected');
      return;
    }

    console.log(`👤 Face detected with ${results.multiFaceLandmarks.length} face(s)`);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];
      
      // Extract landmarks
      const eyeLandmarks = extractEyeLandmarks(landmarks);
      const mouthLandmarks = extractMouthLandmarks(landmarks);

      // Calculate ratios
      const leftEAR = calculateEAR(eyeLandmarks.left);
      const rightEAR = calculateEAR(eyeLandmarks.right);
      const avgEAR = (leftEAR + rightEAR) / 2;
      const mouthRatio = calculateMouthRatio(mouthLandmarks.points);

      // Always log current values for debugging
      console.log(`👁️ EAR: ${avgEAR.toFixed(3)} (threshold: ${alertConfig.earThreshold}) ${avgEAR < alertConfig.earThreshold ? '😴 DROWSY!' : '👁️ awake'} | 👄 Mouth: ${mouthRatio.toFixed(3)} (threshold: ${alertConfig.mouthThreshold}) ${mouthRatio > alertConfig.mouthThreshold ? '🥱 YAWN!' : '😐 normal'}`);
      
      // Detect drowsiness and yawning only if detection is enabled
      // Simplified logic for maximum sensitivity
      const isDrowsy = isDetectionEnabledRef.current && avgEAR < alertConfig.earThreshold;
      const isYawning = isDetectionEnabledRef.current && mouthRatio > alertConfig.mouthThreshold;
      
      // Show detection state
      console.log(`🔍 Detection: Eyes=${isDrowsy ? 'DROWSY' : 'OK'}, Mouth=${isYawning ? 'YAWNING' : 'OK'}, Enabled=${isDetectionEnabledRef.current}`);

      // Count consecutive frames with detailed debugging
      if (isDrowsy) {
        drowsyFrameCount.current++;
        console.log(`😴 Drowsy frame ${drowsyFrameCount.current}/${alertConfig.consecutiveFrames}`);
      } else {
        if (drowsyFrameCount.current > 0) {
          console.log(`👁️ Eyes opened - reset drowsy count from ${drowsyFrameCount.current}`);
        }
        drowsyFrameCount.current = 0;
      }

      if (isYawning) {
        yawnFrameCount.current++;
        console.log(`🥱 Yawn frame ${yawnFrameCount.current}/${alertConfig.consecutiveFrames}`);
      } else {
        if (yawnFrameCount.current > 0) {
          console.log(`😐 Mouth closed - reset yawn count from ${yawnFrameCount.current}`);
        }
        yawnFrameCount.current = 0;
      }

      // Create detection result with proper state handling
      const result: DetectionResult = {
        leftEAR,
        rightEAR,
        avgEAR,
        mouthRatio,
        isDrowsy: isDetectionEnabledRef.current && drowsyFrameCount.current >= alertConfig.consecutiveFrames,
        isYawning: isDetectionEnabledRef.current && yawnFrameCount.current >= alertConfig.consecutiveFrames,
        timestamp: Date.now()
      };

      // Trigger alerts only if detection is enabled with risk level assessment
      if (result.isDrowsy && alertConfig.soundEnabled && isDetectionEnabledRef.current) {
        const now = Date.now();
        const consecutiveFrames = drowsyFrameCount.current;
        
        // Add cooldown for drowsiness alerts (3 seconds)
        if (now - lastDrowsyAlert.current > 3000) {
          let riskLevel: 'moderate' | 'high' = 'moderate';
          
          // Determine risk level based on consecutive frames
          if (consecutiveFrames >= alertConfig.consecutiveFrames * 2) {
            riskLevel = 'high';
          } else if (consecutiveFrames >= alertConfig.consecutiveFrames) {
            riskLevel = 'moderate';
          }
          
          console.log(`🚨 DROWSINESS ALERT TRIGGERED! Frame count: ${consecutiveFrames}, Risk Level: ${riskLevel.toUpperCase()}`);
          audioAlert.playAlert('drowsy', riskLevel);
          setAlertHistory(prev => [...prev, { 
            type: 'drowsiness', 
            timestamp: Date.now(),
            riskLevel 
          }]);
          lastDrowsyAlert.current = now;
        } else {
          console.log(`⏰ Drowsiness detected but cooldown active (${((now - lastDrowsyAlert.current) / 1000).toFixed(1)}s ago)`);
        }
      }
      
      if (result.isYawning && alertConfig.soundEnabled && isDetectionEnabledRef.current) {
        const now = Date.now();
        const consecutiveFrames = yawnFrameCount.current;
        
        // Increased cooldown to 4 seconds to prevent false positives
        if (now - lastYawnAlert.current > 4000) {
          let riskLevel: 'moderate' | 'high' = 'moderate';
          
          // Determine risk level based on consecutive frames
          if (consecutiveFrames >= alertConfig.consecutiveFrames * 2) {
            riskLevel = 'high';
          } else if (consecutiveFrames >= alertConfig.consecutiveFrames) {
            riskLevel = 'moderate';
          }
          
          console.log(`🚨 YAWNING ALERT TRIGGERED! Frame count: ${consecutiveFrames}, Risk Level: ${riskLevel.toUpperCase()}`);
          audioAlert.playAlert('yawn', riskLevel);
          setAlertHistory(prev => [...prev, { 
            type: 'yawning', 
            timestamp: Date.now(),
            riskLevel 
          }]);
          lastYawnAlert.current = now;
        } else {
          console.log(`⏰ Yawn detected but cooldown active (${((now - lastYawnAlert.current) / 1000).toFixed(1)}s ago)`);
        }
      }

      // Always update current result for UI display
      setCurrentResult(result);
      
      // Only update detection results history when detection is enabled
      if (isDetectionEnabledRef.current) {
        setDetectionResults(prev => [...prev.slice(-100), result]); // Keep last 100 results
      }

      // Draw landmarks and indicators
      drawLandmarks(ctx, canvas, eyeLandmarks, mouthLandmarks, result);
    } else {
      // No face detected - clear current result if detection is enabled, keep if disabled
      if (isDetectionEnabledRef.current) {
        setCurrentResult(null);
      }
    }
  };

  const drawLandmarks = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    eyeLandmarks: any,
    mouthLandmarks: any,
    result: DetectionResult
  ) => {
    const width = canvas.width;
    const height = canvas.height;

    // Draw eye landmarks
    ctx.fillStyle = result.isDrowsy ? '#ef4444' : '#10b981';
    eyeLandmarks.left.forEach((point: any) => {
      ctx.beginPath();
      ctx.arc(point.x * width, point.y * height, 2, 0, 2 * Math.PI);
      ctx.fill();
    });

    eyeLandmarks.right.forEach((point: any) => {
      ctx.beginPath();
      ctx.arc(point.x * width, point.y * height, 2, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw mouth landmarks
    ctx.fillStyle = result.isYawning ? '#f59e0b' : '#10b981';
    mouthLandmarks.points.forEach((point: any) => {
      ctx.beginPath();
      ctx.arc(point.x * width, point.y * height, 2, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw status text
    ctx.font = '16px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;

    const status = !isDetectionEnabledRef.current ? 'PAUSED' : 
                   result.isDrowsy ? 'DROWSY!' : 
                   result.isYawning ? 'YAWNING!' : 'ALERT';
    const statusColor = !isDetectionEnabledRef.current ? '#6b7280' :
                        result.isDrowsy ? '#ef4444' : 
                        result.isYawning ? '#f59e0b' : '#10b981';

    ctx.strokeText(status, 10, 30);
    ctx.fillStyle = statusColor;
    ctx.fillText(status, 10, 30);

    // Show metrics only when detection is enabled
    if (isDetectionEnabledRef.current) {
      // Draw EAR and mouth ratio
      ctx.fillStyle = '#ffffff';
      ctx.strokeText(`EAR: ${result.avgEAR.toFixed(3)}`, 10, 60);
      ctx.fillText(`EAR: ${result.avgEAR.toFixed(3)}`, 10, 60);
      
      ctx.strokeText(`Mouth: ${result.mouthRatio.toFixed(3)}`, 10, 90);
      ctx.fillText(`Mouth: ${result.mouthRatio.toFixed(3)}`, 10, 90);
    } else {
      // Show paused message
      ctx.fillStyle = '#9ca3af';
      ctx.strokeText('Detection Paused', 10, 60);
      ctx.fillText('Detection Paused', 10, 60);
    }
  };

  const cleanup = () => {
    if (cameraRef.current) {
      cameraRef.current.stop();
    }
  };

  return {
    videoRef,
    canvasRef,
    isInitialized,
    currentResult,
    detectionResults,
    alertHistory
  };
}