// MoistureChart.jsx - Recharts-LineChart mit echten JSON-Sensordaten.
// Sensor und Zeitraum lassen sich waehlen; neueste Werte stammen aus dem JSON-Export.
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

const TIME_RANGE_OPTIONS = [
  { id: '7d', label: '7 Tage', days: 7 },
  { id: '30d', label: '30 Tage', days: 30 },
  { id: '90d', label: '90 Tage', days: 90 },
  { id: 'all', label: 'Alles', days: null },
]

// Kurzer Formatter fuer Monats/Tag-Achse (z.B. 11/24)
const formatDate = (value) => {
  const date = new Date(value)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const formatDateTime = (value) => {
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date.toLocaleString('de-DE') : 'Unbekannt'
}

const MoistureChart = ({ sensors, selectedSensorId, onSensorChange }) => {
  const [rangeId, setRangeId] = useState('30d')

  const selectedSensor = useMemo(() => {
    if (!sensors || sensors.length === 0) return null
    return sensors.find((sensor) => String(sensor.id) === String(selectedSensorId)) || sensors[0]
  }, [sensors, selectedSensorId])

  const selectedRange = TIME_RANGE_OPTIONS.find((option) => option.id === rangeId)

  const filteredData = useMemo(() => {
    if (!selectedSensor) return []
    const cutoff = selectedRange?.days
      ? Date.now() - selectedRange.days * 24 * 60 * 60 * 1000
      : null
    return selectedSensor.readings
      .filter((reading) => (cutoff ? reading.ts >= cutoff : true))
      .map((reading) => ({
        timestamp: reading.timestamp,
        moisture: reading.value,
      }))
  }, [selectedRange?.days, selectedSensor])

  const latestValue = selectedSensor?.latest?.value ?? null
  const latestTimestamp = selectedSensor?.latest?.timestamp ?? null

  return (
    <section className="chart-card">
      <header className="chart-header">
        <div>
          <p className="eyebrow">Bodenfeuchte</p>
          <h2>Sensorverlauf</h2>
          <p className="panel__hint">
            Daten aus JSON-Datei, Sensor und Zeitraum koennen ausgewaehlt werden.
          </p>
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
        <span className="dot dot-green" aria-hidden="true" /> Gruen ({'>='} 50%)
        <span className="dot dot-yellow" aria-hidden="true" /> Gelb (30-49%)
        <span className="dot dot-red" aria-hidden="true" /> Rot ({'<'} 30%)
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
            {/* Referenzbereiche fuer Ampel (oben Gruen, Mitte Gelb, unten Rot) */}
            <ReferenceArea y1={50} y2={100} fill="#d9f0e1" fillOpacity={0.7} />
            <ReferenceArea y1={30} y2={49} fill="#fbf0d5" fillOpacity={0.75} />
            <ReferenceArea y1={0} y2={29} fill="#f7e1d9" fillOpacity={0.8} />
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
