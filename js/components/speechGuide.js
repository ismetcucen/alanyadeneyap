/**
 * Türkçe Sesli Rehber ve Altyazı Asistanı Bileşeni (Web Speech API)
 */
import { audioSynth } from './audioSynth.js';

export class SpeechGuide {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voice = null;
    this.enabled = true;
    this.isPlaying = false;
    this.currentText = '';

    try {
      this.enabled = localStorage.getItem('deneyap_voice_enabled') !== 'false';
    } catch (e) {}

    this.initVoice();
    this.initDOM();
  }

  initVoice() {
    if (!this.synth) return;
    const loadVoices = () => {
      const voices = this.synth.getVoices();
      // Türkçe ses ara
      this.voice = voices.find(v => v.lang.startsWith('tr')) || null;
    };
    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  initDOM() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="speech-guide-banner" id="sg-banner">
        <div class="sg-avatar">
          <span class="avatar-face">🤖</span>
          <span class="avatar-wave"></span>
        </div>
        <div class="sg-content">
          <span class="sg-tag">SESLİ ASİSTAN</span>
          <p class="sg-subtitle" id="sg-subtitle">Deneyap Atölyesine hoş geldiniz! Başlamak için bir ders veya sensör seçin.</p>
        </div>
        <div class="sg-controls">
          <button class="sg-btn" id="sg-btn-replay" title="Tekrar Dinle" aria-label="Tekrar Dinle">
            <svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" /></svg>
          </button>
          <button class="sg-btn ${this.enabled ? '' : 'muted'}" id="sg-btn-mute" title="Sesi Aç/Kapat" aria-label="Sesi Aç/Kapat">
            <svg viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>
          </button>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    if (!this.container) return;

    this.container.querySelector('#sg-btn-replay')?.addEventListener('click', () => {
      if (this.currentText) {
        this.speak(this.currentText, true);
        audioSynth.playClick();
      }
    });

    const muteBtn = this.container.querySelector('#sg-btn-mute');
    muteBtn?.addEventListener('click', () => {
      this.enabled = !this.enabled;
      muteBtn.classList.toggle('muted', !this.enabled);
      try {
        localStorage.setItem('deneyap_voice_enabled', this.enabled);
      } catch (e) {}
      if (!this.enabled && this.synth) {
        this.synth.cancel();
      }
      audioSynth.playClick();
    });
  }

  /**
   * Yeni bir anlatım metnini altyazıya yansıtır ve Türkçe seslendirir
   */
  speak(text, force = false) {
    if (!text) return;
    this.currentText = text;

    // Altyazı metnini güncelle
    const subtitleEl = this.container?.querySelector('#sg-subtitle');
    if (subtitleEl) {
      subtitleEl.textContent = text;
      subtitleEl.classList.remove('anim-flash');
      void subtitleEl.offsetWidth; // Reflow
      subtitleEl.classList.add('anim-flash');
    }

    if (!this.enabled && !force) return;
    if (!this.synth) return;

    // Önceki konuşmayı kes
    this.synth.cancel();

    // Yeni konuşma üret
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'tr-TR';
    utter.rate = 1.05; // Doğal ve dinamik hız
    utter.pitch = 1.0;
    if (this.voice) utter.voice = this.voice;

    const banner = this.container?.querySelector('#sg-banner');

    utter.onstart = () => {
      this.isPlaying = true;
      if (banner) banner.classList.add('speaking');
    };

    utter.onend = () => {
      this.isPlaying = false;
      if (banner) banner.classList.remove('speaking');
    };

    utter.onerror = () => {
      this.isPlaying = false;
      if (banner) banner.classList.remove('speaking');
    };

    try {
      this.synth.speak(utter);
    } catch (e) {}
  }
}
