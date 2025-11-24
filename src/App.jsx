// App.jsx - zentraler Einstieg für Routing und Layout-Rahmen.
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'

const App = () => {
  return (
    <BrowserRouter>
      {/* Layout um alle Seiten gelegt, um Header/Footer zu teilen */}
      <Layout>
        <Routes>
          {/* Root-Route führt auf das Dashboard mit Sensor-Übersicht */}
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
