import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import App from './App'
import { AuthProvider } from './store/AuthContext'
import { DataProvider } from './store/DataContext'
import { ToastProvider } from './components/Toast'
import { applyStoredTheme } from './hooks/useTheme'
import './index.css'

// Apply the saved theme before the first React render, so the splash/loader
// paints in the right theme from frame one (no light flash in dark mode).
applyStoredTheme()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      {/* reducedMotion="user" honours prefers-reduced-motion globally. */}
      <MotionConfig reducedMotion="user">
        <ToastProvider>
          <AuthProvider>
            <DataProvider>
              <App />
            </DataProvider>
          </AuthProvider>
        </ToastProvider>
      </MotionConfig>
    </BrowserRouter>
  </StrictMode>,
)
