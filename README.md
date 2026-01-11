# HSGrowth Frontend (React + Vite)
Schlankes, erweiterbares Frontend-Grundgeruest für ein Sensor-Dashboard.

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

## Start und Entwicklung
- Dev: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`
