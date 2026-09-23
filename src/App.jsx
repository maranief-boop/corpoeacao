// =====================================================================
// Raiz da aplicação — providers + rotas + autenticação
// =====================================================================
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { ToastProvider } from './components/Toast'
import { useAuth } from './hooks/useAuth'
import { Spinner } from './components/ui'
import ErrorBoundary from './components/ErrorBoundary'
import LoginPage from './pages/LoginPage'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Alunos from './pages/Alunos'
import Financeiro from './pages/Financeiro'
import Treinos from './pages/Treinos'
import Checkins from './pages/Checkins'
import Configuracoes from './pages/Configuracoes'
import PortalAluno from './pages/PortalAluno'
import Crm from './pages/Crm'
import CrmAgenda from './pages/CrmAgenda'
import SiteInstitucional from './pages/SiteInstitucional'

// Wrapper que protege rotas do painel — redireciona para login se não autenticado
function RotaProtegida({ autenticado, children }) {
  if (!autenticado) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const auth = useAuth()

  // Carregando sessão
  if (auth.carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100 dark:bg-zinc-950">
        <Spinner />
      </div>
    )
  }

  return (
    <ErrorBoundary nome="Aplicação">
      <AppProvider>
        <ToastProvider>
          <HashRouter>
            <Routes>
              {/* Rota de login do gestor */}
              <Route
                path="/login"
                element={
                  auth.autenticado
                    ? <Navigate to="/" replace />
                    : <LoginPage auth={auth} />
                }
              />

              {/* Rota pública — Portal do Aluno (independente do painel) */}
              <Route
                path="/aluno"
                element={
                  <ErrorBoundary nome="Portal do Aluno">
                    <PortalAluno />
                  </ErrorBoundary>
                }
              />

              {/* Rota pública — Site Institucional */}
              <Route
                path="/site-publico"
                element={
                  <ErrorBoundary nome="Site Institucional">
                    <SiteInstitucional />
                  </ErrorBoundary>
                }
              />

              {/* Painel do Gestor — rotas protegidas */}
              <Route
                element={
                  <RotaProtegida autenticado={auth.autenticado}>
                    <ErrorBoundary nome="Layout do Painel">
                      <Layout auth={auth} />
                    </ErrorBoundary>
                  </RotaProtegida>
                }
              >
                <Route path="/" element={<Dashboard />} />
                <Route path="/alunos" element={<Alunos />} />
                <Route path="/financeiro" element={<Financeiro />} />
                <Route path="/treinos" element={<Treinos />} />
                <Route path="/checkins" element={<Checkins />} />
                <Route path="/crm" element={<Navigate to="/crm/leads" replace />} />
                <Route path="/crm/leads" element={<Crm />} />
                <Route path="/crm/agenda" element={<CrmAgenda />} />
                <Route path="/site" element={<SiteInstitucional />} />
                <Route path="/configuracoes" element={<Configuracoes />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </HashRouter>
        </ToastProvider>
      </AppProvider>
    </ErrorBoundary>
  )
}
