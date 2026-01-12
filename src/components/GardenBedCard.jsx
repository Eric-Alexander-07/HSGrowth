import { useMemo } from 'react'

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
  onOpenSettings, // ✅ neu
}) => {
  const statusTone = useMemo(() => getVariantTone(variant), [variant])
  const valueChipTone = useMemo(() => getChipTone(variant), [variant])

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
        <div className="bed-card__pill_container">
          <span className="bed-card__pill">{status}</span>

          <button
            type="button"
            className="bed-card__settings"
            aria-label="Beet einstellen"
            onClick={(e) => {
              e.stopPropagation()
              onOpenSettings?.({ id, name, threshold })
            }}
          >
            ⚙️
          </button>
        </div>

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
  onOpenSettings: null,
}

export default GardenBedCard
