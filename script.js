/**
 * PRESENTASI: SEJARAH & PERKEMBANGAN HUKUM PERDATA INTERNASIONAL
 * Interaktivitas, Kontrol Navigasi, Animasi, dan Sistem Download Slide Lengkap
 * Disusun oleh Moh. Raihan & Sufyan Tsaury - UIN Siber Syekh Nurjati Cirebon
 */

document.addEventListener('DOMContentLoaded', () => {
  // State Management
  let currentSlide = 1;
  const slides = document.querySelectorAll('.slide');
  const totalSlides = slides.length;
  let isAutoplay = false;
  let autoplayInterval = null;
  let soundEnabled = true;

  // DOM Elements
  const currentSlideNumEl = document.getElementById('current-slide-num');
  const totalSlidesNumEl = document.getElementById('total-slides-num');
  const currentSlideTitleEl = document.getElementById('current-slide-title');
  const progressFillEl = document.getElementById('progress-fill');
  const slideDotsContainer = document.getElementById('slide-dots-container');

  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const btnFullscreen = document.getElementById('btn-fullscreen');
  const btnAutoplay = document.getElementById('btn-autoplay');
  const btnSound = document.getElementById('btn-sound');
  const btnGrid = document.getElementById('btn-grid');
  const btnDownloadModal = document.getElementById('btn-download-modal');
  const btnHelp = document.getElementById('btn-help');
  const btnCelebrate = document.getElementById('btn-qa-celebrate');

  // Modals
  const downloadModal = document.getElementById('download-modal');
  const overviewModal = document.getElementById('overview-modal');
  const helpModal = document.getElementById('help-modal');
  const overviewGridContent = document.getElementById('overview-thumbnails-grid');

  // Download Action Buttons
  const btnRunPptx = document.getElementById('btn-run-pptx-dl');
  const btnRunPdf = document.getElementById('btn-run-pdf-dl');
  const btnRunPng = document.getElementById('btn-run-png-dl');
  const btnRunHtml = document.getElementById('btn-run-html-dl');

  // Audio Context (Web Audio API Synthesizer - Zero External Audio Files)
  let audioCtx = null;
  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
  }

  function playSlideSound(type = 'transition') {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;
      if (type === 'transition') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.08);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'action') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(580, now);
        osc.frequency.exponentialRampToValueAtTime(820, now + 0.1);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc.start(now);
        osc.stop(now + 0.14);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch (e) {
      console.warn('Audio synthesis failed:', e);
    }
  }

  // Toast Notification System
  function showToast(message, icon = 'fa-circle-info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid ${icon} gold-text"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // Generate Navigation Dots
  function buildDots() {
    slideDotsContainer.innerHTML = '';
    slides.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.className = `slide-dot ${idx === 0 ? 'active' : ''}`;
      dot.title = `Lompat ke Slide ${idx + 1}`;
      dot.addEventListener('click', () => goToSlide(idx + 1));
      slideDotsContainer.appendChild(dot);
    });
  }

  // Update UI Presentation State
  function updateUI() {
    slides.forEach((slide, idx) => {
      const slideIndex = idx + 1;
      if (slideIndex === currentSlide) {
        slide.classList.add('active-slide');
      } else {
        slide.classList.remove('active-slide');
      }
    });

    // Update Header Indicator
    const formattedNum = currentSlide < 10 ? `0${currentSlide}` : `${currentSlide}`;
    currentSlideNumEl.textContent = formattedNum;
    const activeSlideEl = document.querySelector(`.slide[data-slide="${currentSlide}"]`);
    if (activeSlideEl) {
      currentSlideTitleEl.textContent = activeSlideEl.getAttribute('data-title') || 'Presentasi';
      const inner = activeSlideEl.querySelector('.slide-inner');
      if (inner) inner.scrollTop = 0;
    }

    // Update Dots
    const dots = document.querySelectorAll('.slide-dot');
    dots.forEach((dot, idx) => {
      if (idx + 1 === currentSlide) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    // Update Progress Bar
    const progressPercent = (currentSlide / totalSlides) * 100;
    progressFillEl.style.width = `${progressPercent}%`;

    // Update Prev / Next Buttons State
    btnPrev.disabled = currentSlide === 1;
    btnNext.disabled = currentSlide === totalSlides;

    // Trigger celebration confetti on last slide
    if (currentSlide === totalSlides) {
      triggerConfetti();
    }
  }

  function goToSlide(n) {
    if (n < 1 || n > totalSlides || n === currentSlide) return;
    currentSlide = n;
    playSlideSound('transition');
    updateUI();
  }

  function nextSlide() {
    if (currentSlide < totalSlides) {
      goToSlide(currentSlide + 1);
    }
  }

  function prevSlide() {
    if (currentSlide > 1) {
      goToSlide(currentSlide - 1);
    }
  }

  // Autoplay Logic
  function toggleAutoplay() {
    isAutoplay = !isAutoplay;
    if (isAutoplay) {
      btnAutoplay.classList.add('btn-download-accent');
      btnAutoplay.querySelector('.btn-text').textContent = 'Pause';
      showToast('Autoplay diaktifkan (7 detik per slide)', 'fa-play');
      playSlideSound('action');

      autoplayInterval = setInterval(() => {
        if (currentSlide < totalSlides) {
          nextSlide();
        } else {
          goToSlide(1);
        }
      }, 7000);
    } else {
      btnAutoplay.classList.remove('btn-download-accent');
      btnAutoplay.querySelector('.btn-text').textContent = 'Autoplay';
      clearInterval(autoplayInterval);
      showToast('Autoplay dinonaktifkan', 'fa-pause');
      playSlideSound('action');
    }
  }

  // Sound Toggle
  function toggleSound() {
    soundEnabled = !soundEnabled;
    const icon = btnSound.querySelector('i');
    if (soundEnabled) {
      icon.className = 'fa-solid fa-volume-high';
      showToast('Efek suara diaktifkan', 'fa-volume-high');
      playSlideSound('action');
    } else {
      icon.className = 'fa-solid fa-volume-xmark';
      showToast('Efek suara dibisukan', 'fa-volume-xmark');
    }
  }

  // Fullscreen Toggle
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        showToast('Gagal masuk mode layar penuh', 'fa-triangle-exclamation');
      });
      btnFullscreen.querySelector('i').className = 'fa-solid fa-compress';
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        btnFullscreen.querySelector('i').className = 'fa-solid fa-expand';
      }
    }
  }

  // Modal Controllers
  function openModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.add('active');
    playSlideSound('action');
  }

  function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove('active');
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  }

  // Overview Grid Generator
  function buildOverviewGrid() {
    overviewGridContent.innerHTML = '';
    slides.forEach((slide, idx) => {
      const slideNum = idx + 1;
      const title = slide.getAttribute('data-title') || `Slide ${slideNum}`;
      const thumb = document.createElement('div');
      thumb.className = `overview-thumb-item ${slideNum === currentSlide ? 'active' : ''}`;
      thumb.innerHTML = `
        <span class="thumb-num">${slideNum < 10 ? '0' + slideNum : slideNum}</span>
        <span class="thumb-title">${title}</span>
      `;
      thumb.addEventListener('click', () => {
        goToSlide(slideNum);
        closeModal(overviewModal);
      });
      overviewGridContent.appendChild(thumb);
    });
  }

  // Confetti Animation Effect
  function triggerConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#e5c158', '#2563eb', '#ffffff', '#38bdf8']
      });
    }
  }

  // ==========================================
  // EXPORT / DOWNLOAD IMPLEMENTATIONS
  // ==========================================

  // 1. PowerPoint Export via PptxGenJS
  function downloadPowerPoint() {
    showToast('Membuat presentasi PowerPoint (.pptx)...', 'fa-spinner');
    playSlideSound('action');

    try {
      if (typeof PptxGenJS === 'undefined') {
        throw new Error('Library PptxGenJS belum terpasang.');
      }

      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_16x9';

      // Global Colors
      const C_NAVY = '041228';
      const C_CARD = '081E3E';
      const C_GOLD = 'E5C158';
      const C_WHITE = 'FFFFFF';
      const C_MUTED = '94A3B8';
      const C_LIGHT = 'CBD5E1';

      // Slide 1: Cover
      const s1 = pptx.addSlide();
      s1.background = { color: C_NAVY };
      s1.addText('TUGAS MATA KULIAH HUKUM PERDATA INTERNASIONAL • 2026', {
        x: 0.8, y: 0.8, w: 11.7, h: 0.4, fontFace: 'Arial', fontSize: 11, color: C_GOLD, bold: true
      });
      s1.addText('SEJARAH & PERKEMBANGAN\nHUKUM PERDATA INTERNASIONAL', {
        x: 0.8, y: 1.6, w: 11.7, h: 1.8, fontFace: 'Georgia', fontSize: 32, color: C_WHITE, bold: true, lineSpacing: 38
      });
      s1.addText('Evolusi Pemikiran dari Teori Statuta Italia & Prancis, Mazhab Belanda & Anglo-Amerika, hingga Transformasi Regulasi Mandiri di Indonesia', {
        x: 0.8, y: 3.5, w: 11.7, h: 0.8, fontFace: 'Arial', fontSize: 13, color: C_LIGHT
      });
      s1.addShape(pptx.ShapeType.rect, { x: 0.8, y: 4.8, w: 5.5, h: 1.6, fill: { color: C_CARD }, line: { color: C_GOLD, width: 1 } });
      s1.addText('DOSEN PENGAMPU:\nMoch Fahmi Firmasyah, S.Sy. M.A.', {
        x: 1.1, y: 5.0, w: 5.0, h: 1.2, fontFace: 'Arial', fontSize: 12, color: C_WHITE, bold: true
      });
      s1.addShape(pptx.ShapeType.rect, { x: 6.8, y: 4.8, w: 5.7, h: 1.6, fill: { color: C_CARD }, line: { color: C_GOLD, width: 1 } });
      s1.addText('DISUSUN OLEH:\nMoh. Raihan [2530311065] & Sufyan Tsaury [2530311086]\nProdi Hukum Keluarga - UIN Siber Syekh Nurjati Cirebon', {
        x: 7.1, y: 5.0, w: 5.2, h: 1.2, fontFace: 'Arial', fontSize: 11, color: C_WHITE
      });

      // Slide 2: Latar Belakang
      const s2 = pptx.addSlide();
      s2.background = { color: C_NAVY };
      s2.addText('BAB I PENDAHULUAN • LATAR BELAKANG & URGENSI GLOBALISASI', { x: 0.8, y: 0.6, w: 11.7, fontSize: 11, color: C_GOLD, bold: true });
      s2.addText('Mengapa HPI Menjadi Sangat Krusial?', { x: 0.8, y: 1.0, w: 11.7, fontSize: 24, fontFace: 'Georgia', color: C_WHITE, bold: true });
      const points2 = [
        '1. Perpindahan Penduduk: Migrasi global, mobilitas kerja, dan studi lintas yurisdiksi.',
        '2. Perkawinan Campuran: WNI menikah dengan WNA menimbulkan isu syarat sah nikah, harta bersama, dan hak anak.',
        '3. Bisnis Transnasional: Transaksi dagang e-commerce dan ekspor-impor antarentitas berbadan hukum beda negara.',
        '4. Kepemilikan Aset di Luar Negeri: Sengketa aset properti atau saham yang berada di yurisdiksi negara lain.',
        '5. Hubungan Berunsur Asing (Foreign Element): Kebutuhan mendasar menentukan hakim berwenang dan hukum yang berlaku.'
      ];
      points2.forEach((pt, i) => {
        s2.addShape(pptx.ShapeType.rect, { x: 0.8, y: 1.8 + (i * 0.95), w: 11.7, h: 0.8, fill: { color: C_CARD }, line: { color: C_GOLD, width: 1 } });
        s2.addText(pt, { x: 1.1, y: 1.8 + (i * 0.95), w: 11.2, h: 0.8, fontSize: 11, color: C_WHITE, bold: false, valign: 'middle' });
      });

      // Slide 3: Pengertian Singkat HPI
      const s3 = pptx.addSlide();
      s3.background = { color: C_NAVY };
      s3.addText('BAB II PEMBAHASAN • PENGERTIAN SINGKAT HPI', { x: 0.8, y: 0.6, w: 11.7, fontSize: 11, color: C_GOLD, bold: true });
      s3.addText('Hakikat Hukum Perdata Internasional & Unsur Asing', { x: 0.8, y: 1.0, w: 11.7, fontSize: 24, fontFace: 'Georgia', color: C_WHITE, bold: true });
      s3.addShape(pptx.ShapeType.rect, { x: 0.8, y: 1.8, w: 6.8, h: 4.8, fill: { color: C_CARD }, line: { color: C_GOLD, width: 1 } });
      s3.addText('HPI bukan aturan perdata dunia yang seragam, melainkan cabang hukum nasional yang memuat aturan penunjuk (referral rules) layaknya "rambu lalu lintas hukum" untuk menemukan lex causae.\n\n5 Titik Taut / Faktor Pengait:\n• Perbedaan Kewarganegaraan (lex patriae)\n• Perbedaan Domisili (lex domicilii)\n• Tempat Peristiwa Hukum (locus delicti / actus)\n• Kedudukan Badan Hukum (corporate domicile)\n• Letak Objek Benda (lex rei sitae)', {
        x: 1.1, y: 2.0, w: 6.2, h: 4.4, fontSize: 11, color: C_LIGHT, lineSpacing: 18
      });
      s3.addShape(pptx.ShapeType.rect, { x: 8.0, y: 1.8, w: 4.5, h: 4.8, fill: { color: C_CARD }, line: { color: C_GOLD, width: 1 } });
      s3.addText('3 Contoh Kasus Nyata:\n\n1. Perkawinan Campuran di Australia:\nWNI menikah dengan WNA Inggris di Australia.\n\n2. Kontrak Mesin Impor Jerman:\nMesin pabrik tiba dalam keadaan rusak di pelabuhan.\n\n3. Pewarisan Properti Lintas Batas:\nPewaris wafat meninggalkan aset di berbagai negara.', {
        x: 8.3, y: 2.0, w: 4.0, h: 4.4, fontSize: 11, color: C_WHITE, lineSpacing: 18
      });

      // Slide 4: Awal Perkembangan HPI
      const s4 = pptx.addSlide();
      s4.background = { color: C_NAVY };
      s4.addText('BAB II PEMBAHASAN • SEJARAH AWAL', { x: 0.8, y: 0.6, w: 11.7, fontSize: 11, color: C_GOLD, bold: true });
      s4.addText('Awal Perkembangan HPI: Rantai Kausalitas Logis', { x: 0.8, y: 1.0, w: 11.7, fontSize: 24, fontFace: 'Georgia', color: C_WHITE, bold: true });
      const steps = [
        { t: 'Tahap 1: Perbedaan Hukum', d: 'Komunitas kuno terisolasi dengan tradisi hukum masing-masing tanpa ada benturan.' },
        { t: 'Tahap 2: Mobilitas & Dagang', d: 'Jalur perdagangan maritim Eropa terbuka menghubungkan pedagang antarkota.' },
        { t: 'Tahap 3: Hubungan Berunsur Asing', d: 'Pedagang lintas kota melakukan transaksi, kontrak, dan pernikahan antardaerah.' },
        { t: 'Tahap 4: Benturan Antar-Sistem', d: 'Dilema hukum: tunduk pada hukum kota asalnya atau hukum tempat transaksi?' },
        { t: 'Tahap 5: Lahirnya Teori HPI', d: 'Mendorong lahirnya Teori Statuta hingga mazhab modern untuk keadilan hukum.' }
      ];
      steps.forEach((st, i) => {
        const xPos = 0.8 + (i * 2.4);
        s4.addShape(pptx.ShapeType.rect, { x: xPos, y: 2.0, w: 2.2, h: 4.5, fill: { color: C_CARD }, line: { color: C_GOLD, width: 1 } });
        s4.addText(`TAHAP 0${i + 1}`, { x: xPos + 0.1, y: 2.2, w: 2.0, fontSize: 10, color: C_GOLD, bold: true, align: 'center' });
        s4.addText(st.t, { x: xPos + 0.1, y: 2.6, w: 2.0, fontSize: 11, color: C_WHITE, bold: true, align: 'center' });
        s4.addText(st.d, { x: xPos + 0.1, y: 3.5, w: 2.0, fontSize: 10, color: C_LIGHT, align: 'center' });
      });

      // Slide 5: Statuta Italia
      const s5 = pptx.addSlide();
      s5.background = { color: C_NAVY };
      s5.addText('BAB II PEMBAHASAN • MASA STATUTA ITALIA', { x: 0.8, y: 0.6, w: 11.7, fontSize: 11, color: C_GOLD, bold: true });
      s5.addText('Trikotomi Statuta Bartolus de Saxoferrato (Abad 13-15)', { x: 0.8, y: 1.0, w: 11.7, fontSize: 24, fontFace: 'Georgia', color: C_WHITE, bold: true });
      const statutas = [
        { t: 'Statuta Personalia', s: 'Ekstrateritorial', d: 'Mengatur status personal, kapasitas hukum, kedewasaan, dan keluarga. Melekat pada pribadi ke mana pun ia pergi (Lex Personalia).' },
        { t: 'Statuta Realia', s: 'Teritorial Murni', d: 'Mengatur status kebendaan (tanah & properti tak bergerak). Berlaku mutlak hukum tempat benda berada (Lex Rei Sitae).' },
        { t: 'Statuta Mixta', s: 'Teritorial Terbatas', d: 'Mengatur bentuk formalitas perbuatan hukum & akta perjanjian. Mengacu pada tempat perbuatan dilakukan (Locus Regit Actum).' }
      ];
      statutas.forEach((st, i) => {
        const xPos = 0.8 + (i * 4.0);
        s5.addShape(pptx.ShapeType.rect, { x: xPos, y: 2.0, w: 3.7, h: 4.5, fill: { color: C_CARD }, line: { color: C_GOLD, width: 1 } });
        s5.addText(st.t, { x: xPos + 0.2, y: 2.3, w: 3.3, fontSize: 15, fontFace: 'Georgia', color: C_WHITE, bold: true });
        s5.addText(`Sifat: ${st.s}`, { x: xPos + 0.2, y: 2.8, w: 3.3, fontSize: 11, color: C_GOLD, bold: true });
        s5.addText(st.d, { x: xPos + 0.2, y: 3.3, w: 3.3, fontSize: 11, color: C_LIGHT, lineSpacing: 18 });
      });

      // Slide 6: Statuta Prancis
      const s6 = pptx.addSlide();
      s6.background = { color: C_NAVY };
      s6.addText('BAB II PEMBAHASAN • STATUTA PRANCIS (ABAD 16)', { x: 0.8, y: 0.6, w: 11.7, fontSize: 11, color: C_GOLD, bold: true });
      s6.addText('Otonomi Kehendak vs Kedaulatan Teritorial Feodal', { x: 0.8, y: 1.0, w: 11.7, fontSize: 24, fontFace: 'Georgia', color: C_WHITE, bold: true });
      s6.addShape(pptx.ShapeType.rect, { x: 0.8, y: 2.0, w: 5.6, h: 4.5, fill: { color: C_CARD }, line: { color: C_GOLD, width: 1 } });
      s6.addText('Charles Dumoulin (1500–1566)\nPendukung Otonomi Para Pihak', { x: 1.1, y: 2.3, w: 5.0, fontSize: 14, fontFace: 'Georgia', color: C_WHITE, bold: true });
      s6.addText('• Menolak pembagian kaku Bartolus yang membatasi bisnis perdagangan antarprovinsi.\n• Mencetuskan asas Kebebasan Memilih Hukum (Party Autonomy).\n• Para pihak dalam kontrak bebas menyepakati sistem hukum yang mengatur perjanjian mereka.\n• Kontribusi: Meletakkan fondasi hukum kontrak komersial internasional.', {
        x: 1.1, y: 3.2, w: 5.0, h: 3.0, fontSize: 11, color: C_LIGHT, lineSpacing: 16
      });

      s6.addShape(pptx.ShapeType.rect, { x: 6.9, y: 2.0, w: 5.6, h: 4.5, fill: { color: C_CARD }, line: { color: C_GOLD, width: 1 } });
      s6.addText('Bertrand d\'Argentré (1519–1590)\nPenjaga Otonomi Teritorial Feodal', { x: 7.2, y: 2.3, w: 5.0, fontSize: 14, fontFace: 'Georgia', color: C_WHITE, bold: true });
      s6.addText('• Menolak doktrin Dumoulin demi mempertahankan otonomi tanah bangsawan di Brittany.\n• Memprioritaskan kedaulatan wilayah: pada prinsipnya semua statuta adalah realia (teritorial).\n• Pengecualian hanya diberikan secara sangat sempit bagi status pribadi seseorang.\n• Kontribusi: Menegaskan batas kedaulatan wilayah teritorial atas properti.', {
        x: 7.2, y: 3.2, w: 5.0, h: 3.0, fontSize: 11, color: C_LIGHT, lineSpacing: 16
      });

      // Slide 7: Belanda & Anglo-Amerika
      const s7 = pptx.addSlide();
      s7.background = { color: C_NAVY };
      s7.addText('BAB II PEMBAHASAN • MAZHAB BELANDA & COMMON LAW', { x: 0.8, y: 0.6, w: 11.7, fontSize: 11, color: C_GOLD, bold: true });
      s7.addText('Doktrin Comitas Gentium & Tradisi Common Law', { x: 0.8, y: 1.0, w: 11.7, fontSize: 24, fontFace: 'Georgia', color: C_WHITE, bold: true });
      s7.addShape(pptx.ShapeType.rect, { x: 0.8, y: 2.0, w: 5.6, h: 4.5, fill: { color: C_CARD }, line: { color: C_GOLD, width: 1 } });
      s7.addText('Aliran Belanda (Abad ke-17)\nUlrik Huber, Johannes & Paulus Voet', { x: 1.1, y: 2.3, w: 5.0, fontSize: 14, fontFace: 'Georgia', color: C_WHITE, bold: true });
      s7.addText('• Prinsip Teritorialitas Mutlak: Hukum negara hanya berdaulat di dalam batas wilayahnya sendiri.\n• Doktrin Comitas Gentium (Comity): Pengadilan sukarela mengakui hukum asing atau hak yang diperoleh di luar negeri (vested rights) atas dasar kesopanan antarbangsa dan demi kepentingan bersama.', {
        x: 1.1, y: 3.3, w: 5.0, h: 3.0, fontSize: 11, color: C_LIGHT, lineSpacing: 18
      });

      s7.addShape(pptx.ShapeType.rect, { x: 6.9, y: 2.0, w: 5.6, h: 4.5, fill: { color: C_CARD }, line: { color: C_GOLD, width: 1 } });
      s7.addText('Aliran Anglo-Amerika (Abad ke-19)\nJoseph Story (1834), A.V. Dicey, Joseph Beale', { x: 7.2, y: 2.3, w: 5.0, fontSize: 14, fontFace: 'Georgia', color: C_WHITE, bold: true });
      s7.addText('• Pendekatan Praktis Berbasis Peradilan (Case Law) dalam sistem negara bagian federal.\n• Dua Pilar Utama Pengujian Perkara HPI:\n  1. Choice of Jurisdiction: Menguji wewenang forum pengadilan mengadili perkara.\n  2. Choice of Law: Mencari hukum materiil dengan keterikatan terdekat (most significant relationship).', {
        x: 7.2, y: 3.3, w: 5.0, h: 3.0, fontSize: 11, color: C_LIGHT, lineSpacing: 18
      });

      // Slide 8: Matriks Komparasi
      const s8 = pptx.addSlide();
      s8.background = { color: C_NAVY };
      s8.addText('BAB II PEMBAHASAN • ANALISIS KOMPARATIF', { x: 0.8, y: 0.6, w: 11.7, fontSize: 11, color: C_GOLD, bold: true });
      s8.addText('Matriks Komparasi 4 Mazhab Besar Sejarah HPI', { x: 0.8, y: 1.0, w: 11.7, fontSize: 24, fontFace: 'Georgia', color: C_WHITE, bold: true });
      const tableData = [
        [
          { text: 'Mazhab / Aliran', options: { bold: true, color: C_GOLD, fill: '0E2A55' } },
          { text: 'Tokoh Utama', options: { bold: true, color: C_GOLD, fill: '0E2A55' } },
          { text: 'Pokok Pemikiran Khas', options: { bold: true, color: C_GOLD, fill: '0E2A55' } },
          { text: 'Kontribusi bagi HPI Modern', options: { bold: true, color: C_GOLD, fill: '0E2A55' } }
        ],
        [
          { text: 'Statuta Italia (Abad 13-15)', options: { bold: true, color: C_WHITE } },
          { text: 'Accursius, Bartolus, Baldus', options: { color: C_LIGHT } },
          { text: 'Trikotomi statuta: personalia, realia, mixta. Perlindungan hak individu.', options: { color: C_LIGHT } },
          { text: 'Peletak dasar lex personalia & lex rei sitae.', options: { color: C_GOLD } }
        ],
        [
          { text: 'Statuta Prancis (Abad 16)', options: { bold: true, color: C_WHITE } },
          { text: 'Dumoulin, d\'Argentré', options: { color: C_LIGHT } },
          { text: 'Otonomi kehendak para pihak vs dominasi kedaulatan tanah feodal.', options: { color: C_LIGHT } },
          { text: 'Melahirkan asas Party Autonomy dalam kontrak.', options: { color: C_GOLD } }
        ],
        [
          { text: 'Aliran Belanda (Abad 17)', options: { bold: true, color: C_WHITE } },
          { text: 'Ulrik Huber, Johannes Voet', options: { color: C_LIGHT } },
          { text: 'Kedaulatan mutlak & asas kesopanan antarbangsa (Comitas Gentium).', options: { color: C_LIGHT } },
          { text: 'Rasio logis penerapan sukarela hukum asing.', options: { color: C_GOLD } }
        ],
        [
          { text: 'Anglo-Amerika (Abad 19)', options: { bold: true, color: C_WHITE } },
          { text: 'Joseph Story, A.V. Dicey', options: { color: C_LIGHT } },
          { text: 'Pendekatan praktis putusan hakim (case law). Pemisahan yurisdiksi & hukum.', options: { color: C_LIGHT } },
          { text: 'Metode arbitrase & sengketa dagang modern.', options: { color: C_GOLD } }
        ]
      ];
      s8.addTable(tableData, { x: 0.8, y: 1.8, w: 11.7, colW: [2.5, 2.5, 3.7, 3.0], border: { color: C_GOLD, width: 1 }, fontSize: 10 });

      // Slide 9: HPI di Indonesia
      const s9 = pptx.addSlide();
      s9.background = { color: C_NAVY };
      s9.addText('BAB II PEMBAHASAN • KONTEKS INDONESIA', { x: 0.8, y: 0.6, w: 11.7, fontSize: 11, color: C_GOLD, bold: true });
      s9.addText('Perkembangan HPI di Indonesia: Kolonial ke Kodifikasi', { x: 0.8, y: 1.0, w: 11.7, fontSize: 24, fontFace: 'Georgia', color: C_WHITE, bold: true });
      const indoCards = [
        { t: 'Warisan Kolonial AB 1847', d: 'Berasal dari Hukum Antargolongan (Pasal 163 & 131 IS):\n• Pasal 16 AB: Asas personalitas (lex patriae) bagi WNI di mana pun berada.\n• Pasal 17 AB: Asas letak benda (lex rei sitae).\n• Pasal 18 AB: Formalitas tindakan (locus regit actum).' },
        { t: 'Aturan Tercecer Sektoral', d: 'Belum memiliki UU kodifikasi mandiri, tercecer dalam:\n• UU Perkawinan (No. 1/1974 jo UU 16/2019) tentang Perkawinan Campuran.\n• UU Adminduk (No. 24/2013) peristiwa sipil di LN.\n• UU Arbitrase (No. 30/1999) pelaksanaan putusan arbitrase internasional.' },
        { t: 'Urgensi RUU HPI Nasional', d: 'Inisiatif BPHN 2023 untuk merespons ekonomi digital:\n• Perlindungan hukum bagi WNI & bisnis nasional.\n• Kejelasan klausul pilihan hukum & pilihan forum.\n• Pedoman hakim dalam uji ketertiban umum (public policy) tanpa merusak investasi.' }
      ];
      indoCards.forEach((c, i) => {
        const xPos = 0.8 + (i * 4.0);
        s9.addShape(pptx.ShapeType.rect, { x: xPos, y: 2.0, w: 3.7, h: 4.5, fill: { color: C_CARD }, line: { color: C_GOLD, width: 1 } });
        s9.addText(c.t, { x: xPos + 0.2, y: 2.3, w: 3.3, fontSize: 13, fontFace: 'Georgia', color: C_WHITE, bold: true });
        s9.addText(c.d, { x: xPos + 0.2, y: 3.0, w: 3.3, fontSize: 10, color: C_LIGHT, lineSpacing: 16 });
      });

      // Slide 10: Kesimpulan
      const s10 = pptx.addSlide();
      s10.background = { color: C_NAVY };
      s10.addText('BAB III PENUTUP • KESIMPULAN & PENUTUP', { x: 0.8, y: 0.6, w: 11.7, fontSize: 11, color: C_GOLD, bold: true });
      s10.addText('Menatap Masa Depan Hukum Perdata Internasional', { x: 0.8, y: 1.0, w: 11.7, fontSize: 24, fontFace: 'Georgia', color: C_WHITE, bold: true });
      s10.addText('"HPI berevolusi dari kebutuhan praktis pedagang Italia abad pertengahan menjadi instrumen hukum strategis perlindungan kedaulatan dan kepastian bisnis global."', {
        x: 1.2, y: 1.8, w: 10.9, h: 1.2, fontFace: 'Georgia', fontSize: 16, color: C_GOLD, italic: true, align: 'center'
      });
      s10.addShape(pptx.ShapeType.rect, { x: 1.2, y: 3.3, w: 5.2, h: 3.2, fill: { color: C_CARD }, line: { color: C_GOLD, width: 1 } });
      s10.addText('Evolusi Doktrin Universal:\nSetiap mazhab sejarah telah meletakkan pilar berharga: perlindungan status orang, kepastian letak tanah, kebebasan berkontrak, dan penghormatan kedaulatan antarbangsa.', {
        x: 1.5, y: 3.6, w: 4.6, h: 2.6, fontSize: 11, color: C_LIGHT, lineSpacing: 18
      });
      s10.addShape(pptx.ShapeType.rect, { x: 6.9, y: 3.3, w: 5.2, h: 3.2, fill: { color: C_CARD }, line: { color: C_GOLD, width: 1 } });
      s10.addText('Urgensi Regulasi Indonesia:\nMeninggalkan aturan kolonial AB 1847 menuju pengesahan RUU HPI Nasional adalah langkah krusial untuk menjawab era transaksi digital dan melindungi warga negara di panggung dunia.', {
        x: 7.2, y: 3.6, w: 4.6, h: 2.6, fontSize: 11, color: C_LIGHT, lineSpacing: 18
      });

      // Save Presentation
      pptx.writeFile({ fileName: 'Hukum_Perdata_Internasional_Kelompok.pptx' })
        .then(() => {
          showToast('Presentasi PowerPoint berhasil diunduh!', 'fa-circle-check');
          playSlideSound('success');
        })
        .catch(err => {
          console.error(err);
          showToast('Gagal membuat berkas PowerPoint', 'fa-triangle-exclamation');
        });

    } catch (err) {
      console.error(err);
      showToast('Terjadi kesalahan saat mengekspor PPTX', 'fa-triangle-exclamation');
    }
  }

  // 2. Print / PDF Export
  function downloadPdf() {
    showToast('Membuka jendela cetak / PDF...', 'fa-print');
    playSlideSound('action');
    closeAllModals();
    setTimeout(() => {
      window.print();
    }, 400);
  }

  // 3. PNG Screenshot Capture via html2canvas
  function downloadPng() {
    showToast('Mengambil gambar tangkapan layar slide...', 'fa-camera');
    playSlideSound('action');

    const activeSlide = document.querySelector(`.slide[data-slide="${currentSlide}"]`);
    if (!activeSlide || typeof html2canvas === 'undefined') {
      showToast('Gagal memproses gambar slide', 'fa-triangle-exclamation');
      return;
    }

    html2canvas(activeSlide, {
      scale: 2,
      backgroundColor: '#041228',
      logging: false,
      useCORS: true
    }).then(canvas => {
      const link = document.createElement('a');
      link.download = `Slide_${currentSlide < 10 ? '0' + currentSlide : currentSlide}_HPI.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('Gambar slide berhasil diunduh!', 'fa-circle-check');
      playSlideSound('success');
    }).catch(err => {
      console.error(err);
      showToast('Gagal mengekspor gambar slide', 'fa-triangle-exclamation');
    });
  }

  // 4. Standalone HTML Export
  function downloadHtml() {
    showToast('Menyiapkan berkas web offline...', 'fa-code');
    playSlideSound('action');

    const blob = new Blob([document.documentElement.outerHTML], { type: 'text/html' });
    const link = document.createElement('a');
    link.download = 'Presentasi_Hukum_Perdata_Internasional.html';
    link.href = URL.createObjectURL(blob);
    link.click();
    showToast('Berkas HTML offline berhasil disimpan!', 'fa-circle-check');
    playSlideSound('success');
  }

  // Event Listeners for UI Controls
  btnPrev.addEventListener('click', prevSlide);
  btnNext.addEventListener('click', nextSlide);
  btnAutoplay.addEventListener('click', toggleAutoplay);
  btnSound.addEventListener('click', toggleSound);
  btnFullscreen.addEventListener('click', toggleFullscreen);

  btnGrid.addEventListener('click', () => {
    buildOverviewGrid();
    openModal(overviewModal);
  });

  btnDownloadModal.addEventListener('click', () => {
    openModal(downloadModal);
  });

  btnHelp.addEventListener('click', () => {
    openModal(helpModal);
  });

  if (btnCelebrate) {
    btnCelebrate.addEventListener('click', () => {
      triggerConfetti();
      playSlideSound('success');
      showToast('Sesi Diskusi & Tanya Jawab Dibuka!', 'fa-comments');
    });
  }

  // Modal Close Buttons
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close-modal');
      closeModal(document.getElementById(modalId));
    });
  });

  // Modal Backdrop Click to Close
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay);
    });
  });

  // Download Trigger Buttons
  btnRunPptx.addEventListener('click', () => {
    closeModal(downloadModal);
    downloadPowerPoint();
  });

  btnRunPdf.addEventListener('click', () => {
    closeModal(downloadModal);
    downloadPdf();
  });

  btnRunPng.addEventListener('click', () => {
    closeModal(downloadModal);
    downloadPng();
  });

  btnRunHtml.addEventListener('click', () => {
    closeModal(downloadModal);
    downloadHtml();
  });

  // Keyboard Navigation & Shortcuts
  document.addEventListener('keydown', (e) => {
    // If modal is open, Escape closes it
    const activeModal = document.querySelector('.modal-overlay.active');
    if (activeModal && e.key === 'Escape') {
      closeModal(activeModal);
      return;
    }

    if (activeModal) return; // Do not navigate slides when modal is open

    switch (e.key) {
      case 'ArrowRight':
      case ' ':
        e.preventDefault();
        nextSlide();
        break;
      case 'ArrowLeft':
      case 'Backspace':
        e.preventDefault();
        prevSlide();
        break;
      case 'f':
      case 'F':
        toggleFullscreen();
        break;
      case 'o':
      case 'O':
      case 'g':
      case 'G':
        buildOverviewGrid();
        openModal(overviewModal);
        break;
      case 'd':
      case 'D':
        openModal(downloadModal);
        break;
      case 'p':
      case 'P':
        toggleAutoplay();
        break;
      case 's':
      case 'S':
        toggleSound();
        break;
      case '?':
        openModal(helpModal);
        break;
      default:
        break;
    }
  });

  // Mobile Touch Swipe Gesture Support
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleTouchSwipe();
  }, { passive: true });

  function handleTouchSwipe() {
    // If modal is active, do not navigate slides
    if (document.querySelector('.modal-overlay.active')) return;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    // Check if horizontal swipe is intentional and distinct from vertical scrolling
    if (Math.abs(diffX) > 48 && Math.abs(diffX) > Math.abs(diffY) * 1.4) {
      if (diffX < 0) {
        nextSlide(); // Swipe left -> Next slide
      } else {
        prevSlide(); // Swipe right -> Previous slide
      }
    }
  }

  // Initialize
  totalSlidesNumEl.textContent = `${totalSlides < 10 ? '0' + totalSlides : totalSlides}`;
  buildDots();
  updateUI();
  console.log('Presentasi HPI berhasil dimuat dengan 10 slide interaktif.');
});
