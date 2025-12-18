// GardenBedCard.jsx - Visuelle Kachel fuer ein Beet mit Status und Kennzahlen.
const getMoistureTone = (value) => {
  if (!Number.isFinite(value)) return 'bed-chip--muted'
  if (value >= 60) return 'bed-chip--good'
  if (value >= 35) return 'bed-chip--warn'
  return 'bed-chip--alert'
}

const getStatusTone = (status) => {
  const text = status?.toLowerCase() || ''
  if (text.includes('optimal') || text.includes('stabil')) return 'bed-card--good'
  if (text.includes('leicht') || text.includes('medium')) return 'bed-card--warn'
  if (text.includes('achtung') || text.includes('trocken') || text.includes('kritisch'))
    return 'bed-card--alert'
  return 'bed-card--neutral'
}

const GardenBedCard = ({
  name,
  crop,
  moisture,
  status,
  sunlight,
  timestamp,
  isActive,
  onSelect,
}) => {
  const moistureTone = getMoistureTone(moisture)
  const statusTone = getStatusTone(status)

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
        <h3 className="bed-card__title">{name}</h3>
        <p className="bed-card__subtitle">{crop}</p>
      </header>

      <div className="bed-card__meta">
        <span className={`bed-chip ${moistureTone}`}>
          Feuchte {Number.isFinite(moisture) ? `${moisture}%` : '--'}
        </span>
        <span className="bed-chip bed-chip--muted">{sunlight}</span>
      </div>

      <p className="bed-card__task">
        Letzte Messung: {timestamp || 'unbekannt'}
      </p>
    </article>
  )
}

GardenBedCard.defaultProps = {
  name: 'Beet',
  crop: 'Gemischt',
  moisture: 0,
  status: 'Status unbekannt',
  sunlight: '',
  timestamp: '',
  isActive: false,
  onSelect: null,
}

export default GardenBedCard
