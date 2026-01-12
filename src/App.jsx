import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import LoraxEasterEgg from './components/LoraxEasterEgg'
import Dashboard from './pages/Dashboard.jsx'
import Settings from './pages/Settings.jsx'

const App = () => {
  const [clicksOnLogo, setClicksOnLogo] = useState(0)
  const [loraxActive, setLoraxActive] = useState(false)

  const handleLogoClick = () => {
    if (loraxActive) return
    setClicksOnLogo((prev) => {
      const next = prev + 1
      if (next >= 5 && !loraxActive) {
        setLoraxActive(true)
        return 0
      }
      return next
    })
  }

  return (
    <BrowserRouter>
      <Layout onLogoClick={handleLogoClick}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
      <LoraxEasterEgg active={loraxActive} onFinish={() => setLoraxActive(false)} />
    </BrowserRouter>
  )
}

export default App
