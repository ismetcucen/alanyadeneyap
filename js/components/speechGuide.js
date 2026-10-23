/**
 * Türkçe Sesli Rehber ve Altyazı Asistanı Bileşeni (Web Speech API)
 * Referans Tasarım: yapayzekaokulum.com/atolye
 */
import { audioSynth } from './audioSynth.js';

export class SpeechGuide {
  constructor(containerId = 'altyazi') {
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
    this.bindEvents();
  }

  initVoice() {
    if (!this.synth) return;
    const loadVoices = () => {
      const voices = this.synth.getVoices();
      this.voice = voices.find(v => v.lang.startsWith('tr')) || null;
    };
    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  bindEvents() {
    const replayBtn = document.getElementById('anlatim-tekrar');
    replayBtn?.addEventListener('click', () => {
      if (this.currentText) {
        this.speak(this.currentText, true);
        audioSynth.playClick();
      }
    });

    const muteBtn = document.getElementById('anlatim-ses');
    if (muteBtn) {
      muteBtn.classList.toggle('muted', !this.enabled);
      muteBtn.addEventListener('click', () => {
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
  }

  speak(text, force = false) {
    if (!text) return;
    this.currentText = text;

    // Altyazı metnini güncelle
    const subtitleEl = document.getElementById('altyazi-metin');
    if (subtitleEl) {
      subtitleEl.textContent = text;
    }

    if (!this.enabled && !force) return;
    if (!this.synth) return;

    this.synth.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'tr-TR';
    utter.rate = 1.05;
    utter.pitch = 1.0;
    if (this.voice) utter.voice = this.voice;

    const altyaziEl = document.getElementById('altyazi');

    utter.onstart = () => {
      this.isPlaying = true;
      if (altyaziEl) altyaziEl.classList.add('konusuyor');
    };

    utter.onend = () => {
      this.isPlaying = false;
      if (altyaziEl) altyaziEl.classList.remove('konusuyor');
    };

    utter.onerror = () => {
      this.isPlaying = false;
      if (altyaziEl) altyaziEl.classList.remove('konusuyor');
    };

    try {
      this.synth.speak(utter);
    } catch (e) {}
  }
}
