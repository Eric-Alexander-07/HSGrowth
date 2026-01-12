import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://10.10.100.110'
const THRESHOLD_ENDPOINT = `${API_BASE.replace(/\/$/, '')}/api/sensor/threshold`

export default function ThresholdSettingsModal({
  isOpen,
  bed,                 // { id, name, threshold }
  onClose,
  onSaved,             // callback nach erfolgreichem Save
}) {
  const [thresholdDraft, setThresholdDraft] = useState('')
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!isOpen) return
    setThresholdDraft(bed?.threshold ?? '')
    setPassword('')
    setError('')
    setSuccess('')
  }, [isOpen, bed])

  const canSave = useMemo(() => {
    const n = Number(thresholdDraft)
    return bed?.id != null && Number.isFinite(n) && String(thresholdDraft).trim() !== '' && password.length > 0
  }, [thresholdDraft, password, bed])

  if (!isOpen) return null

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const payload = {
        sensorId: bed.id,
        threshold: Number(thresholdDraft),
        password,
      }

      await axios.post(THRESHOLD_ENDPOINT, payload, { timeout: 10000 })

      setSuccess('Gespeichert ✅')
      onSaved?.(payload)

      // optional: kurz Erfolg zeigen, dann schließen
      setTimeout(() => onClose?.(), 450)
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Speichern fehlgeschlagen')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bed-modal__backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="bed-modal" onClick={(e) => e.stopPropagation()}>
        <h4 className="bed-modal__title">Beet-Einstellungen</h4>

        <p className="bed-modal__hint" style={{ marginBottom: 10 }}>
          <strong>{bed?.name || 'Beet'}</strong> · Sensor-ID: <strong>{bed?.id}</strong>
        </p>

        <div className="bed-modal__row">
          <div className="bed-modal__field">
            <label className="bed-modal__label" htmlFor="thr">
              Schwellenwert
            </label>
            <input
              id="thr"
              className="bed-modal__input"
              inputMode="numeric"
              value={thresholdDraft}
              onChange={(e) => setThresholdDraft(e.target.value)}
              placeholder="z.B. 2500"
            />
          </div>

          <div className="bed-modal__field">
            <label className="bed-modal__label" htmlFor="pw">
              Admin-Passwort
            </label>
            <input
              id="pw"
              className="bed-modal__input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoFocus
            />
          </div>
        </div>

        {error && <p className="bed-modal__error">{error}</p>}
        {success && <p className="bed-modal__success">{success}</p>}

        <div className="bed-modal__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={saving}>
            Abbrechen
          </button>
          <button type="button" className="btn btn--primary" onClick={handleSave} disabled={!canSave || saving}>
            {saving ? 'Speichern…' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  )
}
