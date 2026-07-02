import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import App from './App'
import { AuthProvider } from './store/AuthContext'
import { DataProvider } from './store/DataContext'
import { ToastProvider } from './components/Toast'
import './index.css'

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
