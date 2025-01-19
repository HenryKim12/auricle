import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Feature from './pages/Feature'

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="feature" element={<Feature />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
