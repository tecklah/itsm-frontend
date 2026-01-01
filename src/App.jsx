import { useState } from 'react'
import { useLocation } from 'react-router'
import LeftNav from './components/LeftNav.jsx'
import ResponsiveAppBar from './components/ResponsiveAppBar.jsx'
import AppRoutes from './components/AppRoutes.jsx'
import Container from '@mui/material/Container'

function App() {
  const [count, setCount] = useState(0)
  const location = useLocation()
  const isLoginPage = location.pathname === '/login' || location.pathname === '/'

  return (
    <>
      {!isLoginPage && <ResponsiveAppBar />}
      <div className="App" style={{ display: 'flex', gap: '0' }}>
        {!isLoginPage && <LeftNav />}
        <Container sx={{ flex: 1, padding: isLoginPage ? 0 : 2 }}> 
          <AppRoutes />
        </Container>
      </div>
    </>
  )
}

export default App
