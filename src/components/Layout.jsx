import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import hsGrowthLogo from '../assets/HSGrowth.png'
import moonIcon from '../assets/moon.svg'
import sunIcon from '../assets/sun.svg'

const Layout = ({ children, onLogoClick = () => { } }) => {
  const navigate = useNavigate()

  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light'
    return localStorage.getItem('hs-theme') || 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('hs-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand" aria-label="HSGrowth Profil">
          <img
            className="brand-logo"
            src={hsGrowthLogo}
            alt="HSGrowth Logo"
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          />
          <span className="brand-name" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>HSGrowth</span>
        </div>

        <nav className="app-nav" aria-label="Status">
          <button
            type="button"
            className="nav-settings"
            onClick={() => navigate('/settings')}
            aria-label="Einstellungen"
            title="Einstellungen"
          >
            ⚙️
          </button>

          <button
            type="button"
            className={`theme-toggle ${theme === 'dark' ? 'is-dark' : ''}`}
            onClick={toggleTheme}
            aria-label="Darstellung wechseln"
          >
            <span className="theme-toggle__icon" aria-hidden="true">
              <span className="theme-toggle__thumb">
                <img src={theme === 'dark' ? moonIcon : sunIcon} alt="" />
              </span>
            </span>
            <span className="theme-toggle__label">{theme === 'dark' ? 'Dark' : 'Light'}</span>
          </button>
        </nav>
      </header>

      <main className="app-main">{children}</main>

      <footer className="app-footer">
        <span>HSGrowth Demo Dashboard – Sensorik-UI in Arbeit</span>
      </footer>
    </div>
  )
}

export default Layout
