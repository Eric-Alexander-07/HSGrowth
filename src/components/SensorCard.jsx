// SensorCard.jsx - Sensor-Kachel mit Threshold-Logik + Regen-Sonderfall (gelb)
const getStatusClass = ({ value, threshold, rainChance24h }) => {
  if (!Number.isFinite(value)) return 'sensor--off'
  if (!Number.isFinite(threshold)) return 'sensor--neutral'

  if (value >= threshold) return 'sensor--green'
  if (Number.isFinite(rainChance24h) && rainChance24h > 80) return 'sensor--yellow'
  return 'sensor--red'
}

const getStatusText = ({ value, threshold, rainChance24h }) => {
  if (!Number.isFinite(value)) return 'Keine Daten'
  if (!Number.isFinite(threshold)) return 'Schwelle fehlt'

  if (value >= threshold) return 'OK'
  if (Number.isFinite(rainChance24h) && rainChance24h > 80) return 'Warten (Regen > 80%)'
  return 'Gießen'
}

const SensorCard = ({ name, value, threshold, rainChance24h, timestamp, onOpenSettings }) => {
  const statusClass = getStatusClass({ value, threshold, rainChance24h })
  const statusText = getStatusText({ value, threshold, rainChance24h })

  return (
    <article className={`sensor-card ${statusClass}`}>
      <header className="sensor-card__header">
        <h3 className="sensor-card__title">{name}</h3>

        <div className="sensor-card__actions">
          <span className="sensor-card__badge">{statusText}</span>
          <button
            type="button"
            className="sensor-card__gear"
            onClick={onOpenSettings}
            aria-label="Gieß-Schwelle einstellen"
            title="Gieß-Schwelle einstellen"
          >
            ⚙️
          </button>
        </div>
      </header>

      <p className="sensor-card__value">
        {Number.isFinite(value) ? value : '--'}
      </p>

      <p className="sensor-card__meta">
        Schwelle: {Number.isFinite(threshold) ? threshold : '--'}
      </p>

      <p className="sensor-card__note">
        Zuletzt aktualisiert: {timestamp || 'unbekannt'}
      </p>
    </article>
  )
}

SensorCard.defaultProps = {
  name: 'Unbenannter Sensor',
  value: null,
  threshold: null,
  rainChance24h: null,
  timestamp: '',
  onOpenSettings: null,
}

export default SensorCard
