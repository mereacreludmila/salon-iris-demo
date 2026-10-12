# Salon Iris — site demonstrativ

## Unde e fiecare lucru

- **content/** — tot conținutul site-ului (texte, prețuri, program, echipa). Aici va scrie mai târziu și panoul de editare al clientului.
  - `site.json` — numele, telefonul, adresa, programul, linkurile
  - `acasa.json` — textele de pe prima pagină
  - `servicii.json` — categoriile și prețurile (o pagină pentru fiecare categorie)
  - `ritual.json` — tratamentul semnătură
  - `despre.json` — povestea salonului și echipa
- **src/** — designul (`style.css`) și micile funcții (`script.js`). Culorile se schimbă din primele rânduri ale `style.css`.
- **build.js** — construiește paginile din conținut. Nu folosește pachete externe, deci nu are nimic de actualizat.
- **netlify.toml** — îi spune lui Netlify cum să publice site-ul.

## Cum se publică

Netlify rulează automat `node build.js` și publică folderul `dist`. Nu trebuie să faci nimic manual.
