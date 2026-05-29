/* =====================================================================
   Pawfect Match — shared site logic
   Progressive enhancement: every feature guards for the elements it needs,
   so the same file can be loaded on every page without errors.
   ===================================================================== */

/* ===== TOAST ===== */
function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML =
      '<span class="toast-icon">🐾</span>' +
      '<span class="toast-msg"></span>' +
      '<button class="toast-close" aria-label="Dismiss">×</button>';
    document.body.appendChild(toast);
    toast.querySelector('.toast-close').addEventListener('click', () => toast.classList.remove('show'));
  }
  toast.querySelector('.toast-msg').textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 3200);
}

/* ===== HEADER SCROLL SHADOW ===== */
function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 16);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ===== MOBILE NAV (hamburger) ===== */
function initHamburger() {
  const btn = document.querySelector('.hamburger');
  const nav = document.querySelector('.mobile-nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', (e) => { e.stopPropagation(); nav.classList.toggle('open'); });
  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !nav.contains(e.target)) nav.classList.remove('open');
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
}

/* ===== SCROLL-IN ANIMATIONS ===== */
function initScrollAnimations() {
  const targets = document.querySelectorAll(
    '.feature-card, .value-card, .step-card, .pet-card, .testimonial-card, .stat'
  );
  if (!targets.length || !('IntersectionObserver' in window)) {
    targets.forEach(el => (el.style.opacity = '1'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationDelay = entry.target.dataset.delay || '0s';
        entry.target.classList.add('fade-in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  targets.forEach((el, i) => {
    el.style.opacity = '0';
    el.dataset.delay = `${(i % 3) * 0.08}s`;
    io.observe(el);
  });
}

/* ===== PET FILTERING =====
   .filter-btn[data-filter] toggles visibility of .pet-card[data-species]. */
function initPetFilter() {
  const buttons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.pet-card');
  if (!buttons.length || !cards.length) return;
  buttons.forEach(btn => {
    btn.addEventListener('click', function () {
      buttons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const filter = this.dataset.filter;
      let shown = 0;
      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.species === filter;
        card.style.display = match ? '' : 'none';
        if (match) shown++;
      });
      const empty = document.querySelector('.pets-empty');
      if (empty) empty.style.display = shown === 0 ? 'block' : 'none';
    });
  });
}

/* ===== FAVORITE (heart) TOGGLE — persisted in localStorage ===== */
function initFavorites() {
  const favs = new Set(JSON.parse(localStorage.getItem('pm_favs') || '[]'));
  document.querySelectorAll('.pet-fav').forEach(btn => {
    const card = btn.closest('.pet-card');
    const id = (card && card.dataset.id) || btn.dataset.id;
    if (id && favs.has(id)) { btn.classList.add('active'); btn.textContent = '❤️'; }
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (!id) return;
      if (favs.has(id)) { favs.delete(id); this.classList.remove('active'); this.textContent = '🤍'; }
      else { favs.add(id); this.classList.add('active'); this.textContent = '❤️'; showToast('Saved to your favorites!'); }
      localStorage.setItem('pm_favs', JSON.stringify([...favs]));
    });
  });
}

/* ===== FAQ ACCORDION ===== */
function initFaq() {
  document.querySelectorAll('.faq-item .faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const open = item.classList.contains('open');
      item.parentElement.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!open) item.classList.add('open');
    });
  });
}

/* ===== MATCH QUIZ =====
   Markup contract:
     .quiz[data-quiz] > .quiz-progress > .quiz-progress-bar
     .quiz-step (multiple) each with .quiz-options > .quiz-option[data-value]
     .quiz-nav > .quiz-prev / .quiz-next
     .quiz-result[id=quiz-result] with .result-emoji / .result-title / .result-text
   Each step's first .quiz-option[data-value] maps a species; result = mode of picks. */
function initQuiz() {
  const quiz = document.querySelector('.quiz[data-quiz]');
  if (!quiz) return;
  const steps = [...quiz.querySelectorAll('.quiz-step')];
  const bar = quiz.querySelector('.quiz-progress-bar');
  const prevBtn = quiz.querySelector('.quiz-prev');
  const nextBtn = quiz.querySelector('.quiz-next');
  const result = quiz.querySelector('.quiz-result');
  const answers = new Array(steps.length).fill(null);
  let cur = 0;

  const RESULTS = {
    dog: { emoji: '🐶', title: 'You\'re a Dog Person!', text: 'Loyal, energetic and always up for adventure — a dog will match your active, affectionate lifestyle perfectly.' },
    cat: { emoji: '🐱', title: 'You\'re a Cat Person!', text: 'Independent yet loving — a cat fits your calm, cozy home and appreciates your gentle company.' },
    rabbit: { emoji: '🐰', title: 'A Bunny Suits You!', text: 'Quiet, gentle and adorable — a rabbit is a wonderful low-noise companion for your snug space.' },
    bird: { emoji: '🐦', title: 'A Bird Is Your Match!', text: 'Cheerful and chatty — a feathered friend will bring color and song into your day.' }
  };

  function render() {
    steps.forEach((s, i) => s.classList.toggle('active', i === cur));
    if (bar) bar.style.width = `${((cur + 1) / steps.length) * 100}%`;
    if (prevBtn) prevBtn.style.visibility = cur === 0 ? 'hidden' : 'visible';
    if (nextBtn) nextBtn.textContent = cur === steps.length - 1 ? 'See my match 🎉' : 'Next →';
  }

  steps.forEach((step, i) => {
    step.querySelectorAll('.quiz-option').forEach(opt => {
      opt.addEventListener('click', () => {
        step.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        answers[i] = opt.dataset.value;
      });
    });
  });

  if (nextBtn) nextBtn.addEventListener('click', () => {
    if (answers[cur] == null) { showToast('Pick an option to continue 🐾'); return; }
    if (cur < steps.length - 1) { cur++; render(); }
    else finish();
  });
  if (prevBtn) prevBtn.addEventListener('click', () => { if (cur > 0) { cur--; render(); } });

  function finish() {
    const tally = {};
    answers.forEach(a => { if (a) tally[a] = (tally[a] || 0) + 1; });
    const winner = Object.keys(tally).sort((a, b) => tally[b] - tally[a])[0] || 'dog';
    const r = RESULTS[winner] || RESULTS.dog;
    steps.forEach(s => s.classList.remove('active'));
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
    if (bar) bar.style.width = '100%';
    if (result) {
      const set = (sel, val) => { const el = result.querySelector(sel); if (el) el.textContent = val; };
      set('.result-emoji', r.emoji);
      set('.result-title', r.title);
      set('.result-text', r.text);
      result.classList.add('show');
      result.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
  render();
}

/* ===== GENERIC FORM VALIDATION + SUCCESS =====
   Any <form data-validate> with required fields wrapped in .field.
   On valid submit: show the form's .form-success, reset, toast. No backend. */
function initForms() {
  document.querySelectorAll('form[data-validate]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true;
      form.querySelectorAll('.field').forEach(field => {
        const input = field.querySelector('.form-input, .form-select, .form-textarea');
        if (!input) return;
        const val = (input.value || '').trim();
        let valid = input.hasAttribute('required') ? val !== '' : true;
        if (valid && input.type === 'email' && val !== '') valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        field.classList.toggle('invalid', !valid);
        if (!valid) ok = false;
      });
      if (!ok) { showToast('Please check the highlighted fields.'); return; }
      const success = form.querySelector('.form-success');
      if (success) success.classList.add('show');
      else showToast('🎉 Thank you! We\'ll be in touch soon.');
      form.reset();
    });
    form.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(input => {
      input.addEventListener('input', () => input.closest('.field')?.classList.remove('invalid'));
    });
  });
}

/* ===== NEWSLETTER ===== */
function initNewsletter() {
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('.newsletter-input');
      if (input && input.value.trim()) { showToast('🎉 Welcome to the Pawfect Match family!'); input.value = ''; }
      else showToast('Enter your email to subscribe 🐾');
    });
  });
}

/* ===== FOOTER YEAR ===== */
function initYear() {
  document.querySelectorAll('[data-year]').forEach(el => (el.textContent = new Date().getFullYear()));
}

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initHamburger();
  initScrollAnimations();
  initPetFilter();
  initFavorites();
  initFaq();
  initQuiz();
  initForms();
  initNewsletter();
  initYear();
});
