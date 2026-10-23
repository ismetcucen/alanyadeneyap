import { audioSynth } from './audioSynth.js';
import { WebSerialManager } from './webSerial.js';

export class SerialMonitor {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = options;
    this.baudRate = 115200;
    this.autoScroll = true;
    this.showTimestamp = false;
    this.history = [];
    this.onSend = options.onSend || (() => {});

    this.webSerial = new WebSerialManager({
      serialMonitor: this,
      onStatusChange: (connected) => {
        const usbBtn = this.container.querySelector('#sm-btn-usb');
        if (usbBtn) {
          usbBtn.textContent = connected ? '🔌 Bağlantıyı Kes' : '🔌 Gerçek Kart (USB)';
          usbBtn.classList.toggle('connected', connected);
        }
      }
    });

    this.initDOM();
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="serial-monitor-wrap">
        <!-- Terminal Üst Barı -->
        <div class="sm-topbar">
          <div class="sm-status">
            <span class="sm-dot"></span>
            <strong>SERİ MONİTÖR</strong>
            <span class="sm-baud-badge" id="sm-baud-label">115200 baud</span>
          </div>
          <div class="sm-actions">
            <button class="sm-tool-btn sm-btn-usb" id="sm-btn-usb" title="USB ile Gerçek Deneyap Karta Bağlan">🔌 Gerçek Kart (USB)</button>
            <button class="sm-tool-btn" id="sm-btn-timestamp" title="Zaman Damgası Göster">🕒 Saat</button>
            <button class="sm-tool-btn" id="sm-btn-clear" title="Ekranı Temizle">🗑️ Temizle</button>
            <button class="sm-tool-btn" id="sm-btn-copy" title="Tümünü Kopyala">📋 Kopyala</button>
          </div>
        </div>

        <!-- Terminal Satırları -->
        <div class="sm-console-output" id="sm-output" role="log" aria-live="polite">
          <div class="sm-line sm-sys">Deneyap Kart Seri Terminali Hazır (115200 baud).</div>
        </div>

        <!-- TX Veri Gönderme Çubuğu -->
        <form class="sm-input-row" id="sm-send-form">
          <input type="text" id="sm-tx-input" class="sm-input" placeholder="Karta mesaj gönder (TX)..." autocomplete="off" />
          <button type="submit" class="sm-send-btn">Gönder</button>
        </form>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // USB Gerçek Kart Bağlantısı
    this.container.querySelector('#sm-btn-usb')?.addEventListener('click', async () => {
      if (this.webSerial.isConnected()) {
        await this.webSerial.disconnect();
      } else {
        await this.webSerial.connect();
      }
      audioSynth.playClick();
    });

    this.container.querySelector('#sm-btn-clear').addEventListener('click', () => {
      this.clear();
      audioSynth.playClick();
    });

    this.container.querySelector('#sm-btn-copy').addEventListener('click', () => {
      const text = this.history.map(h => h.text).join('\n');
      navigator.clipboard?.writeText(text);
      const btn = this.container.querySelector('#sm-btn-copy');
      btn.textContent = 'Kopyalandı! ✓';
      setTimeout(() => btn.textContent = '📋 Kopyala', 1800);
      audioSynth.playSuccess();
    });

    const tsBtn = this.container.querySelector('#sm-btn-timestamp');
    tsBtn.addEventListener('click', () => {
      this.showTimestamp = !this.showTimestamp;
      tsBtn.classList.toggle('active', this.showTimestamp);
      this.reRender();
      audioSynth.playClick();
    });

    // TX Gönderimi
    this.container.querySelector('#sm-send-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const input = this.container.querySelector('#sm-tx-input');
      const val = input.value.trim();
      if (!val) return;
      this.logTX(val);
      this.onSend(val);
      if (this.webSerial.isConnected()) {
        this.webSerial.send(val);
      }
      input.value = '';
      audioSynth.playSnap();
    });
  }

  print(text, isLn = true) {
    const timeStr = new Date().toLocaleTimeString('tr-TR', { hour12: false });
    this.history.push({ type: 'rx', text, time: timeStr, isLn });
    this.appendDOM({ type: 'rx', text, time: timeStr });
  }

  logSystem(text) {
    const timeStr = new Date().toLocaleTimeString('tr-TR', { hour12: false });
    this.history.push({ type: 'sys', text, time: timeStr });
    this.appendDOM({ type: 'sys', text, time: timeStr });
  }

  logError(text) {
    const timeStr = new Date().toLocaleTimeString('tr-TR', { hour12: false });
    this.history.push({ type: 'err', text, time: timeStr });
    this.appendDOM({ type: 'err', text, time: timeStr });
  }

  logTX(text) {
    const timeStr = new Date().toLocaleTimeString('tr-TR', { hour12: false });
    this.history.push({ type: 'tx', text, time: timeStr });
    this.appendDOM({ type: 'tx', text: `> ${text}`, time: timeStr });
  }

  appendDOM(item) {
    const output = this.container.querySelector('#sm-output');
    if (!output) return;

    const line = document.createElement('div');
    line.className = `sm-line sm-${item.type}`;
    const tsHtml = this.showTimestamp ? `<span class="sm-ts">[${item.time}]</span> ` : '';
    line.innerHTML = `${tsHtml}${this.escapeHTML(item.text)}`;

    output.appendChild(line);

    // Otomatik kaydırma
    if (this.autoScroll) {
      output.scrollTop = output.scrollHeight;
    }
  }

  clear() {
    this.history = [];
    const output = this.container.querySelector('#sm-output');
    if (output) {
      output.innerHTML = '<div class="sm-line sm-sys">Seri Monitör temizlendi.</div>';
    }
  }

  reRender() {
    const output = this.container.querySelector('#sm-output');
    if (!output) return;
    output.innerHTML = '';
    this.history.forEach(item => {
      const line = document.createElement('div');
      line.className = `sm-line sm-${item.type}`;
      const tsHtml = this.showTimestamp ? `<span class="sm-ts">[${item.time}]</span> ` : '';
      line.innerHTML = `${tsHtml}${this.escapeHTML(item.text)}`;
      output.appendChild(line);
    });
    output.scrollTop = output.scrollHeight;
  }

  escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  getAllText() {
    return this.history.map(h => h.text).join('\n');
  }
}
