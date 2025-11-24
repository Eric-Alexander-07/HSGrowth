// Dashboard.jsx - Seite mit strukturierten Bereichen und Dummy-Sensordaten.
// Hier werden spaeter Echtzeitdaten, Filter (Standort/Zeitraum) und Live-Updates eingebunden.
import ChartPlaceholder from '../components/ChartPlaceholder.jsx'
import SensorCard from '../components/SensorCard.jsx'
import MoistureChart from '../components/MoistureChart.jsx'

const dummySensors = [
  {
    id: 'sensor-1',
    name: 'Bodenfeuchte Nord',
    moisturePercent: 56,
    timestamp: '2025-11-24T09:15:00Z',
  },
  {
    id: 'sensor-2',
    name: 'Bodenfeuchte Sued',
    moisturePercent: 28,
    timestamp: '2025-11-24T09:15:00Z',
  },
  {
    id: 'sensor-3',
    name: 'Bodenfeuchte West',
    moisturePercent: 44,
    timestamp: '2025-11-24T09:15:00Z',
  },
]

const statusSnapshot = {
  overall: 'Stabil',
  avgMoisture: 43,
  rainChance: 32,
  temp: 18,
  wind: 9,
}

const Dashboard = () => {
  return (
    <section className="page dashboard">
      <header className="page__header">
        <p className="eyebrow">Uebersicht</p>
        <h1>Sensor-Dashboard</h1>
        <p className="lede">
          Aktueller Stand der Bodenfeuchte (Dummy-Daten). API-/Live-Integration folgt.
        </p>
      </header>

      <section className="status-strip">
        <article className="status-chip">
          <p className="status-chip__label">Gesamtstatus</p>
          <p className="status-chip__value">{statusSnapshot.overall}</p>
        </article>
        <article className="status-chip">
          <p className="status-chip__label">Ø Bodenfeuchte</p>
          <p className="status-chip__value">{statusSnapshot.avgMoisture}%</p>
        </article>
        <article className="status-chip">
          <p className="status-chip__label">Regenwahrscheinlichkeit</p>
          <p className="status-chip__value">{statusSnapshot.rainChance}%</p>
        </article>
      </section>

      <section className="panel selection-panel">
        <h2>Beet-Auswahl</h2>
        <p className="panel__hint">
          {/* Hier kommen spaeter Standort-/Beet-Filter, Dropdowns und Suchfelder hin. */}
          Waehle ein Beet oder Standort (noch ohne Logik).
        </p>
      </section>

      <section className="panel">
        <header className="panel__header">
          <h2>Sensor Overview</h2>
          <p className="panel__hint">
            {/* Realtime-Updates und Filter (z.B. nur kritische Sensoren) werden hier ergaenzt. */}
            Ampel-Farben zeigen die aktuelle Bodenfeuchte-Kategorie.
          </p>
        </header>

        <div className="dashboard-grid">
          {dummySensors.map((sensor) => (
            <SensorCard
              key={sensor.id}
              name={sensor.name}
              moisturePercent={sensor.moisturePercent}
              timestamp={sensor.timestamp}
            />
          ))}
        </div>
      </section>

      <section className="panel">
        <header className="panel__header">
          <h2>Diagramme</h2>
          <p className="panel__hint">
            {/* Filter (Zeitraum von/bis, Aggregationen) werden hier konfiguriert. */}
            Historische Verlaeufe folgen nach Auswahl der Chart-Bibliothek.
          </p>
        </header>
        <ChartPlaceholder />
        <MoistureChart />
      </section>

      <section className="panel">
        <header className="panel__header">
          <h2>Wetter & Regen</h2>
          <p className="panel__hint">
            Detailansicht fuer Regenwahrscheinlichkeit, Temperatur, Wind und Hinweise (Dummy).
          </p>
        </header>
        <div className="weather-grid">
          <article className="weather-card">
            <p className="weather-card__label">Regenwahrscheinlichkeit</p>
            <p className="weather-card__value">{statusSnapshot.rainChance}%</p>
            <p className="weather-card__note">Niederschlag in den naechsten 6h gering.</p>
          </article>
          <article className="weather-card">
            <p className="weather-card__label">Temperatur</p>
            <p className="weather-card__value">{statusSnapshot.temp}&deg;C</p>
            <p className="weather-card__note">Leicht bewölkt, gute Bedingungen fuer Bewässerung.</p>
          </article>
          <article className="weather-card">
            <p className="weather-card__label">Wind</p>
            <p className="weather-card__value">{statusSnapshot.wind} km/h</p>
            <p className="weather-card__note">Windstill genug fuer genaue Sensorwerte.</p>
          </article>
        </div>
      </section>
    </section>
  )
}

export default Dashboard
