/**
 * İnteraktif Deneyap Sensör ve Modül Rehberi Bileşeni
 */
import { SENSORS_DATA, SENSOR_CATEGORIES } from '../data/sensors.js';
import { audioSynth } from './audioSynth.js';

export class SensorExplorer {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = options;
    this.onSelectLesson = options.onSelectLesson || (() => {});
    this.onClose = options.onClose || (() => {});

    this.currentCategory = 'all';
    this.searchQuery = '';
    this.selectedSensor = SENSORS_DATA[0];

    this.initDOM();
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="sensor-explorer-wrapper">
        <!-- Üst Başlık ve Filtreleme Çubuğu -->
        <header class="se-header">
          <div class="se-title-wrap">
            <div class="se-icon-badge">⚡</div>
            <div>
              <h2>DENEYAP SENSÖR VE MODÜL REHBERİ</h2>
              <p>Milli ekosistem sensörlerini inceleyin, çalışma prensiplerini öğrenin ve canlı simüle edin.</p>
            </div>
          </div>
          <div class="se-header-actions">
            <button class="se-btn-close" id="se-btn-close" title="Atölye Masasına Dön">
              <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              <span>Atölyeye Dön</span>
            </button>
          </div>
        </header>

        <!-- Arama ve Kategori Filtresi -->
        <div class="se-controls-bar">
          <div class="se-search-box">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" id="se-search-input" placeholder="Sensör veya modül ara (örn: IMU, OLED, HC-SR04, DHT11, Gaz)..." autocomplete="off" />
          </div>
          <div class="se-categories" id="se-categories">
            ${SENSOR_CATEGORIES.map(cat => `
              <button class="se-cat-chip ${cat.id === 'all' ? 'active' : ''}" data-cat="${cat.id}">
                ${cat.name}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Ana Gövde: Sol Liste & Sağ Detaylı Müfettiş -->
        <div class="se-content-grid">
          <!-- Sol Liste -->
          <aside class="se-sensor-list" id="se-sensor-list"></aside>

          <!-- Sağ Detay ve Canlı Test Paneli -->
          <main class="se-sensor-details" id="se-sensor-details"></main>
        </div>
      </div>
    `;

    this.bindEvents();
    this.renderList();
    this.renderDetails();
  }

  bindEvents() {
    // Kapat Butonu
    this.container.querySelector('#se-btn-close').addEventListener('click', () => {
      audioSynth.playClick();
      this.onClose();
    });

    // Arama Kutusu
    const searchInput = this.container.querySelector('#se-search-input');
    searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.renderList();
    });

    // Kategori Seçimi
    this.container.querySelector('#se-categories').addEventListener('click', (e) => {
      const chip = e.target.closest('.se-cat-chip');
      if (!chip) return;
      this.currentCategory = chip.dataset.cat;
      this.container.querySelectorAll('.se-cat-chip').forEach(c => c.classList.toggle('active', c === chip));
      this.renderList();
      audioSynth.playClick();
    });
  }

  getFilteredSensors() {
    return SENSORS_DATA.filter(sensor => {
      const matchesCat = (this.currentCategory === 'all' || sensor.category === this.currentCategory);
      const matchesSearch = !this.searchQuery || 
        sensor.name.toLowerCase().includes(this.searchQuery) ||
        sensor.protocol.toLowerCase().includes(this.searchQuery) ||
        sensor.description.toLowerCase().includes(this.searchQuery);
      return matchesCat && matchesSearch;
    });
  }

  renderList() {
    const listEl = this.container.querySelector('#se-sensor-list');
    const sensors = this.getFilteredSensors();

    if (sensors.length === 0) {
      listEl.innerHTML = `
        <div class="se-empty">
          <p>Aramanıza uygun sensör bulunamadı.</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = sensors.map(s => {
      const isSelected = this.selectedSensor && this.selectedSensor.id === s.id;
      return `
        <div class="se-card ${isSelected ? 'active' : ''}" data-sensor-id="${s.id}">
          <div class="se-card-header">
            <span class="se-protocol-tag">${s.protocol}</span>
            <span class="se-volt-tag">${s.voltage}</span>
          </div>
          <h4 class="se-card-title">${s.name}</h4>
          <p class="se-card-desc">${s.description}</p>
          <div class="se-card-footer">
            <span class="se-pins-info">📍 ${s.pins}</span>
          </div>
        </div>
      `;
    }).join('');

    // Kart tıklama
    listEl.querySelectorAll('.se-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.sensorId;
        const sensor = SENSORS_DATA.find(s => s.id === id);
        if (sensor) {
          this.selectedSensor = sensor;
          this.container.querySelectorAll('.se-card').forEach(c => c.classList.toggle('active', c === card));
          this.renderDetails();
          audioSynth.playSnap();
        }
      });
    });
  }

  renderDetails() {
    const detailsEl = this.container.querySelector('#se-sensor-details');
    const s = this.selectedSensor;
    if (!s) return;

    detailsEl.innerHTML = `
      <div class="se-detail-card">
        <!-- Başlık Bölümü -->
        <div class="se-detail-header">
          <div>
            <span class="se-detail-badge">${s.categoryName} · ${s.protocol}</span>
            <h3 class="se-detail-title">${s.name}</h3>
            <p class="se-detail-desc">${s.description}</p>
          </div>
          ${s.lessonId ? `
            <button class="se-btn-goto-lesson" id="btn-goto-lesson" data-lesson="${s.lessonId}">
              <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              <span>Bu Sensörü Atölyede Dene</span>
            </button>
          ` : ''}
        </div>

        <!-- Teknik Bilgiler Izgarası -->
        <div class="se-specs-grid">
          <div class="se-spec-box">
            <span class="sb-label">Haberleşme Protokolü</span>
            <strong class="sb-val">${s.protocol}</strong>
          </div>
          <div class="se-spec-box">
            <span class="sb-label">Çalışma Voltajı</span>
            <strong class="sb-val" style="color:#f59e0b">${s.voltage}</strong>
          </div>
          <div class="se-spec-box full-span">
            <span class="sb-label">Deneyap Kart Pin Bağlantısı</span>
            <strong class="sb-val" style="color:#06b6d4">📍 ${s.pins}</strong>
          </div>
        </div>

        <!-- Çalışma Prensibi -->
        <div class="se-section">
          <h4>🔬 ÇALIŞMA PRENSİBİ</h4>
          <p class="se-text">${s.workingPrinciple}</p>
        </div>

        <!-- Kullanım Alanları -->
        <div class="se-section">
          <h4>💡 KULLANIM ALANLARI</h4>
          <div class="se-tags-wrap">
            ${(s.usageAreas || []).map(u => `<span class="se-tag-pill">${u}</span>`).join('')}
          </div>
        </div>

        <!-- CANLI İNTERAKTİF SENSÖR TEST KUTUSU -->
        <div class="se-section se-interactive-sandbox">
          <div class="sandbox-header">
            <h4>🎮 CANLI SENSÖR SİMÜLATÖRÜ</h4>
            <span class="sandbox-badge">Anlık Test</span>
          </div>
          <div class="sandbox-body" id="sandbox-body">
            ${this.renderInteractiveWidget(s)}
          </div>
        </div>

        <!-- Arduino C++ Örnek Kodu -->
        <div class="se-section">
          <div class="code-box-header">
            <h4>💻 ARDUINO C++ ÖRNEK KODU</h4>
            <button class="se-btn-copy" id="se-btn-copy-code">Kodu Kopyala</button>
          </div>
          <div class="se-code-wrapper">
            <pre><code id="se-code-snippet">${this.escapeHTML(s.codeSnippet)}</code></pre>
          </div>
        </div>
      </div>
    `;

    this.bindDetailEvents(s);
  }

  renderInteractiveWidget(sensor) {
    switch (sensor.interactiveType) {
      case 'imu':
        return `
          <div class="widget-imu">
            <div class="widget-imu-ball-wrap">
              <div class="widget-imu-ball" id="w-imu-ball"></div>
            </div>
            <div class="widget-controls">
              <label>Roll (X Açısı): <strong id="w-lbl-roll">0°</strong></label>
              <input type="range" min="-45" max="45" value="0" id="w-slider-roll" class="se-slider">
              <label>Pitch (Y Açısı): <strong id="w-lbl-pitch">0°</strong></label>
              <input type="range" min="-45" max="45" value="0" id="w-slider-pitch" class="se-slider">
            </div>
          </div>
        `;

      case 'sound':
        return `
          <div class="widget-sound">
            <div class="sound-meter">
              <div class="sound-bar" id="w-sound-bar" style="width: 45%;"></div>
            </div>
            <div class="sound-labels">
              <span>Ses Seviyesi: <strong id="w-lbl-db">45 dB</strong></span>
              <span id="w-lbl-sound-status">Normal Ortam</span>
            </div>
            <input type="range" min="30" max="100" value="45" id="w-slider-sound" class="se-slider">
          </div>
        `;

      case 'oled':
        return `
          <div class="widget-oled">
            <canvas id="w-oled-canvas" width="128" height="64" class="w-oled-screen"></canvas>
            <div class="widget-oled-input">
              <input type="text" id="w-oled-text" value="DENEYAP KART" placeholder="Ekrana bir şey yazın..." />
              <button id="w-oled-btn-send">Ekrana Yaz</button>
            </div>
          </div>
        `;

      case 'distance':
        return `
          <div class="widget-distance">
            <div class="radar-visual">
              <div class="radar-blip" id="w-radar-blip" style="left: 25%;"></div>
            </div>
            <div class="dist-stat">
              <span>Hedef Engel Mesafesi: <strong id="w-lbl-dist">25 cm</strong></span>
            </div>
            <input type="range" min="2" max="100" value="25" id="w-slider-dist" class="se-slider">
          </div>
        `;

      case 'light':
        return `
          <div class="widget-light">
            <div class="light-icon" id="w-light-icon">☀️</div>
            <div class="light-stat">
              <span>ADC Değeri (0-4095): <strong id="w-lbl-lux">2800</strong></span>
              <span id="w-lbl-lux-state">Gündüz (Aydınlık)</span>
            </div>
            <input type="range" min="200" max="4000" value="2800" id="w-slider-lux" class="se-slider">
          </div>
        `;

      case 'pot':
        return `
          <div class="widget-pot">
            <div class="pot-read">
              <span>Açı: <strong id="w-lbl-deg">135°</strong></span>
              <span>Gerilim: <strong id="w-lbl-volt">1.65V</strong></span>
              <span>PWM: <strong id="w-lbl-pwm">128</strong></span>
            </div>
            <input type="range" min="0" max="4095" value="2048" id="w-slider-pot" class="se-slider">
          </div>
        `;

      case 'temp_hum':
        return `
          <div class="widget-climate">
            <div class="climate-gauges">
              <div class="gauge-box">
                <span class="gb-icon">🌡️</span>
                <span class="gb-title">Sıcaklık</span>
                <strong class="gb-val" id="w-lbl-temp">24°C</strong>
                <input type="range" min="0" max="50" value="24" id="w-slider-temp" class="se-slider">
              </div>
              <div class="gauge-box">
                <span class="gb-icon">💧</span>
                <span class="gb-title">Bağıl Nem</span>
                <strong class="gb-val" id="w-lbl-hum">%55</strong>
                <input type="range" min="10" max="95" value="55" id="w-slider-hum" class="se-slider">
              </div>
            </div>
          </div>
        `;

      case 'motion':
        return `
          <div class="widget-motion">
            <div class="motion-status-box" id="w-motion-status">
              <span id="w-motion-icon">🟢</span>
              <span id="w-motion-text">Ortam Sakin (Hareket Yok)</span>
            </div>
            <button class="se-btn-action" id="w-btn-trigger-motion">İnsan Hareketi Simüle Et (Tıkla)</button>
          </div>
        `;

      case 'gas':
        return `
          <div class="widget-gas">
            <div class="gas-meter">
              <div class="gas-bar" id="w-gas-bar" style="width: 25%;"></div>
            </div>
            <div class="gas-stat">
              <span>Gaz Konsantrasyonu: <strong id="w-lbl-gas">320 PPM</strong></span>
              <span id="w-lbl-gas-alert" style="color:#10b981">Güvenli Düzey</span>
            </div>
            <input type="range" min="100" max="4000" value="320" id="w-slider-gas" class="se-slider">
          </div>
        `;

      case 'color':
        return `
          <div class="widget-color">
            <div class="color-preview-box" id="w-color-preview" style="background:#06b6d4;"></div>
            <div class="color-controls">
              <label>Bir Renk Seçin:</label>
              <input type="color" id="w-color-picker" value="#06b6d4" class="color-picker-input">
              <div class="rgb-readout" id="w-rgb-readout">R: 6 | G: 182 | B: 212</div>
            </div>
          </div>
        `;

      case 'soil':
        return `
          <div class="widget-soil">
            <div class="soil-status" id="w-soil-status">
              <span>Toprak Durumu: <strong id="w-lbl-soil-state">İdeal Nemli 🌱</strong></span>
            </div>
            <input type="range" min="0" max="100" value="60" id="w-slider-soil" class="se-slider">
          </div>
        `;

      case 'line':
        return `
          <div class="widget-line">
            <div class="line-track">
              <div class="track-line"></div>
              <div class="track-robot" id="w-track-robot"></div>
            </div>
            <div class="line-status" id="w-lbl-line-state">Beyaz Zemin (LOW)</div>
            <button class="se-btn-action" id="w-btn-toggle-line">Siyah Çizgiye Geçir / Çıkart</button>
          </div>
        `;

      default:
        return `<p class="se-hint">Bu sensör için canlı simülatör hazır.</p>`;
    }
  }

  bindDetailEvents(sensor) {
    // Koda Kopyala Butonu
    const copyBtn = this.container.querySelector('#se-btn-copy-code');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard?.writeText(sensor.codeSnippet);
        copyBtn.textContent = 'Kopyalandı! ✓';
        setTimeout(() => copyBtn.textContent = 'Kodu Kopyala', 1800);
        audioSynth.playSuccess();
      });
    }

    // Derse Git Butonu
    const gotoBtn = this.container.querySelector('#btn-goto-lesson');
    if (gotoBtn) {
      gotoBtn.addEventListener('click', () => {
        const lessonId = gotoBtn.dataset.lesson;
        audioSynth.playSuccess();
        this.onSelectLesson(lessonId);
      });
    }

    // İnteraktif Widget Olayları
    this.bindWidgetInteractions(sensor);
  }

  bindWidgetInteractions(sensor) {
    // 1. IMU
    const rollSlider = this.container.querySelector('#w-slider-roll');
    const pitchSlider = this.container.querySelector('#w-slider-pitch');
    if (rollSlider && pitchSlider) {
      const update = () => {
        const r = rollSlider.value;
        const p = pitchSlider.value;
        this.container.querySelector('#w-lbl-roll').textContent = `${r}°`;
        this.container.querySelector('#w-lbl-pitch').textContent = `${p}°`;
        const ball = this.container.querySelector('#w-imu-ball');
        if (ball) {
          ball.style.transform = `translate(calc(-50% + ${r * 0.8}px), calc(-50% + ${p * 0.8}px))`;
        }
      };
      rollSlider.addEventListener('input', update);
      pitchSlider.addEventListener('input', update);
    }

    // 2. Sound
    const soundSlider = this.container.querySelector('#w-slider-sound');
    if (soundSlider) {
      soundSlider.addEventListener('input', (e) => {
        const db = e.target.value;
        this.container.querySelector('#w-lbl-db').textContent = `${db} dB`;
        this.container.querySelector('#w-sound-bar').style.width = `${db}%`;
        const st = this.container.querySelector('#w-lbl-sound-status');
        if (db > 70) {
          st.textContent = 'Yüksek Gürültü! 🚨';
          st.style.color = '#ef4444';
        } else {
          st.textContent = 'Normal Ortam';
          st.style.color = '#10b981';
        }
      });
    }

    // 3. OLED
    const oledCanvas = this.container.querySelector('#w-oled-canvas');
    if (oledCanvas) {
      const drawOled = (text) => {
        const ctx = oledCanvas.getContext('2d');
        ctx.fillStyle = '#05070a';
        ctx.fillRect(0, 0, 128, 64);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('DENEYAP OLED 0x7A', 10, 14);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`> ${text}`, 10, 36);
      };
      drawOled('DENEYAP KART');

      const oledInput = this.container.querySelector('#w-oled-text');
      const oledBtn = this.container.querySelector('#w-oled-btn-send');
      if (oledBtn && oledInput) {
        oledBtn.addEventListener('click', () => {
          drawOled(oledInput.value || 'OLED TEST');
          audioSynth.playSnap();
        });
      }
    }

    // 4. Distance
    const distSlider = this.container.querySelector('#w-slider-dist');
    if (distSlider) {
      distSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        this.container.querySelector('#w-lbl-dist').textContent = `${val} cm`;
        this.container.querySelector('#w-radar-blip').style.left = `${Math.min(val, 90)}%`;
      });
    }

    // 5. Light
    const luxSlider = this.container.querySelector('#w-slider-lux');
    if (luxSlider) {
      luxSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        this.container.querySelector('#w-lbl-lux').textContent = val;
        const icon = this.container.querySelector('#w-light-icon');
        const st = this.container.querySelector('#w-lbl-lux-state');
        if (val < 1500) {
          icon.textContent = '🌙';
          st.textContent = 'Gece (Karanlık)';
          st.style.color = '#38bdf8';
        } else {
          icon.textContent = '☀️';
          st.textContent = 'Gündüz (Aydınlık)';
          st.style.color = '#f59e0b';
        }
      });
    }

    // 6. Potentiometer
    const potSlider = this.container.querySelector('#w-slider-pot');
    if (potSlider) {
      potSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        const deg = Math.round((val / 4095) * 270);
        const volt = ((val / 4095) * 3.3).toFixed(2);
        const pwm = Math.round((val / 4095) * 255);
        this.container.querySelector('#w-lbl-deg').textContent = `${deg}°`;
        this.container.querySelector('#w-lbl-volt').textContent = `${volt}V`;
        this.container.querySelector('#w-lbl-pwm').textContent = pwm;
      });
    }

    // 7. Temperature & Humidity
    const tempSlider = this.container.querySelector('#w-slider-temp');
    const humSlider = this.container.querySelector('#w-slider-hum');
    if (tempSlider && humSlider) {
      tempSlider.addEventListener('input', (e) => {
        this.container.querySelector('#w-lbl-temp').textContent = `${e.target.value}°C`;
      });
      humSlider.addEventListener('input', (e) => {
        this.container.querySelector('#w-lbl-hum').textContent = `%${e.target.value}`;
      });
    }

    // 8. Motion
    const btnMotion = this.container.querySelector('#w-btn-trigger-motion');
    if (btnMotion) {
      btnMotion.addEventListener('click', () => {
        const icon = this.container.querySelector('#w-motion-icon');
        const text = this.container.querySelector('#w-motion-text');
        icon.textContent = '🚨';
        text.textContent = 'HAREKET ALGILANDI! (HIGH)';
        text.style.color = '#ef4444';
        audioSynth.playSnap();
        setTimeout(() => {
          icon.textContent = '🟢';
          text.textContent = 'Ortam Sakin (Hareket Yok)';
          text.style.color = '#94a3b8';
        }, 2500);
      });
    }

    // 9. Gas
    const gasSlider = this.container.querySelector('#w-slider-gas');
    if (gasSlider) {
      gasSlider.addEventListener('input', (e) => {
        const ppm = e.target.value;
        this.container.querySelector('#w-lbl-gas').textContent = `${ppm} PPM`;
        const pct = Math.min((ppm / 4000) * 100, 100);
        this.container.querySelector('#w-gas-bar').style.width = `${pct}%`;
        const alert = this.container.querySelector('#w-lbl-gas-alert');
        if (ppm > 2000) {
          alert.textContent = 'TEHLİKE: Gaz Kaçağı!';
          alert.style.color = '#ef4444';
        } else {
          alert.textContent = 'Güvenli Düzey';
          alert.style.color = '#10b981';
        }
      });
    }

    // 10. Color
    const colorPicker = this.container.querySelector('#w-color-picker');
    if (colorPicker) {
      colorPicker.addEventListener('input', (e) => {
        const hex = e.target.value;
        this.container.querySelector('#w-color-preview').style.background = hex;
        // Hex to RGB
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        this.container.querySelector('#w-rgb-readout').textContent = `R: ${r} | G: ${g} | B: ${b}`;
      });
    }

    // 11. Soil
    const soilSlider = this.container.querySelector('#w-slider-soil');
    if (soilSlider) {
      soilSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        const st = this.container.querySelector('#w-lbl-soil-state');
        if (val < 25) {
          st.textContent = 'Kuru Toprak! Sulama Gerekli ⚠️';
          st.style.color = '#f59e0b';
        } else if (val > 80) {
          st.textContent = 'Çok Islak / Doygun 💧';
          st.style.color = '#38bdf8';
        } else {
          st.textContent = 'İdeal Nemli 🌱';
          st.style.color = '#10b981';
        }
      });
    }

    // 12. Line
    const btnLine = this.container.querySelector('#w-btn-toggle-line');
    if (btnLine) {
      let onBlack = false;
      btnLine.addEventListener('click', () => {
        onBlack = !onBlack;
        const robot = this.container.querySelector('#w-track-robot');
        const st = this.container.querySelector('#w-lbl-line-state');
        if (onBlack) {
          robot.style.left = '50%';
          st.textContent = 'Siyah Çizgi Üzerinde (HIGH)';
          st.style.color = '#38bdf8';
        } else {
          robot.style.left = '15%';
          st.textContent = 'Beyaz Zemin (LOW)';
          st.style.color = '#94a3b8';
        }
        audioSynth.playClick();
      });
    }
  }

  escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
