/**
 * Yardımcı Araçlar ve Yerel Depolama Yöneticisi
 */

const STORAGE_KEY = 'deneyap_atolye_progress';

export const ProgressManager = {
  load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : { completedLessons: [], completedTasks: {}, lastLesson: 'tanisma-donanim' };
    } catch (e) {
      return { completedLessons: [], completedTasks: {}, lastLesson: 'tanisma-donanim' };
    }
  },

  save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
  },

  isLessonCompleted(lessonId) {
    const data = this.load();
    return data.completedLessons.includes(lessonId);
  },

  markLessonCompleted(lessonId) {
    const data = this.load();
    if (!data.completedLessons.includes(lessonId)) {
      data.completedLessons.push(lessonId);
      this.save(data);
    }
  },

  isTaskCompleted(taskId) {
    const data = this.load();
    return !!data.completedTasks[taskId];
  },

  markTaskCompleted(taskId) {
    const data = this.load();
    data.completedTasks[taskId] = true;
    this.save(data);
  },

  setLastLesson(lessonId) {
    const data = this.load();
    data.lastLesson = lessonId;
    this.save(data);
  },

  getLastLesson() {
    return this.load().lastLesson || 'tanisma-donanim';
  }
};

/**
 * Görev Tamamlandığında Çalışan Hafif Tuval Konfeti Efekti
 */
export function fireConfetti() {
  let canvas = document.getElementById('confetti-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '99999';
    document.body.appendChild(canvas);
  }

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const particles = [];
  const colors = ['#38bdf8', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ffffff'];

  for (let i = 0; i < 90; i++) {
    particles.push({
      x: canvas.width / 2 + (Math.random() * 200 - 100),
      y: canvas.height * 0.45,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 1.2) * 10,
      size: Math.random() * 7 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
      alpha: 1
    });
  }

  let animationId;
  const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.28; // Yerçekimi
      p.rotation += p.vRot;
      p.alpha -= 0.012;

      if (p.alpha > 0) {
        alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    });

    if (alive) {
      animationId = requestAnimationFrame(render);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(animationId);
    }
  };

  render();
}
