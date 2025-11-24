# Plant Project Frontend (React + Vite)
Schlankes, erweiterbares Frontend-Grundgeruest fuer ein Sensor-Dashboard. Keine Business-Logik, nur Struktur, Dummy-Daten und dokumentierte Platzhalter.

## Schnellstart
- `npm install`
- `.env` Werte anpassen.
- `npm run dev` (Vite startet den Dev-Server; URL aus dem Terminal oeffnen).

## Environment (.env)
- Datei: `.env` (Basis in `.env.example`)
- Variablen:
  - `VITE_API_BASE_URL` - Backend-URL (z.B. http://localhost:4000/api)
  - `VITE_DEFAULT_LOCATION_NAME` - Standard-Standortname
  - `VITE_DEFAULT_LAT` / `VITE_DEFAULT_LON` - Geo-Koordinaten des Standard-Standorts
- Nutzung im Code: `import.meta.env.VITE_*` (siehe `src/utils/api.js`).

## Ordnerstruktur
- `src/App.jsx` - Router-Einstieg, Layout-Wrap, Dashboard-Route.
- `src/main.jsx` - React-Bootstrapper, bindet globale Styles.
- `src/components/` - Bausteine (`Layout`, `SensorCard`, `ChartPlaceholder`).
- `src/pages/` - Seiten (`Dashboard` mit Dummy-Sensoren).
- `src/hooks/` - Hook-Skelette (`useFetch` ohne Logik).
- `src/utils/` - Konfiguration (`api.js` liest .env-Werte).
- `src/styles/` - Grundstyles (`base.css` mit Layout-, Grid- und Ampel-Klassen).

## Erweiterungsoptionen (Ideen)
- Charts: `ChartPlaceholder` durch ChartJS/Recharts/ECharts ersetzen; Zeitfilter ergaenzen.
- API: In `api.js` Basis-URL/Headers pflegen, `useFetch` mit echter Fetch-/Axios-Logik ausbauen.
- Sensorlogik: Live-Daten, WebSockets/Polling, Fehler- und Ladezustaende in `SensorCard`.
- Zusatzdaten: Wetter-API, Historie/Trends, Export-Funktionen.

## Start und Entwicklung
- Dev: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`

## Team / Aufgabenverteilung (Platzhalter)
- Product/Didaktik: TODO
- Frontend: TODO
- Backend/IoT: TODO
