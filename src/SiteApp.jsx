// =====================================================================
// Site Institucional — App standalone (sem dependência do Layout do gestor)
// Pode ser deployado em domínio próprio (ex: www.corpoeacao.com.br)
// =====================================================================
import { HashRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { ToastProvider } from './components/Toast'
import SiteInstitucional from './pages/SiteInstitucional'

export default function SiteApp() {
  return (
    <AppProvider>
      <ToastProvider>
        <HashRouter>
          <Routes>
            <Route path="*" element={<SiteInstitucional />} />
          </Routes>
        </HashRouter>
      </ToastProvider>
    </AppProvider>
  )
}
