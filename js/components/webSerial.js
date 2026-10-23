/**
 * Web Serial API ile Gerçek Deneyap Karta USB Bağlantısı
 */
export class WebSerialManager {
  constructor(options = {}) {
    this.serialMonitor = options.serialMonitor || null;
    this.onStatusChange = options.onStatusChange || (() => {});
    this.port = null;
    this.reader = null;
    this.writer = null;
    this.connected = false;
    this.keepReading = false;
  }

  isSupported() {
    return typeof navigator !== 'undefined' && 'serial' in navigator;
  }

  isConnected() {
    return this.connected;
  }

  async connect(baudRate = 115200) {
    if (!this.isSupported()) {
      alert('Tarayıcınız Web Serial API desteklemiyor. Lütfen güncel Google Chrome veya Microsoft Edge kullanın.');
      return false;
    }

    try {
      // Kullanıcıdan USB portu seçmesini iste
      this.port = await navigator.serial.requestPort({
        // ESP32 USB VID/PID filtreleri eklenebilir veya tüm cihazlara izin verilir
      });

      await this.port.open({ baudRate });
      this.connected = true;
      this.keepReading = true;
      this.onStatusChange(true);

      if (this.serialMonitor) {
        this.serialMonitor.logSystem(`Gerçek Deneyap Kart USB portuna bağlandı (${baudRate} baud).`);
      }

      // Okuma döngüsünü başlat
      this.startReading();
      return true;
    } catch (err) {
      console.warn('Seri port bağlantı hatası:', err);
      if (this.serialMonitor) {
        this.serialMonitor.logError(`Port bağlantısı kurulamadı: ${err.message}`);
      }
      this.connected = false;
      this.onStatusChange(false);
      return false;
    }
  }

  async startReading() {
    while (this.port && this.port.readable && this.keepReading) {
      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable);
      this.reader = textDecoder.readable.getReader();

      try {
        while (true) {
          const { value, done } = await this.reader.read();
          if (done) break;
          if (value && this.serialMonitor) {
            this.serialMonitor.print(value, false);
          }
        }
      } catch (error) {
        console.error('Seri port veri akışı hatası:', error);
      } finally {
        this.reader.releaseLock();
      }
    }
  }

  async send(text) {
    if (!this.port || !this.port.writable || !this.connected) return;
    const encoder = new TextEncoder();
    const writer = this.port.writable.getWriter();
    try {
      await writer.write(encoder.encode(text + '\n'));
    } catch (e) {
      console.error('Seri port yazma hatası:', e);
    } finally {
      writer.releaseLock();
    }
  }

  async disconnect() {
    this.keepReading = false;
    if (this.reader) {
      try { await this.reader.cancel(); } catch (e) {}
    }
    if (this.port) {
      try { await this.port.close(); } catch (e) {}
      this.port = null;
    }
    this.connected = false;
    this.onStatusChange(false);
    if (this.serialMonitor) {
      this.serialMonitor.logSystem('Gerçek kart bağlantısı sonlandırıldı.');
    }
  }
}
