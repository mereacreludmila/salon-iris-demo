/*
  Transformă automat orice poză în momentul încărcării în panou:
  - o convertește în .jpg (rezolvă .jfif, .png, .webp, .heic pe iPhone etc.)
  - o micșorează dacă e foarte mare (poze de telefon de câțiva MB)
  - îi dă un nume curat, fără spații și diacritice
  Dacă ceva nu merge, poza originală este încărcată neschimbată.
*/
(function () {
  var LATIME_MAXIMA = 2000;
  var CALITATE = 0.82;

  function numeCurat(nume) {
    var baza = nume.replace(/\.[^.]+$/, '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'poza';
    return baza + '-' + Date.now().toString(36) + '.jpg';
  }

  function estePoza(f) {
    return /^image\//.test(f.type) || /\.(jfif|jpe?g|png|webp|heic|heif|avif|bmp|tiff?)$/i.test(f.name);
  }

  function inJpg(fisier) {
    return new Promise(function (gata) {
      if (fisier.type === 'image/gif' || fisier.type === 'image/svg+xml') { gata(fisier); return; }
      var adresa = URL.createObjectURL(fisier);
      var img = new Image();
      img.onload = function () {
        try {
          var w = img.naturalWidth, h = img.naturalHeight;
          var s = Math.min(1, LATIME_MAXIMA / Math.max(w, h));
          var c = document.createElement('canvas');
          c.width = Math.round(w * s); c.height = Math.round(h * s);
          var ctx = c.getContext('2d');
          ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, c.width, c.height);
          ctx.drawImage(img, 0, 0, c.width, c.height);
          URL.revokeObjectURL(adresa);
          c.toBlob(function (b) {
            if (!b) { gata(fisier); return; }
            gata(new File([b], numeCurat(fisier.name), { type: 'image/jpeg', lastModified: Date.now() }));
          }, 'image/jpeg', CALITATE);
        } catch (err) { URL.revokeObjectURL(adresa); gata(fisier); }
      };
      img.onerror = function () { URL.revokeObjectURL(adresa); gata(fisier); };
      img.src = adresa;
    });
  }

  document.addEventListener('change', function (ev) {
    var input = ev.target;
    if (!input || input.tagName !== 'INPUT' || input.type !== 'file') return;
    if (input.__pozeConvertite) { input.__pozeConvertite = false; return; }
    var fisiere = Array.prototype.slice.call(input.files || []);
    if (!fisiere.length || !fisiere.some(estePoza) || typeof DataTransfer === 'undefined') return;

    ev.stopImmediatePropagation();
    ev.stopPropagation();

    Promise.all(fisiere.map(function (f) { return estePoza(f) ? inJpg(f) : Promise.resolve(f); }))
      .then(function (rezultat) {
        var dt = new DataTransfer();
        rezultat.forEach(function (f) { dt.items.add(f); });
        input.files = dt.files;
        input.__pozeConvertite = true;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
  }, true);
})();
