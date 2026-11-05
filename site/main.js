// Site do Aurora: revelação ao rolar, navegação ativa, demo jogável e Feradex.

// ---------- revelação das seções (uma vez) ----------
document.querySelectorAll('.section .sec-head, .cell, .shot, .stats, .demo, .dl-btns').forEach((el) => el.classList.add('reveal'));
const io = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { e.target.classList.add('visivel'); io.unobserve(e.target); }
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// ---------- link da seção atual no topo ----------
const links = [...document.querySelectorAll('.nav a')];
const secoes = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
const navIO = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    links.forEach((a) => {
      const ativo = a.getAttribute('href') === '#' + e.target.id;
      a.classList.toggle('on', ativo);
      if (ativo) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }
}, { rootMargin: '-45% 0px -50% 0px' });
secoes.forEach((s) => navIO.observe(s));

// ---------- demo jogável (carrega só quando o visitante clica) ----------
document.getElementById('demo-start')?.addEventListener('click', () => {
  const frame = document.createElement('iframe');
  frame.src = 'jogar/';
  frame.title = 'Aurora: Caçadores de Feras, jogo completo';
  frame.allow = 'fullscreen; gamepad';
  document.getElementById('demo').replaceChildren(frame);
  frame.addEventListener('load', () => frame.focus());
});

// ---------- Feradex ----------
const CORES = {
  Normal: '#8a8a5c', Fogo: '#d0601c', 'Água': '#4a72d8', Planta: '#4e9a30', 'Elétrico': '#b89400', Pedra: '#8e7a28',
  Inseto: '#7e8c16', Voador: '#7a62d8', Terra: '#a8843a', Lutador: '#a8281e', Fantasma: '#5a4680', 'Psíquico': '#d83a70', Venenoso: '#8a3088',
};
const tipoEl = (t) => {
  const s = document.createElement('span');
  s.className = 'tipo';
  s.style.background = CORES[t] ?? '#555';
  s.textContent = t;
  return s;
};
const num = (id) => 'Nº ' + String(id).padStart(3, '0');
const lista = document.getElementById('lista-feras');
const modal = document.getElementById('fera-modal');

fetch('feras.json')
  .then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
  .then((feras) => {
    const frag = document.createDocumentFragment();
    for (const f of feras) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'fera' + (f.lendario ? ' lendaria' : '');
      b.setAttribute('aria-label', 'Ver ' + f.nome);
      const img = document.createElement('img');
      img.src = `img/feras/${f.k}.png`; img.alt = ''; img.width = 88; img.height = 88; img.loading = 'lazy';
      const n = document.createElement('span'); n.className = 'num'; n.textContent = num(f.id);
      const nome = document.createElement('span'); nome.className = 'nome'; nome.textContent = f.nome;
      const tipos = document.createElement('span'); tipos.className = 'tipos'; f.tipos.forEach((t) => tipos.append(tipoEl(t)));
      b.append(img, n, nome, tipos);
      b.addEventListener('click', () => {
        const fm = document.getElementById('fm-img');
        fm.src = `img/feras/${f.k}.png`; fm.alt = f.nome;
        document.getElementById('fm-id').textContent = num(f.id) + (f.lendario ? ' · lendária' : '');
        document.getElementById('fm-nome').textContent = f.nome;
        document.getElementById('fm-cat').textContent = f.cat;
        document.getElementById('fm-tipos').replaceChildren(...f.tipos.map(tipoEl));
        modal.showModal();
      });
      frag.append(b);
    }
    lista.replaceChildren(frag);
  })
  .catch(() => { lista.textContent = 'Não foi possível carregar a Feradex. Recarregue a página para tentar de novo.'; });

modal.querySelector('.fm-close').addEventListener('click', () => modal.close());
modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });
