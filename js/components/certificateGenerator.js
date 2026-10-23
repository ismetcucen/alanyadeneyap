/**
 * Başarı Sertifikası Üretici (Certificate Studio)
 * HTML5 Canvas ile 1920x1080 yüksek çözünürlüklü altın yaldızlı sertifika oluşturur.
 */
import { audioSynth } from './audioSynth.js';
import { fireConfetti } from '../utils/helpers.js';

export class CertificateGenerator {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.studentName = 'Genç Mucit';
    this.schoolName = 'Deneyap Teknoloji Atölyesi';

    this.initDOM();
  }

  initDOM() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="cert-studio-wrapper">
        <!-- Sol Ayarlar ve Bilgi Girişi -->
        <aside class="cert-sidebar">
          <div class="cert-sidebar-header">
            <span class="cert-badge">🏆 BAŞARI SERTİFİKASI</span>
            <h3>Sertifikanı Özelleştir</h3>
            <p>Atölyeyi başarıyla tamamladın! Adını ve okulunu yazarak resmi sertifikanı oluştur.</p>
          </div>

          <div class="cert-form">
            <div class="cert-field">
              <label for="cert-input-name">Öğrenci Adı ve Soyadı:</label>
              <input type="text" id="cert-input-name" value="${this.studentName}" placeholder="Örn: İsmet Çüçen" />
            </div>

            <div class="cert-field">
              <label for="cert-input-school">Okul / Takım Adı:</label>
              <input type="text" id="cert-input-school" value="${this.schoolName}" placeholder="Örn: TEKNOFEST Robotik Takımı" />
            </div>

            <button class="cert-btn-download" id="cert-btn-download">
              <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              <span>Sertifikayı İndir (HD PNG)</span>
            </button>
          </div>
        </aside>

        <!-- Sağ Canlı Önizleme Tuvali -->
        <main class="cert-preview-area">
          <div class="cert-canvas-frame">
            <canvas id="cert-canvas" width="1920" height="1080"></canvas>
          </div>
        </main>
      </div>
    `;

    this.bindEvents();
    this.renderCertificate();
  }

  bindEvents() {
    const inputName = this.container.querySelector('#cert-input-name');
    const inputSchool = this.container.querySelector('#cert-input-school');

    inputName?.addEventListener('input', (e) => {
      this.studentName = e.target.value || 'Genç Mucit';
      this.renderCertificate();
    });

    inputSchool?.addEventListener('input', (e) => {
      this.schoolName = e.target.value || 'Deneyap Teknoloji Atölyesi';
      this.renderCertificate();
    });

    this.container.querySelector('#cert-btn-download')?.addEventListener('click', () => {
      this.downloadCertificate();
      audioSynth.playSuccess();
      fireConfetti();
    });
  }

  renderCertificate() {
    const canvas = this.container?.querySelector('#cert-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 1920;
    const h = 1080;

    // 1. Arka Plan (Derin Lacivert & Asil Gradyan)
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 100, w / 2, h / 2, w / 1.2);
    bgGrad.addColorStop(0, '#0c162c');
    bgGrad.addColorStop(1, '#050a14');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Altın Çerçeve (Gold Border)
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 14;
    ctx.strokeRect(40, 40, w - 80, h - 80);

    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 3;
    ctx.strokeRect(55, 55, w - 110, h - 110);

    // 3. Köşe Motifleri
    const drawCorner = (x, y) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };
    drawCorner(55, 55);
    drawCorner(w - 55, 55);
    drawCorner(55, h - 55);
    drawCorner(w - 55, h - 55);

    // 4. Üst Başlıklar & Logolar
    ctx.textAlign = 'center';

    // Üst Amblem
    ctx.font = 'bold 32px sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('🇹🇷  MİLLİ TEKNOLOJİ HAMLESİ  🇹🇷', w / 2, 140);

    ctx.font = '900 68px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.letterSpacing = '4px';
    ctx.fillText('DENEYAP KART ATÖLYESİ', w / 2, 230);

    // Altın Şerit Başlık
    ctx.font = 'bold 42px sans-serif';
    ctx.fillStyle = '#eab308';
    ctx.fillText('— ÜSTÜN BAŞARI BELGESİ —', w / 2, 310);

    // Açıklama
    ctx.font = '28px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Bu belge, Deneyap Kart İnteraktif Donanım, Sensör ve Kod Simülasyon Programını', w / 2, 400);
    ctx.fillText('başarıyla tamamlayarak üstün gayret gösteren genç mucidimize verilmiştir:', w / 2, 445);

    // 5. Öğrenci Adı (Büyük Vurgulu)
    ctx.font = '900 86px serif';
    const nameGrad = ctx.createLinearGradient(w / 2 - 400, 0, w / 2 + 400, 0);
    nameGrad.addColorStop(0, '#38bdf8');
    nameGrad.addColorStop(0.5, '#ffffff');
    nameGrad.addColorStop(1, '#38bdf8');
    ctx.fillStyle = nameGrad;
    ctx.fillText(this.studentName.toUpperCase(), w / 2, 570);

    // İnce Altın Çizgi
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 350, 600);
    ctx.lineTo(w / 2 + 350, 600);
    ctx.stroke();

    // Okul / Takım Adı
    ctx.font = 'italic bold 36px sans-serif';
    ctx.fillStyle = '#06b6d4';
    ctx.fillText(this.schoolName, w / 2, 660);

    // Kazanım Metni
    ctx.font = '26px sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('ESP32 Çift Çekirdekli Sistem Mimarisi · 360° Pinout & PWM Kontrolü · Sensör ve Ekran Haberleşmesi', w / 2, 740);
    ctx.fillText('C++ & Blok Tabanlı Algoritmik Modelleme ve Otonom Robotik Yetkinliği', w / 2, 780);

    // 6. Mühür ve İmzalar
    const dateStr = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

    // Sol: Tarih & Doğrulama
    ctx.textAlign = 'left';
    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`Düzenleme Tarihi: ${dateStr}`, 140, 930);
    ctx.fillText('Sertifika Kodu: DNYP-2026-TR', 140, 970);

    // Orta: Altın Mühür Rozeti
    ctx.textAlign = 'center';
    ctx.save();
    ctx.translate(w / 2, 920);
    ctx.fillStyle = '#ca8a04';
    ctx.beginPath();
    ctx.arc(0, 0, 55, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(0, 0, 48, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0c162c';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('DENEYAP', 0, -8);
    ctx.fillText('ONAYLI', 0, 14);
    ctx.restore();

    // Sağ: İmza Alanı
    ctx.textAlign = 'right';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Deneyap Teknoloji Hamlesi', w - 140, 930);
    ctx.font = '22px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Eğitim ve Simülasyon Koordinatörlüğü', w - 140, 970);
  }

  downloadCertificate() {
    const canvas = this.container?.querySelector('#cert-canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `Deneyap_Basari_Sertifikasi_${this.studentName.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  }
}
