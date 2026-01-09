// Layout.jsx - einfacher Rahmen mit Header, Main und Footer.
import { useEffect, useState } from 'react'
import hsGrowthLogo from '../assets/HSGrowth.png'
import moonIcon from '../assets/moon.svg'
import sunIcon from '../assets/sun.svg'

const Layout = ({ children, onLogoClick = () => {} }) => {
  // Theme wird beim Laden aus localStorage gelesen; Default: light
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light'
    return localStorage.getItem('hs-theme') || 'light'
  })

  useEffect(() => {
    // Theme-Attribute fuer CSS-Variablen setzen und merken
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
            onClick={onLogoClick}
            style={{ cursor: 'pointer' }}
          />
          <span className="brand-name">HSGrowth</span>
        </div>
        <nav className="app-nav" aria-label="Status">
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
