import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { Home } from './pages/Home'
import { MovieDetail } from './pages/MovieDetail'
import { Search } from './pages/Search'
import { Profile } from './pages/Profile'
import { Watchlist } from './pages/Watchlist'
import { ToastProvider } from './contexts/ToastContext'

function App() {
  return (
    <Router>
      <ToastProvider>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
            <Route path="/search" element={<Search />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/watchlist" element={<Watchlist />} />
          </Routes>
        </MainLayout>
      </ToastProvider>
    </Router>
  )
}

export default App
