import React from 'react'
import { createRoot } from 'react-dom/client'
import SiteApp from './SiteApp'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary nome="Site Institucional">
      <SiteApp />
    </ErrorBoundary>
  </React.StrictMode>
)
