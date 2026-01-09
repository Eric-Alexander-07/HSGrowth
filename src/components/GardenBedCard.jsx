import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://10.10.100.110'
const THRESHOLD_ENDPOINT = `${API_BASE.replace(/\/$/, '')}/api/sensor/threshold`

const getVariantTone = (variant) => {
  switch (variant) {
    case 'green':
      return 'bed-card--good'
    case 'yellow':
      return 'bed-card--warn'
    case 'red':
      return 'bed-card--alert'
    case 'off':
      return 'bed-card--muted'
    default:
      return 'bed-card--neutral'
  }
}

const getChipTone = (variant) => {
  switch (variant) {
    case 'green':
      return 'bed-chip--good'
    case 'yellow':
      return 'bed-chip--warn'
    case 'red':
      return 'bed-chip--alert'
    default:
      return 'bed-chip--muted'
  }
}

const GardenBedCard = ({
  id,
  name,
  crop,
  moisture,
  threshold,
  status,
  sunlight,
  timestamp,
  variant,
  isActive,
  onSelect,
  onThresholdSaved,
}) => {
  const statusTone = getVariantTone(variant)
  const valueChipTone = getChipTone(variant)

  const [isOpen, setIsOpen] = useState(false)
  const [draft, setDraft] = useState(threshold ?? '')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    if (!isOpen) setDraft(threshold ?? '')
  }, [threshold, isOpen])

  const canSave = useMemo(() => {
    const n = Number(draft)
    return Number.isFinite(n) && String(draft).trim() !== ''
  }, [draft])

  const handleSave = async () => {
    const sensorId = id
    if (sensorId == null) {
      setSaveError('Sensor-ID fehlt (id ist null/undefined)')
      return
    }

    try {
      setSaving(true)
      setSaveError('')

      const payload = { sensorId, threshold: Number(draft) }
      await axios.post(THRESHOLD_ENDPOINT, payload, { timeout: 10000 })

      setIsOpen(false)
      onThresholdSaved?.(payload)
    } catch (e) {
      setSaveError(e?.response?.data?.error || e?.message || 'Speichern fehlgeschlagen')
    } finally {
      setSaving(false)
    }
  }

  return (
    <article
      className={`bed-card ${statusTone} ${isActive ? 'is-active' : ''}`}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect?.()
        }
      }}
    >
      <header className="bed-card__header">
        <span className="bed-card__pill">{status}</span>

        <button
          type="button"
          className="bed-card__settings"
          aria-label="Schwellwert einstellen"
          onClick={(e) => {
            e.stopPropagation()
            setIsOpen(true)
          }}
        >
          ⚙️
        </button>

        <h3 className="bed-card__title">{name}</h3>
        <p className="bed-card__subtitle">{crop}</p>
      </header>

      <div className="bed-card__meta">
        <span className={`bed-chip ${valueChipTone}`}>
          Wert {Number.isFinite(moisture) ? `${Math.round(moisture)}` : '--'}
        </span>
        <span className="bed-chip bed-chip--muted">
          Schwelle {Number.isFinite(Number(threshold)) ? `${Number(threshold)}` : '--'}
        </span>
      </div>

      <p className="bed-card__task">
        {sunlight}
        <br />
        Letzte Messung: {timestamp || 'unbekannt'}
      </p>

      {isOpen && (
        <div
          className="bed-modal__backdrop"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            e.stopPropagation()
            setIsOpen(false)
          }}
        >
          <div className="bed-modal" onClick={(e) => e.stopPropagation()}>
            <h4 className="bed-modal__title">Gieß-Schwelle einstellen</h4>
            <p className="bed-modal__hint">
              Wenn der Wert <strong>unter</strong> der Schwelle liegt, ist “Gießen”.
              “Gelb” nur bei Regenchance &gt; 80%.
            </p>

            <label className="bed-modal__label" htmlFor={`thr-${id}`}>
              Schwellenwert (Rohwert)
            </label>
            <input
              id={`thr-${id}`}
              className="bed-modal__input"
              inputMode="numeric"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="z.B. 2500"
            />

            {saveError && <p className="bed-modal__error">{saveError}</p>}

            <div className="bed-modal__actions">
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setIsOpen(false)}
                disabled={saving}
              >
                Abbrechen
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={handleSave}
                disabled={!canSave || saving}
              >
                {saving ? 'Speichern…' : 'Speichern'}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}

GardenBedCard.defaultProps = {
  id: null,
  name: 'Beet',
  crop: 'Gemischt',
  moisture: null,
  threshold: null,
  status: 'Status unbekannt',
  sunlight: '',
  timestamp: '',
  variant: 'neutral',
  isActive: false,
  onSelect: null,
  onThresholdSaved: null,
}

export default GardenBedCard
