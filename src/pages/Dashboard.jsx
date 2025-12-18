// Dashboard.jsx - Landing-Page mit Dummy-Sensordaten und Platzhaltern fuer Charts/Wetter.
// Gliedert Bereiche in Status, Beet-Auswahl (als Sensoren), Diagramme und Wetterkarten.
import MoistureChart from '../components/MoistureChart.jsx'
import GardenBedCard from '../components/GardenBedCard.jsx'
import useWeather from '../hooks/useWeather'
import useSensorData from '../hooks/useSensorData'
import { useEffect, useMemo, useState } from 'react'

const statusSnapshot = {
  overall: 'Stabil',
  avgMoisture: 43,
  rainChance: 32,
  temp: 18,
  wind: 9,
}

const describeMoisture = (value) => {
  if (!Number.isFinite(value)) {
    return {
      status: 'Keine Daten',
      sunlight: 'Sensor offline',
    }
  }
  if (value >= 60) {
    return {
      status: 'Optimal',
      sunlight: 'Feuchte stabil',
    }
  }
  if (value >= 40) {
    return {
      status: 'Leicht trocken',
      sunlight: 'Feuchte sinkt',
    }
  }
  return {
    status: 'Achtung: trocken',
    sunlight: 'Feuchte kritisch',
  }
}

const Dashboard = () => {
  const [selectedSensorId, setSelectedSensorId] = useState('')
  const {
    data: weather,
    isLoading: weatherLoading,
    error: weatherError,
    now,
    lastUpdatedAt,
  } = useWeather()
  const { sensors, latestBySensor } = useSensorData()
  const bedCards = useMemo(() => latestBySensor.map((sensor) => {
    const moistureValue = Number.isFinite(sensor.value) ? Math.round(sensor.value) : null
    const { status, sunlight } = describeMoisture(sensor.value)

    return {
      id: sensor.sensorId ?? sensor.location,
      name: sensor.location,
      crop: `Sensor-ID: ${sensor.sensorId}`,
      status,
      moisture: moistureValue,
      sunlight,
      timestamp: sensor.timestamp,
    }
  }), [latestBySensor])

  useEffect(() => {
    if (bedCards.length === 0) return
    const exists = bedCards.some((bed) => String(bed.id) === String(selectedSensorId))
    if (!exists) setSelectedSensorId(String(bedCards[0].id))
  }, [bedCards, selectedSensorId])
  const rainChanceValue = weather
    ? Math.round(weather.maxPrecip24h)
    : statusSnapshot.rainChance

  const minutesSinceUpdate =
    lastUpdatedAt != null ? Math.max(0, Math.round((now - lastUpdatedAt) / 60000)) : null

  const formatNumber = (value, digits = 1) =>
    Number.isFinite(value) ? value.toFixed(digits) : '\u2013'

  const formatWithUnit = (value, unit, digits = 1) =>
    Number.isFinite(value) ? `${value.toFixed(digits)} ${unit}` : '\u2013'

  const weatherCards = weather
    ? [
        {
          label: 'Regen (naechste 24h)',
          value: formatWithUnit(weather.maxPrecip24h, '%', 0),
          note: 'Max. Regenwahrscheinlichkeit 24h',
        },
        {
          label: 'Niederschlag',
          value: formatWithUnit(weather.precipitationMm, 'mm', 2),
          note: 'Letzte Stunde',
        },
        {
          label: 'Temperatur',
          value: formatWithUnit(weather.temperatureC, '\u00b0C', 1),
          note: 'Aktuell',
        },
        {
          label: 'Sonneneinstrahlung',
          value: formatWithUnit(weather.shortwaveRadiation, 'W/m\u00b2', 0),
          note: 'Zuletzt gemessen',
        },
        {
          label: 'Luftfeuchtigkeit',
          value: formatWithUnit(weather.humidityPercent, '%', 0),
          note: 'Relative Feuchte',
        },
        {
          label: 'Windgeschwindigkeit',
          value: formatWithUnit(weather.windSpeed, 'km/h', 1),
          note: '10 m Hoehe',
        },
        {
          label: 'ET0',
          value: formatWithUnit(weather.et0mm, 'mm', 2),
          note: 'Referenz-ET0',
        },
        {
          label: 'UV-Index',
          value: Number.isFinite(weather.uvIndex) ? weather.uvIndex.toFixed(1) : '\u2013',
          note: 'Stundenwert',
        },
      ]
    : []

  return (
    <section className="page dashboard">
      <header className="page__header">
        <p className="eyebrow">Uebersicht</p>
        <h1>Beet-Status</h1>
        <p className="lede">Jedes Beet enthaelt einen Sensor. Hier die aktuellen Zustands-Snapshots.</p>
      </header>

      {/* Kurzer Snapshot ueber Kennzahlen */}
      <section className="status-strip">
        <article className="status-chip">
          <p className="status-chip__label">Gesamtstatus</p>
          <p className="status-chip__value">{statusSnapshot.overall}</p>
        </article>
        <article className="status-chip">
          <p className="status-chip__label">Į~ Bodenfeuchte</p>
          <p className="status-chip__value">{statusSnapshot.avgMoisture}%</p>
        </article>
        <article className="status-chip">
          <p className="status-chip__label">Regenwahrscheinlichkeit</p>
          <p className="status-chip__value">
            {weatherLoading ? '...' : `${rainChanceValue}%`}
          </p>
        </article>
      </section>

      {/* Platz fuer spaetere Beet-/Standort-Auswahl */}
      <section className="panel selection-panel">
        <h2>Beete & Sensoren</h2>
        <p className="panel__hint">
          Aktuelle Sensorwerte werden direkt aus der JSON-Datei in die Auswahl geladen.
        </p>
        <div className="bed-grid">
          {bedCards.length === 0 ? (
            <p className="panel__hint">Keine Sensordaten verfuegbar.</p>
          ) : (
            bedCards.map((bed) => (
              <GardenBedCard
                key={bed.id}
                name={bed.name}
                crop={bed.crop}
                status={bed.status}
                moisture={bed.moisture}
                sunlight={bed.sunlight}
                timestamp={bed.timestamp}
                isActive={String(bed.id) === String(selectedSensorId)}
                onSelect={() => setSelectedSensorId(String(bed.id))}
              />
            ))
          )}
        </div>
      </section>

      {/* Diagramm-Bereich: aktuell Platzhalter + Dummy-Recharts-Chart */}
      <section className="panel">
        <header className="panel__header">
          <h2>Diagramme</h2>
          <p className="panel__hint">
            {/* Filter (Zeitraum von/bis, Aggregationen) werden hier konfiguriert. */}
            Historische Verlaeufe folgen nach Auswahl der Chart-Bibliothek.
          </p>
        </header>
        <MoistureChart
          sensors={sensors}
          selectedSensorId={selectedSensorId}
          onSensorChange={(id) => setSelectedSensorId(String(id))}
        />
      </section>

      {/* Wetter-Karten als kurzer Forecast-Block */}
      <section className="panel">
        <header className="panel__header">
          <h2>Wetter & Regen</h2>
          <p className="panel__hint">
            Detailansicht fuer Regenwahrscheinlichkeit, Temperatur, Wind und Hinweise (Open-Meteo).
          </p>
          <div className="api-indicator">
            <span className={`api-indicator__dot ${weatherError ? 'is-error' : 'is-ok'}`} />
            <span>{weatherError ? 'Open-Meteo nicht erreichbar' : 'Open-Meteo aktiv'}</span>
          </div>
        </header>
        {weatherLoading && <p className="panel__hint">Lade Wetterdaten ...</p>}
        {weatherError && !weatherLoading && (
          <p className="panel__hint">Fehler beim Laden: {weatherError}</p>
        )}
        {weather && (
          <p className="panel__hint">
            Letztes Update: {minutesSinceUpdate} min
          </p>
        )}
        <div className="weather-grid">
          {!weatherLoading &&
            !weatherError &&
            weatherCards.map((item) => (
              <article className="weather-card" key={item.label}>
                <p className="weather-card__label">{item.label}</p>
                <p className="weather-card__value">{item.value}</p>
                <p className="weather-card__note">{item.note}</p>
              </article>
            ))}
        </div>
      </section>
    </section>
  )
}

export default Dashboard
