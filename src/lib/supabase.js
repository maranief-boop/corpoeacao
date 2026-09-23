// =====================================================================
// Cliente Supabase — configuração central resiliente
// =====================================================================
import { createClient } from '@supabase/supabase-js'

// Leitura das variáveis injetadas pelo Vite
const rawUrl = import.meta.env.VITE_SUPABASE_URL
const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Tratamento seguro de strings (evita undefined, null e remove espaços acidentais)
const supabaseUrl = typeof rawUrl === 'string' ? rawUrl.trim() : ''
const supabaseAnonKey = typeof rawAnonKey === 'string' ? rawAnonKey.trim() : ''

// Validador de formato de URL HTTP/HTTPS válida
const isValidHttpUrl = (urlString) => {
  if (!urlString || urlString.includes('SEU-PROJETO')) return false
  try {
    const parsed = new URL(urlString)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

// Validador de chave anon mínima
const isValidKey = (keyString) => {
  if (!keyString || keyString.includes('SUA-CHAVE') || keyString.length < 10) return false
  return true
}

const isUrlValid = isValidHttpUrl(supabaseUrl)
const isKeyValid = isValidKey(supabaseAnonKey)
export const isSupabaseConfigured = isUrlValid && isKeyValid

// Log seguro para inspecionar variáveis no Vite sem expor o segredo completo
const maskKey = (key) => {
  if (!key) return '(vazio/indefinido)'
  if (key.length <= 10) return '***'
  return `${key.slice(0, 6)}...${key.slice(-4)} (comprimento: ${key.length})`
}

console.log('[Vite / Supabase Env Check]', {
  VITE_SUPABASE_URL: isUrlValid ? supabaseUrl : (supabaseUrl ? `${supabaseUrl} [FORMATO INVÁLIDO]` : '(não definida)'),
  VITE_SUPABASE_ANON_KEY: maskKey(supabaseAnonKey),
  valido: isSupabaseConfigured
})

if (!isSupabaseConfigured) {
  console.warn(
    '⚠️ [Supabase] Variáveis de ambiente VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY estão ausentes ou inválidas.\n' +
    'Um cliente de fallback seguro foi inicializado para evitar que a aplicação falhe no arranque ("Illegal constructor").\n' +
    'Verifique o arquivo .env na raiz do projeto e certifique-se de reiniciar o servidor Vite.'
  )
}

// Fallback sintaticamente válido caso o .env não esteja configurado ou lido pelo Vite,
// prevenindo que o createClient dispare TypeError: Illegal constructor / Invalid URL no arranque.
const FALLBACK_URL = 'https://placeholder-project.supabase.co'
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder-token'

const finalUrl = isUrlValid ? supabaseUrl : FALLBACK_URL
const finalKey = isKeyValid ? supabaseAnonKey : FALLBACK_KEY

export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

export default supabase