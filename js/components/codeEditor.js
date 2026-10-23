/**
 * Kod Düzenleyici, İnteraktif Bloklar ve Akıllı Hata Denetleyicisi (Linter)
 */
import { audioSynth } from './audioSynth.js';
import { BlocklyEditor } from './blocklyEditor.js';

export class CodeEditor {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = options;
    this.currentCode = '';
    this.currentLesson = null;
    this.mode = 'code'; // 'code' veya 'blocks'

    this.onRun = options.onRun || (() => {});
    this.onStop = options.onStop || (() => {});
    this.onChange = options.onChange || (() => {});

    this.blocklyInstance = null;
    this.initDOM();
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="code-editor-wrap">
        <!-- Editör Üst Araç Çubuğu -->
        <header class="ce-header">
          <div class="ce-primary-actions">
            <button class="ce-btn-run" id="ce-btn-run" title="Kodu Sanal Karta Yükle ve Çalıştır">
              <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              <span id="ce-run-text">Çalıştır</span>
            </button>
            <div class="ce-mode-group" role="group" aria-label="Kodlama Biçimi">
              <button class="ce-mode-btn ${this.mode === 'code' ? 'active' : ''}" id="ce-mode-code">C++ Kod</button>
              <button class="ce-mode-btn ${this.mode === 'blocks' ? 'active' : ''}" id="ce-mode-blocks">🧩 Sürükle-Bırak Bloklar</button>
            </div>
          </div>

          <div class="ce-tools">
            <button class="ce-tool-icon" id="ce-btn-reset" title="Örnek Koda Dön" aria-label="Sıfırla">
              <svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" /></svg>
            </button>
            <button class="ce-tool-icon" id="ce-btn-copy" title="Kodu Kopyala" aria-label="Kopyala">
              <svg viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 1 1 1h3" /></svg>
            </button>
            <button class="ce-tool-icon" id="ce-btn-download" title="Deneyap .ino Dosyası Olarak İndir" aria-label="İndir">
              <svg viewBox="0 0 24 24"><path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14" /></svg>
            </button>
          </div>
        </header>

        <!-- Kod Editörü Alanı -->
        <div class="ce-code-area" id="ce-code-area">
          <div class="ce-line-numbers" id="ce-line-numbers"></div>
          <textarea class="ce-textarea" id="ce-textarea" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off"></textarea>
        </div>

        <!-- Akıllı Hata Denetleyicisi (Linter Uyarı Kutusu) -->
        <div class="ce-linter-box" id="ce-linter-box" hidden>
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <span id="ce-linter-msg">İpucu: Kodunuz kontrol ediliyor...</span>
        </div>

        <!-- Gerçek Sürükle-Bırak Bloklar Alanı -->
        <div class="ce-blocks-area" id="ce-blocks-area" hidden>
          <div id="interactive-blockly-container" style="height:100%;"></div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.initBlockly();
  }

  initBlockly() {
    this.blocklyInstance = new BlocklyEditor('interactive-blockly-container', {
      onChange: (generatedCpp) => {
        if (this.mode === 'blocks') {
          this.setCode(generatedCpp, false);
        }
      }
    });
  }

  bindEvents() {
    const textarea = this.container.querySelector('#ce-textarea');

    textarea.addEventListener('input', () => {
      this.currentCode = textarea.value;
      this.updateLineNumbers();
      this.lintCode(this.currentCode);
      this.onChange(this.currentCode);
    });

    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + 2;
        this.currentCode = textarea.value;
        this.updateLineNumbers();
      }
    });

    textarea.addEventListener('scroll', () => {
      const lineNumbers = this.container.querySelector('#ce-line-numbers');
      if (lineNumbers) lineNumbers.scrollTop = textarea.scrollTop;
    });

    const runBtn = this.container.querySelector('#ce-btn-run');
    runBtn.addEventListener('click', () => {
      if (runBtn.classList.contains('running')) {
        this.onStop();
      } else {
        this.onRun(this.getCode());
      }
      audioSynth.playClick();
    });

    this.container.querySelector('#ce-mode-code').addEventListener('click', () => {
      this.setMode('code');
      audioSynth.playClick();
    });
    this.container.querySelector('#ce-mode-blocks').addEventListener('click', () => {
      this.setMode('blocks');
      audioSynth.playClick();
    });

    this.container.querySelector('#ce-btn-reset').addEventListener('click', () => {
      if (this.currentLesson && this.currentLesson.defaultCode) {
        this.setCode(this.currentLesson.defaultCode);
        audioSynth.playSnap();
      }
    });

    this.container.querySelector('#ce-btn-copy').addEventListener('click', () => {
      navigator.clipboard?.writeText(this.getCode());
      const btn = this.container.querySelector('#ce-btn-copy');
      btn.innerHTML = '✓';
      setTimeout(() => {
        btn.innerHTML = `<svg viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 1 1 1h3" /></svg>`;
      }, 1500);
      audioSynth.playSuccess();
    });

    this.container.querySelector('#ce-btn-download').addEventListener('click', () => {
      this.downloadIno();
      audioSynth.playSuccess();
    });
  }

  setMode(mode) {
    this.mode = mode;
    this.container.querySelector('#ce-mode-code').classList.toggle('active', mode === 'code');
    this.container.querySelector('#ce-mode-blocks').classList.toggle('active', mode === 'blocks');
    const codeArea = this.container.querySelector('#ce-code-area');
    const blocksArea = this.container.querySelector('#ce-blocks-area');

    if (mode === 'code') {
      codeArea.hidden = false;
      blocksArea.hidden = true;
    } else {
      codeArea.hidden = true;
      blocksArea.hidden = false;
    }
  }

  loadLesson(lesson) {
    this.currentLesson = lesson;
    this.setCode(lesson.defaultCode || '');
  }

  setCode(code, updateBlockly = true) {
    this.currentCode = code;
    const textarea = this.container.querySelector('#ce-textarea');
    if (textarea) {
      textarea.value = code;
      this.updateLineNumbers();
      this.lintCode(code);
    }
  }

  getCode() {
    const textarea = this.container.querySelector('#ce-textarea');
    return textarea ? textarea.value : this.currentCode;
  }

  setRunningState(isRunning) {
    const btn = this.container.querySelector('#ce-btn-run');
    if (!btn) return;
    if (isRunning) {
      btn.classList.add('running');
      btn.innerHTML = `<svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="1.5" /></svg><span>Durdur</span>`;
    } else {
      btn.classList.remove('running');
      btn.innerHTML = `<svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" /></svg><span>Çalıştır</span>`;
    }
  }

  updateLineNumbers() {
    const lineNumbers = this.container.querySelector('#ce-line-numbers');
    if (!lineNumbers) return;
    const lines = (this.currentCode || '').split('\n');
    lineNumbers.innerHTML = lines.map((_, i) => `<div>${i + 1}</div>`).join('');
  }

  /**
   * Dostane Sözdizimi Denetleyicisi (Linter)
   */
  lintCode(code) {
    const linterBox = this.container.querySelector('#ce-linter-box');
    const linterMsg = this.container.querySelector('#ce-linter-msg');
    if (!linterBox || !linterMsg) return;

    if (!code || !code.trim()) {
      linterBox.hidden = true;
      return;
    }

    // 1. Süslü Parantez Kontrolü
    const openBraces = (code.match(/\{/g) || []).length;
    const closeBraces = (code.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      linterBox.hidden = false;
      linterMsg.textContent = `Süslü parantez hatası: ${openBraces} açılan '{' ile ${closeBraces} kapanan '}' eşleşmiyor.`;
      return;
    }

    // 2. setup / loop Eksikliği Kontrolü
    if (!code.includes('setup') || !code.includes('loop')) {
      linterBox.hidden = false;
      linterMsg.textContent = 'Arduino programında "void setup()" ve "void loop()" fonksiyonları bulunmalıdır.';
      return;
    }

    // 3. Satır Sonu Noktalı Virgül Kontrolü
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('//') || line.startsWith('/*') || line.startsWith('#') || line.endsWith('{') || line.endsWith('}') || line.startsWith('if') || line.startsWith('for') || line.startsWith('while')) {
        continue;
      }
      if (line.match(/(digitalWrite|analogWrite|delay|Serial\.print|tone|pinMode|analogRead)\(.*\)$/)) {
        linterBox.hidden = false;
        linterMsg.textContent = `Satır ${i + 1}: Komutun sonuna noktalı virgül (;) koymayı unuttunuz.`;
        return;
      }
    }

    // Hata yoksa gizle
    linterBox.hidden = true;
  }

  downloadIno() {
    const filename = `${(this.currentLesson?.id || 'deneyap-proje')}.ino`;
    const blob = new Blob([this.getCode()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
