import { useMemo, useState } from 'react'
import { changeAdminPassword } from '../utils/adminApi'

export default function Settings() {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const passwordsMatch = useMemo(
    () => newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword,
    [newPassword, confirmPassword]
  )

  const canSave = oldPassword.length > 0 && newPassword.length >= 6 && passwordsMatch

  const handleSave = async (e) => {
    e.preventDefault()

    // Client-side guard
    if (newPassword.length < 6) {
      setError('Neues Passwort ist zu kurz (min. 6 Zeichen).')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Neues Passwort und Bestätigung stimmen nicht überein.')
      return
    }

    try {
      setSaving(true)
      setError('')
      setSuccess('')
      await changeAdminPassword(oldPassword, newPassword)
      setSuccess('Passwort geändert ✅')

      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Fehler')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="page">
      <header className="page__header">
        <p className="eyebrow">Admin</p>
        <h1>Einstellungen</h1>
        <p className="lede">Hier kannst du das Admin-Passwort ändern.</p>
      </header>

      <section className="panel" style={{ maxWidth: 560, marginInline: 'auto' }}>
        <h2>Passwort ändern</h2>

        <form onSubmit={handleSave} className="settings-form">
          <label className="bed-modal__label" htmlFor="oldpw">
            Aktuelles Passwort
          </label>
          <input
            id="oldpw"
            className="bed-modal__input"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />

          <label className="bed-modal__label" htmlFor="newpw" style={{ marginTop: 10 }}>
            Neues Passwort (min. 6 Zeichen)
          </label>
          <input
            id="newpw"
            className="bed-modal__input"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
          />

          <label className="bed-modal__label" htmlFor="confirmpw" style={{ marginTop: 10 }}>
            Passwort bestätigen
          </label>
          <input
            id="confirmpw"
            className="bed-modal__input"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
          />

          {/* Inline-Hint, bevor überhaupt gespeichert wird */}
          {confirmPassword.length > 0 && !passwordsMatch && (
            <p className="bed-modal__error">Passwörter stimmen nicht überein.</p>
          )}

          {error && <p className="bed-modal__error">{error}</p>}
          {success && <p className="bed-modal__success">{success}</p>}

          <div className="bed-modal__actions" style={{ marginTop: 14 }}>
            <button type="submit" className="btn btn--primary" disabled={!canSave || saving}>
              {saving ? 'Speichern…' : 'Passwort ändern'}
            </button>
          </div>
        </form>
      </section>
    </section>
  )
}
