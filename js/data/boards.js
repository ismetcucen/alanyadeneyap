/**
 * Deneyap Kart Ekosistemi Modelleri ve Pin Haritaları
 */
export const BOARDS_DATA = {
  'deneyap-kart': {
    id: 'deneyap-kart',
    name: 'Deneyap Kart (Orijinal v1 / v2)',
    badge: 'Amiral Gemisi · Çok Fonksiyonlu',
    mcu: 'ESP32-WROVER-B (Çift Çekirdek 240 MHz)',
    flash: '4 MB Flash / 8 MB PSRAM / 520 KB SRAM',
    wireless: 'Wi-Fi 802.11 b/g/n & Bluetooth v4.2 BR/EDR / BLE',
    sensors: [
      '6 Eksenli Ataletsel Ölçüm Birimi (LSM6DSM IMU: İvmeölçer + Jiroskop)',
      'Dahili MP34DT05 MEMS Sayısal Mikrofon',
      'Dahili Adreslenebilir RGB LED (WS2812B / Çok renkli)',
      'Li-Po Pil Şarj ve Koruma Devresi (Standart 2-pin JST)'
    ],
    usb: 'USB Type-C',
    i2cConnector: 'Deneyap I2C Kolay Bağlantı Konnektörü (JST-SH 1.0mm)',
    operatingVoltage: '3.3V (Giriş: 5V USB / 3.7V Li-Po / 7-12V Vin)',
    gpioCount: 24,
    description: 'T3 Vakfı ve Sanayi ve Teknoloji Bakanlığı öncülüğünde geliştirilen, dahili IMU sensörü, MEMS mikrofonu ve RGB LED\'i ile yapay zeka, IoT ve robotik projeleri için eksiksiz amiral gemisi kart.',
    pins: [
      { id: '3v3', name: '3V3', side: 'left', index: 1, type: 'power', gpio: null, functions: ['power'], voltage: '3.3V', desc: '3.3V Regüle Güç Çıkışı (Maks. 500mA)' },
      { id: 'gnd_1', name: 'GND', side: 'left', index: 2, type: 'power', gpio: null, functions: ['power'], voltage: '0V', desc: 'Toprak (Şasi / Eksi Hat)' },
      { id: 'd0', name: 'D0', side: 'left', index: 3, type: 'io', gpio: 21, functions: ['gpio', 'pwm', 'i2c'], voltage: '3.3V', desc: 'Genel Giriş/Çıkış, PWM, Standart I2C SDA pini', snippet: 'pinMode(D0, OUTPUT);\ndigitalWrite(D0, HIGH);' },
      { id: 'd1', name: 'D1', side: 'left', index: 4, type: 'io', gpio: 22, functions: ['gpio', 'pwm', 'i2c'], voltage: '3.3V', desc: 'Genel Giriş/Çıkış, PWM, Standart I2C SCL pini', snippet: 'pinMode(D1, OUTPUT);\ndigitalWrite(D1, HIGH);' },
      { id: 'd2', name: 'D2', side: 'left', index: 5, type: 'io', gpio: 19, functions: ['gpio', 'pwm', 'spi'], voltage: '3.3V', desc: 'Genel Giriş/Çıkış, PWM, SPI MISO pini', snippet: 'pinMode(D2, INPUT_PULLUP);' },
      { id: 'd3', name: 'D3', side: 'left', index: 6, type: 'io', gpio: 23, functions: ['gpio', 'pwm', 'spi'], voltage: '3.3V', desc: 'Genel Giriş/Çıkış, PWM, SPI MOSI pini', snippet: 'pinMode(D3, OUTPUT);' },
      { id: 'd4', name: 'D4', side: 'left', index: 7, type: 'io', gpio: 18, functions: ['gpio', 'pwm', 'spi'], voltage: '3.3V', desc: 'Genel Giriş/Çıkış, PWM, SPI Saat (SCK) pini', snippet: 'pinMode(D4, OUTPUT);' },
      { id: 'd5', name: 'D5', side: 'left', index: 8, type: 'io', gpio: 5, functions: ['gpio', 'pwm', 'spi'], voltage: '3.3V', desc: 'Genel Giriş/Çıkış, PWM, SPI Çip Seçimi (CS) pini', snippet: 'pinMode(D5, OUTPUT);' },
      { id: 'd6', name: 'D6', side: 'left', index: 9, type: 'io', gpio: 26, functions: ['gpio', 'pwm', 'adc', 'dac'], voltage: '3.3V', desc: 'DAC2 Analog Gerçek Çıkış, ADC2_CH9, PWM', snippet: 'dacWrite(D6, 128); // 1.65V çıkış' },
      { id: 'd7', name: 'D7', side: 'left', index: 10, type: 'io', gpio: 25, functions: ['gpio', 'pwm', 'adc', 'dac'], voltage: '3.3V', desc: 'DAC1 Analog Gerçek Çıkış, ADC2_CH8, PWM', snippet: 'dacWrite(D7, 255); // 3.3V çıkış' },
      { id: 'd8', name: 'D8', side: 'left', index: 11, type: 'io', gpio: 33, functions: ['gpio', 'pwm', 'adc', 'touch'], voltage: '3.3V', desc: 'Dokunmatik Pin T8, ADC1_CH5, PWM', snippet: 'int val = touchRead(D8);' },
      { id: 'd9', name: 'D9', side: 'left', index: 12, type: 'io', gpio: 32, functions: ['gpio', 'pwm', 'adc', 'touch'], voltage: '3.3V', desc: 'Dokunmatik Pin T9, ADC1_CH4, PWM', snippet: 'int val = touchRead(D9);' },

      { id: '5v', name: '5V', side: 'right', index: 1, type: 'power', gpio: null, functions: ['power'], voltage: '5V', desc: 'USB 5V Besleme Giriş/Çıkışı' },
      { id: 'gnd_2', name: 'GND', side: 'right', index: 2, type: 'power', gpio: null, functions: ['power'], voltage: '0V', desc: 'Toprak (Şasi / Eksi Hat)' },
      { id: 'vin', name: 'VIN', side: 'right', index: 3, type: 'power', gpio: null, functions: ['power'], voltage: '5-12V', desc: 'Harici Voltaj Girişi (7-12V DC Regülatöre gider)' },
      { id: 'd10', name: 'D10', side: 'right', index: 4, type: 'io', gpio: 4, functions: ['gpio', 'pwm', 'adc', 'touch'], voltage: '3.3V', desc: 'Dahili RGB LED Kırmızı / Touch T0 / ADC2_CH0', snippet: 'digitalWrite(LEDR, HIGH);' },
      { id: 'd11', name: 'D11', side: 'right', index: 5, type: 'io', gpio: 0, functions: ['gpio', 'pwm', 'adc', 'touch', 'boot'], voltage: '3.3V', desc: 'BOOT Butonu Pini / Touch T1 / ADC2_CH1', snippet: '// Boot strapping pini' },
      { id: 'd12', name: 'D12', side: 'right', index: 6, type: 'io', gpio: 2, functions: ['gpio', 'pwm', 'adc', 'touch'], voltage: '3.3V', desc: 'Dahili RGB LED Mavi / Touch T2 / ADC2_CH2', snippet: 'digitalWrite(LEDB, HIGH);' },
      { id: 'd13', name: 'D13', side: 'right', index: 7, type: 'io', gpio: 15, functions: ['gpio', 'pwm', 'adc', 'touch'], voltage: '3.3V', desc: 'Dahili RGB LED Yeşil / Touch T3 / ADC2_CH3', snippet: 'digitalWrite(LEDG, HIGH);' },
      { id: 'd14', name: 'D14', side: 'right', index: 8, type: 'io', gpio: 13, functions: ['gpio', 'pwm', 'adc', 'touch'], voltage: '3.3V', desc: 'Dokunmatik Pin T4 / ADC2_CH4 / PWM', snippet: 'pinMode(D14, OUTPUT);' },
      { id: 'd15', name: 'D15', side: 'right', index: 9, type: 'io', gpio: 12, functions: ['gpio', 'pwm', 'adc', 'touch'], voltage: '3.3V', desc: 'Dokunmatik Pin T5 / ADC2_CH5 / PWM', snippet: 'pinMode(D15, OUTPUT);' },
      { id: 'a0', name: 'A0', side: 'right', index: 10, type: 'io', gpio: 36, functions: ['gpio', 'adc'], voltage: '3.3V', desc: 'Yalnızca Giriş ADC1_CH0 (Analog Okuma 12-bit 0-4095)', snippet: 'int ham = analogRead(A0);' },
      { id: 'a1', name: 'A1', side: 'right', index: 11, type: 'io', gpio: 39, functions: ['gpio', 'adc'], voltage: '3.3V', desc: 'Yalnızca Giriş ADC1_CH3 (Sensor VN)', snippet: 'int ham = analogRead(A1);' },
      { id: 'a2', name: 'A2', side: 'right', index: 12, type: 'io', gpio: 34, functions: ['gpio', 'adc'], voltage: '3.3V', desc: 'Yalnızca Giriş ADC1_CH6', snippet: 'int ham = analogRead(A2);' }
    ],
    builtinComponents: [
      { name: 'Dahili RGB LED', pins: 'LEDR: D10 (GPIO4), LEDG: D13 (GPIO15), LEDB: D12 (GPIO2)', desc: 'Ters mantıkla (LOW ile yanar, HIGH ile söner) veya PWM ile 16 milyon renk üretir.' },
      { name: 'LSM6DSM 6-Eksen IMU', pins: 'I2C Adresi: 0x6A (SDA: D0, SCL: D1)', desc: '3 eksen ivmeölçer ±2/4/8/16g ve 3 eksen jiroskop ±125/250/500/1000/2000 dps.' },
      { name: 'MP34DT05 MEMS Mikrofon', pins: 'I2S Sayısal Ses Arayüzü', desc: 'Yüksek kaliteli ses kaydı, gürültü seviyesi tespiti ve sesli komut işleme.' },
      { name: 'Li-Po Şarj Devresi', pins: 'JST-PH 2.0mm Konnektör', desc: '3.7V Lityum Polimer pilleri USB takılıyken otomatik 500mA ile şarj eder.' }
    ]
  },

  'deneyap-kart-1a': {
    id: 'deneyap-kart-1a',
    name: 'Deneyap Kart 1A / 1A v2',
    badge: 'Yarışma & Robotik Odaklı',
    mcu: 'ESP32-WROOM-32E (240 MHz) / ESP32-S3 (v2)',
    flash: '4 MB Flash / 520 KB SRAM',
    wireless: 'Wi-Fi 802.11 b/g/n & BLE 5.0',
    sensors: [
      'Temel Eğitim ve TEKNOFEST Yarışmaları İçin Optimize Edilmiş Yapı',
      'Li-Po Pil Şarj Devresi',
      'Dahili Durum LED\'i'
    ],
    usb: 'USB Type-C',
    i2cConnector: 'Deneyap I2C Kolay Bağlantı Konnektörü',
    operatingVoltage: '3.3V',
    gpioCount: 22,
    description: 'Öğrenciler ve robotik takımları için maliyet ve stabilite optimizasyonu yapılmış, tüm motor sürücü ve sensör modülleriyle tam uyumlu Deneyap Kart 1A versiyonu.',
    pins: [
      { id: '3v3', name: '3V3', side: 'left', index: 1, type: 'power', functions: ['power'], voltage: '3.3V', desc: '3.3V Güç Çıkışı' },
      { id: 'gnd_1', name: 'GND', side: 'left', index: 2, type: 'power', functions: ['power'], voltage: '0V', desc: 'Toprak' },
      { id: 'd0', name: 'D0', side: 'left', index: 3, type: 'io', gpio: 21, functions: ['gpio', 'pwm', 'i2c'], voltage: '3.3V', desc: 'I2C SDA / PWM' },
      { id: 'd1', name: 'D1', side: 'left', index: 4, type: 'io', gpio: 22, functions: ['gpio', 'pwm', 'i2c'], voltage: '3.3V', desc: 'I2C SCL / PWM' },
      { id: 'd2', name: 'D2', side: 'left', index: 5, type: 'io', gpio: 19, functions: ['gpio', 'pwm', 'spi'], voltage: '3.3V', desc: 'SPI MISO' },
      { id: 'd3', name: 'D3', side: 'left', index: 6, type: 'io', gpio: 23, functions: ['gpio', 'pwm', 'spi'], voltage: '3.3V', desc: 'SPI MOSI' },
      { id: 'd4', name: 'D4', side: 'left', index: 7, type: 'io', gpio: 18, functions: ['gpio', 'pwm', 'spi'], voltage: '3.3V', desc: 'SPI SCK' },
      { id: 'd5', name: 'D5', side: 'left', index: 8, type: 'io', gpio: 5, functions: ['gpio', 'pwm', 'spi'], voltage: '3.3V', desc: 'SPI CS' },
      { id: '5v', name: '5V', side: 'right', index: 1, type: 'power', functions: ['power'], voltage: '5V', desc: 'USB 5V Besleme' },
      { id: 'gnd_2', name: 'GND', side: 'right', index: 2, type: 'power', functions: ['power'], voltage: '0V', desc: 'Toprak' },
      { id: 'a0', name: 'A0', side: 'right', index: 3, type: 'io', gpio: 36, functions: ['gpio', 'adc'], voltage: '3.3V', desc: 'ADC1 Girişi' },
      { id: 'a1', name: 'A1', side: 'right', index: 4, type: 'io', gpio: 39, functions: ['gpio', 'adc'], voltage: '3.3V', desc: 'ADC1 Girişi' }
    ],
    builtinComponents: [
      { name: 'Dahili Durum LED', pins: 'D10 (GPIO4)', desc: 'Kullanıcı programlanabilir test LED\'i.' },
      { name: 'Li-Po Şarj', pins: 'JST Konnektör', desc: 'Mobil robotlar için 3.7V batarya şarj sistemi.' }
    ]
  },

  'deneyap-mini': {
    id: 'deneyap-mini',
    name: 'Deneyap Mini / Mini v2',
    badge: 'Ultra Kompakt · Breadboard Dostu',
    mcu: 'ESP32-S2 (Tek Çekirdek 240 MHz) / ESP32-C3 RISC-V (v2)',
    flash: '4 MB Flash / 320 KB SRAM / Yerel USB OTG',
    wireless: 'Wi-Fi 802.11 b/g/n (v2 modelinde Bluetooth 5 BLE)',
    sensors: [
      'Dahili WS2812 Adreslenebilir RGB LED',
      'Ultra Düşük Güç Tüketimi (Deep Sleep < 15 µA)'
    ],
    usb: 'Yerel USB Type-C (HID Klavye/Fare olarak çalışabilir)',
    i2cConnector: 'Deneyap I2C Kolay Bağlantı Konnektörü',
    operatingVoltage: '3.3V',
    gpioCount: 18,
    description: 'Küçük projeler, giyilebilir teknoloji ve doğrudan breadboard üzerine takılabilen ince form faktörüyle dikkat çeken kompakt geliştirme kartı.',
    pins: [
      { id: '3v3', name: '3V3', side: 'left', index: 1, type: 'power', functions: ['power'], voltage: '3.3V', desc: '3.3V Çıkış' },
      { id: 'd0', name: 'D0', side: 'left', index: 2, type: 'io', gpio: 1, functions: ['gpio', 'pwm', 'adc', 'touch'], voltage: '3.3V', desc: 'ADC / Dokunmatik' },
      { id: 'd1', name: 'D1', side: 'left', index: 3, type: 'io', gpio: 2, functions: ['gpio', 'pwm', 'adc', 'touch'], voltage: '3.3V', desc: 'ADC / Dokunmatik' },
      { id: 'gnd', name: 'GND', side: 'right', index: 1, type: 'power', functions: ['power'], voltage: '0V', desc: 'Toprak' },
      { id: '5v', name: '5V', side: 'right', index: 2, type: 'power', functions: ['power'], voltage: '5V', desc: '5V Güç' }
    ],
    builtinComponents: [
      { name: 'Adreslenebilir RGB LED', pins: 'GPIO18', desc: 'Neopixel mimarisinde tek pinle renk kontrolü.' },
      { name: 'Yerel USB OTG', pins: 'D+/D- Hatları', desc: 'Sanal klavye, fare, oyun kumandası emülasyonu.' }
    ]
  },

  'deneyap-kart-g': {
    id: 'deneyap-kart-g',
    name: 'Deneyap Kart G (LoRa / Sub-GHz)',
    badge: 'Uzun Menzilli IoT & Tarım',
    mcu: 'ESP32-S3 + Semtech SX1262 LoRa Radyo Modülü',
    flash: '8 MB Flash / 8 MB PSRAM / 512 KB SRAM',
    wireless: 'LoRa 868 MHz (10+ km menzil) + Wi-Fi 802.11 b/g/n + BLE 5',
    sensors: [
      'Uzun Menzilli LoRa İletişimi',
      'Dahili SMA Harici Anten Konnektörü',
      'Ultra Düşük Güç Harcama Mimarisi'
    ],
    usb: 'USB Type-C',
    i2cConnector: 'Deneyap I2C Kolay Bağlantı Konnektörü',
    operatingVoltage: '3.3V',
    gpioCount: 26,
    description: 'Akıllı tarım, afet haberleşmesi, drone telemetrisi ve kilometrelerce mesafeden internet olmadan veri iletimi sağlayan endüstriyel LoRa kartı.',
    pins: [
      { id: '3v3', name: '3V3', side: 'left', index: 1, type: 'power', functions: ['power'], voltage: '3.3V', desc: '3.3V Çıkış' },
      { id: 'd0', name: 'D0', side: 'left', index: 2, type: 'io', gpio: 4, functions: ['gpio', 'pwm', 'i2c'], voltage: '3.3V', desc: 'I2C SDA' },
      { id: 'd1', name: 'D1', side: 'left', index: 3, type: 'io', gpio: 5, functions: ['gpio', 'pwm', 'i2c'], voltage: '3.3V', desc: 'I2C SCL' }
    ],
    builtinComponents: [
      { name: 'SX1262 LoRa Modülü', pins: 'Dahili SPI Hattı', desc: '868 MHz bandında açık alanda 15 kilometreye kadar paket iletimi.' },
      { name: 'SMA Anten Yuvası', pins: 'RF Çıkışı', desc: 'Yüksek kazançlı harici LoRa anteni takabilme.' }
    ]
  }
};

/**
 * Pin Fonksiyonu Filtreleme Listesi
 */
export const PIN_FILTER_CATEGORIES = [
  { id: 'all', label: 'Tümü', color: '#6366f1' },
  { id: 'gpio', label: 'Dijital (GPIO)', color: '#06b6d4' },
  { id: 'pwm', label: 'PWM (Analog Çıkış)', color: '#3b82f6' },
  { id: 'adc', label: 'Analog Giriş (ADC)', color: '#10b981' },
  { id: 'dac', label: 'Gerçek Analog (DAC)', color: '#84cc16' },
  { id: 'touch', label: 'Dokunmatik (Touch)', color: '#ec4899' },
  { id: 'i2c', label: 'I2C (SDA/SCL)', color: '#f59e0b' },
  { id: 'spi', label: 'SPI', color: '#8b5cf6' },
  { id: 'power', label: 'Güç (3V3/5V/GND)', color: '#ef4444' }
];
