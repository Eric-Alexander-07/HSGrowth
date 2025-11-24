// Dashboard.jsx - Seitenrahmen mit Dummy-Sensoren für die Startansicht.
import SensorCard from '../components/SensorCard.jsx'

const dummySensors = [
  { id: 'sensor-1', name: 'Bodenfeuchte Nord', status: 'aktiv', reading: '42 %' },
  { id: 'sensor-2', name: 'Lichtintensität West', status: 'wartet', reading: '318 lx' },
]

const Dashboard = () => {
  return (
    <section className="page dashboard">
      <header className="page__header">
        <p className="eyebrow">Übersicht</p>
        <h1>Sensor-Dashboard</h1>
        <p className="lede">
          {/* Text wird später durch echte Projektbeschreibung ersetzt */}
          Aktueller Stand der Sensoren (Dummy-Daten, noch ohne API).
        </p>
      </header>

      <div className="sensor-grid">
        {dummySensors.map((sensor) => (
          <SensorCard
            key={sensor.id}
            name={sensor.name}
            status={sensor.status}
            reading={sensor.reading}
          />
        ))}
      </div>
    </section>
  )
}

export default Dashboard
