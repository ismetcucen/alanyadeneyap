/**
 * Deneyap Kart Ekosistemi Sensör ve Modül Veri Modeli
 */
export const SENSORS_DATA = [
  {
    id: 'lsm6dsm-imu',
    name: 'LSM6DSM 6 Eksenli IMU Sensörü',
    category: 'builtin',
    categoryName: 'Dahili Sensörler',
    badge: 'Dahili · 6 Eksen',
    protocol: 'I2C (0x6A)',
    voltage: '3.3V (Dahili)',
    pins: 'SDA: D0 (GPIO21) · SCL: D1 (GPIO22)',
    lessonId: 'dahili-imu-lsm6dsm',
    description: '3 eksen ivmeölçer (±2/4/8/16g) ve 3 eksen jiroskop (±125 - ±2000 dps) içeren yüksek performanslı mikro elektro-mekanik (MEMS) ataletsel ölçüm birimi.',
    workingPrinciple: 'Mikroskobik silikon kütlelerin ivme ve açısal hız etkisiyle kapasitif yer değiştirmesini algılayarak Pitch, Roll ve Yaw açılarını iletir.',
    usageAreas: ['Denge robotları', 'Drone uçuş kontrolü', 'Oyun kumandaları', 'Dijital su terazisi', 'Adım sayar ve düşme algılama'],
    codeSnippet: `// LSM6DSM 6-Eksen IMU Okuma Örneği
#include <Wire.h>

void setup() {
  Serial.begin(115200);
  Wire.begin(); // SDA: D0, SCL: D1
  Serial.println("LSM6DSM IMU Baslatildi!");
}

void loop() {
  // Gerçek kartta: Deneyap_IMU kütüphanesi kullanılır
  float rollAci = 12.4;  // Örnek X açısı
  float pitchAci = -3.8; // Örnek Y açısı
  
  Serial.print("Roll: "); Serial.print(rollAci);
  Serial.print("° | Pitch: "); Serial.println(pitchAci);
  delay(100);
}`,
    interactiveType: 'imu',
    interactiveDefault: { roll: 0, pitch: 0 }
  },

  {
    id: 'mp34dt05-mic',
    name: 'MP34DT05 MEMS Sayısal Mikrofon',
    category: 'builtin',
    categoryName: 'Dahili Sensörler',
    badge: 'Dahili · Sayısal Ses',
    protocol: 'I2S / PDM',
    voltage: '3.3V (Dahili)',
    pins: 'Dahili I2S Ses Hatları (ESP32 Dahili)',
    lessonId: 'dahili-mems-mikrofon',
    description: 'Deneyap Kart üzerinde dahili olarak bulunan, ultra kompakt, düşük güç tüketimli, yüksek sinyal-gürültü oranına (64 dB SNR) sahip sayısal mikrofon.',
    workingPrinciple: 'Ses dalgalarının mikrofon diyaframında oluşturduğu akustik basıncı PDM (Pulse Density Modulation) sayısal darbelerine dönüştürerek I2S üzerinden aktarır.',
    usageAreas: ['Ses seviyesi ölçümü (VU Metre)', 'Gürültü eşiği alarmları', 'Sesli komut ve yapay zeka', 'Akıllı ev asistanları'],
    codeSnippet: `// MP34DT05 MEMS Mikrofon Ses Şiddeti Ölçümü
void setup() {
  Serial.begin(115200);
  Serial.println("MEMS Mikrofon Dinlemede...");
}

void loop() {
  int sesDesibel = random(35, 80); // Simüle edilen dB seviyesi
  Serial.print("Ortam Ses Seviyesi: ");
  Serial.print(sesDesibel);
  Serial.println(" dB");
  delay(200);
}`,
    interactiveType: 'sound',
    interactiveDefault: { db: 45 }
  },

  {
    id: 'deneyap-oled',
    name: 'Deneyap 0.96" I2C OLED Ekran (SSD1306)',
    category: 'display',
    categoryName: 'Ekran & Arayüz',
    badge: 'I2C · 128x64 Piksel',
    protocol: 'I2C (0x7A / 0x3C)',
    voltage: '3.3V',
    pins: 'SDA: D0 · SCL: D1 · VCC: 3V3 · GND: GND (Deneyap I2C Soketi)',
    lessonId: 'kayan-yazi-oled',
    description: '128x64 piksel çözünürlüğünde, harici aydınlatma gerektirmeyen yüksek kontrastlı organik LED ekran modülü. T3 Vakfı kolay I2C soketiyle tak-çalıştır kullanılır.',
    workingPrinciple: 'Her bir piksel kendi ışığını üreten mikro OLED diyotlardan oluşur. I2C veri yolu üzerinden bellek tamponu (framebuffer) güncellenerek grafik ve metinler çizilir.',
    usageAreas: ['Kayan yazı sistemleri (KayanYazi_OHEP.ino)', 'Sensör veri panelleri', 'Yapay zeka yanıt ekranı (yaziyazma.ino)', 'Mini oyunlar'],
    codeSnippet: `// Deneyap OLED Ekran Kayan Yazı
#include <Deneyap_OLED.h>
OLED oled;

void setup() {
  oled.begin(0x7A);
  oled.clearDisplay();
  oled.setTextXY(2, 0);
  oled.putString("DENEYAP KART");
  oled.setHorizontalScrollProperties(Scroll_Right, 0, 7, Scroll_4Frames);
  oled.activateScroll();
}

void loop() {
  // Ekran donanımsal kayar
}`,
    interactiveType: 'oled',
    interactiveDefault: { text: 'DENEYAP KART' }
  },

  {
    id: 'hc-sr04',
    name: 'HC-SR04 Ultrasonik Mesafe Sensörü',
    category: 'motion',
    categoryName: 'Mesafe & Hareket',
    badge: 'Dijital · 2-400 cm',
    protocol: 'Zamanlama Darbesi (GPIO)',
    voltage: '5V (VCC) / 3.3V Uyumlu Giriş',
    pins: 'Trig: D2 · Echo: D3 · VCC: 5V · GND: GND',
    lessonId: 'ultrasonik-park-sensoru',
    description: '40 kHz frekansında ultrasonik (insan kulağının duyamayacağı) ses dalgaları yayarak engellerle olan mesafeyi 3 mm hassasiyetle ölçen sensör modülü.',
    workingPrinciple: 'Trig pininden 10µs ses darbesi fırlatılır. Ses engele çarpıp döndüğünde Echo pini YÜKSEK kalır. Süre (t) x Ses Hızı (343 m/s) / 2 formülü ile mesafe hesaplanır.',
    usageAreas: ['Otomobil park sensörleri', 'Engel algılayan otonom robotlar', 'Sıvı tankı doluluk tespiti', 'Temassız kapı açma'],
    codeSnippet: `// HC-SR04 Mesafe Ölçüm Kodu
const int trig = D2;
const int echo = D3;

void setup() {
  Serial.begin(115200);
  pinMode(trig, OUTPUT);
  pinMode(echo, INPUT);
}

void loop() {
  digitalWrite(trig, LOW); delayMicroseconds(2);
  digitalWrite(trig, HIGH); delayMicroseconds(10);
  digitalWrite(trig, LOW);
  
  long sure = pulseIn(echo, HIGH);
  int cm = sure * 0.034 / 2;
  Serial.print("Mesafe: "); Serial.print(cm); Serial.println(" cm");
  delay(150);
}`,
    interactiveType: 'distance',
    interactiveDefault: { cm: 25 }
  },

  {
    id: 'ldr-sensor',
    name: 'LDR Işık Sensörü (Foto Direnç)',
    category: 'optical',
    categoryName: 'Optik & Işık',
    badge: 'Analog ADC · 0-4095',
    protocol: 'Analog Gerilim (ADC)',
    voltage: '3.3V',
    pins: 'Sinyal: A0 (ADC1_CH0) · 10kΩ Direnç Bölücü',
    lessonId: 'ldr-gece-lambasi',
    description: 'Üzerine düşen ışığın şiddeti arttıkça elektriksel direnci azalan, kadmiyum sülfit (CdS) yarı iletken tabanlı ortam ışığı sensörü.',
    workingPrinciple: 'Fotonlar yarı iletkendeki elektronları uyararak iletkenliği artırır. 10k dirençle yapılan gerilim bölücü devrede voltaj değişimi ESP32\'nin 12-bit ADC\'si ile 0-4095 arasında okunur.',
    usageAreas: ['Akıllı sokak lambaları', 'Otomatik telefon ekran parlaklığı', 'Güneş paneli takip sistemleri', 'Sera ışık kontrolü'],
    codeSnippet: `// LDR ile Işık Seviyesi Ölçümü
const int ldrPini = A0;

void setup() {
  Serial.begin(115200);
}

void loop() {
  int isik = analogRead(ldrPini);
  Serial.print("Işık Değeri (0-4095): ");
  Serial.println(isik);
  if (isik < 1500) {
    Serial.println("-> Ortam Karanlık!");
  }
  delay(300);
}`,
    interactiveType: 'light',
    interactiveDefault: { lux: 2800 }
  },

  {
    id: 'pot-sensor',
    name: '10kΩ Döner Potansiyometre (Açı Sensörü)',
    category: 'interface',
    categoryName: 'Ekran & Arayüz',
    badge: 'Analog ADC · 0-270°',
    protocol: 'Analog Gerilim (ADC)',
    voltage: '3.3V',
    pins: 'Orta Bacak: A0 · Kenarlar: 3V3 ve GND',
    lessonId: 'pot-pwm-parlaklik',
    description: 'Dönme açısına bağlı olarak gerilim bölen ve 0V ile 3.3V arasında pürüzsüz analog gerilim üreten üç bacaklı ayarlı direnç.',
    workingPrinciple: 'Karbon direnç şeridi üzerinde hareket eden sürtünme fırçası (wiper), dönme açısıyla doğru orantılı bir gerilim çıkışı sağlar.',
    usageAreas: ['Ses seviyesi ayarı', 'LED parlaklığı (PWM)', 'Servo motor açı kontrolü', 'Endüstriyel joystikler'],
    codeSnippet: `// Potansiyometre Okuma
const int potPin = A0;

void setup() {
  Serial.begin(115200);
}

void loop() {
  int ham = analogRead(potPin); // 0 - 4095
  int pwm = map(ham, 0, 4095, 0, 255);
  Serial.print("Açı: "); Serial.print(map(ham, 0, 4095, 0, 270));
  Serial.print("° | PWM: "); Serial.println(pwm);
  delay(100);
}`,
    interactiveType: 'pot',
    interactiveDefault: { val: 2048 }
  },

  {
    id: 'dht11-sensor',
    name: 'DHT11 Sıcaklık ve Nem Sensörü',
    category: 'climate',
    categoryName: 'Çevresel & Hava',
    badge: 'Tek Hat Dijital (OneWire)',
    protocol: 'Tek Telli Özel Dijital Protokol',
    voltage: '3.3V - 5V',
    pins: 'Data: D4 (GPIO18) · VCC: 3V3 · GND: GND',
    lessonId: 'tanisma-donanim',
    description: 'Ortam sıcaklığını 0-50°C (±2°C) ve bağıl nemi %20-%90 (±5%) aralığında ölçebilen kompakt dijital sensör.',
    workingPrinciple: 'Rezistif nem algılama elemanı ve NTC termistör içerir. Dahili 8-bit mikroçip bu değerleri hesaplayıp 40-bitlik dijital paket halinde tek hattan gönderir.',
    usageAreas: ['Hava durumu istasyonları', 'Akıllı sera otomasyonu', 'Kuluçka makineleri', 'Ev iklimlendirme sistemleri'],
    codeSnippet: `// DHT11 Sıcaklık ve Nem Okuma
#include <DHT.h>
#define DHTPIN D4
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
}

void loop() {
  float nem = dht.readHumidity();
  float sicaklik = dht.readTemperature();
  Serial.print("Sıcaklık: "); Serial.print(sicaklik); Serial.print("°C | ");
  Serial.print("Nem: %"); Serial.println(nem);
  delay(2000);
}`,
    interactiveType: 'temp_hum',
    interactiveDefault: { temp: 24, hum: 55 }
  },

  {
    id: 'pir-hc-sr501',
    name: 'PIR Hareket Sensörü (HC-SR501)',
    category: 'motion',
    categoryName: 'Mesafe & Hareket',
    badge: 'Dijital GPIO (0/1)',
    protocol: 'Dijital Çıkış (HIGH/LOW)',
    voltage: '5V Besleme (Çıkış 3.3V Lojik)',
    pins: 'OUT: D5 (GPIO5) · VCC: 5V · GND: GND',
    lessonId: 'harici-led-buton',
    description: 'Canlıların yaydığı kızılötesi (IR) ısı dalgalarını algılayarak ortamdaki insan veya hayvan hareketini tespit eden piroelektrik sensör.',
    workingPrinciple: 'Fresnel lensi ortamı odak alanlarına böler. Bir canlı hareket ettiğinde iki piroelektrik yuva arasındaki ısı farkı tespit edilerek çıkış HIGH yapılır.',
    usageAreas: ['Hırsız alarm sistemleri', 'Otomatik merdiven ve koridor aydınlatması', 'Enerji tasarrufu otomasyonları'],
    codeSnippet: `// PIR Hareket Sensörü Okuma
const int pirPin = D5;

void setup() {
  Serial.begin(115200);
  pinMode(pirPin, INPUT);
}

void loop() {
  if (digitalRead(pirPin) == HIGH) {
    Serial.println("[ALARM] Hareket Algılandı! 🚨");
  } else {
    Serial.println("Ortam sakin.");
  }
  delay(500);
}`,
    interactiveType: 'motion',
    interactiveDefault: { motion: false }
  },

  {
    id: 'mq2-gas',
    name: 'MQ-2 Yanıcı Gaz ve Duman Sensörü',
    category: 'climate',
    categoryName: 'Çevresel & Hava',
    badge: 'Analog & Dijital Eşik',
    protocol: 'Analog Gerilim + Dijital Karşılaştırıcı',
    voltage: '5V (Dahili Isıtıcı)',
    pins: 'AOUT: A1 · DOUT: D7 · VCC: 5V · GND: GND',
    lessonId: 'tanisma-donanim',
    description: 'LPG, Bütan, Propan, Metan, Hidrojen ve Duman gibi yanıcı ve patlayıcı gaz konsantrasyonlarını tespit eden elektro-kimyasal gaz sensörü.',
    workingPrinciple: 'Dahili ısıtıcı Kalay Dioksit (SnO2) tabakasını ısıtır. Yanıcı gaz molekülleri oksijenle tepkimeye girerek sensör direncini düşürür ve analog voltaj artar.',
    usageAreas: ['Mutfak gaz kaçağı alarmı', 'Yangın erken uyarı sistemleri', 'Endüstriyel kazan dairesi denetimi'],
    codeSnippet: `// MQ-2 Gaz Yoğunluğu Okuma
const int gazPin = A1;

void setup() {
  Serial.begin(115200);
}

void loop() {
  int gazSeviyesi = analogRead(gazPin);
  Serial.print("Gaz Yoğunluğu: "); Serial.println(gazSeviyesi);
  if (gazSeviyesi > 2200) {
    Serial.println("[TEHLİKE] Gaz Kaçağı Tespit Edildi!");
  }
  delay(400);
}`,
    interactiveType: 'gas',
    interactiveDefault: { ppm: 320 }
  },

  {
    id: 'soil-moisture',
    name: 'Toprak Nemi Sensörü',
    category: 'climate',
    categoryName: 'Çevresel & Hava',
    badge: 'Analog & Dijital',
    protocol: 'Dirençsel Analog Gerilim',
    voltage: '3.3V - 5V',
    pins: 'AOUT: A2 · DOUT: D8 · VCC: 3V3 · GND: GND',
    lessonId: 'ldr-gece-lambasi',
    description: 'Toprağın veya bitki köklerinin nem oranını elektriksel iletkenlik yoluyla ölçen iki problu dirençsel sensör modülü.',
    workingPrinciple: 'Kuru toprak yüksek dirence, nemli/ıslak toprak ise su içeriğindeki iyonlar sayesinde düşük dirence sahiptir. Voltaj değişimi analog olarak okunur.',
    usageAreas: ['Otomatik çiçek ve saksı sulama', 'Akıllı tarım ve seracılık', 'Yağmur algılama sistemleri'],
    codeSnippet: `// Toprak Nemi Okuma
const int nemPin = A2;

void setup() {
  Serial.begin(115200);
}

void loop() {
  int nem = analogRead(nemPin);
  Serial.print("Toprak Nem Değeri: "); Serial.println(nem);
  if (nem > 3000) {
    Serial.println("-> Toprak Kuru, Sulama Gerekiyor!");
  }
  delay(500);
}`,
    interactiveType: 'soil',
    interactiveDefault: { moisture: 60 }
  },

  {
    id: 'tcs34725-color',
    name: 'TCS34725 RGB Renk Tanıma Sensörü',
    category: 'optical',
    categoryName: 'Optik & Işık',
    badge: 'I2C · RGBC Filtreli',
    protocol: 'I2C (0x29)',
    voltage: '3.3V',
    pins: 'SDA: D0 · SCL: D1 · VCC: 3V3 · GND: GND',
    lessonId: 'dahili-rgb-led',
    description: 'Kırmızı, Yeşil, Mavi ve Berrak (RGBC) optik filtreleriyle nesnelerin gerçek rengini ve ışık sıcaklığını hassas ölçen I2C renk sensörü.',
    workingPrinciple: 'Entegre beyaz LED nesneyi aydınlatır; fotodiyot dizisi yansıyan ışığı R, G, B ve Clear dalga boylarına ayırıp 16-bit sayısal renk verisine çevirir.',
    usageAreas: ['Renk ayrıştırıcı robot kolları', 'Kalite kontrol ve kumaş boyama', 'Ortam renk sıcaklığı ayarlama'],
    codeSnippet: `// TCS34725 Renk Sensörü
#include <Wire.h>
#include <Adafruit_TCS34725.h>

Adafruit_TCS34725 tcs = Adafruit_TCS34725();

void setup() {
  Serial.begin(115200);
  tcs.begin();
}

void loop() {
  uint16_t r, g, b, c;
  tcs.getRawData(&r, &g, &b, &c);
  Serial.print("R: "); Serial.print(r);
  Serial.print(" G: "); Serial.print(g);
  Serial.print(" B: "); Serial.println(b);
  delay(300);
}`,
    interactiveType: 'color',
    interactiveDefault: { color: '#06b6d4' }
  },

  {
    id: 'tcrt5000-line',
    name: 'TCRT5000 Çizgi İzleyen Sensör Modülü',
    category: 'optical',
    categoryName: 'Optik & Işık',
    badge: 'Dijital & Analog',
    protocol: 'Kızılötesi Yansıma (IR)',
    voltage: '3.3V - 5V',
    pins: 'OUT: D9 · VCC: 3V3 · GND: GND',
    lessonId: 'harici-led-buton',
    description: 'Kızılötesi verici LED ve fototransistörden oluşan, siyah ve beyaz yüzeylerin ışık soğurma/yansıtma farkını algılayan çizgi sensörü.',
    workingPrinciple: 'Beyaz zemin 950nm IR ışığını kuvvetle yansıtıp çıkışı LOW yapar. Siyah çizgi ise ışığı soğurur, yansıma olmaz ve çıkış HIGH kalır.',
    usageAreas: ['Çizgi izleyen yarışma robotları', 'Otonom fabrika taşıma araçları (AGV)', 'Dönüş ve enkoder sayımı'],
    codeSnippet: `// Çizgi Sensörü Okuma
const int sensorPin = D9;

void setup() {
  Serial.begin(115200);
  pinMode(sensorPin, INPUT);
}

void loop() {
  int cizgi = digitalRead(sensorPin);
  if (cizgi == HIGH) {
    Serial.println("Siyah Çizgi Üzerinde! ⚫");
  } else {
    Serial.println("Beyaz Zemin ⚪");
  }
  delay(100);
}`,
    interactiveType: 'line',
    interactiveDefault: { onLine: false }
  }
];

export const SENSOR_CATEGORIES = [
  { id: 'all', name: 'Tüm Sensörler' },
  { id: 'builtin', name: 'Dahili Sensörler' },
  { id: 'motion', name: 'Mesafe & Hareket' },
  { id: 'climate', name: 'Çevresel & Hava' },
  { id: 'optical', name: 'Optik & Işık' },
  { id: 'display', name: 'Ekran & Modüller' },
  { id: 'interface', name: 'Arayüz & Girişler' }
];
