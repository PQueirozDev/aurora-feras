// Interações do site: menu, revelação ao rolar, frase animada, demo jogável e galeria de feras.
const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- menu mobile ----------
const toggle = document.querySelector('.menu-toggle');
const menu = document.getElementById('menu-mobile');
function setMenu(aberto) {
  toggle.setAttribute('aria-expanded', String(aberto));
  toggle.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
  if (aberto) {
    menu.hidden = false;
    const links = [...menu.querySelectorAll('a')];
    const passo = Math.min(60, 400 / links.length);
    links.forEach((a, i) => { a.style.transitionDelay = `${i * passo}ms`; });
    requestAnimationFrame(() => menu.classList.add('open'));
    document.body.style.overflow = 'hidden';
  } else {
    menu.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { if (!menu.classList.contains('open')) menu.hidden = true; }, 400);
  }
}
toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setMenu(false); });

// ---------- revelação das seções (uma vez) ----------
const io = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { e.target.classList.add('visivel'); io.unobserve(e.target); }
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// ---------- frase de destaque: cada palavra acende ao cruzar a linha ----------
const frase = document.querySelector('[data-words]');
if (frase) {
  frase.innerHTML = frase.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
  const palavras = [...frase.querySelectorAll('.w')];
  if (reduz) palavras.forEach((w) => w.classList.add('on'));
  else {
    let pendente = false;
    const atualizar = () => {
      pendente = false;
      const linha = window.innerHeight * 0.62;
      palavras.forEach((w) => w.classList.toggle('on', w.getBoundingClientRect().top < linha));
    };
    const agendar = () => { if (!pendente) { pendente = true; requestAnimationFrame(atualizar); } };
    window.addEventListener('scroll', agendar, { passive: true });
    window.addEventListener('resize', agendar);
    atualizar();
  }
}

// ---------- demo jogável (carrega só quando o visitante clica) ----------
const start = document.getElementById('demo-start');
start?.addEventListener('click', () => {
  const frame = document.createElement('iframe');
  frame.src = 'jogar/';
  frame.title = 'Aurora: Caçadores de Feras, jogo completo';
  frame.allow = 'fullscreen; gamepad';
  document.getElementById('demo').replaceChildren(frame);
  frame.addEventListener('load', () => frame.focus());
});

// ---------- galeria de feras ----------
const CORES = {
  Normal: '#8a8a5c', Fogo: '#d0601c', 'Água': '#4a72d8', Planta: '#4e9a30', 'Elétrico': '#b89400', Pedra: '#8e7a28',
  Inseto: '#7e8c16', Voador: '#7a62d8', Terra: '#a8843a', Lutador: '#a8281e', Fantasma: '#5a4680', 'Psíquico': '#d83a70', Venenoso: '#8a3088',
};
const tipoHTML = (t) => `<span class="tipo" style="background:${CORES[t] ?? '#555'}">${t}</span>`;
const lista = document.getElementById('lista-feras');
const modal = document.getElementById('fera-modal');

fetch('feras.json')
  .then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
  .then((feras) => {
    lista.innerHTML = feras.map((f) => `
      <button class="fera${f.lendario ? ' lendaria' : ''}" data-k="${f.k}" aria-label="Ver ${f.nome}">
        <img src="img/feras/${f.k}.png" alt="" width="96" height="96" loading="lazy" />
        <span class="num">Nº ${String(f.id).padStart(3, '0')}</span>
        <span class="nome">${f.nome}</span>
        <span class="tipos">${f.tipos.map(tipoHTML).join('')}</span>
      </button>`).join('');
    lista.addEventListener('click', (e) => {
      const b = e.target.closest('.fera');
      if (!b) return;
      const f = feras.find((x) => x.k === b.dataset.k);
      document.getElementById('fm-img').src = `img/feras/${f.k}.png`;
      document.getElementById('fm-img').alt = f.nome;
      document.getElementById('fm-id').textContent = `Nº ${String(f.id).padStart(3, '0')}${f.lendario ? ' · Lendária' : ''}`;
      document.getElementById('fm-nome').textContent = f.nome;
      document.getElementById('fm-cat').textContent = f.cat;
      document.getElementById('fm-tipos').innerHTML = f.tipos.map(tipoHTML).join('');
      modal.showModal();
    });
  })
  .catch(() => {
    lista.innerHTML = '<p>Não foi possível carregar a lista de feras. Recarregue a página para tentar de novo.</p>';
  });
modal.querySelector('.fm-close').addEventListener('click', () => modal.close());
modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });
