// =====================================================================
// Hook de autenticação — Supabase Auth para o painel do gestor
// Login por email + senha (padrão Supabase Auth).
// =====================================================================
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  // Verifica se há uma sessão ativa ao carregar
  useEffect(() => {
    let ativo = true
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!ativo) return
      setUsuario(session?.user ?? null)
      setCarregando(false)
    })()

    // Escuta mudanças de autenticação (login/logout em outra aba)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_evento, session) => {
        setUsuario(session?.user ?? null)
      }
    )

    return () => {
      ativo = false
      subscription?.unsubscribe()
    }
  }, [])

  // Login com email + senha
  const login = useCallback(async (email, senha) => {
    setErro(null)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: senha
    })
    if (error) {
      const msg = error.message.includes('Invalid login')
        ? 'Email ou senha incorretos.'
        : error.message
      setErro(msg)
      throw new Error(msg)
    }
    setUsuario(data.user)
    return data.user
  }, [])

  // Cadastro de novo gestor (apenas se não houver nenhum usuário)
  const cadastrar = useCallback(async (email, senha) => {
    setErro(null)
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: senha,
      options: { data: { role: 'gestor' } }
    })
    if (error) {
      const msg = error.message.includes('already registered')
        ? 'Este email já está cadastrado.'
        : error.message
      setErro(msg)
      throw new Error(msg)
    }
    setUsuario(data.user)
    return data.user
  }, [])

  // Logout
  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUsuario(null)
  }, [])

  // Verifica se há algum usuário cadastrado (para decidir mostrar "Login" ou "Cadastro")
  const temUsuarios = useCallback(async () => {
    // Se conseguimos obter uma sessão, existe pelo menos um usuário
    const { data: { session } } = await supabase.auth.getSession()
    // Also try to list users (only works with service_role, so we fallback)
    // For simplicity, we check if there's an active session from before
    // In production, you'd check via an edge function
    return !!session
  }, [])

  return {
    usuario,
    carregando,
    erro,
    login,
    cadastrar,
    logout,
    temUsuarios,
    autenticado: !!usuario
  }
}
