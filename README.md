# Plant Project Frontend (React + Vite)

Schlankes Grundgerüst für ein schulisches Sensor-Dashboard.

## Installation
- `npm install`

## Entwicklung starten
- `npm run dev` und im Browser den ausgegebenen Localhost-Link öffnen.

## Projektstruktur
- `src/App.jsx` – Routing-Einstieg mit Layout-Wrap und Dashboard-Route.
- `src/main.jsx` – React-Bootstrapper inkl. globalem CSS-Import.
- `src/components/` – wiederverwendbare Bausteine (`Layout`, `SensorCard`).
- `src/pages/` – Seitenansichten (`Dashboard` mit Dummy-Daten).
- `src/hooks/` – eigene Hooks (`useFetch` als Skelett).
- `src/utils/` – Hilfen und Konfiguration (`api.js` als Platzhalter für Basis-URL und Header).
- `src/styles/` – globale Styles (`base.css` mit Grundlayout).

## Erweiterung
- Neue Seiten: unter `src/pages/` anlegen und im Router (`App.jsx`) registrieren.
- Weitere Komponenten: nach Bedarf in `src/components/` hinzufügen.
- Styling: `src/styles/base.css` erweitern oder modulare CSS-Dateien pro Komponente ergänzen.
- Datenquellen: `useFetch` mit echter Fetch-/Axios-Logik befüllen und Fehler/Loading-State ergänzen.

## API-Anbindung (später)
- `src/utils/api.js`: `API_BASE_URL` setzen und Standard-Header definieren.
- `useFetch`: Requests gegen `API_BASE_URL` absetzen, Auth-Header einbinden, Caching/Retry planen.
- Fehler- und Ladezustände im UI anzeigen (Skeletons oder Status-Badges in `SensorCard`).

## Team-Struktur (Platzhalter)
- Product/Didaktik: TODO
- Frontend: TODO
- Backend/IoT: TODO
