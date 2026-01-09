// MoistureChart.jsx
import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { MOISTURE_THRESHOLDS } from '../config/moistureThresholds'

const TIME_RANGE_OPTIONS = [
  { id: 'today', label: 'Heute' },
  { id: 'yesterday', label: 'Gestern' },
  { id: 'all', label: 'Alles' },
]

const { good: SENSOR_GOOD, warn: SENSOR_WARN } = MOISTURE_THRESHOLDS.sensors

const formatDate = (value) => {
  const date = new Date(value)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const formatDateTime = (value) => {
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date.toLocaleString('de-DE') : 'Unbekannt'
}

// Helfer: Tagesgrenzen (lokale Zeit)
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
const endOfDay = (d) => startOfDay(d) + 24 * 60 * 60 * 1000

const MoistureChart = ({ sensors, selectedSensorId, onSensorChange }) => {
  const [rangeId, setRangeId] = useState('today')

  const selectedSensor = useMemo(() => {
    if (!sensors || sensors.length === 0) return null
    return sensors.find((sensor) => String(sensor.id) === String(selectedSensorId)) || sensors[0]
  }, [sensors, selectedSensorId])

  const filteredData = useMemo(() => {
    if (!selectedSensor?.readings?.length) return []

    const now = new Date()
    const todayStart = startOfDay(now)
    const todayEnd = endOfDay(now)

    const y = new Date(now)
    y.setDate(now.getDate() - 1)
    const yStart = startOfDay(y)
    const yEnd = endOfDay(y)

    const toTs = (reading) => {
      // Unterstützt entweder reading.ts (number) ODER reading.timestamp (string)
      if (Number.isFinite(reading.ts)) return reading.ts
      const parsed = Date.parse(reading.timestamp)
      return Number.isFinite(parsed) ? parsed : NaN
    }

    const inRange = (ts) => {
      if (!Number.isFinite(ts)) return false
      if (rangeId === 'all') return true
      if (rangeId === 'today') return ts >= todayStart && ts < todayEnd
      if (rangeId === 'yesterday') return ts >= yStart && ts < yEnd
      return true
    }

    return selectedSensor.readings
      .map((reading) => {
        const ts = toTs(reading)
        if (!inRange(ts)) return null
        return {
          ts, // für sicheres Sortieren/Filtern
          timestamp: reading.timestamp ?? new Date(ts).toISOString(), // für XAxis + Tooltip
          moisture: reading.value,
        }
      })
      .filter(Boolean)
      .sort((a, b) => a.ts - b.ts)
  }, [rangeId, selectedSensor])

  const latestValue = selectedSensor?.latest?.value ?? null
  const latestTimestamp = selectedSensor?.latest?.timestamp ?? null

  return (
    <section className="chart-card">
      <header className="chart-header">
        <div>
          <p className="eyebrow">Bodenfeuchte</p>
          <h2>Sensorverlauf</h2>
          <p className="panel__hint">Daten aus JSON-Datei, Sensor und Zeitraum koennen ausgewaehlt werden.</p>
        </div>
        <div className="chart-controls">
          <select
            id="sensor-select"
            aria-label="Sensor auswaehlen"
            value={selectedSensorId || ''}
            onChange={(event) => onSensorChange?.(event.target.value)}
          >
            {sensors?.map((sensor) => (
              <option key={sensor.id} value={sensor.id}>
                {sensor.label || 'Sensor'} ({sensor.id})
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="chart-range-buttons" aria-label="Zeitraeume">
        {TIME_RANGE_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            className={option.id === rangeId ? 'is-active' : ''}
            onClick={() => setRangeId(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="chart-legend">
        <span className="dot dot-green" aria-hidden="true" /> Gruen ({'>='} {SENSOR_GOOD}%)
        <span className="dot dot-yellow" aria-hidden="true" /> Gelb ({SENSOR_WARN}-{SENSOR_GOOD - 1}%)
        <span className="dot dot-red" aria-hidden="true" /> Rot ({'<'} {SENSOR_WARN}%)
        <span className="dot" aria-hidden="true" />
        <span>
          Aktuellster Wert:{' '}
          {latestValue != null ? `${latestValue}% (${formatDateTime(latestTimestamp)})` : 'keine Daten'}
        </span>
      </div>

      {filteredData.length === 0 ? (
        <p className="panel__hint">Keine Messwerte im gewaehlten Zeitraum.</p>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={filteredData} margin={{ top: 12, right: 16, left: 0, bottom: 12 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatDate}
              tickMargin={8}
              stroke="var(--muted)"
            />
            <YAxis domain={[0, 100]} tickCount={6} tickMargin={8} stroke="var(--muted)" />
            <Tooltip
              labelFormatter={(value) => `Datum: ${formatDateTime(value)}`}
              formatter={(value) => [`${value}%`, 'Feuchtigkeit']}
            />
            <ReferenceArea y1={SENSOR_GOOD} y2={100} fill="#d9f0e1" fillOpacity={0.7} />
            <ReferenceArea y1={SENSOR_WARN} y2={SENSOR_GOOD} fill="#fbf0d5" fillOpacity={0.75} />
            <ReferenceArea y1={0} y2={SENSOR_WARN} fill="#f7e1d9" fillOpacity={0.8} />
            <Line
              type="monotone"
              dataKey="moisture"
              stroke="#0f6b38"
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 1, stroke: '#0f6b38', fill: '#ffffff' }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </section>
  )
}

MoistureChart.defaultProps = {
  sensors: [],
  selectedSensorId: '',
  onSensorChange: null,
}

export default MoistureChart
