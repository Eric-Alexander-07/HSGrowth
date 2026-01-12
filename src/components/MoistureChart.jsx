import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const TIME_RANGE_OPTIONS = [
  { id: 'today', label: 'Heute' },
  { id: 'yesterday', label: 'Gestern' },
  { id: 'all', label: 'Alles' },
]

const formatDate = (value) => {
  const date = new Date(value)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const formatDateTime = (value) => {
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date.toLocaleString('de-DE') : 'Unbekannt'
}

// Tagesgrenzen (lokal)
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
const endOfDay = (d) => startOfDay(d) + 24 * 60 * 60 * 1000

const MoistureChart = ({ sensors, selectedSensorId, onSensorChange, rainChance24h = null }) => {
  const [rangeId, setRangeId] = useState('today')

  const selectedSensor = useMemo(() => {
    if (!sensors || sensors.length === 0) return null
    return sensors.find((s) => String(s.id) === String(selectedSensorId)) || sensors[0]
  }, [sensors, selectedSensorId])

  const threshold = Number(selectedSensor?.threshold)
  const hasThreshold = Number.isFinite(threshold)

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

        const value = Number(reading.value)
        if (!Number.isFinite(value)) return null

        return {
          ts,
          timestamp: reading.timestamp ?? new Date(ts).toISOString(),
          moisture: value, // ✅ Rohwert
        }
      })
      .filter(Boolean)
      .sort((a, b) => a.ts - b.ts)
  }, [rangeId, selectedSensor])

  const latestValue = selectedSensor?.latest?.value ?? null
  const latestTimestamp = selectedSensor?.latest?.timestamp ?? null

  // Y-Achse dynamisch (Rohwerte != 0..100)
  const yDomain = useMemo(() => {
    if (!filteredData.length) return ['auto', 'auto']
    const vals = filteredData.map((d) => d.moisture).filter(Number.isFinite)
    if (!vals.length) return ['auto', 'auto']
    const min = Math.min(...vals)
    const max = Math.max(...vals)

    // bisschen Luft geben
    const pad = Math.max(10, (max - min) * 0.08)
    return [Math.max(0, min - pad), max + pad]
  }, [filteredData])

  // Status-Logik fürs Legend (2 Zustände + Gelb-Regel)
  const needsWater = hasThreshold && Number.isFinite(Number(latestValue)) ? Number(latestValue) < threshold : false
  const rainHigh = Number.isFinite(Number(rainChance24h)) ? Number(rainChance24h) > 80 : false

  const statusText = !Number.isFinite(Number(latestValue))
    ? 'Keine Daten'
    : !hasThreshold
      ? 'Kein Threshold gesetzt'
      : needsWater
        ? (rainHigh ? 'Gießen nötig (aber Regen wahrscheinlich)' : 'Gießen nötig')
        : 'OK'

  return (
    <section className="chart-card">
      <header className="chart-header">
        <div>
          <p className="eyebrow">Bodenfeuchte</p>
          <h2>Sensorverlauf</h2>
          <p className="panel__hint">
            Rohwerte aus DB. Zeitraum: Heute/Gestern/Alles. Threshold: lower_threshold.
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

      <div className="chart-range-buttons" aria-label="Zeiträume">
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
        {/* Legend jetzt nach Threshold-Logik */}
        <span className="dot dot-green" aria-hidden="true" /> OK (≥ Threshold)
        <span className="dot dot-red" aria-hidden="true" /> Gießen nötig (&lt; Threshold)
        <span className="dot dot-yellow" aria-hidden="true" /> Gießen nötig + Regenchance &gt; 80%
        <span className="dot" aria-hidden="true" />

        <span>
          Threshold:{' '}
          {hasThreshold ? `${threshold}` : '—'}{' '}
          • Regen 24h:{' '}
          {Number.isFinite(Number(rainChance24h)) ? `${Math.round(rainChance24h)}%` : '—'}
          {' • '}
          Status: {statusText}
          {' • '}
          Letzter Wert:{' '}
          {latestValue != null ? `${latestValue} (${formatDateTime(latestTimestamp)})` : 'keine Daten'}
        </span>
      </div>

      {filteredData.length === 0 ? (
        <p className="panel__hint">Keine Messwerte im gewählten Zeitraum.</p>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={filteredData} margin={{ top: 12, right: 16, left: 0, bottom: 12 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
            <XAxis dataKey="timestamp" tickFormatter={formatDate} tickMargin={8} stroke="var(--muted)" />
            <YAxis domain={yDomain} tickMargin={8} stroke="var(--muted)" />

            <Tooltip
              labelFormatter={(value) => `Datum: ${formatDateTime(value)}`}
              formatter={(value) => [`${value}`, 'Feuchte (Rohwert)']}
            />

            {/* Threshold-Zonen: oberhalb grün, unterhalb rot */}
            {hasThreshold && (
              <>
                <ReferenceArea y1={threshold} y2={yDomain[1]} fill="#d9f0e1" fillOpacity={0.55} />
                <ReferenceArea y1={yDomain[0]} y2={threshold} fill="#f7e1d9" fillOpacity={0.65} />
                <ReferenceLine y={threshold} stroke="#111827" strokeDasharray="4 4" />
              </>
            )}

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
  rainChance24h: null,
}

export default MoistureChart
