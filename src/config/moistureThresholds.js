// Zentraler Ort fuer alle Ampel-Schwellenwerte (Feuchtigkeit in Prozent).
export const MOISTURE_THRESHOLDS = {
  // Gartenbeet-Kacheln
  beds: {
    good: 70,
    warn: 35,
  },
  // Sensor-Kacheln & Diagramm
  sensors: {
    good: 55,
    warn: 30,
  },
}

export default MOISTURE_THRESHOLDS
