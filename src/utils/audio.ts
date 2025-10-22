type AlertType = 'drowsy' | 'yawn';
type RiskLevel = 'moderate' | 'high';

class AudioAlertSystem {
  private audioContext: AudioContext | null = null;
  private alertSounds: Map<string, AudioBuffer> = new Map();
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      await this.createAllAlertSounds();
      this.isInitialized = true;
      console.log('🔊 Audio system initialized with multi-level alerts');
    } catch (error) {
      console.error('Failed to initialize audio system:', error);
    }
  }

  private async createAllAlertSounds() {
    if (!this.audioContext) return;

    // Create different sounds for different alert types and risk levels
    await this.createAlertSound('drowsy-moderate', 600, 0.4, 0.3); // Lower pitch, shorter, quieter
    await this.createAlertSound('drowsy-high', 900, 0.8, 0.6);     // Higher pitch, longer, louder
    await this.createAlertSound('yawn-moderate', 500, 0.3, 0.25);  // Lower pitch, shorter, quieter  
    await this.createAlertSound('yawn-high', 800, 0.6, 0.5);       // Higher pitch, longer, louder
  }

  private async createAlertSound(key: string, frequency: number, duration: number, volume: number) {
    if (!this.audioContext) return;

    const sampleRate = this.audioContext.sampleRate;
    const arrayBuffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const channelData = arrayBuffer.getChannelData(0);

    for (let i = 0; i < channelData.length; i++) {
      const t = i / sampleRate;
      // Create a beep with fade in/out envelope
      const envelope = Math.sin(Math.PI * t / duration);
      channelData[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * volume;
    }

    this.alertSounds.set(key, arrayBuffer);
  }

  async playAlert(type: AlertType = 'drowsy', riskLevel: RiskLevel = 'moderate') {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.audioContext) return;

    const soundKey = `${type}-${riskLevel}`;
    const alertSound = this.alertSounds.get(soundKey);
    
    if (!alertSound) {
      console.warn(`Alert sound not found for ${soundKey}`);
      return;
    }

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = alertSound;
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Volume already set in the buffer creation, but can adjust here if needed
      gainNode.gain.setValueAtTime(1.0, this.audioContext.currentTime);

      source.start();
      
      console.log(`🔊 Playing ${riskLevel} risk ${type} alert`);
    } catch (error) {
      console.error('Failed to play alert sound:', error);
    }
  }

  async playSequence(type: AlertType = 'drowsy', riskLevel: RiskLevel = 'high', count: number = 3) {
    console.log(`🚨 Playing ${count} ${riskLevel} risk ${type} alerts`);
    for (let i = 0; i < count; i++) {
      await this.playAlert(type, riskLevel);
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, riskLevel === 'high' ? 300 : 200));
      }
    }
  }
}

export const audioAlert = new AudioAlertSystem();