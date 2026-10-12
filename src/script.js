/* Meniul pe telefon */
(function () {
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
    btn.textContent = open ? 'Închide' : 'Meniu';
  });
})();

/* Programul: evidențiază ziua de azi și arată dacă salonul e deschis acum */
(function () {
  var data = document.getElementById('program-data');
  if (!data) return;
  var program = JSON.parse(data.textContent); // luni = 0 ... duminică = 6
  function ore(t) { if (!t) return null; var p = t.split(':'); return +p[0] + (+p[1] || 0) / 60; }
  var acum = new Date();
  var idx = (acum.getDay() + 6) % 7; // transformă duminică=0 în luni=0
  var ora = acum.getHours() + acum.getMinutes() / 60;

  var rand = document.querySelector('.hours tr[data-zi="' + idx + '"]');
  if (rand) rand.classList.add('today');

  var el = document.getElementById('status');
  var txt = document.getElementById('status-text');
  if (!el || !txt) return;
  var azi = program[idx];
  var d = ore(azi.deschis), i = ore(azi.inchis);
  if (d !== null && ora >= d && ora < i) { el.classList.add('open'); txt.textContent = 'Deschis acum, până la ' + azi.inchis; return; }
  if (d !== null && ora < d) { txt.textContent = 'Deschidem azi la ' + azi.deschis; return; }
  for (var pas = 1; pas <= 7; pas++) {
    var z = program[(idx + pas) % 7];
    if (z.deschis) { txt.textContent = 'Închis acum. Deschidem ' + (pas === 1 ? 'mâine' : z.zi.toLowerCase()) + ' la ' + z.deschis; return; }
  }
})();
