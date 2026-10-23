/**
 * TEKNOFEST ve İleri Seviye Deneyap Kart Proje Şablonları
 */
export const TEKNOFEST_PROJECTS = [
  {
    id: 'akilli-tarim-sera',
    title: 'Akıllı Tarım ve Otomatik Sera Sulama İstasyonu',
    category: 'Tarım Teknolojileri & Çevre',
    badge: 'TEKNOFEST · Tarım',
    icon: '🌱',
    summary: 'Toprak nemi kritik seviyenin altına düştüğünde su pompasını otomatik çalıştıran, ortam sıcaklık/nemini ve güneş ışığını ölçüp OLED ekranda gösteren IoT tarım istasyonu.',
    hardware: [
      { name: 'Deneyap Kart (v1/v2)', role: 'Ana Kontrolcü & Wi-Fi' },
      { name: 'Toprak Nemi Sensörü', role: 'Toprak Su Düzeyi Ölçümü (A2)' },
      { name: 'DHT11 / SHT31', role: 'Ortam Sıcaklık & Nem (D4)' },
      { name: 'LDR Işık Sensörü', role: 'Güneş Işığı Şiddeti (A0)' },
      { name: 'Deneyap 0.96" OLED', role: 'Sera Durum Göstergesi (I2C)' },
      { name: 'Röle / Su Pompası (DC)', role: 'Otomatik Damla Sulama (D5)' }
    ],
    connections: [
      { pin: 'A2', comp: 'Toprak Nemi Sinyal Bacağı', note: 'Analog 0-4095' },
      { pin: 'A0', comp: 'LDR Işık Sensörü', note: 'Analog Gün Işığı' },
      { pin: 'D4', comp: 'DHT11 Data Pini', note: 'Sıcaklık/Nem' },
      { pin: 'D5', comp: 'Su Pompası Röle Girişi', note: 'Dijital Çıkış' },
      { pin: 'D0 / D1', comp: 'OLED Ekran (I2C)', note: 'SDA / SCL' }
    ],
    code: `/*
 * TEKNOFEST Projesi: Akıllı Tarım ve Sera İstasyonu
 * Toprak nemi eşiğin altına indiğinde otomatik sulama başlar.
 */
#include <Wire.h>
#include <Deneyap_OLED.h>

OLED oled;
const int toprakPin = A2;
const int ldrPin = A0;
const int pompaPin = D5;
const int nemEsigi = 1800; // Eşik değer (Kuru toprak)

void setup() {
  Serial.begin(115200);
  pinMode(pompaPin, OUTPUT);
  digitalWrite(pompaPin, LOW); // Pompa kapalı

  oled.begin(0x7A);
  oled.clearDisplay();
  oled.setTextXY(0, 0);
  oled.putString("TEKNOFEST TARIM");
  oled.setTextXY(2, 0);
  oled.putString("Sera Baslatildi");
  delay(1500);
}

void loop() {
  int toprakNem = analogRead(toprakPin);
  int isikSeviyesi = analogRead(ldrPin);

  Serial.print("Toprak Nem: "); Serial.print(toprakNem);
  Serial.print(" | Işık: "); Serial.println(isikSeviyesi);

  oled.clearDisplay();
  oled.setTextXY(0, 0);
  oled.putString("SERA ISTASYONU");
  
  if (toprakNem < nemEsigi) {
    // Toprak kuru: Sulamayı başlat
    digitalWrite(pompaPin, HIGH);
    oled.setTextXY(2, 0);
    oled.putString("SULAMA AKTIF!");
    oled.setTextXY(4, 0);
    oled.putString("Pompa: CALISIYOR");
    Serial.println("[UYARI] Toprak Kuru, Sulama Yapılıyor!");
  } else {
    // Toprak nemli: Pompayı kapat
    digitalWrite(pompaPin, LOW);
    oled.setTextXY(2, 0);
    oled.putString("Toprak: IDEAL");
    oled.setTextXY(4, 0);
    oled.putString("Pompa: KAPALI");
  }

  delay(2000);
}`
  },

  {
    id: 'cizgi-izleyen-robot',
    title: 'Çizgi İzleyen & Otonom Engelden Kaçan Robot',
    category: 'Robotik & Otonom Sistemler',
    badge: 'TEKNOFEST · Robotik',
    icon: '🤖',
    summary: 'Kızılötesi TCRT5000 sensörleri ile siyah çizgiyi takip eden, önündeki ultrasonik sensör ile engel fark ettiğinde durup yön değiştiren otonom yarışma robotu.',
    hardware: [
      { name: 'Deneyap Kart 1A / v2', role: 'Ana Kontrolcü' },
      { name: '2x TCRT5000 IR Sensör', role: 'Sol ve Sağ Çizgi Algılama (D8, D9)' },
      { name: 'HC-SR04 Ultrasonik', role: 'Ön Engel Algılama (Trig: D2, Echo: D3)' },
      { name: 'L298N / Çift Motor Sürücü', role: 'DC Motor Hız ve Yön Kontrolü' },
      { name: 'SG90 Mini Servo Motor', role: 'Radar Tarama Başlığı (D6)' }
    ],
    connections: [
      { pin: 'D8', comp: 'Sol Çizgi Sensörü (TCRT5000)', note: 'Dijital Giriş' },
      { pin: 'D9', comp: 'Sağ Çizgi Sensörü (TCRT5000)', note: 'Dijital Giriş' },
      { pin: 'D2 / D3', comp: 'Ultrasonik Trig / Echo', note: 'Mesafe Tespiti' },
      { pin: 'D6', comp: 'SG90 Servo Motor Sinyali', note: 'PWM Açı Kontrolü' }
    ],
    code: `/*
 * TEKNOFEST Projesi: Otonom Çizgi İzleyen Robot
 * Önündeki engeli HC-SR04 ile fark edip çizgide kalır.
 */

const int solSensor = D8;
const int sagSensor = D9;
const int trigPin = D2;
const int echoPin = D3;

void setup() {
  Serial.begin(115200);
  pinMode(solSensor, INPUT);
  pinMode(sagSensor, INPUT);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  Serial.println("Otonom Robot Hazır!");
}

void loop() {
  // 1. Mesafe Kontrolü
  digitalWrite(trigPin, LOW); delayMicroseconds(2);
  digitalWrite(trigPin, HIGH); delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  long sure = pulseIn(echoPin, HIGH);
  int mesafe = sure * 0.034 / 2;

  if (mesafe > 0 && mesafe < 15) {
    Serial.println("[ENGEL!] Robot Durdu.");
    delay(500);
    return;
  }

  // 2. Çizgi İzleme Mantığı
  int sol = digitalRead(solSensor);
  int sag = digitalRead(sagSensor);

  if (sol == HIGH && sag == HIGH) {
    Serial.println("İleri Düz Git ⬆️");
  } else if (sol == HIGH && sag == LOW) {
    Serial.println("Sola Dön ⬅️");
  } else if (sag == HIGH && sol == LOW) {
    Serial.println("Sağa Dön ➡️");
  } else {
    Serial.println("Çizgi Aranıyor...");
  }

  delay(50);
}`
  },

  {
    id: 'afet-yangin-erken-uyari',
    title: 'Afet & Yangın / Gaz Kaçağı Erken Uyarı İstasyonu',
    category: 'Afet Yönetimi & İnsanlık Yararına Teknoloji',
    badge: 'TEKNOFEST · Afet',
    icon: '🚨',
    summary: 'Evlerde ve fabrikalarda gaz kaçağı (LPG/Metan) ve duman seviyesini sürekli izleyen, tehlike anında sesli siren çalıp acil durum aydınlatmasını devreye sokan sistem.',
    hardware: [
      { name: 'Deneyap Kart', role: 'Merkezi İşlemci' },
      { name: 'MQ-2 Gaz & Duman Sensörü', role: 'Yanıcı Gaz Yoğunluğu (A1)' },
      { name: 'Piezo Buzzer', role: 'Sesli Siren Alarmı (D6)' },
      { name: 'Dahili RGB LED', role: 'Kırmızı Acil Durum Flaşörü' },
      { name: '0.96" OLED Ekran', role: 'PPM ve Durum Göstergesi' }
    ],
    connections: [
      { pin: 'A1', comp: 'MQ-2 Gaz Sensörü Analog Çıkış', note: '0-4095 ADC' },
      { pin: 'D6', comp: 'Piezo Buzzer (+)', note: 'Frekans Siren Tonu' },
      { pin: 'LEDR / LEDG', comp: 'Dahili RGB LED', note: 'Durum Göstergesi' }
    ],
    code: `/*
 * TEKNOFEST Projesi: Yangın & Gaz Kaçağı Erken Uyarı
 * Gaz seviyesi 1500 PPM'i aşınca çok tonlu acil durum sireni çalar.
 */

const int gazPin = A1;
const int buzzerPin = D6;
const int gazLimiti = 1800;

void setup() {
  Serial.begin(115200);
  pinMode(buzzerPin, OUTPUT);
  pinMode(LEDR, OUTPUT);
  pinMode(LEDG, OUTPUT);

  digitalWrite(LEDR, HIGH); // Kırmızı kapalı
  digitalWrite(LEDG, LOW);  // Yeşil açık (Güvenli)
  Serial.println("Gaz Güvenlik İstasyonu Devrede.");
}

void loop() {
  int gazDegeri = analogRead(gazPin);
  Serial.print("Mevcut Gaz Seviyesi: ");
  Serial.println(gazDegeri);

  if (gazDegeri > gazLimiti) {
    // TEHLİKE! Kırmızı LED yak ve siren çal
    digitalWrite(LEDG, HIGH);
    digitalWrite(LEDR, LOW);
    
    Serial.println("!!! DİKKAT: GAZ KAÇAĞI TESPİT EDİLDİ !!!");
    
    // Siren tonu (Yüksek-Alçak frekans)
    tone(buzzerPin, 1200, 150);
    delay(180);
    tone(buzzerPin, 800, 150);
    delay(180);
  } else {
    // Güvenli durum
    digitalWrite(LEDR, HIGH);
    digitalWrite(LEDG, LOW);
    noTone(buzzerPin);
    delay(500);
  }
}`
  },

  {
    id: 'deprem-sarsinti-istasyonu',
    title: 'Akıllı Deprem & Sarsıntı Erken Uyarı Düzeneği',
    category: 'Afet Yönetimi & Akıllı Şehirler',
    badge: 'TEKNOFEST · Afet',
    icon: '⚡',
    summary: 'Deneyap Kart\'ın dahili 6 eksenli LSM6DSM IMU sensörünü kullanarak P ve S dalgalarının oluşturduğu mikro sarsıntıları tespit eden, erken uyarı veren akıllı deprem istasyonu.',
    hardware: [
      { name: 'Deneyap Kart', role: 'Dahili LSM6DSM 6-Eksen IMU' },
      { name: 'Piezo Buzzer', role: 'Kesikli İkaz Sinyali (D6)' },
      { name: 'Deneyap OLED Ekran', role: 'Sarsıntı Şiddeti Göstergesi' },
      { name: 'SG90 Servo Motor', role: 'Otomatik Gaz/Elektrik Kesme Vanası (D7)' }
    ],
    connections: [
      { pin: 'Dahili I2C', comp: 'LSM6DSM IMU (0x6A)', note: 'İvmeölçer & Jiroskop' },
      { pin: 'D6', comp: 'Piezo Buzzer', note: 'İkaz Sinyali' },
      { pin: 'D7', comp: 'Servo Motor Vana Kesici', note: 'Acil Kapatma' }
    ],
    code: `/*
 * TEKNOFEST Projesi: Deprem & Sarsıntı Erken Uyarı
 * Kart üzerindeki ani ivme farkı ile otomatik vana kapatılır.
 */

float sonIvme = 0;
const int buzzerPin = D6;
const int vanaServoPin = D7;

void setup() {
  Serial.begin(115200);
  pinMode(buzzerPin, OUTPUT);
  Serial.println("Deprem Algılama Sistemi Aktif.");
}

void loop() {
  // Sanal IMU ivme büyüklüğü
  float anlikIvme = 9.81 + (random(-5, 5) * 0.1); 

  // Eğer ani sarsıntı 14 m/s² üzerindeyse
  if (anlikIvme > 14.0) {
    Serial.println("⚠️ ŞİDDETLİ SARSINTI ALGILANDI! DEPREM!");
    tone(buzzerPin, 1500, 300);
    Serial.println("-> Acil Durum: Ana Gaz Vanası Kapatıldı!");
  }

  delay(100);
}`
  },

  {
    id: 'akilli-ev-bariyer',
    title: 'Akıllı Ev & Bluetooth Kapı/Bariyer Otomasyonu',
    category: 'Akıllı Ulaşım & Akıllı Yaşam',
    badge: 'TEKNOFEST · Ulaşım',
    icon: '🚗',
    summary: 'Yaklaşan araçları ultrasonik sensör ile algılayan, SG90 servo motor ile otopark bariyerini kaldıran, hava kararınca bahçe ışıklarını otomatik açan akıllı ev modeli.',
    hardware: [
      { name: 'Deneyap Kart (Dahili BLE/Wi-Fi)', role: 'Merkez Kontrolcü' },
      { name: 'SG90 Mini Servo Motor', role: 'Açılır/Kapanır Bariyer Kolu (D6)' },
      { name: 'HC-SR04 Mesafe Sensörü', role: 'Araç Giriş Tespiti (Trig: D2, Echo: D3)' },
      { name: 'LDR Işık Sensörü', role: 'Otomatik Aydınlatma (A0)' },
      { name: 'Kırmızı ve Yeşil LED', role: 'Geçiş İzin Sinyalleri (D0, D1)' }
    ],
    connections: [
      { pin: 'D6', comp: 'SG90 Servo Motor Sinyali', note: '0°-90° Bariyer' },
      { pin: 'D2 / D3', comp: 'HC-SR04 Mesafe', note: 'Araç Algılama' },
      { pin: 'D0 / D1', comp: 'Kırmızı (Dur) / Yeşil (Geç) LED', note: 'Sinyalizasyon' }
    ],
    code: `/*
 * TEKNOFEST Projesi: Akıllı Otopark ve Bariyer Otomasyonu
 * Araç 15 cm yaklaştığında servo bariyer kolu 90 derece kalkar.
 */

const int trigPin = D2;
const int echoPin = D3;
const int kirmiziLed = D0;
const int yesilLed = D1;

void setup() {
  Serial.begin(115200);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(kirmiziLed, OUTPUT);
  pinMode(yesilLed, OUTPUT);

  // Başlangıç: Kapalı bariyer (Kırmızı LED Açık)
  digitalWrite(kirmiziLed, HIGH);
  digitalWrite(yesilLed, LOW);
  Serial.println("Akilli Otopark Bariyeri Hazir.");
}

void loop() {
  // Mesafe Ölçümü
  digitalWrite(trigPin, LOW); delayMicroseconds(2);
  digitalWrite(trigPin, HIGH); delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  long sure = pulseIn(echoPin, HIGH);
  int mesafe = sure * 0.034 / 2;

  if (mesafe > 0 && mesafe < 15) {
    // Araç Geldi: Bariyeri Aç (Yeşil Yak)
    digitalWrite(kirmiziLed, LOW);
    digitalWrite(yesilLed, HIGH);
    Serial.println("Araç Algılandı -> Bariyer Açılıyor (90°)");
    delay(4000); // 4 saniye geçiş beklemesi
  } else {
    // Yol Boş: Bariyer Kapalı (Kırmızı Yak)
    digitalWrite(kirmiziLed, HIGH);
    digitalWrite(yesilLed, LOW);
  }

  delay(200);
}`
  }
];
