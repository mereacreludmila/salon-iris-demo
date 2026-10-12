/*
  build.js — construiește site-ul din fișierele de conținut.
  Nu folosește niciun pachet extern, deci nu are nimic de actualizat în viitor.
  Rulare: node build.js   →   rezultatul apare în folderul "dist".
*/
const fs = require('fs');
const path = require('path');

const citeste = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, 'content', f), 'utf8'));
const site = citeste('site.json');
const acasa = citeste('acasa.json');
const servicii = citeste('servicii.json');
const ritual = citeste('ritual.json');
const despre = citeste('despre.json');

// Protejează textul (ex. caracterele < > &) ca să nu strice pagina
const e = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Loc pentru fotografie: dacă există o imagine o afișează, altfel un fundal elegant
// Ce parte a pozei rămâne vizibilă când e decupată (se alege din panou)
const pozitii = { sus: '50% 15%', centru: '50% 50%', jos: '50% 85%', stanga: '20% 30%', dreapta: '80% 30%' };
// Pozele trec prin optimizarea automată Netlify: orice format și orice mărime
// (poze de telefon de câțiva MB, .jfif, .png, .webp) ajung pe site mici și rapide.
const optim = (img, latime) =>
  img && img.startsWith('/') ? `/.netlify/images?url=${encodeURIComponent(img)}&w=${latime}&q=78` : img;
const foto = (eticheta, varianta = '', imagine = '', pozitie = 'sus') =>
  `<figure class="photo ${varianta}${imagine ? ' are-poza' : ''}" role="img" aria-label="${e(eticheta)}">` +
  (imagine
    ? `<img src="${e(optim(imagine, 1200))}" srcset="${e(optim(imagine, 600))} 600w, ${e(optim(imagine, 1200))} 1200w, ${e(optim(imagine, 1800))} 1800w" sizes="(max-width: 820px) 100vw, 50vw" alt="${e(eticheta)}" loading="lazy" style="object-position:${pozitii[pozitie] || pozitii.sus}">`
    : `<figcaption>${e(eticheta)}</figcaption>`) +
  `</figure>`;

const meniu = [
  { url: '/coafura/', titlu: 'Coafură' },
  { url: '/unghii/', titlu: 'Unghii' },
  { url: '/sprancene-gene/', titlu: 'Sprâncene și gene' },
  { url: '/ritual/', titlu: 'Ritualul Iris' },
  { url: '/despre/', titlu: 'Despre noi' },
  { url: '/contact/', titlu: 'Contact' },
];

const linkProgramare = site.link_programare && site.link_programare !== '#' ? site.link_programare : '/contact/';

// ---------- Secțiuni refolosite ----------
const sectiuneProgramare = () => `
<section class="booking dark section">
  <div class="wrap">
    <p class="kicker">Programări</p>
    <h2>Rezervă-ți timpul la ${e(site.nume)}</h2>
    <p>Alege serviciul, specialista și ora potrivită. Confirmarea vine imediat pe telefon.</p>
    <a class="btn" href="${e(linkProgramare)}">Alege data și ora</a>
  </div>
</section>`;

const listaPreturi = (lista) => `
<div class="price-list">
  ${lista.map((s) => `<div class="item"><h3>${e(s.nume)}</h3><span class="price">${e(s.pret)}</span>${s.descriere ? `<p>${e(s.descriere)}</p>` : ''}</div>`).join('\n  ')}
</div>`;

const tabelProgram = () => `
<table class="hours">
  ${site.program.map((z, i) => `<tr data-zi="${i}"><td>${e(z.zi)}</td><td>${z.deschis ? `${e(z.deschis)}–${e(z.inchis)}` : 'Închis'}</td></tr>`).join('\n  ')}
</table>`;

const sectiuneRitual = (cuButon) => `
<section class="ritual dark">
  ${foto('Fotografie: masaj al scalpului, lumină caldă', 'alt', ritual.foto, ritual.foto_pozitie)}
  <div class="ritual-text">
    <p class="kicker">Tratamentul nostru semnătură</p>
    <h2>${e(ritual.titlu)}</h2>
    <p style="opacity:.8;max-width:44ch;margin:0">${e(ritual.descriere)}</p>
    <ol>
      ${ritual.pasi.map((p) => `<li><div>${e(p.nume)}<span>${e(p.descriere)}</span></div></li>`).join('\n      ')}
    </ol>
    <div class="meta"><strong>${e(ritual.pret)}</strong><em>${e(ritual.durata)}</em></div>
    <a class="btn" href="${cuButon ? '/ritual/' : e(linkProgramare)}">${cuButon ? 'Descoperă ritualul' : 'Rezervă ritualul'}</a>
  </div>
</section>`;

// ---------- Șablonul comun al tuturor paginilor ----------
const layout = ({ titlu, descriere, url, continut, cuProgram = false }) => `<!DOCTYPE html>
<html lang="ro">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${e(titlu)}</title>
<meta name="description" content="${e(descriere)}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E🌸%3C/text%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/style.css">
</head>
<body>
<header>
  <div class="wrap bar">
    <a class="logo" href="/">${e(site.nume)}</a>
    <div class="right">
      <ul class="nav" id="nav">
        ${meniu.map((m) => `<li><a href="${m.url}"${m.url === url ? ' aria-current="page"' : ''}>${e(m.titlu)}</a></li>`).join('\n        ')}
      </ul>
      <a class="book-link" href="${e(linkProgramare)}">Rezervă</a>
      <button class="menu-btn" aria-expanded="false" aria-controls="nav">Meniu</button>
    </div>
  </div>
</header>
<main>
${continut}
</main>
<footer class="dark">
  <div class="wrap">
    <div class="foot">
      <div>
        <a class="logo" href="/">${e(site.nume)}</a>
        <p>${e(site.descriere)}</p>
      </div>
      <div>
        <ul>${meniu.slice(0, 4).map((m) => `<li><a href="${m.url}">${e(m.titlu)}</a></li>`).join('')}</ul>
      </div>
      <div>
        <ul>
          <li><a href="tel:${e(site.telefon_link)}">${e(site.telefon)}</a></li>
          <li><a href="mailto:${e(site.email)}">${e(site.email)}</a></li>
          <li><a href="/contact/">${e(site.adresa[0])}</a></li>
        </ul>
      </div>
    </div>
    <div class="legal"><span>© ${new Date().getFullYear()} ${e(site.nume)}</span><span>Site demonstrativ, datele sunt fictive.</span></div>
  </div>
</footer>
<a class="wa" href="https://wa.me/${e(site.whatsapp)}" aria-label="Scrie-ne pe WhatsApp" target="_blank" rel="noopener">
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.4-.2z"/></svg>
</a>
${url === '/' ? `<script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
<script>
if (window.netlifyIdentity) {
  window.netlifyIdentity.on('init', function (user) {
    if (!user) window.netlifyIdentity.on('login', function () { document.location.href = '/admin/'; });
  });
}
</script>` : ''}
${cuProgram ? `<script type="application/json" id="program-data">${JSON.stringify(site.program).replace(/</g, '\\u003c')}</script>` : ''}
<script src="/assets/script.js"></script>
</body>
</html>
`;

// ---------- Paginile ----------
const pagini = [];

// Acasă
pagini.push({
  url: '/',
  titlu: `${site.nume}, salon de coafură și frumusețe`,
  descriere: site.descriere,
  cuProgram: true,
  continut: `
<section class="hero dark">
  ${foto('Fotografie: portret editorial, păr lucios', '', acasa.foto_principala, acasa.foto_principala_pozitie)}
  <div class="hero-text">
    <p class="status" id="status"><span class="dot" aria-hidden="true"></span><span id="status-text">Doar cu programare</span></p>
    <h1>${e(acasa.titlu)}</h1>
    <p>${e(acasa.subtitlu)}</p>
    <a class="btn" href="${e(linkProgramare)}">Rezervă o programare</a>
  </div>
  <div class="wordmark" aria-hidden="true">${e(site.nume)}</div>
</section>

<section class="manifest section">
  <div class="wrap">
    <p>${e(acasa.manifest)}</p>
    <span class="sign">${e(acasa.manifest_semnatura)}</span>
  </div>
</section>

<section class="section" style="padding-top:0">
  <div class="wrap">
    <h2>Servicii</h2>
    <div class="cards">
      ${servicii.categorii.map((c, i) => `<a class="card" href="/${e(c.slug)}/">
        ${foto('Fotografie: ' + c.titlu.toLowerCase(), ['', 'cool', 'alt'][i % 3], c.foto, c.foto_pozitie)}
        <h3>${e(c.titlu)}</h3>
        <p>${e(c.rezumat)}</p>
        <span class="more">Vezi serviciile și prețurile</span>
      </a>`).join('\n      ')}
    </div>
  </div>
</section>

${sectiuneRitual(true)}

<section class="review section">
  <div class="wrap">
    <div class="stars" aria-label="5 din 5 stele">★★★★★</div>
    <blockquote>${e(acasa.recenzie)}</blockquote>
    <cite>${e(acasa.recenzie_autor)}</cite>
  </div>
</section>

${sectiuneProgramare()}`,
});

// O pagină pentru fiecare categorie de servicii
servicii.categorii.forEach((c, i) => {
  pagini.push({
    url: `/${c.slug}/`,
    titlu: `${c.titlu} | ${site.nume}`,
    descriere: `${c.rezumat} ${site.nume}, programare online.`,
    continut: `
<section class="page-hero dark">
  <div class="text">
    <p class="kicker">Servicii</p>
    <h1>${e(c.titlu)}</h1>
    <p>${e(c.intro)}</p>
  </div>
  ${foto('Fotografie: ' + c.titlu.toLowerCase(), ['', 'cool', 'alt'][i % 3], c.foto, c.foto_pozitie)}
</section>

<section class="section">
  <div class="wrap">
    <h2>Prețuri</h2>
    ${listaPreturi(c.servicii)}
    <p class="note">${e(servicii.nota_preturi)}</p>
  </div>
</section>

<section class="dark gallery-section" aria-label="Galerie">
  <div class="wrap">
    <p class="kicker">Lucrări recente</p>
    <div class="gallery">
      ${(c.galerie && c.galerie.length ? c.galerie : ['', '', '']).slice(0, 3).map((img, j) => foto('Lucrare recentă', ['alt', 'cool', ''][j], img, 'centru')).join('\n      ')}
    </div>
  </div>
</section>

${sectiuneProgramare()}`,
  });
});

// Ritualul
pagini.push({
  url: '/ritual/',
  titlu: `${ritual.titlu} | ${site.nume}`,
  descriere: ritual.descriere,
  continut: `${sectiuneRitual(false)}

<section class="review section">
  <div class="wrap">
    <div class="stars" aria-label="5 din 5 stele">★★★★★</div>
    <blockquote>${e(acasa.recenzie)}</blockquote>
    <cite>${e(acasa.recenzie_autor)}</cite>
  </div>
</section>`,
});

// Despre noi
pagini.push({
  url: '/despre/',
  titlu: `${despre.titlu} | ${site.nume}`,
  descriere: despre.paragrafe[0],
  continut: `
<section class="page-hero dark">
  <div class="text">
    <p class="kicker">Povestea noastră</p>
    <h1>${e(despre.titlu)}</h1>
    <p>${e(acasa.manifest)}</p>
  </div>
  ${foto('Fotografie: interiorul salonului', 'alt', despre.foto, despre.foto_pozitie)}
</section>

<section class="section">
  <div class="wrap about-text">
    ${despre.paragrafe.map((p) => `<p>${e(p)}</p>`).join('\n    ')}
  </div>
</section>

<section class="section" style="background:var(--porcelain-2)">
  <div class="wrap">
    <h2 style="margin:0">Echipa</h2>
    <div class="team-grid">
      ${despre.echipa.map((m, i) => `<div class="member">${foto('Portret: ' + m.nume, ['cool', '', 'alt'][i % 3], m.foto, m.foto_pozitie)}<h3>${e(m.nume)}</h3><p>${e(m.rol)}</p></div>`).join('\n      ')}
    </div>
  </div>
</section>

${sectiuneProgramare()}`,
});

// Contact
pagini.push({
  url: '/contact/',
  titlu: `Contact | ${site.nume}`,
  descriere: `Adresă, telefon și program ${site.nume}.`,
  cuProgram: true,
  continut: `
<section class="section">
  <div class="wrap">
    <h1 style="font-size:clamp(3rem,6vw,5.2rem);margin:0 0 3rem">Contact</h1>
    <div class="contact">
      <div>
        <h3>Adresă</h3>
        <p>${site.adresa.map(e).join('<br>')}</p>
        <p style="margin-top:1rem"><a href="${e(site.link_harta)}" target="_blank" rel="noopener">Deschide în Google Maps</a></p>
      </div>
      <div>
        <h3>Telefon și email</h3>
        <p><a href="tel:${e(site.telefon_link)}">${e(site.telefon)}</a></p>
        <p style="margin-top:.5rem"><a href="mailto:${e(site.email)}">${e(site.email)}</a></p>
        <p class="status" id="status" style="margin-top:1.5rem!important;opacity:1"><span class="dot" aria-hidden="true"></span><span id="status-text">Doar cu programare</span></p>
      </div>
      <div>
        <h3>Program</h3>
        ${tabelProgram()}
      </div>
    </div>
    <div class="map">Aici apare harta Google cu locația salonului</div>
  </div>
</section>

${sectiuneProgramare()}`,
});

// ---------- Scrie fișierele în "dist" ----------
const dist = path.join(__dirname, 'dist');
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(path.join(dist, 'assets'), { recursive: true });
fs.copyFileSync(path.join(__dirname, 'src', 'style.css'), path.join(dist, 'assets', 'style.css'));
fs.copyFileSync(path.join(__dirname, 'src', 'script.js'), path.join(dist, 'assets', 'script.js'));
// panoul de editare
fs.cpSync(path.join(__dirname, 'admin'), path.join(dist, 'admin'), { recursive: true });
// pozele încărcate de client
if (fs.existsSync(path.join(__dirname, 'images'))) {
  fs.cpSync(path.join(__dirname, 'images'), path.join(dist, 'images'), { recursive: true });
}

pagini.forEach((p) => {
  const folder = path.join(dist, p.url);
  fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(path.join(folder, 'index.html'), layout(p));
  console.log('✓ ' + p.url);
});
console.log(`Gata: ${pagini.length} pagini în folderul dist.`);
