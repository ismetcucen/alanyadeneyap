/**
 * 360° Etkileşimli Deneyap Kart ve Pin Haritası İnceleyici
 */
import { BOARDS_DATA, PIN_FILTER_CATEGORIES } from '../data/boards.js';
import { audioSynth } from './audioSynth.js';

export class BoardViewer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.warn(`Container #${containerId} bulunamadı.`);
      return;
    }

    this.currentBoardId = 'deneyap-kart';
    this.currentFilter = 'all';
    this.selectedPin = null;

    // 3B Döndürme ve Yakınlaştırma Durumu
    this.rotX = 18;
    this.rotY = -12;
    this.zoom = 1.0;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.showBack = false;
    this.showLabels = true;

    this.initDOM();
    this.bindEvents();
    this.render();
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="board-viewer-wrapper">
        <!-- Üst Kontrol Çubuğu: Kart Seçimi ve Filtreler -->
        <div class="bv-topbar">
          <div class="bv-board-selector">
            <label for="board-select"><span class="badge-dot"></span> Kart Modeli:</label>
            <select id="board-select" class="bv-select">
              <option value="deneyap-kart">Deneyap Kart (Orijinal v1 / v2)</option>
              <option value="deneyap-kart-1a">Deneyap Kart 1A / 1A v2</option>
              <option value="deneyap-mini">Deneyap Mini / Mini v2</option>
              <option value="deneyap-kart-g">Deneyap Kart G (LoRa)</option>
            </select>
          </div>

          <div class="bv-filters" id="pin-filters">
            <!-- Dinamik kategori butonları -->
          </div>
        </div>

        <!-- 3D Sahne ve Kart Alanı -->
        <div class="bv-stage" id="bv-stage">
          <div class="bv-3d-scene" id="bv-3d-scene">
            <div class="deneyap-pcb" id="deneyap-pcb">
              <!-- Kart bileşenleri ve pinler render edilir -->
            </div>
          </div>

          <!-- Yüzen Kamera Araç Çubuğu -->
          <div class="bv-camera-tools">
            <button class="cam-btn" id="cam-zoom-in" title="Yaklaş (+)"><svg viewBox="0 0 24 24"><path d="M5 12h14M12 5v14" /></svg></button>
            <button class="cam-btn" id="cam-zoom-out" title="Uzaklaş (-)"><svg viewBox="0 0 24 24"><path d="M5 12h14" /></svg></button>
            <span class="cam-sep"></span>
            <button class="cam-btn" id="cam-rot-left" title="Sola Döndür (Q)"><svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" /></svg></button>
            <button class="cam-btn" id="cam-rot-right" title="Sağa Döndür (E)"><svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.4-5.7M20 4v4.5h-4.5" /></svg></button>
            <button class="cam-btn" id="cam-flip" title="Arka Yüzü Çevir"><svg viewBox="0 0 24 24"><path d="M7 16V4m0 0L3 8m4-4l4 4m6 4v12m0 0l4-4m-4 4l-4-4" /></svg></button>
            <span class="cam-sep"></span>
            <button class="cam-btn" id="cam-reset" title="Bakış Açısını Sıfırla"><svg viewBox="0 0 24 24"><path d="M4 11l8-6.5 8 6.5M6.5 9.5V19h11V9.5" /></svg></button>
            <button class="cam-btn" id="cam-labels" title="Etiketleri Göster/Gizle" aria-pressed="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5.5M12 7.5v.5" /></svg></button>
          </div>

          <!-- Pin Bilgi İpucu Kutusu (Hover Tooltip) -->
          <div class="pin-tooltip" id="pin-tooltip" hidden></div>

          <!-- Sürükleme İpucu -->
          <div class="bv-drag-hint">
            <span>🖱️ Sürükleyerek 360° Döndür · Tekerlekle Yaklaş · Pine Tıkla</span>
          </div>
        </div>

        <!-- Seçilen Pin Detay Paneli (Drawer) -->
        <div class="pin-inspector" id="pin-inspector" hidden>
          <div class="pi-header">
            <div class="pi-title-group">
              <span class="pi-badge" id="pi-badge">PIN</span>
              <h3 id="pi-name">Pin Seçilmedi</h3>
            </div>
            <button class="pi-close" id="pi-close" aria-label="Kapat">×</button>
          </div>
          <div class="pi-body">
            <p id="pi-desc" class="pi-desc"></p>
            <div class="pi-details-grid">
              <div class="pi-stat"><span class="k">ESP32 GPIO:</span> <span class="v" id="pi-gpio">-</span></div>
              <div class="pi-stat"><span class="k">Maks. Voltaj:</span> <span class="v" id="pi-volt">3.3V (5V Toleranssız!)</span></div>
              <div class="pi-stat"><span class="k">Yetenekler:</span> <span class="v" id="pi-funcs">-</span></div>
            </div>
            <div class="pi-code-block">
              <div class="pi-code-header">
                <span>Arduino C++ Örnek Kullanım</span>
                <button class="pi-copy-btn" id="pi-copy-code">Kopyala</button>
              </div>
              <pre><code id="pi-snippet">// Pin kodu</code></pre>
            </div>
          </div>
        </div>
      </div>
    `;

    this.renderFilters();
  }

  renderFilters() {
    const filtersWrap = this.container.querySelector('#pin-filters');
    filtersWrap.innerHTML = PIN_FILTER_CATEGORIES.map(cat => `
      <button class="filter-btn ${cat.id === this.currentFilter ? 'active' : ''}" data-filter="${cat.id}">
        <span class="filter-dot" style="background:${cat.color}"></span>
        ${cat.label}
      </button>
    `).join('');
  }

  bindEvents() {
    // Kart seçici
    const select = this.container.querySelector('#board-select');
    select.addEventListener('change', (e) => {
      this.currentBoardId = e.target.value;
      this.selectedPin = null;
      this.closeInspector();
      this.render();
      audioSynth.playClick();
    });

    // Filtre butonları
    const filtersWrap = this.container.querySelector('#pin-filters');
    filtersWrap.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      const filterId = btn.dataset.filter;
      this.currentFilter = filterId;
      filtersWrap.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b === btn));
      this.applyFilter();
      audioSynth.playClick();
    });

    // 3D Döndürme Fare Olayları
    const stage = this.container.querySelector('#bv-stage');
    stage.addEventListener('mousedown', (e) => {
      if (e.target.closest('.cam-btn') || e.target.closest('#pin-inspector')) return;
      this.isDragging = true;
      this.startX = e.clientX;
      this.startY = e.clientY;
      stage.classList.add('grabbing');
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.startX;
      const dy = e.clientY - this.startY;
      this.rotY += dx * 0.45;
      this.rotX -= dy * 0.45;
      this.startX = e.clientX;
      this.startY = e.clientY;
      this.update3DTransform();
    });

    window.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        stage.classList.remove('grabbing');
      }
    });

    // Tekerlekle Yaklaşma
    stage.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY * -0.0012;
      this.zoom = Math.min(Math.max(0.55, this.zoom + delta), 2.2);
      this.update3DTransform();
    }, { passive: false });

    // Kamera Butonları
    this.container.querySelector('#cam-zoom-in').addEventListener('click', () => {
      this.zoom = Math.min(this.zoom + 0.15, 2.2);
      this.update3DTransform();
      audioSynth.playClick();
    });

    this.container.querySelector('#cam-zoom-out').addEventListener('click', () => {
      this.zoom = Math.max(this.zoom - 0.15, 0.55);
      this.update3DTransform();
      audioSynth.playClick();
    });

    this.container.querySelector('#cam-rot-left').addEventListener('click', () => {
      this.rotY -= 30;
      this.update3DTransform();
      audioSynth.playClick();
    });

    this.container.querySelector('#cam-rot-right').addEventListener('click', () => {
      this.rotY += 30;
      this.update3DTransform();
      audioSynth.playClick();
    });

    this.container.querySelector('#cam-flip').addEventListener('click', () => {
      this.showBack = !this.showBack;
      this.rotY += 180;
      this.update3DTransform();
      audioSynth.playClick();
    });

    this.container.querySelector('#cam-reset').addEventListener('click', () => {
      this.rotX = 18;
      this.rotY = -12;
      this.zoom = 1.0;
      this.showBack = false;
      this.update3DTransform();
      audioSynth.playClick();
    });

    const labelsBtn = this.container.querySelector('#cam-labels');
    labelsBtn.addEventListener('click', () => {
      this.showLabels = !this.showLabels;
      labelsBtn.setAttribute('aria-pressed', this.showLabels);
      this.container.querySelector('#deneyap-pcb').classList.toggle('hide-labels', !this.showLabels);
      audioSynth.playClick();
    });

    // Klavye Kısayolları (Q / E / Home)
    window.addEventListener('keydown', (e) => {
      // Sadece odak inputta değilken çalışsın
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      if (e.key === 'q' || e.key === 'Q') {
        this.rotY -= 15;
        this.update3DTransform();
      } else if (e.key === 'e' || e.key === 'E') {
        this.rotY += 15;
        this.update3DTransform();
      }
    });

    // Inspector Kapatma
    this.container.querySelector('#pi-close').addEventListener('click', () => {
      this.closeInspector();
    });

    // Kod Kopyalama
    this.container.querySelector('#pi-copy-code').addEventListener('click', () => {
      const code = this.container.querySelector('#pi-snippet').textContent;
      navigator.clipboard?.writeText(code);
      const btn = this.container.querySelector('#pi-copy-code');
      btn.textContent = 'Kopyalandı! ✓';
      setTimeout(() => btn.textContent = 'Kopyala', 1800);
      audioSynth.playSuccess();
    });
  }

  update3DTransform() {
    const scene = this.container.querySelector('#bv-3d-scene');
    if (scene) {
      scene.style.transform = `scale(${this.zoom}) rotateX(${this.rotX}deg) rotateY(${this.rotY}deg)`;
    }
  }

  render() {
    const board = BOARDS_DATA[this.currentBoardId] || BOARDS_DATA['deneyap-kart'];
    const pcb = this.container.querySelector('#deneyap-pcb');
    
    // Sol ve sağ pinleri ayır
    const leftPins = board.pins.filter(p => p.side === 'left');
    const rightPins = board.pins.filter(p => p.side === 'right');

    pcb.className = `deneyap-pcb ${board.id} ${this.showLabels ? '' : 'hide-labels'}`;
    pcb.innerHTML = `
      <!-- Üst Kenar: Type-C Port ve Li-Po Soketi -->
      <div class="pcb-header-zone">
        <div class="pcb-jst-lipo" title="3.7V Li-Po Pil Şarj Soketi">
          <span class="jst-pins"><i></i><i></i></span>
          <span class="jst-label">Li-Po 3.7V</span>
        </div>
        <div class="pcb-typec-port" title="USB Type-C Girişi (5V Besleme & Kod Yükleme)">
          <div class="typec-metal">
            <div class="typec-center"></div>
          </div>
          <span class="typec-label">USB-C</span>
        </div>
        <div class="pcb-i2c-port" title="Deneyap Kolay I2C Portu (SDA: D0, SCL: D1, 3V3, GND)">
          <span class="i2c-pins"><i></i><i></i><i></i><i></i></span>
          <span class="i2c-label">I2C SOKET</span>
        </div>
      </div>

      <!-- Sol Pin Header Yuvası -->
      <div class="pin-header left-header">
        ${leftPins.map(pin => this.renderPinHTML(pin)).join('')}
      </div>

      <!-- Kartın Gövdesi: Çipler, Sensörler ve Serigrafi -->
      <div class="pcb-body">
        <!-- Anten Bölgesi -->
        <div class="pcb-antenna" title="2.4 GHz Dahili PCB Wi-Fi / Bluetooth Anteni">
          <div class="antenna-track"></div>
        </div>

        <!-- ESP32 Metal Zırhı -->
        <div class="pcb-rf-shield" title="${board.mcu}">
          <div class="rf-brand">T3 VAKFI</div>
          <div class="rf-title">DENEYAP</div>
          <div class="rf-sub">${board.name.toUpperCase()}</div>
          <div class="rf-chip-code">ESP32-WROVER</div>
          <div class="rf-cert">FCC ID / CE / ROHS</div>
        </div>

        <!-- Dahili Sensörler ve Butonlar -->
        <div class="pcb-components-grid">
          <!-- Butonlar -->
          <div class="pcb-btn-smd reset-btn" title="EN (Reset) Yeniden Başlatma Butonu">
            <span class="btn-core"></span>
            <span class="btn-text">RST</span>
          </div>
          <div class="pcb-btn-smd boot-btn" title="BOOT / Flash Yükleme Butonu (GPIO0)">
            <span class="btn-core"></span>
            <span class="btn-text">BOOT</span>
          </div>

          <!-- Dahili RGB LED -->
          <div class="pcb-rgb-led" id="pcb-rgb-indicator" title="Dahili Çok Renkli RGB LED (LEDR: D10, LEDG: D13, LEDB: D12)">
            <span class="rgb-lens"></span>
            <span class="rgb-label">RGB LED</span>
          </div>

          <!-- Dahili LSM6DSM IMU Çipi -->
          <div class="pcb-chip lsm6dsm-chip" title="Dahili 6 Eksenli IMU Sensörü (LSM6DSM: İvmeölçer + Jiroskop)">
            <span class="chip-dot"></span>
            <span class="chip-text">LSM6DSM<br>6-AXIS IMU</span>
          </div>

          <!-- Dahili MEMS Mikrofon -->
          <div class="pcb-mic-hole" title="Dahili MP34DT05 MEMS Sayısal Mikrofon">
            <span class="mic-metal"><i class="mic-hole"></i></span>
            <span class="mic-label">MIC</span>
          </div>
        </div>

        <!-- Alt Bölge: Logo ve Türkiye Haritası Stilizasyonu -->
        <div class="pcb-footer-art">
          <div class="pcb-turkey-badge">🇹🇷 MİLLİ TEKNOLOJİ HAMLESİ</div>
          <div class="pcb-version-badge">v2.0 · 2026</div>
        </div>
      </div>

      <!-- Sağ Pin Header Yuvası -->
      <div class="pin-header right-header">
        ${rightPins.map(pin => this.renderPinHTML(pin)).join('')}
      </div>
    `;

    this.bindPinEvents();
    this.update3DTransform();
    this.applyFilter();
  }

  renderPinHTML(pin) {
    const isPower = pin.type === 'power';
    const functionsAttr = (pin.functions || []).join(' ');
    const isLeft = pin.side === 'left';

    return `
      <div class="pin-slot ${pin.side}" data-pin-id="${pin.id}" data-functions="${functionsAttr}">
        ${isLeft ? `<span class="pin-label-silk">${pin.name}</span>` : ''}
        <div class="pin-pad ${isPower ? 'pin-power' : ''}" id="pad-${pin.id}">
          <div class="pin-gold-ring"></div>
          <div class="pin-hole"></div>
        </div>
        ${!isLeft ? `<span class="pin-label-silk">${pin.name}</span>` : ''}
      </div>
    `;
  }

  bindPinEvents() {
    const pcb = this.container.querySelector('#deneyap-pcb');
    const tooltip = this.container.querySelector('#pin-tooltip');
    const board = BOARDS_DATA[this.currentBoardId] || BOARDS_DATA['deneyap-kart'];

    pcb.querySelectorAll('.pin-slot').forEach(slot => {
      const pinId = slot.dataset.pinId;
      const pin = board.pins.find(p => p.id === pinId);
      if (!pin) return;

      // Hover Tooltip
      slot.addEventListener('mouseenter', (e) => {
        const funcsText = (pin.functions || []).map(f => `<span class="tag tag-${f}">${f.toUpperCase()}</span>`).join(' ');
        tooltip.innerHTML = `
          <div class="tt-header">
            <strong>${pin.name}</strong>
            <span class="tt-volt">${pin.voltage}</span>
          </div>
          <div class="tt-gpio">ESP32: ${pin.gpio !== null && pin.gpio !== undefined ? 'GPIO ' + pin.gpio : 'Güç Hattı'}</div>
          <div class="tt-funcs">${funcsText}</div>
          <div class="tt-desc">${pin.desc}</div>
        `;
        tooltip.hidden = false;
        this.positionTooltip(e);
      });

      slot.addEventListener('mousemove', (e) => {
        this.positionTooltip(e);
      });

      slot.addEventListener('mouseleave', () => {
        tooltip.hidden = true;
      });

      // Click to inspect
      slot.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectPin(pin);
        audioSynth.playSnap();
      });
    });
  }

  positionTooltip(e) {
    const tooltip = this.container.querySelector('#pin-tooltip');
    const stageRect = this.container.querySelector('#bv-stage').getBoundingClientRect();
    const x = e.clientX - stageRect.left + 15;
    const y = e.clientY - stageRect.top + 15;
    tooltip.style.left = `${Math.min(x, stageRect.width - 240)}px`;
    tooltip.style.top = `${Math.min(y, stageRect.height - 130)}px`;
  }

  selectPin(pin) {
    this.selectedPin = pin;
    const inspector = this.container.querySelector('#pin-inspector');
    
    // Highlight active pin
    this.container.querySelectorAll('.pin-slot').forEach(s => s.classList.remove('selected'));
    const slot = this.container.querySelector(`.pin-slot[data-pin-id="${pin.id}"]`);
    if (slot) slot.classList.add('selected');

    // Fill inspector
    this.container.querySelector('#pi-badge').textContent = pin.type === 'power' ? 'GÜÇ HATTI' : 'GİRİŞ / ÇIKIŞ (I/O)';
    this.container.querySelector('#pi-badge').className = `pi-badge ${pin.type === 'power' ? 'badge-power' : 'badge-io'}`;
    this.container.querySelector('#pi-name').textContent = `${pin.name} (Pin ${pin.index})`;
    this.container.querySelector('#pi-desc').textContent = pin.desc;
    this.container.querySelector('#pi-gpio').textContent = pin.gpio !== null && pin.gpio !== undefined ? `GPIO ${pin.gpio}` : 'Doğrudan Regülatör';
    this.container.querySelector('#pi-volt').textContent = pin.voltage;
    this.container.querySelector('#pi-funcs').textContent = (pin.functions || []).join(', ').toUpperCase();
    this.container.querySelector('#pi-snippet').textContent = pin.snippet || `// ${pin.name} pini bağlantısı\n// Güç veya toprak hattı`;

    inspector.hidden = false;
  }

  closeInspector() {
    this.selectedPin = null;
    this.container.querySelectorAll('.pin-slot').forEach(s => s.classList.remove('selected'));
    const inspector = this.container.querySelector('#pin-inspector');
    if (inspector) inspector.hidden = true;
  }

  applyFilter() {
    const filter = this.currentFilter;
    const slots = this.container.querySelectorAll('.pin-slot');

    slots.forEach(slot => {
      const funcs = (slot.dataset.functions || '').split(' ');
      if (filter === 'all') {
        slot.classList.remove('dimmed', 'highlighted');
      } else if (funcs.includes(filter)) {
        slot.classList.remove('dimmed');
        slot.classList.add('highlighted');
      } else {
        slot.classList.add('dimmed');
        slot.classList.remove('highlighted');
      }
    });
  }

  /**
   * Simülasyon sırasında dahili RGB LED rengini günceller
   */
  setRGBColor(r = 0, g = 0, b = 0) {
    const led = this.container.querySelector('#pcb-rgb-indicator');
    if (!led) return;
    if (r === 0 && g === 0 && b === 0) {
      led.style.background = '#222';
      led.style.boxShadow = 'none';
    } else {
      const color = `rgb(${r}, ${g}, ${b})`;
      led.style.background = color;
      led.style.boxShadow = `0 0 16px ${color}, 0 0 32px ${color}`;
    }
  }
}
