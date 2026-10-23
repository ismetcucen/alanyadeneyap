/**
 * Deneyap Kart Atölyesi Müfredat ve Ders Verileri
 */
export const LESSONS_DATA = [
  {
    id: 'tanisma-donanim',
    category: 'Temel Seviye',
    title: 'Deneyap Kart ile Tanışma ve Donanım Mimarisi',
    duration: '10 dk',
    summary: 'Milli teknoloji hamlemizin ürünü Deneyap Kart\'ın donanım bileşenlerini, pin yeteneklerini ve ESP32 çift çekirdekli mimarisini 360° etkileşimli model üzerinden tanıyın.',
    outcomes: [
      'Deneyap Kart\'ın mikrodenetleyici (ESP32) özelliklerini öğrenme',
      'Dahili sensörleri (LSM6DSM IMU, MEMS Mikrofon, RGB LED) keşfetme',
      'Pinlerin voltaj toleranslarını (3.3V) ve GPIO yapısını kavrama',
      'I2C kolay bağlantı soketi ve Li-Po pil besleme sistemini anlama'
    ],
    materials: [
      { name: 'Deneyap Kart (v1/v2)', count: '1 adet', icon: 'cpu' },
      { name: 'USB Type-C Kablo', count: '1 adet', icon: 'cable' }
    ],
    connections: [
      { from: 'USB Type-C', to: 'Bilgisayar', note: 'Kod yükleme ve 5V güç' }
    ],
    defaultCode: `/*
 * Ders 1: Deneyap Kart Tanıtımı ve Seri Port Testi
 * Deneyap Kart çift çekirdekli ESP32 mikrodenetleyicisine sahiptir.
 */

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("========================================");
  Serial.println("  DENEYAP KART ATOLYESINE HOS GELDINIZ  ");
  Serial.println("  Milli Teknoloji Hamlesi ile Gelecege! ");
  Serial.println("========================================");
  Serial.println("Dahili Sensörler:");
  Serial.println("- 6 Eksenli LSM6DSM IMU (İvmeölçer & Jiroskop)");
  Serial.println("- Dahili MP34DT05 MEMS Sayısal Mikrofon");
  Serial.println("- Dahili Adreslenebilir RGB LED");
}

void loop() {
  Serial.println("[DURUM] Deneyap Kart aktif ve hazır.");
  delay(3000);
}`,
    blockCodePreview: [
      { type: 'setup', text: 'Başlangıçta: Seri Portu Başlat (115200 baud)' },
      { type: 'serial', text: 'Seri Porta Yaz: "DENEYAP KART ATOLYESINE HOS GELDINIZ"' },
      { type: 'loop', text: 'Sürekli Tekrarla: [Seri Porta Durum Yaz] -> [3000 ms Bekle]' }
    ],
    tasks: [
      {
        id: 'task-1-1',
        title: 'Seri Monitörü Başlat ve Kodu Çalıştır',
        desc: 'Yukarıdaki kodu "Çalıştır" düğmesine basarak sanal kartta koşturun ve Seri Monitör çıktısını gözlemleyin.',
        validator: (code, state) => state.serialOutput && state.serialOutput.includes('DENEYAP KART')
      },
      {
        id: 'task-1-2',
        title: 'Seri Mesajını Kişiselleştir',
        desc: 'setup() içinde Seri Porta kendi adınızı veya okulunuzu yazdıran yeni bir satır ekleyin ve "Denetle"ye basın.',
        validator: (code, state) => {
          const lower = code.toLowerCase();
          return lower.includes('serial.println') && (lower.includes('ogrenci') || lower.includes('deneyap') || code.length > 550);
        }
      }
    ]
  },

  {
    id: 'dahili-rgb-led',
    category: 'Temel Çıkışlar',
    title: 'Dahili RGB LED ile Renk Geçişleri (Blink RGB)',
    duration: '15 dk',
    summary: 'Harici hiçbir devre kurmadan, Deneyap Kart üzerindeki dahili çok renkli RGB LED\'i (Kırmızı, Yeşil, Mavi) yakıp söndürün.',
    outcomes: [
      'RGB renk sentezi mantığını (Kırmızı + Yeşil = Sarı vb.) öğrenme',
      'Deneyap Kart\'ın dahili LED pinlerini (LEDR, LEDG, LEDB) kontrol etme',
      'Aktif LOW (ters mantık) çalışma prensibini deneyimleme',
      'delay() fonksiyonu ile zamanlama yönetimi'
    ],
    materials: [
      { name: 'Deneyap Kart', count: '1 adet', icon: 'cpu' }
    ],
    connections: [
      { from: 'Dahili LEDR (D10 / GPIO4)', to: 'Kırmızı Kanal', note: 'LOW ile yanar' },
      { from: 'Dahili LEDG (D13 / GPIO15)', to: 'Yeşil Kanal', note: 'LOW ile yanar' },
      { from: 'Dahili LEDB (D12 / GPIO2)', to: 'Mavi Kanal', note: 'LOW ile yanar' }
    ],
    defaultCode: `/*
 * Ders 2: Dahili RGB LED Blink Örneği
 * Deneyap Kart üzerindeki RGB LED aktif LOW ile çalışır:
 * LOW = LED YANAR, HIGH = LED SÖNER!
 */

#define KIRMIZI_LED LEDR // D10 (GPIO4)
#define YESIL_LED   LEDG // D13 (GPIO15)
#define MAVI_LED    LEDB // D12 (GPIO2)

void setup() {
  Serial.begin(115200);
  
  pinMode(KIRMIZI_LED, OUTPUT);
  pinMode(YESIL_LED, OUTPUT);
  pinMode(MAVI_LED, OUTPUT);

  // Başlangıçta tüm renkleri söndür (HIGH vererek)
  digitalWrite(KIRMIZI_LED, HIGH);
  digitalWrite(YESIL_LED, HIGH);
  digitalWrite(MAVI_LED, HIGH);
  
  Serial.println("RGB LED Testi Başlatıldı!");
}

void loop() {
  // 1. Kırmızı Renk
  Serial.println("Kırmızı Yanıyor");
  digitalWrite(KIRMIZI_LED, LOW);
  digitalWrite(YESIL_LED, HIGH);
  digitalWrite(MAVI_LED, HIGH);
  delay(1000);

  // 2. Yeşil Renk
  Serial.println("Yeşil Yanıyor");
  digitalWrite(KIRMIZI_LED, HIGH);
  digitalWrite(YESIL_LED, LOW);
  digitalWrite(MAVI_LED, HIGH);
  delay(1000);

  // 3. Mavi Renk
  Serial.println("Mavi Yanıyor");
  digitalWrite(KIRMIZI_LED, HIGH);
  digitalWrite(YESIL_LED, HIGH);
  digitalWrite(MAVI_LED, LOW);
  delay(1000);
}`,
    blockCodePreview: [
      { type: 'setup', text: 'RGB Pinlerini ÇIKIŞ yap ve Söndür' },
      { type: 'loop', text: 'Kırmızı Aç -> 1sn Bekle -> Yeşil Aç -> 1sn Bekle -> Mavi Aç -> 1sn Bekle' }
    ],
    tasks: [
      {
        id: 'task-2-1',
        title: 'Renk Geçiş Hızını Artır',
        desc: 'delay(1000) sürelerini delay(300) olarak değiştirin, böylece renkler daha hızlı aksın.',
        validator: (code) => /delay\s*\(\s*300\s*\)/.test(code)
      },
      {
        id: 'task-2-2',
        title: 'Sarı Renk Üret (Kırmızı + Yeşil)',
        desc: 'Döngüye Sarı rengi ekleyin (hem KIRMIZI_LED hem de YESIL_LED pini LOW olmalıdır).',
        validator: (code) => {
          return code.includes('KIRMIZI_LED, LOW') && code.includes('YESIL_LED, LOW');
        }
      }
    ]
  },

  {
    id: 'harici-led-buton',
    category: 'Dijital Giriş/Çıkış',
    title: 'Harici LED ve Buton ile Dijital Kontrol',
    duration: '15 dk',
    summary: 'Breadboard üzerinde harici bir LED devresi ve buton bağlantısı kurarak dijital okuma (digitalRead) ve yazma (digitalWrite) yapın.',
    outcomes: [
      'Breadboard hatlarının (+/- ve orta delikler) çalışma sistemini anlama',
      'LED için 220Ω akım sınırlama direnci kullanımının önemini öğrenme',
      'Buton pull-down direnci kavramını ve gürültüsüz sinyal okumayı kavrama',
      'if - else mantığı ile donanım koşulu oluşturma'
    ],
    materials: [
      { name: 'Kırmızı 5mm LED', count: '1 adet', icon: 'sun' },
      { name: '220Ω Direnç', count: '1 adet', icon: 'zap' },
      { name: 'Push Buton', count: '1 adet', icon: 'mouse-pointer' },
      { name: '10kΩ Direnç', count: '1 adet', icon: 'zap' },
      { name: 'Breadboard', count: '1 adet', icon: 'grid' },
      { name: 'Jumper Kablo', count: '5 adet', icon: 'git-commit' }
    ],
    connections: [
      { from: 'D0 pini', to: 'LED Anot (+)', note: '220Ω direnç seri bağlanır' },
      { from: 'GND pini', to: 'LED Katot (-)', note: 'Eksi hat' },
      { from: '3V3 pini', to: 'Buton bacağı 1', note: 'Giriş gerilimi' },
      { from: 'D1 pini', to: 'Buton bacağı 2', note: 'Giriş okuma (10k pull-down)' }
    ],
    defaultCode: `/*
 * Ders 3: Buton ile LED Kontrolü
 * Butona basıldığında D0'a bağlı LED yanar,
 * bırakıldığında söner.
 */

const int ledPini = D0;
const int butonPini = D1;

void setup() {
  Serial.begin(115200);
  pinMode(ledPini, OUTPUT);
  pinMode(butonPini, INPUT);
  
  digitalWrite(ledPini, LOW);
  Serial.println("Butonlu LED devresi hazır.");
}

void loop() {
  int butonDurumu = digitalRead(butonPini);

  if (butonDurumu == HIGH) {
    digitalWrite(ledPini, HIGH);
    Serial.println("Butona basildi! LED ACIK");
  } else {
    digitalWrite(ledPini, LOW);
  }

  delay(50); // Kararlı okuma için kısa bekleme
}`,
    blockCodePreview: [
      { type: 'setup', text: 'D0\'ı ÇIKIŞ, D1\'i GİRİŞ olarak ayarla' },
      { type: 'loop', text: 'EĞER (D1 == YÜKSEK) İSE [D0 = YÜKSEK] DEĞİLSE [D0 = DÜŞÜK]' }
    ],
    tasks: [
      {
        id: 'task-3-1',
        title: 'Butona Basarak LED\'i Yak',
        desc: 'Simülatördeki push butona tıklayıp basılı tutun ve LED\'in yandığını görün.',
        validator: (code, state) => state.buttonPressed && state.ledStates && state.ledStates['d0']
      },
      {
        id: 'task-3-2',
        title: 'Ters Çalışma Mantığı Kur',
        desc: 'Kodu öyle değiştirin ki buton serbestken LED yansın, butona basıldığında sönsün!',
        validator: (code) => {
          return code.includes('butonDurumu == LOW') || (code.includes('butonDurumu == HIGH') && code.includes('digitalWrite(ledPini, LOW)'));
        }
      }
    ]
  },

  {
    id: 'pot-pwm-parlaklik',
    category: 'Analog Giriş & PWM',
    title: 'Potansiyometre ve PWM ile Parlaklık Kontrolü',
    duration: '15 dk',
    summary: 'Analog potansiyometreden 0-4095 arası veri okuyarak darbe genişlik modülasyonu (PWM) ile LED parlaklığını kademesiz ayarlayın.',
    outcomes: [
      'ESP32\'nin 12-bit ADC (Analog-Digital Converter) mimarisini anlama (0 - 4095 aralığı)',
      'analogRead() ile potansiyometre voltajını okuma',
      'map() fonksiyonu ile sayısal aralıkları dönüştürme',
      'PWM sinyali ve görev çevrimi (Duty Cycle) ile parlaklık kontrolü'
    ],
    materials: [
      { name: '10kΩ Potansiyometre', count: '1 adet', icon: 'sliders' },
      { name: 'Mavi LED', count: '1 adet', icon: 'sun' },
      { name: '220Ω Direnç', count: '1 adet', icon: 'zap' },
      { name: 'Breadboard & Kablolar', count: '1 set', icon: 'grid' }
    ],
    connections: [
      { from: 'A0 pini', to: 'Potansiyometre Orta Bacak', note: 'Analog voltaj okuma (0-3.3V)' },
      { from: '3V3 & GND', to: 'Potansiyometre Kenar Bacakları', note: 'Referans voltajı' },
      { from: 'D0 pini', to: 'Mavi LED Anot', note: 'PWM Çıkışı' }
    ],
    defaultCode: `/*
 * Ders 4: Potansiyometre ile PWM LED Parlaklığı
 * Deneyap Kart ADC okuması 12-bit (0-4095) aralığındadır.
 */

const int potPini = A0;
const int ledPini = D0;

void setup() {
  Serial.begin(115200);
  pinMode(ledPini, OUTPUT);
}

void loop() {
  // Potansiyometreden analog değeri oku (0 - 4095)
  int potDegeri = analogRead(potPini);

  // 12-bit değeri 8-bit PWM değerine (0 - 255) dönüştür
  int parlaklik = map(potDegeri, 0, 4095, 0, 255);

  // LED'e PWM uygula
  analogWrite(ledPini, parlaklik);

  Serial.print("Ham ADC: ");
  Serial.print(potDegeri);
  Serial.print(" -> Parlaklık (PWM): ");
  Serial.println(parlaklik);

  delay(50);
}`,
    blockCodePreview: [
      { type: 'setup', text: 'Seri Portu Başlat, D0\'ı PWM çıkışı yap' },
      { type: 'loop', text: 'A0\'ı Oku -> 0..255\'e Oranla -> D0\'a PWM Yaz' }
    ],
    tasks: [
      {
        id: 'task-4-1',
        title: 'Potansiyometreyi Çevir',
        desc: 'Deney Masasındaki potansiyometre ayarını değiştirerek LED parlaklığını gözlemleyin.',
        validator: (code, state) => state.potValue > 0
      },
      {
        id: 'task-4-2',
        title: 'Seri Monitörde Yüzde Gösterimi',
        desc: 'Potansiyometre değerini yüzde (0-100) olarak ekrana yazdıran map(potDegeri, 0, 4095, 0, 100) satırı ekleyin.',
        validator: (code) => code.includes('0, 100')
      }
    ]
  },

  {
    id: 'buzzer-melodi',
    category: 'Ses & Frekans',
    title: 'Piezo Buzzer ile Melodi ve Nota Çalma',
    duration: '15 dk',
    summary: 'Farklı ses frekansları üreterek polifonik melodiler, uyarı tonları ve korna simülasyonu yapın.',
    outcomes: [
      'Piezoelektrik elementlerin titreşim ile ses üretme mantığını öğrenme',
      'tone() ve noTone() fonksiyonlarını kullanma',
      'Müzik notalarının Hertz (Hz) cinsinden frekans karşılıklarını kavrama (Örn: La4 = 440 Hz)'
    ],
    materials: [
      { name: 'Piezo Buzzer', count: '1 adet', icon: 'volume-2' },
      { name: 'Breadboard & Kablolar', count: '1 set', icon: 'grid' }
    ],
    connections: [
      { from: 'D6 pini', to: 'Buzzer (+) Bacağı', note: 'PWM / Ton sinyali' },
      { from: 'GND pini', to: 'Buzzer (-) Bacağı', note: 'Toprak hattı' }
    ],
    defaultCode: `/*
 * Ders 5: Piezo Buzzer ile Melodi Çalma
 * Do (262Hz), Re (294Hz), Mi (330Hz), Fa (349Hz), Sol (392Hz), La (440Hz), Si (494Hz)
 */

const int buzzerPini = D6;

int notalar[] = { 262, 294, 330, 349, 392, 440, 494, 523 }; // C4 - C5 gamı
int sure = 300;

void setup() {
  Serial.begin(115200);
  pinMode(buzzerPini, OUTPUT);
  Serial.println("Melodi başlatılıyor...");
}

void loop() {
  for (int i = 0; i < 8; i++) {
    Serial.print("Nota Frekansı: ");
    Serial.println(notalar[i]);
    
    tone(buzzerPini, notalar[i], sure);
    delay(sure + 50);
  }

  noTone(buzzerPini);
  delay(2000); // 2 saniye bekle ve tekrar çal
}`,
    blockCodePreview: [
      { type: 'setup', text: 'D6\'yı Buzzer Pini yap' },
      { type: 'loop', text: 'Her nota için: tone(D6, Frekans) çal -> 300ms bekle' }
    ],
    tasks: [
      {
        id: 'task-5-1',
        title: 'Melodiyi Dinle',
        desc: '"Çalıştır"a basarak Web Audio API ile üretilen gerçek ses tonlarını dinleyin.',
        validator: (code, state) => state.buzzerActive
      },
      {
        id: 'task-5-2',
        title: 'Tempo Hızlandır',
        desc: 'int sure = 300; değerini 150 yaparak melodiyi iki kat hızlandırın.',
        validator: (code) => /int\s+sure\s*=\s*150;/.test(code)
      }
    ]
  },

  {
    id: 'trafik-lambasi',
    category: 'Otomasyon',
    title: 'Akıllı Trafik Lambası Otomasyonu',
    duration: '20 dk',
    summary: 'Kırmızı, Sarı ve Yeşil LED\'ler ile gerçek dünya trafik sinyalizasyon algoritmasını kurun.',
    outcomes: [
      'Sonlu Durum Makinesi (State Machine) mantığıyla sıralı otomasyon kurma',
      'Çoklu dijital çıkışları zamanlayıcılarla senkronize etme',
      'Güvenli geçiş evrelerini (Kırmızı+Sarı hazırlık süresi) kodlama'
    ],
    materials: [
      { name: 'Kırmızı, Sarı, Yeşil LED\'ler', count: '3 adet', icon: 'sun' },
      { name: '220Ω Direnç', count: '3 adet', icon: 'zap' },
      { name: 'Breadboard & Kablolar', count: '1 set', icon: 'grid' }
    ],
    connections: [
      { from: 'D0 pini', to: 'Kırmızı LED Anot', note: 'Direnç ile' },
      { from: 'D1 pini', to: 'Sarı LED Anot', note: 'Direnç ile' },
      { from: 'D2 pini', to: 'Yeşil LED Anot', note: 'Direnç ile' },
      { from: 'GND pini', to: 'Ortak Katot Hattı', note: 'Toprak' }
    ],
    defaultCode: `/*
 * Ders 6: Trafik Işığı Otomasyonu
 * Kırmızı (D0), Sarı (D1), Yeşil (D2)
 */

const int kirmizi = D0;
const int sari = D1;
const int yesil = D2;

void setup() {
  Serial.begin(115200);
  pinMode(kirmizi, OUTPUT);
  pinMode(sari, OUTPUT);
  pinMode(yesil, OUTPUT);
  Serial.println("Trafik lambası devrede.");
}

void loop() {
  // 1. Durumu: Sadece Kırmızı (Dur!)
  digitalWrite(kirmizi, HIGH);
  digitalWrite(sari, LOW);
  digitalWrite(yesil, LOW);
  Serial.println("[KIRMIZI] Araçlar dur!");
  delay(3000);

  // 2. Durum: Kırmızı + Sarı (Hazırlan!)
  digitalWrite(sari, HIGH);
  Serial.println("[KIRMIZI + SARI] Hazırlan!");
  delay(1000);

  // 3. Durum: Sadece Yeşil (Geç!)
  digitalWrite(kirmizi, LOW);
  digitalWrite(sari, LOW);
  digitalWrite(yesil, HIGH);
  Serial.println("[YESIL] Geç!");
  delay(3000);

  // 4. Durum: Sadece Sarı (Dikkat / Yavaşla!)
  digitalWrite(yesil, LOW);
  digitalWrite(sari, HIGH);
  Serial.println("[SARI] Yavaşla!");
  delay(1000);
}`,
    blockCodePreview: [
      { type: 'loop', text: 'Kırmızı 3sn -> Kırmızı+Sarı 1sn -> Yeşil 3sn -> Sarı 1sn' }
    ],
    tasks: [
      {
        id: 'task-6-1',
        title: 'Trafik Döngüsünü İncele',
        desc: 'Devreyi çalıştırıp 3 LED\'in sırayla gerçek trafik ritminde yandığını görün.',
        validator: (code, state) => state.stepCount >= 4
      },
      {
        id: 'task-6-2',
        title: 'Yeşil Işık Süresini Artır',
        desc: 'Yeşil ışık yandıktan sonraki delay(3000); beklemesini delay(5000); yapın.',
        validator: (code) => code.includes('yesil, HIGH') && code.includes('delay(5000)')
      }
    ]
  },

  {
    id: 'dahili-imu-lsm6dsm',
    category: 'Sensörler & İleri Seviye',
    title: 'Dahili 6 Eksenli IMU (LSM6DSM) ile Eğim ve Terazi',
    duration: '20 dk',
    summary: 'Deneyap Kart üzerindeki dahili LSM6DSM 6 eksenli ataletsel ölçüm biriminden X, Y ve Z ivme değerlerini okuyarak dijital su terazisi yapın.',
    outcomes: [
      'IMU (Inertial Measurement Unit) ve MEMS jiroskop/ivmeölçer çalışma mantığını kavrama',
      'I2C protokolü üzerinden sensör kayıtlarını (Registers) okuma',
      'Açı (Pitch & Roll) hesaplama trigonometrisi',
      'Eğim açısına göre uyarı sistemleri kurma'
    ],
    materials: [
      { name: 'Deneyap Kart (Dahili LSM6DSM Sensörü)', count: '1 adet', icon: 'compass' }
    ],
    connections: [
      { from: 'Dahili LSM6DSM', to: 'ESP32 I2C (SDA: D0, SCL: D1)', note: 'I2C Adresi: 0x6A' }
    ],
    defaultCode: `/*
 * Ders 7: Dahili IMU (LSM6DSM) Eğim Algılama
 * Kartın X, Y, Z eksenlerindeki ivmesi okunarak
 * su terazisi eğim açısı hesaplanır.
 */

#include <Wire.h>

float egimX = 0.0;
float egimY = 0.0;

void setup() {
  Serial.begin(115200);
  Wire.begin();
  
  pinMode(LEDR, OUTPUT);
  digitalWrite(LEDR, HIGH); // Söndür

  Serial.println("LSM6DSM IMU Sensörü Başlatıldı!");
}

void loop() {
  // Sanal IMU'dan eğim açılarını al
  // Gerçek kartta: lsm6dsm.readAcceleration(ax, ay, az);
  // Simülatörde fareyle kartı eğebilirsiniz!
  
  Serial.print("Açı X (Roll): ");
  Serial.print(egimX);
  Serial.print("°  |  Açı Y (Pitch): ");
  Serial.print(egimY);
  Serial.println("°");

  // Eğer kart 20 dereceden fazla eğilirse Kırmızı LED ile uyar
  if (abs(egimX) > 20 || abs(egimY) > 20) {
    digitalWrite(LEDR, LOW); // LED'i yak
    Serial.println("[UYARI] Kart dengesi bozuldu!");
  } else {
    digitalWrite(LEDR, HIGH); // LED'i söndür
  }

  delay(200);
}`,
    blockCodePreview: [
      { type: 'loop', text: 'IMU Eğimini Oku -> EĞER (Açı > 20°) İSE [Kırmızı LED Yak] DEĞİLSE [Söndür]' }
    ],
    tasks: [
      {
        id: 'task-7-1',
        title: 'Kartı Eğerek Test Et',
        desc: 'Deney Masasındaki 3D IMU Eğim Paneli üzerinde kaydırıcıyı oynatarak kartı eğin.',
        validator: (code, state) => state.imuTiltChanged
      },
      {
        id: 'task-7-2',
        title: 'Hassasiyet Eşiğini Düşür',
        desc: 'Eğim eşiğini 20 dereceden 10 dereceye düşürün (abs(egimX) > 10).',
        validator: (code) => code.includes('> 10')
      }
    ]
  },

  {
    id: 'dahili-mems-mikrofon',
    category: 'Sensörler & İleri Seviye',
    title: 'Dahili MEMS Mikrofon ile Ses Seviye Ölçer (VU Metre)',
    duration: '20 dk',
    summary: 'Deneyap Kart üzerindeki MP34DT05 sayısal mikrofon ile ortam ses şiddetini ölçüp desibel göstergesi oluşturun.',
    outcomes: [
      'MEMS mikrofon teknolojisi ve I2S ses haberleşmesi temelleri',
      'Ses dalgalarının genlik (RMS) analizi',
      'Ses seviyesine göre dinamik renk tepkileri üretme'
    ],
    materials: [
      { name: 'Deneyap Kart (Dahili Mikrofon)', count: '1 adet', icon: 'mic' }
    ],
    connections: [
      { from: 'Dahili MP34DT05', to: 'ESP32 I2S Arayüzü', note: 'Sayısal ses örnekleme' }
    ],
    defaultCode: `/*
 * Ders 8: Dahili MEMS Mikrofon ile Ses Şiddeti Ölçümü
 * Ortamdaki ses seviyesi arttıkça RGB LED yeşilden kırmızıya döner.
 */

void setup() {
  Serial.begin(115200);
  pinMode(LEDR, OUTPUT);
  pinMode(LEDG, OUTPUT);
  pinMode(LEDB, OUTPUT);
  
  digitalWrite(LEDR, HIGH);
  digitalWrite(LEDG, HIGH);
  digitalWrite(LEDB, HIGH);

  Serial.println("MEMS Sayısal Mikrofon Aktif!");
}

void loop() {
  // Sanal mikrofon ses seviyesi (0 - 100 dB)
  int sesSeviyesi = random(30, 85); 

  Serial.print("Ortam Ses Seviyesi: ");
  Serial.print(sesSeviyesi);
  Serial.println(" dB");

  if (sesSeviyesi > 70) {
    // Yüksek ses -> Kırmızı LED
    digitalWrite(LEDR, LOW);
    digitalWrite(LEDG, HIGH);
    Serial.println("-> [UYARI] Yüksek Gürültü!");
  } else {
    // Normal ses -> Yeşil LED
    digitalWrite(LEDR, HIGH);
    digitalWrite(LEDG, LOW);
  }

  delay(250);
}`,
    blockCodePreview: [
      { type: 'loop', text: 'Mikrofon Seviyesini Oku -> EĞER (>70 dB) İSE [Kırmızı] DEĞİLSE [Yeşil]' }
    ],
    tasks: [
      {
        id: 'task-8-1',
        title: 'Kodu Çalıştır ve Ses Değerlerini İncele',
        desc: 'Seri monitörde ses seviyesi loglarını gözlemleyin.',
        validator: (code, state) => state.serialOutput && state.serialOutput.includes('Ortam Ses Seviyesi')
      }
    ]
  },

  {
    id: 'kayan-yazi-oled',
    category: 'Ekranlar & I2C',
    title: 'Deneyap OLED Ekran ve Kayan Yazı Projesi',
    duration: '20 dk',
    summary: 'Kendi projeniz olan KayanYazi_OHEP.ino kodunu kullanarak 0.96" Deneyap OLED ekran modülünde metin kaydırma animasyonunu simüle edin.',
    outcomes: [
      'Deneyap OLED modülü ve SSD1306 kontrolcüsü çalışma ilkeleri',
      'I2C haberleşme adresi (0x7A / 0x3C) ve satır-sütun yerleşimi',
      'Donanımsal yatay kaydırma (Horizontal Scroll) komutları'
    ],
    materials: [
      { name: 'Deneyap OLED Ekran (0.96")', count: '1 adet', icon: 'tv' },
      { name: 'Deneyap I2C Bağlantı Kablosu', count: '1 adet', icon: 'link' }
    ],
    connections: [
      { from: 'Deneyap I2C Soketi', to: 'OLED Modülü I2C Soketi', note: 'SDA, SCL, 3V3, GND' }
    ],
    defaultCode: `/*
 * Ders 9: Deneyap OLED Ekranında Kayan Yazı
 * Orijinal KayanYazi_OHEP.ino projeniz
 * https://docs.deneyapkart.org/tr/content/contentDetail/deneyap-modul-deneyap-oled-ekran-m09
 */

#include <Deneyap_OLED.h> // Deneyap OLED Ekran kütüphanesi

OLED OLED; // OLED için class tanımlanması

void setup() {
  Serial.begin(115200);
  
  if (!OLED.begin(0x7A)) { // begin(slaveAddress) ile I2C haberleşmesi
    delay(1000);
    Serial.println("I2C baglantisi basarisiz ");
  } else {
    Serial.println("OLED Ekran Basariyla Baglandi (0x7A)!");
  }

  OLED.clearDisplay(); // Ekranı temizle
  OLED.setTextXY(1, 0);
  OLED.putString("  OHEP ");
  OLED.setTextXY(3, 0);
  OLED.putString(" BILISIM ");
  OLED.setTextXY(5, 0);
  OLED.putString(" ROBOTIK ");
  OLED.setTextXY(7, 0);
  OLED.putString(" DRONE ");
}

void loop() {
  /*
   * Scroll_Right: yazı sağa doğru kayar
   * Scroll_4Frames: kayma hızı
   */
  OLED.setHorizontalScrollProperties(Scroll_Right, 0, 7, Scroll_4Frames);
  OLED.activateScroll();
  delay(1000);
}`,
    blockCodePreview: [
      { type: 'setup', text: 'OLED.begin(0x7A) -> Başlıkları Yaz (OHEP, BİLİŞİM, ROBOTİK, DRONE)' },
      { type: 'loop', text: 'Yazıları Sağa Kaydır (Scroll_Right)' }
    ],
    tasks: [
      {
        id: 'task-9-1',
        title: 'Sanal OLED Ekranda Kayan Yazıyı Gör',
        desc: '"Çalıştır" butonuna basarak sağdaki sanal 128x64 OLED ekranda yazının belirmesini izleyin.',
        validator: (code, state) => state.oledActive
      },
      {
        id: 'task-9-2',
        title: 'Yeni Bir Metin Satırı Ekle',
        desc: 'OLED.setTextXY(0, 0); OLED.putString("DENEYAP"); satırını ekleyin.',
        validator: (code) => code.includes('DENEYAP')
      }
    ]
  },

  {
    id: 'ldr-gece-lambasi',
    category: 'Sensörler & Otomasyon',
    title: 'LDR Işık Sensörü ile Akıllı Gece Lambası',
    duration: '15 dk',
    summary: 'Ortam karanlıklaşınca otomatik yanan, aydınlanınca kendiliğinden sönen akıllı sokak/gece lambası devresi kurun.',
    outcomes: [
      'LDR (Işığa Bağımlı Direnç) çalışma prensibi ve gerilim bölücü devreler',
      'Analog eşik değeri (Histerezis) mantığı ile titreşimsiz anahtarlama'
    ],
    materials: [
      { name: 'LDR (Foto Direnç)', count: '1 adet', icon: 'sun' },
      { name: '10kΩ Direnç', count: '1 adet', icon: 'zap' },
      { name: 'Sarı LED & 220Ω Direnç', count: '1 set', icon: 'lightbulb' }
    ],
    connections: [
      { from: 'A0 pini', to: 'LDR ve 10k Direnç Birleşimi', note: 'Analog okuma' },
      { from: 'D0 pini', to: 'Sarı LED Anot', note: 'Lamba çıkışı' }
    ],
    defaultCode: `/*
 * Ders 10: LDR ile Otomatik Gece Lambası
 * Ortam ışığı eşik değerinin altına düşerse LED yanar.
 */

const int ldrPini = A0;
const int lambaPini = D0;
const int isikEsigi = 1800; // Eşik değeri

void setup() {
  Serial.begin(115200);
  pinMode(lambaPini, OUTPUT);
}

void loop() {
  int isikDegeri = analogRead(ldrPini);

  Serial.print("Ortam Işık Seviyesi: ");
  Serial.println(isikDegeri);

  if (isikDegeri < isikEsigi) {
    digitalWrite(lambaPini, HIGH); // Karanlık: Lambayı yak
    Serial.println("-> Hava karardı, lamba AÇIK!");
  } else {
    digitalWrite(lambaPini, LOW);  // Aydınlık: Lambayı söndür
  }

  delay(200);
}`,
    blockCodePreview: [
      { type: 'loop', text: 'LDR Oku -> EĞER (Işık < Eşik) İSE [Lambayı Yak] DEĞİLSE [Söndür]' }
    ],
    tasks: [
      {
        id: 'task-10-1',
        title: 'Işığı Kısarak Lambayı Yak',
        desc: 'Deney Masasındaki Işık Seviyesi kaydırıcısını sola (karanlığa) çekin ve LED\'in yandığını görün.',
        validator: (code, state) => state.ldrValue < 1800 && state.ledStates && state.ledStates['d0']
      }
    ]
  },

  {
    id: 'ultrasonik-park-sensoru',
    category: 'Mesafe & Akıllı Araç',
    title: 'HC-SR04 Ultrasonik Park Sensörü',
    duration: '20 dk',
    summary: 'Ses dalgalarıyla engel mesafesini ölçüp, araç yaklaştıkça artan sesli ve görsel ikaz sistemi oluşturun.',
    outcomes: [
      'Ses hızını (343 m/s) kullanarak gidiş-dönüş süresinden mesafe hesaplama',
      'pulseIn() fonksiyonunun mikrodenetleyici seviyesinde çalışması',
      'Güvenlik mesafesine göre dinamik buzzer uyarısı'
    ],
    materials: [
      { name: 'HC-SR04 Ultrasonik Sensör', count: '1 adet', icon: 'radio' },
      { name: 'Piezo Buzzer', count: '1 adet', icon: 'volume-2' },
      { name: 'Kırmızı LED', count: '1 adet', icon: 'sun' }
    ],
    connections: [
      { from: 'D2 pini', to: 'Trig (Tetik)', note: 'Ses dalgası fırlatma' },
      { from: 'D3 pini', to: 'Echo (Yankı)', note: 'Geri dönen sesi dinleme' },
      { from: 'D6 pini', to: 'Buzzer (+)', note: 'Sesli ikaz' }
    ],
    defaultCode: `/*
 * Ders 11: Ultrasonik Park Sensörü
 * Mesafe azaldıkça buzzer ötüş sıklığı artar.
 */

const int trigPini = D2;
const int echoPini = D3;
const int buzzerPini = D6;

void setup() {
  Serial.begin(115200);
  pinMode(trigPini, OUTPUT);
  pinMode(echoPini, INPUT);
  pinMode(buzzerPini, OUTPUT);
  Serial.println("Park Sensörü Devrede!");
}

void loop() {
  // Tetikleme darbesi gönder
  digitalWrite(trigPini, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPini, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPini, LOW);

  // Geri dönüş süresini oku ve cm'ye dönüştür
  long sure = pulseIn(echoPini, HIGH);
  int mesafe = sure * 0.034 / 2;

  Serial.print("Mesafe: ");
  Serial.print(mesafe);
  Serial.println(" cm");

  if (mesafe < 10) {
    // Çok yakın! Sürekli ses
    tone(buzzerPini, 1200);
    delay(50);
  } else if (mesafe < 30) {
    // Yakın: Hızlı kesikli ses
    tone(buzzerPini, 800, 100);
    delay(200);
  } else {
    noTone(buzzerPini);
    delay(200);
  }
}`,
    blockCodePreview: [
      { type: 'loop', text: 'Ses Gönder -> Süreyi Oku -> cm Hesapla -> Mesafeye göre Buzzer Çal' }
    ],
    tasks: [
      {
        id: 'task-11-1',
        title: 'Mesafe Kaydırıcısını Test Et',
        desc: 'Deney Masasındaki ultrasonik mesafe kaydırıcısını 10 cm altına çekerek acil durum uyarısını tetikleyin.',
        validator: (code, state) => state.ultrasonicDistance < 10
      }
    ]
  },

  {
    id: 'wifi-gemini-ai',
    category: 'IoT & Yapay Zeka',
    title: 'Wi-Fi & Google Gemini AI Akıllı Asistanı',
    duration: '25 dk',
    summary: 'Kendi projeniz olan yaziyazma.ino çalışmasından esinlenen, Deneyap Kart dahili Wi-Fi ile buluta bağlanıp Gemini Yapay Zekasından yanıt alan ileri seviye IoT projesi.',
    outcomes: [
      'ESP32 Wi-Fi istemcisi (WiFiClientSecure) ile güvenli SSL/TLS bağlantı kurma',
      'REST API HTTP POST çağrısı ile JSON veri alışverişi',
      'Yapay zeka yanıtını ayrıştırıp OLED ekrana ve Seri Monitöre aktarma'
    ],
    materials: [
      { name: 'Deneyap Kart (Dahili Wi-Fi)', count: '1 adet', icon: 'wifi' },
      { name: 'Deneyap OLED Ekran', count: '1 adet', icon: 'tv' }
    ],
    connections: [
      { from: 'Wi-Fi', to: 'İnternet / Bulut', note: '2.4 GHz Kablosuz Ağ' },
      { from: 'I2C Portu', to: 'OLED Ekran', note: 'SDA/SCL (0x7A)' }
    ],
    defaultCode: `/*
 * Ders 12: Wi-Fi ile Gemini AI Akıllı Asistanı
 * yaziyazma.ino projenizden modellenmiştir.
 */

#include <WiFi.h>
#include <Deneyap_OLED.h>

OLED display;
const char* soru = "Merhaba Gemini, Deneyap Kart nedir?";

void setup() {
  Serial.begin(115200);
  display.begin(0x7A);
  display.clearDisplay();
  display.setTextXY(0, 0);
  display.putString("WiFi Baglaniyor..");

  Serial.println("Wi-Fi Agina Baglaniliyor...");
  delay(1000);
  Serial.println("Wi-Fi Baglantisi Basarili! IP: 192.168.1.105");

  display.clearDisplay();
  display.setTextXY(0, 0);
  display.putString("Gemini Soruluyor..");

  Serial.print("Kullanıcı Sorusu: ");
  Serial.println(soru);
  delay(1500);

  // Gemini API'den yanıt simülasyonu
  String cevap = "Deneyap Kart: T3 Vakfi tarafindan gelistirilen milli ESP32 gelistirme kartidir.";
  
  Serial.println("================================");
  Serial.println("Gemini AI Yaniti:");
  Serial.println(cevap);
  Serial.println("================================");

  display.clearDisplay();
  display.setTextXY(0, 0);
  display.putString("Gemini Cevabi:");
  display.setTextXY(2, 0);
  display.putString("Milli Gelistirme");
  display.setTextXY(4, 0);
  display.putString("Karti: Deneyap!");
}

void loop() {
  // Sistem beklemede
  delay(2000);
}`,
    blockCodePreview: [
      { type: 'setup', text: 'Wi-Fi Bağlan -> Gemini API\'ye POST Gönder -> Yanıtı OLED\'e Bas' }
    ],
    tasks: [
      {
        id: 'task-12-1',
        title: 'Yapay Zeka İsteğini Başlat',
        desc: '"Çalıştır"a basarak sanal Wi-Fi bağlantısının kurulduğunu ve Gemini cevabının OLED ekrana geldiğini izleyin.',
        validator: (code, state) => state.serialOutput && state.serialOutput.includes('Gemini AI Yaniti')
      }
    ]
  }
];
