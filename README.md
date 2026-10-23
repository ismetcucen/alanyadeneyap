# Deneyap Kart İnteraktif Atölyesi (Interactive Workshop & Simulator)

Milli Teknoloji Hamlemizin ürünü **Deneyap Kart** ekosistemi için geliştirilmiş, `yapayzekaokulum.com/atolye` referans alınarak tasarlanan modern, etkileşimli bir sanal eğitim ve simülasyon platformudur.

---

## 🌟 Öne Çıkan Özellikler

1. **Deneyap Kart Modelleri & 360° Pin Tanıtımı**:
   - **Modeller**: Deneyap Kart (v1/v2), Deneyap Kart 1A, Deneyap Mini, Deneyap Kart G (LoRa).
   - **360° Döndürme & Yakınlaşma**: Fare ile sürükleyerek veya Q / E butonlarıyla kartı 3 boyutlu açılarda serbestçe döndürme ve inceleme.
   - **Akıllı Pin Haritası**: Pinlerin üzerine gelindiğinde anlık ESP32 GPIO karşılığı, PWM/ADC/DAC/Touch yetenekleri ve 3.3V gerilim toleransı uyarısı.
   - **Fonksiyon Filtreleri**: `Dijital (GPIO)`, `PWM`, `ADC (Analog)`, `DAC`, `Dokunmatik (Touch)`, `I2C`, `SPI`, `Güç` pinlerini tek tıkla filtreleyip parlatma.
   - **Pin Müfettişi (Inspector)**: Tıklanan pin için hazır C++ kod şablonu ve detaylı teknik açıklama.

2. **⚡ İnteraktif Sensör ve Modül Tanıtım Menüsü (Sensör Rehberi)**:
   - **12 Kapsamlı Sensör**: LSM6DSM 6 Eksenli IMU, MP34DT05 MEMS Sayısal Mikrofon, 0.96" I2C OLED Ekran, HC-SR04 Ultrasonik Mesafe, LDR Işık Sensörü, 10kΩ Potansiyometre, DHT11 Sıcaklık & Nem, PIR Hareket Sensörü, MQ-2 Yanıcı Gaz & Duman, Toprak Nemi Sensörü, TCS34725 RGB Renk Sensörü, TCRT5000 Çizgi İzleyen Sensörü.
   - **Arama & Kategori Filtreleme**: Dahili, Mesafe & Hareket, Çevresel & Hava, Optik & Işık, Ekran & Arayüz.
   - **Detaylı Özellikler & Çalışma Prensibi**: Haberleşme protokolü (I2C, SPI, ADC, OneWire), çalışma voltajı (3.3V) ve Deneyap pin bağlantı şeması.
   - **Canlı Sensör Simülatörü**: Her sensör için doğrudan arayüzde çalışan etkileşimli canlı test sandkutus (kaydırıcılar, ibreler, desibelmetre, radar vb.).
   - **Kütüphaneli C++ Örnek Kodu & Derse Geçiş**: Tek tıkla kodu kopyalama ve "Bu Sensörü Atölyede Dene" butonu ile ilgili atölye dersine anında atlama.

2. **İnteraktif Devre & Breadboard Simülatörü**:
   - Adım Adım Rehberli Kablolama Modu ("Devreyi Kur").
   - Canlı Deney Masası:
     - Renkli LED'ler (Kırmızı, Yeşil, Mavi, Sarı) ve PWM parlaklık tepkisi.
     - Deneyap Dahili Çok Renkli RGB LED (WS2812 / Ters mantık desteği).
     - Tıklanabilir ve basılı tutulabilir Push Buton.
     - 0-4095 ADC okumalı 10kΩ Potansiyometre topuzu.
     - Web Audio API ile gerçek frekanslarda ses üreten Piezo Buzzer.
     - **0.96" I2C Deneyap OLED Ekran**: 128x64 çözünürlükte metin ve donanımsal kayan yazı simülasyonu.
     - **Dahili 6 Eksenli IMU (LSM6DSM)**: Su terazisi eğim paneli ve açı sensörü.
     - HC-SR04 Ultrasonik Mesafe Sensörü kaydırıcısı.
     - LDR Işık Sensörü ortam aydınlığı kaydırıcısı.

3. **C++ & Görsel Blok Kod Motoru**:
   - Arduino C++ kod düzenleyici (satır numaraları, sözdizimi, kopyalama, `.ino` indirme).
   - Blok Kod Önizleme (Blockly / Scratch stili görsel bloklar).
   - Sanal Arduino Motoru (`setup()`, `loop()`, `delay()`, `digitalWrite()`, `analogRead()`, `tone()`, `OLED.putString()`, `Serial.println()`).
   - Canlı Seri Monitör Konsolu (115200 baud, TX mesaj gönderme, zaman damgası, temizleme).

4. **12 Kapsamlı Atölye Dersi & Görev Değerlendirme**:
   - Çalışma alanınızdaki `KayanYazi_OHEP.ino` projeniz **Ders 9 (OLED Kayan Yazı)** olarak, `yaziyazma.ino` projeniz **Ders 12 (Wi-Fi & Gemini AI)** olarak doğrudan müfredata entegre edilmiştir.
   - Her ders için anlık "Denetle" butonu, hata/başarı kontrolü, kutlama konfetisi ve zafer melodisi.

---

## 🚀 Çalıştırma Talimatları

Proje hiçbir harici paket (`npm install` vb.) veya derleme aşaması gerektirmez; modern web standartlarıyla doğrudan çalışır.

### Yöntem 1: Doğrudan Tarayıcıda Açma (macOS)
```bash
open index.html
```

### Yöntem 2: Yerel HTTP Sunucusu ile Açma
```bash
python3 -m http.server 8080
```
Ardından tarayıcınızdan `http://localhost:8080` adresine gidin.

---

## 📁 Proje Dosya Mimarisi

```
deneyap/
├── index.html                   # Ana Atölye Uygulama Sayfası
├── css/
│   ├── main.css                 # Ana yerleşim, tema, gezinme ve çekmeceler
│   ├── board-viewer.css         # 360° Kart ve Pin haritası görselleştiricisi
│   ├── simulator.css            # Devre masası, breadboard ve donanım bileşenleri
│   └── editor.css               # C++ editör, bloklar ve Seri Monitör terminali
├── js/
│   ├── app.js                   # Ana uygulama orkestratörü ve durum yöneticisi
│   ├── data/
│   │   ├── boards.js            # Deneyap kart modelleri ve pin veri tabanı
│   │   └── lessons.js           # 12 zengin atölye dersi ve görevler
│   ├── components/
│   │   ├── boardViewer.js       # 360° dönebilen interaktif Deneyap Kart motoru
│   │   ├── circuitSimulator.js  # İnteraktif devre/breadboard simülatörü
│   │   ├── codeEditor.js        # C++ editörü ve görsel blok motoru
│   │   ├── arduinoEngine.js     # Sanal Arduino C++ yürütme motoru
│   │   ├── serialMonitor.js     # Canlı Seri Monitör konsolu
│   │   └── audioSynth.js        # Web Audio API ses sentezleyici
│   └── utils/
│       └── helpers.js           # Yerel depolama ve konfeti animasyonu
├── KayanYazi_OHEP/              # Kullanıcı OLED kayan yazı kaynak kodu
├── yaziyazma/                   # Kullanıcı Wi-Fi & Gemini AI kaynak kodu
└── README.md                    # Proje kılavuzu
```
