import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Analyze from './pages/Analyze'
import Analysis from './pages/Analysis'
import History from './pages/History'
import Roadmap from './pages/Roadmap'
import RoadmapsList from './pages/RoadmapsList'
import Optimizer from './pages/Optimizer'
import StarBackground from './components/StarBackground'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  return (
    <Router>
      <StarBackground />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="/dashboard" element={ <ProtectedRoute> <Dashboard /> </ProtectedRoute> } />
        <Route path="/dashboard/analyze" element={ <ProtectedRoute> <Analyze /> </ProtectedRoute> } />
        <Route path="/dashboard/history" element={ <ProtectedRoute> <History /> </ProtectedRoute> } />
        
        <Route path="/dashboard/analysis/:id" element={ <ProtectedRoute> <Analysis /> </ProtectedRoute> } />
        <Route path="/dashboard/roadmap/:id" element={ <ProtectedRoute> <Roadmap /> </ProtectedRoute> } />
        
        <Route path="/dashboard/roadmaps" element={ <ProtectedRoute> <RoadmapsList /> </ProtectedRoute> } />
        <Route path="/dashboard/optimizer" element={ <ProtectedRoute> <Optimizer /> </ProtectedRoute> } />
      </Routes>
    </Router>
  )
}

export default App