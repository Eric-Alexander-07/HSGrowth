// useSensorData.js - Liest Sensordaten via API Call (Rohwerte 1:1) + Threshold Update.
import { useState, useEffect, useMemo, useCallback } from 'react'
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL
const DASHBOARD_URL = `${BASE_URL}/api/dashboard`

const parseTimestamp = (value) => {
  if (!value) return NaN
  const normalized = String(value).includes('T') ? String(value) : String(value).replace(' ', 'T')
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
    const threshold =
      sensor.lower_threshold != null && sensor.lower_threshold !== ''
        ? Number(sensor.lower_threshold)
        : null

    return {
      id: String(sensor.id ?? sensor.sensorId ?? `sensor-${index}`),
      label: sensor.label ?? sensor.location ?? `Sensor ${sensor.id ?? index}`,
      lower_threshold: sensor.lower_threshold ?? null,
      readings,
      latest,
    }
  })

export default function useSensorData() {
  const [rawData, setRawData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await axios.get(DASHBOARD_URL, { timeout: 10000 })
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
      if (cancelled) return
      await fetchData()
    }

    run()
    return () => {
      cancelled = true
    }
  }, [fetchData])

  const sensors = useMemo(() => normalizeSensors(rawData), [rawData])

  const latestBySensor = useMemo(
    () =>
      sensors.map((sensor) => ({
        sensorId: sensor.id,
        location: sensor.label,
        threshold: sensor.threshold,
        value: sensor.latest?.value ?? null,
        timestamp: sensor.latest?.timestamp ?? '',
        threshold: sensor.lower_threshold ?? sensor.threshold ?? null,
      })),
    [sensors]
  )

  // ✅ Threshold in DB setzen
  const updateThreshold = useCallback(async (sensorId, lowerThreshold) => {
    const url = `${BASE_URL}/api/sensor/${sensorId}/threshold`
    await axios.put(url, { lower_threshold: lowerThreshold }, { timeout: 10000 })

    // Nach erfolgreichem Speichern: Daten neu laden
    await fetchData()
  }, [fetchData])

  return { sensors, latestBySensor, loading, error, refetch: fetchData, updateThreshold }
}
