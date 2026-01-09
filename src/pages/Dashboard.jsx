// Dashboard.jsx - angepasst auf Threshold-Logik + Regen-Sonderfall (gelb)
import MoistureChart from '../components/MoistureChart.jsx'
import GardenBedCard from '../components/GardenBedCard.jsx'
import useWeather from '../hooks/useWeather'
import useSensorData from '../hooks/useSensorData'
import { useEffect, useMemo, useState } from 'react'

const statusSnapshot = {
  overall: 'Stabil',
  avgMoisture: 43, // <- kannst du später dynamisch berechnen
  rainChance: 32,
}

const getBedStatus = ({ value, threshold, rainChance24h }) => {
  if (!Number.isFinite(value)) {
    return { status: 'Keine Daten', note: 'Sensor offline', variant: 'off' }
  }
  if (!Number.isFinite(threshold)) {
    return { status: 'Schwelle fehlt', note: 'Threshold nicht gesetzt', variant: 'neutral' }
  }

  if (value >= threshold) {
    return { status: 'OK', note: 'Feuchte über Schwelle', variant: 'green' }
  }

  // value < threshold -> eigentlich gießen
  if (Number.isFinite(rainChance24h) && rainChance24h > 80) {
    return { status: 'Warten', note: 'Regen > 80% in 24h', variant: 'yellow' }
  }

  return { status: 'Gießen', note: 'Feuchte unter Schwelle', variant: 'red' }
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

  const { sensors, latestBySensor, loading: sensorsLoading, error: sensorsError } = useSensorData()

  const rainChance24h = weather
    ? Math.round(weather.maxPrecip24h)
    : statusSnapshot.rainChance

  const bedCards = useMemo(() => {
    return latestBySensor.map((sensor) => {
      const value = Number.isFinite(sensor.value) ? Math.round(sensor.value) : null
      const threshold = sensor.threshold != null ? Number(sensor.threshold) : null

      const info = getBedStatus({
        value: Number(value),
        threshold: Number(threshold),
        rainChance24h,
      })

      return {
        id: sensor.sensorId ?? sensor.location,
        name: sensor.location,
        crop: `Sensor-ID: ${sensor.sensorId}`,
        // Rohwert anzeigen (kein %)
        moisture: value,
        threshold,
        // neue Status-Infos
        status: info.status,
        sunlight: info.note, // reuse existing prop name (bis du es umbenennst)
        variant: info.variant, // neu (für Farben, falls du willst)
        timestamp: sensor.timestamp,
      }
    })
  }, [latestBySensor, rainChance24h])

  useEffect(() => {
    if (bedCards.length === 0) return
    const exists = bedCards.some((bed) => String(bed.id) === String(selectedSensorId))
    if (!exists) setSelectedSensorId(String(bedCards[0].id))
  }, [bedCards, selectedSensorId])

  const minutesSinceUpdate =
    lastUpdatedAt != null ? Math.max(0, Math.round((now - lastUpdatedAt) / 60000)) : null

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

      {/* Kurzer Snapshot */}
      <section className="status-strip">
        <article className="status-chip">
          <p className="status-chip__label">Gesamtstatus</p>
          <p className="status-chip__value">{statusSnapshot.overall}</p>
        </article>

        <article className="status-chip">
          <p className="status-chip__label">Bodenfeuchte</p>
          <p className="status-chip__value">
            {sensorsLoading ? '...' : `${bedCards.length} Sensoren`}
          </p>
        </article>

        <article className="status-chip">
          <p className="status-chip__label">Regenwahrscheinlichkeit</p>
          <p className="status-chip__value">
            {weatherLoading ? '...' : `${rainChance24h}%`}
          </p>
        </article>
      </section>

      {/* Sensor-/Beet-Karten */}
      <section className="panel selection-panel">
        <h2>Beete & Sensoren</h2>
        <p className="panel__hint">
          Sensorwerte kommen live aus der API (MySQL). Threshold bestimmt OK/Gießen.
        </p>

        {sensorsError && (
          <p className="panel__hint">Sensor-API Fehler: {String(sensorsError)}</p>
        )}

        <div className="bed-grid">
          {bedCards.length === 0 ? (
            <p className="panel__hint">
              {sensorsLoading ? 'Lade Sensordaten ...' : 'Keine Sensordaten verfuegbar.'}
            </p>
          ) : (
            bedCards.map((bed) => (
              <GardenBedCard
                key={bed.id}
                name={bed.name}
                crop={bed.crop}
                status={bed.status}
                moisture={bed.moisture}     // Rohwert
                threshold={bed.threshold}   // NEU
                variant={bed.variant}       // optional für Farben
                sunlight={bed.sunlight}     // note
                timestamp={bed.timestamp}
                isActive={String(bed.id) === String(selectedSensorId)}
                onSelect={() => setSelectedSensorId(String(bed.id))}
              />
            ))
          )}
        </div>
      </section>

      {/* Diagramme */}
      <section className="panel">
        <header className="panel__header">
          <h2>Diagramme</h2>
          <p className="panel__hint">Historische Verläufe für den ausgewählten Sensor.</p>
        </header>

        <MoistureChart
          sensors={sensors}
          selectedSensorId={selectedSensorId}
          onSensorChange={(id) => setSelectedSensorId(String(id))}
        />
      </section>

      {/* Wetter */}
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
          <p className="panel__hint">Letztes Update: {minutesSinceUpdate} min</p>
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
