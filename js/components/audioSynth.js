/**
 * Web Audio API Ses Sentezleyici
 * Buzzer tonları, arayüz tıklamaları ve görev tamamlama sesleri üretir.
 */
class AudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.activeOscillator = null;
    this.activeGain = null;
    this.muted = false;
    
    // Ses tercihini localStorage'dan yükle
    try {
      this.muted = localStorage.getItem('deneyap_muted') === 'true';
    } catch (e) {}
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  isMuted() {
    return this.muted;
  }

  setMuted(state) {
    this.muted = !!state;
    try {
      localStorage.setItem('deneyap_muted', this.muted);
    } catch (e) {}
    if (this.muted) {
      this.stopTone();
    }
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  /**
   * Piezo Buzzer için sürekli veya süreli frekans çalar
   */
  playTone(freq = 440, durationMs = null) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    // Halihazırda çalan varsa durdur
    this.stopTone();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square'; // Buzzer piezo kare dalga karakteristiği
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    // Hafif yumuşatma ile patlama sesini önle
    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, this.ctx.currentTime + 0.02);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    this.activeOscillator = osc;
    this.activeGain = gain;

    if (durationMs && durationMs > 0) {
      setTimeout(() => {
        if (this.activeOscillator === osc) {
          this.stopTone();
        }
      }, durationMs);
    }
  }

  /**
   * Çalan buzzer sesini susturur (noTone)
   */
  stopTone() {
    if (this.activeGain && this.ctx) {
      try {
        this.activeGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.03);
      } catch (e) {}
    }
    setTimeout(() => {
      if (this.activeOscillator) {
        try {
          this.activeOscillator.stop();
          this.activeOscillator.disconnect();
        } catch (e) {}
        this.activeOscillator = null;
        this.activeGain = null;
      }
    }, 35);
  }

  /**
   * Düğme tıklama sesi
   */
  playClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  /**
   * Adım ve kablo takma sesi
   */
  playSnap() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(840, this.ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.07);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  /**
   * Görev tamamlama zafer melodisi
   */
  playSuccess() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // Do5, Mi5, Sol5, Do6
    notes.forEach((freq, i) => {
      setTimeout(() => {
        if (this.muted || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.28);
      }, i * 90);
    });
  }
}

export const audioSynth = new AudioSynthesizer();
