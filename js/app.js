/**
 * Deneyap Kart İnteraktif Atölye Uygulama Orkestratörü
 * Referans Tasarım: yapayzekaokulum.com/atolye
 */
import { LESSONS_DATA } from './data/lessons.js';
import { BOARDS_DATA } from './data/boards.js';
import { TEKNOFEST_PROJECTS } from './data/teknofestProjects.js';
import { BoardViewer } from './components/boardViewer.js';
import { CircuitSimulator } from './components/circuitSimulator.js';
import { SandboxSimulator } from './components/sandboxSimulator.js';
import { CodeEditor } from './components/codeEditor.js';
import { ArduinoEngine } from './components/arduinoEngine.js';
import { SerialMonitor } from './components/serialMonitor.js';
import { SensorExplorer } from './components/sensorExplorer.js';
import { SpeechGuide } from './components/speechGuide.js';
import { CertificateGenerator } from './components/certificateGenerator.js';
import { audioSynth } from './components/audioSynth.js';
import { ProgressManager, fireConfetti } from './utils/helpers.js';

class DeneyapAtolyeApp {
  constructor() {
    this.currentAppMode = 'lessons'; // 'lessons' | 'sandbox' | 'sensors' | 'teknofest' | 'cert'
    this.currentLesson = null;
    this.currentStep = 'kur';        // 'tani' | 'kur' | 'calistir' | 'gorev'
    this.currentTab = 'ders';        // 'ders' | 'kod' | 'gorev'
    this.isNightMode = true;

    this.init();
  }

  init() {
    // 1. Türkçe Sesli Asistan
    this.speechGuide = new SpeechGuide('altyazi');

    // 2. 360° Kart ve Pin Tanıtım Görünümü (1. Adım "Tanı")
    this.boardViewer = new BoardViewer('bv-container');

    // 3. 12 Sensör Galerisi
    this.sensorExplorer = new SensorExplorer('sensor-container', {
      onSelectLesson: (lessonId) => {
        this.setAppMode('lessons');
        this.loadLesson(lessonId, true);
        this.switchStep('kur');
      },
      onClose: () => {
        this.setAppMode('lessons');
      }
    });

    // 4. Serbest Deney Masası (Sandbox)
    this.sandboxSimulator = new SandboxSimulator('sandbox-container', {
      onClose: () => {
        this.setAppMode('lessons');
      }
    });

    // 5. Başarı Sertifikası Stüdyosu
    this.certificateGenerator = new CertificateGenerator('cert-container', {
      onClose: () => {
        this.setAppMode('lessons');
      }
    });

    // 6. Ders Devre & Breadboard Simülatörü
    this.circuitSimulator = new CircuitSimulator('sim-container', {
      onStateChange: () => {}
    });

    // 7. Seri Monitör & Web Serial
    this.serialMonitor = new SerialMonitor('serial-monitor-container', {
      onSend: () => {}
    });

    // 8. Sanal Arduino C++ Yürütme Motoru
    this.arduinoEngine = new ArduinoEngine({
      simulator: this.circuitSimulator,
      boardViewer: this.boardViewer,
      serialMonitor: this.serialMonitor,
      onStatusChange: (status) => {
        this.codeEditor.setRunningState(status === 'running');
        const badge = document.getElementById('konsol-durum');
        if (badge) {
          badge.textContent = status === 'running' ? 'ÇALIŞIYOR' : 'DURDURULDU';
          badge.className = status === 'running' ? 'status-running' : 'status-stopped';
        }
      }
    });

    // 9. C++ ve Blok Kod Düzenleyici
    this.codeEditor = new CodeEditor('code-editor-container', {
      onRun: (code) => {
        this.arduinoEngine.start(code);
      },
      onStop: () => {
        this.arduinoEngine.stop();
      }
    });

    // 10. Olay Dinleyicilerini Bağla
    this.bindDOMEvents();

    // 11. Sol Menü Çekmecesini Render Et
    this.renderLessonsList();

    // 12. TEKNOFEST Projeleri Vitrinini Hazırla
    this.renderTeknofestProjects();

    // 13. URL Parametresi veya Son Kalınan Dersi Yükle
    const urlParams = new URLSearchParams(window.location.search);
    const lessonId = urlParams.get('ders') || ProgressManager.getLastLesson();
    this.loadLesson(lessonId, false);

    // 14. Genel İlerlemeyi Güncelle
    this.updateGlobalProgress();

    // 15. Açılış Karşılama Anlatımı
    setTimeout(() => {
      if (this.speechGuide && this.currentLesson) {
        this.speechGuide.speak(`Deneyap Atölyesine hoş geldiniz! Bugünkü konumuz: ${this.currentLesson.title}.`);
      }
    }, 1000);
  }

  bindDOMEvents() {
    // Sol Menü Çekmecesi Aç/Kapat
    const listBtn = document.getElementById('liste-dugmesi');
    const drawer = document.getElementById('ders-listesi');
    const backdrop = document.getElementById('perde');

    const toggleDrawer = () => {
      const isOpen = drawer.classList.toggle('acik');
      backdrop.hidden = !isOpen;
      listBtn.setAttribute('aria-expanded', isOpen);
      audioSynth.playClick();
    };

    listBtn.addEventListener('click', toggleDrawer);
    backdrop.addEventListener('click', () => {
      drawer.classList.remove('acik');
      backdrop.hidden = true;
      listBtn.setAttribute('aria-expanded', false);
    });

    // Ses Aç/Kapat Butonu
    const soundBtn = document.getElementById('ses-dugmesi');
    soundBtn.addEventListener('click', () => {
      const muted = audioSynth.toggleMute();
      soundBtn.classList.toggle('muted', muted);
      soundBtn.title = muted ? 'Sesi Aç' : 'Sesi Kapat';
      if (!muted) audioSynth.playClick();
    });
    if (audioSynth.isMuted()) {
      soundBtn.classList.add('muted');
    }

    // Gece / Gündüz Teması
    const themeBtn = document.getElementById('tema-dugmesi');
    themeBtn.addEventListener('click', () => {
      this.isNightMode = !this.isNightMode;
      document.documentElement.setAttribute('data-tema', this.isNightMode ? 'gece' : 'gunduz');
      audioSynth.playClick();
    });

    // Sağ Panel Gizle / Göster
    const panelBtn = document.getElementById('panel-dugmesi');
    const panel = document.getElementById('panel');
    panelBtn.addEventListener('click', () => {
      const isHidden = panel.classList.toggle('gizli');
      panelBtn.setAttribute('aria-expanded', !isHidden);
      audioSynth.playClick();
    });

    // Sağ Panel Sekmeleri (DERS / KOD / GÖREVLER)
    document.querySelectorAll('.panel-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = e.target.dataset.sekme;
        this.switchTab(tabName);
        audioSynth.playClick();
      });
    });

    // Alt 4 Adım (1. Tanı, 2. Devreyi Kur, 3. Kodu Yaz, 4. Görevler)
    document.querySelectorAll('.adim-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const step = e.currentTarget.dataset.adim;
        this.switchStep(step);
        audioSynth.playClick();
      });
    });

    // "Devreyi Birlikte Kuralım" Butonu (Ders sekmesinden)
    const kurBtn = document.getElementById('kurmaya-basla');
    if (kurBtn) {
      kurBtn.addEventListener('click', () => {
        this.switchStep('kur');
        audioSynth.playSuccess();
      });
    }
  }

  /**
   * Modül Değişimi: Dersler, Serbest Masa, Sensörler, TEKNOFEST, Sertifika
   */
  setAppMode(mode) {
    this.currentAppMode = mode;

    const simContainer = document.getElementById('sim-container');
    const bvContainer = document.getElementById('bv-container');
    const sandboxContainer = document.getElementById('sandbox-container');
    const sensorContainer = document.getElementById('sensor-container');
    const teknofestContainer = document.getElementById('teknofest-container');
    const certContainer = document.getElementById('cert-container');
    const altBolge = document.getElementById('alt-bolge');
    const panel = document.getElementById('panel');

    // Tüm sahneleri gizle
    if (simContainer) simContainer.hidden = true;
    if (bvContainer) bvContainer.hidden = true;
    if (sandboxContainer) sandboxContainer.hidden = true;
    if (sensorContainer) sensorContainer.hidden = true;
    if (teknofestContainer) teknofestContainer.hidden = true;
    if (certContainer) certContainer.hidden = true;

    if (mode === 'lessons') {
      if (altBolge) altBolge.hidden = false;
      if (panel) panel.classList.remove('gizli');
      this.arduinoEngine.setSimulator(this.circuitSimulator);
      this.switchStep(this.currentStep);
    } else if (mode === 'sandbox') {
      if (altBolge) altBolge.hidden = true;
      if (sandboxContainer) sandboxContainer.hidden = false;
      if (panel) {
        panel.classList.remove('gizli');
        this.switchTab('kod');
      }
      this.arduinoEngine.setSimulator(this.sandboxSimulator);
      if (this.speechGuide) {
        this.speechGuide.speak('Serbest Deney Masasına hoş geldiniz! İstediğiniz parçaları ekleyin ve serbestçe kodlayın.');
      }
    } else if (mode === 'sensors') {
      if (altBolge) altBolge.hidden = true;
      if (sensorContainer) sensorContainer.hidden = false;
      if (this.speechGuide) {
        this.speechGuide.speak('Sensör ve Modül Rehberindesiniz. Milli ekosisteme ait 12 sensörü canlı test edebilirsiniz.');
      }
    } else if (mode === 'teknofest') {
      if (altBolge) altBolge.hidden = true;
      if (teknofestContainer) teknofestContainer.hidden = false;
      if (this.speechGuide) {
        this.speechGuide.speak('TEKNOFEST ve İleri Seviye Proje Vitrini. Bir proje seçerek atölyede simüle edebilirsiniz.');
      }
    } else if (mode === 'cert') {
      if (altBolge) altBolge.hidden = true;
      if (certContainer) certContainer.hidden = false;
      if (this.certificateGenerator) {
        this.certificateGenerator.renderCertificate();
      }
      if (this.speechGuide) {
        this.speechGuide.speak('Tebrikler! Resmi başarı sertifikanızı adınıza özel oluşturup HD olarak indirebilirsiniz.');
      }
    }

    audioSynth.playClick();
  }

  renderLessonsList() {
    const listEl = document.getElementById('ders-listesi');
    if (!listEl) return;

    const categories = {};
    LESSONS_DATA.forEach(lesson => {
      if (!categories[lesson.category]) categories[lesson.category] = [];
      categories[lesson.category].push(lesson);
    });

    let html = `
      <div class="ders-listesi-header">
        <h3>DENEYAP ATÖLYESİ</h3>
        <span class="toplam-ders">${LESSONS_DATA.length} Ders</span>
      </div>

      <!-- Özel Atölye Modülleri Hızlı Erişim Kartları -->
      <div class="drawer-moduller-grid">
        <button class="drawer-modul-btn" data-modul="sandbox">
          <span class="dm-icon">⚡</span>
          <span class="dm-text">Serbest Masa</span>
        </button>
        <button class="drawer-modul-btn" data-modul="sensors">
          <span class="dm-icon">📡</span>
          <span class="dm-text">Sensör Rehberi</span>
        </button>
        <button class="drawer-modul-btn" data-modul="teknofest">
          <span class="dm-icon">🚀</span>
          <span class="dm-text">TEKNOFEST</span>
        </button>
        <button class="drawer-modul-btn" data-modul="cert">
          <span class="dm-icon">🏆</span>
          <span class="dm-text">Sertifika</span>
        </button>
      </div>

      <!-- Müfredat Ders Listesi -->
      <div class="ders-listesi-body">
    `;

    for (const [catName, lessons] of Object.entries(categories)) {
      html += `
        <div class="ders-kategori-grup">
          <div class="kategori-baslik">${catName}</div>
          <div class="kategori-dersler">
            ${lessons.map((l, index) => {
              const isCompleted = ProgressManager.isLessonCompleted(l.id);
              const isActive = this.currentLesson && this.currentLesson.id === l.id;
              return `
                <div class="ders-ogesi ${isActive ? 'aktif' : ''} ${isCompleted ? 'tamamlandi' : ''}" data-ders="${l.id}">
                  <span class="ders-no">${isCompleted ? '✓' : index + 1}</span>
                  <div class="ders-bilgi">
                    <div class="ders-adi">${l.title}</div>
                    <div class="ders-sure">${l.duration}</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    html += `</div>`;
    listEl.innerHTML = html;

    const closeDrawer = () => {
      document.getElementById('ders-listesi').classList.remove('acik');
      document.getElementById('perde').hidden = true;
      document.getElementById('liste-dugmesi').setAttribute('aria-expanded', false);
    };

    // Özel Modül Butonları
    listEl.querySelectorAll('.drawer-modul-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modul = e.currentTarget.dataset.modul;
        this.setAppMode(modul);
        closeDrawer();
      });
    });

    // Ders Seçim Butonları
    listEl.querySelectorAll('.ders-ogesi').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.ders;
        this.setAppMode('lessons');
        this.loadLesson(id, true);
        closeDrawer();
        audioSynth.playClick();
      });
    });
  }

  renderTeknofestProjects() {
    const container = document.getElementById('teknofest-container');
    if (!container) return;

    let html = `
      <header class="tf-header">
        <button class="btn-atolye-don" id="tf-btn-back">← Atölye Dersine Dön</button>
        <span class="tf-header-tag">🚀 MİLLİ TEKNOLOJİ HAMLESİ · YARIŞMA PROJELERİ</span>
        <h2>TEKNOFEST & İleri Seviye Proje Vitrini</h2>
        <p>Gerçek hayat ve TEKNOFEST yarışmalarına yönelik kapsamlı Deneyap Kart proje mimarileri. Şablonu atölyede açıp doğrudan simüle edebilir veya kodlarını geliştirebilirsiniz.</p>
      </header>
      <div class="tf-cards-grid">
    `;

    TEKNOFEST_PROJECTS.forEach(proj => {
      html += `
        <div class="tf-card" data-project-id="${proj.id}">
          <div class="tf-card-top">
            <span class="tf-card-icon">${proj.icon}</span>
            <span class="tf-card-badge">${proj.badge}</span>
          </div>
          <h3>${proj.title}</h3>
          <p>${proj.summary}</p>
          <div class="tf-hw-list">
            ${proj.hardware.map(hw => `<span class="tf-hw-item" title="${hw.role}">• ${hw.name}</span>`).join('')}
          </div>
          <button class="tf-btn-load" data-proj-id="${proj.id}">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            <span>Bu Projeyi Atölyede Aç & Kodla</span>
          </button>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;

    // Geri Dön Butonu
    container.querySelector('#tf-btn-back')?.addEventListener('click', () => {
      this.setAppMode('lessons');
      audioSynth.playClick();
    });

    // Projeyi Yükle Butonları
    container.querySelectorAll('.tf-btn-load').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const projId = e.currentTarget.dataset.projId;
        const proj = TEKNOFEST_PROJECTS.find(p => p.id === projId);
        if (proj) {
          this.loadTeknofestProject(proj);
        }
      });
    });
  }

  loadTeknofestProject(proj) {
    this.setAppMode('lessons');
    this.codeEditor.setCode(proj.code);
    this.switchTab('kod');
    this.switchStep('calistir');

    audioSynth.playSuccess();
    fireConfetti();
    if (this.speechGuide) {
      this.speechGuide.speak(`${proj.title} projesi atölyeye yüklendi. C++ kodunu inceleyip Kodu Çalıştır butonu ile simüle edebilirsiniz.`);
    }
  }

  loadLesson(lessonId, updateUrl = true) {
    const lesson = LESSONS_DATA.find(l => l.id === lessonId) || LESSONS_DATA[0];
    this.currentLesson = lesson;
    ProgressManager.setLastLesson(lesson.id);

    if (updateUrl && typeof window !== 'undefined') {
      const url = new URL(window.location);
      url.searchParams.set('ders', lesson.id);
      window.history.pushState({}, '', url);
    }

    // Ekmek Kırıntıları
    const breadcrumbs = document.getElementById('kirintilar');
    if (breadcrumbs) {
      breadcrumbs.innerHTML = `
        <span class="kr-cat">${lesson.category}</span>
        <span class="kr-sep">/</span>
        <strong class="kr-title">${lesson.title}</strong>
      `;
    }

    // Ders Sekmesi İçeriğini Doldur
    const modulEl = document.getElementById('ders-modul');
    if (modulEl) modulEl.textContent = lesson.category;
    const baslikEl = document.getElementById('ders-baslik');
    if (baslikEl) baslikEl.textContent = lesson.title;
    const sureEl = document.getElementById('ders-sure');
    if (sureEl) sureEl.textContent = `⏱️ ${lesson.duration}`;
    const ozetEl = document.getElementById('ders-ozet');
    if (ozetEl) ozetEl.textContent = lesson.summary;

    // Kazanımlar
    const kazanimlarEl = document.getElementById('ders-kazanimlar');
    if (kazanimlarEl) {
      kazanimlarEl.innerHTML = (lesson.outcomes || []).map(k => `<li>${k}</li>`).join('');
    }

    // Malzemeler
    const malzemelerEl = document.getElementById('ders-malzemeler');
    if (malzemelerEl) {
      malzemelerEl.innerHTML = (lesson.materials || []).map(m => `
        <li class="malzeme-kutu">
          <span class="m-ad">${m.name}</span>
          <span class="m-adet">${m.count}</span>
        </li>
      `).join('');
    }

    // Bağlantılar Tablosu
    const baglantilarEl = document.getElementById('ders-baglantilar');
    if (baglantilarEl) {
      baglantilarEl.innerHTML = `
        <thead><tr><th>Deneyap Kart</th><th>Hedef Bileşen</th><th>Not</th></tr></thead>
        <tbody>
          ${(lesson.connections || []).map(c => `
            <tr>
              <td><code>${c.from}</code></td>
              <td><strong>${c.to}</strong></td>
              <td>${c.note}</td>
            </tr>
          `).join('')}
        </tbody>
      `;
    }

    // Alt Bileşenleri Yükle
    this.circuitSimulator.loadLesson(lesson);
    this.codeEditor.loadLesson(lesson);
    this.renderTasks(lesson);

    // Aktif Dersi Listede İşaretle
    document.querySelectorAll('.ders-ogesi').forEach(el => {
      el.classList.toggle('aktif', el.dataset.ders === lesson.id);
    });

    // İlgili derse geçildiğinde 2. Adıma ("Devreyi Kur") geç
    this.switchStep('kur');
  }

  renderTasks(lesson) {
    const tasksEl = document.getElementById('gorevler-listesi');
    const badgeEl = document.getElementById('gorev-sayisi');
    if (!tasksEl) return;

    const tasks = lesson.tasks || [];
    if (badgeEl) badgeEl.textContent = tasks.length ? `${tasks.length}` : '';

    tasksEl.innerHTML = tasks.map((task, i) => {
      const isDone = ProgressManager.isTaskCompleted(task.id);
      return `
        <li class="gorev-karti ${isDone ? 'tamamlandi' : ''}" id="task-card-${task.id}">
          <div class="gk-header">
            <span class="gk-no">${i + 1}</span>
            <div class="gk-title-wrap">
              <strong>${task.title}</strong>
              <p>${task.desc}</p>
            </div>
            <span class="gk-check">${isDone ? '✓' : ''}</span>
          </div>
          <div class="gk-actions">
            <button class="gk-btn-denetle" data-task-id="${task.id}">
              ${isDone ? 'Yeniden Denetle' : 'Denetle'}
            </button>
            <span class="gk-msg" id="msg-${task.id}"></span>
          </div>
        </li>
      `;
    }).join('');

    // Denetle Butonu Olayları
    tasksEl.querySelectorAll('.gk-btn-denetle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const taskId = e.target.dataset.taskId;
        this.verifyTask(taskId);
      });
    });

    // Sonraki Ders Butonu
    const nextLessonEl = document.getElementById('sonraki-ders');
    if (nextLessonEl) {
      const currentIndex = LESSONS_DATA.findIndex(l => l.id === lesson.id);
      if (currentIndex < LESSONS_DATA.length - 1) {
        const nextLesson = LESSONS_DATA[currentIndex + 1];
        nextLessonEl.innerHTML = `
          <button class="ana-dugme btn-next-lesson" id="btn-next-lesson">
            <span>Sonraki Derse Geç: <strong>${nextLesson.title}</strong></span>
            <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        `;
        nextLessonEl.hidden = false;
        document.getElementById('btn-next-lesson').addEventListener('click', () => {
          this.loadLesson(nextLesson.id, true);
          audioSynth.playSuccess();
        });
      } else {
        nextLessonEl.hidden = true;
      }
    }
  }

  verifyTask(taskId) {
    if (!this.currentLesson) return;
    const task = (this.currentLesson.tasks || []).find(t => t.id === taskId);
    if (!task) return;

    const code = this.codeEditor.getCode();
    const state = {
      ...this.circuitSimulator.state,
      serialOutput: this.serialMonitor.getAllText()
    };

    const isSuccess = task.validator ? task.validator(code, state) : true;
    const msgEl = document.getElementById(`msg-${taskId}`);
    const cardEl = document.getElementById(`task-card-${taskId}`);

    if (isSuccess) {
      ProgressManager.markTaskCompleted(taskId);
      if (cardEl) {
        cardEl.classList.add('tamamlandi');
        const check = cardEl.querySelector('.gk-check');
        if (check) check.textContent = '✓';
      }
      if (msgEl) {
        msgEl.textContent = 'Harika! Görev başarıyla tamamlandı. 🎉';
        msgEl.className = 'gk-msg success';
      }
      audioSynth.playSuccess();
      fireConfetti();
      if (this.speechGuide) {
        this.speechGuide.speak('Tebrikler! Görevi başarıyla tamamladınız.');
      }

      const allDone = (this.currentLesson.tasks || []).every(t => ProgressManager.isTaskCompleted(t.id));
      if (allDone) {
        ProgressManager.markLessonCompleted(this.currentLesson.id);
        this.updateGlobalProgress();
        this.renderLessonsList();
      }
    } else {
      if (msgEl) {
        msgEl.textContent = 'Henüz tamamlanamadı. İpuçlarını inceleyip kodu ve devreyi kontrol edin.';
        msgEl.className = 'gk-msg error';
      }
      audioSynth.playClick();
      if (this.speechGuide) {
        this.speechGuide.speak('Görevi tamamlamak için devrenizi ve kodunuzu kontrol edip tekrar deneyin.');
      }
    }
  }

  updateGlobalProgress() {
    const progressEl = document.getElementById('genel-ilerleme');
    if (!progressEl) return;

    const data = ProgressManager.load();
    const completedCount = data.completedLessons.length;
    const totalCount = LESSONS_DATA.length;
    const percent = Math.round((completedCount / totalCount) * 100);

    const txt = progressEl.querySelector('.sayi');
    const bar = progressEl.querySelector('.cubuk i');
    if (txt) txt.textContent = `${completedCount} / ${totalCount}`;
    if (bar) bar.style.width = `${percent}%`;
  }

  switchTab(tabName) {
    this.currentTab = tabName;
    document.querySelectorAll('.panel-tab').forEach(t => {
      const isSel = t.dataset.sekme === tabName;
      t.setAttribute('aria-selected', isSel);
    });

    document.querySelectorAll('.panel-sekme-icerik').forEach(content => {
      content.hidden = (content.dataset.icerik !== tabName);
    });
  }

  switchStep(step) {
    this.currentStep = step;

    // Alt buton aktifliği
    document.querySelectorAll('.adim-btn').forEach(btn => {
      btn.classList.toggle('aktif', btn.dataset.adim === step);
    });

    if (this.currentAppMode !== 'lessons') {
      this.setAppMode('lessons');
      return;
    }

    const bvContainer = document.getElementById('bv-container');
    const simContainer = document.getElementById('sim-container');

    if (step === 'tani') {
      if (bvContainer) bvContainer.hidden = false;
      if (simContainer) simContainer.hidden = true;
      this.switchTab('ders');
      if (this.speechGuide) {
        this.speechGuide.speak('1. Adım: Deneyap Kartın pinlerini ve donanım özelliklerini 360 derece inceleyin.');
      }
    } else if (step === 'kur') {
      if (bvContainer) bvContainer.hidden = true;
      if (simContainer) simContainer.hidden = false;
      this.circuitSimulator.setMode('wire');
      this.switchTab('ders');
      if (this.speechGuide) {
        this.speechGuide.speak('2. Adım: Şemaya göre breadboard üzerindeki kabloları bağlayın.');
      }
    } else if (step === 'calistir') {
      if (bvContainer) bvContainer.hidden = true;
      if (simContainer) simContainer.hidden = false;
      this.circuitSimulator.setMode('sim');
      this.switchTab('kod');
      if (this.speechGuide) {
        this.speechGuide.speak('3. Adım: C++ kodunuzu yazın ve Kodu Çalıştır ile sanal kartta koşturun.');
      }
    } else if (step === 'gorev') {
      if (bvContainer) bvContainer.hidden = true;
      if (simContainer) simContainer.hidden = false;
      this.circuitSimulator.setMode('sim');
      this.switchTab('gorev');
      if (this.speechGuide) {
        this.speechGuide.speak('4. Adım: Görevleri çözün ve Denetle butonuna tıklayın.');
      }
    }
  }
}

// Uygulamayı DOM yüklendiğinde ayağa kaldır
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    window.deneyapAtolye = new DeneyapAtolyeApp();
  });
}
