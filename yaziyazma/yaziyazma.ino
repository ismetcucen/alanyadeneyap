#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <ArduinoJson.h> // Bu kütüphanenin yüklü olması gerekir (Kütüphane Yöneticisinden kurabilirsin)

// --- AYARLAR ---
const char* ssid = "WIFI_ADINIZ";              // Wi-Fi Adınız
const char* password = "WIFI_SIFRENIZ";        // Wi-Fi Şifreniz
const char* apiKey = "BURAYA_GEMINI_API_KEY";  // Google AI Studio API Anahtarı

// OLED Ekran Tanımları
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET    -1 
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

void setup() {
  Serial.begin(115200);
  Wire.begin(); 

  // OLED Başlatma
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3D)) {
    Serial.println(F("OLED baslatilamadi!"));
    for(;;);
  }

  display.clearDisplay();
  display.fillScreen(SSD1306_BLACK);
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println(F("WiFi Baglaniyor..."));
  display.display();

  // Wi-Fi Bağlantısı
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  display.clearDisplay();
  display.fillScreen(SSD1306_BLACK);
  display.setCursor(0, 0);
  display.println(F("WiFi Basarili!"));
  display.println(F("Gemini'ye soruluyor..."));
  display.display();

  // Gemini'ye İstek Gönder
  askGemini("Merhaba, kendini kısaca tanıt.");
}

void loop() {
  // Döngü boş, istek setup içinde bir kez test amaçlı atılacak
}

void askGemini(String promptText) {
  WiFiClientSecure client;
  client.setInsecure(); // SSL sertifika kontrolünü atla (test için kolaylık sağlar)

  const char* host = "generativelanguage.googleapis.com";
  const int port = 443;

  if (!client.connect(host, port)) {
    Serial.println(F("Sunucuya baglanilamadi!"));
    return;
  }

  // Gönderilecek JSON verisini hazırla (Gemini 1.5 Flash modeli)
  String url ="https://generativelanguage.googleapis.com/v1beta/models/" 
  "gemini-3.5-flash:generateContent";
  
  // İstek gövdesi (Payload)
  String payload = "{\"contents\":[{\"parts\":[{\"text\":\"" + promptText + "\"}]}]}";

  // HTTP POST isteği oluştur
  client.println(String("POST ") + url + " HTTP/1.1");
  client.println(String("Host: ") + host);
  client.println(F("Content-Type: application/json"));
  client.print(F("Content-Length: "));
  client.println(payload.length());
  client.println(F("Connection: close"));
  client.println();
  client.print(payload);

  // Sunucudan yanıt gelmesini bekle
  unsigned long timeout = millis();
  while (client.connected()) {
    String line = client.readStringUntil('\n');
    if (line == "\r") {
      break;
    }
  }

  // Gelen yanıtı oku (Gövde kısmı)
  String response = client.readString();
  Serial.println(response); // Ham yanıtı seri monitörde görmek için

  // Yanıtı OLED ekrana yazdır (Özet olarak ilk satırlar)
  display.clearDisplay();
  display.fillScreen(SSD1306_BLACK);
  display.setCursor(0, 0);
  display.println(F("Gemini Cevabi:"));
  
  // Ekrana sığacak şekilde basit bir çıktı verelim
  display.println(F("Cevap alindi!"));
  display.println(F("Seri Monitore bakin."));
  display.display();
}