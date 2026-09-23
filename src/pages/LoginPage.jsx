// =====================================================================
// Tela de Login — Painel do Gestor (Supabase Auth)
// =====================================================================
import { useState } from 'react'
import { Loader2, Lock as LockIcon, Mail, UserPlus, Eye, EyeOff } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useToast } from '../components/Toast'
import { Button, Input, Label, Card } from '../components/ui'

export default function LoginPage({ auth }) {
  const { config } = useApp()
  const { toast } = useToast()
  const { login, cadastrar, erro, emailConfirmacaoPendente, limparErro } = auth

  const [modo, setModo] = useState('login') // 'login' | 'cadastro'
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [processando, setProcessando] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)

  const enviar = async (ev) => {
    ev.preventDefault()
    if (!email.trim()) return toast('Informe o email.', 'aviso')
    if (!senha) return toast('Informe a senha.', 'aviso')
    if (senha.length < 6) return toast('A senha deve ter no mínimo 6 caracteres.', 'aviso')

    if (modo === 'cadastro' && senha !== confirmar) {
      return toast('As senhas não conferem.', 'aviso')
    }

    setProcessando(true)
    try {
      if (modo === 'login') {
        await login(email, senha)
        toast('Bem-vindo(a) ao painel! 💪')
      } else {
        const resultado = await cadastrar(email, senha)
        if (resultado) {
          toast('Conta criada! Bem-vindo(a)! 💪')
        }
        // Se retornou null, precisa de confirmação de email (estado já setado no hook)
      }
    } catch (e) {
      toast(e.message || 'Erro ao autenticar.', 'erro')
    } finally {
      setProcessando(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-md space-y-6">
        {/* Logo + Nome */}
        <div className="text-center">
          {config.logo_url ? (
            <img
              src={config.logo_url}
              alt={config.nome_academia}
              className="mx-auto h-16 w-16 rounded-2xl object-cover shadow-lg ring-2 ring-zinc-200 dark:ring-zinc-700"
            />
          ) : (
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-2xl font-extrabold text-white shadow-lg">
              {(config.nome_academia || 'A')[0].toUpperCase()}
            </div>
          )}
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            {config.nome_academia}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Painel do Gestor
          </p>
        </div>

        {/* Card de Login/Cadastro */}
        <Card className="p-6">
          <form onSubmit={enviar} className="space-y-4">
            <div>
              <Label>Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="gestor@academia.com"
                  className="pl-9"
                  autoFocus
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <Label>Senha</Label>
              <div className="relative">
                <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="pl-9 pr-9"
                  autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-zinc-600 dark:hover:text-zinc-300"
                  tabIndex={-1}
                >
                  {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {modo === 'cadastro' && (
              <div>
                <Label>Confirmar senha</Label>
                <div className="relative">
                  <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <Input
                    type={mostrarSenha ? 'text' : 'password'}
                    value={confirmar}
                    onChange={(e) => setConfirmar(e.target.value)}
                    placeholder="Repita a senha"
                    className="pl-9"
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}

            {erro && (
              <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                {erro}
              </div>
            )}

            {emailConfirmacaoPendente && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
                <p className="font-bold">📧 Confirme seu email</p>
                <p className="mt-1">
                  Um email de confirmação foi enviado para <strong>{emailConfirmacaoPendente}</strong>.
                  Clique no link para ativar sua conta.
                </p>
                <div className="mt-3 rounded-lg bg-white/60 p-3 text-xs dark:bg-black/20">
                  <p className="font-bold">Para desabilitar a confirmação de email:</p>
                  <ol className="mt-1 list-inside list-decimal space-y-0.5">
                    <li>Acesse o painel do Supabase</li>
                    <li>Vá em <strong>Authentication → Providers → Email</strong></li>
                    <li>Desmarque <strong>"Confirm email"</strong></li>
                    <li>Salve e tente fazer login novamente</li>
                  </ol>
                </div>
                <button
                  onClick={async () => {
                    try {
                      await auth.reenviarConfirmacao(emailConfirmacaoPendente)
                      toast('Email de confirmação reenviado!')
                    } catch (e) {
                      toast('Erro ao reenviar: ' + e.message, 'erro')
                    }
                  }}
                  className="mt-2 text-xs font-semibold underline transition hover:no-underline"
                >
                  Reenviar email de confirmação
                </button>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              carregando={processando}
            >
              {modo === 'login' ? (
                <>
                  <LockIcon className="h-4 w-4" />
                  Entrar no painel
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Criar conta de gestor
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setModo(modo === 'login' ? 'cadastro' : 'login')
                limparErro?.()
              }}
              className="text-sm font-medium text-primary-600 transition hover:text-primary-700 dark:text-primary-400"
            >
              {modo === 'login'
                ? 'Não tem conta? Criar conta de gestor'
                : 'Já tem conta? Fazer login'}
            </button>
          </div>
        </Card>

        <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
          Acesso restrito ao proprietário da academia.
        </p>
      </div>
    </div>
  )
}
