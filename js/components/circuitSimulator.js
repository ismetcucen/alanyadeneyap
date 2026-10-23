/**
 * İnteraktif Devre ve Breadboard Simülatörü
 * Bileşenler: LED'ler, RGB, Buton, Potansiyometre, Buzzer, 128x64 OLED Ekran, IMU Su Terazisi, LDR, Ultrasonik
 */
import { audioSynth } from './audioSynth.js';

export class CircuitSimulator {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = options;
    this.currentLesson = null;
    this.mode = 'sim'; // 'sim' (canlı simülasyon) veya 'wire' (adım adım kablo kurma)

    // Donanım Durumları (State)
    this.state = {
      ledStates: {},        // { 'd0': 255, 'd1': 0, 'd2': 0 } (0 - 255)
      rgbState: { r: 0, g: 0, b: 0 },
      buttonPressed: false,
      potValue: 2048,       // 0 - 4095
      ldrValue: 3200,       // 0 - 4095 (Işık seviyesi)
      ultrasonicDistance: 45, // 2 - 400 cm
      imuTilt: { x: 0, y: 0 }, // Pitch / Roll (-90° ile +90°)
      imuTiltChanged: false,
      buzzerActive: false,
      buzzerFreq: 0,
      oledActive: false,
      oledLines: ['', '', '', '', '', '', '', ''],
      oledScroll: null,     // { dir: 'right', speed: 4, offset: 0 }
      stepCount: 0,
      wiresConnected: []    // Takılan kablolar
    };

    this.onStateChange = options.onStateChange || (() => {});
    this.initDOM();
    this.startOledRenderLoop();
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="circuit-sim-wrapper">
        <!-- Üst Mod Seçici ve Durum Çubuğu -->
        <div class="sim-header">
          <div class="sim-mode-toggle">
            <button class="sim-mode-btn ${this.mode === 'wire' ? 'active' : ''}" id="btn-mode-wire">
              <svg viewBox="0 0 24 24"><path d="M4 12h16M12 4v16" /></svg>
              <span>1. Devreyi Adım Adım Kur</span>
            </button>
            <button class="sim-mode-btn ${this.mode === 'sim' ? 'active' : ''}" id="btn-mode-sim">
              <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              <span>2. Canlı Deney Masası</span>
            </button>
          </div>
          <div class="sim-status-badge" id="sim-status-badge">
            <span class="status-dot"></span> <span id="sim-status-text">Devre Hazır</span>
          </div>
        </div>

        <!-- Ana Simülasyon Sahnesi -->
        <div class="sim-arena" id="sim-arena">
          <!-- Kablolama SVG Katmanı -->
          <svg class="sim-wires-layer" id="sim-wires-layer"></svg>

          <!-- Rehberli Kablolama Bilgi Kutusu -->
          <div class="sim-wire-guide" id="sim-wire-guide" hidden>
            <div class="wire-guide-header">
              <span class="step-badge" id="wire-step-badge">ADIM 1 / 3</span>
              <h4 id="wire-step-title">Kırmızı Kabloyu Bağlayın</h4>
            </div>
            <p id="wire-step-desc">D0 pininden LED'in Anot (uzun) bacağına kablo çekin.</p>
            <button class="wire-auto-btn" id="wire-auto-btn">Tüm Bağlantıları Otomatik Tamamla ⚡</button>
          </div>

          <!-- Deney Masası Bileşen Izgarası -->
          <div class="sim-components-board" id="sim-components-board">
            <!-- Dinamik olarak seçilen derse göre bileşenler gelir -->
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    this.container.querySelector('#btn-mode-wire').addEventListener('click', () => {
      this.setMode('wire');
      audioSynth.playClick();
    });
    this.container.querySelector('#btn-mode-sim').addEventListener('click', () => {
      this.setMode('sim');
      audioSynth.playClick();
    });
    this.container.querySelector('#wire-auto-btn').addEventListener('click', () => {
      this.autoCompleteWires();
    });
  }

  setMode(mode) {
    this.mode = mode;
    this.container.querySelector('#btn-mode-wire').classList.toggle('active', mode === 'wire');
    this.container.querySelector('#btn-mode-sim').classList.toggle('active', mode === 'sim');
    const guide = this.container.querySelector('#sim-wire-guide');
    if (guide) guide.hidden = (mode !== 'wire');
    this.render();
  }

  loadLesson(lesson) {
    this.currentLesson = lesson;
    this.resetState();
    this.render();
  }

  resetState() {
    this.state.ledStates = {};
    this.state.rgbState = { r: 0, g: 0, b: 0 };
    this.state.buttonPressed = false;
    this.state.buzzerActive = false;
    this.state.buzzerFreq = 0;
    this.state.oledActive = false;
    this.state.oledLines = ['', '', '', '', '', '', '', ''];
    this.state.oledScroll = null;
    this.state.wiresConnected = [];
    audioSynth.stopTone();
  }

  render() {
    if (!this.currentLesson) return;
    const boardEl = this.container.querySelector('#sim-components-board');
    const lessonId = this.currentLesson.id;

    // Ders tipine göre masadaki interaktif bileşenleri oluştur
    let componentsHTML = `
      <!-- Sanal Deneyap Kart Mini Önizleme Kartı -->
      <div class="comp-card board-card">
        <div class="comp-header">
          <span class="comp-tag">ANA KART</span>
          <h4>Deneyap Kart</h4>
        </div>
        <div class="mini-deneyap-badge">
          <div class="mini-rgb-led" id="mini-rgb" title="Dahili RGB LED"></div>
          <span class="mini-brand">DENEYAP</span>
          <span class="mini-esp">ESP32</span>
        </div>
        <div class="board-pins-summary">
          <span>Güç: 3.3V / 5V USB</span>
          <span>Dahili: IMU & Mikrofon</span>
        </div>
      </div>
    `;

    // 1. Dahili RGB LED Dersi
    if (lessonId === 'dahili-rgb-led') {
      componentsHTML += `
        <div class="comp-card rgb-focus-card">
          <div class="comp-header">
            <span class="comp-tag">DAHİLİ ÇIKIŞ</span>
            <h4>Dahili RGB LED Canlı Göstergesi</h4>
          </div>
          <div class="big-rgb-display">
            <div class="rgb-orb" id="big-rgb-orb"></div>
            <div class="rgb-channel-bars">
              <div class="ch-row"><span class="ch-l">R (Kırmızı - D10):</span> <span class="ch-v" id="val-r">0%</span></div>
              <div class="ch-row"><span class="ch-l">G (Yeşil - D13):</span> <span class="ch-v" id="val-g">0%</span></div>
              <div class="ch-row"><span class="ch-l">B (Mavi - D12):</span> <span class="ch-v" id="val-b">0%</span></div>
            </div>
          </div>
          <p class="comp-note">💡 Aktif LOW mantığı: <code>LOW</code> voltajında yanar, <code>HIGH</code> söner.</p>
        </div>
      `;
    }

    // 2. Harici LED ve Buton Dersi
    if (['harici-led-buton', 'ldr-gece-lambasi'].includes(lessonId)) {
      componentsHTML += `
        <div class="comp-card">
          <div class="comp-header">
            <span class="comp-tag">ÇIKIŞ</span>
            <h4>Kırmızı LED Devresi (D0)</h4>
          </div>
          <div class="led-fixture">
            <div class="sim-led red-led" id="sim-led-d0">
              <div class="led-glow"></div>
            </div>
            <span class="led-label" id="lbl-led-d0">KAPALI</span>
          </div>
        </div>

        <div class="comp-card">
          <div class="comp-header">
            <span class="comp-tag">GİRİŞ</span>
            <h4>Push Buton (D1)</h4>
          </div>
          <div class="btn-fixture">
            <button class="tactile-btn" id="sim-tactile-btn">
              <span class="btn-top"></span>
            </button>
            <span class="btn-state-label" id="lbl-btn-state">Serbest (LOW)</span>
          </div>
          <p class="comp-hint">Basmak için tıklayın veya basılı tutun.</p>
        </div>
      `;
    }

    // 3. Potansiyometre ve PWM Dersi
    if (lessonId === 'pot-pwm-parlaklik') {
      componentsHTML += `
        <div class="comp-card">
          <div class="comp-header">
            <span class="comp-tag">PWM ÇIKIŞ</span>
            <h4>Mavi Parlaklık LED'i (D0)</h4>
          </div>
          <div class="led-fixture">
            <div class="sim-led blue-led" id="sim-led-d0">
              <div class="led-glow"></div>
            </div>
            <span class="led-label" id="lbl-led-d0">Parlaklık: %0</span>
          </div>
        </div>

        <div class="comp-card">
          <div class="comp-header">
            <span class="comp-tag">ANALOG GİRİŞ</span>
            <h4>10kΩ Potansiyometre (A0)</h4>
          </div>
          <div class="pot-fixture">
            <div class="pot-dial" id="pot-dial">
              <div class="pot-indicator" id="pot-indicator"></div>
            </div>
            <input type="range" min="0" max="4095" value="${this.state.potValue}" class="pot-slider" id="pot-slider">
            <div class="pot-readouts">
              <span>ADC: <strong id="val-pot-adc">${this.state.potValue}</strong></span>
              <span>Voltaj: <strong id="val-pot-volt">1.65V</strong></span>
            </div>
          </div>
        </div>
      `;
    }

    // 4. Buzzer Melodi Dersi
    if (['buzzer-melodi', 'ultrasonik-park-sensoru'].includes(lessonId)) {
      componentsHTML += `
        <div class="comp-card">
          <div class="comp-header">
            <span class="comp-tag">SES ÇIKIŞI</span>
            <h4>Piezo Buzzer (D6)</h4>
          </div>
          <div class="buzzer-fixture">
            <div class="buzzer-body ${this.state.buzzerActive ? 'buzzing' : ''}" id="sim-buzzer">
              <div class="buzzer-hole"></div>
              <div class="sound-wave wave-1"></div>
              <div class="sound-wave wave-2"></div>
              <div class="sound-wave wave-3"></div>
            </div>
            <div class="buzzer-stat">
              <span id="lbl-buzzer-freq">Sessiz</span>
            </div>
          </div>
        </div>
      `;
    }

    // 5. Trafik Lambası Dersi
    if (lessonId === 'trafik-lambasi') {
      componentsHTML += `
        <div class="comp-card traffic-card">
          <div class="comp-header">
            <span class="comp-tag">OTOMASYON</span>
            <h4>Sinyalizasyon Trafik Direği</h4>
          </div>
          <div class="traffic-light-post">
            <div class="traffic-light-box">
              <div class="sim-led red-led" id="sim-led-d0"><div class="led-glow"></div></div>
              <div class="sim-led yellow-led" id="sim-led-d1"><div class="led-glow"></div></div>
              <div class="sim-led green-led" id="sim-led-d2"><div class="led-glow"></div></div>
            </div>
            <div class="traffic-pole"></div>
          </div>
        </div>
      `;
    }

    // 6. Dahili IMU Su Terazisi Dersi
    if (lessonId === 'dahili-imu-lsm6dsm') {
      componentsHTML += `
        <div class="comp-card imu-card">
          <div class="comp-header">
            <span class="comp-tag">DAHİLİ 6-EKSEN IMU</span>
            <h4>LSM6DSM Dijital Su Terazisi</h4>
          </div>
          <div class="imu-bubble-fixture">
            <div class="bubble-container" id="bubble-box">
              <div class="bubble-crosshair"></div>
              <div class="bubble-spirit" id="spirit-bubble"></div>
            </div>
            <div class="imu-sliders">
              <label>Roll (Sağ-Sol Eğimi): <span id="lbl-roll">0°</span></label>
              <input type="range" min="-45" max="45" value="${this.state.imuTilt.x}" id="slider-roll" class="tilt-slider">
              <label>Pitch (Ön-Arka Eğimi): <span id="lbl-pitch">0°</span></label>
              <input type="range" min="-45" max="45" value="${this.state.imuTilt.y}" id="slider-pitch" class="tilt-slider">
            </div>
          </div>
          <p class="comp-hint">Kaydırıcıları hareket ettirerek kartı sanal ortamda eğin.</p>
        </div>
      `;
    }

    // 7. OLED Ekran ve Kayan Yazı Dersi (veya Wi-Fi Gemini)
    if (['kayan-yazi-oled', 'wifi-gemini-ai'].includes(lessonId)) {
      componentsHTML += `
        <div class="comp-card oled-card">
          <div class="comp-header">
            <span class="comp-tag">I2C EKRAN (0x7A)</span>
            <h4>0.96" Deneyap OLED Ekran</h4>
          </div>
          <div class="oled-fixture">
            <div class="oled-glass">
              <canvas id="oled-canvas" width="128" height="64" class="oled-screen"></canvas>
            </div>
            <div class="oled-pcb-pins">
              <span>GND</span><span>VCC</span><span>SCL(D1)</span><span>SDA(D0)</span>
            </div>
          </div>
        </div>
      `;
    }

    // 8. LDR Gece Lambası Dersi (Ortam Işığı Kaydırıcısı)
    if (lessonId === 'ldr-gece-lambasi') {
      componentsHTML += `
        <div class="comp-card">
          <div class="comp-header">
            <span class="comp-tag">ANALOG SENSÖR</span>
            <h4>LDR Işık Sensörü (A0)</h4>
          </div>
          <div class="ldr-fixture">
            <div class="ldr-icon-view">
              <span id="ldr-ambient-icon">☀️</span>
            </div>
            <input type="range" min="200" max="4000" value="${this.state.ldrValue}" id="slider-ldr" class="ldr-slider">
            <div class="ldr-readout">
              <span>Işık Seviyesi: <strong id="lbl-ldr-val">${this.state.ldrValue}</strong></span>
              <span id="lbl-ldr-state">Gündüz (Aydınlık)</span>
            </div>
          </div>
        </div>
      `;
    }

    // 9. Ultrasonik Mesafe Sensörü Dersi
    if (lessonId === 'ultrasonik-park-sensoru') {
      componentsHTML += `
        <div class="comp-card">
          <div class="comp-header">
            <span class="comp-tag">MESAFE SENSÖRÜ</span>
            <h4>HC-SR04 Ultrasonik Sensör</h4>
          </div>
          <div class="ultrasonic-fixture">
            <div class="us-eyes">
              <div class="us-cone"><span>T</span></div>
              <div class="us-cone"><span>R</span></div>
            </div>
            <input type="range" min="2" max="150" value="${this.state.ultrasonicDistance}" id="slider-dist" class="dist-slider">
            <div class="dist-readout">
              <span>Engel Mesafesi: <strong id="lbl-dist-val">${this.state.ultrasonicDistance} cm</strong></span>
            </div>
          </div>
        </div>
      `;
    }

    boardEl.innerHTML = componentsHTML;
    this.bindComponentEvents();
    this.updateOledScreen();
  }

  bindComponentEvents() {
    // Buton basma / bırakma
    const tactileBtn = this.container.querySelector('#sim-tactile-btn');
    if (tactileBtn) {
      const press = () => {
        this.state.buttonPressed = true;
        tactileBtn.classList.add('pressed');
        const lbl = this.container.querySelector('#lbl-btn-state');
        if (lbl) lbl.textContent = 'Basılı (HIGH)';
        audioSynth.playSnap();
        this.onStateChange(this.state);
      };
      const release = () => {
        this.state.buttonPressed = false;
        tactileBtn.classList.remove('pressed');
        const lbl = this.container.querySelector('#lbl-btn-state');
        if (lbl) lbl.textContent = 'Serbest (LOW)';
        this.onStateChange(this.state);
      };

      tactileBtn.addEventListener('mousedown', press);
      window.addEventListener('mouseup', release);
      tactileBtn.addEventListener('touchstart', (e) => { e.preventDefault(); press(); });
      window.addEventListener('touchend', release);
    }

    // Potansiyometre
    const potSlider = this.container.querySelector('#pot-slider');
    if (potSlider) {
      potSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.state.potValue = val;
        const deg = (val / 4095) * 270 - 135;
        const indicator = this.container.querySelector('#pot-indicator');
        if (indicator) indicator.style.transform = `rotate(${deg}deg)`;
        const txtAdc = this.container.querySelector('#val-pot-adc');
        if (txtAdc) txtAdc.textContent = val;
        const txtVolt = this.container.querySelector('#val-pot-volt');
        if (txtVolt) txtVolt.textContent = `${((val / 4095) * 3.3).toFixed(2)}V`;
        this.onStateChange(this.state);
      });
    }

    // LDR Kaydırıcısı
    const ldrSlider = this.container.querySelector('#slider-ldr');
    if (ldrSlider) {
      ldrSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.state.ldrValue = val;
        const lblVal = this.container.querySelector('#lbl-ldr-val');
        if (lblVal) lblVal.textContent = val;
        const lblState = this.container.querySelector('#lbl-ldr-state');
        const icon = this.container.querySelector('#ldr-ambient-icon');
        if (val < 1800) {
          if (lblState) lblState.textContent = 'Gece (Karanlık)';
          if (icon) icon.textContent = '🌙';
        } else {
          if (lblState) lblState.textContent = 'Gündüz (Aydınlık)';
          if (icon) icon.textContent = '☀️';
        }
        this.onStateChange(this.state);
      });
    }

    // Mesafe Kaydırıcısı
    const distSlider = this.container.querySelector('#slider-dist');
    if (distSlider) {
      distSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.state.ultrasonicDistance = val;
        const lbl = this.container.querySelector('#lbl-dist-val');
        if (lbl) lbl.textContent = `${val} cm`;
        this.onStateChange(this.state);
      });
    }

    // IMU Eğim Kaydırıcıları
    const rollSlider = this.container.querySelector('#slider-roll');
    const pitchSlider = this.container.querySelector('#slider-pitch');
    if (rollSlider && pitchSlider) {
      const updateIMU = () => {
        this.state.imuTilt.x = parseInt(rollSlider.value, 10);
        this.state.imuTilt.y = parseInt(pitchSlider.value, 10);
        this.state.imuTiltChanged = true;
        const lblRoll = this.container.querySelector('#lbl-roll');
        if (lblRoll) lblRoll.textContent = `${this.state.imuTilt.x}°`;
        const lblPitch = this.container.querySelector('#lbl-pitch');
        if (lblPitch) lblPitch.textContent = `${this.state.imuTilt.y}°`;

        const bubble = this.container.querySelector('#spirit-bubble');
        if (bubble) {
          const px = (this.state.imuTilt.x / 45) * 45;
          const py = (this.state.imuTilt.y / 45) * 45;
          bubble.style.transform = `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`;
        }
        this.onStateChange(this.state);
      };
      rollSlider.addEventListener('input', updateIMU);
      pitchSlider.addEventListener('input', updateIMU);
    }
  }

  /**
   * Arduino Motorundan Gelen Pin Çıkışlarını Uygular
   */
  setPinState(pin, value) {
    const pinLower = String(pin).toLowerCase();
    this.state.ledStates[pinLower] = value;

    // LED görsel güncellemesi
    const ledEl = this.container.querySelector(`#sim-led-${pinLower}`);
    const lblEl = this.container.querySelector(`#lbl-led-${pinLower}`);
    if (ledEl) {
      const brightness = Math.min(Math.max(value / 255, 0), 1);
      ledEl.style.opacity = brightness > 0 ? (0.35 + brightness * 0.65) : 0.25;
      const glow = ledEl.querySelector('.led-glow');
      if (glow) {
        glow.style.transform = `scale(${brightness > 0 ? 1 + brightness * 0.8 : 0})`;
        glow.style.opacity = brightness;
      }
      if (lblEl) {
        lblEl.textContent = brightness > 0 ? (brightness < 1 ? `PWM: ${Math.round(brightness * 100)}%` : 'AÇIK (HIGH)') : 'KAPALI (LOW)';
      }
    }

    this.state.stepCount++;
  }

  /**
   * Dahili RGB LED Rengini Ayarlar (0-255 aralığı)
   */
  setRGB(r = 0, g = 0, b = 0) {
    this.state.rgbState = { r, g, b };
    const miniRgb = this.container.querySelector('#mini-rgb');
    const bigOrb = this.container.querySelector('#big-rgb-orb');

    const color = (r === 0 && g === 0 && b === 0) ? '#222' : `rgb(${r}, ${g}, ${b})`;
    const glow = (r === 0 && g === 0 && b === 0) ? 'none' : `0 0 25px ${color}, 0 0 50px ${color}`;

    if (miniRgb) {
      miniRgb.style.background = color;
      miniRgb.style.boxShadow = glow;
    }
    if (bigOrb) {
      bigOrb.style.background = color;
      bigOrb.style.boxShadow = glow;
    }

    const valR = this.container.querySelector('#val-r');
    const valG = this.container.querySelector('#val-g');
    const valB = this.container.querySelector('#val-b');
    if (valR) valR.textContent = `${Math.round((r / 255) * 100)}%`;
    if (valG) valG.textContent = `${Math.round((g / 255) * 100)}%`;
    if (valB) valB.textContent = `${Math.round((b / 255) * 100)}%`;
  }

  /**
   * Piezo Buzzer Kontrolü
   */
  setBuzzer(freq = 0, duration = null) {
    const buzzerEl = this.container.querySelector('#sim-buzzer');
    const lblFreq = this.container.querySelector('#lbl-buzzer-freq');

    if (freq > 0) {
      this.state.buzzerActive = true;
      this.state.buzzerFreq = freq;
      if (buzzerEl) buzzerEl.classList.add('buzzing');
      if (lblFreq) lblFreq.textContent = `Çalıyor: ${freq} Hz`;
      audioSynth.playTone(freq, duration);
    } else {
      this.state.buzzerActive = false;
      this.state.buzzerFreq = 0;
      if (buzzerEl) buzzerEl.classList.remove('buzzing');
      if (lblFreq) lblFreq.textContent = 'Sessiz';
      audioSynth.stopTone();
    }
  }

  /**
   * OLED Ekran Metin Yazma
   */
  oledPrint(row, col, text) {
    this.state.oledActive = true;
    if (row >= 0 && row < 8) {
      this.state.oledLines[row] = text;
    }
    this.updateOledScreen();
  }

  oledClear() {
    this.state.oledLines = ['', '', '', '', '', '', '', ''];
    this.state.oledScroll = null;
    this.updateOledScreen();
  }

  oledSetScroll(dir = 'right', start = 0, end = 7, speed = 4) {
    this.state.oledActive = true;
    this.state.oledScroll = {
      dir,
      start,
      end,
      speed,
      offset: 0
    };
  }

  startOledRenderLoop() {
    const loop = () => {
      if (this.state.oledScroll) {
        // Kaydırma animasyonu
        this.state.oledScroll.offset += (this.state.oledScroll.dir === 'right' ? 0.75 : -0.75);
        this.updateOledScreen();
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  updateOledScreen() {
    const canvas = this.container.querySelector('#oled-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // OLED Arka Plan (Derin Siyah)
    ctx.fillStyle = '#05070a';
    ctx.fillRect(0, 0, 128, 64);

    // Eğer OLED henüz başlatılmadıysa kapalı ekran
    if (!this.state.oledActive) {
      ctx.fillStyle = '#141820';
      ctx.font = '9px monospace';
      ctx.fillText('[ OLED KAPALI ]', 22, 36);
      return;
    }

    // Karakteristik OLED Açık Mavi/Cyan Parıltısı
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 8px monospace';
    ctx.textBaseline = 'top';

    const scroll = this.state.oledScroll;

    for (let r = 0; r < 8; r++) {
      const line = this.state.oledLines[r];
      if (!line) continue;
      const y = r * 8;
      let x = 4;

      if (scroll && r >= scroll.start && r <= scroll.end) {
        // Kayan yazı mantığı
        const textWidth = ctx.measureText(line).width;
        x = (scroll.offset % (128 + textWidth)) - textWidth;
        if (scroll.dir === 'left') {
          x = 128 - (Math.abs(scroll.offset) % (128 + textWidth));
        }
      }

      ctx.fillText(line, x, y);
    }
  }

  autoCompleteWires() {
    audioSynth.playSuccess();
    const badge = this.container.querySelector('#wire-step-badge');
    const title = this.container.querySelector('#wire-step-title');
    const desc = this.container.querySelector('#wire-step-desc');
    if (badge) badge.textContent = 'BAĞLANTI TAMAMLANDI ✓';
    if (title) title.textContent = 'Tüm Hatlar Doğru Çekildi!';
    if (desc) desc.textContent = 'Şimdi üstteki KOD sekmesine geçip kodunuzu çalıştırabilirsiniz.';
    this.state.wiresConnected = ['all'];
  }

  setServoAngle(angle) {
    this.state.servoAngle = angle;
    const arm = this.container.querySelector('#sim-servo-arm') || this.container.querySelector('.servo-arm');
    const lbl = this.container.querySelector('#lbl-servo-angle');
    if (arm) arm.style.transform = `rotate(${angle - 90}deg)`;
    if (lbl) lbl.textContent = `${angle}°`;
  }

  setFanSpeed(speed) {
    this.state.fanSpeed = speed;
    const fan = this.container.querySelector('#sim-fan-blades') || this.container.querySelector('.fan-blades');
    if (fan) {
      if (speed > 0) {
        fan.style.animation = `fanSpin ${Math.max(0.1, 1 - (speed / 255) * 0.9)}s infinite linear`;
      } else {
        fan.style.animation = 'none';
      }
    }
  }
}

