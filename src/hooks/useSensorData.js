// useSensorData.js - Liest Sensordaten aus der JSON-Exportdatei (siehe src/mock/sensors.json).
// Normalisiert Zeitstempel, rechnet Werte auf Prozent hoch (falls 0-1 geliefert) und liefert
// den aktuellsten Messwert pro Sensor.
import { useMemo } from 'react'
import sensorPayload from '../mock/sensors.json'

const parseTimestamp = (value) => {
  if (!value) return NaN
  // Unterstuetzt "YYYY-MM-DD hh:mm:ss" und ISO-Strings.
  const normalized = value.includes('T') ? value : value.replace(' ', 'T')
  return Date.parse(normalized)
}

const normalizeSensors = (rawSensors = []) =>
  rawSensors.map((sensor) => {
    const readings = (sensor.messwerte || sensor.readings || [])
      .map(({ timestamp, value }) => {
        const parsedTs = parseTimestamp(timestamp)
        const numericValue = Number(value)
        if (!Number.isFinite(parsedTs) || Number.isNaN(numericValue)) return null

        // Falls Werte im Bereich 0-1 kommen, auf Prozent skalieren.
        const scaled = numericValue <= 1 ? Number((numericValue * 100).toFixed(1)) : numericValue

        return { timestamp, value: scaled, ts: parsedTs }
      })
      .filter(Boolean)
      .sort((a, b) => a.ts - b.ts)

    const latest = readings.length > 0 ? readings[readings.length - 1] : null

    return {
      id: sensor.id ?? sensor.sensorId ?? sensor.label,
      label: sensor.label ?? sensor.location ?? `Sensor ${sensor.id}`,
      readings,
      latest,
    }
  })

export default function useSensorData() {
  const sensors = useMemo(() => normalizeSensors(sensorPayload?.sensors), [])

  const latestBySensor = useMemo(
    () =>
      sensors.map((sensor) => ({
        sensorId: sensor.id,
        location: sensor.label || sensor.id,
        value: sensor.latest?.value ?? null,
        timestamp: sensor.latest?.timestamp ?? '',
      })),
    [sensors]
  )

  return { sensors, latestBySensor }
}
