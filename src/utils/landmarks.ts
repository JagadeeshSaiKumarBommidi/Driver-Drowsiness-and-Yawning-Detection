import { NormalizedLandmarkList } from '@mediapipe/face_mesh';

// Eye landmark indices for MediaPipe Face Mesh
const LEFT_EYE_INDICES = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
const RIGHT_EYE_INDICES = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];

// Specific indices for EAR calculation
const LEFT_EYE_EAR_INDICES = [33, 160, 158, 133, 153, 144];
const RIGHT_EYE_EAR_INDICES = [362, 385, 387, 263, 373, 380];

// Mouth landmark indices
const MOUTH_INDICES = [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95];

export function calculateEAR(eyeLandmarks: Array<{ x: number; y: number }>): number {
  if (eyeLandmarks.length < 6) return 0;

  // Calculate distances
  const p1 = eyeLandmarks[1]; // Top of eye
  const p2 = eyeLandmarks[5]; // Bottom of eye
  const p3 = eyeLandmarks[2]; // Top of eye (second point)
  const p4 = eyeLandmarks[4]; // Bottom of eye (second point)
  const p5 = eyeLandmarks[0]; // Left corner
  const p6 = eyeLandmarks[3]; // Right corner

  // Vertical distances
  const d1 = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
  const d2 = Math.sqrt((p3.x - p4.x) ** 2 + (p3.y - p4.y) ** 2);
  
  // Horizontal distance
  const d3 = Math.sqrt((p5.x - p6.x) ** 2 + (p5.y - p6.y) ** 2);

  // EAR formula
  return (d1 + d2) / (2.0 * d3);
}

export function calculateMouthRatio(mouthLandmarks: Array<{ x: number; y: number }>): number {
  if (mouthLandmarks.length < 20) {
    console.log(`❌ Insufficient mouth landmarks: ${mouthLandmarks.length}`);
    return 0;
  }

  // Use more accurate mouth landmarks for yawn detection
  // Upper lip center and lower lip center for height
  const upperLipCenter = mouthLandmarks[13]; // Upper lip center
  const lowerLipCenter = mouthLandmarks[19]; // Lower lip center
  
  // Mouth corners for width
  const leftCorner = mouthLandmarks[0];   // Left corner
  const rightCorner = mouthLandmarks[10]; // Right corner

  // Calculate vertical mouth opening (height) - use simple distance for more accuracy
  const height = Math.abs(upperLipCenter.y - lowerLipCenter.y);
  
  // Calculate horizontal mouth width
  const width = Math.abs(rightCorner.x - leftCorner.x);

  // Prevent division by zero
  if (width === 0) return 0;

  const ratio = height / width;
  
  // Add validation to prevent false positives
  // Normal talking/breathing should not exceed certain thresholds
  const isValidYawn = height > 0.01 && width > 0.02 && ratio < 0.15;
  const finalRatio = isValidYawn ? ratio : 0;
  
  // Debug logging for mouth ratio calculation with validation
  if (Math.random() < 0.1) { // Log 10% of calculations for debugging
    console.log(`👄 Mouth: height=${height.toFixed(4)}, width=${width.toFixed(4)}, ratio=${ratio.toFixed(4)}, valid=${isValidYawn}, final=${finalRatio.toFixed(4)}`);
  }

  return finalRatio;
}

export function extractEyeLandmarks(landmarks: NormalizedLandmarkList) {
  const leftEye = LEFT_EYE_EAR_INDICES.map(index => ({
    x: landmarks[index].x,
    y: landmarks[index].y
  }));

  const rightEye = RIGHT_EYE_EAR_INDICES.map(index => ({
    x: landmarks[index].x,
    y: landmarks[index].y
  }));

  return { left: leftEye, right: rightEye };
}

export function extractMouthLandmarks(landmarks: NormalizedLandmarkList) {
  const mouth = MOUTH_INDICES.map(index => ({
    x: landmarks[index].x,
    y: landmarks[index].y
  }));

  return { points: mouth };
}