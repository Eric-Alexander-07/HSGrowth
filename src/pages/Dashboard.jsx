import MoistureChart from '../components/MoistureChart.jsx'
import GardenBedCard from '../components/GardenBedCard.jsx'
import useWeather from '../hooks/useWeather'
import useSensorData from '../hooks/useSensorData'
import { useEffect, useMemo, useState } from 'react'

const Dashboard = () => {
  const [selectedSensorId, setSelectedSensorId] = useState('')

  const {
    data: weather,
    isLoading: weatherLoading,
    error: weatherError,
    now,
    lastUpdatedAt,
  } = useWeather()

  const { sensors, latestBySensor, refetch } = useSensorData({ pollMs: 3000 })

  const rainChanceValue = weather ? Math.round(weather.maxPrecip24h) : 0

  const getVariant = (value, threshold) => {
    const v = Number(value)
    const t = Number(threshold)
    if (!Number.isFinite(v) || !Number.isFinite(t)) return 'off'
    if (v >= t) return 'green'
    return rainChanceValue > 80 ? 'yellow' : 'red'
  }

  const bedCards = useMemo(() => {
    return latestBySensor.map((sensor) => {
      const value = Number.isFinite(sensor.value) ? sensor.value : NaN
      const threshold = sensor.threshold

      const variant = getVariant(value, threshold)

      const status =
        variant === 'green'
          ? 'OK'
          : variant === 'yellow'
          ? 'Gießen? (Regen kommt)'
          : variant === 'red'
          ? 'Gießen'
          : 'Keine Daten'

      const sunlight =
        variant === 'green'
          ? 'Feuchte über Schwelle'
          : variant === 'yellow'
          ? 'Unter Schwelle, aber Regenwahrscheinlichkeit > 80%'
          : variant === 'red'
          ? 'Unter Schwelle – gießen'
          : 'Sensor offline'

      return {
        id: sensor.sensorId,
        name: sensor.location,
        crop: `Sensor-ID: ${sensor.sensorId}`,
        moisture: Number.isFinite(value) ? Math.round(value) : null,
        threshold,
        status,
        sunlight,
        timestamp: sensor.timestamp,
        variant,
      }
    })
  }, [latestBySensor, rainChanceValue])

  useEffect(() => {
    if (bedCards.length === 0) return
    const exists = bedCards.some((b) => String(b.id) === String(selectedSensorId))
    if (!exists) setSelectedSensorId(String(bedCards[0].id))
  }, [bedCards, selectedSensorId])

  const minutesSinceUpdate =
    lastUpdatedAt != null ? Math.max(0, Math.round((now - lastUpdatedAt) / 60000)) : null

  const formatWithUnit = (value, unit, digits = 1) =>
    Number.isFinite(value) ? `${value.toFixed(digits)} ${unit}` : '–'

  const weatherCards = weather
    ? [
        {
          label: 'Regen (nächste 24h)',
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
          value: formatWithUnit(weather.temperatureC, '°C', 1),
          note: 'Aktuell',
        },
      ]
    : []

  return (
    <section className="page dashboard">
      <header className="page__header">
        <p className="eyebrow">Übersicht</p>
        <h1>Beet-Status</h1>
        <p className="lede">Sensorwerte kommen live aus der API (MySQL). Threshold bestimmt OK/Gießen.</p>
      </header>

      <section className="panel selection-panel">
        <h2>Beete & Sensoren</h2>
        <div className="bed-grid">
          {bedCards.length === 0 ? (
            <p className="panel__hint">Keine Sensordaten verfügbar.</p>
          ) : (
            bedCards.map((bed) => (
              <GardenBedCard
                key={bed.id}
                id={bed.id}
                name={bed.name}
                crop={bed.crop}
                moisture={bed.moisture}
                threshold={bed.threshold}
                status={bed.status}
                sunlight={bed.sunlight}
                timestamp={bed.timestamp}
                variant={bed.variant}
                isActive={String(bed.id) === String(selectedSensorId)}
                onSelect={() => setSelectedSensorId(String(bed.id))}
                onThresholdSaved={() => refetch()}
              />
            ))
          )}
        </div>
      </section>

      <section className="panel">
        <header className="panel__header">
          <h2>Diagramme</h2>
          <p className="panel__hint">Historische Verläufe pro Sensor.</p>
        </header>

        <MoistureChart
          sensors={sensors}
          selectedSensorId={selectedSensorId}
          onSensorChange={(id) => setSelectedSensorId(String(id))}
        />
      </section>

      <section className="panel">
        <header className="panel__header">
          <h2>Wetter & Regen</h2>
          <div className="api-indicator">
            <span className={`api-indicator__dot ${weatherError ? 'is-error' : 'is-ok'}`} />
            <span>{weatherError ? 'Open-Meteo nicht erreichbar' : 'Open-Meteo aktiv'}</span>
          </div>
        </header>

        {weatherLoading && <p className="panel__hint">Lade Wetterdaten ...</p>}
        {weatherError && !weatherLoading && <p className="panel__hint">Fehler: {weatherError}</p>}
        {weather && <p className="panel__hint">Letztes Update: {minutesSinceUpdate} min</p>}

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
