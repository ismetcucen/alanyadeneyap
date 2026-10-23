/**
 * Sürükle-Bırak Etkileşimli Blok Kodlama Motoru
 * Bloklar eklendikçe anlık Arduino C++ kodu üretir.
 */
import { audioSynth } from './audioSynth.js';

export class BlocklyEditor {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = options;
    this.onChange = options.onChange || (() => {});

    // Kullanıcının Program Bloğu Yığını (Stack)
    this.setupBlocks = [];
    this.loopBlocks = [];

    this.activeCategory = 'io';
    this.initDOM();
  }

  initDOM() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="blockly-editor-wrapper">
        <!-- Sol Blok Paleti -->
        <aside class="be-palette">
          <div class="be-palette-categories">
            <button class="be-cat-btn ${this.activeCategory === 'io' ? 'active' : ''}" data-cat="io">💡 Giriş/Çıkış</button>
            <button class="be-cat-btn ${this.activeCategory === 'sensors' ? 'active' : ''}" data-cat="sensors">📡 Sensörler</button>
            <button class="be-cat-btn ${this.activeCategory === 'display' ? 'active' : ''}" data-cat="display">📺 Ekran & Ses</button>
            <button class="be-cat-btn ${this.activeCategory === 'control' ? 'active' : ''}" data-cat="control">⏱️ Zaman & Mantık</button>
          </div>

          <div class="be-palette-items" id="be-palette-items">
            <!-- Dinamik blok şablonları -->
          </div>
        </aside>

        <!-- Sağ Çalışma Alanı (Workspace) -->
        <main class="be-workspace">
          <div class="be-workspace-header">
            <span class="be-ws-title">🧩 KOD BLOKLARI ÇALIŞMA ALANI</span>
            <div class="be-ws-tools">
              <button class="be-tool-btn" id="be-btn-clear" title="Blokları Temizle">🗑️ Temizle</button>
              <button class="be-tool-btn" id="be-btn-sample" title="Örnek Blokları Yükle">📋 Örnek Yükle</button>
            </div>
          </div>

          <div class="be-stacks-container">
            <!-- 1. setup() Bloğu -->
            <div class="be-main-block setup-block">
              <div class="be-main-header">
                <span class="main-badge">BAŞLANGIÇTA ÇALIŞTIR (setup)</span>
              </div>
              <div class="be-slot" id="be-slot-setup">
                <!-- setup blokları -->
              </div>
            </div>

            <!-- 2. loop() Bloğu -->
            <div class="be-main-block loop-block">
              <div class="be-main-header">
                <span class="main-badge">SÜREKLİ TEKRARLA (loop)</span>
              </div>
              <div class="be-slot" id="be-slot-loop">
                <!-- loop blokları -->
              </div>
            </div>
          </div>
        </main>
      </div>
    `;

    this.bindEvents();
    this.renderPalette();
    this.loadDefaultBlocks();
  }

  bindEvents() {
    // Kategori Butonları
    this.container.querySelectorAll('.be-cat-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.activeCategory = e.target.dataset.cat;
        this.container.querySelectorAll('.be-cat-btn').forEach(b => b.classList.toggle('active', b === btn));
        this.renderPalette();
        audioSynth.playClick();
      });
    });

    // Temizle Butonu
    this.container.querySelector('#be-btn-clear')?.addEventListener('click', () => {
      this.setupBlocks = [];
      this.loopBlocks = [];
      this.renderStacks();
      audioSynth.playSnap();
    });

    // Örnek Yükle Butonu
    this.container.querySelector('#be-btn-sample')?.addEventListener('click', () => {
      this.loadDefaultBlocks();
      audioSynth.playSuccess();
    });
  }

  renderPalette() {
    const itemsEl = this.container.querySelector('#be-palette-items');
    if (!itemsEl) return;

    const cat = this.activeCategory;
    let html = '';

    if (cat === 'io') {
      html = `
        <div class="be-chip chip-io" data-type="digitalWrite">
          <span>Pini</span>
          <strong class="val">[D0]</strong>
          <span>durumunu</span>
          <strong class="val">[YÜKSEK]</strong>
          <span>yap</span>
        </div>
        <div class="be-chip chip-io" data-type="analogWrite">
          <span>Pini</span>
          <strong class="val">[D0]</strong>
          <span>PWM parlaklığını</span>
          <strong class="val">[128]</strong>
          <span>yap</span>
        </div>
        <div class="be-chip chip-io" data-type="rgbLed">
          <span>Dahili RGB LED rengini</span>
          <strong class="val">[Kırmızı]</strong>
          <span>yap</span>
        </div>
      `;
    } else if (cat === 'sensors') {
      html = `
        <div class="be-chip chip-sensor" data-type="potRead">
          <span>Potansiyometre (A0) değerini oku ve Seri Porta yaz</span>
        </div>
        <div class="be-chip chip-sensor" data-type="ldrRead">
          <span>LDR Işık Sensörünü (A0) oku</span>
        </div>
        <div class="be-chip chip-sensor" data-type="sonarRead">
          <span>Ultrasonik Mesafe Sensörünü oku</span>
        </div>
        <div class="be-chip chip-sensor" data-type="imuRead">
          <span>Dahili IMU Su Terazisi açısını oku</span>
        </div>
      `;
    } else if (cat === 'display') {
      html = `
        <div class="be-chip chip-display" data-type="oledPrint">
          <span>OLED Ekrana</span>
          <strong class="val">["DENEYAP"]</strong>
          <span>yaz</span>
        </div>
        <div class="be-chip chip-display" data-type="oledClear">
          <span>OLED Ekranı Temizle</span>
        </div>
        <div class="be-chip chip-display" data-type="buzzerTone">
          <span>Buzzer (D6) ile</span>
          <strong class="val">[440 Hz]</strong>
          <span>nota çal</span>
        </div>
        <div class="be-chip chip-display" data-type="serialPrint">
          <span>Seri Monitöre</span>
          <strong class="val">["Merhaba"]</strong>
          <span>yazdır</span>
        </div>
      `;
    } else if (cat === 'control') {
      html = `
        <div class="be-chip chip-control" data-type="delay">
          <strong class="val">[1000]</strong>
          <span>milisaniye bekle</span>
        </div>
        <div class="be-chip chip-control" data-type="ifButton">
          <span>EĞER butona (D1) basıldıysa [Pini Yak]</span>
        </div>
        <div class="be-chip chip-control" data-type="servoAngle">
          <span>Servo Motoru (D6)</span>
          <strong class="val">[90°]</strong>
          <span>açısına çevir</span>
        </div>
      `;
    }

    itemsEl.innerHTML = html;

    // Palet tıklandığında bloğu loop yığınına ekle
    itemsEl.querySelectorAll('.be-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const type = chip.dataset.type;
        this.addBlockToStack('loop', type);
        audioSynth.playSnap();
      });
    });
  }

  addBlockToStack(stackName, type) {
    const block = {
      id: 'b_' + Math.random().toString(36).substr(2, 9),
      type,
      params: this.getDefaultParamsForType(type)
    };

    if (stackName === 'setup') {
      this.setupBlocks.push(block);
    } else {
      this.loopBlocks.push(block);
    }

    this.renderStacks();
    this.generateCppCode();
  }

  getDefaultParamsForType(type) {
    switch (type) {
      case 'digitalWrite': return { pin: 'D0', val: 'HIGH' };
      case 'analogWrite': return { pin: 'D0', val: 128 };
      case 'rgbLed': return { color: 'KIRMIZI' };
      case 'delay': return { ms: 1000 };
      case 'serialPrint': return { text: 'Merhaba Deneyap!' };
      case 'oledPrint': return { text: 'DENEYAP KART', row: 2 };
      case 'buzzerTone': return { freq: 440, duration: 250 };
      case 'servoAngle': return { pin: 'D6', angle: 90 };
      case 'ifButton': return { pin: 'D1', targetPin: 'D0' };
      default: return {};
    }
  }

  loadDefaultBlocks() {
    this.setupBlocks = [
      { id: 'b1', type: 'serialPrint', params: { text: 'Sistem Baslatildi' } }
    ];
    this.loopBlocks = [
      { id: 'b2', type: 'digitalWrite', params: { pin: 'D0', val: 'HIGH' } },
      { id: 'b3', type: 'delay', params: { ms: 1000 } },
      { id: 'b4', type: 'digitalWrite', params: { pin: 'D0', val: 'LOW' } },
      { id: 'b5', type: 'delay', params: { ms: 1000 } }
    ];
    this.renderStacks();
    this.generateCppCode();
  }

  renderStacks() {
    const setupSlot = this.container.querySelector('#be-slot-setup');
    const loopSlot = this.container.querySelector('#be-slot-loop');
    if (!setupSlot || !loopSlot) return;

    setupSlot.innerHTML = this.setupBlocks.map((b, i) => this.renderBlockHTML(b, 'setup', i)).join('');
    loopSlot.innerHTML = this.loopBlocks.map((b, i) => this.renderBlockHTML(b, 'loop', i)).join('');

    this.bindBlockEvents();
  }

  renderBlockHTML(b, stackName, index) {
    return `
      <div class="be-placed-block block-${b.type}" data-id="${b.id}" data-stack="${stackName}" data-index="${index}">
        <div class="block-controls">
          <button class="btn-move-up" title="Yukarı Taşı">▲</button>
          <button class="btn-move-down" title="Aşağı Taşı">▼</button>
          <button class="btn-del-block" title="Sil">×</button>
        </div>
        <div class="block-content">
          ${this.renderBlockInputs(b)}
        </div>
      </div>
    `;
  }

  renderBlockInputs(b) {
    switch (b.type) {
      case 'digitalWrite':
        return `
          <span>Pini</span>
          <select class="be-input-param" data-param="pin">
            <option value="D0" ${b.params.pin === 'D0' ? 'selected' : ''}>D0</option>
            <option value="D1" ${b.params.pin === 'D1' ? 'selected' : ''}>D1</option>
            <option value="D2" ${b.params.pin === 'D2' ? 'selected' : ''}>D2</option>
          </select>
          <span>durumunu</span>
          <select class="be-input-param" data-param="val">
            <option value="HIGH" ${b.params.val === 'HIGH' ? 'selected' : ''}>YÜKSEK (Açık)</option>
            <option value="LOW" ${b.params.val === 'LOW' ? 'selected' : ''}>DÜŞÜK (Kapalı)</option>
          </select>
          <span>yap</span>
        `;

      case 'analogWrite':
        return `
          <span>Pini</span>
          <select class="be-input-param" data-param="pin">
            <option value="D0">D0</option><option value="D1">D1</option>
          </select>
          <span>PWM Parlaklığını</span>
          <input type="number" min="0" max="255" value="${b.params.val}" class="be-input-param" data-param="val" style="width:55px;">
          <span>(0-255) yap</span>
        `;

      case 'rgbLed':
        return `
          <span>Dahili RGB LED Rengini</span>
          <select class="be-input-param" data-param="color">
            <option value="KIRMIZI" ${b.params.color === 'KIRMIZI' ? 'selected' : ''}>Kırmızı</option>
            <option value="YESIL" ${b.params.color === 'YESIL' ? 'selected' : ''}>Yeşil</option>
            <option value="MAVI" ${b.params.color === 'MAVI' ? 'selected' : ''}>Mavi</option>
            <option value="SARI" ${b.params.color === 'SARI' ? 'selected' : ''}>Sarı</option>
          </select>
          <span>yap</span>
        `;

      case 'delay':
        return `
          <input type="number" min="50" max="10000" step="50" value="${b.params.ms}" class="be-input-param" data-param="ms" style="width:65px;">
          <span>milisaniye bekle</span>
        `;

      case 'serialPrint':
        return `
          <span>Seri Monitöre Yazdır:</span>
          <input type="text" value="${b.params.text}" class="be-input-param" data-param="text" style="width:140px;">
        `;

      case 'oledPrint':
        return `
          <span>OLED Satırına</span>
          <input type="text" value="${b.params.text}" class="be-input-param" data-param="text" style="width:120px;">
          <span>yazdır</span>
        `;

      case 'buzzerTone':
        return `
          <span>Buzzer ile</span>
          <input type="number" min="100" max="2000" value="${b.params.freq}" class="be-input-param" data-param="freq" style="width:60px;">
          <span>Hz nota çal</span>
        `;

      case 'servoAngle':
        return `
          <span>Servo Motoru</span>
          <input type="number" min="0" max="180" value="${b.params.angle}" class="be-input-param" data-param="angle" style="width:50px;">
          <span>dereceye çevir</span>
        `;

      case 'ifButton':
        return `
          <span>EĞER Butona (D1) basıldıysa ➔ Pini (D0) Yak</span>
        `;

      case 'potRead':
        return `<span>Potansiyometre (A0) değerini oku ve Seri Porta yaz</span>`;
      case 'sonarRead':
        return `<span>Ultrasonik Mesafe Sensörünü oku (cm)</span>`;
      default:
        return `<span>${b.type} komutu</span>`;
    }
  }

  bindBlockEvents() {
    // Parametre değişimleri
    this.container.querySelectorAll('.be-input-param').forEach(input => {
      input.addEventListener('change', (e) => {
        const blockEl = e.target.closest('.be-placed-block');
        const id = blockEl.dataset.id;
        const stackName = blockEl.dataset.stack;
        const param = e.target.dataset.param;
        const val = e.target.value;

        const stack = stackName === 'setup' ? this.setupBlocks : this.loopBlocks;
        const blk = stack.find(b => b.id === id);
        if (blk) {
          blk.params[param] = val;
          this.generateCppCode();
        }
      });
    });

    // Yukarı / Aşağı Taşı
    this.container.querySelectorAll('.btn-move-up').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const blockEl = e.target.closest('.be-placed-block');
        const stackName = blockEl.dataset.stack;
        const index = parseInt(blockEl.dataset.index, 10);
        const stack = stackName === 'setup' ? this.setupBlocks : this.loopBlocks;

        if (index > 0) {
          const temp = stack[index];
          stack[index] = stack[index - 1];
          stack[index - 1] = temp;
          this.renderStacks();
          this.generateCppCode();
          audioSynth.playSnap();
        }
      });
    });

    this.container.querySelectorAll('.btn-move-down').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const blockEl = e.target.closest('.be-placed-block');
        const stackName = blockEl.dataset.stack;
        const index = parseInt(blockEl.dataset.index, 10);
        const stack = stackName === 'setup' ? this.setupBlocks : this.loopBlocks;

        if (index < stack.length - 1) {
          const temp = stack[index];
          stack[index] = stack[index + 1];
          stack[index + 1] = temp;
          this.renderStacks();
          this.generateCppCode();
          audioSynth.playSnap();
        }
      });
    });

    // Sil Butonu
    this.container.querySelectorAll('.btn-del-block').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const blockEl = e.target.closest('.be-placed-block');
        const id = blockEl.dataset.id;
        const stackName = blockEl.dataset.stack;
        if (stackName === 'setup') {
          this.setupBlocks = this.setupBlocks.filter(b => b.id !== id);
        } else {
          this.loopBlocks = this.loopBlocks.filter(b => b.id !== id);
        }
        this.renderStacks();
        this.generateCppCode();
        audioSynth.playClick();
      });
    });
  }

  /**
   * Blok Yığınından Gerçek Zamanlı C++ Kodunu Üretir
   */
  generateCppCode() {
    let cpp = `/*
 * Blok Motoru Tarafından Otomatik Üretilen Arduino C++ Kodu
 * Deneyap Kart Geliştirme Ekosistemi
 */\n\n`;

    // Gerekli Kütüphaneler
    const hasOled = [...this.setupBlocks, ...this.loopBlocks].some(b => b.type === 'oledPrint');
    if (hasOled) {
      cpp += `#include <Wire.h>\n#include <Deneyap_OLED.h>\nOLED oled;\n\n`;
    }

    // setup()
    cpp += `void setup() {\n`;
    cpp += `  Serial.begin(115200);\n`;
    cpp += `  pinMode(D0, OUTPUT);\n`;
    cpp += `  pinMode(D1, INPUT);\n`;
    cpp += `  pinMode(LEDR, OUTPUT);\n  pinMode(LEDG, OUTPUT);\n  pinMode(LEDB, OUTPUT);\n`;
    if (hasOled) {
      cpp += `  oled.begin(0x7A);\n  oled.clearDisplay();\n`;
    }

    this.setupBlocks.forEach(b => {
      cpp += this.blockToCpp(b, '  ');
    });

    cpp += `}\n\n`;

    // loop()
    cpp += `void loop() {\n`;
    this.loopBlocks.forEach(b => {
      cpp += this.blockToCpp(b, '  ');
    });
    cpp += `}\n`;

    this.onChange(cpp);
    return cpp;
  }

  blockToCpp(b, indent = '  ') {
    switch (b.type) {
      case 'digitalWrite':
        return `${indent}digitalWrite(${b.params.pin}, ${b.params.val});\n`;
      case 'analogWrite':
        return `${indent}analogWrite(${b.params.pin}, ${b.params.val});\n`;
      case 'delay':
        return `${indent}delay(${b.params.ms});\n`;
      case 'serialPrint':
        return `${indent}Serial.println("${b.params.text}");\n`;
      case 'oledPrint':
        return `${indent}oled.setTextXY(2, 0);\n${indent}oled.putString("${b.params.text}");\n`;
      case 'buzzerTone':
        return `${indent}tone(D6, ${b.params.freq}, ${b.params.duration});\n${indent}delay(${b.params.duration});\n`;
      case 'servoAngle':
        return `${indent}// Servo Açı: ${b.params.angle}°\n${indent}analogWrite(D6, map(${b.params.angle}, 0, 180, 25, 125));\n`;
      case 'rgbLed':
        if (b.params.color === 'KIRMIZI') return `${indent}digitalWrite(LEDR, LOW); digitalWrite(LEDG, HIGH); digitalWrite(LEDB, HIGH);\n`;
        if (b.params.color === 'YESIL') return `${indent}digitalWrite(LEDR, HIGH); digitalWrite(LEDG, LOW); digitalWrite(LEDB, HIGH);\n`;
        if (b.params.color === 'MAVI') return `${indent}digitalWrite(LEDR, HIGH); digitalWrite(LEDG, HIGH); digitalWrite(LEDB, LOW);\n`;
        if (b.params.color === 'SARI') return `${indent}digitalWrite(LEDR, LOW); digitalWrite(LEDG, LOW); digitalWrite(LEDB, HIGH);\n`;
        return '';
      case 'ifButton':
        return `${indent}if (digitalRead(D1) == HIGH) {\n${indent}  digitalWrite(D0, HIGH);\n${indent}} else {\n${indent}  digitalWrite(D0, LOW);\n${indent}}\n`;
      case 'potRead':
        return `${indent}int potVal = analogRead(A0);\n${indent}Serial.print("Pot: "); Serial.println(potVal);\n`;
      case 'sonarRead':
        return `${indent}digitalWrite(D2, HIGH); delayMicroseconds(10); digitalWrite(D2, LOW);\n${indent}long dist = pulseIn(D3, HIGH) * 0.034 / 2;\n${indent}Serial.print("Mesafe: "); Serial.println(dist);\n`;
      default:
        return '';
    }
  }
}
