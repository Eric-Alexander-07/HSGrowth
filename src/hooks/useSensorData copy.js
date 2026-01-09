import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/dashboard`

const parseTimestamp = (value) => {
  if (!value) return NaN
  const normalized = value.includes('T') ? value : value.replace(' ', 'T')
  return Date.parse(normalized)
}

const normalizeSensors = (rawSensors = []) =>
  rawSensors.map((sensor, index) => {
    const readingsRaw = sensor.messwerte || sensor.readings || []

    const readings = readingsRaw
      .map((r) => {
        const timestamp = r.timestamp
        const numericValue = Number(r.value)

        const parsedTs = parseTimestamp(timestamp)
        if (!Number.isFinite(parsedTs) || !Number.isFinite(numericValue)) return null

        // ✅ 1:1 übernehmen (keine Skalierung)
        return { timestamp, value: numericValue, ts: parsedTs }
      })
      .filter(Boolean)
      .sort((a, b) => a.ts - b.ts)

    const latest = readings.length ? readings[readings.length - 1] : null

    return {
      id: String(sensor.id ?? sensor.sensorId ?? `sensor-${index}`),
      label: sensor.label ?? sensor.location ?? `Sensor ${sensor.id ?? index}`,
      readings,
      latest,
    }
  })

export default function useSensorData() {
  const [rawData, setRawData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await axios.get(API_URL, { timeout: 10000 })

        // API liefert { success, sensors: [...] }
        const sensorsPayload = response.data?.sensors || []

        if (!cancelled) {
          setRawData(sensorsPayload)
          setError(null)
        }
      } catch (err) {
        console.error('Fehler beim Laden der Sensordaten:', err)
        if (!cancelled) {
          setError(err?.message || String(err))
          setRawData([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => {
      cancelled = true
    }
  }, [])

  const sensors = useMemo(() => normalizeSensors(rawData), [rawData])

  const latestBySensor = useMemo(
    () =>
      sensors.map((sensor) => ({
        sensorId: sensor.id,
        location: sensor.label,
        value: sensor.latest?.value ?? null,
        timestamp: sensor.latest?.timestamp ?? '',
      })),
    [sensors]
  )

  return { sensors, latestBySensor, loading, error }
}
