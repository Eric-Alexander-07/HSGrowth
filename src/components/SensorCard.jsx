// SensorCard.jsx - Platzhalterkarte für die Anzeige eines Sensors.
const SensorCard = ({ name, status, reading }) => {
  return (
    <article className="sensor-card">
      <header className="sensor-card__header">
        <h3 className="sensor-card__title">{name}</h3>
        <span className="sensor-card__status">{status}</span>
      </header>

      <p className="sensor-card__value">{reading}</p>
      <p className="sensor-card__note">
        {/* Hier können spätere Kennzahlen oder Steuerungen ergänzt werden */}
        Detail-Infos folgen nach Backend-Anbindung.
      </p>
    </article>
  )
}

SensorCard.defaultProps = {
  name: 'Unbenannter Sensor',
  status: 'n/a',
  reading: '--',
}

export default SensorCard
