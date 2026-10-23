/**
 * Sanal Arduino C++ Yürütme Motoru (Virtual Arduino Engine)
 * setup() ve loop() döngülerini, pin G/Ç işlemlerini, Deneyap dahili donanımlarını,
 * OLED kütüphanesini ve Seri Monitörü tarayıcıda canlı simüle eder.
 */
export class ArduinoEngine {
  constructor(options = {}) {
    this.simulator = options.simulator || null;
    this.boardViewer = options.boardViewer || null;
    this.serialMonitor = options.serialMonitor || null;
    this.onStatusChange = options.onStatusChange || (() => {});

    this.running = false;
    this.paused = false;
    this.timerId = null;
    this.executionDelay = 10; // Döngü hız kontrolü

    // Sanal Hafıza ve Değişkenler
    this.pinModes = {};
    this.pinOutputs = {};
    this.rgbOutputs = { r: 1, g: 1, b: 1 }; // Aktif LOW (1 = Kapalı, 0 = Açık)
    this.variables = {};
  }

  setSimulator(sim) {
    this.simulator = sim;
  }

  setBoardViewer(bv) {
    this.boardViewer = bv;
  }

  setSerialMonitor(sm) {
    this.serialMonitor = sm;
  }

  isRunning() {
    return this.running;
  }

  /**
   * C++ Kodunu Analiz Eder ve Yürütmeye Başlar
   */
  start(code) {
    this.stop();
    this.running = true;
    this.paused = false;
    this.onStatusChange('running');

    if (this.serialMonitor) {
      this.serialMonitor.logSystem('Sanal Deneyap Kart baslatiliyor...');
      this.serialMonitor.logSystem('ESP32 Dual-Core @ 240MHz · 4MB Flash');
    }

    // Kodu parse et
    try {
      this.executeProgram(code);
    } catch (err) {
      console.error('Arduino Motoru Hatası:', err);
      if (this.serialMonitor) {
        this.serialMonitor.logError(`Hata: ${err.message}`);
      }
      this.stop();
    }
  }

  stop() {
    this.running = false;
    this.paused = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.simulator) {
      this.simulator.setBuzzer(0);
    }
    this.onStatusChange('stopped');
    if (this.serialMonitor) {
      this.serialMonitor.logSystem('Simulasyon durduruldu.');
    }
  }

  /**
   * Arduino setup() ve loop() Bloklarını Ayrıştırıp Sırayla Koşturur
   */
  async executeProgram(code) {
    // Yorum satırlarını temizle (Regex)
    const cleanCode = code
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');

    // setup() gövdesini bul
    const setupMatch = cleanCode.match(/void\s+setup\s*\(\s*\)\s*\{([\s\S]*?)\}(?=\s*void|\s*$)/);
    const loopMatch = cleanCode.match(/void\s+loop\s*\(\s*\)\s*\{([\s\S]*?)\}(?=\s*void|\s*$)/);

    const setupBody = setupMatch ? setupMatch[1] : '';
    const loopBody = loopMatch ? loopMatch[1] : '';

    // 1. Adım: setup() çalıştır
    await this.runCodeBlock(setupBody, 'setup');

    if (!this.running) return;

    // 2. Adım: loop() döngüsünü sürekli tekrarla
    const loopCycle = async () => {
      if (!this.running) return;
      if (!this.paused) {
        await this.runCodeBlock(loopBody, 'loop');
      }
      if (this.running) {
        this.timerId = setTimeout(loopCycle, this.executionDelay);
      }
    };

    loopCycle();
  }

  /**
   * Kod Bloğundaki Komutları Satır Satır / İfade İfade Yorumlar
   */
  async runCodeBlock(blockStr, context = 'loop') {
    if (!blockStr || !this.running) return;

    // İfadeleri noktalı virgül ve bloklara göre böl
    const statements = this.extractStatements(blockStr);

    for (const stmt of statements) {
      if (!this.running) break;
      await this.executeStatement(stmt.trim());
    }
  }

  extractStatements(code) {
    // Basit ve güvenilir C++ komut ayrıştırıcı
    const list = [];
    let current = '';
    let braceCount = 0;

    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;

      if (char === ';' && braceCount === 0) {
        if (current.trim()) list.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    if (current.trim()) list.push(current.trim());
    return list;
  }

  /**
   * Tekil Arduino C++ Komutunu Simüle Eder
   */
  async executeStatement(stmt) {
    if (!stmt || !this.running) return;

    // 1. delay(ms)
    const delayMatch = stmt.match(/delay\s*\(\s*(\d+)\s*\)/);
    if (delayMatch) {
      const ms = parseInt(delayMatch[1], 10);
      await this.sleep(Math.min(ms, 3000)); // Çok uzun beklemeleri makul sınırda tut
      return;
    }

    // 2. Serial.println(...) veya Serial.print(...)
    const serialMatch = stmt.match(/Serial\.(println|print)\s*\(([\s\S]*)\)/);
    if (serialMatch) {
      const isLn = serialMatch[1] === 'println';
      let arg = serialMatch[2].trim();
      let text = this.evaluateSerialArg(arg);
      if (this.serialMonitor) {
        this.serialMonitor.print(text, isLn);
      }
      return;
    }

    // 3. digitalWrite(pin, val)
    const dwMatch = stmt.match(/digitalWrite\s*\(\s*([a-zA-Z0-9_]+)\s*,\s*([a-zA-Z0-9_]+)\s*\)/);
    if (dwMatch) {
      const pin = dwMatch[1];
      const val = dwMatch[2].toUpperCase() === 'HIGH' || dwMatch[2] === '1' ? 255 : 0;
      this.handleDigitalWrite(pin, val);
      return;
    }

    // 4. analogWrite(pin, val)
    const awMatch = stmt.match(/analogWrite\s*\(\s*([a-zA-Z0-9_]+)\s*,\s*([^)]+)\s*\)/);
    if (awMatch) {
      const pin = awMatch[1];
      const val = Math.min(Math.max(this.evaluateMath(awMatch[2]), 0), 255);
      this.handleDigitalWrite(pin, val);
      return;
    }

    // 5. tone(pin, freq, duration)
    const toneMatch = stmt.match(/tone\s*\(\s*([a-zA-Z0-9_]+)\s*,\s*([^,)]+)(?:,\s*([^)]+))?\s*\)/);
    if (toneMatch) {
      const freq = this.evaluateMath(toneMatch[2]);
      const dur = toneMatch[3] ? this.evaluateMath(toneMatch[3]) : null;
      if (this.simulator) {
        this.simulator.setBuzzer(freq, dur);
      }
      return;
    }

    // 6. noTone(pin)
    if (stmt.includes('noTone(')) {
      if (this.simulator) {
        this.simulator.setBuzzer(0);
      }
      return;
    }

    // 6.5. servo.write(angle)
    const servoMatch = stmt.match(/([a-zA-Z0-9_]+)\.write\s*\(\s*([^)]+)\s*\)/);
    if (servoMatch && (servoMatch[1].toLowerCase().includes('servo') || stmt.includes('Servo') || stmt.includes('bariyer'))) {
      const angle = Math.min(Math.max(this.evaluateMath(servoMatch[2]), 0), 180);
      if (this.simulator && this.simulator.setServoAngle) {
        this.simulator.setServoAngle(angle);
      }
      return;
    }

    // 7. OLED Kütüphanesi Fonksiyonları (Deneyap OLED)
    if (stmt.includes('OLED.begin(') || stmt.includes('display.begin(')) {
      if (this.simulator) {
        this.simulator.state.oledActive = true;
        this.simulator.oledClear();
      }
      return;
    }

    if (stmt.includes('OLED.clearDisplay(') || stmt.includes('display.clearDisplay(')) {
      if (this.simulator) {
        this.simulator.oledClear();
      }
      return;
    }

    // OLED.setTextXY(r, c); OLED.putString("...");
    const putStringMatch = stmt.match(/OLED\.putString\s*\(\s*"(.*?)"\s*\)/);
    if (putStringMatch) {
      const text = putStringMatch[1];
      const row = this.variables['_oled_row'] || 0;
      const col = this.variables['_oled_col'] || 0;
      if (this.simulator) {
        this.simulator.oledPrint(row, col, text);
      }
      return;
    }

    const setTextXYMatch = stmt.match(/OLED\.setTextXY\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/);
    if (setTextXYMatch) {
      this.variables['_oled_row'] = parseInt(setTextXYMatch[1], 10);
      this.variables['_oled_col'] = parseInt(setTextXYMatch[2], 10);
      return;
    }

    // display.println("...") (Adafruit style)
    const oledPrintMatch = stmt.match(/display\.println\s*\(\s*F?\("?(.*?)"?\)\s*\)/);
    if (oledPrintMatch) {
      const text = oledPrintMatch[1];
      const row = this.variables['_oled_row'] || 0;
      if (this.simulator) {
        this.simulator.oledPrint(row, 0, text);
      }
      this.variables['_oled_row'] = (row + 1) % 8;
      return;
    }

    // OLED.setHorizontalScrollProperties(...)
    if (stmt.includes('setHorizontalScrollProperties(')) {
      const isRight = stmt.includes('Scroll_Right');
      if (this.simulator) {
        this.simulator.oledSetScroll(isRight ? 'right' : 'left', 0, 7, 4);
      }
      return;
    }

    // 8. Koşullu İfadeler (if (digitalRead(pin) == HIGH))
    if (stmt.startsWith('if')) {
      await this.handleIfStatement(stmt);
      return;
    }

    // 9. For Döngüsü (for (int i = 0; i < 8; i++))
    if (stmt.startsWith('for')) {
      await this.handleForLoop(stmt);
      return;
    }
  }

  handleDigitalWrite(pinName, val) {
    const p = pinName.toUpperCase();

    // Dahili RGB LED kontrolü (Aktif LOW: 0 ise Yanar, 255/HIGH ise Söner)
    if (p === 'LEDR' || p === 'KIRMIZI_LED' || p === 'D10') {
      this.rgbOutputs.r = (val === 0 ? 255 : 0);
      this.syncRGB();
      return;
    }
    if (p === 'LEDG' || p === 'YESIL_LED' || p === 'D13') {
      this.rgbOutputs.g = (val === 0 ? 255 : 0);
      this.syncRGB();
      return;
    }
    if (p === 'LEDB' || p === 'MAVI_LED' || p === 'D12') {
      this.rgbOutputs.b = (val === 0 ? 255 : 0);
      this.syncRGB();
      return;
    }

    // Harici Pinler (D0, D1, D2 vb.)
    const cleanPin = pinName.toLowerCase();
    this.pinOutputs[cleanPin] = val;
    if (this.simulator) {
      this.simulator.setPinState(cleanPin, val);
    }
  }

  syncRGB() {
    const { r, g, b } = this.rgbOutputs;
    if (this.simulator) {
      this.simulator.setRGB(r, g, b);
    }
    if (this.boardViewer) {
      this.boardViewer.setRGBColor(r, g, b);
    }
  }

  async handleIfStatement(stmt) {
    // Örnek: if (butonDurumu == HIGH) { ... } else { ... }
    const match = stmt.match(/if\s*\((.*?)\)\s*\{([\s\S]*?)\}(?:\s*else\s*\{([\s\S]*?)\})?/);
    if (!match) return;

    const conditionStr = match[1];
    const thenBlock = match[2];
    const elseBlock = match[3] || '';

    let isTrue = false;

    // digitalRead(butonPini) == HIGH
    if (conditionStr.includes('digitalRead(') || conditionStr.includes('butonDurumu')) {
      const btnPressed = this.simulator ? this.simulator.state.buttonPressed : false;
      const lookingForHigh = conditionStr.includes('HIGH') || conditionStr.includes('1');
      isTrue = (lookingForHigh && btnPressed) || (!lookingForHigh && !btnPressed);
    } 
    // isikDegeri < isikEsigi
    else if (conditionStr.includes('isikDegeri') || conditionStr.includes('ldr')) {
      const ldrVal = this.simulator ? this.simulator.state.ldrValue : 3000;
      const threshold = 1800;
      isTrue = (ldrVal < threshold);
    }
    // Eğim kontrolü (abs(egimX) > 20)
    else if (conditionStr.includes('egimX') || conditionStr.includes('egimY')) {
      const tilt = this.simulator ? this.simulator.state.imuTilt : { x: 0, y: 0 };
      isTrue = Math.abs(tilt.x) > 15 || Math.abs(tilt.y) > 15;
    }
    // Mesafe kontrolü (mesafe < 10)
    else if (conditionStr.includes('mesafe')) {
      const dist = this.simulator ? this.simulator.state.ultrasonicDistance : 40;
      if (conditionStr.includes('< 10')) isTrue = (dist < 10);
      else if (conditionStr.includes('< 30')) isTrue = (dist < 30);
      else isTrue = false;
    }

    if (isTrue) {
      await this.runCodeBlock(thenBlock);
    } else if (elseBlock) {
      await this.runCodeBlock(elseBlock);
    }
  }

  async handleForLoop(stmt) {
    const match = stmt.match(/for\s*\(\s*int\s+([a-zA-Z0-9_]+)\s*=\s*(\d+)\s*;\s*\1\s*<\s*(\d+)\s*;\s*\1\+\+\s*\)\s*\{([\s\S]*?)\}/);
    if (!match) return;

    const start = parseInt(match[2], 10);
    const end = parseInt(match[3], 10);
    const body = match[4];

    for (let i = start; i < end && this.running; i++) {
      // notalar[i] ifadesi varsa frekansı ayarla
      let replacedBody = body.replace(/notalar\[i\]/g, this.getNoteFreq(i));
      await this.runCodeBlock(replacedBody);
    }
  }

  getNoteFreq(index) {
    const notes = [262, 294, 330, 349, 392, 440, 494, 523];
    return notes[index % notes.length];
  }

  evaluateSerialArg(arg) {
    // Tırnak içindeki metinler: "Merhaba"
    const strMatch = arg.match(/^"(.*)"$/);
    if (strMatch) return strMatch[1];

    // Değişken isimleri
    if (arg === 'potDegeri') return String(this.simulator ? this.simulator.state.potValue : 2048);
    if (arg === 'parlaklik') return String(Math.round(((this.simulator ? this.simulator.state.potValue : 2048) / 4095) * 255));
    if (arg === 'isikDegeri') return String(this.simulator ? this.simulator.state.ldrValue : 3200);
    if (arg === 'mesafe') return String(this.simulator ? this.simulator.state.ultrasonicDistance : 45);
    if (arg === 'egimX') return String(this.simulator ? this.simulator.state.imuTilt.x : 0);
    if (arg === 'egimY') return String(this.simulator ? this.simulator.state.imuTilt.y : 0);
    if (arg === 'sesSeviyesi') return String(Math.floor(Math.random() * 45) + 35);
    if (arg === 'cevap') return 'Deneyap Kart: T3 Vakfi tarafindan gelistirilen milli ESP32 kartidir.';
    if (arg === 'soru') return 'Merhaba Gemini, Deneyap Kart nedir?';

    return arg;
  }

  evaluateMath(expr) {
    try {
      // Güvenli basit matematik çözümleyici
      const sanitized = String(expr).replace(/[^0-9+\-*/().]/g, '');
      return Function(`"use strict"; return (${sanitized})`)();
    } catch (e) {
      return parseInt(expr, 10) || 0;
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
