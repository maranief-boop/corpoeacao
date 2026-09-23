// =====================================================================
// Contexto global da aplicação
// - White-Label: nome da academia, logo e cor primária (Supabase + cache)
// - Tema claro/escuro/sistema (nativo)
// =====================================================================
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import { supabase } from '../lib/supabase'
import { aplicarPaleta, aplicarPaletaSecundaria } from '../utils/colors'

const AppContext = createContext(null)

const CONFIG_INICIAL = {
  id: 1,
  nome_academia: 'Academia Corpo e Ação',
  logo_url: '/logo.png',
  cor_primaria: '#DC2626',
  cor_secundaria: '#2563EB',
  cor_card: 'rgba(24, 24, 27, 0.94)',
  card_bg_style: 'solid', // 'solid' | 'glass'
  fundo_portal_url: '',
  favicon_url: '',
  whatsapp: '(18) 98109-3334',
  instagram: '@academia.corpoeacao',
  endereco: 'R. Rui Barbosa, 603, Centro, Mirandópolis - SP'
}

function aplicarFavicon(url) {
  if (!url) return
  let link = document.querySelector("link[rel*='icon']")
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  link.href = url
}

export function AppProvider({ children }) {
  const [config, setConfig] = useState(() => {
    try {
      const cached = localStorage.getItem('config_academia')
      return cached ? { ...CONFIG_INICIAL, ...JSON.parse(cached) } : CONFIG_INICIAL
    } catch {
      return CONFIG_INICIAL
    }
  })
  const [carregando, setCarregando] = useState(true)
  const [tema, setTema] = useState(
    () => localStorage.getItem('tema_academia') || 'auto'
  )

  // ----- Aplica o tema (claro / escuro / sistema) via classe no <html> -----
  useEffect(() => {
    const root = document.documentElement
    const aplicar = () => {
      const sistemaEscuro = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches
      root.classList.toggle('dark', tema === 'dark' || (tema === 'auto' && sistemaEscuro))
    }
    aplicar()
    localStorage.setItem('tema_academia', tema)
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    if (tema === 'auto') media.addEventListener('change', aplicar)
    return () => media.removeEventListener('change', aplicar)
  }, [tema])

  // ----- Carrega a configuração do Supabase (fallback: configuração inicial / cache) -----
  useEffect(() => {
    let ativo = true
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('configuracoes')
          .select('*')
          .eq('id', 1)
          .maybeSingle()

        if (!ativo) return
        const base = data || {}
        const nova = { ...CONFIG_INICIAL, ...config, ...base }
        nova.logo_url = nova.logo_url ?? CONFIG_INICIAL.logo_url

        setConfig(nova)
        localStorage.setItem('config_academia', JSON.stringify(nova))

        aplicarPaleta(nova.cor_primaria || CONFIG_INICIAL.cor_primaria)
        aplicarPaletaSecundaria(nova.cor_secundaria || CONFIG_INICIAL.cor_secundaria)
        if (nova.favicon_url) aplicarFavicon(nova.favicon_url)

        const meta = document.getElementById('meta-theme')
        if (meta) meta.setAttribute('content', nova.cor_primaria)
      } catch (err) {
        console.warn('[AppContext] Erro ao carregar configurações do Supabase:', err)
        aplicarPaleta(config.cor_primaria || CONFIG_INICIAL.cor_primaria)
        aplicarPaletaSecundaria(config.cor_secundaria || CONFIG_INICIAL.cor_secundaria)
      } finally {
        if (ativo) setCarregando(false)
      }
    })()
    return () => {
      ativo = false
    }
  }, [])

  // ----- Salva a configuração (Upsert na linha id=1) e aplica em tempo real -----
  const atualizarConfig = useCallback(
    async (patch) => {
      const nova = {
        ...config,
        ...patch,
        updated_at: new Date().toISOString()
      }
      setConfig(nova)
      localStorage.setItem('config_academia', JSON.stringify(nova))

      if (patch.cor_primaria) {
        aplicarPaleta(patch.cor_primaria)
        const meta = document.getElementById('meta-theme')
        if (meta) meta.setAttribute('content', patch.cor_primaria)
      }
      if (patch.cor_secundaria) {
        aplicarPaletaSecundaria(patch.cor_secundaria)
      }
      if (patch.favicon_url) {
        aplicarFavicon(patch.favicon_url)
      }

      // Tenta upsert com todas as colunas
      try {
        const { error } = await supabase.from('configuracoes').upsert(nova)
        if (error) {
          // Se for erro de schema (coluna ainda não criada no banco), tenta com campos base
          if (error.message?.includes('column') || error.code === '42703') {
            console.warn(
              '[Supabase] Algumas colunas novas ainda não existem na tabela configuracoes. Salvando campos base e mantendo personalização no cache local.',
              error
            )
            const baseCampos = {
              id: 1,
              nome_academia: nova.nome_academia,
              logo_url: nova.logo_url,
              cor_primaria: nova.cor_primaria,
              updated_at: nova.updated_at
            }
            await supabase.from('configuracoes').upsert(baseCampos)
          } else {
            throw error
          }
        }
      } catch (err) {
        console.error('[AppContext] Falha ao persistir no Supabase:', err)
        throw err
      }

      return nova
    },
    [config]
  )

  const value = useMemo(
    () => ({ config, carregando, tema, setTema, atualizarConfig }),
    [config, carregando, tema, atualizarConfig]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp deve ser usado dentro de <AppProvider>')
  return ctx
}