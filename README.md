# SGU-Game Mobile Wrapper

Tento projekt slúži ako mobilný "thin-client" pre browser hru SGU-Game (sgu-game.cz).
Skladá sa z dvoch častí: **Proxy server** (Node.js) a **Mobilný frontend** (Vue 3 PWA).

## 1. Ako spustiť projekt

Projekt vyžaduje bežiace oba servery súčasne.

### Spustenie Proxy Servera
Proxy server drží tvoje session (prihlásenie) a prekladá HTML stránky z hry do JSON formátu pre mobilnú appku.
```bash
cd C:\Moje\sgu-mobile\proxy
npm install
node server.js
```
*Beží na: http://localhost:3000*

### Spustenie Mobilného Frontendu
Frontend je Vue 3 aplikácia prispôsobená pre mobilné obrazovky.
```bash
cd C:\Moje\sgu-mobile\frontend
npm install
npm run dev -- --host 0.0.0.0
```
*Beží na: http://localhost:5173 (alebo na tvojej lokálnej IP, napr. http://192.168.x.x:5173, ktorú si otvoríš v mobile).*

## 2. Dôležité technické poznatky

* **Prihlasovanie:** Hra vyžaduje odoslať POST parameter `action-login=login` (názov a hodnota tlačidla vo formulári), inak ťa neprihlási. Proxy si najprv musí stiahnuť initial cookie z homepage a až potom odoslať formulár. (Rieši to `proxy/auth.js`).
* **Session Persistence:** Vue frontend používa `localStorage` (`sgu_logged_in` a `sgu_username`) na to, aby si pamätal prihlásenie po refreshi. Ak proxy server stratí session (napr. reštartom), vráti chybu `401 Unauthorized` a frontend ťa automaticky odhlási.
* **Architektúra Parsingu:** Pre každú novú sekciu (Dashboard, Výskum, atď.) sa vytvorí parser v `proxy/parsers/` s využitím knižnice `cheerio` (serverový jQuery), ktorý z HTML vytiahne dáta. V `proxy/routes/` sa pre to vytvorí endpoint.

## 3. Adresárová štruktúra

```
C:\Moje\sgu-mobile
├── proxy/                  # Node.js backend
│   ├── server.js           # Hlavný Express server
│   ├── auth.js             # Prihlasovacia logika
│   ├── parsers/            # HTML -> JSON parsery (napr. dashboard.js)
│   └── routes/             # API endpointy (napr. /api/dashboard)
└── frontend/               # Vue 3 PWA
    ├── src/
    │   ├── views/          # Jednotlivé obrazovky (DashboardView, LoginView)
    │   ├── components/     # UI komponenty (BottomNav)
    │   └── stores/         # Pinia state (auth.js)
    └── vite.config.js      # Nastavenie Vite + PWA + proxy na port 3000
```
