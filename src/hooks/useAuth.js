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
  const [emailConfirmacaoPendente, setEmailConfirmacaoPendente] = useState(null)

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
    setEmailConfirmacaoPendente(null)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: senha
    })
    if (error) {
      // Traduz mensagens comuns
      let msg = error.message
      if (msg.includes('Invalid login') || msg.includes('invalid')) {
        msg = 'Email ou senha incorretos.'
      } else if (msg.includes('Email not confirmed')) {
        msg = 'Email ainda não confirmado. Verifique sua caixa de entrada.'
      }
      setErro(msg)
      throw new Error(msg)
    }
    setUsuario(data.user)
    return data.user
  }, [])

  // Cadastro de novo gestor + login automático
  const cadastrar = useCallback(async (email, senha) => {
    setErro(null)
    setEmailConfirmacaoPendente(null)

    // 1. Tenta cadastrar
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: senha,
      options: { data: { role: 'gestor' } }
    })
    if (error) {
      const msg = error.message.includes('already registered')
        ? 'Este email já está cadastrado. Tente fazer login.'
        : error.message
      setErro(msg)
      throw new Error(msg)
    }

    // 2. Se o Supabase retornou sessão (confirmação de email DESABILITADA), loga direto
    if (data.session) {
      setUsuario(data.user)
      return data.user
    }

    // 3. Se não retornou sessão, precisa de confirmação de email
    // Tenta fazer login automaticamente (funciona se confirmação estiver desabilitada)
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: senha
    })

    if (!loginError) {
      // Login automático funcionou (confirmação de email desabilitada)
      const { data: sessao } = await supabase.auth.getSession()
      setUsuario(sessao?.session?.user ?? null)
      return sessao?.session?.user
    }

    // 4. Se o login automático falhou, precisa de confirmação de email
    setEmailConfirmacaoPendente(email.trim().toLowerCase())
    return null
  }, [])

  // Reenvia email de confirmação
  const reenviarConfirmacao = useCallback(async (email) => {
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    if (error) throw error
  }, [])

  // Logout
  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUsuario(null)
    setEmailConfirmacaoPendente(null)
  }, [])

  // Limpa a mensagem de erro
  const limparErro = useCallback(() => {
    setErro(null)
  }, [])

  return {
    usuario,
    carregando,
    erro,
    emailConfirmacaoPendente,
    login,
    cadastrar,
    logout,
    reenviarConfirmacao,
    limparErro,
    autenticado: !!usuario
  }
}
