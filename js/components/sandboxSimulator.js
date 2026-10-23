/**
 * Serbest Deney Masası (Free Sandbox Circuit Builder)
 * Boş masaya istenen sensör ve aktüatörleri ekleyip serbest devre kurma alanı.
 */
import { audioSynth } from './audioSynth.js';

export class SandboxSimulator {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = options;
    this.activeComponents = new Set(['deneyap-kart', 'led-red', 'pot']);

    this.state = {
      ledStates: {},
      rgbState: { r: 0, g: 0, b: 0 },
      buttonPressed: false,
      potValue: 2048,
      ldrValue: 2800,
      ultrasonicDistance: 30,
      servoAngle: 90,
      motorSpeed: 0,
      buzzerActive: false,
      oledActive: false,
      oledLines: ['', '', '', '', '', '', '', '']
    };

    this.initDOM();
  }

  initDOM() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="sandbox-sim-wrapper">
        <!-- Üst Araç Çubuğu: Bileşen Ekle Çekmecesi -->
        <header class="sandbox-topbar">
          <div class="sandbox-title-group">
            <span class="sandbox-logo-dot">⚡</span>
            <div>
              <h3>SERBEST DENEY MASASI (SANDBOX)</h3>
              <p>Masanıza istediğiniz parçaları ekleyin, serbest devre kurup kodlayın.</p>
            </div>
          </div>

          <div class="sandbox-actions">
            <button class="sb-action-btn" id="sb-btn-clear" title="Masayı Temizle">🗑️ Tümünü Kaldır</button>
            <button class="sb-action-btn sb-btn-add" id="sb-btn-toggle-drawer">
              <span>+ Bileşen Ekle</span>
            </button>
          </div>
        </header>

        <!-- Açılır Parça Kutusu (Component Drawer) -->
        <div class="sandbox-drawer" id="sb-drawer">
          <span class="drawer-label">Masanıza Eklemek İçin Parçaya Tıklayın:</span>
          <div class="drawer-chips-grid">
            <button class="drawer-chip" data-comp="led-red">🔴 Kırmızı LED (D0)</button>
            <button class="drawer-chip" data-comp="led-green">🟢 Yeşil LED (D1)</button>
            <button class="drawer-chip" data-comp="led-blue">🔵 Mavi LED (D2)</button>
            <button class="drawer-chip" data-comp="button">🔘 Push Buton (D1)</button>
            <button class="drawer-chip" data-comp="pot">🎛️ Potansiyometre (A0)</button>
            <button class="drawer-chip" data-comp="buzzer">🔊 Piezo Buzzer (D6)</button>
            <button class="drawer-chip" data-comp="servo">🦾 SG90 Servo Motor (D7)</button>
            <button class="drawer-chip" data-comp="fan">💨 DC Motor & Fan (D5)</button>
            <button class="drawer-chip" data-comp="oled">📺 0.96" OLED Ekran (I2C)</button>
            <button class="drawer-chip" data-comp="ldr">☀️ LDR Işık Sensörü (A0)</button>
            <button class="drawer-chip" data-comp="ultrasonic">📡 HC-SR04 Mesafe (D2/D3)</button>
          </div>
        </div>

        <!-- Serbest Deney Masası Sahnesi -->
        <div class="sandbox-arena" id="sb-arena">
          <div class="sandbox-grid" id="sb-grid">
            <!-- Dinamik eklenen bileşenler -->
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.renderGrid();
  }

  bindEvents() {
    // Çekmece Aç/Kapat
    const toggleBtn = this.container.querySelector('#sb-btn-toggle-drawer');
    const drawer = this.container.querySelector('#sb-drawer');
    toggleBtn?.addEventListener('click', () => {
      drawer?.classList.toggle('open');
      audioSynth.playClick();
    });

    // Parça Ekleme
    this.container.querySelectorAll('.drawer-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const comp = chip.dataset.comp;
        this.addComponent(comp);
        audioSynth.playSnap();
      });
    });

    // Temizle
    this.container.querySelector('#sb-btn-clear')?.addEventListener('click', () => {
      this.activeComponents.clear();
      this.activeComponents.add('deneyap-kart');
      this.renderGrid();
      audioSynth.playClick();
    });
  }

  addComponent(comp) {
    this.activeComponents.add(comp);
    this.renderGrid();
  }

  removeComponent(comp) {
    this.activeComponents.delete(comp);
    this.renderGrid();
    audioSynth.playClick();
  }

  renderGrid() {
    const gridEl = this.container.querySelector('#sb-grid');
    if (!gridEl) return;

    let html = `
      <!-- Ana Deneyap Kart -->
      <div class="sb-card board-fixture">
        <div class="sb-card-header">
          <span class="sb-tag">ANA KONTROLCÜ</span>
          <h4>Deneyap Kart</h4>
        </div>
        <div class="sb-board-graphic">
          <div class="sb-rgb-indicator" id="sb-rgb-led" title="Dahili RGB LED"></div>
          <span class="sb-chip-name">ESP32 DUAL-CORE</span>
          <span class="sb-badge-v">3.3V SİSTEM</span>
        </div>
      </div>
    `;

    // Aktif bileşenleri çiz
    if (this.activeComponents.has('led-red')) {
      html += this.renderComponentCard('led-red', '🔴 Kırmızı LED (D0)', 'Çıkış', `
        <div class="sim-led red-led" id="sb-led-d0"><div class="led-glow"></div></div>
        <span class="fixture-status" id="sb-lbl-led-d0">D0: KAPALI</span>
      `);
    }
    if (this.activeComponents.has('led-green')) {
      html += this.renderComponentCard('led-green', '🟢 Yeşil LED (D1)', 'Çıkış', `
        <div class="sim-led green-led" id="sb-led-d1"><div class="led-glow"></div></div>
        <span class="fixture-status" id="sb-lbl-led-d1">D1: KAPALI</span>
      `);
    }
    if (this.activeComponents.has('led-blue')) {
      html += this.renderComponentCard('led-blue', '🔵 Mavi LED (D2)', 'PWM Çıkış', `
        <div class="sim-led blue-led" id="sb-led-d2"><div class="led-glow"></div></div>
        <span class="fixture-status" id="sb-lbl-led-d2">D2: PWM %0</span>
      `);
    }
    if (this.activeComponents.has('button')) {
      html += this.renderComponentCard('button', '🔘 Push Buton (D1)', 'Dijital Giriş', `
        <button class="tactile-btn" id="sb-btn-tactile"><span class="btn-top"></span></button>
        <span class="fixture-status" id="sb-lbl-btn">Serbest (LOW)</span>
      `);
    }
    if (this.activeComponents.has('pot')) {
      html += this.renderComponentCard('pot', '🎛️ 10k Potansiyometre (A0)', 'Analog Giriş', `
        <input type="range" min="0" max="4095" value="${this.state.potValue}" id="sb-slider-pot" class="pot-slider">
        <div class="sb-readouts">
          <span>ADC: <strong id="sb-txt-pot">${this.state.potValue}</strong></span>
          <span>Voltaj: <strong id="sb-txt-pot-v">1.65V</strong></span>
        </div>
      `);
    }
    if (this.activeComponents.has('buzzer')) {
      html += this.renderComponentCard('buzzer', '🔊 Piezo Buzzer (D6)', 'Ses Çıkışı', `
        <div class="buzzer-body ${this.state.buzzerActive ? 'buzzing' : ''}" id="sb-buzzer-el">
          <div class="buzzer-hole"></div>
        </div>
        <span class="fixture-status" id="sb-lbl-buzzer">Sessiz</span>
      `);
    }
    if (this.activeComponents.has('servo')) {
      html += this.renderComponentCard('servo', '🦾 SG90 Servo Motor (D7)', 'Açı Aktüatörü', `
        <div class="servo-fixture">
          <div class="servo-body">
            <div class="servo-arm" id="sb-servo-arm" style="transform: rotate(${this.state.servoAngle - 90}deg);"></div>
          </div>
          <span class="fixture-status" id="sb-lbl-servo">${this.state.servoAngle}°</span>
        </div>
        <input type="range" min="0" max="180" value="${this.state.servoAngle}" id="sb-slider-servo" class="pot-slider">
      `);
    }
    if (this.activeComponents.has('fan')) {
      html += this.renderComponentCard('fan', '💨 DC Motor & Pervane (D5)', 'Motor', `
        <div class="fan-fixture">
          <div class="fan-blades" id="sb-fan-blades">
            <span></span><span></span><span></span>
          </div>
        </div>
        <span class="fixture-status" id="sb-lbl-fan">Durduruldu</span>
      `);
    }
    if (this.activeComponents.has('oled')) {
      html += this.renderComponentCard('oled', '📺 0.96" OLED Ekran (I2C)', 'Ekran (0x7A)', `
        <canvas id="sb-oled-canvas" width="128" height="64" class="oled-screen" style="width:160px; height:80px;"></canvas>
      `);
    }
    if (this.activeComponents.has('ldr')) {
      html += this.renderComponentCard('ldr', '☀️ LDR Işık Sensörü (A0)', 'Analog Giriş', `
        <input type="range" min="200" max="4000" value="${this.state.ldrValue}" id="sb-slider-ldr" class="pot-slider">
        <span class="fixture-status" id="sb-lbl-ldr">Işık: ${this.state.ldrValue}</span>
      `);
    }
    if (this.activeComponents.has('ultrasonic')) {
      html += this.renderComponentCard('ultrasonic', '📡 HC-SR04 Mesafe (D2/D3)', 'Mesafe Sensörü', `
        <input type="range" min="2" max="100" value="${this.state.ultrasonicDistance}" id="sb-slider-dist" class="pot-slider">
        <span class="fixture-status" id="sb-lbl-dist">${this.state.ultrasonicDistance} cm</span>
      `);
    }

    gridEl.innerHTML = html;
    this.bindComponentEvents();
  }

  renderComponentCard(id, title, tag, content) {
    return `
      <div class="sb-card" data-comp-id="${id}">
        <div class="sb-card-header">
          <span class="sb-tag">${tag}</span>
          <h4>${title}</h4>
          <button class="sb-btn-remove" data-remove="${id}" title="Kaldır">×</button>
        </div>
        <div class="sb-card-body">
          ${content}
        </div>
      </div>
    `;
  }

  bindComponentEvents() {
    // Kaldır Butonları
    this.container.querySelectorAll('.sb-btn-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const comp = btn.dataset.remove;
        this.removeComponent(comp);
      });
    });

    // Buton basma
    const tactileBtn = this.container.querySelector('#sb-btn-tactile');
    if (tactileBtn) {
      tactileBtn.addEventListener('mousedown', () => {
        this.state.buttonPressed = true;
        tactileBtn.classList.add('pressed');
        this.container.querySelector('#sb-lbl-btn').textContent = 'Basılı (HIGH)';
        audioSynth.playSnap();
      });
      window.addEventListener('mouseup', () => {
        this.state.buttonPressed = false;
        tactileBtn.classList.remove('pressed');
        const lbl = this.container.querySelector('#sb-lbl-btn');
        if (lbl) lbl.textContent = 'Serbest (LOW)';
      });
    }

    // Potansiyometre
    const potSlider = this.container.querySelector('#sb-slider-pot');
    if (potSlider) {
      potSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.state.potValue = val;
        this.container.querySelector('#sb-txt-pot').textContent = val;
        this.container.querySelector('#sb-txt-pot-v').textContent = `${((val / 4095) * 3.3).toFixed(2)}V`;
      });
    }

    // Servo Kaydırıcı
    const servoSlider = this.container.querySelector('#sb-slider-servo');
    if (servoSlider) {
      servoSlider.addEventListener('input', (e) => {
        const angle = parseInt(e.target.value, 10);
        this.setServoAngle(angle);
      });
    }

    // LDR Kaydırıcı
    const ldrSlider = this.container.querySelector('#sb-slider-ldr');
    if (ldrSlider) {
      ldrSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.state.ldrValue = val;
        this.container.querySelector('#sb-lbl-ldr').textContent = `Işık: ${val}`;
      });
    }

    // Mesafe Kaydırıcı
    const distSlider = this.container.querySelector('#sb-slider-dist');
    if (distSlider) {
      distSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.state.ultrasonicDistance = val;
        this.container.querySelector('#sb-lbl-dist').textContent = `${val} cm`;
      });
    }
  }

  setServoAngle(angle) {
    this.state.servoAngle = angle;
    const arm = this.container.querySelector('#sb-servo-arm');
    const lbl = this.container.querySelector('#sb-lbl-servo');
    if (arm) arm.style.transform = `rotate(${angle - 90}deg)`;
    if (lbl) lbl.textContent = `${angle}°`;
  }

  setFanSpeed(speed) {
    this.state.motorSpeed = speed;
    const fan = this.container.querySelector('#sb-fan-blades');
    const lbl = this.container.querySelector('#sb-lbl-fan');
    if (fan) {
      if (speed > 0) {
        fan.style.animation = `fanSpin ${Math.max(0.1, 1 - (speed / 255) * 0.9)}s infinite linear`;
      } else {
        fan.style.animation = 'none';
      }
    }
    if (lbl) lbl.textContent = speed > 0 ? `Hız: %${Math.round((speed / 255) * 100)}` : 'Durduruldu';
  }

  setPinState(pin, value) {
    const pinLower = String(pin).toLowerCase();
    this.state.ledStates[pinLower] = value;

    if (pinLower === 'd5') {
      this.setFanSpeed(value > 0 ? (value > 1 ? value : 255) : 0);
    }
    if (pinLower === 'd7') {
      this.setServoAngle(value);
    }

    const ledEl = this.container.querySelector(`#sb-led-${pinLower}`);
    const lblEl = this.container.querySelector(`#sb-lbl-led-${pinLower}`);
    if (ledEl) {
      const brightness = Math.min(Math.max(value / 255, 0), 1);
      ledEl.style.opacity = brightness > 0 ? (0.35 + brightness * 0.65) : 0.25;
      const glow = ledEl.querySelector('.led-glow');
      if (glow) {
        glow.style.transform = `scale(${brightness > 0 ? 1 + brightness * 0.8 : 0})`;
        glow.style.opacity = brightness;
      }
      if (lblEl) {
        lblEl.textContent = `${pin.toUpperCase()}: ${brightness > 0 ? (brightness < 1 ? `PWM %${Math.round(brightness * 100)}` : 'AÇIK') : 'KAPALI'}`;
      }
    }
  }

  setRGB(r = 0, g = 0, b = 0) {
    this.state.rgbState = { r, g, b };
    const rgbEl = this.container.querySelector('#sb-rgb-led');
    if (rgbEl) {
      const color = (r === 0 && g === 0 && b === 0) ? '#222' : `rgb(${r}, ${g}, ${b})`;
      const glow = (r === 0 && g === 0 && b === 0) ? 'none' : `0 0 15px ${color}`;
      rgbEl.style.background = color;
      rgbEl.style.boxShadow = glow;
    }
  }

  setBuzzer(freq = 0, duration = null) {
    const buzzerEl = this.container.querySelector('#sb-buzzer-el');
    const lbl = this.container.querySelector('#sb-lbl-buzzer');
    if (freq > 0) {
      this.state.buzzerActive = true;
      if (buzzerEl) buzzerEl.classList.add('buzzing');
      if (lbl) lbl.textContent = `Çalıyor: ${freq} Hz`;
      audioSynth.playTone(freq, duration);
    } else {
      this.state.buzzerActive = false;
      if (buzzerEl) buzzerEl.classList.remove('buzzing');
      if (lbl) lbl.textContent = 'Sessiz';
      audioSynth.stopTone();
    }
  }

  oledPrint(row, col, text) {
    this.state.oledActive = true;
    if (row >= 0 && row < 8) {
      this.state.oledLines[row] = text;
    }
    this.updateOledScreen();
  }

  oledClear() {
    this.state.oledLines = ['', '', '', '', '', '', '', ''];
    this.updateOledScreen();
  }

  oledSetScroll(dir, start, end, speed) {
    this.updateOledScreen();
  }

  updateOledScreen() {
    const canvas = this.container?.querySelector('#sb-oled-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#05070a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = '10px "Courier New", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.textBaseline = 'top';

    this.state.oledLines.forEach((line, idx) => {
      if (line) {
        ctx.fillText(line, 4, idx * 8);
      }
    });
  }
}
