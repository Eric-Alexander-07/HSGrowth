import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || window.location.origin
const DASHBOARD_ENDPOINT = `${API_BASE.replace(/\/$/, '')}/api/dashboard`

const parseTimestamp = (value) => {
  if (!value) return NaN
  // unterstützt "YYYY-MM-DD HH:mm:ss" oder ISO
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
        const ts = parseTimestamp(timestamp)

        if (!Number.isFinite(ts) || !Number.isFinite(numericValue)) return null

        // ✅ 1:1 übernehmen (keine Prozent-Skalierung)
        return { timestamp, value: numericValue, ts }
      })
      .filter(Boolean)
      .sort((a, b) => a.ts - b.ts)

    const latest = readings.length ? readings[readings.length - 1] : null

    return {
      id: String(sensor.id ?? sensor.sensorId ?? `sensor-${index}`),
      label: sensor.label ?? sensor.location ?? `Sensor ${sensor.id ?? index}`,
      threshold: sensor.lower_threshold ?? sensor.threshold ?? null, // <- aus DB
      readings,
      latest,
    }
  })

export default function useSensorData({ pollMs = 0 } = {}) {
  const [rawData, setRawData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await axios.get(DASHBOARD_ENDPOINT, { timeout: 10000 })
      const sensorsPayload = response.data?.sensors || []
      setRawData(sensorsPayload)
      setError(null)
    } catch (err) {
      console.error('Fehler beim Laden der Sensordaten:', err)
      setError(err?.message || String(err))
      setRawData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      if (!cancelled) await fetchData()
    }
    run()

    let t = null
    if (pollMs > 0) {
      t = setInterval(() => {
        if (!cancelled) fetchData()
      }, pollMs)
    }

    return () => {
      cancelled = true
      if (t) clearInterval(t)
    }
  }, [fetchData, pollMs])

  const sensors = useMemo(() => normalizeSensors(rawData), [rawData])

  const latestBySensor = useMemo(
    () =>
      sensors.map((sensor) => ({
        sensorId: sensor.id,
        location: sensor.label,
        value: sensor.latest?.value ?? null,
        timestamp: sensor.latest?.timestamp ?? '',
        threshold: sensor.threshold ?? null,
      })),
    [sensors]
  )

  return { sensors, latestBySensor, loading, error, refetch: fetchData }
}
